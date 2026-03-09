import { PosReceipt } from "@/apis/pickupsApis";
import jsPDF from "jspdf";

const fmt = (n: number) => n.toFixed(2).replace(".", ",");

/**
 * Generate printable HTML for a Kassenbon (POS receipt).
 */
export function generateReceiptHTML(receipt: PosReceipt): string {
  const d = receipt.receiptData;
  if (!d) return "<p>Keine Belegdaten verfügbar</p>";

  const date = new Date(receipt.createdAt).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 8mm 4mm; font-size: 12px; color: #000; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; }
    .section { margin: 6px 0; }
    .small { font-size: 10px; }
    .tse { font-size: 9px; word-break: break-all; color: #555; }
    @media print {
      body { width: 80mm; }
      @page { size: 80mm auto; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="center bold" style="font-size: 14px; margin-bottom: 4px;">
    ${d.company.companyName}
  </div>
  <div class="center small">${d.company.address}</div>
  ${d.company.phone ? `<div class="center small">Tel: ${d.company.phone}</div>` : ""}
  ${d.company.vatNumber ? `<div class="center small">USt-IdNr: ${d.company.vatNumber}</div>` : ""}

  <div class="divider"></div>

  <div class="section">
    <div class="row"><span>Bestellung:</span><span>${d.transaction.order}</span></div>
    <div class="row"><span>Kunde:</span><span>${d.transaction.customer}</span></div>
    <div class="row"><span>Datum:</span><span>${date}</span></div>
  </div>

  <div class="divider"></div>

  <div class="section">
    <div class="bold">${d.product.description}</div>
    <div class="row">
      <span>${d.product.quantity} x ${fmt(d.product.unitPrice)} €</span>
      <span>${fmt(d.product.itemTotal)} €</span>
    </div>
  </div>

  <div class="divider"></div>

  <div class="section">
    <div class="row"><span>Netto:</span><span>${fmt(d.financial.subtotal)} €</span></div>
    <div class="row"><span>MwSt. ${d.financial.vatRate}%:</span><span>${fmt(d.financial.vatAmount)} €</span></div>
    <div class="divider"></div>
    <div class="row bold" style="font-size: 14px;">
      <span>GESAMT:</span><span>${fmt(d.financial.total)} €</span>
    </div>
  </div>

  <div class="divider"></div>

  <div class="section">
    <div class="row"><span>Zahlungsart:</span><span>${receipt.paymentMethod === "CASH" ? "Bar" : "Karte"}</span></div>
    ${d.servedBy ? `<div class="row"><span>Bedient von:</span><span>${d.servedBy}</span></div>` : ""}
  </div>

  ${receipt.fiskalyRecordId ? `
  <div class="divider"></div>
  <div class="section tse">
    <div class="bold small">Dati Fiscali</div>
    <div>Doc. ID: ${receipt.fiskalyRecordId}</div>
    ${receipt.fiskalySignature ? `<div>Firma: ${receipt.fiskalySignature.substring(0, 40)}...</div>` : ""}
    ${receipt.fiscalizedAt ? `<div>Data: ${new Date(receipt.fiscalizedAt).toLocaleString("de-DE")}</div>` : ""}
  </div>
  ` : receipt.fiskalyTxId ? `
  <div class="divider"></div>
  <div class="section tse">
    <div class="bold small">TSE Daten</div>
    <div>TX: ${receipt.fiskalyTxId}</div>
    ${receipt.fiskalyTxNumber ? `<div>TX-Nr: ${receipt.fiskalyTxNumber}</div>` : ""}
    ${receipt.fiskalySignatureValue ? `<div>Sig: ${receipt.fiskalySignatureValue.substring(0, 40)}...</div>` : ""}
    ${receipt.fiskalyTimeStart ? `<div>Start: ${new Date(receipt.fiskalyTimeStart).toLocaleString("de-DE")}</div>` : ""}
    ${receipt.fiskalyTimeEnd ? `<div>Ende: ${new Date(receipt.fiskalyTimeEnd).toLocaleString("de-DE")}</div>` : ""}
  </div>
  ` : ""}

  <div class="divider"></div>
  <div class="center small" style="margin-top: 8px;">Vielen Dank für Ihren Einkauf!</div>
  <div class="center small">${d.company.companyName}</div>

  ${receipt.storniert ? `
  <div class="divider"></div>
  <div class="center bold" style="font-size: 14px; color: #cc0000; margin: 6px 0;">*** STORNIERT ***</div>
  <div class="center small" style="color: #cc0000;">Dieser Beleg wurde storniert.</div>
  ${receipt.storniertAt ? `<div class="center small" style="color: #cc0000;">Storniert am: ${new Date(receipt.storniertAt).toLocaleString("de-DE")}</div>` : ""}
  ` : ""}
</body>
</html>`;
}

/**
 * Generate a PDF blob for the Kassenbon.
 * Returns a Blob that can be downloaded.
 */
export function generateReceiptPDF(receipt: PosReceipt): Blob {
  const d = receipt.receiptData;
  if (!d) throw new Error("No receipt data");

  // 80mm thermal receipt width
  const pageWidth = 80;
  const doc = new jsPDF({ unit: "mm", format: [pageWidth, 200] });
  const margin = 4;
  const contentWidth = pageWidth - margin * 2;
  let y = 8;

  const center = (text: string, size: number, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, pageWidth / 2, y, { align: "center" });
    y += size * 0.4 + 1;
  };

  const row = (left: string, right: string, size = 9, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(left, margin, y);
    doc.text(right, pageWidth - margin, y, { align: "right" });
    y += size * 0.4 + 1;
  };

  const divider = () => {
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3;
  };

  // Header
  center(d.company.companyName, 12, true);
  center(d.company.address, 8);
  if (d.company.phone) center(`Tel: ${d.company.phone}`, 8);
  if (d.company.vatNumber) center(`USt-IdNr: ${d.company.vatNumber}`, 8);
  y += 1;

  divider();

  const date = new Date(receipt.createdAt).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  row("Bestellung:", d.transaction.order);
  row("Kunde:", d.transaction.customer);
  row("Datum:", date);

  divider();

  // Product
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(d.product.description, margin, y);
  y += 5;
  row(
    `${d.product.quantity} x ${fmt(d.product.unitPrice)} €`,
    `${fmt(d.product.itemTotal)} €`,
  );

  divider();

  // Financials
  row("Netto:", `${fmt(d.financial.subtotal)} €`);
  row(`MwSt. ${d.financial.vatRate}%:`, `${fmt(d.financial.vatAmount)} €`);
  divider();
  row("GESAMT:", `${fmt(d.financial.total)} €`, 12, true);

  divider();

  row("Zahlungsart:", receipt.paymentMethod === "CASH" ? "Bar" : "Karte");
  if (d.servedBy) row("Bedient von:", d.servedBy);

  // Fiscal data (SIGN IT or legacy TSE)
  if (receipt.fiskalyRecordId) {
    divider();
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Dati Fiscali", margin, y);
    y += 3;
    doc.setFont("helvetica", "normal");
    doc.text(`Doc. ID: ${receipt.fiskalyRecordId}`, margin, y);
    y += 3;
    if (receipt.fiskalySignature) {
      doc.text(`Firma: ${receipt.fiskalySignature.substring(0, 40)}...`, margin, y);
      y += 3;
    }
    if (receipt.fiscalizedAt) {
      doc.text(`Data: ${new Date(receipt.fiscalizedAt).toLocaleString("de-DE")}`, margin, y);
      y += 3;
    }
  } else if (receipt.fiskalyTxId) {
    divider();
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("TSE Daten", margin, y);
    y += 3;
    doc.setFont("helvetica", "normal");
    doc.text(`TX: ${receipt.fiskalyTxId}`, margin, y);
    y += 3;
    if (receipt.fiskalyTxNumber) {
      doc.text(`TX-Nr: ${receipt.fiskalyTxNumber}`, margin, y);
      y += 3;
    }
  }

  divider();
  center("Vielen Dank für Ihren Einkauf!", 9);
  center(d.company.companyName, 8);

  if (receipt.storniert) {
    divider();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(204, 0, 0);
    doc.text("*** STORNIERT ***", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Dieser Beleg wurde storniert.", pageWidth / 2, y, { align: "center" });
    y += 3;
    if (receipt.storniertAt) {
      doc.text(`Storniert am: ${new Date(receipt.storniertAt).toLocaleString("de-DE")}`, pageWidth / 2, y, { align: "center" });
      y += 3;
    }
    doc.setTextColor(0, 0, 0);
  }

  // Trim the page to actual content height
  const finalHeight = y + 10;
  const trimmedDoc = new jsPDF({ unit: "mm", format: [pageWidth, finalHeight] });

  // Re-render on trimmed page
  // Since jsPDF doesn't support page resizing, we return with the original
  return doc.output("blob");
}
