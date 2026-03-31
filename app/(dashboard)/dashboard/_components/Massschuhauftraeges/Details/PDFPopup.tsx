"use client"

import React, { useRef } from "react"

import { CloseIcon, DownloadIcon, PrintIcon } from "./Icons"
import type { GroupDef2 } from "./ShoeData"
import { getVorderkappeMaterialLabel } from "./Bodenkonstruktion/FormFields"
import type {
  VorderkappeSideData,
  HinterkappeMusterSideData,
  HinterkappeSideData,
  BrandsohleSideData,
  RahmenData,
  SohlenversteifungData,
  SohlenaufbauData,
  SohlenaufbauShoreValue,
} from "./Bodenkonstruktion/FormFields"
import { defaultSohlenversteifungData, defaultSohlenaufbauData } from "./Bodenkonstruktion/FormFields"
import { evaShoreLabel } from "./Bodenkonstruktion/sohlenaufbau/shoreDisplay"

const HINTERKAPPE_MUSTERART_LABELS: Record<string, string> = {
  normal: "Normal",
  knoechelkappe: "Knöchelkappe",
  achillessehne: "Knöchelkappe Achillessehnenfrei",
  peronaeus: "Peronaeus / T-Form",
  arthrodese: "Arthrodese",
}

function buildHinterkappeMusterPdfLines(h: HinterkappeMusterSideData | null | undefined): string[] {
  const parts: string[] = []
  if (!h) return parts
  if (h.musterErstellung) {
    if (h.musterErstellung === "ja") {
      parts.push("Soll ein Muster erstellt werden?: Ja, ein Muster erstellen")
      if (h.musterart) {
        parts.push(
          `Musterart: ${HINTERKAPPE_MUSTERART_LABELS[h.musterart] ?? h.musterart}`
        )
      }
    } else if (h.musterErstellung === "nein") {
      parts.push("Soll ein Muster erstellt werden?: Nein, Muster liefern wir selbst")
    } else {
      parts.push("Soll ein Muster erstellt werden?: Wird auf dem Leisten gekennzeichnet")
    }
    return parts
  }
  if (h.mode) {
    parts.push(`Ausführung: ${h.mode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich"}`)
    if (h.mode === "gleich" && h.sameValue) {
      parts.push(`Hinterkappe (beide Seiten): ${h.sameValue === "ja" ? "Ja" : "Nein"}`)
    } else if (h.mode === "unterschiedlich") {
      if (h.leftValue) parts.push(`Hinterkappe links: ${h.leftValue === "ja" ? "Ja" : "Nein"}`)
      if (h.rightValue) parts.push(`Hinterkappe rechts: ${h.rightValue === "ja" ? "Ja" : "Nein"}`)
    }
  }
  return parts
}

function buildBrandsohlePdfLines(
  brandsohleSide: BrandsohleSideData,
  options: { id: string; label: string }[]
): string[] {
  const parts: string[] = [
    `Ausführung: ${brandsohleSide.mode === "gleich" ? "Beidseitig identisch" : "Links und rechts unterschiedlich"}`,
  ]
  if (brandsohleSide.mode === "gleich" && brandsohleSide.sameValues && Array.isArray(brandsohleSide.sameValues)) {
    brandsohleSide.sameValues.forEach((val) => {
      const option = options.find((opt) => opt.id === val)
      if (option) parts.push(`Auswahl (beide Seiten): ${option.label}`)
    })
  }
  if (brandsohleSide.mode === "unterschiedlich") {
    if (brandsohleSide.leftValues && Array.isArray(brandsohleSide.leftValues)) {
      brandsohleSide.leftValues.forEach((val) => {
        const option = options.find((opt) => opt.id === val)
        if (option) parts.push(`Links: ${option.label}`)
      })
    }
    if (brandsohleSide.rightValues && Array.isArray(brandsohleSide.rightValues)) {
      brandsohleSide.rightValues.forEach((val) => {
        const option = options.find((opt) => opt.id === val)
        if (option) parts.push(`Rechts: ${option.label}`)
      })
    }
  }
  if (brandsohleSide.korkEnabled) {
    const posLabels: Record<string, string> = {
      vorfuss: "Vorfuß",
      rueckfuss: "Rückfuß",
      langsohlig: "Langsohlig",
    }
    let thick = ""
    if (brandsohleSide.korkDicke === "custom" && brandsohleSide.korkCustomMm?.trim()) {
      thick = `${brandsohleSide.korkCustomMm.trim()} mm (eigene Angabe)`
    } else if (brandsohleSide.korkDicke === "5") thick = "5 mm"
    else if (brandsohleSide.korkDicke === "3") thick = "3 mm"
    const pl = brandsohleSide.korkPosition ? posLabels[brandsohleSide.korkPosition] : ""
    const chunks = ["Korkeinlage: Ja"]
    if (pl) chunks.push(`Position: ${pl}`)
    if (thick) chunks.push(`Dicke: ${thick}`)
    parts.push(chunks.join(", "))
  }
  return parts
}

function rahmenTypPdfLabel(t: string): string {
  switch (t) {
    case "eva":
      return "EVA-Rahmen"
    case "gummi":
      return "Gummi-Rahmen"
    case "leder":
      return "Lederrahmen"
    case "verschalung":
      return "Verschalung / Gürtel (+24,99 €)"
    default:
      return t
  }
}

function buildRahmenPdfLines(rahmen: RahmenData): string[] {
  if (!rahmen.type) return []
  const parts: string[] = [`Typ: ${rahmenTypPdfLabel(rahmen.type)}`]
  if ((rahmen.type === "eva" || rahmen.type === "gummi" || rahmen.type === "leder") && rahmen.color) {
    parts.push(`Farbe: ${rahmen.color}`)
  }
  if (rahmen.type === "verschalung") {
    if (rahmen.color) {
      parts.push(`Farbe: ${rahmen.color}`)
    }
    if (rahmen.verschalungHoehe) {
      parts.push(`Höhe der Verschalung: ${rahmen.verschalungHoehe} mm`)
    }
    if (rahmen.verschalungAusfuehrung === "oberleder") {
      parts.push("Ausführung: Am Oberleder geführt")
    }
    if (rahmen.verschalungAusfuehrung === "gesamt") {
      parts.push("Ausführung: Über gesamten Aufbau")
    }
  }
  return parts
}

function buildSohlenversteifungPdfLines(d: SohlenversteifungData | null | undefined): string[] {
  const parts: string[] = []
  const v = d ?? defaultSohlenversteifungData()
  if (!v.enabled) {
    parts.push("Sohlenversteifung gewünscht: Nein")
    return parts
  }
  parts.push("Sohlenversteifung gewünscht: Ja")
  parts.push(
    v.mode === "gleich"
      ? "Ausführung: Beidseitig identisch"
      : "Ausführung: Links und rechts unterschiedlich"
  )
  if (v.mode === "gleich") {
    if (v.gleichMm.trim()) parts.push(`Versteifung: ${v.gleichMm.trim()} mm`)
  } else {
    if (v.linksMm.trim()) parts.push(`Versteifung links: ${v.linksMm.trim()} mm`)
    if (v.rechtsMm.trim()) parts.push(`Versteifung rechts: ${v.rechtsMm.trim()} mm`)
  }
  return parts
}

function pdfParseMm(v: string): number {
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

function buildSohlenaufbauPdfLines(d: SohlenaufbauData | null | undefined): string[] {
  const v = d ?? defaultSohlenaufbauData()
  const parts: string[] = []
  const hasLeft =
    pdfParseMm(v.links.ferse) > 0 ||
    pdfParseMm(v.links.ballen) > 0 ||
    pdfParseMm(v.links.spitze) > 0
  const hasRight =
    pdfParseMm(v.rechts.ferse) > 0 ||
    pdfParseMm(v.rechts.ballen) > 0 ||
    pdfParseMm(v.rechts.spitze) > 0
  const has = v.mode === "unterschiedlich" ? hasLeft || hasRight : hasLeft
  if (!has) {
    parts.push("Noch keine Höhenangaben")
    return parts
  }
  parts.push(v.mode === "gleich" ? "Ausführung: Beidseitig identisch" : "Ausführung: Links und rechts unterschiedlich")
  parts.push(
    `Links – Ferse/Absatz: ${v.links.ferse || "–"} mm, Ballen: ${v.links.ballen || "–"} mm, Spitze: ${v.links.spitze || "–"} mm`
  )
  if (v.mode === "unterschiedlich") {
    parts.push(
      `Rechts – Ferse/Absatz: ${v.rechts.ferse || "–"} mm, Ballen: ${v.rechts.ballen || "–"} mm, Spitze: ${v.rechts.spitze || "–"} mm`
    )
  }
  const leftFerse = pdfParseMm(v.links.ferse)
  const leftBallen = pdfParseMm(v.links.ballen)
  const leftZw = leftBallen
  const leftAb = Math.max(0, leftFerse - leftBallen)
  if (v.mode === "gleich") {
    if (leftFerse >= leftBallen) {
      parts.push(`Berechnung – Zwischensohle: ${leftZw} mm, Absatz: ${leftAb} mm`)
    } else {
      parts.push("Hinweis: Fersenhöhe kleiner als Ballenhöhe (ungültige Kombination)")
    }
  } else {
    const rightFerse = pdfParseMm(v.rechts.ferse)
    const rightBallen = pdfParseMm(v.rechts.ballen)
    const rightZw = rightBallen
    const rightAb = Math.max(0, rightFerse - rightBallen)
    parts.push(
      leftFerse >= leftBallen
        ? `Berechnung Links – Zwischensohle: ${leftZw} mm, Absatz: ${leftAb} mm`
        : "Hinweis Links: Fersenhöhe kleiner als Ballenhöhe"
    )
    parts.push(
      rightFerse >= rightBallen
        ? `Berechnung Rechts – Zwischensohle: ${rightZw} mm, Absatz: ${rightAb} mm`
        : "Hinweis Rechts: Fersenhöhe kleiner als Ballenhöhe"
    )
  }
  parts.push(`Farbkonzept: ${v.farbModus === "einheitlich" ? "Eine Farbe pro Bereich" : "Individuell pro Lage"}`)
  const zw = leftZw
  const ab = leftAb
  if (v.farbModus === "einheitlich") {
    if (zw > 0) parts.push(`Zwischensohle – Farbe: ${v.zwFarbe}`)
    if (ab > 0) parts.push(`Absatz – Farbe: ${v.abFarbe}`)
  } else {
    if (zw > 0) {
      if (v.zwSplit.mode === "einteilig") {
        parts.push(`Zwischensohle – Farbe: ${v.zwLayerFarben[0] ?? v.zwFarbe}`)
      } else {
        v.zwSplit.layers.forEach((_, i) => {
          parts.push(`Zwischensohle Lage ${i + 1} – Farbe: ${v.zwLayerFarben[i] ?? "#1a1a1a"}`)
        })
      }
    }
    if (ab > 0) {
      if (v.abSplit.mode === "einteilig") {
        parts.push(`Absatz – Farbe: ${v.abLayerFarben[0] ?? v.abFarbe}`)
      } else {
        v.abSplit.layers.forEach((_, i) => {
          parts.push(`Absatz Lage ${i + 1} – Farbe: ${v.abLayerFarben[i] ?? "#1a1a1a"}`)
        })
      }
    }
  }
  parts.push(`Zwischensohle – Aufteilung: ${v.zwSplit.mode}, Lagen: ${v.zwSplit.layers.join(" / ") || "–"}`)
  parts.push(`Absatz – Aufteilung: ${v.abSplit.mode}, Lagen: ${v.abSplit.layers.join(" / ") || "–"}`)
  const shoreMod = v.shoreModus === "individuell" ? "individuell" : "einheitlich"
  parts.push(
    `Material / Shore-Härte: ${shoreMod === "individuell" ? "Individuell pro Bereich" : "Einheitlich für gesamten Aufbau"}`
  )
  const pdfEvaShore = (raw: string | undefined): string => {
    const x = raw === "30" || raw === "53" || raw === "58" ? raw : "53"
    return evaShoreLabel(x as SohlenaufbauShoreValue)
  }
  if (shoreMod === "einheitlich") {
    parts.push(`Shore (gesamt): ${pdfEvaShore(v.globalShore)}`)
  } else {
    if (zw > 0) parts.push(`Shore Zwischensohle: ${pdfEvaShore(v.shorePerArea?.zwischensohle)}`)
    if (ab > 0) parts.push(`Shore Absatz: ${pdfEvaShore(v.shorePerArea?.absatz)}`)
  }
  const layerSplitUi =
    v.farbModus === "individuell" && (v.zwSplit.mode !== "einteilig" || v.abSplit.mode !== "einteilig")
  if (layerSplitUi && shoreMod === "individuell" && v.shorePerLayer) {
    const zwN = v.zwSplit.mode === "einteilig" ? 1 : v.zwSplit.layers.length
    const abN = v.abSplit.mode === "einteilig" ? 1 : v.abSplit.layers.length
    if (zw > 0 && zwN > 1 && v.shorePerLayer.zwLayers?.length) {
      parts.push(
        `Shore pro Lage Zwischensohle: ${v.shorePerLayer.zwLayers.map((s, i) => `L${i + 1}=${pdfEvaShore(s)}`).join(", ")}`
      )
    }
    if (ab > 0 && abN > 1 && v.shorePerLayer.abLayers?.length) {
      parts.push(
        `Shore pro Lage Absatz: ${v.shorePerLayer.abLayers.map((s, i) => `L${i + 1}=${pdfEvaShore(s)}`).join(", ")}`
      )
    }
  }
  if (v.verschalungHoehe) {
    parts.push(`Verschalung / Gürtel – Höhe: ${v.verschalungHoehe} mm`)
    if (v.verschalungAusfuehrung === "oberleder") parts.push("Verschalung: Am Oberleder geführt (klassisch)")
    if (v.verschalungAusfuehrung === "gesamt") parts.push("Verschalung: Über gesamten Aufbau")
  }
  return parts
}

// Order data interface for dynamic PDF content
export interface OrderDataForPDF {
  orderNumber?: string
  customerName?: string
  productName?: string
  deliveryDate?: string
  status?: string
  filiale?: string
  totalPrice?: number
  // Footer data from order
  footerPhone?: string
  footerEmail?: string
  footerBusinessName?: string
  footerImage?: string | null
}

interface PDFPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pdfBlob?: Blob) => void
  allGroups: GroupDef2[]
  selected: Record<string, string | string[] | null>
  optionInputs: Record<string, Record<string, string[]>>
  textAreas?: {
    korrektur_bereich?: string
    fussproblem_bettung?: string
    bettung_wuensche?: string
    fussproblem_leisten?: string
    leisten_wuensche?: string
    besondere_hinweise?: string
    [key: string]: string | undefined
  }
  showDetails?: boolean
  orderData?: OrderDataForPDF
  selectedSole?: { id: string; name: string; image: string; des?: string; description?: string } | null
  heelWidthAdjustment?: { 
    leftMedial?: { op: "widen" | "narrow" | null; mm: number }
    leftLateral?: { op: "widen" | "narrow" | null; mm: number }
    rightMedial?: { op: "widen" | "narrow" | null; mm: number }
    rightLateral?: { op: "widen" | "narrow" | null; mm: number }
    // Backward compatibility
    left?: { op: "widen" | "narrow" | null; mm: number }
    right?: { op: "widen" | "narrow" | null; mm: number }
    medial?: { op: "widen" | "narrow" | null; mm: number }
    lateral?: { op: "widen" | "narrow" | null; mm: number }
  } | null
  // Orthopedic fields (mode: gleich | unterschiedlich)
  vorderkappeSide?: VorderkappeSideData | null
  rahmen?: RahmenData | null
  hinterkappeMusterSide?: HinterkappeMusterSideData | null
  hinterkappeSide?: HinterkappeSideData | null
  brandsohleSide?: BrandsohleSideData | null
  sohlenversteifung?: SohlenversteifungData | null
  sohlenaufbau?: SohlenaufbauData | null
}

type OptionDef = { id: string; label: string }

// InlineLabelWithInputs for Modal (uses Tailwind classes)
function InlineLabelWithInputsModal({
  option,
  values,
}: {
  option: OptionDef
  values: string[]
}) {
  const normalized = option.label.replace(/_{3,}/g, "___")
  const parts = normalized.split("___")
  return (
    <span>
      {parts.map((part: string, idx: number) => (
        <React.Fragment key={idx}>
          <span>{part}</span>
          {idx < parts.length - 1 && <span className="inline-block min-w-[40px] px-1 pb-1 border-b border-[#36a866] text-[#36a866] font-medium">{values[idx] || "___"}</span>}
        </React.Fragment>
      ))}
    </span>
  )
}

// InlineLabelWithInputs for PDF (uses inline styles only)
function InlineLabelWithInputsPDF({
  option,
  values,
}: {
  option: OptionDef
  values: string[]
}) {
  const normalized = option.label.replace(/_{3,}/g, "___")
  const parts = normalized.split("___")
  return (
    <span>
      {parts.map((part: string, idx: number) => (
        <React.Fragment key={idx}>
          <span>{part}</span>
          {idx < parts.length - 1 && (
            <span style={{ 
              display: 'inline-block', 
              minWidth: '40px', 
              padding: '0 4px 3px 4px', 
              borderBottom: '1px solid #36a866', 
              color: '#36a866', 
              fontWeight: 500 
            }}>
              {values[idx] || "___"}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  )
}

const PDFPopup: React.FC<PDFPopupProps> = ({
  isOpen,
  onClose,
  allGroups,
  selected,
  optionInputs,
  textAreas,
  showDetails,
  onConfirm,
  orderData,
  selectedSole,
  heelWidthAdjustment,
  vorderkappeSide,
  rahmen,
  hinterkappeMusterSide,
  hinterkappeSide,
  brandsohleSide,
  sohlenversteifung,
  sohlenaufbau,
}) => {
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const [pdfBlob, setPdfBlob] = React.useState<Blob | null>(null)
  const [isAbschließenLoading, setIsAbschließenLoading] = React.useState(false)

  // Default values if orderData is not provided
  const displayOrderNumber = orderData?.orderNumber || "#000000"
  const displayCustomerName = orderData?.customerName || "Kunde"
  const displayProductName = orderData?.productName || "Maßschuh"
  const displayDeliveryDate = orderData?.deliveryDate || "-"

  // Footer data from order
  const footerPhone = orderData?.footerPhone || "+39 366 5087742"
  const footerBusinessName = orderData?.footerBusinessName || "FeetF1rst SRLS"
  const footerEmail = orderData?.footerEmail || "Info@feetf1st.com"
  const footerImage = orderData?.footerImage || null

  // Base64 encoded checkbox images
  const CHECKBOX_CHECKED = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSI0IiBmaWxsPSIjMjJjNTVlIi8+PHBhdGggZD0iTTQgOUw3LjUgMTIuNUwxNCA1LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=";
  const CHECKBOX_UNCHECKED = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=";

  // ============ MODAL CHECKBOX (uses flexbox - works in browser) ============
  const ModalCheckbox = ({ isSelected, label }: { isSelected: boolean; label: React.ReactNode }) => (
    <span className="inline-flex items-center mr-4 mb-2 whitespace-nowrap text-xs text-slate-600 h-5">
      <img 
        src={isSelected ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED}
        alt=""
        width={18}
        height={18}
        className="block mr-2 flex-shrink-0"
      />
      <span className="leading-none">{label}</span>
    </span>
  );

  // ============ PDF CHECKBOX (uses inline-block + position - works with html2canvas) ============
  const PDFCheckbox = ({ isSelected, label }: { isSelected: boolean; label: React.ReactNode }) => (
    <span style={{ 
      display: 'inline-block',
      marginRight: '16px', 
      marginBottom: '8px',
      whiteSpace: 'nowrap',
      fontSize: '12px',
      lineHeight: '20px',
      color: '#475569'
    }}>
      <img 
        src={isSelected ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED}
        alt=""
        width={18}
        height={18}
        style={{ 
          display: 'inline-block',
          position: 'relative',
          top: '4px',
          marginRight: '8px'
        }}
      />
      {label}
    </span>
  );

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!pdfContentRef.current) return null

    const clone = pdfContentRef.current.cloneNode(true) as HTMLElement

    clone.querySelectorAll("textarea").forEach((textarea) => {
      const div = document.createElement("div")
      div.textContent = textarea.value || ""
      div.className = "description-text-area pdf-textarea-replacement"
      textarea.parentNode?.replaceChild(div, textarea)
    })

    const footer = clone.querySelector(".pdf-info-footer")
    if (footer && footer.parentNode) footer.parentNode.removeChild(footer)

    // Use customer name in the generated PDF filename so the viewer / download
    // shows a meaningful name instead of a generic or numeric id.
    const safeCustomerName = (displayCustomerName || "Kunde").replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Kunde"
    const opt = {
      margin: [40, 40, 80, 40],
      filename: `${safeCustomerName}-invoice.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
        onclone: async (clonedDoc: Document) => {
          // Ensure all images are loaded before PDF generation
          const images = clonedDoc.querySelectorAll('img');
          await Promise.all(
            Array.from(images).map((img) => {
              return new Promise((resolve) => {
                if (img.complete) {
                  resolve(null);
                } else {
                  img.onload = () => resolve(null);
                  img.onerror = () => resolve(null);
                  // Fallback timeout
                  setTimeout(() => resolve(null), 2000);
                }
              });
            })
          );
          
          clonedDoc.querySelectorAll('*').forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const styleText = htmlEl.getAttribute('style') || '';
              if (styleText.includes('oklch')) {
                htmlEl.setAttribute('style', styleText.replace(/oklch\([^)]*\)/g, '#000000'));
              }
            }
          });
        }
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: ['.pdf-page-break-avoid'] },
    }
    const html2pdfModule = (await import('html2pdf.js')) as any
    const html2pdf = html2pdfModule.default || html2pdfModule

    try {
      const pdf = await html2pdf()
        .set(opt as any)
        .from(clone)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
          const pageCount = pdf.internal.getNumberOfPages()
          const pageHeight = pdf.internal.pageSize.getHeight()
          const pageWidth = pdf.internal.pageSize.getWidth()

          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i)
            pdf.setFillColor(0, 0, 0)
            pdf.rect(0, pageHeight - 40, pageWidth, 40, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(11)
            pdf.text("+39 366 508 7742", 40, pageHeight - 15)
            pdf.text("FeetF1rst VGmbH", pageWidth / 2, pageHeight - 15, { align: "center" })
            pdf.text("info@feetf1rst.com", pageWidth - 40, pageHeight - 15, { align: "right" })
          }

          return pdf.output("blob")
        })

      return pdf
    } catch (err) {
      return null
    }
  }

  const getPDFFilename = (): string => {
    const name = (orderData?.customerName ?? "").trim()
    const base = name || "Kunde"
    const sanitized = base.replace(/[^\p{L}\p{N}\s\-_.]/gu, "").replace(/\s+/g, "-").slice(0, 80)
    return `${sanitized || "Kunde"}.pdf`
  }

  const handleDownloadPDF = async () => {
    const blob = await generatePDFBlob()
    if (blob) {
      setPdfBlob(blob)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const filename = getPDFFilename()
      a.setAttribute("download", filename)
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handlePrint = async () => {
    const blob = await generatePDFBlob()
    if (blob) {
      setPdfBlob(blob)
      const pdfUrl = URL.createObjectURL(blob)
   
      const printFrame = document.createElement("iframe")
      printFrame.style.display = "none"
      printFrame.src = pdfUrl
      document.body.appendChild(printFrame)

      const handleAfterPrint = () => {
        printFrame.contentWindow?.removeEventListener("afterprint", handleAfterPrint)
        document.body.removeChild(printFrame)
        URL.revokeObjectURL(pdfUrl)
      }
   
      printFrame.onload = () => { 
        printFrame.contentWindow?.addEventListener("afterprint", handleAfterPrint)
        printFrame.contentWindow?.print()
      }
    }
  }

  const handleAbschließen = async () => {
    setIsAbschließenLoading(true)
    try {
      // Generate PDF if not already generated
      if (!pdfBlob) {
        const blob = await generatePDFBlob()
        if (blob) {
          setPdfBlob(blob)
          onConfirm(blob)
        } else {
          onConfirm()
        }
      } else {
        onConfirm(pdfBlob)
      }
    } finally {
      setIsAbschließenLoading(false)
    }
  }

  // Render options with label content - Show ALL selected options clearly
  const renderModalOptions = (g: GroupDef2) => {
    const selectedOptionId = selected[g.id]
    
    // Handle multi-select fields (arrays)
    const isMultiSelect = g.multiSelect === true
    const selectedArray = Array.isArray(selectedOptionId) ? selectedOptionId : (selectedOptionId ? [selectedOptionId] : [])
    
    // If no selection, show nothing
    if (!selectedOptionId || (Array.isArray(selectedOptionId) && selectedOptionId.length === 0)) {
      return <span className="text-xs text-slate-400">Nicht ausgewählt</span>
    }
    
    // For multi-select: show only selected options
    if (isMultiSelect && Array.isArray(selectedOptionId) && selectedOptionId.length > 0) {
      return selectedArray.map((selectedId: string) => {
        const opt = g.options.find(o => o.id === selectedId)
        if (!opt) return null
        
        const placeholderCount = (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
        const inputsForThisOpt = optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
        
        const labelContent = placeholderCount > 0 ? (
          <InlineLabelWithInputsModal option={opt} values={inputsForThisOpt} />
        ) : (
          opt.label
        )
        
        return <ModalCheckbox key={opt.id} isSelected={true} label={labelContent} />
      }).filter(Boolean)
    }
    
    // For single-select: show all options with selected one checked
    return g.options.map((opt: OptionDef) => {
      const isSelected = selectedOptionId === opt.id
      
      const placeholderCount = (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
      const inputsForThisOpt = optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
      
      const labelContent = placeholderCount > 0 ? (
        <InlineLabelWithInputsModal option={opt} values={inputsForThisOpt} />
      ) : (
        opt.label
      )
      
      return <ModalCheckbox key={opt.id} isSelected={isSelected} label={labelContent} />
    })
  }

  const renderPDFOptions = (g: GroupDef2) => {
    const selectedOptionId = selected[g.id]
    
    // Handle multi-select fields (arrays)
    const isMultiSelect = g.multiSelect === true
    const selectedArray = Array.isArray(selectedOptionId) ? selectedOptionId : (selectedOptionId ? [selectedOptionId] : [])
    
    // If no selection, show nothing
    if (!selectedOptionId || (Array.isArray(selectedOptionId) && selectedOptionId.length === 0)) {
      return <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nicht ausgewählt</span>
    }
    
    // For multi-select: show only selected options
    if (isMultiSelect && Array.isArray(selectedOptionId) && selectedOptionId.length > 0) {
      return selectedArray.map((selectedId: string) => {
        const opt = g.options.find(o => o.id === selectedId)
        if (!opt) return null
        
        const placeholderCount = (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
        const inputsForThisOpt = optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
        
        const labelContent = placeholderCount > 0 ? (
          <InlineLabelWithInputsPDF option={opt} values={inputsForThisOpt} />
        ) : (
          opt.label
        )
        
        return <PDFCheckbox key={opt.id} isSelected={true} label={labelContent} />
      }).filter(Boolean)
    }
    
    // For single-select: show all options with selected one checked
    return g.options.map((opt: OptionDef) => {
      const isSelected = selectedOptionId === opt.id
      
      const placeholderCount = (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
      const inputsForThisOpt = optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
      
      const labelContent = placeholderCount > 0 ? (
        <InlineLabelWithInputsPDF option={opt} values={inputsForThisOpt} />
      ) : (
        opt.label
      )
      
      return <PDFCheckbox key={opt.id} isSelected={isSelected} label={labelContent} />
    })
  }
  
  // Helper function to render sub-options (e.g., hinterkappe_sub)
  const renderSubOption = (groupId: string, subOptionId: string | null, subOptions: Array<{ id: string; label: string; price: number }>) => {
    if (!subOptionId || !subOptions) return null
    
    const subOption = subOptions.find(opt => opt.id === subOptionId)
    if (!subOption) return null
    
    return (
      <div style={{ marginTop: '8px', marginLeft: '20px', fontSize: '12px', color: '#475569' }}>
        <span style={{ fontWeight: 500 }}>Auswahl: </span>
        <span>{subOption.label}</span>
      </div>
    )
  }
  
  const renderSubOptionModal = (groupId: string, subOptionId: string | null, subOptions: Array<{ id: string; label: string; price: number }>) => {
    if (!subOptionId || !subOptions) return null
    
    const subOption = subOptions.find(opt => opt.id === subOptionId)
    if (!subOption) return null
    
    return (
      <div className="mt-2 ml-5 text-xs text-slate-600">
        <span className="font-medium">Auswahl: </span>
        <span>{subOption.label}</span>
      </div>
    )
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[9999] flex items-center justify-center">
      <div className="bg-white w-[80vw] min-h-[80vh] rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s] relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 relative">
          <h2 className="text-xl font-semibold text-slate-900  m-0">Ihr PDF ist bereit</h2>
          <button onClick={onClose} className="absolute right-6 top-6 bg-none border-none text-2xl text-slate-500 cursor-pointer transition-colors p-0 w-6 h-6 flex items-center justify-center hover:text-slate-800" title="Schließen">
            <CloseIcon />
          </button>
        </div>

        {/* ============ MODAL PREVIEW (Visible - uses flexbox) ============ */}
        <div className="flex flex-col items-center shadow-md bg-slate-100 p-4 rounded-2xl m-4 break-inside-avoid">
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="bg-white" style={{ width: '794px', minHeight: '1123px',  }}>
              {/* Header - outer has padding, inner content has border */}
              <div className="pt-6 pb-2 px-10">
                <div className="flex gap-6 items-center pb-3 border-b-2 border-gray-300">
                  <div className="w-[70px] h-[70px] flex items-center justify-center flex-shrink-0 aspect-square overflow-hidden">
                    <img src={footerImage || "/images/logo.png"} alt="Logo" className="w-full h-full object-contain aspect-square" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-800 mb-2">{displayProductName}</div>
                    <div className="text-sm text-slate-800 leading-relaxed">
                      <div><span className="font-medium">{displayCustomerName}</span></div>
                      {orderData?.orderNumber && (
                        <div><span className="font-medium">Bestellnr:</span> <span className="text-xs text-slate-500">{displayOrderNumber}</span></div>
                      )}
                      <div><span className="font-medium">Liefertermin:</span> <span className="text-xs text-slate-500">{displayDeliveryDate}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body - same horizontal padding as header */}
              <div className="pt-3 pb-6 px-10 flex-1">
                  {/* Selected Sole Section */}
                  {selectedSole && (
                    <div className="mb-6 pb-4 border-b border-gray-300">
                      <div className="text-sm font-semibold text-slate-800 mb-2">Ausgewählte Sohle:</div>
                      <div className="flex items-center gap-4">
                        <img 
                          src={selectedSole.image} 
                          alt={selectedSole.name} 
                          className="w-24 h-24 object-contain border border-gray-200 rounded" 
                        />
                        <div>
                          <p className="text-base font-bold text-slate-800">{selectedSole.name}</p>
                          {selectedSole.des && (
                            <p className="text-sm text-slate-600 mt-1">{selectedSole.des}</p>
                          )}
                          {selectedSole.description && (
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedSole.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {showDetails ? (
                    <>
                    <div className="text-lg font-bold text-slate-800 mb-2">Checkliste Halbprobe</div>
                    <div className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                        Überprüfen Sie während der Anprobe die wichtigsten Punkte zur Stabilität und zum Komfort und
                        notieren Sie eventuelle Änderungswünsche.
                      </div>
                    </>
                  ) : (
                  <div className="text-lg font-bold text-slate-800 mb-2">Checkliste</div>
                  )}

                  {allGroups.map((g: GroupDef2) => {
                    // Skip section headers
                    if (g.fieldType === "section") {
                      return null
                    }
                    
                    const selectedOptionId = selected[g.id]
                    
                    // Handle text field type (generic handling for all text fields)
                    // Only show if there's a value or if it's a required field
                    if (g.fieldType === "text") {
                      const displayValue = selectedOptionId || "___"
                      const unit = g.options.length === 1 ? g.options[0].label : ""
                      
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1">
                            <span className="inline-block min-w-[40px] px-2 py-0.5 border-b border-green-500 text-green-500 font-semibold text-center mx-1">{displayValue}</span>
                            {unit && <span className="ml-1">{unit}</span>}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle hinterkappeMusterSide field type - always show in PDF
                    if (g.fieldType === "hinterkappeMusterSide") {
                      const parts = buildHinterkappeMusterPdfLines(hinterkappeMusterSide)
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.length > 0 ? parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            )) : <span className="text-xs text-slate-400">Nicht ausgewählt</span>}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle hinterkappeSide field type - always show in PDF
                    if (g.fieldType === "hinterkappeSide") {
                      const parts: string[] = []
                      if (hinterkappeSide?.mode) {
                        parts.push(`Ausführung: ${hinterkappeSide.mode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich"}`)
                        const leftVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.leftValue
                        const rightVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.rightValue
                        const leftSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.leftSubValue
                        const rightSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.rightSubValue
                        if (leftVal) {
                          const leftOption = g.options.find(opt => opt.id === leftVal)
                          if (leftOption) {
                            parts.push(hinterkappeSide.mode === "gleich" ? `Material (beide Seiten): ${leftOption.label}` : `Links - Material: ${leftOption.label}`)
                            if (leftVal === "leder" && leftSub && g.subOptions?.leder) {
                              const leftSubOption = g.subOptions.leder.find(opt => opt.id === leftSub)
                              if (leftSubOption) parts.push(hinterkappeSide.mode === "gleich" ? `Leder-Auswahl: ${leftSubOption.label}` : `Links - Leder-Auswahl: ${leftSubOption.label}`)
                            }
                          }
                        }
                        if (hinterkappeSide.mode === "unterschiedlich" && rightVal) {
                          const rightOption = g.options.find(opt => opt.id === rightVal)
                          if (rightOption) {
                            parts.push(`Rechts - Material: ${rightOption.label}`)
                            if (rightVal === "leder" && rightSub && g.subOptions?.leder) {
                              const rightSubOption = g.subOptions.leder.find(opt => opt.id === rightSub)
                              if (rightSubOption) parts.push(`Rechts - Leder-Auswahl: ${rightSubOption.label}`)
                            }
                          }
                        }
                      }
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.length > 0 ? (
                              parts.map((part, idx) => (
                                <div key={idx} className="mb-1">
                                  <ModalCheckbox isSelected={true} label={part} />
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">Nicht ausgewählt</span>
                            )}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle brandsohleSide field type
                    if (g.fieldType === "brandsohleSide") {
                      if (!brandsohleSide || !brandsohleSide.mode) {
                        return null
                      }
                      const parts = buildBrandsohlePdfLines(brandsohleSide, g.options)
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle select field type (e.g., hinterkappe) - legacy format
                    if (g.fieldType === "select") {
                      const selectedValue = Array.isArray(selectedOptionId) ? selectedOptionId[0] : selectedOptionId
                      const selectedOption = g.options.find(opt => opt.id === selectedValue)
                      
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {selectedOption ? (
                              <>
                                <ModalCheckbox isSelected={true} label={selectedOption.label} />
                                {g.id === "hinterkappe" && selectedValue === "leder" && g.subOptions?.leder && renderSubOptionModal(g.id, (selected['hinterkappe_sub'] as string | null) || null, g.subOptions.leder)}
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">Nicht ausgewählt</span>
                            )}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle heelWidthAdjustment field type
                    if (g.fieldType === "heelWidthAdjustment") {
                      if (!heelWidthAdjustment) {
                        return null
                      }
                      
                      // Check if any of the new structure fields have values
                      const hasNewValues = heelWidthAdjustment.leftMedial?.mm || 
                                         heelWidthAdjustment.leftLateral?.mm || 
                                         heelWidthAdjustment.rightMedial?.mm || 
                                         heelWidthAdjustment.rightLateral?.mm
                      
                      // Check if any of the old structure fields have values (backward compatibility)
                      const hasOldValues = heelWidthAdjustment.left?.mm || 
                                         heelWidthAdjustment.right?.mm || 
                                         heelWidthAdjustment.medial?.mm || 
                                         heelWidthAdjustment.lateral?.mm
                      
                      if (!hasNewValues && !hasOldValues) {
                        return null
                      }
                      
                      const parts: string[] = []
                      
                      // New structure (preferred)
                      if (heelWidthAdjustment.leftMedial && heelWidthAdjustment.leftMedial.mm > 0) {
                        parts.push(`Linker Schuh – innen (medial): ${heelWidthAdjustment.leftMedial.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.leftMedial.mm} mm`)
                      }
                      if (heelWidthAdjustment.leftLateral && heelWidthAdjustment.leftLateral.mm > 0) {
                        parts.push(`Linker Schuh – außen (lateral): ${heelWidthAdjustment.leftLateral.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.leftLateral.mm} mm`)
                      }
                      if (heelWidthAdjustment.rightMedial && heelWidthAdjustment.rightMedial.mm > 0) {
                        parts.push(`Rechter Schuh – innen (medial): ${heelWidthAdjustment.rightMedial.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.rightMedial.mm} mm`)
                      }
                      if (heelWidthAdjustment.rightLateral && heelWidthAdjustment.rightLateral.mm > 0) {
                        parts.push(`Rechter Schuh – außen (lateral): ${heelWidthAdjustment.rightLateral.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.rightLateral.mm} mm`)
                      }
                      
                      // Old structure (backward compatibility)
                      if (heelWidthAdjustment.left && heelWidthAdjustment.left.mm > 0) {
                        parts.push(`Linker Schuh: ${heelWidthAdjustment.left.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.left.mm} mm`)
                      }
                      if (heelWidthAdjustment.right && heelWidthAdjustment.right.mm > 0) {
                        parts.push(`Rechter Schuh: ${heelWidthAdjustment.right.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.right.mm} mm`)
                      }
                      if (heelWidthAdjustment.medial && heelWidthAdjustment.medial.mm > 0) {
                        parts.push(`Medial (innen): ${heelWidthAdjustment.medial.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.medial.mm} mm`)
                      }
                      if (heelWidthAdjustment.lateral && heelWidthAdjustment.lateral.mm > 0) {
                        parts.push(`Lateral (außen): ${heelWidthAdjustment.lateral.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.lateral.mm} mm`)
                      }
                      
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle vorderkappeSide field type
                    if (g.fieldType === "vorderkappeSide") {
                      if (!vorderkappeSide || !vorderkappeSide.mode) {
                        return null
                      }
                      const parts: string[] = [`Ausführung: ${vorderkappeSide.mode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich"}`]
                      if (vorderkappeSide.mode === "gleich" && vorderkappeSide.sameMaterial) {
                        parts.push(`Material (beide Seiten): ${getVorderkappeMaterialLabel(vorderkappeSide.sameMaterial)}`)
                      }
                      if (vorderkappeSide.mode === "unterschiedlich") {
                        if (vorderkappeSide.leftMaterial) parts.push(`Material (Links): ${getVorderkappeMaterialLabel(vorderkappeSide.leftMaterial)}`)
                        if (vorderkappeSide.rightMaterial) parts.push(`Material (Rechts): ${getVorderkappeMaterialLabel(vorderkappeSide.rightMaterial)}`)
                      }
                      const vkLen = vorderkappeSide.laenge ?? "normal"
                      parts.push(`Länge: ${vkLen === "kurz" ? "Kurz" : "Normal"}`)
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle rahmen field type
                    if (g.fieldType === "rahmen") {
                      if (!rahmen || !rahmen.type) {
                        return null
                      }
                      const parts = buildRahmenPdfLines(rahmen)
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    if (g.fieldType === "sohlenversteifung") {
                      const parts = buildSohlenversteifungPdfLines(sohlenversteifung ?? undefined)
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    if (g.fieldType === "sohlenaufbau") {
                      const parts = buildSohlenaufbauPdfLines(sohlenaufbau ?? undefined)
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {parts.map((part, idx) => (
                              <div key={idx} className="mb-1">
                                <ModalCheckbox isSelected={true} label={part} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle yesNo field type (e.g., verbindungsleder)
                    if (g.fieldType === "yesNo") {
                      const selectedValue = Array.isArray(selectedOptionId) ? selectedOptionId[0] : selectedOptionId
                      const selectedOption = g.options.find(opt => opt.id === selectedValue)
                      
                      return (
                        <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                          <div className="flex-1 leading-loose">
                            {selectedOption ? (
                              <ModalCheckbox isSelected={true} label={selectedOption.label} />
                            ) : (
                              <span className="text-xs text-slate-400">Nicht ausgewählt</span>
                            )}
                          </div>
                        </div>
                      )
                    }
                    
                    // Handle checkbox and other field types (default)
                    // Always show the field, renderModalOptions will show all options with selected ones checked
                    return (
                    <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                      <div className="flex-1 leading-loose">
                        {g.options && g.options.length > 0 ? (
                          renderModalOptions(g)
                        ) : (
                          <span className="text-xs text-slate-400 italic">Keine Optionen verfügbar</span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Text areas */}
                {textAreas && (textAreas.korrektur_bereich || textAreas.fussproblem_bettung || textAreas.bettung_wuensche || textAreas.fussproblem_leisten || textAreas.leisten_wuensche || textAreas.besondere_hinweise) && (
                  <div className="mt-4 pt-4">
                    {textAreas?.korrektur_bereich && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Wenn eine Korrektur nötig ist: In welchem Bereich?</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.korrektur_bereich}</div>
                      </div>
                    )}
                    {textAreas?.fussproblem_bettung && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Gibt es ein spezielles Fußproblem, das wir bei der Fertigung unbedingt berücksichtigen müssen?</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.fussproblem_bettung}</div>
                      </div>
                    )}
                    {textAreas?.bettung_wuensche && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Hast du sonstige Anmerkungen oder Wünsche zu der Bettung.</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.bettung_wuensche}</div>
                      </div>
                    )}
                    {textAreas?.fussproblem_leisten && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Gibt es spezielle Fußprobleme, die wir bei der Fertigung unbedingt berücksichtigen müssen?</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.fussproblem_leisten}</div>
                      </div>
                    )}
                    {textAreas?.leisten_wuensche && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Hast du sonstige Anmerkungen oder Wünsche zum Leisten.</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.leisten_wuensche}</div>
                      </div>
                    )}
                    {textAreas?.besondere_hinweise && (
                      <div>
                        <div className="text-sm font-semibold text-slate-800 mb-2">Besondere Hinweise</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.besondere_hinweise}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {/* <div className="mt-auto bg-black py-4 px-10 flex justify-between items-center">
                <span className="text-white text-xs">{footerPhone}</span>
                <span className="text-white text-xs">{footerBusinessName}</span>
                <span className="text-white text-xs">{footerEmail}</span>
              </div> */}
              <div className="mt-auto bg-black py-4 px-10 flex justify-between items-center">
                <span className="text-white text-xs">+39 366 508 7742</span>
                <span className="text-white text-xs">FeetF1rst VGmbH</span>
                <span className="text-white text-xs">info@feetf1rst.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ HIDDEN PDF CONTENT (for PDF generation - uses inline styles) ============ */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfContentRef} style={{ width: '794px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Poppins, Arial, sans-serif', minHeight: 'auto', overflow: 'visible' }}>
            {/* Header - outer has padding, inner content has border */}
            <div style={{ padding: '10px 40px 8px 40px', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid #d1d5db' }}>
                <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, aspectRatio: '1/1', overflow: 'hidden' }}>
                  <img src={footerImage || "/images/logo.png"} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '1/1' }} crossOrigin="anonymous" />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{displayProductName}</div>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
                    <div><span style={{ fontWeight: 500 }}>{displayCustomerName}</span></div>
                    {orderData?.orderNumber && (
                      <div><span style={{ fontWeight: 500 }}>Bestellnr:</span> <span style={{ fontSize: '11px', color: '#64748b' }}>{displayOrderNumber}</span></div>
                    )}
                    <div><span style={{ fontWeight: 500 }}>Liefertermin:</span> <span style={{ fontSize: '11px', color: '#64748b' }}>{displayDeliveryDate}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Body - same horizontal padding as header */}
            <div style={{ padding: '8px 40px 40px 40px', flex: 1, background: '#ffffff', pageBreakInside: 'auto', overflow: 'visible' }}>
              {/* Selected Sole Section */}
              {selectedSole && (
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #d1d5db' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Ausgewählte Sohle:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img 
                      src={selectedSole.image} 
                      alt={selectedSole.name} 
                      style={{ width: '96px', height: '96px', objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                    />
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{selectedSole.name}</p>
                      {selectedSole.des && (
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px', marginBottom: 0 }}>{selectedSole.des}</p>
                      )}
                      {selectedSole.description && (
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: 0, lineHeight: 1.4 }}>{selectedSole.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {showDetails ? (
                <>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Checkliste Halbprobe</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, lineHeight: 1.5, marginBottom: '24px' }}>
                    Überprüfen Sie während der Anprobe die wichtigsten Punkte zur Stabilität und zum Komfort und
                    notieren Sie eventuelle Änderungswünsche.
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Checkliste</div>
              )}

              {allGroups.map((g: GroupDef2) => {
                // Skip section headers
                if (g.fieldType === "section") {
                  return null
                }
                
                const selectedOptionId = selected[g.id]
                
                // Handle text field type (generic handling for all text fields)
                // Only show if there's a value or if it's a required field
                if (g.fieldType === "text") {
                  const displayValue = selectedOptionId || "___"
                  const unit = g.options.length === 1 ? g.options[0].label : ""
                  
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        <span style={{ display: 'inline-block', minWidth: '40px', padding: '2px 8px', borderBottom: '1px solid #22c55e', color: '#22c55e', fontWeight: 600, textAlign: 'center', margin: '0 4px' }}>{displayValue}</span>
                        {unit && <span style={{ marginLeft: '4px' }}>{unit}</span>}
                      </div>
                    </div>
                  )
                }
                
                // Handle hinterkappeMusterSide field type - always show in PDF
                if (g.fieldType === "hinterkappeMusterSide") {
                  const parts = buildHinterkappeMusterPdfLines(hinterkappeMusterSide)
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.length > 0 ? parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        )) : <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nicht ausgewählt</span>}
                      </div>
                    </div>
                  )
                }
                
                // Handle hinterkappeSide field type - always show in PDF
                if (g.fieldType === "hinterkappeSide") {
                  const parts: string[] = []
                  if (hinterkappeSide?.mode) {
                    parts.push(`Ausführung: ${hinterkappeSide.mode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich"}`)
                    const leftVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.leftValue
                    const rightVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.rightValue
                    const leftSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.leftSubValue
                    const rightSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.rightSubValue
                    if (leftVal) {
                      const leftOption = g.options.find(opt => opt.id === leftVal)
                      if (leftOption) {
                        parts.push(hinterkappeSide.mode === "gleich" ? `Material (beide Seiten): ${leftOption.label}` : `Links - Material: ${leftOption.label}`)
                        if (leftVal === "leder" && leftSub && g.subOptions?.leder) {
                          const leftSubOption = g.subOptions.leder.find(opt => opt.id === leftSub)
                          if (leftSubOption) parts.push(hinterkappeSide.mode === "gleich" ? `Leder-Auswahl: ${leftSubOption.label}` : `Links - Leder-Auswahl: ${leftSubOption.label}`)
                        }
                      }
                    }
                    if (hinterkappeSide.mode === "unterschiedlich" && rightVal) {
                      const rightOption = g.options.find(opt => opt.id === rightVal)
                      if (rightOption) {
                        parts.push(`Rechts - Material: ${rightOption.label}`)
                        if (rightVal === "leder" && rightSub && g.subOptions?.leder) {
                          const rightSubOption = g.subOptions.leder.find(opt => opt.id === rightSub)
                          if (rightSubOption) parts.push(`Rechts - Leder-Auswahl: ${rightSubOption.label}`)
                        }
                      }
                    }
                  }
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.length > 0 ? (
                          parts.map((part, idx) => (
                            <div key={idx} style={{ marginBottom: '4px' }}>
                              <PDFCheckbox isSelected={true} label={part} />
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nicht ausgewählt</span>
                        )}
                      </div>
                    </div>
                  )
                }
                
                // Handle brandsohleSide field type
                if (g.fieldType === "brandsohleSide") {
                  if (!brandsohleSide || !brandsohleSide.mode) {
                    return null
                  }
                  const parts = buildBrandsohlePdfLines(brandsohleSide, g.options)
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                // Handle select field type (e.g., hinterkappe) - legacy format
                if (g.fieldType === "select") {
                  const selectedValue = Array.isArray(selectedOptionId) ? selectedOptionId[0] : selectedOptionId
                  const selectedOption = g.options.find(opt => opt.id === selectedValue)
                  
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {selectedOption ? (
                          <>
                            <PDFCheckbox isSelected={true} label={selectedOption.label} />
                            {g.id === "hinterkappe" && selectedValue === "leder" && g.subOptions?.leder && renderSubOption(g.id, (selected['hinterkappe_sub'] as string | null) || null, g.subOptions.leder)}
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nicht ausgewählt</span>
                        )}
                      </div>
                    </div>
                  )
                }
                
                // Handle heelWidthAdjustment field type
                if (g.fieldType === "heelWidthAdjustment") {
                  if (!heelWidthAdjustment) {
                    return null
                  }
                  
                  // Check if any of the new structure fields have values
                  const hasNewValues = heelWidthAdjustment.leftMedial?.mm || 
                                     heelWidthAdjustment.leftLateral?.mm || 
                                     heelWidthAdjustment.rightMedial?.mm || 
                                     heelWidthAdjustment.rightLateral?.mm
                  
                  // Check if any of the old structure fields have values (backward compatibility)
                  const hasOldValues = heelWidthAdjustment.left?.mm || 
                                     heelWidthAdjustment.right?.mm || 
                                     heelWidthAdjustment.medial?.mm || 
                                     heelWidthAdjustment.lateral?.mm
                  
                  if (!hasNewValues && !hasOldValues) {
                    return null
                  }
                  
                  const parts: string[] = []
                  
                  // New structure (preferred)
                  if (heelWidthAdjustment.leftMedial && heelWidthAdjustment.leftMedial.mm > 0) {
                    parts.push(`Linker Schuh – innen (medial): ${heelWidthAdjustment.leftMedial.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.leftMedial.mm} mm`)
                  }
                  if (heelWidthAdjustment.leftLateral && heelWidthAdjustment.leftLateral.mm > 0) {
                    parts.push(`Linker Schuh – außen (lateral): ${heelWidthAdjustment.leftLateral.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.leftLateral.mm} mm`)
                  }
                  if (heelWidthAdjustment.rightMedial && heelWidthAdjustment.rightMedial.mm > 0) {
                    parts.push(`Rechter Schuh – innen (medial): ${heelWidthAdjustment.rightMedial.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.rightMedial.mm} mm`)
                  }
                  if (heelWidthAdjustment.rightLateral && heelWidthAdjustment.rightLateral.mm > 0) {
                    parts.push(`Rechter Schuh – außen (lateral): ${heelWidthAdjustment.rightLateral.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.rightLateral.mm} mm`)
                  }
                  
                  // Old structure (backward compatibility)
                  if (heelWidthAdjustment.left && heelWidthAdjustment.left.mm > 0) {
                    parts.push(`Linker Schuh: ${heelWidthAdjustment.left.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.left.mm} mm`)
                  }
                  if (heelWidthAdjustment.right && heelWidthAdjustment.right.mm > 0) {
                    parts.push(`Rechter Schuh: ${heelWidthAdjustment.right.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.right.mm} mm`)
                  }
                  if (heelWidthAdjustment.medial && heelWidthAdjustment.medial.mm > 0) {
                    parts.push(`Medial (innen): ${heelWidthAdjustment.medial.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.medial.mm} mm`)
                  }
                  if (heelWidthAdjustment.lateral && heelWidthAdjustment.lateral.mm > 0) {
                    parts.push(`Lateral (außen): ${heelWidthAdjustment.lateral.op === "widen" ? "+" : "−"} ${heelWidthAdjustment.lateral.mm} mm`)
                  }
                  
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                // Handle vorderkappeSide field type
                if (g.fieldType === "vorderkappeSide") {
                  if (!vorderkappeSide || !vorderkappeSide.mode) {
                    return null
                  }
                  const parts: string[] = [`Ausführung: ${vorderkappeSide.mode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich"}`]
                  if (vorderkappeSide.mode === "gleich" && vorderkappeSide.sameMaterial) {
                    parts.push(`Material (beide Seiten): ${getVorderkappeMaterialLabel(vorderkappeSide.sameMaterial)}`)
                  }
                  if (vorderkappeSide.mode === "unterschiedlich") {
                    if (vorderkappeSide.leftMaterial) parts.push(`Material (Links): ${getVorderkappeMaterialLabel(vorderkappeSide.leftMaterial)}`)
                    if (vorderkappeSide.rightMaterial) parts.push(`Material (Rechts): ${getVorderkappeMaterialLabel(vorderkappeSide.rightMaterial)}`)
                  }
                  const vkLenPrint = vorderkappeSide.laenge ?? "normal"
                  parts.push(`Länge: ${vkLenPrint === "kurz" ? "Kurz" : "Normal"}`)
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                // Handle rahmen field type
                if (g.fieldType === "rahmen") {
                  if (!rahmen || !rahmen.type) {
                    return null
                  }
                  const parts = buildRahmenPdfLines(rahmen)
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                if (g.fieldType === "sohlenversteifung") {
                  const parts = buildSohlenversteifungPdfLines(sohlenversteifung ?? undefined)
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                if (g.fieldType === "sohlenaufbau") {
                  const parts = buildSohlenaufbauPdfLines(sohlenaufbau ?? undefined)
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {parts.map((part, idx) => (
                          <div key={idx} style={{ marginBottom: '4px' }}>
                            <PDFCheckbox isSelected={true} label={part} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                // Handle yesNo field type (e.g., verbindungsleder)
                if (g.fieldType === "yesNo") {
                  const selectedValue = Array.isArray(selectedOptionId) ? selectedOptionId[0] : selectedOptionId
                  const selectedOption = g.options.find(opt => opt.id === selectedValue)
                  
                  return (
                    <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        {selectedOption ? (
                          <PDFCheckbox isSelected={true} label={selectedOption.label} />
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nicht ausgewählt</span>
                        )}
                      </div>
                    </div>
                  )
                }
                            
                // Handle checkbox and other field types (default)
                return (
                  <div key={g.id} className="pdf-page-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      {g.options && g.options.length > 0 ? (
                        renderPDFOptions(g)
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Keine Optionen verfügbar</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Text areas */}
                  {textAreas && (textAreas.korrektur_bereich || textAreas.fussproblem_bettung || textAreas.bettung_wuensche || textAreas.fussproblem_leisten || textAreas.leisten_wuensche || textAreas.besondere_hinweise) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', pageBreakInside: 'auto' }}>
                      {textAreas?.korrektur_bereich && (
                        <div className="pdf-page-break-avoid" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Wenn eine Korrektur nötig ist: In welchem Bereich?</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.korrektur_bereich}</div>
                        </div>
                      )}
                      {textAreas?.fussproblem_bettung && (
                        <div className="pdf-page-break-avoid" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Gibt es ein spezielles Fußproblem, das wir bei der Fertigung unbedingt berücksichtigen müssen?</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.fussproblem_bettung}</div>
                        </div>
                      )}
                      {textAreas?.bettung_wuensche && (
                        <div className="pdf-page-break-avoid" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Hast du sonstige Anmerkungen oder Wünsche zu der Bettung.</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.bettung_wuensche}</div>
                        </div>
                      )}
                      {textAreas?.fussproblem_leisten && (
                        <div className="pdf-page-break-avoid" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Gibt es spezielle Fußprobleme, die wir bei der Fertigung unbedingt berücksichtigen müssen?</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.fussproblem_leisten}</div>
                        </div>
                      )}
                      {textAreas?.leisten_wuensche && (
                        <div className="pdf-page-break-avoid" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Hast du sonstige Anmerkungen oder Wünsche zum Leisten.</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.leisten_wuensche}</div>
                        </div>
                      )}
                      {textAreas?.besondere_hinweise && (
                        <div className="pdf-page-break-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Besondere Hinweise</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.besondere_hinweise}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

            {/* Footer placeholder (removed during PDF gen, added via jsPDF) */}
            <div className="pdf-info-footer" style={{ marginTop: 'auto', backgroundColor: '#000000', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>+39 366 508 7742</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>FeetF1rst VGmbH</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>info@feetf1rst.com</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white z-10 sticky bottom-0 left-0 right-0">
          <div className="w-full flex justify-end items-center pt-4">
            {/* <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm  font-medium cursor-pointer transition-colors hover:bg-slate-50" onClick={onClose}>
              Zurück
            </button> */}
            <div className="flex gap-3">
              <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm  font-medium flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-50" onClick={handleDownloadPDF}>
                Herunterladen
                <DownloadIcon />
              </button>
              <button className="py-4 px-[74px] rounded-lg border-none bg-[#36a866] text-white text-sm  font-semibold flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#2e8b5e]" onClick={handlePrint}>
                Drucken
                <PrintIcon />
              </button>
              <button 
                className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                onClick={handleAbschließen}
                disabled={isAbschließenLoading}
              >
                {isAbschließenLoading && (
                  <svg className="animate-spin h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Abschließen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFPopup
