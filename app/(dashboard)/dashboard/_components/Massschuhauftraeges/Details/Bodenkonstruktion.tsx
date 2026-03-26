"use client"
import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { GROUPS2, shoe2 } from "./ShoeData"
import PDFPopup, { OrderDataForPDF } from "./PDFPopup"
import CompletionPopUp from "./Completion-PopUp"
import { FaArrowLeft } from "react-icons/fa"
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder"
import { 
    sendMassschuheOrderToAdmin2, 
    sendMassschuheOrderToAdmin3, 
    sendMassschuheCustomShaftOrderToAdmin2 
} from "@/apis/MassschuheManagemantApis"
import { createMassschuheWithoutOrderId, createMassschuheWithoutOrderIdWithoutCustomModels } from "@/apis/MassschuheAddedApis"
import { useCustomShaftData } from "@/contexts/CustomShaftDataContext"
import toast from "react-hot-toast"

// Types
import type { OptionInputsState, TextAreasState } from "./Bodenkonstruktion/types"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"
import type { HeelWidthAdjustmentData, SoleElevationData, VorderkappeSideData, RahmenData, SohlenhoeheDifferenziertData, HinterkappeMusterSideData, HinterkappeSideData, BrandsohleSideData } from "./Bodenkonstruktion/FormFields"

// Components
import ProductHeader from "./Bodenkonstruktion/ProductHeader"
import SoleSelectionSection from "./Bodenkonstruktion/SoleSelectionSection"
import ChecklistSection from "./Bodenkonstruktion/ChecklistSection"
import SoleSelectionModal from "./Bodenkonstruktion/modals/SoleSelectionModal"
import SoleDetailModal from "./Bodenkonstruktion/modals/SoleDetailModal"
import AbsatzFormModal from "./Bodenkonstruktion/modals/AbsatzFormModal"

// Hooks
import { useSoleData } from "@/hooks/massschuhe/useSoleData"
import { useBodenkonstruktionCalculations } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"
import { useDeliveryDateByCategory } from "@/hooks/useDeliveryDateByCategory"

// Utils
import { prepareOrderDataForPDF, parseEuroFromText } from "./HelperFunctions"
import StickyPriceSummary from "@/components/StickyPriceSummary/StickyPriceSummary"
import { buildUmfangmasseWithTitles } from "@/utils/customShoeOrderHelpers"
import { useSingleCustomShaft } from "@/hooks/customShafts/useSingleCustomShaft"

interface BodenkonstruktionProps {
    orderId?: string | null
    /** When coming from custom-shafts (product card), product ID for header image */
    productId?: string | null
}

export default function Bodenkonstruktion({ orderId, productId }: BodenkonstruktionProps) {
    const router = useRouter()
    
    // Custom shaft data context
    const { customShaftData: contextData, clearCustomShaftData } = useCustomShaftData()
    
    // Form states
    const [selected, setSelected] = useState<SelectedState>({ hinterkappe: "kunststoff" })
    const [optionInputs, setOptionInputs] = useState<OptionInputsState>({})
    const [textAreas, setTextAreas] = useState<TextAreasState>({
        besondere_hinweise: "",
    })
    const [heelWidthAdjustment, setHeelWidthAdjustment] = useState<HeelWidthAdjustmentData | null>(null)
    const [soleElevation, setSoleElevation] = useState<SoleElevationData | null>(null)
    const [vorderkappeSide, setVorderkappeSide] = useState<VorderkappeSideData | null>(null)
    const [rahmen, setRahmen] = useState<RahmenData | null>(null)
    const [sohlenhoeheDifferenziert, setSohlenhoeheDifferenziert] = useState<SohlenhoeheDifferenziertData | null>(null)
    const [hinterkappeMusterSide, setHinterkappeMusterSide] = useState<HinterkappeMusterSideData | null>(null)
    const [hinterkappeSide, setHinterkappeSide] = useState<HinterkappeSideData | null>(null)
    const [brandsohleSide, setBrandsohleSide] = useState<BrandsohleSideData | null>(null)
    
    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [showModal2, setShowModal2] = useState(false)
    const [checkboxError, setCheckboxError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isWeiterLoading, setIsWeiterLoading] = useState(false)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
    
    // Store custom shaft data for later API call (synced from context when landing from redirect)
    const [customShaftData, setCustomShaftData] = useState<any>(null)
    const [isCustomOrder, setIsCustomOrder] = useState(false)
    
    // Sole selection states
    const [selectedSole, setSelectedSole] = useState<SoleType | null>(null)
    const [showSoleModal, setShowSoleModal] = useState(false)
    const [showSoleDetailModal, setShowSoleDetailModal] = useState(false)
    const [selectedSoleForDetail, setSelectedSoleForDetail] = useState<SoleType | null>(null)
    
    // Sole id "4" specific options
    const [sole4Thickness, setSole4Thickness] = useState<string | null>(null) // "4mm" or "6mm"
    const [sole4Color, setSole4Color] = useState<string | null>(null) // "Schwarz", "Dunkelbraun", or "Weiss"
    
    // Sole id "5" specific options
    const [sole5Thickness, setSole5Thickness] = useState<string | null>(null) // "4mm" or "6mm"
    const [sole5Color, setSole5Color] = useState<string | null>(null) // "Schwarz", "Dunkelbraun", or "Weiss"
    
    // Sole id "6" specific options
    const [sole6Thickness, setSole6Thickness] = useState<string | null>(null) // "4mm" or "6mm"
    const [sole6Color, setSole6Color] = useState<string | null>(null) // "Schwarz", "Dunkelbraun", or "Weiss"
    
    // Absatz Form popup states
    const [showAbsatzFormModal, setShowAbsatzFormModal] = useState(false)
    const [selectedAbsatzForm, setSelectedAbsatzForm] = useState<string | null>(null)

    // Hooks
    const { soleOptions } = useSoleData()
    const { order } = useGetSingleMassschuheOrder(orderId ?? null)
    const { deliveryDate: deliveryDateKomplettfertigung } = useDeliveryDateByCategory('Komplettfertigung')
    const { data: productById } = useSingleCustomShaft(productId || '')
    // Product image: collection product image | custom uploaded image (product-order) | API by productId
    const productImageUrl = contextData?.productImage ?? contextData?.uploadedImage ?? (productId && productById?.data?.image) ?? null

    // Prepare order data for PDF (this page always shows Komplettfertigung delivery date when from redirect)
    const orderDataForPDF: OrderDataForPDF = useMemo(() => {
        let base: OrderDataForPDF
        // If no orderId, use context data (custom order from Step 1 / redirect)
        if (!orderId && contextData) {
            const { getOrderNumber, getDeliveryDate } = require('@/utils/customShoeOrderHelpers')
            base = {
                customerName: contextData.customerName || contextData.other_customer_name || 'Kunde',
                orderNumber: getOrderNumber(),
                deliveryDate: getDeliveryDate(),
                productName: contextData.productDescription || 'Custom Made #1000',
                totalPrice: contextData.totalPrice || 0,
            }
        } else {
            base = prepareOrderDataForPDF(order)
        }
        return {
            ...base,
            deliveryDate: deliveryDateKomplettfertigung ?? base.deliveryDate,
        }
    }, [order, orderId, contextData, deliveryDateKomplettfertigung])

    // Determine base price: use custom shaft price if available, otherwise use order price
    // Always add default value of 189 to the base price
    const basePrice = useMemo(() => {
        const DEFAULT_BASE_PRICE = 189
        let additionalPrice = 0
        
        // If custom shaft data exists and has totalPrice, use it
        if (contextData && contextData.totalPrice) {
            additionalPrice = contextData.totalPrice
        } else {
            // Otherwise use order total price
            additionalPrice = orderDataForPDF.totalPrice || 0
        }
        
        // Return default 189 + additional prices
        return DEFAULT_BASE_PRICE + additionalPrice
    }, [contextData, orderDataForPDF.totalPrice])

    // Calculations - use basePrice which includes shaft price (hinterkappeSide for Leder options price)
    const { grandTotal } = useBodenkonstruktionCalculations(selected, basePrice, rahmen, hinterkappeMusterSide, hinterkappeSide, brandsohleSide, vorderkappeSide)

    // Sync contextData to customShaftData when landing from redirect (so payload has full data)
    React.useEffect(() => {
        if (contextData) {
            setCustomShaftData(contextData)
            setIsCustomOrder(!!contextData.uploadedImage)
        }
    }, [contextData])

    // Reset sole id "4", "5", and "6" options when sole changes
    React.useEffect(() => {
        if (selectedSole?.id !== "4") {
            setSole4Thickness(null)
            setSole4Color(null)
        }
        if (selectedSole?.id !== "5") {
            setSole5Thickness(null)
            setSole5Color(null)
        }
        if (selectedSole?.id !== "6") {
            setSole6Thickness(null)
            setSole6Color(null)
        }
    }, [selectedSole?.id])

    // Auto-deselect options based on selected sole:
    // - When sole id "1" is selected: deselect Keilabsatz and Stegkeil (absatzform)
    // - When sole id "2" or "3" is selected: deselect Absatzkeil (absatzform)
    // - When sole id "8" is selected: deselect Stegkeil and Absatzkeil (absatzform)
    // - When sole id "9", "10", "11", or "12" is selected: deselect Keilabsatz and Stegkeil (absatzform), deselect Absatzrolle (abrollhilfe)
    React.useEffect(() => {
        // Handle absatzform field
        if (selected.absatzform) {
            const absatzformValue = selected.absatzform
            let shouldDeselect = false
            
            if (selectedSole?.id === "1" && (absatzformValue === "Keilabsatz" || absatzformValue === "Stegkeil")) {
                shouldDeselect = true
            } else if ((selectedSole?.id === "2" || selectedSole?.id === "3") && absatzformValue === "Absatzkeil") {
                shouldDeselect = true
            } else if (selectedSole?.id === "8" && (absatzformValue === "Stegkeil" || absatzformValue === "Absatzkeil")) {
                shouldDeselect = true
            } else if ((selectedSole?.id === "9" || selectedSole?.id === "10" || selectedSole?.id === "11" || selectedSole?.id === "12") && (absatzformValue === "Keilabsatz" || absatzformValue === "Stegkeil")) {
                shouldDeselect = true
            }
            
            if (shouldDeselect) {
                setSelected((prev) => ({
                    ...prev,
                    absatzform: null
                }))
            }
        }
        
        // Handle abrollhilfe field (multi-select)
        if (selected.abrollhilfe && (selectedSole?.id === "9" || selectedSole?.id === "10" || selectedSole?.id === "11" || selectedSole?.id === "12")) {
            const abrollhilfeValue = selected.abrollhilfe
            const isArray = Array.isArray(abrollhilfeValue)
            const currentArray = isArray ? abrollhilfeValue : [abrollhilfeValue]
            
            // Remove "abzezzolle" (Absatzrolle) if it's selected
            if (currentArray.includes("abzezzolle")) {
                const filteredArray = currentArray.filter((id: string) => id !== "abzezzolle")
                setSelected((prev) => ({
                    ...prev,
                    abrollhilfe: filteredArray.length > 0 ? filteredArray : null
                }))
            }
        }
    }, [selectedSole?.id, selected.absatzform, selected.abrollhilfe])

    // Handlers
    const setGroup = (groupId: string, optId: string | null) => {
        const group = GROUPS2.find(g => g.id === groupId)
        
        // Handle multi-select fields
        if (group?.multiSelect) {
            setSelected((prev) => {
                const currentValue = prev[groupId]
                const currentArray = Array.isArray(currentValue) ? currentValue : (currentValue ? [currentValue] : [])
                
                if (optId === null) {
                    return { ...prev, [groupId]: null }
                }
                
                // Toggle: if already selected, remove it; otherwise add it
                if (currentArray.includes(optId)) {
                    const newArray = currentArray.filter(id => id !== optId)
                    return { ...prev, [groupId]: newArray.length > 0 ? newArray : null }
                } else {
                    return { ...prev, [groupId]: [...currentArray, optId] }
                }
            })
        } else {
            // Single select
            setSelected((prev) => ({ ...prev, [groupId]: optId }))
            if (groupId === "hinterkappe" && optId !== "leder") {
                setSelected((prev) => ({ ...prev, hinterkappe_sub: null }))
            }
        }
    }

    const setHinterkappeSub = (optId: string | null) => {
        setSelected((prev) => ({ ...prev, hinterkappe_sub: optId }))
    }

    const requiredCheckboxGroups = useMemo(
        () => GROUPS2.filter(g => !g.fieldType || g.fieldType === "checkbox"),
        []
    )

    const isAllCheckboxAnswered = requiredCheckboxGroups.every(g => {
        const sel = selected[g.id]
        if (g.multiSelect) {
            // For multi-select, check if array exists and has at least one item
            return Array.isArray(sel) ? sel.length > 0 : false
        }
        return sel !== undefined && sel !== null && sel !== ""
    })

    const handleWeiterClick = async () => {
        if (!isAllCheckboxAnswered) {
            setCheckboxError(true)
            return
        }
        setCheckboxError(false)
        
        // Validate Brandsohle (mode + at least one option when mode is selected)
        if (brandsohleSide?.mode) {
            const hasSame = (brandsohleSide.sameValues?.length ?? 0) > 0
            const hasLeft = (brandsohleSide.leftValues?.length ?? 0) > 0
            const hasRight = (brandsohleSide.rightValues?.length ?? 0) > 0
            const valid = (brandsohleSide.mode === "gleich" && hasSame) || (brandsohleSide.mode === "unterschiedlich" && (hasLeft || hasRight))
            if (!valid) {
                toast.error("Bitte wählen Sie mindestens eine Brandsohle-Option aus.")
                return
            }
        }
        
        // Validate sole id "4" required fields
        if (selectedSole?.id === "4") {
            if (!sole4Thickness || !sole4Color) {
                toast.error("Bitte wählen Sie Sohlenstärke und Farbe für die ausgewählte Sohle aus.")
                return
            }
        }
        
        // Validate sole id "5" required fields
        if (selectedSole?.id === "5") {
            if (!sole5Thickness || !sole5Color) {
                toast.error("Bitte wählen Sie Sohlenstärke und Farbe für die ausgewählte Sohle aus.")
                return
            }
        }
        
        // Validate sole id "6" required fields
        if (selectedSole?.id === "6") {
            if (!sole6Thickness || !sole6Color) {
                toast.error("Bitte wählen Sie Sohlenstärke und Farbe für die ausgewählte Sohle aus.")
                return
            }
        }

        setIsWeiterLoading(true)
        try {
            // Check if custom shaft data exists in context (from Step 1: Schafterstellung)
            // This applies to both new orders (no orderId) and existing orders (with orderId)
            if (contextData) {
                // Store custom shaft data for later API call (when user clicks "Verbindlich bestellen")
                const hasUploadedImage = !!contextData.uploadedImage
                setCustomShaftData(contextData)
                setIsCustomOrder(hasUploadedImage)
            }
            
            // Show PDF modal (same for both custom and normal flow)
            setShowModal(true)
            localStorage.setItem("currentBalance", String(grandTotal.toFixed(2)))
        } finally {
            // Keep loading state briefly to show spinner, then reset when modal opens
            setTimeout(() => {
                setIsWeiterLoading(false)
            }, 300)
        }
    }

    const handleAbsatzFormClick = (groupId: string, optionId: string) => {
        setSelectedAbsatzForm(optionId)
        setShowAbsatzFormModal(true)
        setGroup(groupId, optionId)
    }

    const handleTextAreaChange = (key: string, value: string) => {
        setTextAreas((prev) => ({ ...prev, [key]: value }))
    }

    // Helper function to convert selected value to string
    const getSelectedValue = (value: string | string[] | null | undefined): string | null => {
        if (!value) return null
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(',') : null
        }
        return value
    }

    // Prepare Massschafterstellung_json1 from custom shaft data
    const prepareMassschafterstellungJson1 = (customShaftData: any) => {
        const json: any = {
            kategorie: customShaftData.customCategory || null,
            ledertyp: customShaftData.lederType || null,
            ledertypen_definieren: {},
            anzahl_der_ledertypen: customShaftData.numberOfLeatherColors || null,
            Innenfutter: customShaftData.innenfutter || null,
            lederfarbe: customShaftData.numberOfLeatherColors === '1' ? customShaftData.lederfarbe : null,
            schafthöhe: customShaftData.schafthohe || null,
            schafthoheLinks: customShaftData.schafthoheLinks || customShaftData.schafthohe_links || null,
            schafthoheRechts: customShaftData.schafthoheRechts || customShaftData.schafthohe_rechts || null,
            umfangmasseLinks: customShaftData.umfangmasseLinks || customShaftData.umfangmasse_links || null,
            umfangmasseRechts: customShaftData.umfangmasseRechts || customShaftData.umfangmasse_rechts || null,
            umfangmasse_links: buildUmfangmasseWithTitles(
                customShaftData.knoechelumfangLinks,
                customShaftData.umfangBei14Links,
                customShaftData.umfangBei16Links,
                customShaftData.umfangBei18Links
            ),
            umfangmasse_rechts: buildUmfangmasseWithTitles(
                customShaftData.knoechelumfangRechts,
                customShaftData.umfangBei14Rechts,
                customShaftData.umfangBei16Rechts,
                customShaftData.umfangBei18Rechts
            ),
            polsterung: customShaftData.polsterung?.join(',') || null,
            polsterung_text: customShaftData.polsterung_text || null,
            verstärkungen: customShaftData.verstarkungen?.join(',') || null,
            verstarkungen_text: customShaftData.verstarkungen_text || customShaftData.verstarkungen_text || null,
            nahtfarbe: customShaftData.nahtfarbe || null,
            nahtfarbe_text: customShaftData.nahtfarbe_text || null,
            verschlussart: customShaftData.closureType || null,
            moechten_sie_passende_schnuersenkel_zum_schuh: customShaftData.passenden_schnursenkel || null,
            moechten_sie_passende_schnuersenkel_zum_schuh_price: customShaftData.moechten_sie_passende_schnuersenkel_zum_schuh_price || null,
            moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen: customShaftData.osen_einsetzen || null,
            moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: customShaftData.moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price || null,
            moechten_sie_einen_zusaetzlichen_reissverschluss: customShaftData.zipper_extra || null,
            moechten_sie_einen_zusaetzlichen_reissverschluss_price: customShaftData.moechten_sie_einen_zusaetzlichen_reissverschluss_price || null,
            cadModeling: customShaftData.cadModeling || null,
            cadModeling_2x_price: customShaftData.cadModeling_2x_price || null,
            additionalNotes: customShaftData.additionalNotes || null,
        }

        // Add business address (Leisten abholen) if present
        if (customShaftData.isAbholung && customShaftData.businessAddress) {
            json.abholung = true
            json.abholung_price = customShaftData.businessAddress.price || 13
            json.business_companyName = customShaftData.businessAddress.companyName || null
            json.business_address = customShaftData.businessAddress.address || null
            json.business_phone = customShaftData.businessAddress.phone || null
            json.business_email = customShaftData.businessAddress.email || null
        }

        // Add leather types definition if multiple colors
        if (customShaftData.numberOfLeatherColors === '2' || customShaftData.numberOfLeatherColors === '3') {
            const ledertypenDefinieren: any = {}
            
            customShaftData.leatherColors?.forEach((color: string, index: number) => {
                ledertypenDefinieren[`leatherColor_${index + 1}`] = color
            })
            
            // Add assignments
            if (customShaftData.leatherColorAssignments) {
                ledertypenDefinieren.assignments = customShaftData.leatherColorAssignments
            }
            
            json.ledertypen_definieren = ledertypenDefinieren
        }

        return json
    }

    // Helper function to convert base64/URL to File
    const convertImageToFile = async (imageString: string, fileName: string = 'custom_model.png'): Promise<File | null> => {
        try {
            if (!imageString) return null
            
            // If it's a base64 data URL
            if (imageString.startsWith('data:')) {
                const response = await fetch(imageString)
                const blob = await response.blob()
                return new File([blob], fileName, { type: blob.type })
            }
            
            // If it's a regular URL (http/https)
            if (imageString.startsWith('http')) {
                const response = await fetch(imageString)
                if (response.ok) {
                    const blob = await response.blob()
                    return new File([blob], fileName, { type: blob.type })
                }
            }
            
            // If it's a local path (starts with /)
            if (imageString.startsWith('/')) {
                const response = await fetch(imageString)
                if (response.ok) {
                    const blob = await response.blob()
                    return new File([blob], fileName, { type: blob.type })
                }
            }
            
            return null
        } catch (error) {
            return null
        }
    }

    // Prepare Massschafterstellung_json2 with sole-specific fields
    const prepareMassschafterstellungJson2WithSoleFields = () => {
        const json = prepareMassschafterstellungJson2()
        
        // Add sole specific fields
        if (selectedSole?.id === "4") {
            json.sole4_thickness = sole4Thickness || ""
            json.sole4_color = sole4Color || ""
        }
        if (selectedSole?.id === "5") {
            json.sole5_thickness = sole5Thickness || ""
            json.sole5_color = sole5Color || ""
        }
        if (selectedSole?.id === "6") {
            json.sole6_thickness = sole6Thickness || ""
            json.sole6_color = sole6Color || ""
        }
        
        return removeNulls(json)
    }

    // Prepare form data for Admin2 API (custom shaft + Bodenkonstruktion)
    const prepareFormDataForAdmin2 = async (customShaftData: any, bodenPdfBlob: Blob | null = null): Promise<{ formData: FormData; isCustomOrder: boolean }> => {
        const { prepareStep2FormData } = require('@/utils/customShoeOrderHelpers')
        
        // Prepare Massschafterstellung_json2 (Bodenkonstruktion data)
        const massschafterstellungJson2 = prepareMassschafterstellungJson2WithSoleFields()
        
        // Get the shaft PDF from context (stored in Step 1)
        const shaftPdfBlob = customShaftData.shaftPdfBlob || null
        
        // Use helper to prepare complete form data
        // Pass BOTH PDFs: shaft PDF and bodenkonstruktion PDF
        const formData = await prepareStep2FormData(
            customShaftData,
            massschafterstellungJson2,
            selectedSole?.image || null,
            bodenPdfBlob  // This is the bodenkonstruktion PDF
        )
        
        // CRITICAL: Replace the PDF attachments with correct ones
        // - invoice = shaft PDF (from Step 1)
        // - invoice2 = bodenkonstruktion PDF (from Step 2)
        
        // Remove any existing invoice attachments first
        // Note: FormData doesn't have a direct delete method, so we'll append the correct ones
        // The backend should handle multiple files with the same key by taking the last one
        
        if (shaftPdfBlob) {
            console.log('📎 Adding shaft PDF as invoice:', shaftPdfBlob.size, 'bytes')
            formData.set('invoice', shaftPdfBlob, 'shaft_invoice.pdf')
        } else {
            console.warn('⚠️ No shaft PDF found in context')
        }
        
        if (bodenPdfBlob) {
            console.log('📎 Adding bodenkonstruktion PDF as invoice2:', bodenPdfBlob.size, 'bytes')
            formData.set('invoice2', bodenPdfBlob, 'boden_invoice.pdf')
        } else {
            console.warn('⚠️ No bodenkonstruktion PDF provided')
        }
        
        // Add sole specific fields to form data (for backward compatibility)
        if (selectedSole?.id === "4") {
            if (sole4Thickness) formData.append('sole4_thickness', sole4Thickness)
            if (sole4Color) formData.append('sole4_color', sole4Color)
        }
        if (selectedSole?.id === "5") {
            if (sole5Thickness) formData.append('sole5_thickness', sole5Thickness)
            if (sole5Color) formData.append('sole5_color', sole5Color)
        }
        if (selectedSole?.id === "6") {
            if (sole6Thickness) formData.append('sole6_thickness', sole6Thickness)
            if (sole6Color) formData.append('sole6_color', sole6Color)
        }
        
        // Update total price with Bodenkonstruktion additions
        formData.set('totalPrice', grandTotal.toFixed(2))
        
        // Detect if it's a custom order
        const isCustomOrder = !!customShaftData.uploadedImage
        
        return { formData, isCustomOrder }
    }

    // DEPRECATED: Old implementation kept for reference - will be removed
    const prepareFormDataForAdmin2_OLD = async (customShaftData: any, pdfBlobData: Blob | null = null): Promise<{ formData: FormData; isCustomOrder: boolean }> => {
        const formData = new FormData()
        
        // Add customer info (for orders without orderId)
        if (customShaftData.customerId) {
            formData.append('customerId', customShaftData.customerId)
        } else if (customShaftData.other_customer_name) {
            formData.append('other_customer_name', customShaftData.other_customer_name)
        }
        
        // Add PDF invoices if available
        if (pdfBlobData) {
            formData.append('invoice', pdfBlobData, 'invoice.pdf')
            formData.append('invoice2', pdfBlobData, 'invoice2.pdf')
        }
        
        // Detect if it's a custom order (user uploaded their own image) or from collection
        const isCustomOrder = !!customShaftData.uploadedImage

        // Try to get files from order data if available
        const orderAny = order as any
        if (orderAny?.threed_model_right || orderAny?.image3d_1) {
            const fileUrl = orderAny.threed_model_right || orderAny.image3d_1
            if (fileUrl) {
                formData.append('image3d_1', fileUrl)
            }
        }
        if (orderAny?.threed_model_left || orderAny?.image3d_2) {
            const fileUrl = orderAny.threed_model_left || orderAny.image3d_2
            if (fileUrl) {
                formData.append('image3d_2', fileUrl)
            }
        }

        // Add custom models image as File (convert from base64/URL) - only for custom orders
        if (isCustomOrder && customShaftData.uploadedImage) {
            const imageFile = await convertImageToFile(customShaftData.uploadedImage, 'custom_model.png')
            if (imageFile) {
                formData.append('custom_models_image', imageFile)
            }
        }
        
        // Add zipper_image if exists
        if (customShaftData.zipperImage) {
            const zipperImageFile = await convertImageToFile(customShaftData.zipperImage, 'zipper_image.png')
            if (zipperImageFile) {
                formData.append('zipper_image', zipperImageFile)
            }
        }
        
        // Add paintImage if exists
        if (customShaftData.paintImage) {
            const paintImageFile = await convertImageToFile(customShaftData.paintImage, 'paint_image.png')
            if (paintImageFile) {
                formData.append('paintImage', paintImageFile)
            }
        }
        
        // Add custom models fields (only for custom orders)
        if (isCustomOrder) {
            if (customShaftData.customCategoryPrice !== null && customShaftData.customCategoryPrice !== undefined) {
                formData.append('custom_models_price', customShaftData.customCategoryPrice.toString())
            }
            if (customShaftData.closureType) {
                formData.append('custom_models_verschlussart', customShaftData.closureType)
            }
            if (customShaftData.productDescription) {
                formData.append('custom_models_description', customShaftData.productDescription)
            }
            if (customShaftData.productDescription) {
                formData.append('custom_models_name', customShaftData.productDescription)
            }
        }

        // Add mabschaftKollektionId ONLY if it's NOT a custom order (from existing collection)
        if (!isCustomOrder && customShaftData.mabschaftKollektionId) {
            formData.append('mabschaftKollektionId', customShaftData.mabschaftKollektionId)
        }

        // Add Massschafterstellung_json1
        const massschafterstellungJson1 = prepareMassschafterstellungJson1(customShaftData)
        formData.append('Massschafterstellung_json1', JSON.stringify(massschafterstellungJson1))

        // Add Massschafterstellung_json2 (Bodenkonstruktion data) - shared builder, no nulls, all prices
        const massschafterstellungJson2 = prepareMassschafterstellungJson2()
        formData.append('Massschafterstellung_json2', JSON.stringify(massschafterstellungJson2))

        // Add staticImage (selectedSole image - this is Mehr_ansehen image) as File
        if (selectedSole?.image) {
            const staticImageFile = await convertImageToFile(selectedSole.image, 'sole_image.png')
            if (staticImageFile) {
                formData.append('staticImage', staticImageFile)
            } else {
                // Fallback: send as string if conversion fails
                formData.append('staticImage', selectedSole.image)
            }
        }

        // Add business address if present
        if (customShaftData.isAbholung && customShaftData.businessAddress) {
            const addr = customShaftData.businessAddress
            formData.append('abholung', 'true')
            formData.append('abholung_price', addr.price?.toString() || '13.0')
            formData.append('business_companyName', addr.companyName || '')
            formData.append('business_address', addr.address || '')
            if (addr.phone) formData.append('business_phone', addr.phone)
            if (addr.email) formData.append('business_email', addr.email)
        }

        // Add CAD modeling
        if (customShaftData.cadModeling) {
            formData.append('cadModeling', customShaftData.cadModeling)
            if (customShaftData.cadModeling === '2x' && customShaftData.cadModeling_2x_price) {
                formData.append('cadModeling_2x_price', customShaftData.cadModeling_2x_price.toString())
            }
        }

        // Add total price (combined from customShaftData and Bodenkonstruktion)
        formData.append('totalPrice', grandTotal.toFixed(2))

        // Add sole specific fields if selected
        if (selectedSole?.id === "4") {
            if (sole4Thickness) formData.append('sole4_thickness', sole4Thickness)
            if (sole4Color) formData.append('sole4_color', sole4Color)
        }
        if (selectedSole?.id === "5") {
            if (sole5Thickness) formData.append('sole5_thickness', sole5Thickness)
            if (sole5Color) formData.append('sole5_color', sole5Color)
        }
        if (selectedSole?.id === "6") {
            if (sole6Thickness) formData.append('sole6_thickness', sole6Thickness)
            if (sole6Color) formData.append('sole6_color', sole6Color)
        }

        return { formData, isCustomOrder }
    }

    // Helper function to get price for an option
    const getOptionPrice = (groupId: string, optionId: string | null): number => {
        if (!optionId) return 0
        
        const group = GROUPS2.find(g => g.id === groupId)
        if (!group) return 0
        
        const option = group.options.find(opt => opt.id === optionId)
        if (!option) return 0
        
        return parseEuroFromText(option.label)
    }

    // Helper function to get sub-option price
    const getSubOptionPrice = (groupId: string, subOptionId: string | null): number => {
        if (!subOptionId) return 0
        
        const group = GROUPS2.find(g => g.id === groupId)
        if (!group || !group.subOptions?.leder) return 0
        
        const subOption = group.subOptions.leder.find(opt => opt.id === subOptionId)
        return subOption?.price || 0
    }

    // Helper to get option label by id (for human-readable JSON)
    const getOptionLabel = (groupId: string, optionId: string | null): string => {
        if (!optionId) return ""
        const group = GROUPS2.find(g => g.id === groupId)
        const option = group?.options?.find((o: { id: string; label: string }) => o.id === optionId)
        return (option as { label: string } | undefined)?.label ?? optionId
    }

    // Helper to get sub-option (leder) label by id
    const getSubOptionLabel = (groupId: string, subOptionId: string | null): string => {
        if (!subOptionId) return ""
        const group = GROUPS2.find(g => g.id === groupId)
        const subOption = group?.subOptions?.leder?.find((o: { id: string; label: string }) => o.id === subOptionId)
        return (subOption as { label: string } | undefined)?.label ?? subOptionId
    }

    // Helper to remove null from payload
    const removeNulls = (obj: any): any => {
        if (obj === null) return ""
        if (Array.isArray(obj)) return obj.map(removeNulls)
        if (typeof obj === "object") {
            const cleaned: any = {}
            for (const [k, v] of Object.entries(obj)) {
                const val = removeNulls(v)
                if (val !== undefined) cleaned[k] = val
            }
            return cleaned
        }
        return obj
    }

    // Prepare Massschafterstellung_json2 (Bodenkonstruktion data) - full structure so all conditional data is in payload
    const prepareMassschafterstellungJson2 = () => {
        const json: any = {
            "Mehr_ansehen_title": selectedSole?.name || "",
            "Mehr_ansehen_description": selectedSole?.description || "",
            "hinterkappe_muster": {
                mode: hinterkappeMusterSide?.mode ?? "",
                sameValue: hinterkappeMusterSide?.sameValue ?? "",
                leftValue: hinterkappeMusterSide?.leftValue ?? "",
                rightValue: hinterkappeMusterSide?.rightValue ?? "",
                musterErstellung: hinterkappeMusterSide?.musterErstellung ?? "",
                musterart: hinterkappeMusterSide?.musterart ?? "",
                samePrice: hinterkappeMusterSide?.mode === "gleich" ? (hinterkappeMusterSide?.sameValue === "ja" ? 4.99 : 0) : 0,
                leftPrice: hinterkappeMusterSide?.mode === "unterschiedlich" ? (hinterkappeMusterSide?.leftValue === "ja" ? 2.49 : 0) : 0,
                rightPrice: hinterkappeMusterSide?.mode === "unterschiedlich" ? (hinterkappeMusterSide?.rightValue === "ja" ? 2.49 : 0) : 0,
            },
            "hinterkappe": hinterkappeSide && hinterkappeSide.mode ? {
                mode: hinterkappeSide.mode,
                sameValue: hinterkappeSide.sameValue ?? "",
                sameSubValue: hinterkappeSide.sameSubValue ?? "",
                leftValue: hinterkappeSide.leftValue ?? "",
                leftSubValue: hinterkappeSide.leftSubValue ?? "",
                rightValue: hinterkappeSide.rightValue ?? "",
                rightSubValue: hinterkappeSide.rightSubValue ?? "",
            } : (getSelectedValue(selected.hinterkappe) || ""),
            "Hinterkappe": hinterkappeSide && hinterkappeSide.mode ? (hinterkappeSide.mode === "gleich" ? (hinterkappeSide.sameValue || "") : ([hinterkappeSide.leftValue, hinterkappeSide.rightValue].filter(Boolean).join(",") || "")) : (getSelectedValue(selected.hinterkappe) || ""),
            "leder_auswahl": "",
            "leder_auswahl_price": 0.0,
            "leder_auswahl_links": "",
            "leder_auswahl_links_price": 0.0,
            "leder_auswahl_rechts": "",
            "leder_auswahl_rechts_price": 0.0,
            "vorderkappe": {
                mode: vorderkappeSide?.mode ?? "",
                sameMaterial: vorderkappeSide?.sameMaterial ?? "",
                leftMaterial: vorderkappeSide?.leftMaterial ?? "",
                rightMaterial: vorderkappeSide?.rightMaterial ?? "",
                laenge: vorderkappeSide?.laenge ?? "",
            },
            "rahmen": {
                type: rahmen?.type ?? "",
                color: rahmen?.color ?? "",
            },
            "Rahmenfarbe": rahmen?.color || "",
            "sohlenhoehe_differenziert": {
                ferse: sohlenhoeheDifferenziert?.ferse ?? 0,
                ballen: sohlenhoeheDifferenziert?.ballen ?? 0,
                spitze: sohlenhoeheDifferenziert?.spitze ?? 0,
            },
            "Verbindungsleder": getSelectedValue(selected.verbindungsleder) || "",
            "Konstruktionsart": getSelectedValue(selected.Konstruktionsart) || "",
            "Konstruktionsart_price": 0.0,
            "brandsohle": getSelectedValue(selected.brandsohle) || "",
            "brandsohle_price": 0.0,
            "Seite_wählen": brandsohleSide?.mode || "",
            "brandsohleSide": {
                mode: brandsohleSide?.mode ?? "",
                sameValues: brandsohleSide?.sameValues ?? [],
                leftValues: brandsohleSide?.leftValues ?? [],
                rightValues: brandsohleSide?.rightValues ?? [],
                korkEnabled: Boolean(brandsohleSide?.korkEnabled),
                korkPosition: brandsohleSide?.korkPosition ?? "",
                korkDicke: brandsohleSide?.korkDicke ?? "",
                korkCustomMm: brandsohleSide?.korkCustomMm ?? "",
            },
            "Sohlenmaterial": getSelectedValue(selected.schlemmaterial) || "",
            "Bevorzugte_Farbe": textAreas.schlemmaterial_preferred_colour || "",
            "Sohlenerhöhung": soleElevation?.enabled ? "ja" : "nein",
            "Seite_der_Sohlenerhöhung": soleElevation?.side || "",
            "Höhe_der_Sohlenerhöhung_mm": soleElevation?.height_mm ?? "",
            "absatz_höhe_am_besten_wie_bei_leisten_beachten": getSelectedValue(selected.absatzhoehe) || "",
            "Absatz_Form": getSelectedValue(selected.absatzform) || "",
            "absatz_form_achtung_bitte_achten_Sohle_beachten_ob_möglich": getSelectedValue(selected.absatzform) || "",
            "Abrollhilfe_Rolle": getSelectedValue(selected.abrollhilfe) || "",
            "abrollhilfe_Rolle": getSelectedValue(selected.abrollhilfe) || "",
            "Absatzbreite_anpassen_mm": heelWidthAdjustment ? JSON.stringify(heelWidthAdjustment) : "",
            "Linker_Schuh_innen_medial": heelWidthAdjustment?.leftMedial ? `${heelWidthAdjustment.leftMedial.op || ""} ${heelWidthAdjustment.leftMedial.mm || 0}mm` : "",
            "Linker_Schuh_außen_lateral": heelWidthAdjustment?.leftLateral ? `${heelWidthAdjustment.leftLateral.op || ""} ${heelWidthAdjustment.leftLateral.mm || 0}mm` : "",
            "Rechter_Schuh_innen_medial": heelWidthAdjustment?.rightMedial ? `${heelWidthAdjustment.rightMedial.op || ""} ${heelWidthAdjustment.rightMedial.mm || 0}mm` : "",
            "Rechter_Schuh_außen_lateral": heelWidthAdjustment?.rightLateral ? `${heelWidthAdjustment.rightLateral.op || ""} ${heelWidthAdjustment.rightLateral.mm || 0}mm` : "",
            "linker_schuh_left_Shoe": "",
            "rechter_schuh_right_Shoe": "",
            "möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen": getSelectedValue(selected.laufsohle_lose_beilegen) || "",
            "möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price": 0.0,
            "besondere_hinweise": textAreas.besondere_hinweise || "",
            "Besondere_Hinweise": textAreas.besondere_hinweise || ""
        }

        // Human-readable sections so JSON is easy to understand (part-by-part)
        // 1. Hinterkappe Muster Auswahlbereich – Beidseitig gleich/unterschiedlich + selected labels
        const musterMode = hinterkappeMusterSide?.mode
        if (musterMode) {
            json.Hinterkappe_Muster_Auswahlbereich = {
                Auswahlbereich: musterMode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich",
                ...(musterMode === "gleich"
                    ? { "Hinterkappe (beide Seiten)": hinterkappeMusterSide?.sameValue === "ja" ? "Ja (+4,99 €)" : "Nein" }
                    : {
                        "Hinterkappe links": hinterkappeMusterSide?.leftValue === "ja" ? "Ja (+2,49 €)" : "Nein",
                        "Hinterkappe rechts": hinterkappeMusterSide?.rightValue === "ja" ? "Ja (+2,49 €)" : "Nein",
                    }),
            }
        } else {
            json.Hinterkappe_Muster_Auswahlbereich = { Auswahlbereich: "", "Hinterkappe (beide Seiten)": "", "Hinterkappe links": "", "Hinterkappe rechts": "" }
        }

        // 2. Hinterkappe Auswahlbereich – Material/Leder selection with labels (Beidseitig gleich/unterschiedlich + dropdown values)
        if (hinterkappeSide && hinterkappeSide.mode) {
            const hMode = hinterkappeSide.mode
            const sameVal = hinterkappeSide.sameValue ?? ""
            const sameSub = hinterkappeSide.sameSubValue ?? ""
            const leftVal = hinterkappeSide.leftValue ?? ""
            const leftSub = hinterkappeSide.leftSubValue ?? ""
            const rightVal = hinterkappeSide.rightValue ?? ""
            const rightSub = hinterkappeSide.rightSubValue ?? ""
            json.Hinterkappe_Auswahlbereich = {
                Auswahlbereich: hMode === "gleich" ? "Beidseitig – gleich" : "Beidseitig – unterschiedlich",
                ...(hMode === "gleich"
                    ? {
                        "Hinterkappe (beide Seiten)": getOptionLabel("hinterkappe", sameVal || null),
                        ...(sameVal === "leder" && sameSub ? { "Leder Auswahl (beide Seiten)": getSubOptionLabel("hinterkappe", sameSub) } : {}),
                    }
                    : {
                        "Hinterkappe links": getOptionLabel("hinterkappe", leftVal || null),
                        ...(leftVal === "leder" && leftSub ? { "Leder Auswahl links": getSubOptionLabel("hinterkappe", leftSub) } : {}),
                        "Hinterkappe rechts": getOptionLabel("hinterkappe", rightVal || null),
                        ...(rightVal === "leder" && rightSub ? { "Leder Auswahl rechts": getSubOptionLabel("hinterkappe", rightSub) } : {}),
                    }),
            }
        } else {
            const simpleVal = getSelectedValue(selected.hinterkappe)
            const simpleSub = selected.hinterkappe === "leder" && selected.hinterkappe_sub ? (typeof selected.hinterkappe_sub === "string" ? selected.hinterkappe_sub : null) : null
            json.Hinterkappe_Auswahlbereich = {
                Auswahlbereich: "Hinterkappe (beide Seiten)",
                "Hinterkappe (beide Seiten)": getOptionLabel("hinterkappe", simpleVal || null),
                ...(simpleSub ? { "Leder Auswahl (beide Seiten)": getSubOptionLabel("hinterkappe", simpleSub) } : {}),
            }
        }

        // Get leder_auswahl and prices from hinterkappeSide (mode: gleich | unterschiedlich)
        if (hinterkappeSide && hinterkappeSide.mode) {
            const leftVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.leftValue
            const rightVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.rightValue
            const leftSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.leftSubValue
            const rightSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.rightSubValue
            if (leftVal === "leder" && leftSub) {
                json.leder_auswahl_links = leftSub
                json.leder_auswahl_links_price = getSubOptionPrice("hinterkappe", leftSub)
                json.leder_auswahl = json.leder_auswahl || leftSub
                json.leder_auswahl_price += getSubOptionPrice("hinterkappe", leftSub)
            }
            if (rightVal === "leder" && rightSub) {
                json.leder_auswahl_rechts = rightSub
                if (hinterkappeSide.mode === "unterschiedlich") {
                    json.leder_auswahl_rechts_price = getSubOptionPrice("hinterkappe", rightSub)
                    json.leder_auswahl = json.leder_auswahl ? `${json.leder_auswahl},${rightSub}` : rightSub
                    json.leder_auswahl_price += getSubOptionPrice("hinterkappe", rightSub)
                } else {
                    json.leder_auswahl_rechts = leftSub
                }
            }
        } else if (selected.hinterkappe === "leder" && selected.hinterkappe_sub) {
            const hinterkappeSub = typeof selected.hinterkappe_sub === 'string' ? selected.hinterkappe_sub : null
            if (hinterkappeSub) {
                json.leder_auswahl = hinterkappeSub
                json.leder_auswahl_price = getSubOptionPrice("hinterkappe", hinterkappeSub)
            }
        }

        // Get Konstruktionsart price
        const konstruktionsartValue = getSelectedValue(selected.Konstruktionsart)
        if (konstruktionsartValue) {
            json.Konstruktionsart_price = getOptionPrice("Konstruktionsart", konstruktionsartValue)
        }

        // Get brandsohle price (mode: gleich = full | unterschiedlich = half per side)
        if (brandsohleSide?.mode) {
            let brandsohlePrice = 0
            const halfPrice = (p: number) => Math.floor(p * 50) / 100
            if (brandsohleSide.mode === "gleich") {
                for (const id of (brandsohleSide.sameValues || [])) {
                    brandsohlePrice += getOptionPrice("brandsohle", id)
                }
            } else {
                for (const id of (brandsohleSide.leftValues || [])) {
                    brandsohlePrice += halfPrice(getOptionPrice("brandsohle", id))
                }
                for (const id of (brandsohleSide.rightValues || [])) {
                    brandsohlePrice += halfPrice(getOptionPrice("brandsohle", id))
                }
            }
            json.brandsohle_price = brandsohlePrice
            const firstVal = brandsohleSide.mode === "gleich" ? brandsohleSide?.sameValues?.[0] : (brandsohleSide?.leftValues?.[0] ?? brandsohleSide?.rightValues?.[0] ?? null)
            if (firstVal) json.brandsohle = firstVal
        } else {
            const brandsohleValue = getSelectedValue(selected.brandsohle)
            if (brandsohleValue) {
                json.brandsohle = brandsohleValue
                json.brandsohle_price = getOptionPrice("brandsohle", brandsohleValue)
            }
        }

        // Get laufsohle_lose_beilegen price
        const laufsohleValue = getSelectedValue(selected.laufsohle_lose_beilegen)
        if (laufsohleValue) {
            json.möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price = getOptionPrice("laufsohle_lose_beilegen", laufsohleValue)
        }

        // Get left and right shoe images from order
        const orderAny = order as any
        if (orderAny?.threed_model_left || orderAny?.image3d_2) {
            json.rechter_schuh_right_Shoe = orderAny.threed_model_left || orderAny.image3d_2 || ""
        }
        if (orderAny?.threed_model_right || orderAny?.image3d_1) {
            json.linker_schuh_left_Shoe = orderAny.threed_model_right || orderAny.image3d_1 || ""
        }

        return removeNulls(json)
    }

    // Prepare form data for API
    const prepareFormDataForAdmin3 = async (pdfBlob: Blob | null): Promise<FormData> => {
        const formData = new FormData()

        // Add PDF invoice if available
        if (pdfBlob) {
            formData.append('invoice', pdfBlob, 'invoice.pdf')
        }

        // Add totalPrice
        formData.append('totalPrice', grandTotal.toFixed(2))

        // Add staticImage (selectedSole.image) - fetch if it's a URL and convert to Blob
        if (selectedSole?.image) {
            try {
                // Check if it's a URL (http/https) or data URL
                if (typeof selectedSole.image === 'string' && (selectedSole.image.startsWith('http') || selectedSole.image.startsWith('data:'))) {
                    try {
                        const response = await fetch(selectedSole.image)
                        if (response.ok) {
                            const blob = await response.blob()
                            formData.append('staticImage', blob, 'staticImage.png')
                        } else {
                            // If fetch fails, send the URL as a string
                            formData.append('staticImage', selectedSole.image)
                        }
                    } catch (fetchError) {
                        // If fetch fails, send the URL as a string
                        formData.append('staticImage', selectedSole.image)
                    }
                } else {
                    // If it's already a File or Blob, append directly
                    formData.append('staticImage', selectedSole.image)
                }
            } catch (error) {
                // Fallback: send as string if processing fails
                if (typeof selectedSole.image === 'string') {
                    formData.append('staticImage', selectedSole.image)
                }
            }
        }

        // Add Massschafterstellung_json2 (bodenkonstruktion data)
        const massschafterstellungJson2 = prepareMassschafterstellungJson2()
        formData.append('Massschafterstellung_json2', JSON.stringify(massschafterstellungJson2))
        
        // Also keep old field name for backward compatibility
        formData.append('bodenkonstruktion_json', JSON.stringify(massschafterstellungJson2))

        // Also keep the old fields for backward compatibility (if needed)
        // Map form fields to API fields
        // Konstruktionsart
        const konstruktionsart = getSelectedValue(selected.Konstruktionsart)
        if (konstruktionsart) {
            formData.append('Konstruktionsart', konstruktionsart)
        }

        // Fersenkappe (hinterkappe)
        const hinterkappe = getSelectedValue(selected.hinterkappe)
        if (hinterkappe) {
            formData.append('Fersenkappe', hinterkappe)
            // Add sub-option if leder is selected
            if (hinterkappe === 'leder' && selected.hinterkappe_sub) {
                const hinterkappeSub = typeof selected.hinterkappe_sub === 'string' ? selected.hinterkappe_sub : null
                if (hinterkappeSub) {
                    formData.append('Fersenkappe_sub', hinterkappeSub)
                }
            }
        }

        // Verbindungsleder
        const verbindungsleder = getSelectedValue(selected.verbindungsleder)
        if (verbindungsleder) {
            formData.append('Verbindungsleder', verbindungsleder)
        }

        // Farbauswahl_Bodenkonstruktion
        const farbauswahl = getSelectedValue(selected.farbauswahl)
        if (farbauswahl) {
            formData.append('Farbauswahl_Bodenkonstruktion', farbauswahl)
        }

        // Sohlenmaterial
        const schlemmaterial = getSelectedValue(selected.schlemmaterial)
        if (schlemmaterial) {
            formData.append('Sohlenmaterial', schlemmaterial)
        }

        // Brandsohle
        const brandsohle = getSelectedValue(selected.brandsohle)
        if (brandsohle) {
            formData.append('Brandsohle', brandsohle)
        }

        // Absatz_Höhe
        const absatzhoehe = getSelectedValue(selected.absatzhoehe)
        if (absatzhoehe) {
            formData.append('Absatz_Höhe', absatzhoehe)
        }

        // Absatz_Form
        const absatzform = getSelectedValue(selected.absatzform)
        if (absatzform) {
            formData.append('Absatz_Form', absatzform)
        }

        // Abrollhilfe_Rolle
        const abrollhilfe = getSelectedValue(selected.abrollhilfe)
        if (abrollhilfe) {
            formData.append('Abrollhilfe_Rolle', abrollhilfe)
        }

        // Laufsohle_Profil_Art
        const laufkohle = getSelectedValue(selected.laufkohle)
        if (laufkohle) {
            formData.append('Laufsohle_Profil_Art', laufkohle)
        }

        // Sohlenstärke
        const schlenstaerke = getSelectedValue(selected.schlenstaerke)
        if (schlenstaerke) {
            formData.append('Sohlenstärke', schlenstaerke)
        }

        // Laufsohle_lose_beilegen
        const laufsohle_lose_beilegen = getSelectedValue(selected.laufsohle_lose_beilegen)
        if (laufsohle_lose_beilegen) {
            formData.append('Laufsohle_lose_beilegen', laufsohle_lose_beilegen)
        }

        // Heel Width Adjustment
        if (heelWidthAdjustment) {
            formData.append('heel_width_adjustment', JSON.stringify(heelWidthAdjustment))
        }

        // Sole Elevation
        if (soleElevation && soleElevation.enabled) {
            formData.append('sole_elevation', JSON.stringify(soleElevation))
        }

        // Besondere_Hinweise
        if (textAreas.besondere_hinweise) {
            formData.append('Besondere_Hinweise', textAreas.besondere_hinweise)
        }
        if (textAreas.schlemmaterial_preferred_colour) {
            formData.append('Sohlenmaterial_Bevorzugte_Farbe', textAreas.schlemmaterial_preferred_colour)
        }

        // Add sole id "4" specific fields if selected
        if (selectedSole?.id === "4") {
            if (sole4Thickness) {
                formData.append('sole4_thickness', sole4Thickness)
            }
            if (sole4Color) {
                formData.append('sole4_color', sole4Color)
            }
        }
        
        // Add sole id "5" specific fields if selected
        if (selectedSole?.id === "5") {
            if (sole5Thickness) {
                formData.append('sole5_thickness', sole5Thickness)
            }
            if (sole5Color) {
                formData.append('sole5_color', sole5Color)
            }
        }
        
        // Add sole id "6" specific fields if selected
        if (selectedSole?.id === "6") {
            if (sole6Thickness) {
                formData.append('sole6_thickness', sole6Thickness)
            }
            if (sole6Color) {
                formData.append('sole6_color', sole6Color)
            }
        }

        return formData
    }

    // Handle form submission to Admin3 API (for existing orders with only Bodenkonstruktion updates)
    const handleFormSubmit = async (pdfBlob: Blob | null) => {
        if (!orderId) {
            toast.error("Order ID is required")
            return
        }

        setIsSubmitting(true)
        try {
            const formData = await prepareFormDataForAdmin3(pdfBlob)
            const response = await sendMassschuheOrderToAdmin3(orderId, formData)
            toast.success(response.message || "Bestellung erfolgreich aktualisiert!", { id: "sending-order" })
            // Close completion popup and redirect back to massschuhauftraege page with orderId
            setShowModal2(false)
            router.push(`/dashboard/massschuhauftraege?orderId=${orderId}`)
        } catch (error) {
            toast.error("Fehler beim Aktualisieren der Bestellung.", { id: "sending-order" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative bg-white pb-24">
            {/* Sticky Price Summary - bottom-right with Abbrechen + Weiter buttons */}
            <StickyPriceSummary
                price={grandTotal}
                onWeiterClick={handleWeiterClick}
                onCancel={() => router.back()}
                isSubmitting={isWeiterLoading}
            />

            {/* Product Header */}
            <ProductHeader orderData={orderDataForPDF} productImageUrl={productImageUrl} />

            {/* Sole Selection Section */}
            <SoleSelectionSection
                selectedSole={selectedSole}
                onOpenModal={() => setShowSoleModal(true)}
                sole4Thickness={sole4Thickness}
                sole4Color={sole4Color}
                onSole4ThicknessChange={setSole4Thickness}
                onSole4ColorChange={setSole4Color}
                sole5Thickness={sole5Thickness}
                sole5Color={sole5Color}
                onSole5ThicknessChange={setSole5Thickness}
                onSole5ColorChange={setSole5Color}
                sole6Thickness={sole6Thickness}
                sole6Color={sole6Color}
                onSole6ThicknessChange={setSole6Thickness}
                onSole6ColorChange={setSole6Color}
            />

            {/* Checklist Section */}
            <ChecklistSection
                selected={selected}
                optionInputs={optionInputs}
                setOptionInputs={setOptionInputs}
                textAreas={textAreas}
                onSetGroup={setGroup}
                onSetHinterkappeSub={setHinterkappeSub}
                onAbsatzFormClick={handleAbsatzFormClick}
                onTextAreaChange={handleTextAreaChange}
                onHeelWidthChange={setHeelWidthAdjustment}
                heelWidthAdjustment={heelWidthAdjustment}
                onSoleElevationChange={setSoleElevation}
                soleElevation={soleElevation}
                checkboxError={checkboxError}
                grandTotal={grandTotal}
                onWeiterClick={handleWeiterClick}
                onCancel={() => router.back()}
                isSubmitting={isWeiterLoading}
                hideActionButtons={true}
                selectedSole={selectedSole}
                showOrthopedicFields={true}
                onVorderkappeChange={setVorderkappeSide}
                vorderkappeSide={vorderkappeSide}
                onRahmenChange={setRahmen}
                rahmen={rahmen}
                onSohlenhoeheDifferenziertChange={setSohlenhoeheDifferenziert}
                sohlenhoeheDifferenziert={sohlenhoeheDifferenziert}
                onHinterkappeMusterChange={setHinterkappeMusterSide}
                hinterkappeMusterSide={hinterkappeMusterSide}
                vorderkappeUnifiedConfigUi={true}
                onHinterkappeChange={setHinterkappeSide}
                hinterkappeSide={hinterkappeSide}
                onBrandsohleChange={setBrandsohleSide}
                brandsohleSide={brandsohleSide}
                brandsohleUnifiedConfigUi={true}
                verbindungslederUnifiedConfigUi={true}
            />

            {/* PDF Popup */}
            {showModal && (
                <PDFPopup
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={async (pdfBlob) => {
                        // Store PDF blob and show completion popup (API call will happen on "Verbindlich bestellen")
                        setPdfBlob(pdfBlob || null)
                        setShowModal(false)
                        setShowModal2(true)
                    }}
                    allGroups={GROUPS2}
                    selected={selected}
                    optionInputs={optionInputs}
                    textAreas={textAreas}
                    orderData={{ ...orderDataForPDF, totalPrice: grandTotal }}
                    selectedSole={selectedSole}
                    heelWidthAdjustment={heelWidthAdjustment}
                    soleElevation={soleElevation}
                    vorderkappeSide={vorderkappeSide}
                    rahmen={rahmen}
                    sohlenhoeheDifferenziert={sohlenhoeheDifferenziert}
                    hinterkappeMusterSide={hinterkappeMusterSide}
                    hinterkappeSide={hinterkappeSide}
                    brandsohleSide={brandsohleSide}
                />
            )}

            {/* Completion Popup */}
            {showModal2 && (
                <CompletionPopUp
                    onClose={() => setShowModal2(false)}
                    productName={orderDataForPDF.productName || shoe2.name}
                    customerName={orderDataForPDF.customerName}
                    value={grandTotal.toFixed(2)}
                    isLoading={isSubmitting}
                    deliveryCategory="Komplettfertigung"
                    onConfirm={async (deliveryDate) => {
                        // Set loading state immediately
                        setIsSubmitting(true)
                        
                        // Use customShaftData or fallback to contextData (for redirect flow)
                        const shaftDataToUse = customShaftData || contextData
                        
                        // Always send date in payload under key "deliveryDate" (ISO string)
                        const appendDeliveryDate = (formData: FormData, ddMmYyyy?: string | null) => {
                            const dateToUse = ddMmYyyy ?? orderDataForPDF.deliveryDate
                            if (dateToUse && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateToUse)) {
                                const [d, m, y] = dateToUse.split('.').map(Number)
                                formData.append('deliveryDate', new Date(y, m - 1, d).toISOString())
                            }
                        }
                        
                        try {
                            if (orderId) {
                                if (shaftDataToUse) {
                                    // Prepare FormData and determine isCourierContact in parallel where possible
                                    const has3DFiles = !!(shaftDataToUse?.image3d_1_file || shaftDataToUse?.image3d_2_file);
                                    const isAbholenSelected = !!(shaftDataToUse?.businessAddress && (shaftDataToUse.businessAddress.companyName || shaftDataToUse.businessAddress.address));
                                    const isVersendenSelected = !!shaftDataToUse?.versendenData;
                                    
                                    // Determine isCourierContact (synchronous, fast)
                                    const isCourierContact: 'yes' | 'no' = has3DFiles 
                                        ? 'no' 
                                        : (isAbholenSelected ? 'yes' : (isVersendenSelected ? 'no' : 'yes'));
                                    
                                    // Prepare FormData (async operation)
                                    const { formData } = await prepareFormDataForAdmin2(shaftDataToUse, pdfBlob)
                                    appendDeliveryDate(formData, deliveryDate)
                                    
                                    // Make API call (derive isCustomOrder from shaft data)
                                    const isCustomOrderForApi = !!shaftDataToUse?.uploadedImage
                                    const response = isCustomOrderForApi 
                                        ? await sendMassschuheCustomShaftOrderToAdmin2(orderId, formData, isCourierContact)
                                        : await sendMassschuheOrderToAdmin2(orderId, formData, isCourierContact)
                                    
                                    toast.success(response.message || "Bestellung erfolgreich aktualisiert!", { id: "sending-order" })
                                    clearCustomShaftData()
                                    setShowModal2(false)
                                    router.push('/dashboard/balance-dashboard')
                                } else {
                                    await handleFormSubmit(pdfBlob)
                                }
                            } else {
                                if (shaftDataToUse) {
                                    // Prepare isCourierContact (synchronous, fast)
                                    const has3DFiles = !!(shaftDataToUse?.image3d_1_file || shaftDataToUse?.image3d_2_file);
                                    const isAbholenSelected = !!(shaftDataToUse?.businessAddress && (shaftDataToUse.businessAddress.companyName || shaftDataToUse.businessAddress.address));
                                    const isVersendenSelected = !!shaftDataToUse?.versendenData;
                                    
                                    const isCourierContact: 'yes' | 'no' = has3DFiles 
                                        ? 'no' 
                                        : (isAbholenSelected ? 'yes' : (isVersendenSelected ? 'no' : 'yes'));
                                    
                                    // Prepare FormData (async operation)
                                    const { formData } = await prepareFormDataForAdmin2(shaftDataToUse, pdfBlob)
                                    appendDeliveryDate(formData, deliveryDate)
                                    
                                    // Make API call (derive isCustomOrder from shaft data)
                                    const isCustomOrderForApi = !!shaftDataToUse?.uploadedImage
                                    const response = isCustomOrderForApi
                                        ? await createMassschuheWithoutOrderId(formData, isCourierContact)
                                        : await createMassschuheWithoutOrderIdWithoutCustomModels(formData, isCourierContact)
                                    
                                    toast.success(response.message || "Bestellung erfolgreich erstellt!", { id: "creating-order" })
                                    clearCustomShaftData()
                                    setShowModal2(false)
                                    router.push("/dashboard/balance-dashboard")
                                } else {
                                    await handleFormSubmit(pdfBlob)
                                }
                            }
                        } catch (error) {
                            console.error('Error in onConfirm:', error)
                            toast.error("Fehler beim Verarbeiten der Bestellung.", { id: "creating-order" })
                            setIsSubmitting(false)
                        }
                    }}
                />
            )}

            {/* Sole Selection Modal */}
            <SoleSelectionModal
                isOpen={showSoleModal}
                onClose={() => setShowSoleModal(false)}
                soleOptions={soleOptions}
                selectedSole={selectedSole}
                onSelectSole={(sole) => setSelectedSole(sole)}
                onShowDetail={(sole) => {
                    setSelectedSoleForDetail(sole)
                    setShowSoleDetailModal(true)
                }}
            />

            {/* Sole Detail Modal */}
            <SoleDetailModal
                isOpen={showSoleDetailModal}
                onClose={() => setShowSoleDetailModal(false)}
                sole={selectedSoleForDetail}
            />

            {/* Absatz Form Modal */}
            <AbsatzFormModal
                isOpen={showAbsatzFormModal}
                onClose={() => setShowAbsatzFormModal(false)}
                selectedForm={selectedAbsatzForm}
            />
        </div>
    )
}
