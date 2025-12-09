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
          backgroundColor: null,
          useCORS: true,
          scale: 2,
        }).then((canvas: HTMLCanvasElement) => {
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
          console.log(urls)
          setImageDataUrls(urls)
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
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }
    const html2pdfModule = (await import('html2pdf.js')) as any
    const html2pdf = html2pdfModule.default || html2pdfModule

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
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }
    const html2pdfModule = (await import('html2pdf.js')) as any
    const html2pdf = html2pdfModule.default || html2pdfModule

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
            <div className="w-[794px] flex flex-col min-h-screen" ref={contentRef}>
              <div className="p-8 min-h-[600px] bg-white flex-1">
                {/* PDF Header */}
                <div className="p-8 bg-white border-b border-slate-200">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-[90px] h-[90px] flex items-center justify-center font-bold font-['Poppins']">
                        <img src="/Logo.png" alt="Logo" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-900 font-['Poppins'] text-base font-medium mb-2">Businesseinlage</div>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-slate-900 font-['Poppins'] font-medium">
                          <span>Brugger Theo</span>
                        </div>
                        <div className="text-sm text-slate-900 font-['Poppins'] font-medium">
                          <span>
                            Bestellnr:
                            <span className="text-[10px]"> #121212 </span>
                          </span>
                        </div>
                        <div className="text-sm text-slate-900 font-['Poppins'] font-medium">
                          <span>
                            Liefertermin:
                            <span className="text-[10px]"> 10.02.2025 </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {showDetails ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-gray-900">Checkliste Halbprobe</h4>
                      <p className="text-gray-600 text-sm font-bold leading-relaxed">
                        Überprüfen Sie während der Anprobe die wichtigsten Punkte zur Stabilität und zum Komfort und
                        notieren Sie eventuelle Änderungswünsche.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-gray-900">Checkliste</h4>
                    </div>
                  </div>
                )}

                {filteredGroups.map((g: GroupDef, index: number) => {
                  const selectedOptionId = selected[g.id]
                  if (!selectedOptionId) return null
                  // If text field, render value and unit
                  if (g.options.length === 1 && g.options[0].label === "mm" && g.id === "absatzhoehe") {
                    return (
                      <React.Fragment key={g.id}>
                        <div className={`flex flex-col gap-2.5 py-2.5 break-inside-avoid ${index === 0 ? "pt-5" : ""}`}>
                          <div>
                            <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900 flex-shrink-0 min-w-[300px]">{g.question}</div>
                            <div className="relative w-[200px] mt-2.5">
                              <div className="w-full py-3 px-4 pr-10 border border-slate-300 rounded-lg font-['Poppins'] text-sm leading-5 text-slate-700 bg-slate-50 flex items-center box-border">
                                <span>{selectedOptionId}</span>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-['Poppins'] font-medium text-sm leading-5 text-slate-500 pointer-events-none">mm</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="border-t border-slate-200 my-7" />
                      </React.Fragment>
                    )
                  }
                  // Default rendering for other fields
                  return (
                    <React.Fragment key={g.id}>
                      <div className={`flex flex-col gap-2.5 py-2.5 break-inside-avoid ${index === 0 ? "pt-5" : ""}`}>
                        <div className="flex items-center gap-4 w-full">
                          <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900 flex-shrink-0 w-[40%]">{g.question}</div>
                          <div className="flex items-center gap-6 flex-1 flex-wrap w-[60%]">
                            {g.options.map((opt: OptionDef) => {
                              const isSelected = selectedOptionId === opt.id
                              const placeholderCount =
                                (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
                              const inputsForThisOpt =
                                optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
                              return (
                                <label
                                  key={opt.id}
                                  className={`font-['Poppins'] font-normal text-xs leading-5 flex items-center gap-2 cursor-default whitespace-nowrap flex-wrap ${
                                    isSelected ? "text-slate-900 font-medium" : "text-slate-900 font-medium"
                                  }`}
                                >
                                  {isSelected ? (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#36a866] text-white font-semibold text-xs flex-shrink-0">✓</span>
                                  ) : (
                                    <span className="inline-block w-5 h-5 border-[1.5px] border-slate-300 rounded flex-shrink-0"></span>
                                  )}
                                  {placeholderCount > 0 ? (
                                    <InlineLabelWithInputs option={opt} values={inputsForThisOpt} />
                                  ) : (
                                    <span>{opt.label}</span>
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      <hr className="border-t border-slate-200 my-7" />
                    </React.Fragment>
                  )
                })}

                {/* Notes and free text sections */}
                {textAreas &&
                  (textAreas.bettung_korrektur_bereich_1 ||
                    textAreas.bettung_korrektur_bereich_2 ||
                    textAreas.bettung_wuensche ||
                    textAreas.leisten_probleme ||
                    textAreas.leisten_wuensche) && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-4 break-inside-avoid">
                      <div className="space-y-4">
                        {textAreas?.bettung_korrektur_bereich_1 && (
                          <div className="flex flex-col gap-2">
                            <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900">Korrekturbereich (Bettung)</div>
                            <textarea
                              className="w-full min-h-[100px] border border-slate-300 rounded-xl p-3 font-['Poppins'] text-sm leading-5 text-slate-700 resize-y outline-none bg-slate-50"
                              readOnly
                              aria-label="Korrekturbereich (Bettung)"
                              value={textAreas.bettung_korrektur_bereich_1}
                            />
                          </div>
                        )}
                        {textAreas?.bettung_korrektur_bereich_2 && (
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900">Spezielle Fußprobleme (Bettung)</div>
                            <textarea
                              className="w-full min-h-[100px] border border-slate-300 rounded-xl p-3 font-['Poppins'] text-sm leading-5 text-slate-700 resize-y outline-none bg-slate-50"
                              readOnly
                              aria-label="Spezielle Fußprobleme (Bettung)"
                              value={textAreas.bettung_korrektur_bereich_2}
                            />
                          </div>
                        )}
                        {textAreas?.bettung_wuensche && (
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900">Anmerkungen / Wünsche zur Bettung</div>
                            <textarea
                              className="w-full min-h-[100px] border border-slate-300 rounded-xl p-3 font-['Poppins'] text-sm leading-5 text-slate-700 resize-y outline-none bg-slate-50"
                              readOnly
                              aria-label="Anmerkungen / Wünsche zur Bettung"
                              value={textAreas.bettung_wuensche}
                            />
                          </div>
                        )}
                        {textAreas?.leisten_probleme && (
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900">Spezielle Fußprobleme (Leisten)</div>
                            <textarea
                              className="w-full min-h-[100px] border border-slate-300 rounded-xl p-3 font-['Poppins'] text-sm leading-5 text-slate-700 resize-y outline-none bg-slate-50"
                              readOnly
                              aria-label="Spezielle Fußprobleme (Leisten)"
                              value={textAreas.leisten_probleme}
                            />
                          </div>
                        )}
                        {textAreas?.leisten_wuensche && (
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="font-['Poppins'] font-medium text-sm leading-[18px] text-slate-900">Anmerkungen / Wünsche zum Leisten</div>
                            <textarea
                              className="w-full min-h-[100px] border border-slate-300 rounded-xl p-3 font-['Poppins'] text-sm leading-5 text-slate-700 resize-y outline-none bg-slate-50"
                              readOnly
                              aria-label="Anmerkungen / Wünsche zum Leisten"
                              value={textAreas.leisten_wuensche}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
              {/* Footer */}
              <div className="flex justify-between items-center py-6 px-8 gap-2.5 bg-black flex-shrink-0 mt-auto">
                <div className="text-white font-['Poppins'] text-base font-medium leading-5">+39 366 5087742</div>
                <div className="text-white font-['Poppins'] text-base font-medium leading-5">FeetF1rst SRLS</div>
                <div className="text-white font-['Poppins'] text-base font-medium leading-5">Info@feetf1st.com</div>
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
