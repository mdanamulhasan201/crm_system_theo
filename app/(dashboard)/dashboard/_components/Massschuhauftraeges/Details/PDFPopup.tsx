"use client"

import React, { useRef } from "react"

import { CloseIcon, DownloadIcon, PrintIcon } from "./Icons"
import type { GroupDef2 } from "./ShoeData"

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
    schlemmaterial_preferred_colour?: string
    [key: string]: string | undefined
  }
  showDetails?: boolean
  orderData?: OrderDataForPDF
  selectedSole?: { id: string; name: string; image: string; des?: string; description?: string } | null
  heelWidthAdjustment?: { left?: { op: "widen" | "narrow" | null; mm: number }; right?: { op: "widen" | "narrow" | null; mm: number }; medial?: { op: "widen" | "narrow" | null; mm: number }; lateral?: { op: "widen" | "narrow" | null; mm: number } } | null
  soleElevation?: { enabled: boolean; side: "links" | "rechts" | "beidseitig" | null; height_mm: number } | null
  // Orthopedic fields
  vorderkappeSide?: { side: "links" | "rechts" | "beidseitig" | null; material: "leicht" | "normal" | null } | null
  rahmen?: { type: "eva" | "gummi" | null; color?: string } | null
  sohlenhoeheDifferenziert?: { ferse?: number; ballen?: number; spitze?: number } | null
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
  soleElevation,
  vorderkappeSide,
  rahmen,
  sohlenhoeheDifferenziert,
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

    const opt = {
      margin: [40, 40, 80, 40],
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
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

  const handleDownloadPDF = async () => {
    const blob = await generatePDFBlob()
    if (blob) {
      setPdfBlob(blob)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = "document.pdf"
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

  // Render options with label content
  const renderModalOptions = (g: GroupDef2) => {
    const selectedOptionId = selected[g.id]
    
    // Handle multi-select fields (arrays)
    const isMultiSelect = g.multiSelect === true
    const selectedArray = Array.isArray(selectedOptionId) ? selectedOptionId : (selectedOptionId ? [selectedOptionId] : [])
    
    return g.options.map((opt: OptionDef) => {
      const isSelected = isMultiSelect 
        ? selectedArray.includes(opt.id)
        : selectedOptionId === opt.id
      
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
    
    return g.options.map((opt: OptionDef) => {
      const isSelected = isMultiSelect 
        ? selectedArray.includes(opt.id)
        : selectedOptionId === opt.id
      
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
                    <img src={footerImage || "/Logo.png"} alt="Logo" className="w-full h-full object-contain aspect-square" />
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

                  {/* Heel Width Adjustment Section */}
                  {heelWidthAdjustment && (heelWidthAdjustment.left || heelWidthAdjustment.right || heelWidthAdjustment.medial || heelWidthAdjustment.lateral) && (
                    <div className="mb-6 pb-4 border-b border-gray-300">
                      <div className="text-sm font-semibold text-slate-800 mb-3">Absatzbreite anpassen (mm):</div>
                      {heelWidthAdjustment.left && heelWidthAdjustment.left.mm > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Linker Schuh:</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {heelWidthAdjustment.left.op === "widen" ? "+" : "−"} {heelWidthAdjustment.left.mm} mm
                          </span>
                        </div>
                      )}
                      {heelWidthAdjustment.right && heelWidthAdjustment.right.mm > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Rechter Schuh:</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {heelWidthAdjustment.right.op === "widen" ? "+" : "−"} {heelWidthAdjustment.right.mm} mm
                          </span>
                        </div>
                      )}
                      {/* Backward compatibility with medial/lateral */}
                      {heelWidthAdjustment.medial && heelWidthAdjustment.medial.mm > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Medial (innen):</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {heelWidthAdjustment.medial.op === "widen" ? "+" : "−"} {heelWidthAdjustment.medial.mm} mm
                          </span>
                        </div>
                      )}
                      {heelWidthAdjustment.lateral && heelWidthAdjustment.lateral.mm > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Lateral (außen):</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {heelWidthAdjustment.lateral.op === "widen" ? "+" : "−"} {heelWidthAdjustment.lateral.mm} mm
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sole Elevation Section */}
                  {soleElevation && soleElevation.enabled && soleElevation.height_mm > 0 && (
                    <div className="mb-6 pb-4 border-b border-gray-300">
                      <div className="text-sm font-semibold text-slate-800 mb-3">Sohlenerhöhung:</div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-700 font-medium">Seite:</span>
                        <span className="ml-2 text-xs text-slate-600">
                          {soleElevation.side === "links" ? "Links" : 
                           soleElevation.side === "rechts" ? "Rechts" : 
                           soleElevation.side === "beidseitig" ? "Beidseitig" : "-"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-700 font-medium">Höhe:</span>
                        <span className="ml-2 text-xs text-slate-600">
                          {soleElevation.height_mm} mm
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Vorderkappe Section */}
                  {vorderkappeSide && vorderkappeSide.side && (
                    <div className="mb-6 pb-4 border-b border-gray-300">
                      <div className="text-sm font-semibold text-slate-800 mb-3">Vorderkappe:</div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-700 font-medium">Seite:</span>
                        <span className="ml-2 text-xs text-slate-600 capitalize">
                          {vorderkappeSide.side}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-700 font-medium">Material:</span>
                        <span className="ml-2 text-xs text-slate-600 capitalize">
                          {vorderkappeSide.material || "-"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rahmen Section */}
                  {rahmen && rahmen.type && (
                    <div className="mb-6 pb-4 border-b border-gray-300">
                      <div className="text-sm font-semibold text-slate-800 mb-3">Rahmen:</div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-700 font-medium">Typ:</span>
                        <span className="ml-2 text-xs text-slate-600">
                          {rahmen.type === "eva" ? "EVA-Rahmen" : "Gummi-Rahmen"}
                        </span>
                      </div>
                      {rahmen.type === "gummi" && rahmen.color && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Farbe:</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {rahmen.color}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sohlenhöhe Differenziert Section */}
                  {sohlenhoeheDifferenziert && (sohlenhoeheDifferenziert.ferse || sohlenhoeheDifferenziert.ballen || sohlenhoeheDifferenziert.spitze) && (
                    <div className="mb-6 pb-4 border-b border-gray-300">
                      <div className="text-sm font-semibold text-slate-800 mb-3">Sohlenhöhe gesamt – Differenziert:</div>
                      {sohlenhoeheDifferenziert.ferse && sohlenhoeheDifferenziert.ferse > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Ferse:</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {sohlenhoeheDifferenziert.ferse} mm
                          </span>
                        </div>
                      )}
                      {sohlenhoeheDifferenziert.ballen && sohlenhoeheDifferenziert.ballen > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Ballen:</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {sohlenhoeheDifferenziert.ballen} mm
                          </span>
                        </div>
                      )}
                      {sohlenhoeheDifferenziert.spitze && sohlenhoeheDifferenziert.spitze > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-slate-700 font-medium">Spitze:</span>
                          <span className="ml-2 text-xs text-slate-600">
                            {sohlenhoeheDifferenziert.spitze} mm
                          </span>
                        </div>
                      )}
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
                    
                    // Handle select field type (e.g., hinterkappe)
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
                    
                    // Handle heelWidthAdjustment field type (handled separately above)
                    if (g.fieldType === "heelWidthAdjustment") {
                      return null // Already handled above
                    }
                    
                    // Handle soleElevation field type (handled separately above)
                    if (g.fieldType === "soleElevation") {
                      return null // Already handled above
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
                {textAreas && (textAreas.korrektur_bereich || textAreas.fussproblem_bettung || textAreas.bettung_wuensche || textAreas.fussproblem_leisten || textAreas.leisten_wuensche || textAreas.besondere_hinweise || textAreas.schlemmaterial_preferred_colour) && (
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
                    {textAreas?.schlemmaterial_preferred_colour && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Bevorzugte Farbe (Sohlenmaterial)</div>
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 border border-gray-300 rounded-lg min-h-[40px] leading-relaxed">{textAreas.schlemmaterial_preferred_colour}</div>
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
                  <img src={footerImage || "/Logo.png"} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '1/1' }} />
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

              {/* Heel Width Adjustment Section */}
              {heelWidthAdjustment && (heelWidthAdjustment.left || heelWidthAdjustment.right || heelWidthAdjustment.medial || heelWidthAdjustment.lateral) && (
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #d1d5db' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Absatzbreite anpassen (mm):</div>
                  {heelWidthAdjustment.left && heelWidthAdjustment.left.mm > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Linker Schuh:</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {heelWidthAdjustment.left.op === "widen" ? "+" : "−"} {heelWidthAdjustment.left.mm} mm
                      </span>
                    </div>
                  )}
                  {heelWidthAdjustment.right && heelWidthAdjustment.right.mm > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Rechter Schuh:</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {heelWidthAdjustment.right.op === "widen" ? "+" : "−"} {heelWidthAdjustment.right.mm} mm
                      </span>
                    </div>
                  )}
                  {/* Backward compatibility with medial/lateral */}
                  {heelWidthAdjustment.medial && heelWidthAdjustment.medial.mm > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Medial (innen):</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {heelWidthAdjustment.medial.op === "widen" ? "+" : "−"} {heelWidthAdjustment.medial.mm} mm
                      </span>
                    </div>
                  )}
                  {heelWidthAdjustment.lateral && heelWidthAdjustment.lateral.mm > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Lateral (außen):</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {heelWidthAdjustment.lateral.op === "widen" ? "+" : "−"} {heelWidthAdjustment.lateral.mm} mm
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Sole Elevation Section */}
              {soleElevation && soleElevation.enabled && soleElevation.height_mm > 0 && (
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #d1d5db' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Sohlenerhöhung:</div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Seite:</span>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                      {soleElevation.side === "links" ? "Links" : 
                       soleElevation.side === "rechts" ? "Rechts" : 
                       soleElevation.side === "beidseitig" ? "Beidseitig" : "-"}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Höhe:</span>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                      {soleElevation.height_mm} mm
                    </span>
                  </div>
                </div>
              )}

              {/* Vorderkappe Section */}
              {vorderkappeSide && vorderkappeSide.side && (
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #d1d5db' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Vorderkappe:</div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Seite:</span>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569', textTransform: 'capitalize' }}>
                      {vorderkappeSide.side}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Material:</span>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569', textTransform: 'capitalize' }}>
                      {vorderkappeSide.material || "-"}
                    </span>
                  </div>
                </div>
              )}

              {/* Rahmen Section */}
              {rahmen && rahmen.type && (
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #d1d5db' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Rahmen:</div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Typ:</span>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                      {rahmen.type === "eva" ? "EVA-Rahmen" : "Gummi-Rahmen"}
                    </span>
                  </div>
                  {rahmen.type === "gummi" && rahmen.color && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Farbe:</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {rahmen.color}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Sohlenhöhe Differenziert Section */}
              {sohlenhoeheDifferenziert && (sohlenhoeheDifferenziert.ferse || sohlenhoeheDifferenziert.ballen || sohlenhoeheDifferenziert.spitze) && (
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #d1d5db' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Sohlenhöhe gesamt – Differenziert:</div>
                  {sohlenhoeheDifferenziert.ferse && sohlenhoeheDifferenziert.ferse > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Ferse:</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {sohlenhoeheDifferenziert.ferse} mm
                      </span>
                    </div>
                  )}
                  {sohlenhoeheDifferenziert.ballen && sohlenhoeheDifferenziert.ballen > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Ballen:</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {sohlenhoeheDifferenziert.ballen} mm
                      </span>
                    </div>
                  )}
                  {sohlenhoeheDifferenziert.spitze && sohlenhoeheDifferenziert.spitze > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>Spitze:</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#475569' }}>
                        {sohlenhoeheDifferenziert.spitze} mm
                      </span>
                    </div>
                  )}
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
                
                // Handle select field type (e.g., hinterkappe)
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
                
                // Handle heelWidthAdjustment field type (handled separately above)
                if (g.fieldType === "heelWidthAdjustment") {
                  return null // Already handled above
                }
                
                // Handle soleElevation field type (handled separately above)
                if (g.fieldType === "soleElevation") {
                  return null // Already handled above
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
                // Always show the field, renderPDFOptions will show all options with selected ones checked
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
                  {textAreas && (textAreas.korrektur_bereich || textAreas.fussproblem_bettung || textAreas.bettung_wuensche || textAreas.fussproblem_leisten || textAreas.leisten_wuensche || textAreas.besondere_hinweise || textAreas.schlemmaterial_preferred_colour) && (
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
                      {textAreas?.schlemmaterial_preferred_colour && (
                        <div className="pdf-page-break-avoid" style={{ marginTop: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Bevorzugte Farbe (Sohlenmaterial)</div>
                      <div style={{ fontSize: '12px', color: '#475569', padding: '12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '40px', lineHeight: 1.5 }}>{textAreas.schlemmaterial_preferred_colour}</div>
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
          <div className="w-full flex justify-between items-center pt-4">
            <button className="py-4 px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm  font-medium cursor-pointer transition-colors hover:bg-slate-50" onClick={onClose}>
              Zurück
            </button>
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
