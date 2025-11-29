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
          {idx < parts.length - 1 && <span className="pdf-inline-value">{values[idx] || "___"}</span>}
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
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-container">
        <div className="pdf-modal-header">
          <h2 className="pdf-modal-title">Your PDF is Ready</h2>
          <button onClick={onClose} className="pdf-modal-close" title="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="pdf-preview-wrapper">
          <div className="pdf-preview-scroll">
            <div className="pdf-fixed-width" ref={contentRef}>
              <div className="pdf-image">
                <div className="pdf-file-header-section">
                  <div className="pdf-header-top">
                    <div className="pdf-logo-section">
                      <div className="pdf-logo-placeholder">
                        <img src="/Logo.png" alt="Logo" className="pdf-logo-image" />
                      </div>
                    </div>
                    <div className="pdf-header-info">
                      <div className="pdf-header-title">Businesseinlage</div>
                      <div className="pdf-header-details">
                        <div className="pdf-detail-row">
                          <span className="pdf-detail-label">Brugger Theo</span>
                        </div>
                        <div className="pdf-detail-row">
                          <span className="pdf-detail-label">
                            Bestellnr:
                            <span className="pdf-detail-value"> #121212 </span>
                          </span>
                        </div>
                        <div className="pdf-detail-row">
                          <span className="pdf-detail-label">
                            Liefertermin:
                            <span className="pdf-detail-value"> 10.02.2025 </span>
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
                        <div className={`pdf-question-group pdf-no-break ${index === 0 ? " padding-t-10" : ""}`}>
                          <div className="   ">
                            <div className="`pdf-question-text `">{g.question}</div>
                            <div className="text-display-group w-40 ">
                              <div className="text-display-box">
                                <span>{selectedOptionId}</span>
                                <span className="text-display-unit">mm</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="divider-hr" />
                      </React.Fragment>
                    )
                  }
                  // Default rendering for other fields
                  return (
                    <React.Fragment key={g.id}>
                      <div
                        className={`${
                          index === 0 ? " padding-t-10 pdf-question-group" : "pdf-question-group"
                        } pdf-no-break`}
                      >
                        <div className="pdf-question-row w-100">
                          <div className="pdf-question-text w-40">{g.question}</div>
                          <div className="pdf-options-inline pdf-flex-wrap w-60">
                            {g.options.map((opt: OptionDef) => {
                              const isSelected = selectedOptionId === opt.id
                              const placeholderCount =
                                (opt.label || "").replace(/_{3,}/g, "___").split("___").length - 1
                              const inputsForThisOpt =
                                optionInputs[g.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
                              return (
                                <label
                                  key={opt.id}
                                  className={`pdf-option-inline ${
                                    isSelected ? "pdf-selected" : "pdf-unselected"
                                  } pdf-flex-wrap`}
                                >
                                  {isSelected ? (
                                    <span className="pdf-checkmark-circle">✓</span>
                                  ) : (
                                    <span className="pdf-checkbox-empty"></span>
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
                      <hr className="divider-hr" />
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
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-4 pdf-no-break">
                      <div className="space-y-4">
                        {textAreas?.bettung_korrektur_bereich_1 && (
                          <div className="pdf-note-block ">
                            <div className="pdf-question-text">Korrekturbereich (Bettung)</div>
                            <textarea
                              className="description-text-area"
                              readOnly
                              aria-label="Korrekturbereich (Bettung)"
                              value={textAreas.bettung_korrektur_bereich_1}
                            />
                          </div>
                        )}
                        {textAreas?.bettung_korrektur_bereich_2 && (
                          <div className="pdf-note-block  mt-4 ">
                            <div className="pdf-question-text">Spezielle Fußprobleme (Bettung)</div>
                            <textarea
                              className="description-text-area"
                              readOnly
                              aria-label="Spezielle Fußprobleme (Bettung)"
                              value={textAreas.bettung_korrektur_bereich_2}
                            />
                          </div>
                        )}
                        {textAreas?.bettung_wuensche && (
                          <div className="pdf-note-block    mt-4 ">
                            <div className="pdf-question-text">Anmerkungen / Wünsche zur Bettung</div>
                            <textarea
                              className="description-text-area"
                              readOnly
                              aria-label="Anmerkungen / Wünsche zur Bettung"
                              value={textAreas.bettung_wuensche}
                            />
                          </div>
                        )}
                        {textAreas?.leisten_probleme && (
                          <div className="pdf-note-block  mt-4 ">
                            <div className="pdf-question-text">Spezielle Fußprobleme (Leisten)</div>
                            <textarea
                              className="description-text-area"
                              readOnly
                              aria-label="Spezielle Fußprobleme (Leisten)"
                              value={textAreas.leisten_probleme}
                            />
                          </div>
                        )}
                        {textAreas?.leisten_wuensche && (
                          <div className="pdf-note-block  mt-4 ">
                            <div className="pdf-question-text">Anmerkungen / Wünsche zum Leisten</div>
                            <textarea
                              className="description-text-area"
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
              <div className="pdf-info-footer">
                <div className="pdf-info-item">+39 366 5087742</div>
                <div className="pdf-info-item">FeetF1rst SRLS</div>
                <div className="pdf-info-item">Info@feetf1st.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-modal-footer">
          <div className="pdf-modal-row">
            <button className="pdf-modal-back" onClick={onClose}>
              Zurück
            </button>
            <div className="pdf-modal-actions">
              <button className="pdf-modal-action" onClick={handleDownloadPDF}>
                Download
                <DownloadIcon />
              </button>
              <button className="pdf-modal-action pdf-modal-print" onClick={handlePrint}>
                Print
                <PrintIcon />
              </button>
                <button className="pdf-modal-action  " onClick={onConfirm}>
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
