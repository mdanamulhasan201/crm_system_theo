"use client"

import React, { useRef } from "react"

import { CloseIcon, DownloadIcon, PrintIcon } from "./Icons"

// Order data interface for dynamic PDF content
export interface OrderDataForPDF {
  orderNumber?: string
  customerName?: string
  productName?: string
  deliveryDate?: string
  status?: string
  filiale?: string
  totalPrice?: number
}

interface PDFPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  allGroups: GroupDef[]
  selected: Record<string, string | null>
  optionInputs: Record<string, Record<string, string[]>>
  textAreas?: {
    korrektur_bereich?: string
    fussproblem_bettung?: string
    bettung_wuensche?: string
    fussproblem_leisten?: string
    leisten_wuensche?: string
    [key: string]: string | undefined
  }
  showDetails?: boolean
  orderData?: OrderDataForPDF
}

type OptionDef = { id: string; label: string }
type GroupDef = { id: string; question: string; options: OptionDef[] }

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
}) => {
  const pdfContentRef = useRef<HTMLDivElement>(null)

  // Default values if orderData is not provided
  const displayOrderNumber = orderData?.orderNumber || "#000000"
  const displayCustomerName = orderData?.customerName || "Kunde"
  const displayProductName = orderData?.productName || "Maßschuh"
  const displayDeliveryDate = orderData?.deliveryDate || "-"

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

  const handleDownloadPDF = async () => {
    if (!pdfContentRef.current) return

    const clone = pdfContentRef.current.cloneNode(true) as HTMLElement

    clone.querySelectorAll("textarea").forEach((textarea) => {
      const div = document.createElement("div")
      div.textContent = textarea.value || ""
      div.className = "description-text-area pdf-textarea-replacement"
      textarea.parentNode?.replaceChild(div, textarea)
    })

    const footer = clone.querySelector(".pdf-info-footer")
    if (footer && footer.parentNode) footer.parentNode.removeChild(footer)

    const opt = {
      margin: [0, 0, 45, 0], // [top, left, bottom, right] - bottom margin for footer space
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc: Document) => {
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
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }
    const html2pdfModule = (await import('html2pdf.js')) as any
    const html2pdf = html2pdfModule.default || html2pdfModule

    try {
      const worker = html2pdf()
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
            pdf.text("+39 366 5087742", 40, pageHeight - 15)
            pdf.text("FeetF1rst SRLS", pageWidth / 2, pageHeight - 15, { align: "center" })
            pdf.text("Info@feetf1st.com", pageWidth - 40, pageHeight - 15, { align: "right" })
          }

          pdf.save("document.pdf")
        })

      await worker
    } catch (err) {
      console.warn('PDF generation error:', err);
    }
  }

  const handlePrint = async () => {
    if (!pdfContentRef.current) return

    const clone = pdfContentRef.current.cloneNode(true) as HTMLElement

    clone.querySelectorAll("textarea").forEach((textarea) => {
      const div = document.createElement("div")
      div.textContent = textarea.value || ""
      div.className = "description-text-area pdf-textarea-replacement"
      textarea.parentNode?.replaceChild(div, textarea)
    })
 
    const footer = clone.querySelector(".pdf-info-footer")
    if (footer && footer.parentNode) footer.parentNode.removeChild(footer)

    const opt = {
      margin: [0, 0, 45, 0], // [top, left, bottom, right] - bottom margin for footer space
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc: Document) => {
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
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }
    const html2pdfModule = (await import('html2pdf.js')) as any
    const html2pdf = html2pdfModule.default || html2pdfModule

    try {
      const worker = html2pdf()
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
            pdf.text("+39 366 5087742", 40, pageHeight - 15)
            pdf.text("FeetF1rst SRLS", pageWidth / 2, pageHeight - 15, { align: "center" })
            pdf.text("Info@feetf1st.com", pageWidth - 40, pageHeight - 15, { align: "right" })
          }
   
          const pdfBlob = pdf.output("blob")
          const pdfUrl = URL.createObjectURL(pdfBlob)
   
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
        })

      await worker
    } catch (err) {
      console.warn('Print error:', err);
    }
  }

  // Render options with label content
  const renderModalOptions = (g: GroupDef) => {
    const selectedOptionId = selected[g.id]
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

  const renderPDFOptions = (g: GroupDef) => {
    const selectedOptionId = selected[g.id]
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[9999] flex items-center justify-center">
      <div className="bg-white w-[80vw] min-h-[80vh] rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s] relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 relative">
          <h2 className="text-xl font-semibold text-slate-900  m-0">Your PDF is Ready</h2>
          <button onClick={onClose} className="absolute right-6 top-6 bg-none border-none text-2xl text-slate-500 cursor-pointer transition-colors p-0 w-6 h-6 flex items-center justify-center hover:text-slate-800" title="Close">
            <CloseIcon />
          </button>
        </div>

        {/* ============ MODAL PREVIEW (Visible - uses flexbox) ============ */}
        <div className="flex flex-col items-center shadow-md bg-slate-100 p-4 rounded-2xl m-4 break-inside-avoid">
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="bg-white" style={{ width: '794px', minHeight: '1123px',  }}>
              {/* Header - outer has padding, inner content has border */}
              <div className="pt-6 pb-2 px-10">
                <div className="flex gap-6 items-start pb-3 border-b-2 border-gray-300">
                  <div className="w-[70px] h-[70px] flex items-center justify-center flex-shrink-0">
                    <img src="/Logo.png" alt="Logo" className="max-w-full max-h-full" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-800 mb-2">{displayProductName}</div>
                    <div className="text-sm text-slate-800 leading-relaxed">
                      <div><span className="font-medium">{displayCustomerName}</span></div>
                      <div><span className="font-medium">Bestellnr:</span> <span className="text-xs text-slate-500">{displayOrderNumber}</span></div>
                      <div><span className="font-medium">Liefertermin:</span> <span className="text-xs text-slate-500">{displayDeliveryDate}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body - same horizontal padding as header */}
              <div className="pt-3 pb-6 px-10 flex-1">
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

                  {allGroups.map((g: GroupDef) => {
                    const selectedOptionId = selected[g.id]
                    
                    if (g.options.length === 1 && g.options[0].label === "mm" && g.id === "absatzhoehe") {
                      return (
                      <div key={g.id} className="flex items-start py-4 border-b border-gray-300">
                        <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                        <div className="flex-1">
                          <span className="inline-block min-w-[40px] px-2 py-0.5 border-b border-green-500 text-green-500 font-semibold text-center mx-1">{selectedOptionId || "___"}</span>
                              <span>mm</span>
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                    <div key={g.id} className="flex items-start py-4 border-b border-gray-300 last:border-b-0">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">{g.question}</div>
                      <div className="flex-1 leading-loose">
                        {renderModalOptions(g)}
                      </div>
                    </div>
                  )
                })}

                {/* Text areas */}
                {textAreas && (textAreas.korrektur_bereich || textAreas.fussproblem_bettung || textAreas.bettung_wuensche || textAreas.fussproblem_leisten || textAreas.leisten_wuensche) && (
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
                      <div>
                        <div className="text-sm font-semibold text-slate-800 mb-2">Hast du sonstige Anmerkungen oder Wünsche zum Leisten.</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[60px] leading-relaxed">{textAreas.leisten_wuensche}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto bg-black py-4 px-10 flex justify-between items-center">
                <span className="text-white text-xs">+39 366 5087742</span>
                <span className="text-white text-xs">FeetF1rst SRLS</span>
                <span className="text-white text-xs">Info@feetf1st.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ HIDDEN PDF CONTENT (for PDF generation - uses inline styles) ============ */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfContentRef} style={{ width: '794px', minHeight: '1123px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Poppins, Arial, sans-serif' }}>
            {/* Header - outer has padding, inner content has border */}
            <div style={{ padding: '24px 40px 8px 40px', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '2px solid #d1d5db' }}>
                <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/Logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{displayProductName}</div>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.6 }}>
                    <div><span style={{ fontWeight: 500 }}>{displayCustomerName}</span></div>
                    <div><span style={{ fontWeight: 500 }}>Bestellnr:</span> <span style={{ fontSize: '11px', color: '#64748b' }}>{displayOrderNumber}</span></div>
                    <div><span style={{ fontWeight: 500 }}>Liefertermin:</span> <span style={{ fontSize: '11px', color: '#64748b' }}>{displayDeliveryDate}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Body - same horizontal padding as header */}
            <div style={{ padding: '12px 40px 24px 40px', flex: 1, background: '#ffffff' }}>
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

              {allGroups.map((g: GroupDef) => {
                const selectedOptionId = selected[g.id]
                
                if (g.options.length === 1 && g.options[0].label === "mm" && g.id === "absatzhoehe") {
                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db' }}>
                      <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                      <div style={{ flex: 1, lineHeight: 1.8 }}>
                        <span style={{ display: 'inline-block', minWidth: '40px', padding: '2px 8px', borderBottom: '1px solid #22c55e', color: '#22c55e', fontWeight: 600, textAlign: 'center', margin: '0 4px' }}>{selectedOptionId || "___"}</span>
                        <span>mm</span>
                      </div>
                    </div>
                  )
                }
                            
                            return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #d1d5db' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px', lineHeight: 1.4 }}>{g.question}</div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      {renderPDFOptions(g)}
                        </div>
                      </div>
                    )
                  })}

              {/* Text areas */}
                  {textAreas && (textAreas.korrektur_bereich || textAreas.fussproblem_bettung || textAreas.bettung_wuensche || textAreas.fussproblem_leisten || textAreas.leisten_wuensche) && (
                <div style={{ marginTop: '16px', paddingTop: '16px' }}>
                      {textAreas?.korrektur_bereich && (
                        <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Wenn eine Korrektur nötig ist: In welchem Bereich?</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.korrektur_bereich}</div>
                        </div>
                      )}
                      {textAreas?.fussproblem_bettung && (
                        <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Gibt es ein spezielles Fußproblem, das wir bei der Fertigung unbedingt berücksichtigen müssen?</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.fussproblem_bettung}</div>
                        </div>
                      )}
                      {textAreas?.bettung_wuensche && (
                        <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Hast du sonstige Anmerkungen oder Wünsche zu der Bettung.</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.bettung_wuensche}</div>
                        </div>
                      )}
                      {textAreas?.fussproblem_leisten && (
                        <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Gibt es spezielle Fußprobleme, die wir bei der Fertigung unbedingt berücksichtigen müssen?</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.fussproblem_leisten}</div>
                        </div>
                      )}
                      {textAreas?.leisten_wuensche && (
                        <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Hast du sonstige Anmerkungen oder Wünsche zum Leisten.</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '60px', lineHeight: 1.5 }}>{textAreas.leisten_wuensche}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

            {/* Footer placeholder (removed during PDF gen, added via jsPDF) */}
            <div className="pdf-info-footer" style={{ marginTop: 'auto', backgroundColor: '#000000', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>+39 366 5087742</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>FeetF1rst SRLS</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>Info@feetf1st.com</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white z-10 sticky bottom-0 left-0 right-0">
          <div className="w-full flex justify-between items-center pt-4">
            <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm  font-medium cursor-pointer transition-colors hover:bg-slate-50" onClick={onClose}>
              Zurück
            </button>
            <div className="flex gap-3">
              <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm  font-medium flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-50" onClick={handleDownloadPDF}>
                Download
                <DownloadIcon />
              </button>
              <button className="py-4 px-[74px] rounded-lg border-none bg-[#36a866] text-white text-sm  font-semibold flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#2e8b5e]" onClick={handlePrint}>
                Print
                <PrintIcon />
              </button>
              <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm  font-medium cursor-pointer transition-colors hover:bg-slate-50" onClick={onConfirm}>
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
