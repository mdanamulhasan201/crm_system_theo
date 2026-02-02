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
import type { HeelWidthAdjustmentData, SoleElevationData } from "./Bodenkonstruktion/FormFields"

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

// Utils
import { prepareOrderDataForPDF, parseEuroFromText } from "./HelperFunctions"

interface BodenkonstruktionProps {
    orderId?: string | null
}

export default function Bodenkonstruktion({ orderId }: BodenkonstruktionProps) {
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
    
    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [showModal2, setShowModal2] = useState(false)
    const [checkboxError, setCheckboxError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
    
    // Store custom shaft data for later API call
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

    // Prepare order data for PDF
    const orderDataForPDF: OrderDataForPDF = useMemo(() => {
        // If no orderId, use context data (custom order from Step 1)
        if (!orderId && contextData) {
            const { getOrderNumber, getDeliveryDate } = require('@/utils/customShoeOrderHelpers')
            return {
                customerName: contextData.customerName || contextData.other_customer_name || 'Kunde',
                orderNumber: getOrderNumber(),
                deliveryDate: getDeliveryDate(),
                productName: contextData.productDescription || 'Custom Made #1000',
                totalPrice: contextData.totalPrice || 0,
            }
        }
        // Otherwise use order data from API
        return prepareOrderDataForPDF(order)
    }, [order, orderId, contextData])

    // Determine base price: use custom shaft price if available, otherwise use order price
    const basePrice = useMemo(() => {
        // If custom shaft data exists and has totalPrice, use it
        if (contextData && contextData.totalPrice) {
            return contextData.totalPrice
        }
        // Otherwise use order total price
        return orderDataForPDF.totalPrice || 0
    }, [contextData, orderDataForPDF.totalPrice])

    // Calculations - use basePrice which includes shaft price
    const { grandTotal } = useBodenkonstruktionCalculations(selected, basePrice)

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
            json.sole4_thickness = sole4Thickness || null
            json.sole4_color = sole4Color || null
        }
        if (selectedSole?.id === "5") {
            json.sole5_thickness = sole5Thickness || null
            json.sole5_color = sole5Color || null
        }
        if (selectedSole?.id === "6") {
            json.sole6_thickness = sole6Thickness || null
            json.sole6_color = sole6Color || null
        }
        
        return json
    }

    // Prepare form data for Admin2 API (custom shaft + Bodenkonstruktion)
    const prepareFormDataForAdmin2 = async (customShaftData: any, pdfBlobData: Blob | null = null): Promise<{ formData: FormData; isCustomOrder: boolean }> => {
        const { prepareStep2FormData } = require('@/utils/customShoeOrderHelpers')
        
        // Prepare Massschafterstellung_json2 (Bodenkonstruktion data)
        const massschafterstellungJson2 = prepareMassschafterstellungJson2WithSoleFields()
        
        // Use helper to prepare complete form data
        const formData = await prepareStep2FormData(
            customShaftData,
            massschafterstellungJson2,
            selectedSole?.image || null,
            pdfBlobData
        )
        
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

        // Add Massschafterstellung_json2 (Bodenkonstruktion data)
        const massschafterstellungJson2: any = {
            Mehr_ansehen_image: selectedSole?.image || "",
            Mehr_ansehen_title: selectedSole?.name || "",
            Mehr_ansehen_description: selectedSole?.description || "",
            hinterkappe: getSelectedValue(selected.hinterkappe) || "",
            leder_auswahl: "",
            leder_auswahl_price: 0.0,
            Konstruktionsart: getSelectedValue(selected.Konstruktionsart) || "",
            Konstruktionsart_price: 0.0,
            brandsohle: getSelectedValue(selected.brandsohle) || "",
            brandsohle_price: 0.0,
            ohlenmaterial: getSelectedValue(selected.schlemmaterial) || "",
            absatz_höhe_am_besten_wie_bei_leisten_beachten: getSelectedValue(selected.absatzhoehe) || "",
            abrollhilfe_Rolle: getSelectedValue(selected.abrollhilfe) || "",
            absatz_form_achtung_bitte_achten_Sohle_beachten_ob_möglich: getSelectedValue(selected.absatzform) || "",
            linker_schuh_left_Shoe: "",
            rechter_schuh_right_Shoe: "",
            möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen: getSelectedValue(selected.laufsohle_lose_beilegen) || "",
            möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price: 0.0,
            besondere_hinweise: textAreas.besondere_hinweise || ""
        }

        // Get leder_auswahl and price if hinterkappe is "leder"
        if (selected.hinterkappe === "leder" && selected.hinterkappe_sub) {
            const hinterkappeSub = typeof selected.hinterkappe_sub === 'string' ? selected.hinterkappe_sub : null
            if (hinterkappeSub) {
                massschafterstellungJson2.leder_auswahl = hinterkappeSub
                massschafterstellungJson2.leder_auswahl_price = getSubOptionPrice("hinterkappe", hinterkappeSub)
            }
        }

        // Get Konstruktionsart price
        const konstruktionsartValue = getSelectedValue(selected.Konstruktionsart)
        if (konstruktionsartValue) {
            massschafterstellungJson2.Konstruktionsart_price = getOptionPrice("Konstruktionsart", konstruktionsartValue)
        }

        // Get brandsohle price
        const brandsohleValue = getSelectedValue(selected.brandsohle)
        if (brandsohleValue) {
            massschafterstellungJson2.brandsohle_price = getOptionPrice("brandsohle", brandsohleValue)
        }

        // Get laufsohle_lose_beilegen price
        const laufsohleValue = getSelectedValue(selected.laufsohle_lose_beilegen)
        if (laufsohleValue) {
            massschafterstellungJson2.möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price = getOptionPrice("laufsohle_lose_beilegen", laufsohleValue)
        }

        // Get left and right shoe images from order
        if (orderAny?.threed_model_left || orderAny?.image3d_2) {
            massschafterstellungJson2.rechter_schuh_right_Shoe = orderAny.threed_model_left || orderAny.image3d_2 || ""
        }
        if (orderAny?.threed_model_right || orderAny?.image3d_1) {
            massschafterstellungJson2.linker_schuh_left_Shoe = orderAny.threed_model_right || orderAny.image3d_1 || ""
        }

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

    // Prepare Massschafterstellung_json2 (Bodenkonstruktion data)
    const prepareMassschafterstellungJson2 = () => {
        const json: any = {
            "Mehr_ansehen_image": selectedSole?.image || "",
            "Mehr_ansehen_title": selectedSole?.name || "",
            "Mehr_ansehen_description": selectedSole?.description || "",
            "hinterkappe": getSelectedValue(selected.hinterkappe) || "",
            "leder_auswahl": "",
            "leder_auswahl_price": 0.0,
            "Konstruktionsart": getSelectedValue(selected.Konstruktionsart) || "",
            "Konstruktionsart_price": 0.0,
            "brandsohle": getSelectedValue(selected.brandsohle) || "",
            "brandsohle_price": 0.0,
            "ohlenmaterial": getSelectedValue(selected.schlemmaterial) || "",
            "absatz_höhe_am_besten_wie_bei_leisten_beachten": getSelectedValue(selected.absatzhoehe) || "",
            "abrollhilfe_Rolle": getSelectedValue(selected.abrollhilfe) || "",
            "absatz_form_achtung_bitte_achten_Sohle_beachten_ob_möglich": getSelectedValue(selected.absatzform) || "",
            "linker_schuh_left_Shoe": "",
            "rechter_schuh_right_Shoe": "",
            "möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen": getSelectedValue(selected.laufsohle_lose_beilegen) || "",
            "möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price": 0.0,
            "besondere_hinweise": textAreas.besondere_hinweise || ""
        }

        // Get leder_auswahl and price if hinterkappe is "leder"
        if (selected.hinterkappe === "leder" && selected.hinterkappe_sub) {
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

        // Get brandsohle price
        const brandsohleValue = getSelectedValue(selected.brandsohle)
        if (brandsohleValue) {
            json.brandsohle_price = getOptionPrice("brandsohle", brandsohleValue)
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

        return json
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
        <div className="relative bg-white">
          

            {/* Product Header */}
            <ProductHeader orderData={orderDataForPDF} />

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
                isSubmitting={isSubmitting}
                selectedSole={selectedSole}
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
                    orderData={orderDataForPDF}
                    selectedSole={selectedSole}
                    heelWidthAdjustment={heelWidthAdjustment}
                    soleElevation={soleElevation}
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
                    onConfirm={async () => {
                        // Call API when "Verbindlich bestellen" is clicked
                        if (orderId) {
                            // Check if we have custom shaft data (from Step 1: Schafterstellung)
                            if (customShaftData) {
                                // Existing order customization: Call Admin2 API with custom shaft data + Bodenkonstruktion data
                                setIsSubmitting(true)
                                try {
                                    const { formData } = await prepareFormDataForAdmin2(customShaftData, pdfBlob)
                                    
                                    // Use the appropriate API based on order type (custom upload or collection product)
                                    const response = isCustomOrder 
                                        ? await sendMassschuheCustomShaftOrderToAdmin2(orderId, formData)
                                        : await sendMassschuheOrderToAdmin2(orderId, formData)
                                    
                                    toast.success(response.message || "Bestellung erfolgreich aktualisiert!", { id: "sending-order" })
                                    
                                    // Clear context after successful API call
                                    clearCustomShaftData()
                                    
                                    // Close modal and redirect to balance dashboard (order completed with Bodenkonstruktion)
                                    setShowModal2(false)
                                    router.push('/dashboard/balance-dashboard')
                                } catch (error) {
                                    toast.error("Fehler beim Aktualisieren der Bestellung.", { id: "sending-order" })
                                } finally {
                                    setIsSubmitting(false)
                                }
                            } else {
                                // Existing order: Only adding Bodenkonstruktion (no new shaft data) - call Admin3 API
                                await handleFormSubmit(pdfBlob)
                            }
                        } else {
                            // No orderId: Create new order with custom shaft data + Bodenkonstruktion
                            if (customShaftData) {
                                setIsSubmitting(true)
                                try {
                                    const { formData } = await prepareFormDataForAdmin2(customShaftData, pdfBlob)
                                    
                                    // Call the appropriate API based on order type (custom model or collection)
                                    const response = isCustomOrder
                                        ? await createMassschuheWithoutOrderId(formData)
                                        : await createMassschuheWithoutOrderIdWithoutCustomModels(formData)
                                    
                                    toast.success(response.message || "Bestellung erfolgreich erstellt!", { id: "creating-order" })
                                    
                                    // Clear context after successful API call
                                    clearCustomShaftData()
                                    
                                    // Close modal and navigate to balance dashboard
                                    setShowModal2(false)
                                    router.push("/dashboard/balance-dashboard")
                                    setShowModal2(false)
                                } catch (error) {
                                    toast.error("Fehler beim Erstellen der Bestellung.", { id: "creating-order" })
                                } finally {
                                    setIsSubmitting(false)
                                }
                            } else {
                                // If no custom shaft data and no orderId, just navigate
                                router.push("/dashboard/balance-dashboard")
                                setShowModal2(false)
                            }
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
