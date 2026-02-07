"use client"

import React, { useRef } from "react"

// Order data interface for dynamic PDF content
export interface ShaftOrderDataForPDF {
  orderNumber?: string
  customerName?: string
  productName?: string
  deliveryDate?: string
  totalPrice?: number
  footerPhone?: string
  footerEmail?: string
  footerBusinessName?: string
  footerImage?: string | null
}

interface ShaftPDFPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pdfBlob?: Blob) => void
  orderData: ShaftOrderDataForPDF
  shaftImage: string | null
  shaftConfiguration: {
    customCategory?: string
    cadModeling?: '1x' | '2x'
    lederType?: string
    lederfarbe?: string
    numberOfLeatherColors?: string
    leatherColors?: string[]
    innenfutter?: string
    schafthohe?: string
    schafthoheLinks?: string
    schafthoheRechts?: string
    umfangmasseLinks?: string
    umfangmasseRechts?: string
    polsterung?: string[]
    verstarkungen?: string[]
    polsterungText?: string
    verstarkungenText?: string
    nahtfarbe?: string
    nahtfarbeOption?: string
    closureType?: string
    passendenSchnursenkel?: boolean
    osenEinsetzen?: boolean
    zipperExtra?: boolean
    additionalNotes?: string
  }
}

const ShaftPDFPopup: React.FC<ShaftPDFPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderData,
  shaftImage,
  shaftConfiguration,
}) => {
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const [pdfBlob, setPdfBlob] = React.useState<Blob | null>(null)
  const [isAbschließenLoading, setIsAbschließenLoading] = React.useState(false)

  // Map closureType value to display name (same as in ProductConfiguration)
  const getClosureTypeDisplayName = (closureType: string | undefined): string => {
    if (!closureType) return '';
    const mapping: { [key: string]: string } = {
      'Eyelets': 'Ösen (Schnürung)',
      'Velcro': 'Klettverschluss',
    };
    return mapping[closureType] || closureType;
  }

  // Map nahtfarbe value to display name (same as in ProductConfiguration)
  const getNahtfarbeDisplayName = (nahtfarbe: string | undefined, nahtfarbeOption?: string): string => {
    if (!nahtfarbe && !nahtfarbeOption) return '';
    
    // Use nahtfarbeOption if available for accurate mapping
    if (nahtfarbeOption) {
      if (nahtfarbeOption === 'default') {
        return 'Passend zur Lederfarbe';
      }
      if (nahtfarbeOption === 'personal') {
        return 'Passendste Nahtfarbe nach Personal';
      }
      if (nahtfarbeOption === 'custom') {
        // Return the custom color value (stored in nahtfarbe)
        return nahtfarbe || 'Eigene Farbe';
      }
    }
    
    // Fallback: If nahtfarbe is a custom value (not 'default', 'Standard', or 'personal'), return it as is
    if (nahtfarbe && nahtfarbe !== 'default' && nahtfarbe !== 'Standard' && nahtfarbe !== 'personal') {
      return nahtfarbe;
    }
    
    // Map stored values to display names
    const mapping: { [key: string]: string } = {
      'default': 'Passend zur Lederfarbe',
      'Standard': 'Passend zur Lederfarbe',
      'personal': 'Passendste Nahtfarbe nach Personal',
    };
    
    return mapping[nahtfarbe || ''] || nahtfarbe || '';
  }

  // ⭐ Store formatted price in state
  const [displayPrice, setDisplayPrice] = React.useState<string>('€0.00')

  // Update price whenever orderData changes
  React.useEffect(() => {
    const totalPrice = orderData?.totalPrice || 0
    const formattedPrice = `€${totalPrice.toFixed(2)}`
    setDisplayPrice(formattedPrice)
  }, [orderData?.totalPrice])

  // Default values if orderData is not provided
  const displayOrderNumber = orderData?.orderNumber || "#000000"
  const displayCustomerName = orderData?.customerName || "Kunde"
  const displayProductName = orderData?.productName || "Maßschaft"
  const displayDeliveryDate = orderData?.deliveryDate || "-"

  // Footer data
  const footerPhone = orderData?.footerPhone || "+39 366 5087742"
  const footerBusinessName = orderData?.footerBusinessName || "FeetF1rst SRLS"
  const footerEmail = orderData?.footerEmail || "Info@feetf1st.com"
  const footerImage = orderData?.footerImage || null

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!pdfContentRef.current) return null
    
    const clone = pdfContentRef.current.cloneNode(true) as HTMLElement

    // Replace textareas with divs for PDF
    clone.querySelectorAll("textarea").forEach((textarea) => {
      const div = document.createElement("div")
      div.textContent = textarea.value || ""
      div.className = "description-text-area pdf-textarea-replacement"
      textarea.parentNode?.replaceChild(div, textarea)
    })

    // Remove footer placeholder (will be added by jsPDF)
    const footer = clone.querySelector(".pdf-info-footer")
    if (footer && footer.parentNode) footer.parentNode.removeChild(footer)
    
    // Update price values with current state
    const priceValues = clone.querySelectorAll('.pdf-price-value');
    priceValues.forEach((priceEl) => {
      priceEl.textContent = displayPrice;
      const htmlPriceEl = priceEl as HTMLElement;
      htmlPriceEl.setAttribute('style', 
        'font-size: 22px !important; ' +
        'font-weight: bold !important; ' +
        'color: #000000 !important; ' +
        'font-family: Arial, sans-serif !important; ' +
        'visibility: visible !important; ' +
        'display: table-cell !important; ' +
        'text-align: left !important; ' +
        'padding: 0 !important; ' +
        'vertical-align: middle !important; ' +
        'white-space: nowrap !important;'
      );
    });

    const opt = {
      margin: [40, 40, 80, 40], // Reduced bottom margin from 90 to 80 to prevent extra page
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
        logging: false, // Disable logging to reduce overhead
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
        onclone: (clonedDoc: Document) => {
          // Fix oklch colors to black for better PDF rendering
          clonedDoc.querySelectorAll('*').forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const styleText = htmlEl.getAttribute('style') || '';
              if (styleText.includes('oklch')) {
                htmlEl.setAttribute('style', styleText.replace(/oklch\([^)]*\)/g, '#000000'));
              }
            }
          });
          
          // Ensure price section is visible
          const gesamtpreisSections = clonedDoc.querySelectorAll('.pdf-total-price-section');
          gesamtpreisSections.forEach((section: Element) => {
            const htmlSection = section as HTMLElement;
            htmlSection.style.display = 'block';
            htmlSection.style.visibility = 'visible';
            htmlSection.style.opacity = '1';
            
            // Ensure table has proper layout
            const table = htmlSection.querySelector('table');
            if (table) {
              const htmlTable = table as HTMLElement;
              htmlTable.style.width = 'auto';
              htmlTable.style.borderCollapse = 'collapse';
              htmlTable.style.visibility = 'visible';
              
              const tds = htmlTable.querySelectorAll('td');
              tds.forEach((td: Element, index: number) => {
                const htmlTd = td as HTMLElement;
                htmlTd.style.verticalAlign = 'middle';
                htmlTd.style.whiteSpace = 'nowrap';
                htmlTd.style.textAlign = 'left';
                htmlTd.style.padding = index === 0 ? '0 30px 0 0' : '0';
              });
            }
          });
          
          // Force price values to be visible
          const priceValues = clonedDoc.querySelectorAll('.pdf-price-value');
          priceValues.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            htmlEl.textContent = displayPrice;
            htmlEl.setAttribute('style', 
              'font-size: 22px !important; ' +
              'font-weight: bold !important; ' +
              'color: #000000 !important; ' +
              'font-family: Arial, sans-serif !important; ' +
              'visibility: visible !important; ' +
              'display: table-cell !important; ' +
              'text-align: left !important; ' +
              'padding: 0 !important; ' +
              'vertical-align: middle !important; ' +
              'white-space: nowrap !important; ' +
              'opacity: 1 !important;'
            );
          });
        }
      },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: ['.pdf-page-break-avoid'], before: '.pdf-page-break-before', after: '.pdf-page-break-after' },
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

          // Add footer to all pages
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i)
            pdf.setFillColor(0, 0, 0)
            pdf.rect(0, pageHeight - 40, pageWidth, 40, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(11)
            pdf.text(footerPhone, 40, pageHeight - 15)
            pdf.text(footerBusinessName, pageWidth / 2, pageHeight - 15, { align: "center" })
            pdf.text(footerEmail, pageWidth - 40, pageHeight - 15, { align: "right" })
          }

          return pdf.output("blob")
        })

      return pdf
    } catch (err) {
      console.error('PDF generation error:', err)
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
      a.download = `shaft-order-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      // console.log('✅ PDF downloaded successfully')
    }
  }

  const handleAbschließen = async () => {
    setIsAbschließenLoading(true)
    try {
      // Reuse existing PDF if already generated (from "PDF Prüfen" button)
      // This significantly reduces loading time
      if (pdfBlob) {
        // PDF already exists, use it immediately
        onConfirm(pdfBlob)
        setIsAbschließenLoading(false)
        return
      }

      // Only generate PDF if it doesn't exist yet
      const blob = await generatePDFBlob()
      if (blob) {
        setPdfBlob(blob)
        onConfirm(blob)
      } else {
        // Still call onConfirm even if PDF fails
        onConfirm(undefined)
      }
    } catch (error) {
      console.error('❌ Error generating PDF:', error)
      onConfirm(undefined)
    } finally {
      setIsAbschließenLoading(false)
    }
  }

  // Base64 encoded checkbox images
  const CHECKBOX_CHECKED = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSI0IiBmaWxsPSIjMjJjNTVlIi8+PHBhdGggZD0iTTQgOUw3LjUgMTIuNUwxNCA1LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=";
  const CHECKBOX_UNCHECKED = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=";

  // Modal Checkbox (uses flexbox)
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

  // PDF Checkbox (uses inline-block)
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

  const renderConfigField = (label: string, value: string | undefined | null, isChecked: boolean = true) => {
    if (!value) return null
    return (
      <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
        <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
          {label}
        </div>
        <div style={{ flex: 1, fontSize: '13px', color: '#475569' }}>
          <PDFCheckbox isSelected={isChecked} label={value} />
        </div>
      </div>
    )
  }

  const renderConfigFieldModal = (label: string, value: string | undefined | null, isChecked: boolean = true) => {
    if (!value) return null
    return (
      <div className="flex py-3 border-b border-gray-300 items-start">
        <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
          {label}
        </div>
        <div className="flex-1 leading-loose">
          <ModalCheckbox isSelected={isChecked} label={value} />
        </div>
      </div>
    )
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full sm:w-[95vw] md:w-[85vw] lg:w-[80vw] max-w-[1200px] min-h-[80vh] max-h-[95vh] rounded-xl md:rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s] relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 relative">
          <h2 className="text-base md:text-xl font-semibold text-slate-900 m-0">Ihr PDF ist bereit</h2>
          <button 
            onClick={onClose} 
            className="absolute right-4 md:right-6 top-4 md:top-6 bg-none border-none text-xl md:text-2xl text-slate-500 cursor-pointer transition-colors p-0 w-6 h-6 flex items-center justify-center hover:text-slate-800" 
            title="Schließen"
          >
            ✕
          </button>
        </div>

        {/* MODAL PREVIEW */}
        <div className="flex flex-col items-center shadow-md bg-slate-100 p-2 md:p-4 rounded-xl md:rounded-2xl m-2 md:m-4 break-inside-avoid overflow-hidden">
          <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto w-full">
            <div className="bg-white mx-auto" style={{ width: '100%', maxWidth: '794px', minHeight: '400px' }}>
              {/* Header */}
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

              {/* Body */}
              <div className="pt-3 pb-6 px-10 flex-1">
                <div className="text-lg font-bold text-slate-800 mb-2">Checkliste</div>

                {/* Configuration Details with Checkboxes - Show ALL options */}
                <div className="mt-4">
                  {/* Kategorie */}
                  {shaftConfiguration.customCategory && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Kategorie
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={shaftConfiguration.customCategory === 'Halbschuhe'} label="Halbschuhe" />
                        <ModalCheckbox isSelected={shaftConfiguration.customCategory === 'Stiefel'} label="Stiefel" />
                        <ModalCheckbox isSelected={shaftConfiguration.customCategory === 'Sandalen'} label="Sandalen" />
                        <ModalCheckbox isSelected={shaftConfiguration.customCategory === 'Stiefeletten'} label="Stiefeletten" />
                        {!['Halbschuhe', 'Stiefel', 'Sandalen', 'Stiefeletten'].includes(shaftConfiguration.customCategory) && (
                          <ModalCheckbox isSelected={true} label={shaftConfiguration.customCategory} />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* CAD-Modellierung */}
                  {shaftConfiguration.cadModeling && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        CAD-Modellierung
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={shaftConfiguration.cadModeling === '1x'} label="1x" />
                        <ModalCheckbox isSelected={shaftConfiguration.cadModeling === '2x'} label="2x (+6.99€)" />
                      </div>
                    </div>
                  )}
                  
                  {/* Ledertyp */}
                  {shaftConfiguration.lederType && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Ledertyp
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={true} label={shaftConfiguration.lederType} />
                      </div>
                    </div>
                  )}
                  
                  {/* Lederfarbe (single color) */}
                  {shaftConfiguration.numberOfLeatherColors === '1' && shaftConfiguration.lederfarbe && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Lederfarbe
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={true} label={shaftConfiguration.lederfarbe} />
                      </div>
                    </div>
                  )}
                  
                  {/* Anzahl der Ledertypen - Only show selected option */}
                  {shaftConfiguration.numberOfLeatherColors && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Anzahl der Ledertypen
                      </div>
                      <div className="flex-1 leading-loose">
                        {shaftConfiguration.numberOfLeatherColors === '1' && (
                          <ModalCheckbox isSelected={true} label="1" />
                        )}
                        {shaftConfiguration.numberOfLeatherColors === '2' && (
                          <ModalCheckbox isSelected={true} label="2" />
                        )}
                        {shaftConfiguration.numberOfLeatherColors === '3' && (
                          <ModalCheckbox isSelected={true} label="3" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Multiple leather colors - Only show when 2 or 3 colors selected */}
                  {shaftConfiguration.numberOfLeatherColors && shaftConfiguration.numberOfLeatherColors !== '1' && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Lederfarben
                      </div>
                      <div className="flex-1 leading-loose">
                        {shaftConfiguration.leatherColors && shaftConfiguration.leatherColors.length > 0 && (
                          <div className="ml-0 mt-0 text-xs text-slate-600">
                            {shaftConfiguration.leatherColors.map((color, idx) => (
                              <div key={idx} className="mb-1">• Farbe {idx + 1}: {color}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Innenfutter */}
                  {shaftConfiguration.innenfutter && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Innenfutter
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={true} label={shaftConfiguration.innenfutter} />
                      </div>
                    </div>
                  )}
                  
                  {/* Schafthöhe */}
                  {(shaftConfiguration.schafthohe || shaftConfiguration.schafthoheLinks || shaftConfiguration.schafthoheRechts) && (
                    <>
                      {shaftConfiguration.schafthohe && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Schafthöhe
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={true} label={`${shaftConfiguration.schafthohe} cm`} />
                          </div>
                        </div>
                      )}
                      {shaftConfiguration.schafthoheLinks && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Schafthöhe Links
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={true} label={`${shaftConfiguration.schafthoheLinks} cm`} />
                          </div>
                        </div>
                      )}
                      {shaftConfiguration.schafthoheRechts && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Schafthöhe Rechts
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={true} label={`${shaftConfiguration.schafthoheRechts} cm`} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Umfangmaße */}
                  {(shaftConfiguration.umfangmasseLinks || shaftConfiguration.umfangmasseRechts) && (
                    <>
                      {shaftConfiguration.umfangmasseLinks && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Umfangmaße Links
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={true} label={shaftConfiguration.umfangmasseLinks} />
                          </div>
                        </div>
                      )}
                      {shaftConfiguration.umfangmasseRechts && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Umfangmaße Rechts
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={true} label={shaftConfiguration.umfangmasseRechts} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Polsterung - Only show selected options */}
                  {shaftConfiguration.polsterung && shaftConfiguration.polsterung.length > 0 && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Polsterung
                      </div>
                      <div className="flex-1 leading-loose">
                        {shaftConfiguration.polsterung.map((option) => (
                          <ModalCheckbox 
                            key={option}
                            isSelected={true} 
                            label={option} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {shaftConfiguration.polsterungText && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Polsterung (Hinweise)
                      </div>
                      <div className="flex-1 text-xs text-slate-600 pt-1">
                        {shaftConfiguration.polsterungText}
                      </div>
                    </div>
                  )}
                  
                  {/* Verstärkungen - Only show selected options */}
                  {shaftConfiguration.verstarkungen && shaftConfiguration.verstarkungen.length > 0 && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Verstärkungen
                      </div>
                      <div className="flex-1 leading-loose">
                        {shaftConfiguration.verstarkungen.map((option) => (
                          <ModalCheckbox 
                            key={option}
                            isSelected={true} 
                            label={option} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {shaftConfiguration.verstarkungenText && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Verstärkungen (Hinweise)
                      </div>
                      <div className="flex-1 text-xs text-slate-600 pt-1">
                        {shaftConfiguration.verstarkungenText}
                      </div>
                    </div>
                  )}
                  
                  {/* Nahtfarbe - Only show selected option */}
                  {(shaftConfiguration.nahtfarbe || shaftConfiguration.nahtfarbeOption) && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Nahtfarbe
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={true} label={getNahtfarbeDisplayName(shaftConfiguration.nahtfarbe, shaftConfiguration.nahtfarbeOption)} />
                      </div>
                    </div>
                  )}
                  
                  {/* Verschlussart - Only show selected option */}
                  {shaftConfiguration.closureType && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Verschlussart
                      </div>
                      <div className="flex-1 leading-loose">
                        <ModalCheckbox isSelected={true} label={getClosureTypeDisplayName(shaftConfiguration.closureType)} />
                      </div>
                    </div>
                  )}
                  
                  {/* Add-ons - Only show if at least one is selected */}
                  {(shaftConfiguration.passendenSchnursenkel !== undefined || shaftConfiguration.osenEinsetzen !== undefined || shaftConfiguration.zipperExtra !== undefined) && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-300">
                      <div className="text-base font-bold text-slate-800 mb-3">
                        Extras
                      </div>
                      {/* Passende Schnürsenkel - Only show if selected (true or false) */}
                      {shaftConfiguration.passendenSchnursenkel !== undefined && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Passende Schnürsenkel
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={shaftConfiguration.passendenSchnursenkel === true} label="Ja (+4.49€)" />
                            <ModalCheckbox isSelected={shaftConfiguration.passendenSchnursenkel === false} label="Nein" />
                          </div>
                        </div>
                      )}
                      {/* Ösen einsetzen - Only show if selected (true or false) */}
                      {shaftConfiguration.osenEinsetzen !== undefined && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Ösen einsetzen
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={shaftConfiguration.osenEinsetzen === true} label="Ja (+8.99€)" />
                            <ModalCheckbox isSelected={shaftConfiguration.osenEinsetzen === false} label="Nein" />
                          </div>
                        </div>
                      )}
                      {/* Zusätzlicher Reißverschluss - Only show if selected (true or false) */}
                      {shaftConfiguration.zipperExtra !== undefined && (
                        <div className="flex py-3 border-b border-gray-300 items-start">
                          <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                            Zusätzlicher Reißverschluss
                          </div>
                          <div className="flex-1 leading-loose">
                            <ModalCheckbox isSelected={shaftConfiguration.zipperExtra === true} label="Ja (+9.99€)" />
                            <ModalCheckbox isSelected={shaftConfiguration.zipperExtra === false} label="Nein" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Notes - Only show if not empty */}
                  {shaftConfiguration.additionalNotes && shaftConfiguration.additionalNotes.trim() && (
                    <div className="flex py-3 border-b border-gray-300 items-start">
                      <div className="w-[200px] flex-shrink-0 text-sm font-semibold text-slate-800 pr-4 leading-snug">
                        Sonstige Notizen
                      </div>
                      <div className="flex-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {shaftConfiguration.additionalNotes}
                      </div>
                    </div>
                  )}

                  {/* Total Price */}
                  <div style={{ marginTop: '24px', paddingTop: '16px', paddingBottom: '16px', borderTop: '2px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                        Gesamtpreis:
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#22c55e' }}>
                        {displayPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto bg-black py-4 px-10 flex justify-between items-center">
                <span className="text-white text-xs">{footerPhone}</span>
                <span className="text-white text-xs">{footerBusinessName}</span>
                <span className="text-white text-xs">{footerEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* HIDDEN PDF CONTENT (for PDF generation) */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfContentRef} style={{ width: '794px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', minHeight: 'auto', overflow: 'visible' }}>
            {/* Header */}
            <div style={{ padding: '10px 40px 8px 40px', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid #d1d5db' }}>
                <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, aspectRatio: '1/1', overflow: 'hidden' }}>
                  <img src={footerImage || "/images/logo.png"} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '1/1' }} />
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

            {/* Body */}
            <div style={{ padding: '8px 40px 20px 40px', flex: 1, background: '#ffffff', pageBreakInside: 'auto', overflow: 'visible' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Checkliste</div>

              {/* Configuration Details - PDF Version - Show ALL options */}
              <div style={{ marginTop: '16px' }}>
                {/* Kategorie */}
                {shaftConfiguration.customCategory && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Kategorie
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={shaftConfiguration.customCategory === 'Halbschuhe'} label="Halbschuhe" />
                      <PDFCheckbox isSelected={shaftConfiguration.customCategory === 'Stiefel'} label="Stiefel" />
                      <PDFCheckbox isSelected={shaftConfiguration.customCategory === 'Sandalen'} label="Sandalen" />
                      <PDFCheckbox isSelected={shaftConfiguration.customCategory === 'Stiefeletten'} label="Stiefeletten" />
                      {!['Halbschuhe', 'Stiefel', 'Sandalen', 'Stiefeletten'].includes(shaftConfiguration.customCategory) && (
                        <PDFCheckbox isSelected={true} label={shaftConfiguration.customCategory} />
                      )}
                    </div>
                  </div>
                )}
                
                {/* CAD-Modellierung */}
                {shaftConfiguration.cadModeling && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      CAD-Modellierung
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={shaftConfiguration.cadModeling === '1x'} label="1x" />
                      <PDFCheckbox isSelected={shaftConfiguration.cadModeling === '2x'} label="2x (+6.99€)" />
                    </div>
                  </div>
                )}
                
                {/* Ledertyp */}
                {shaftConfiguration.lederType && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Ledertyp
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={shaftConfiguration.lederType} />
                    </div>
                  </div>
                )}
                
                {/* Lederfarbe (single) */}
                {shaftConfiguration.numberOfLeatherColors === '1' && shaftConfiguration.lederfarbe && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Lederfarbe
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={shaftConfiguration.lederfarbe} />
                    </div>
                  </div>
                )}
                
                {/* Anzahl der Ledertypen - Only show selected option */}
                {shaftConfiguration.numberOfLeatherColors && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Anzahl der Ledertypen
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      {shaftConfiguration.numberOfLeatherColors === '1' && (
                        <PDFCheckbox isSelected={true} label="1" />
                      )}
                      {shaftConfiguration.numberOfLeatherColors === '2' && (
                        <PDFCheckbox isSelected={true} label="2" />
                      )}
                      {shaftConfiguration.numberOfLeatherColors === '3' && (
                        <PDFCheckbox isSelected={true} label="3" />
                      )}
                    </div>
                  </div>
                )}

                {/* Multiple leather colors - Only show when 2 or 3 colors selected */}
                {shaftConfiguration.numberOfLeatherColors && shaftConfiguration.numberOfLeatherColors !== '1' && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Lederfarben
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      {shaftConfiguration.leatherColors && shaftConfiguration.leatherColors.length > 0 && (
                        <div style={{ marginLeft: '0', marginTop: '0', fontSize: '11px', color: '#475569' }}>
                          {shaftConfiguration.leatherColors.map((color, idx) => (
                            <div key={idx} style={{ marginBottom: '4px' }}>• Farbe {idx + 1}: {color}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Innenfutter */}
                {shaftConfiguration.innenfutter && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Innenfutter
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={shaftConfiguration.innenfutter} />
                    </div>
                  </div>
                )}
                
                {/* Schafthöhe */}
                {shaftConfiguration.schafthohe && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Schafthöhe
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={`${shaftConfiguration.schafthohe} cm`} />
                    </div>
                  </div>
                )}
                {shaftConfiguration.schafthoheLinks && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Schafthöhe Links
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={`${shaftConfiguration.schafthoheLinks} cm`} />
                    </div>
                  </div>
                )}
                {shaftConfiguration.schafthoheRechts && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Schafthöhe Rechts
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={`${shaftConfiguration.schafthoheRechts} cm`} />
                    </div>
                  </div>
                )}
                
                {/* Umfangmaße */}
                {shaftConfiguration.umfangmasseLinks && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Umfangmaße Links
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={shaftConfiguration.umfangmasseLinks} />
                    </div>
                  </div>
                )}
                {shaftConfiguration.umfangmasseRechts && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Umfangmaße Rechts
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={shaftConfiguration.umfangmasseRechts} />
                    </div>
                  </div>
                )}
                
                {/* Polsterung - Only show selected options */}
                {shaftConfiguration.polsterung && shaftConfiguration.polsterung.length > 0 && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Polsterung
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      {shaftConfiguration.polsterung.map((option) => (
                        <PDFCheckbox key={option} isSelected={true} label={option} />
                      ))}
                    </div>
                  </div>
                )}
                
                {shaftConfiguration.polsterungText && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Polsterung (Hinweise)
                    </div>
                    <div style={{ flex: 1, fontSize: '12px', color: '#475569', paddingTop: '2px' }}>
                      {shaftConfiguration.polsterungText}
                    </div>
                  </div>
                )}
                
                {/* Verstärkungen - Only show selected options */}
                {shaftConfiguration.verstarkungen && shaftConfiguration.verstarkungen.length > 0 && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Verstärkungen
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      {shaftConfiguration.verstarkungen.map((option) => (
                        <PDFCheckbox key={option} isSelected={true} label={option} />
                      ))}
                    </div>
                  </div>
                )}
                
                {shaftConfiguration.verstarkungenText && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Verstärkungen (Hinweise)
                    </div>
                    <div style={{ flex: 1, fontSize: '12px', color: '#475569', paddingTop: '2px' }}>
                      {shaftConfiguration.verstarkungenText}
                    </div>
                  </div>
                )}
                
                {/* Nahtfarbe - Only show selected option */}
                {(shaftConfiguration.nahtfarbe || shaftConfiguration.nahtfarbeOption) && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Nahtfarbe
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={getNahtfarbeDisplayName(shaftConfiguration.nahtfarbe, shaftConfiguration.nahtfarbeOption)} />
                    </div>
                  </div>
                )}
                
                {/* Verschlussart - Only show selected option */}
                {shaftConfiguration.closureType && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Verschlussart
                    </div>
                    <div style={{ flex: 1, lineHeight: 1.8 }}>
                      <PDFCheckbox isSelected={true} label={getClosureTypeDisplayName(shaftConfiguration.closureType)} />
                    </div>
                  </div>
                )}
                
                {/* Add-ons - Only show if at least one is selected */}
                {(shaftConfiguration.passendenSchnursenkel !== undefined || shaftConfiguration.osenEinsetzen !== undefined || shaftConfiguration.zipperExtra !== undefined) && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #d1d5db' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                      Extras
                    </div>
                    {/* Passende Schnürsenkel - Only show if selected (true or false) */}
                    {shaftConfiguration.passendenSchnursenkel !== undefined && (
                      <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                        <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                          Passende Schnürsenkel
                        </div>
                        <div style={{ flex: 1, lineHeight: 1.8 }}>
                          <PDFCheckbox isSelected={shaftConfiguration.passendenSchnursenkel === true} label="Ja (+4.49€)" />
                          <PDFCheckbox isSelected={shaftConfiguration.passendenSchnursenkel === false} label="Nein" />
                        </div>
                      </div>
                    )}
                    {/* Ösen einsetzen - Only show if selected (true or false) */}
                    {shaftConfiguration.osenEinsetzen !== undefined && (
                      <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                        <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                          Ösen einsetzen
                        </div>
                        <div style={{ flex: 1, lineHeight: 1.8 }}>
                          <PDFCheckbox isSelected={shaftConfiguration.osenEinsetzen === true} label="Ja (+8.99€)" />
                          <PDFCheckbox isSelected={shaftConfiguration.osenEinsetzen === false} label="Nein" />
                        </div>
                      </div>
                    )}
                    {/* Zusätzlicher Reißverschluss - Only show if selected (true or false) */}
                    {shaftConfiguration.zipperExtra !== undefined && (
                      <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                        <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                          Zusätzlicher Reißverschluss
                        </div>
                        <div style={{ flex: 1, lineHeight: 1.8 }}>
                          <PDFCheckbox isSelected={shaftConfiguration.zipperExtra === true} label="Ja (+9.99€)" />
                          <PDFCheckbox isSelected={shaftConfiguration.zipperExtra === false} label="Nein" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Notes - Only show if not empty */}
                {shaftConfiguration.additionalNotes && shaftConfiguration.additionalNotes.trim() && (
                  <div style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
                    <div style={{ width: '200px', flexShrink: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', paddingRight: '16px' }}>
                      Sonstige Notizen
                    </div>
                    <div style={{ flex: 1, fontSize: '12px', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {shaftConfiguration.additionalNotes}
                    </div>
                  </div>
                )}

                {/* Total Price */}
                <div className="pdf-page-break-avoid pdf-total-price-section" style={{ 
                  marginTop: '24px', 
                  marginBottom: '20px', // Reduced from 60px to prevent extra page
                  paddingTop: '20px', 
                  paddingBottom: '20px',
                  borderTop: '3px solid #000000', 
                  pageBreakInside: 'avoid',
                  pageBreakAfter: 'avoid', // Prevent page break after this section
                  backgroundColor: '#ffffff',
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'visible'
                }}>
                  <table style={{ 
                    width: 'auto', 
                    borderCollapse: 'collapse'
                  }}>
                    <tbody>
                      <tr>
                        <td style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#000000',
                          fontFamily: 'Arial, sans-serif',
                          padding: '0 30px 0 0',
                          textAlign: 'left',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}>
                          Gesamtpreis:
                        </td>
                        <td 
                          className="pdf-price-value"
                          style={{ 
                            fontSize: '22px', 
                            fontWeight: 'bold', 
                            color: '#000000',
                            fontFamily: 'Arial, sans-serif',
                            padding: '0',
                            textAlign: 'left',
                            verticalAlign: 'middle',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {displayPrice}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer placeholder */}
            <div className="pdf-info-footer" style={{ marginTop: 'auto', backgroundColor: '#000000', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>{footerPhone}</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>{footerBusinessName}</span>
              <span style={{ color: '#ffffff', fontSize: '12px' }}>{footerEmail}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-6 border-t border-slate-200 bg-white z-10 sticky bottom-0 left-0 right-0">
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:pt-4">
            {/* Zurück button - hidden on mobile */}
            <button 
              className="hidden md:block py-3 md:py-4 px-8 md:px-14 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50" 
              onClick={onClose}
            >
              Zurück
            </button>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              {/* Download button */}
              <button 
                className="py-3 md:py-4 px-6 md:px-10 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium cursor-pointer transition-colors hover:bg-slate-50 flex items-center justify-center gap-2 w-full sm:w-auto" 
                onClick={handleDownloadPDF}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10m9.333-4L8 9.333 4.667 6M8 2v7.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="hidden sm:inline">PDF Prüfen</span>
                <span className="sm:hidden">Download</span>
              </button>
              
              {/* Abschließen button */}
              <button 
                className="py-3 md:py-4 px-6 md:px-10 rounded-lg bg-[#36a866] text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-[#2e8b5e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto" 
                onClick={handleAbschließen}
                disabled={isAbschließenLoading}
              >
                {isAbschließenLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default ShaftPDFPopup
