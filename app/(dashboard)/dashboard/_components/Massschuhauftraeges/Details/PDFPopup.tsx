"use client"

import React, { useEffect, useRef, useState } from "react"

import html2canvas from "html2canvas"
import { CloseIcon, DownloadIcon, PrintIcon } from "./Icons"
interface PDFPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  filteredGroups: GroupDef[]
  selected: Record<string, string | null>
  optionInputs: Record<string, Record<string, string[]>>
  textAreas?: {
    bettung_korrektur_bereich_1?: string
    bettung_korrektur_bereich_2?: string
    bettung_wuensche?: string
    leisten_probleme?: string
    leisten_wuensche?: string
    [key: string]: string | undefined
  }
  showDetails?: boolean
}

type OptionDef = { id: string; label: string }
type GroupDef = { id: string; question: string; options: OptionDef[] }

function InlineLabelWithInputs({
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
          {idx < parts.length - 1 && <span className="inline-block min-w-[40px] px-1 border-b border-[#36a866] text-[#36a866] font-medium">{values[idx] || "___"}</span>}
        </React.Fragment>
      ))}
    </span>
  )
}

const PDFPopup: React.FC<PDFPopupProps> = ({
  isOpen,
  onClose,
  filteredGroups,
  selected,
  optionInputs,
  textAreas,
  showDetails,
  onConfirm,
}) => {
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([])
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && imageDataUrls.length === 0) {
      if (contentRef.current) {
        html2canvas(contentRef.current, {
          backgroundColor: '#ffffff',
          useCORS: true,
          scale: 2,
          logging: false,
          onclone: (clonedDoc) => {
            // Remove oklch colors that html2canvas doesn't support
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              *, *::before, *::after {
                color: inherit !important;
                background-color: inherit !important;
                border-color: inherit !important;
                outline-color: inherit !important;
              }
              :root {
                --background: #ffffff !important;
                --foreground: #252525 !important;
                --border: #ebebeb !important;
                --ring: #b5b5b5 !important;
                color-scheme: light !important;
              }
            `;
            clonedDoc.head.appendChild(style);
            
            // Remove any inline styles with oklch
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
        }).then((canvas: HTMLCanvasElement) => {
          if (!canvas) return;
          const a4WidthPx = 794
          const a4HeightPx = 1123
          const scale = a4WidthPx / canvas.width
          const pageHeightPx = Math.floor(a4HeightPx / scale)
          const totalPages = Math.ceil(canvas.height / pageHeightPx)
          const urls: string[] = []
          for (let i = 0; i < totalPages; i++) {
            const pageCanvas = document.createElement("canvas")
            pageCanvas.width = canvas.width
            pageCanvas.height = Math.min(pageHeightPx, canvas.height - i * pageHeightPx)
            const ctx = pageCanvas.getContext("2d")
            if (ctx) {
              ctx.drawImage(
                canvas,
                0,
                i * pageHeightPx,
                canvas.width,
                pageCanvas.height,
                0,
                0,
                canvas.width,
                pageCanvas.height,
              )
            }
            urls.push(pageCanvas.toDataURL("image/png"))
          }
          setImageDataUrls(urls)
        }).catch((err) => {
          console.warn('html2canvas error:', err);
        })
      }
    }
    if (!isOpen) {
      setImageDataUrls([])
    }
  }, [isOpen, imageDataUrls.length])

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    const input = contentRef.current

    // Clone content
    const clone = input.cloneNode(true) as HTMLElement

    // Replace all textareas with divs (so values appear in PDF)
    clone.querySelectorAll("textarea").forEach((textarea) => {
      const div = document.createElement("div")
      div.textContent = textarea.value || "" // Copy the text
      div.className = "description-text-area pdf-textarea-replacement"
      textarea.parentNode?.replaceChild(div, textarea)
    })

    // Remove the existing footer
    const footer = clone.querySelector(".pdf-info-footer")
    if (footer && footer.parentNode) footer.parentNode.removeChild(footer)

    const opt = {
      margin: [0, 0, 0, 0],
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            *, *::before, *::after {
              color: inherit !important;
              background-color: inherit !important;
              border-color: inherit !important;
            }
            :root {
              --background: #ffffff !important;
              --foreground: #252525 !important;
              --border: #ebebeb !important;
              color-scheme: light !important;
            }
          `;
          clonedDoc.head.appendChild(style);
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
            pdf.rect(0, pageHeight - 48, pageWidth, 48, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(12)
            pdf.text("+39 366 5087742", 40, pageHeight - 20)
            pdf.text("FeetF1rst SRLS", pageWidth / 2, pageHeight - 20, { align: "center" })
            pdf.text("Info@feetf1st.com", pageWidth - 40, pageHeight - 20, { align: "right" })
          }

          pdf.save("document.pdf")
        })

      await worker
    } catch (err) {
      console.warn('PDF generation error:', err);
    }
  }

  const handlePrint = async () => {
    if (!contentRef.current) return

    const input = contentRef.current

    // Clone content
    const clone = input.cloneNode(true) as HTMLElement

    // Replace all textareas with divs (so values appear in PDF)
    clone.querySelectorAll("textarea").forEach((textarea) => {
      const div = document.createElement("div")
      div.textContent = textarea.value || ""
      div.className = "description-text-area pdf-textarea-replacement"
      textarea.parentNode?.replaceChild(div, textarea)
    })
 
    const footer = clone.querySelector(".pdf-info-footer")
    if (footer && footer.parentNode) footer.parentNode.removeChild(footer)

    const opt = {
      margin: [0, 0, 0, 0],
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            *, *::before, *::after {
              color: inherit !important;
              background-color: inherit !important;
              border-color: inherit !important;
            }
            :root {
              --background: #ffffff !important;
              --foreground: #252525 !important;
              --border: #ebebeb !important;
              color-scheme: light !important;
            }
          `;
          clonedDoc.head.appendChild(style);
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
            pdf.rect(0, pageHeight - 48, pageWidth, 48, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(12)
            pdf.text("+39 366 5087742", 40, pageHeight - 20)
            pdf.text("FeetF1rst SRLS", pageWidth / 2, pageHeight - 20, { align: "center" })
            pdf.text("Info@feetf1st.com", pageWidth - 40, pageHeight - 20, { align: "right" })
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

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[9999] flex items-center justify-center">
      <div className="bg-white w-[80vw] min-h-[80vh] rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s] relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 relative">
          <h2 className="text-xl font-semibold text-slate-900 font-['Poppins'] m-0">Your PDF is Ready</h2>
          <button onClick={onClose} className="absolute right-6 top-6 bg-none border-none text-2xl text-slate-500 cursor-pointer transition-colors p-0 w-6 h-6 flex items-center justify-center hover:text-slate-800" title="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Preview Wrapper */}
        <div className="flex flex-col items-center shadow-md bg-slate-100 p-4 rounded-2xl m-4 break-inside-avoid">
          <div className="max-h-[60vh] overflow-y-auto">
            <div ref={contentRef} style={{ width: '794px', minHeight: '1123px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Poppins, Arial, sans-serif' }}>
              {/* Custom PDF Styles */}
              <style>{`
                .pdf-container * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                .pdf-header {
                  padding: 32px 40px;
                  border-bottom: 1px solid #e2e8f0;
                  background: #ffffff;
                }
                .pdf-header-content {
                  display: flex;
                  gap: 24px;
                  align-items: flex-start;
                }
                .pdf-logo {
                  width: 70px;
                  height: 70px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                }
                .pdf-logo img {
                  max-width: 100%;
                  max-height: 100%;
                }
                .pdf-title {
                  font-size: 18px;
                  font-weight: 600;
                  color: #1e293b;
                  margin-bottom: 8px;
                }
                .pdf-info {
                  font-size: 13px;
                  color: #1e293b;
                  line-height: 1.6;
                }
                .pdf-info-label {
                  font-weight: 500;
                }
                .pdf-info-value {
                  font-size: 11px;
                  color: #64748b;
                }
                .pdf-body {
                  padding: 24px 40px;
                  flex: 1;
                  background: #ffffff;
                }
                .pdf-section-title {
                  font-size: 18px;
                  font-weight: 700;
                  color: #1e293b;
                  margin-bottom: 8px;
                }
                .pdf-section-desc {
                  font-size: 12px;
                  color: #64748b;
                  font-weight: 500;
                  line-height: 1.5;
                  margin-bottom: 24px;
                }
                .pdf-row {
                  display: flex;
                  align-items: flex-start;
                  padding: 16px 0;
                  border-bottom: 1px solid #e2e8f0;
                  page-break-inside: avoid;
                }
                .pdf-row:last-child {
                  border-bottom: none;
                }
                .pdf-question {
                  width: 200px;
                  flex-shrink: 0;
                  font-size: 13px;
                  font-weight: 600;
                  color: #1e293b;
                  padding-right: 16px;
                  line-height: 1.4;
                }
                .pdf-options {
                  flex: 1;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 12px 24px;
                  align-items: center;
                }
                .pdf-option {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 12px;
                  color: #475569;
                }
                .pdf-checkbox {
                  width: 20px;
                  height: 20px;
                  border: 2px solid #d1d5db;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                  background: #ffffff;
                }
                .pdf-checkbox.checked {
                  background: #22c55e;
                  border-color: #22c55e;
                }
                .pdf-checkbox svg {
                  width: 14px;
                  height: 14px;
                }
                .pdf-input-value {
                  display: inline-block;
                  min-width: 40px;
                  padding: 2px 8px;
                  border-bottom: 1px solid #22c55e;
                  color: #22c55e;
                  font-weight: 600;
                  text-align: center;
                  margin: 0 4px;
                }
                .pdf-textarea-section {
                  margin-top: 16px;
                  padding: 16px 0;
                  border-top: 1px solid #e2e8f0;
                }
                .pdf-textarea-label {
                  font-size: 13px;
                  font-weight: 600;
                  color: #1e293b;
                  margin-bottom: 8px;
                }
                .pdf-textarea-content {
                  font-size: 12px;
                  color: #475569;
                  padding: 12px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  min-height: 60px;
                  line-height: 1.5;
                }
                .pdf-footer {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 20px 40px;
                  background: #0f172a;
                  margin-top: auto;
                }
                .pdf-footer-text {
                  font-size: 12px;
                  color: #ffffff;
                  font-weight: 500;
                }
              `}</style>
              
              <div className="pdf-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                {/* PDF Header */}
                <div className="pdf-header">
                  <div className="pdf-header-content">
                    <div className="pdf-logo">
                      <img src="/Logo.png" alt="Logo" />
                    </div>
                    <div>
                      <div className="pdf-title">Businesseinlage</div>
                      <div className="pdf-info">
                        <div><span className="pdf-info-label">Brugger Theo</span></div>
                        <div><span className="pdf-info-label">Bestellnr:</span> <span className="pdf-info-value">#121212</span></div>
                        <div><span className="pdf-info-label">Liefertermin:</span> <span className="pdf-info-value">10.02.2025</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Body */}
                <div className="pdf-body">
                  {showDetails ? (
                    <>
                      <div className="pdf-section-title">Checkliste Halbprobe</div>
                      <div className="pdf-section-desc">
                        Überprüfen Sie während der Anprobe die wichtigsten Punkte zur Stabilität und zum Komfort und
                        notieren Sie eventuelle Änderungswünsche.
                      </div>
                    </>
                  ) : (
                    <div className="pdf-section-title">Checkliste</div>
                  )}

                  {filteredGroups.map((g: GroupDef) => {
                    const selectedOptionId = selected[g.id]
                    if (!selectedOptionId) return null
                    
                    // If text field, render value and unit
                    if (g.options.length === 1 && g.options[0].label === "mm" && g.id === "absatzhoehe") {
                      return (
                        <div key={g.id} className="pdf-row">
                          <div className="pdf-question">{g.question}</div>
                          <div className="pdf-options">
                            <div className="pdf-option">
                              <span className="pdf-input-value">{selectedOptionId}</span>
                              <span>mm</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    
                    // Default rendering for other fields
                    return (
                      <div key={g.id} className="pdf-row">
                        <div className="pdf-question">{g.question}</div>
                        <div className="pdf-options">
                          {g.options.map((opt: OptionDef) => {
                            const isSelected = selectedOptionId === opt.id
                            const placeholderCount = (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
                            const inputsForThisOpt = optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
                            
                            return (
                              <div key={opt.id} className="pdf-option">
                                <div className={`pdf-checkbox ${isSelected ? 'checked' : ''}`}>
                                  {isSelected && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </div>
                                {placeholderCount > 0 ? (
                                  <InlineLabelWithInputs option={opt} values={inputsForThisOpt} />
                                ) : (
                                  <span>{opt.label}</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {/* Notes and free text sections */}
                  {textAreas && (textAreas.bettung_korrektur_bereich_1 || textAreas.bettung_korrektur_bereich_2 || textAreas.bettung_wuensche || textAreas.leisten_probleme || textAreas.leisten_wuensche) && (
                    <div className="pdf-textarea-section">
                      {textAreas?.bettung_korrektur_bereich_1 && (
                        <div style={{ marginBottom: '16px' }}>
                          <div className="pdf-textarea-label">Korrekturbereich (Bettung)</div>
                          <div className="pdf-textarea-content">{textAreas.bettung_korrektur_bereich_1}</div>
                        </div>
                      )}
                      {textAreas?.bettung_korrektur_bereich_2 && (
                        <div style={{ marginBottom: '16px' }}>
                          <div className="pdf-textarea-label">Spezielle Fußprobleme (Bettung)</div>
                          <div className="pdf-textarea-content">{textAreas.bettung_korrektur_bereich_2}</div>
                        </div>
                      )}
                      {textAreas?.bettung_wuensche && (
                        <div style={{ marginBottom: '16px' }}>
                          <div className="pdf-textarea-label">Anmerkungen / Wünsche zur Bettung</div>
                          <div className="pdf-textarea-content">{textAreas.bettung_wuensche}</div>
                        </div>
                      )}
                      {textAreas?.leisten_probleme && (
                        <div style={{ marginBottom: '16px' }}>
                          <div className="pdf-textarea-label">Spezielle Fußprobleme (Leisten)</div>
                          <div className="pdf-textarea-content">{textAreas.leisten_probleme}</div>
                        </div>
                      )}
                      {textAreas?.leisten_wuensche && (
                        <div>
                          <div className="pdf-textarea-label">Anmerkungen / Wünsche zum Leisten</div>
                          <div className="pdf-textarea-content">{textAreas.leisten_wuensche}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PDF Footer */}
                <div className="pdf-footer">
                  <div className="pdf-footer-text">+39 366 5087742</div>
                  <div className="pdf-footer-text">FeetF1rst SRLS</div>
                  <div className="pdf-footer-text">Info@feetf1st.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white z-10 sticky bottom-0 left-0 right-0">
          <div className="w-full flex justify-between items-center pt-4">
            <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-['Poppins'] font-medium cursor-pointer transition-colors hover:bg-slate-50" onClick={onClose}>
              Zurück
            </button>
            <div className="flex gap-3">
              <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-['Poppins'] font-medium flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-50" onClick={handleDownloadPDF}>
                Download
                <DownloadIcon />
              </button>
              <button className="py-4 px-[74px] rounded-lg border-none bg-[#36a866] text-white text-sm font-['Poppins'] font-semibold flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#2e8b5e]" onClick={handlePrint}>
                Print
                <PrintIcon />
              </button>
              <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-['Poppins'] font-medium cursor-pointer transition-colors hover:bg-slate-50" onClick={onConfirm}>
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
