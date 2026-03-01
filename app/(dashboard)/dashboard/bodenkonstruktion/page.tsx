"use client"
import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { GROUPS2, shoe2 } from "../_components/Massschuhauftraeges/Details/ShoeData"
import PDFPopup, { OrderDataForPDF } from "../_components/Massschuhauftraeges/Details/PDFPopup"
import CompletionPopUp from "../_components/Massschuhauftraeges/Details/Completion-PopUp"
import toast from "react-hot-toast"

// Types
import type { OptionInputsState, TextAreasState } from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/types"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"
import type { HeelWidthAdjustmentData, SoleElevationData, VorderkappeSideData, RahmenData, SohlenhoeheDifferenziertData, HinterkappeMusterSideData, HinterkappeSideData, BrandsohleSideData } from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields"

// Components
import SoleSelectionSection from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/SoleSelectionSection"
import ChecklistSection from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/ChecklistSection"
import SoleSelectionModal from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/modals/SoleSelectionModal"
import SoleDetailModal from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/modals/SoleDetailModal"
import AbsatzFormModal from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/modals/AbsatzFormModal"

// Hooks
import { useSoleData } from "@/hooks/massschuhe/useSoleData"
import { useBodenkonstruktionCalculations } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"

// Utils
import { parseEuroFromText } from "../_components/Massschuhauftraeges/Details/HelperFunctions"

// APIs
import { 
    createCustomBodenkonstruktion,
    getCountDate
} from "@/apis/MassschuheManagemantApis"
import Image from "next/image"
import StickyPriceSummary from "@/components/StickyPriceSummary/StickyPriceSummary"

export default function BodenkonstruktionPage() {
    const router = useRouter()
    
    // Customer name state
    const [customerName, setCustomerName] = useState<string>("")
    
    // Form states
    const [selected, setSelected] = useState<SelectedState>({ hinterkappe: "kunststoff" })
    const [optionInputs, setOptionInputs] = useState<OptionInputsState>({})
    const [textAreas, setTextAreas] = useState<TextAreasState>({
        besondere_hinweise: "",
    })
    const [heelWidthAdjustment, setHeelWidthAdjustment] = useState<HeelWidthAdjustmentData | null>(null)
    const [soleElevation, setSoleElevation] = useState<SoleElevationData | null>(null)
    
    // Orthopedic fields
    const [vorderkappeSide, setVorderkappeSide] = useState<VorderkappeSideData | null>(null)
    const [rahmen, setRahmen] = useState<RahmenData | null>(null)
    const [sohlenhoeheDifferenziert, setSohlenhoeheDifferenziert] = useState<SohlenhoeheDifferenziertData | null>(null)
    
    // Left/Right selection fields
    const [hinterkappeMusterSide, setHinterkappeMusterSide] = useState<HinterkappeMusterSideData | null>(null)
    const [hinterkappeSide, setHinterkappeSide] = useState<HinterkappeSideData | null>(null)
    const [brandsohleSide, setBrandsohleSide] = useState<BrandsohleSideData | null>(null)
    
    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [showModal2, setShowModal2] = useState(false)
    const [checkboxError, setCheckboxError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
    
    // Sole selection states
    const [selectedSole, setSelectedSole] = useState<SoleType | null>(null)
    const [showSoleModal, setShowSoleModal] = useState(false)
    const [showSoleDetailModal, setShowSoleDetailModal] = useState(false)
    const [selectedSoleForDetail, setSelectedSoleForDetail] = useState<SoleType | null>(null)
    
    // Sole id "4" specific options
    const [sole4Thickness, setSole4Thickness] = useState<string | null>(null)
    const [sole4Color, setSole4Color] = useState<string | null>(null)
    
    // Sole id "5" specific options
    const [sole5Thickness, setSole5Thickness] = useState<string | null>(null)
    const [sole5Color, setSole5Color] = useState<string | null>(null)
    
    // Sole id "6" specific options
    const [sole6Thickness, setSole6Thickness] = useState<string | null>(null)
    const [sole6Color, setSole6Color] = useState<string | null>(null)
    
    // Absatz Form popup states
    const [showAbsatzFormModal, setShowAbsatzFormModal] = useState(false)
    const [selectedAbsatzForm, setSelectedAbsatzForm] = useState<string | null>(null)

    // Delivery days count from API
    const [deliveryDaysCount, setDeliveryDaysCount] = useState<number>(14) // Default to 14 if API fails

    // Hooks
    const { soleOptions } = useSoleData()

    // Fetch delivery days count from API
    React.useEffect(() => {
        const fetchDeliveryDays = async () => {
            try {
                const response = await getCountDate()
                // Assuming the API returns { count: number } or similar structure
                // Adjust based on actual API response
                const count = response?.count || response?.data?.count || response?.days || 14
                if (typeof count === 'number' && count > 0) {
                    setDeliveryDaysCount(count)
                }
            } catch (error) {
                console.error("Error fetching delivery days count:", error)
                // Keep default value of 14
            }
        }
        fetchDeliveryDays()
    }, [])

    // Calculate delivery date based on count from API
    const deliveryDate = useMemo(() => {
        const today = new Date()
        const delivery = new Date(today)
        delivery.setDate(today.getDate() + deliveryDaysCount)
        return delivery.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        })
    }, [deliveryDaysCount])

    // Base price - start with 189.99€
    const basePrice = 189.99

    // Calculations (include hinterkappeSide so Leder options e.g. Leder Dünn +4,99 € update sticky price)
    const { grandTotal } = useBodenkonstruktionCalculations(selected, basePrice, rahmen, hinterkappeMusterSide, hinterkappeSide, brandsohleSide)

    // Prepare order data for PDF (use grandTotal so modal/PDF show correct price)
    const orderDataForPDF: OrderDataForPDF = useMemo(() => {
        return {
            customerName: customerName || "",
            productName: shoe2.name || "",
            orderNumber: "",
            deliveryDate: deliveryDate,
            totalPrice: grandTotal,
        }
    }, [customerName, deliveryDate, grandTotal])

    // Reset sole options when sole changes
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


    // Auto-deselect options based on selected sole
    React.useEffect(() => {
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
        
        if (selected.abrollhilfe && (selectedSole?.id === "9" || selectedSole?.id === "10" || selectedSole?.id === "11" || selectedSole?.id === "12")) {
            const abrollhilfeValue = selected.abrollhilfe
            const isArray = Array.isArray(abrollhilfeValue)
            const currentArray = isArray ? abrollhilfeValue : [abrollhilfeValue]
            
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
        
        if (group?.multiSelect) {
            setSelected((prev) => {
                const currentValue = prev[groupId]
                const currentArray = Array.isArray(currentValue) ? currentValue : (currentValue ? [currentValue] : [])
                
                if (optId === null) {
                    return { ...prev, [groupId]: null }
                }
                
                if (currentArray.includes(optId)) {
                    const newArray = currentArray.filter(id => id !== optId)
                    return { ...prev, [groupId]: newArray.length > 0 ? newArray : null }
                } else {
                    return { ...prev, [groupId]: [...currentArray, optId] }
                }
            })
        } else {
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
            return Array.isArray(sel) ? sel.length > 0 : false
        }
        return sel !== undefined && sel !== null && sel !== ""
    })

    const handleWeiterClick = async () => {
        // Validate customer name
        if (!customerName.trim()) {
            toast.error("Bitte geben Sie einen Kundennamen ein.")
            return
        }

        if (!isAllCheckboxAnswered) {
            setCheckboxError(true)
            return
        }
        setCheckboxError(false)
        
        // Validate sole selections
        if (selectedSole?.id === "4") {
            if (!sole4Thickness || !sole4Color) {
                toast.error("Bitte wählen Sie Sohlenstärke und Farbe für die ausgewählte Sohle aus.")
                return
            }
        }
        
        if (selectedSole?.id === "5") {
            if (!sole5Thickness || !sole5Color) {
                toast.error("Bitte wählen Sie Sohlenstärke und Farbe für die ausgewählte Sohle aus.")
                return
            }
        }
        
        if (selectedSole?.id === "6") {
            if (!sole6Thickness || !sole6Color) {
                toast.error("Bitte wählen Sie Sohlenstärke und Farbe für die ausgewählte Sohle aus.")
                return
            }
        }
        
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

    // Clear dependent fields when Sohlenmaterial is deselected
    React.useEffect(() => {
        const schlemmaterialValue = selected.schlemmaterial
        const hasSelection = schlemmaterialValue && (
            Array.isArray(schlemmaterialValue) ? schlemmaterialValue.length > 0 : true
        )
        
        if (!hasSelection) {
            // Clear color field
            if (textAreas.schlemmaterial_preferred_colour) {
                handleTextAreaChange("schlemmaterial_preferred_colour", "")
            }
            // Clear height fields
            if (sohlenhoeheDifferenziert) {
                setSohlenhoeheDifferenziert(null)
            }
        }
    }, [selected.schlemmaterial, textAreas.schlemmaterial_preferred_colour, sohlenhoeheDifferenziert])

    // Handle final form submission
    const handleFinalSubmit = async () => {
        setIsSubmitting(true)
        try {
            const formData = await prepareCustomBodenkonstruktionFormData(pdfBlob)
            const response = await createCustomBodenkonstruktion(formData)
            
            toast.success(response.message || "Bodenkonstruktion erfolgreich erstellt!", { id: "creating-bodenkonstruktion" })
            
            setShowModal2(false)
            router.push("/dashboard/balance-dashboard")
        } catch (error) {
            toast.error("Fehler beim Erstellen der Bodenkonstruktion.", { id: "creating-bodenkonstruktion" })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper function to convert selected value to string
    const getSelectedValue = (value: string | string[] | null | undefined): string | null => {
        if (!value) return null
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(',') : null
        }
        return value
    }

    // Helper function to convert image to File
    const convertImageToFile = async (imageString: string, fileName: string = 'custom_model.png'): Promise<File | null> => {
        try {
            if (!imageString) return null
            
            if (imageString.startsWith('data:')) {
                const response = await fetch(imageString)
                const blob = await response.blob()
                return new File([blob], fileName, { type: blob.type })
            }
            
            if (imageString.startsWith('http')) {
                const response = await fetch(imageString)
                if (response.ok) {
                    const blob = await response.blob()
                    return new File([blob], fileName, { type: blob.type })
                }
            }
            
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

    // Helper to get option price
    const getOptionPrice = (groupId: string, optionId: string | null): number => {
        if (!optionId) return 0
        
        const group = GROUPS2.find(g => g.id === groupId)
        if (!group) return 0
        
        const option = group.options.find(opt => opt.id === optionId)
        if (!option) return 0
        
        return parseEuroFromText(option.label)
    }

    // Helper to get sub-option price
    const getSubOptionPrice = (groupId: string, subOptionId: string | null): number => {
        if (!subOptionId) return 0
        
        const group = GROUPS2.find(g => g.id === groupId)
        if (!group || !group.subOptions?.leder) return 0
        
        const subOption = group.subOptions.leder.find(opt => opt.id === subOptionId)
        return subOption?.price || 0
    }

    // Prepare form data for custom bodenkonstruktion API
    const prepareCustomBodenkonstruktionFormData = async (pdfBlob: Blob | null): Promise<FormData> => {
        const formData = new FormData()

        // Add customer name
        if (customerName) {
            formData.append('other_customer_name', customerName)
        }

        // Add delivery date (ISO format) - use count from API
        const deliveryDateObj = new Date()
        deliveryDateObj.setDate(deliveryDateObj.getDate() + deliveryDaysCount)
        formData.append('deliveryDate', deliveryDateObj.toISOString())

        // Add total price
        formData.append('totalPrice', grandTotal.toFixed(2))

        // Add PDF invoice if available
        if (pdfBlob) {
            formData.append('invoice', pdfBlob, 'invoice.pdf')
        }

    // Helper to remove null from payload - use "" or {} so no data goes as null
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

    // Prepare bodenkonstruktion_json - Include ALL form fields (no null, prices included)
        const bodenkonstruktionJson: any = {
            // Customer & delivery
            customerName: customerName || "",
            
            // Sole information
            Mehr_ansehen_image: selectedSole?.image || "",
            Mehr_ansehen_title: selectedSole?.name || "",
            Mehr_ansehen_description: selectedSole?.description || "",
            
            // === 1. Hinterkappe - Muster wird bereitgestellt (mode: gleich | unterschiedlich) ===
            hinterkappe_muster: {
                mode: hinterkappeMusterSide?.mode ?? "",
                sameValue: hinterkappeMusterSide?.sameValue ?? "",
                leftValue: hinterkappeMusterSide?.leftValue ?? "",
                rightValue: hinterkappeMusterSide?.rightValue ?? "",
                ...(hinterkappeMusterSide?.mode === "gleich" && {
                    samePrice: hinterkappeMusterSide?.sameValue === "ja" ? 4.99 : 0,
                }),
                ...(hinterkappeMusterSide?.mode === "unterschiedlich" && {
                    leftPrice: hinterkappeMusterSide?.leftValue === "ja" ? 2.49 : 0,
                    rightPrice: hinterkappeMusterSide?.rightValue === "ja" ? 2.49 : 0,
                }),
            },
            
            // === 2. Hinterkappe (Material, Leder Auswahl - mode: gleich | unterschiedlich) ===
            hinterkappe: hinterkappeSide && hinterkappeSide.mode ? {
                mode: hinterkappeSide.mode,
                sameValue: hinterkappeSide.sameValue ?? "",
                sameSubValue: hinterkappeSide.sameSubValue ?? "",
                leftValue: hinterkappeSide.leftValue ?? "",
                leftSubValue: hinterkappeSide.leftSubValue ?? "",
                rightValue: hinterkappeSide.rightValue ?? "",
                rightSubValue: hinterkappeSide.rightSubValue ?? "",
            } : (getSelectedValue(selected.hinterkappe) || ""),
            leder_auswahl: "",
            leder_auswahl_price: 0,
            leder_auswahl_links: "",
            leder_auswahl_links_price: 0,
            leder_auswahl_rechts: "",
            leder_auswahl_rechts_price: 0,
            
            // === 3. Vorderkappe ===
            vorderkappe: {} as any,
            
            // === 4. Brandsohle ===
            brandsohle: "" as any,
            brandsohle_price: 0,
            
            // === 5. Verbindungsleder ===
            verbindungsleder: getSelectedValue(selected.verbindungsleder) || "",
            
            // === 6. Konstruktionsart ===
            Konstruktionsart: getSelectedValue(selected.Konstruktionsart) || "",
            Konstruktionsart_price: 0,
            
            // === 7. Rahmen ===
            rahmen: {} as any,
            Rahmenfarbe: "",
            
            // === 8. Sohlenmaterial ===
            Sohlenmaterial: getSelectedValue(selected.schlemmaterial) || "",
            ohlenmaterial: getSelectedValue(selected.schlemmaterial) || "",
            
            // === 9. Bevorzugte Farbe ===
            Bevorzugte_Farbe: textAreas.schlemmaterial_preferred_colour || "",
            schlemmaterial_preferred_colour: textAreas.schlemmaterial_preferred_colour || "",
            
            // === 10. Sohlenhöhe gesamt – Differenziert (Ferse, Ballen, Spitze mm) ===
            sohlenhoehe_differenziert: {} as any,
            
            // === 11. Sohlenerhöhung ===
            Sohlenerhöhung: soleElevation?.enabled ? "ja" : "nein",
            Seite_der_Sohlenerhöhung: soleElevation?.side || "",
            Höhe_der_Sohlenerhöhung_mm: soleElevation?.height_mm ?? "",
            sole_elevation: (soleElevation && soleElevation.enabled) ? soleElevation : {},
            
            // === 12. Absatz Form ===
            absatz_form: getSelectedValue(selected.absatzform) || "",
            absatz_höhe_am_besten_wie_bei_leisten_beachten: getSelectedValue(selected.absatzhoehe) || "",
            absatz_form_achtung_bitte_achten_Sohle_beachten_ob_möglich: getSelectedValue(selected.absatzform) || "",
            
            // === 13. Abrollhilfe (Rolle) ===
            abrollhilfe_Rolle: getSelectedValue(selected.abrollhilfe) || "",
            
            // === 14. Absatzbreite anpassen (mm) ===
            Absatzbreite_anpassen: heelWidthAdjustment ? JSON.stringify(heelWidthAdjustment) : "",
            Linker_Schuh_innen_medial: heelWidthAdjustment?.leftMedial ? `${heelWidthAdjustment.leftMedial.op || ""} ${heelWidthAdjustment.leftMedial.mm || 0}mm` : "",
            Linker_Schuh_außen_lateral: heelWidthAdjustment?.leftLateral ? `${heelWidthAdjustment.leftLateral.op || ""} ${heelWidthAdjustment.leftLateral.mm || 0}mm` : "",
            Rechter_Schuh_innen_medial: heelWidthAdjustment?.rightMedial ? `${heelWidthAdjustment.rightMedial.op || ""} ${heelWidthAdjustment.rightMedial.mm || 0}mm` : "",
            Rechter_Schuh_außen_lateral: heelWidthAdjustment?.rightLateral ? `${heelWidthAdjustment.rightLateral.op || ""} ${heelWidthAdjustment.rightLateral.mm || 0}mm` : "",
            heel_width_adjustment: heelWidthAdjustment || {},
            
            // === 15. Möchten Sie die Laufsohle lose der Bestellung beilegen? ===
            möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen: getSelectedValue(selected.laufsohle_lose_beilegen) || "",
            möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price: 0,
            
            // === 16. Leisten im Schuh belassen oder ausleisten? ===
            leisten_belassen: getSelectedValue(selected.leisten_belassen) || "",
            
            // === 17. Besondere Hinweise ===
            besondere_hinweise: textAreas.besondere_hinweise || "",
            Besondere_Hinweise: textAreas.besondere_hinweise || "",
            
            // Legacy / extra
            farbauswahl: getSelectedValue(selected.farbauswahl) || "",
            laufkohle: getSelectedValue(selected.laufkohle) || "",
            schlenstaerke: getSelectedValue(selected.schlenstaerke) || "",
            linker_schuh_left_Shoe: "",
            rechter_schuh_right_Shoe: "",
        }

        // Get Konstruktionsart price
        const konstruktionsartValue = getSelectedValue(selected.Konstruktionsart)
        if (konstruktionsartValue) {
            bodenkonstruktionJson.Konstruktionsart_price = getOptionPrice("Konstruktionsart", konstruktionsartValue)
        }
        
        // Note: hinterkappe and brandsohle are now handled in the left/right section below

        // Get laufsohle_lose_beilegen price
        const laufsohleValue = getSelectedValue(selected.laufsohle_lose_beilegen)
        if (laufsohleValue) {
            bodenkonstruktionJson.möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price = getOptionPrice("laufsohle_lose_beilegen", laufsohleValue)
        }

        // Add sole specific fields
        if (selectedSole?.id === "4") {
            if (sole4Thickness) bodenkonstruktionJson.sole4_thickness = sole4Thickness
            if (sole4Color) bodenkonstruktionJson.sole4_color = sole4Color
        }
        if (selectedSole?.id === "5") {
            if (sole5Thickness) bodenkonstruktionJson.sole5_thickness = sole5Thickness
            if (sole5Color) bodenkonstruktionJson.sole5_color = sole5Color
        }
        if (selectedSole?.id === "6") {
            if (sole6Thickness) bodenkonstruktionJson.sole6_thickness = sole6Thickness
            if (sole6Color) bodenkonstruktionJson.sole6_color = sole6Color
        }

        // Add orthopedic fields - hinterkappe_muster and hinterkappe already set above with full structure
        // Set leder_auswahl and prices from hinterkappeSide (mode: gleich | unterschiedlich)
        if (hinterkappeSide && hinterkappeSide.mode) {
            const leftVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.leftValue
            const rightVal = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameValue : hinterkappeSide.rightValue
            const leftSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.leftSubValue
            const rightSub = hinterkappeSide.mode === "gleich" ? hinterkappeSide.sameSubValue : hinterkappeSide.rightSubValue
            if (hinterkappeSide.mode === "gleich" && leftVal) {
                bodenkonstruktionJson.hinterkappe_legacy = leftVal
                bodenkonstruktionJson.Hinterkappe = leftVal
            } else if (hinterkappeSide.mode === "unterschiedlich" && (leftVal || rightVal)) {
                bodenkonstruktionJson.hinterkappe_legacy = [leftVal, rightVal].filter(Boolean).join(",")
                bodenkonstruktionJson.Hinterkappe = [leftVal, rightVal].filter(Boolean).join(",")
            }
            if (leftVal === "leder" && leftSub) {
                bodenkonstruktionJson.leder_auswahl_links = leftSub
                bodenkonstruktionJson.leder_auswahl_links_price = getSubOptionPrice("hinterkappe", leftSub)
                bodenkonstruktionJson.leder_auswahl = bodenkonstruktionJson.leder_auswahl || leftSub
                bodenkonstruktionJson.leder_auswahl_price += getSubOptionPrice("hinterkappe", leftSub)
            }
            if (rightVal === "leder" && rightSub) {
                bodenkonstruktionJson.leder_auswahl_rechts = rightSub
                if (hinterkappeSide.mode === "unterschiedlich") {
                    bodenkonstruktionJson.leder_auswahl_rechts_price = getSubOptionPrice("hinterkappe", rightSub)
                    bodenkonstruktionJson.leder_auswahl = bodenkonstruktionJson.leder_auswahl ? `${bodenkonstruktionJson.leder_auswahl},${rightSub}` : rightSub
                    bodenkonstruktionJson.leder_auswahl_price += getSubOptionPrice("hinterkappe", rightSub)
                } else {
                    bodenkonstruktionJson.leder_auswahl_rechts = leftSub
                }
            }
        } else if (selected.hinterkappe === "leder" && selected.hinterkappe_sub) {
            const hinterkappeSub = typeof selected.hinterkappe_sub === 'string' ? selected.hinterkappe_sub : null
            if (hinterkappeSub) {
                bodenkonstruktionJson.leder_auswahl = hinterkappeSub
                bodenkonstruktionJson.leder_auswahl_price = getSubOptionPrice("hinterkappe", hinterkappeSub)
            }
        }

        // 3. Brandsohle (mode: gleich = full price | unterschiedlich = half price per side)
        if (brandsohleSide && brandsohleSide.mode) {
            bodenkonstruktionJson.Seite_wählen = brandsohleSide.mode
            bodenkonstruktionJson.brandsohleSide = {
                mode: brandsohleSide.mode,
                sameValues: brandsohleSide.sameValues || [],
                leftValues: brandsohleSide.leftValues || [],
                rightValues: brandsohleSide.rightValues || []
            }
            let price = 0
            const halfPrice = (p: number) => Math.floor(p * 50) / 100
            if (brandsohleSide.mode === "gleich") {
                for (const id of (brandsohleSide.sameValues || [])) {
                    price += getOptionPrice("brandsohle", id)
                }
            } else {
                for (const id of (brandsohleSide.leftValues || [])) {
                    price += halfPrice(getOptionPrice("brandsohle", id))
                }
                for (const id of (brandsohleSide.rightValues || [])) {
                    price += halfPrice(getOptionPrice("brandsohle", id))
                }
            }
            bodenkonstruktionJson.brandsohle_price = price
            const firstVal = brandsohleSide.mode === "gleich" ? brandsohleSide.sameValues?.[0] : (brandsohleSide.leftValues?.[0] ?? brandsohleSide.rightValues?.[0] ?? null)
            if (firstVal) bodenkonstruktionJson.brandsohle = firstVal
            const legacyArr = brandsohleSide.mode === "gleich" ? brandsohleSide.sameValues : [...(brandsohleSide.leftValues || []), ...(brandsohleSide.rightValues || [])]
            if (legacyArr?.length) {
                bodenkonstruktionJson.brandsohle_legacy = legacyArr.join(',')
            }
        } else {
            // Legacy format
            const brandsohleValue = getSelectedValue(selected.brandsohle)
            if (brandsohleValue) {
                bodenkonstruktionJson.brandsohle = brandsohleValue
                bodenkonstruktionJson.brandsohle_price = getOptionPrice("brandsohle", brandsohleValue)
            }
        }

        // 4. Vorderkappe (mode: gleich | unterschiedlich)
        if (vorderkappeSide && vorderkappeSide.mode) {
            bodenkonstruktionJson.vorderkappe = {
                mode: vorderkappeSide.mode,
                sameMaterial: vorderkappeSide.sameMaterial || "",
                leftMaterial: vorderkappeSide.leftMaterial || "",
                rightMaterial: vorderkappeSide.rightMaterial || ""
            }
        }

        // 5. Rahmen (with Rahmenfarbe)
        if (rahmen && rahmen.type) {
            bodenkonstruktionJson.rahmen = {
                type: rahmen.type,
                color: rahmen.color || ""
            }
            bodenkonstruktionJson.Rahmenfarbe = rahmen.color || ""
        }

        // 6. Sohlenhöhe Differenziert
        if (sohlenhoeheDifferenziert && (sohlenhoeheDifferenziert.ferse || sohlenhoeheDifferenziert.ballen || sohlenhoeheDifferenziert.spitze)) {
            bodenkonstruktionJson.sohlenhoehe_differenziert = {
                ferse: sohlenhoeheDifferenziert.ferse || 0,
                ballen: sohlenhoeheDifferenziert.ballen || 0,
                spitze: sohlenhoeheDifferenziert.spitze || 0
            }
        }

        // Remove any remaining nulls before sending
        const cleanedJson = removeNulls(bodenkonstruktionJson)
        formData.append('bodenkonstruktion_json', JSON.stringify(cleanedJson))

        // Add staticImage (selectedSole image) - convert to File
        if (selectedSole?.image) {
            const staticImageFile = await convertImageToFile(selectedSole.image, 'sole_image.png')
            if (staticImageFile) {
                formData.append('staticImage', staticImageFile)
            } else {
                // Fallback: send as string if conversion fails
                formData.append('staticImage', selectedSole.image)
            }
        }

        return formData
    }

    return (
        <div className="relative bg-white ">
            {/* Sticky Price Summary - bottom-right with Abbrechen + Weiter buttons */}
            <StickyPriceSummary
              price={grandTotal}
              onWeiterClick={handleWeiterClick}
              onCancel={() => router.back()}
              isSubmitting={isSubmitting}
            />

            {/* Product Header with Customer Input */}
            <div className="my-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-black">FeetF1rst Massschuhpartner</h1>
                </div>

                <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex justify-center items-center gap-6">
                        <div className="bg-white rounded-lg p-4 flex-shrink-0">
                            <Image
                                width={96}
                                height={96}
                                src={shoe2.imageUrl || "/placeholder.svg"}
                                alt={shoe2.name}
                                className="w-48 h-48 object-contain"
                            />
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-black mb-2">
                                {shoe2.name || ""}
                            </h2>
                            <div className="mb-2">
                                <label className="text-lg text-black mr-2">Kunde:</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Kundenname eingeben"
                                    className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-base text-black mb-4">
                                Voraussichtlicher Liefertermin: <span className="font-medium">{deliveryDate}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                onHinterkappeChange={setHinterkappeSide}
                hinterkappeSide={hinterkappeSide}
                onBrandsohleChange={setBrandsohleSide}
                brandsohleSide={brandsohleSide}
            />

            {/* PDF Popup */}
            {showModal && (
                <PDFPopup
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={async (pdfBlob) => {
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
                    productName={shoe2.name}
                    customerName={customerName}
                    value={grandTotal.toFixed(2)}
                    isLoading={isSubmitting}
                    onConfirm={handleFinalSubmit}
                    deliveryCategory="Bodenkonstruktion"
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
