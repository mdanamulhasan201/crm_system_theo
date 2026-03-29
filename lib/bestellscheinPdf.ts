import jsPDF from 'jspdf'

// =============================================================================
// A4 Bestellschein – single place for layout / export (call only from here)
// Format: portrait A4 (210 × 297 mm)
// =============================================================================

const A4 = {
    widthMm: 210,
    heightMm: 297,
    marginMm: 18,
    /** Thin green accent at top (inside margins) */
    topBarMm: 1.2,
    /** Space between green bar and title row */
    gapBelowTopBarMm: 10,
} as const

/** Design tokens – match product mockup */
const COLORS = {
    navy: [26, 43, 75] as [number, number, number], // ~#1a2b4b
    textMuted: [107, 114, 128] as [number, number, number], // labels, date, footer
    accentGreen: [34, 197, 94] as [number, number, number], // #22c55e
    tableHeaderBg: [243, 244, 246] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
    recommendedRed: [239, 68, 68] as [number, number, number], // #ef4444
} as const

const FOOTER_TEXT = 'Automatisch generiert – Produktverwaltungssystem'

/** Product photo slot (mm) – compact width, taller height so insoles look natural (contain fit). */
const PRODUCT_IMAGE_SLOT_MM = { w: 38, h: 52 } as const

/** Table: 2 mm inset from content left/right so the header bar doesn’t touch the margins. */
const TABLE_H_PAD_MM = 2
/** Column width ratios (narrow size col, wider recommended-order col) – less empty space in header */
const TABLE_COL_FR = [0.2, 0.3, 0.5] as const

/** Brand settings from API (subset used for PDF visibility). */
export type StoreBrandSettingsPdf = { isPdf?: boolean } | null | undefined

/**
 * Show Bestellschein download in AKTIONEN when:
 * - manual warehouse (`by_self`) + low stock, or
 * - admin/model-sourced product + `store_brand_settings.isPdf` + low stock (same PDF as above).
 */
export function shouldShowBestellscheinDownload(
    create_status: string | undefined,
    status: string | undefined,
    store_brand_settings?: StoreBrandSettingsPdf
): boolean {
    if (status !== 'Niedriger Bestand') return false
    if (create_status === 'by_self') return true
    return (
        create_status !== undefined &&
        create_status !== 'by_self' &&
        store_brand_settings?.isPdf === true
    )
}

export interface ReorderRow {
    sizeLabel: string
    currentStock: number
    recommendedOrder: number
}

function parseGroessenEntry(raw: unknown): {
    quantity: number
    mindestmenge: number
    warningStatus?: string
    auto_order_limit?: number | null
} {
    if (raw == null || typeof raw !== 'object') {
        return { quantity: 0, mindestmenge: 0 }
    }
    const o = raw as Record<string, unknown>
    const qtyRaw = o.quantity
    let quantity = 0
    if (typeof qtyRaw === 'number') quantity = qtyRaw
    else if (qtyRaw != null && typeof qtyRaw === 'object') quantity = 0

    const minRaw = o.mindestmenge
    const mindestmenge = typeof minRaw === 'number' && !Number.isNaN(minRaw) ? minRaw : 0

    const ws = o.warningStatus
    const warningStatus = typeof ws === 'string' ? ws : undefined

    const al = o.auto_order_limit
    const auto_order_limit =
        typeof al === 'number' && !Number.isNaN(al) ? al : al === null ? null : undefined

    return { quantity, mindestmenge, warningStatus, auto_order_limit }
}

function targetStockForRow(
    mindestmenge: number,
    productMindestbestand: number | null | undefined,
    auto_order_limit?: number | null
): number {
    if (mindestmenge > 0) return mindestmenge
    const pm =
        typeof productMindestbestand === 'number' && !Number.isNaN(productMindestbestand)
            ? productMindestbestand
            : 0
    if (pm > 0) return pm
    if (typeof auto_order_limit === 'number' && auto_order_limit > 0) return auto_order_limit
    return 8
}

function shouldIncludeRow(
    quantity: number,
    mindestmenge: number,
    warningStatus: string | undefined
): boolean {
    if (mindestmenge > 0) return quantity < mindestmenge
    return warningStatus === 'Niedriger Bestand'
}

/** Build reorder rows from live API `groessenMengen` (only sizes below minimum / flagged low). */
export function buildReorderRowsFromApiProduct(apiProduct: {
    groessenMengen?: Record<string, unknown> | null
    mindestbestand?: number | null
}): ReorderRow[] {
    const raw = apiProduct.groessenMengen
    if (!raw || typeof raw !== 'object') return []

    const productMin = apiProduct.mindestbestand
    const keys = Object.keys(raw)

    const sortKeys = (a: string, b: string) => {
        const na = parseInt(String(a).replace(/\D/g, ''), 10)
        const nb = parseInt(String(b).replace(/\D/g, ''), 10)
        if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb
        return String(a).localeCompare(String(b), 'de')
    }

    const rows: ReorderRow[] = []
    for (const sizeKey of [...keys].sort(sortKeys)) {
        const parsed = parseGroessenEntry(raw[sizeKey])
        if (!shouldIncludeRow(parsed.quantity, parsed.mindestmenge, parsed.warningStatus)) continue

        const target = targetStockForRow(
            parsed.mindestmenge,
            productMin,
            parsed.auto_order_limit
        )
        const recommended = Math.max(0, Math.round(target - parsed.quantity))
        rows.push({
            sizeLabel: sizeKey,
            currentStock: parsed.quantity,
            recommendedOrder: recommended,
        })
    }
    return rows
}

async function loadImageDataUrl(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, { mode: 'cors' })
        if (!res.ok) return null
        const blob = await res.blob()
        return await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

/** Natural pixel size for aspect-ratio math (browser PDF export only). */
function getImageNaturalSizeFromDataUrl(dataUrl: string): Promise<{ w: number; h: number } | null> {
    if (typeof Image === 'undefined') return Promise.resolve(null)
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            const w = img.naturalWidth || img.width
            const h = img.naturalHeight || img.height
            resolve(w > 0 && h > 0 ? { w, h } : null)
        }
        img.onerror = () => resolve(null)
        img.src = dataUrl
    })
}

/**
 * Scale image to fit inside slot like CSS object-fit: contain; centered.
 * Uses pixel aspect ratio; result is in mm for jsPDF.
 */
function fitImageContainMm(
    naturalW: number,
    naturalH: number,
    slotWmm: number,
    slotHmm: number
): { drawWmm: number; drawHmm: number; offXmm: number; offYmm: number } {
    if (naturalW <= 0 || naturalH <= 0) {
        return { drawWmm: slotWmm, drawHmm: slotHmm, offXmm: 0, offYmm: 0 }
    }
    const scale = Math.min(slotWmm / naturalW, slotHmm / naturalH)
    const drawWmm = naturalW * scale
    const drawHmm = naturalH * scale
    return {
        drawWmm,
        drawHmm,
        offXmm: (slotWmm - drawWmm) / 2,
        offYmm: (slotHmm - drawHmm) / 2,
    }
}

function sanitizeFilenamePart(s: string): string {
    return s.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80)
}

function formatDateDe(d: Date): string {
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

/**
 * Draw fixed footer (grey line + German text) at bottom of current page – A4.
 */
function drawA4Footer(doc: jsPDF, margin: number): void {
    const pageH = doc.internal.pageSize.getHeight()
    const pageW = doc.internal.pageSize.getWidth()
    const lineY = pageH - margin - 11
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.2)
    doc.line(margin, lineY, pageW - margin, lineY)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(FOOTER_TEXT, margin, lineY + 5)
}

/**
 * Core A4 Bestellschein layout – all drawing isolated here.
 */
async function renderBestellscheinA4(
    doc: jsPDF,
    apiProduct: {
        produktname?: string | null
        artikelnummer?: string | null
        hersteller?: string | null
        image?: string | null
    },
    rows: ReorderRow[]
): Promise<void> {
    const pageW = A4.widthMm
    const pageH = A4.heightMm
    const m = A4.marginMm
    const innerW = pageW - 2 * m

    // Reserve space so body never overlaps footer band
    const footerBandMm = 20
    const maxYMm = pageH - m - footerBandMm

    // ---- Header: green bar inside side margins (same inset as body — not edge-to-edge) ----
    doc.setFillColor(...COLORS.accentGreen)
    doc.rect(m, m, innerW, A4.topBarMm, 'F')

    // Title row — extra gap below green bar so content breathes
    let y = m + A4.topBarMm + A4.gapBelowTopBarMm
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(...COLORS.navy)
    doc.text('Bestellschein', m, y)

    const dateStr = formatDateDe(new Date())
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(`Datum: ${dateStr}`, pageW - m, y, { align: 'right' })

    y += 16

    // ---- Product block: image left (contain + center) | details right ----
    const imgSlotW = PRODUCT_IMAGE_SLOT_MM.w
    const imgSlotH = PRODUCT_IMAGE_SLOT_MM.h
    const imgX = m
    const gap = 12
    const textX = m + imgSlotW + gap
    const textMaxW = pageW - textX - m

    const drawImagePlaceholder = () => {
        doc.setFillColor(255, 255, 255)
        doc.rect(imgX, y, imgSlotW, imgSlotH, 'F')
        doc.setDrawColor(...COLORS.border)
        doc.setLineWidth(0.2)
        doc.rect(imgX, y, imgSlotW, imgSlotH)
    }

    if (apiProduct.image && apiProduct.image.startsWith('http')) {
        const dataUrl = await loadImageDataUrl(apiProduct.image)
        if (dataUrl) {
            const fmt: 'JPEG' | 'PNG' = dataUrl.includes('image/png') ? 'PNG' : 'JPEG'
            drawImagePlaceholder()
            try {
                const natural = await getImageNaturalSizeFromDataUrl(dataUrl)
                const { drawWmm, drawHmm, offXmm, offYmm } = natural
                    ? fitImageContainMm(natural.w, natural.h, imgSlotW, imgSlotH)
                    : { drawWmm: imgSlotW, drawHmm: imgSlotH, offXmm: 0, offYmm: 0 }
                doc.addImage(
                    dataUrl,
                    fmt,
                    imgX + offXmm,
                    y + offYmm,
                    drawWmm,
                    drawHmm,
                    undefined,
                    'SLOW'
                )
            } catch {
                // Placeholder already drawn; image decode failed
            }
        } else {
            drawImagePlaceholder()
        }
    } else {
        drawImagePlaceholder()
    }

    const nameRaw = apiProduct.produktname ?? '–'
    const nameDisplay = nameRaw.toUpperCase()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...COLORS.navy)
    const nameLines = doc.splitTextToSize(nameDisplay, textMaxW)
    let textBaseline = y + 7
    doc.text(nameLines, textX, textBaseline)
    textBaseline += nameLines.length * 5.5 + 3

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(`Artikelnummer: ${apiProduct.artikelnummer ?? '–'}`, textX, textBaseline)
    textBaseline += 6
    doc.text(`Hersteller: ${apiProduct.hersteller ?? '–'}`, textX, textBaseline)

    const blockBottom = Math.max(y + imgSlotH, textBaseline + 2)
    y = blockBottom + 10

    // Separator before table
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.25)
    doc.line(m, y, m + innerW, y)
    y += 10

    // ---- Table title ----
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.navy)
    const tLeft = m + TABLE_H_PAD_MM
    const tW = innerW - 2 * TABLE_H_PAD_MM

    doc.text('Nachbestellung pro Größe', tLeft, y)
    y += 9

    const rowHmm = 8
    const w0 = tW * TABLE_COL_FR[0]
    const w1 = tW * TABLE_COL_FR[1]
    const w2 = tW - w0 - w1
    /** Horizontal center of each column (proportional widths + 2 mm side padding) */
    const colCenterX = [
        tLeft + w0 / 2,
        tLeft + w0 + w1 / 2,
        tLeft + w0 + w1 + w2 / 2,
    ] as const

    const drawTableHeader = (yy: number) => {
        doc.setFillColor(...COLORS.tableHeaderBg)
        doc.rect(tLeft, yy - 5.2, tW, rowHmm, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(55, 65, 75)
        doc.text('Größe', colCenterX[0], yy, { align: 'center' })
        doc.text('Aktueller Bestand', colCenterX[1], yy, { align: 'center' })
        doc.text('Empfohlene Bestellung', colCenterX[2], yy, { align: 'center' })
    }

    drawTableHeader(y)
    y += rowHmm + 1

    doc.setFont('helvetica', 'normal')
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (y + rowHmm > maxYMm) {
            doc.addPage()
            y = m + 8
            drawTableHeader(y)
            y += rowHmm + 1
        }

        // Cell text centered under each header column
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.text(String(row.sizeLabel), colCenterX[0], y, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.text(String(row.currentStock), colCenterX[1], y, { align: 'center' })

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...COLORS.recommendedRed)
        doc.text(String(row.recommendedOrder), colCenterX[2], y, { align: 'center' })
        doc.setTextColor(0, 0, 0)

        y += rowHmm
    }

    // Footer on last page, fixed to bottom (A4)
    const totalPages = doc.getNumberOfPages()
    doc.setPage(totalPages)
    drawA4Footer(doc, m)
}

/**
 * Download Bestellschein PDF (A4). Tables should only call this entry point.
 */
export async function downloadBestellscheinPdf(apiProduct: {
    produktname?: string | null
    artikelnummer?: string | null
    hersteller?: string | null
    image?: string | null
    groessenMengen?: Record<string, unknown> | null
    mindestbestand?: number | null
}): Promise<{ ok: true } | { ok: false; reason: 'no_rows' }> {
    const rows = buildReorderRowsFromApiProduct(apiProduct)
    if (rows.length === 0) return { ok: false, reason: 'no_rows' }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
    })

    await renderBestellscheinA4(doc, apiProduct, rows)

    const dateStr = formatDateDe(new Date()).replace(/\./g, '-')
    const base = sanitizeFilenamePart(apiProduct.artikelnummer || apiProduct.produktname || 'Bestellschein')
    doc.save(`Bestellschein_${base}_${dateStr}.pdf`)
    return { ok: true }
}
