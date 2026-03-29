import jsPDF from 'jspdf';

export type FootScanPairPdfInput = {
  logoUrl?: string | null;
  customerName: string;
  kdnr?: string | number | null;
  leftImageUrl?: string | null;
  rightImageUrl?: string | null;
  /** Shown in footer on both pages only when `autoSendToProd` is true */
  footLength?: number | string | null;
  autoSendToProd?: boolean;
};

const getProxyImageUrl = (externalUrl: string): string => {
  if (typeof window === 'undefined') return externalUrl;
  if (!externalUrl) return externalUrl;
  if (externalUrl.startsWith('/api/proxy-image?url=')) return externalUrl;
  const absoluteUrl = externalUrl.startsWith('http')
    ? externalUrl
    : `${window.location.origin}${externalUrl.startsWith('/') ? '' : '/'}${externalUrl}`;
  return `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`;
};

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    const r = await fetch(getProxyImageUrl(url));
    if (!r.ok) return null;
    const b = await r.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(b);
    });
  } catch {
    return null;
  }
}

/** Scale image to fit inside box (CSS object-fit: contain) — full image visible, no cropping. */
function fitContain(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number
): { w: number; h: number; x: number; y: number } {
  if (imgW <= 0 || imgH <= 0) return { w: boxW, h: boxH, x: 0, y: 0 };
  const s = Math.min(boxW / imgW, boxH / imgH);
  const w = imgW * s;
  const h = imgH * s;
  return { w, h, x: (boxW - w) / 2, y: (boxH - h) / 2 };
}

async function getImageDimensions(dataUrl: string): Promise<{ w: number; h: number } | null> {
  if (typeof Image === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      resolve(w > 0 && h > 0 ? { w, h } : null);
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/**
 * Two-page A4 PDF: left foot scan, then right foot scan (same layout as workshop reference).
 * Footer line with foot length only when `autoSendToProd` is true.
 */
export async function generateFootScanPairPdfBlob(input: FootScanPairPdfInput): Promise<Blob> {
  const {
    logoUrl,
    customerName,
    kdnr,
    leftImageUrl,
    rightImageUrl,
    footLength,
    autoSendToProd,
  } = input;

  const pages: Array<{
    sideLabel: string;
    imageUrl: string | null | undefined;
  }> = [
    { sideLabel: 'Left Foot', imageUrl: leftImageUrl },
    { sideLabel: 'Right Foot', imageUrl: rightImageUrl },
  ].filter((p) => !!p.imageUrl);

  if (pages.length === 0) {
    throw new Error('Keine Fußbild-URLs für den PDF-Export.');
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  /**
   * A4 print padding — same inset on top, right, bottom, left.
   * Header (logo, text, divider) starts below the top padding; content stays inside the printable box.
   */
  const PADDING = 12;
  /** Header “navbar”: logo + two-line text + bottom border (matches FeetF1rst-style reference) */
  const HEADER_LOGO_MM = 22;
  /** Gap between logo and text (tighter than before for better navbar balance) */
  const HEADER_LOGO_TEXT_GAP_MM = 5;
  const BORDER_GRAY: [number, number, number] = [229, 231, 235];

  const logoData = logoUrl ? await fetchAsDataUrl(logoUrl) : null;

  const lengthNum =
    footLength == null || footLength === ''
      ? NaN
      : typeof footLength === 'number'
        ? footLength
        : Number(footLength);
  const showLength = autoSendToProd === true && Number.isFinite(lengthNum);

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const { sideLabel, imageUrl } = pages[i];

    const headerTop = PADDING;
    const headerX = PADDING;
    const textX =
      headerX + (logoData ? HEADER_LOGO_MM + HEADER_LOGO_TEXT_GAP_MM : 0);

    const kdnrStr = kdnr != null && String(kdnr).trim() !== '' ? `Kdnr: ${kdnr}` : '';
    const displayName = (customerName || '—').trim();
    const pipeRest = ` | ${sideLabel}`;

    /** Vertical center of logo square — text baselines placed so the block aligns (like align-items: center) */
    const logoMidY = headerTop + HEADER_LOGO_MM / 2;
    let line1Y: number;
    let line2Y: number;
    if (kdnrStr) {
      const halfBaselineGap = 2.85;
      line1Y = logoMidY - halfBaselineGap;
      line2Y = logoMidY + halfBaselineGap;
    } else {
      line1Y = logoMidY + 1.35;
      line2Y = line1Y;
    }

    // Logo (square) — drawn first; text Y already matched to logo midline
    if (logoData) {
      try {
        const fmt: 'PNG' | 'JPEG' = logoData.includes('image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(logoData, fmt, headerX, headerTop, HEADER_LOGO_MM, HEADER_LOGO_MM, undefined, 'SLOW');
      } catch {
        /* ignore logo decode errors */
      }
    }

    // Line 1: bold name + normal " | Left/Right Foot"
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const nameW = pdf.getTextWidth(displayName);
    pdf.text(displayName, textX, line1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(pipeRest, textX + nameW, line1Y);

    pdf.setFontSize(9);
    if (kdnrStr) {
      pdf.text(kdnrStr, textX, line2Y);
    }

    const lastTextBottom = kdnrStr ? line2Y + 2.8 : line1Y + 2;
    // Divider inside padding — aligns with logo/text left and right edges
    const headerBottomY = Math.max(headerTop + HEADER_LOGO_MM, lastTextBottom) + 2;
    pdf.setDrawColor(...BORDER_GRAY);
    pdf.setLineWidth(0.25);
    pdf.line(PADDING, headerBottomY, pageW - PADDING, headerBottomY);

    const contentTop = headerBottomY + 5;
    /** Reserve bottom padding + optional footer line so image does not overlap Fußlänge */
    const footerBandMm = showLength ? 10 : 0;
    const contentBottom = pageH - PADDING - footerBandMm;
    /** Full padded content rectangle below header — foot image scales to fit inside, aspect ratio preserved (no crop). */
    const boxW = pageW - 2 * PADDING;
    const boxH = Math.max(20, contentBottom - contentTop);
    const boxX = PADDING;

    const dataUrl = await fetchAsDataUrl(imageUrl!);
    if (dataUrl) {
      const dim = await getImageDimensions(dataUrl);
      if (dim) {
        const { w, h, x: ox, y: oy } = fitContain(dim.w, dim.h, boxW, boxH);
        const ix = boxX + ox;
        const iy = contentTop + oy;
        try {
          const fmt: 'PNG' | 'JPEG' = dataUrl.includes('image/png') ? 'PNG' : 'JPEG';
          pdf.addImage(dataUrl, fmt, ix, iy, w, h, undefined, 'SLOW');
        } catch {
          pdf.setFontSize(9);
          pdf.setTextColor(120, 120, 120);
          pdf.text('Bild konnte nicht eingebettet werden.', pageW / 2, contentTop + boxH / 2, {
            align: 'center',
          });
        }
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Bild konnte nicht eingebettet werden.', pageW / 2, contentTop + boxH / 2, {
          align: 'center',
        });
      }
    }

    if (showLength) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(40, 40, 40);
      const footer = `Fußlänge: ${lengthNum} mm`;
      pdf.text(footer, pageW / 2, pageH - PADDING, { align: 'center' });
    }
  }

  return pdf.output('blob');
}
