'use client';

import React, { useRef, useState } from 'react';

export interface ChecklistItem {
  label: string;
  value: string;
}

export interface HalbprobeInvoicePDFData {
  productName?: string;
  customerName?: string;
  totalPrice?: number;
  deliveryDate?: string | null;
  checklist: ChecklistItem[];
  /** Logo image URL for header (same as ShaftPDFPopup). Falls back to /images/logo.png */
  footerImage?: string | null;
}

interface HalbprobeInvoicePDFPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pdfBlob?: Blob) => void;
  orderData: HalbprobeInvoicePDFData;
}

const footerPhone = '+39 366 5087742';
const footerBusinessName = 'FeetF1rst SRLS';
const footerEmail = 'Info@feetf1st.com';

// Same base64 checkbox SVGs as ShaftPDFPopup for identical PDF output
const CHECKBOX_CHECKED = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSI0IiBmaWxsPSIjMjJjNTVlIi8+PHBhdGggZD0iTTQgOUw3LjUgMTIuNUwxNCA1LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
const CHECKBOX_UNCHECKED = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';

export default function HalbprobeInvoicePDFPopup({
  isOpen,
  onClose,
  onConfirm,
  orderData,
}: HalbprobeInvoicePDFPopupProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isAbschließenLoading, setIsAbschließenLoading] = useState(false);

  const displayPrice = orderData?.totalPrice != null
    ? `€${Number(orderData.totalPrice).toFixed(2)}`
    : '€0.00';
  const displayProductName = orderData?.productName || 'Halbprobenerstellung';
  const displayCustomerName = orderData?.customerName || 'Kunde';
  const checklist = orderData?.checklist ?? [];
  const footerImage = orderData?.footerImage ?? null;

  // Modal Checkbox – allow long text to wrap to 2nd line (no horizontal scroll in modal)
  const ModalCheckbox = ({ isSelected, label }: { isSelected: boolean; label: React.ReactNode }) => (
    <span className="inline-flex items-start gap-2 text-xs text-slate-600 max-w-full">
      <img src={isSelected ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED} alt="" width={18} height={18} className="mt-0.5 shrink-0" />
      <span className="leading-snug break-words min-w-0">{label}</span>
    </span>
  );

  // PDF Checkbox – allow long text to wrap to 2nd line in PDF
  const PDFCheckbox = ({ isSelected, label }: { isSelected: boolean; label: React.ReactNode }) => (
    <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '12px', lineHeight: '20px', color: '#475569', wordWrap: 'break-word', maxWidth: '100%' }}>
      <img src={isSelected ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED} alt="" width={18} height={18} style={{ display: 'block', flexShrink: 0, marginTop: '2px' }} />
      <span style={{ wordBreak: 'break-word', minWidth: 0 }}>{label}</span>
    </span>
  );

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!pdfContentRef.current) return null;
    const clone = pdfContentRef.current.cloneNode(true) as HTMLElement;
    const footer = clone.querySelector('.pdf-info-footer');
    if (footer?.parentNode) footer.parentNode.removeChild(footer);

    const priceValues = clone.querySelectorAll('.pdf-price-value');
    priceValues.forEach((priceEl) => {
      priceEl.textContent = displayPrice;
      const htmlPriceEl = priceEl as HTMLElement;
      htmlPriceEl.setAttribute('style',
        'font-size: 22px !important; font-weight: bold !important; color: #000000 !important; font-family: Arial, sans-serif !important; visibility: visible !important; display: table-cell !important; text-align: left !important; padding: 0 !important; vertical-align: middle !important; white-space: nowrap !important;'
      );
    });

    const opt = {
      margin: [40, 40, 45, 40],
      filename: 'invoice.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        logging: false,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
        onclone: (clonedDoc: Document) => {
          clonedDoc.querySelectorAll('*').forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && (htmlEl.getAttribute('style') || '').includes('oklch')) {
              htmlEl.setAttribute('style', (htmlEl.getAttribute('style') || '').replace(/oklch\([^)]*\)/g, '#000000'));
            }
          });
          const gesamtpreisSections = clonedDoc.querySelectorAll('.pdf-total-price-section');
          gesamtpreisSections.forEach((section: Element) => {
            const htmlSection = section as HTMLElement;
            htmlSection.style.display = 'block';
            htmlSection.style.visibility = 'visible';
            htmlSection.style.opacity = '1';
            const table = htmlSection.querySelector('table');
            if (table) {
              const htmlTable = table as HTMLElement;
              htmlTable.style.width = 'auto';
              htmlTable.style.borderCollapse = 'collapse';
              htmlTable.style.visibility = 'visible';
            }
          });
          const priceValuesClone = clonedDoc.querySelectorAll('.pdf-price-value');
          priceValuesClone.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            htmlEl.textContent = displayPrice;
            htmlEl.setAttribute('style',
              'font-size: 22px !important; font-weight: bold !important; color: #000000 !important; font-family: Arial, sans-serif !important; visibility: visible !important; display: table-cell !important; text-align: left !important; padding: 0 !important; vertical-align: middle !important; white-space: nowrap !important; opacity: 1 !important;'
            );
          });
        },
      },
      jsPDF: { unit: 'pt' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'] as const, avoid: ['.pdf-page-break-avoid'] },
    };

    const html2pdfModule = (await import('html2pdf.js')) as { default: any };
    const html2pdf = html2pdfModule.default;

    try {
      const pdf = await html2pdf()
        .set(opt)
        .from(clone)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          const pageCount = pdf.internal.getNumberOfPages();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const pageWidth = pdf.internal.pageSize.getWidth();
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFillColor(0, 0, 0);
            pdf.rect(0, pageHeight - 40, pageWidth, 40, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(11);
            pdf.text(footerPhone, 40, pageHeight - 15);
            pdf.text(footerBusinessName, pageWidth / 2, pageHeight - 15, { align: 'center' });
            pdf.text(footerEmail, pageWidth - 40, pageHeight - 15, { align: 'right' });
          }
          return pdf.output('blob');
        });
      return pdf;
    } catch (err) {
      console.error('Halbprobe PDF generation error:', err);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    const blob = await generatePDFBlob();
    if (blob) {
      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const rawName = (orderData?.customerName || '').trim();
      const safeName = rawName ? rawName.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '-').slice(0, 80) || '' : '';
      const baseName = safeName || `Halbprobenerstellung-${Date.now()}`;
      a.download = `${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAbschließen = async () => {
    setIsAbschließenLoading(true);
    try {
      if (pdfBlob) {
        onConfirm(pdfBlob);
        setIsAbschließenLoading(false);
        return;
      }
      const blob = await generatePDFBlob();
      if (blob) {
        setPdfBlob(blob);
        onConfirm(blob);
      } else {
        onConfirm(undefined);
      }
    } catch (error) {
      console.error('Error generating Halbprobe invoice PDF:', error);
      onConfirm(undefined);
    } finally {
      setIsAbschließenLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full sm:w-[95vw] md:w-[85vw] lg:w-[80vw] max-w-[1200px] min-h-[80vh] max-h-[95vh] rounded-xl md:rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s] relative flex flex-col">
        {/* Header – same as ShaftPDFPopup */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 relative">
          <h2 className="text-base md:text-xl font-semibold text-slate-900 m-0">Ihr PDF ist bereit</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 md:right-6 top-4 md:top-6 bg-none border-none text-xl md:text-2xl text-slate-500 cursor-pointer transition-colors p-0 w-6 h-6 flex items-center justify-center hover:text-slate-800"
            title="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Modal preview – wrap long values to 2nd line, no horizontal scrollbar */}
        <div className="flex flex-col items-center shadow-md bg-slate-100 p-2 md:p-4 rounded-xl md:rounded-2xl m-2 md:m-4 break-inside-avoid overflow-hidden">
          <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto overflow-x-hidden w-full">
            <div className="bg-white mx-auto min-w-0" style={{ width: '100%', maxWidth: '794px', minHeight: '400px' }}>
              <div className="pt-6 pb-2 px-10">
                <div className="flex gap-6 items-center pb-3 border-b-2 border-gray-300">
                  <div className="w-[70px] h-[70px] flex items-center justify-center flex-shrink-0 aspect-square overflow-hidden">
                    <img src={footerImage || '/images/logo.png'} alt="Logo" className="w-full h-full object-contain aspect-square" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-800 mb-2">
                      {displayProductName}
                    </div>
                    <div className="text-sm text-slate-800 leading-relaxed">
                      <div><span className="font-medium">{displayCustomerName}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 pb-6 px-10 flex-1">
                <div className="text-lg font-bold text-slate-800 mb-2">Checkliste</div>
                <div className="mt-4">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex py-3 border-b border-gray-300 items-start gap-2">
                      <div className="w-[200px] shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{item.label}</div>
                      <div className="flex-1 min-w-0 leading-loose">
                        <ModalCheckbox isSelected={true} label={item.value || '–'} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '24px', paddingTop: '16px', paddingBottom: '16px', borderTop: '2px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Gesamtpreis:</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#22c55e' }}>{displayPrice}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto bg-black py-4 px-10 flex justify-between items-center">
                <span className="text-white text-xs">{footerPhone}</span>
                <span className="text-white text-xs">{footerBusinessName}</span>
                <span className="text-white text-xs">{footerEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden PDF content (for html2pdf) – same pattern as ShaftPDFPopup */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfContentRef} style={{ width: '794px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', minHeight: 'auto', overflow: 'visible' }}>
            <div style={{ padding: '10px 40px 8px 40px', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid #d1d5db' }}>
                <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, aspectRatio: '1/1', overflow: 'hidden' }}>
                  <img src={footerImage || '/images/logo.png'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '1/1' }} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                    {displayProductName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
                    <div><span style={{ fontWeight: 500 }}>{displayCustomerName}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '6px 40px 12px 40px', background: '#ffffff', pageBreakInside: 'auto', overflow: 'visible' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>Checkliste</div>
              <div style={{ marginTop: '8px' }}>
                {checklist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>{item.label}</div>
                    <div style={{ flex: 1, lineHeight: 1.4, minWidth: 0, wordWrap: 'break-word' }}>
                      <PDFCheckbox isSelected={true} label={item.value || '–'} />
                    </div>
                  </div>
                ))}
                <div className="pdf-page-break-avoid" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>
                  <div
                    className="pdf-total-price-section"
                    style={{
                      marginTop: '12px',
                      marginBottom: '12px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      borderTop: '3px solid #000000',
                      pageBreakInside: 'avoid',
                      pageBreakAfter: 'avoid',
                      backgroundColor: '#ffffff',
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'visible',
                    }}
                  >
                    <table style={{ width: 'auto', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif', padding: '0 30px 0 0', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            Gesamtpreis:
                          </td>
                          <td
                            className="pdf-price-value"
                            style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif', padding: '0', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap' }}
                          >
                            {displayPrice}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="pdf-info-footer" style={{ marginTop: 'auto', backgroundColor: '#000000', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>{footerPhone}</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>{footerBusinessName}</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>{footerEmail}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer – same as ShaftPDFPopup: Zurück | PDF Prüfen | Abschließen */}
        <div className="p-4 md:p-6 border-t border-slate-200 bg-white z-10 sticky bottom-0 left-0 right-0">
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:pt-4">
            <button
              type="button"
              className="hidden md:block py-3 md:py-4 px-8 md:px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50"
              onClick={onClose}
            >
              Zurück
            </button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <button
                type="button"
                className="py-3 md:py-4 px-6 md:px-10 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={handleDownloadPDF}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10m9.333-4L8 9.333 4.667 6M8 2v7.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">PDF Prüfen</span>
                <span className="sm:hidden">Download</span>
              </button>
              <button
                type="button"
                className="py-3 md:py-4 px-6 md:px-10 rounded-lg bg-[#36a866] text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-[#2e8b5e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={handleAbschließen}
                disabled={isAbschließenLoading}
              >
                {isAbschließenLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Abschließen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
