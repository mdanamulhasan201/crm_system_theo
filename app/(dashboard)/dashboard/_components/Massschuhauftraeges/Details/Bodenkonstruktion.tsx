"use client"
import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { GROUPS2, shoe2 } from "./ShoeData"
import PDFPopup, { OrderDataForPDF } from "./PDFPopup"
import CompletionPopUp from "./Completion-PopUp"
import { FaArrowLeft } from "react-icons/fa"
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder"
import { sendMassschuheOrderToAdmin2, sendMassschuheOrderToAdmin3 } from "@/apis/MassschuheManagemantApis"
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
import { prepareOrderDataForPDF } from "./HelperFunctions"

interface BodenkonstruktionProps {
    orderId?: string | null
}

export default function Bodenkonstruktion({ orderId }: BodenkonstruktionProps) {
    const router = useRouter()
    
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
        return prepareOrderDataForPDF(order)
    }, [order])

    // Calculations
    const { grandTotal } = useBodenkonstruktionCalculations(selected, orderDataForPDF.totalPrice)

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
        
        if (!orderId) {
            toast.error("Order ID is required")
            return
        }

        // Check if custom shaft data exists in sessionStorage
        const customShaftDataStr = sessionStorage.getItem(`customShaftData_${orderId}`)
        
        if (customShaftDataStr) {
            // Call Admin2 API with custom shaft data + Bodenkonstruktion data
            setIsSubmitting(true)
            try {
                const customShaftData = JSON.parse(customShaftDataStr)
                const formData = prepareFormDataForAdmin2(customShaftData)
                const response = await sendMassschuheOrderToAdmin2(orderId, formData)
                toast.success(response.message || "Bestellung erfolgreich gesendet!", { id: "sending-order" })
                
                // Clear sessionStorage after successful API call
                sessionStorage.removeItem(`customShaftData_${orderId}`)
                
                // Show PDF modal
                setShowModal(true)
                localStorage.setItem("currentBalance", String(grandTotal.toFixed(2)))
            } catch (error) {
                console.error('Failed to send order to admin2:', error)
                toast.error("Fehler beim Senden der Bestellung.", { id: "sending-order" })
            } finally {
                setIsSubmitting(false)
            }
        } else {
            // No custom shaft data, just show modal (normal flow)
            setShowModal(true)
            localStorage.setItem("currentBalance", String(grandTotal.toFixed(2)))
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

    // Prepare form data for Admin2 API (custom shaft + Bodenkonstruktion)
    const prepareFormDataForAdmin2 = (customShaftData: any): FormData => {
        const formData = new FormData()

        // Try to get files from order data if available
        const orderAny = order as any
        if (orderAny?.threed_model_right || orderAny?.image3d_1) {
            // If file URL exists, we can append it (API might accept URLs)
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

        // Add custom shaft data
        if (customShaftData.mabschaftKollektionId) {
            formData.append('mabschaftKollektionId', customShaftData.mabschaftKollektionId)
        }
        
        // Add lederfarbe or multiple leather colors
        if (customShaftData.numberOfLeatherColors === '1' && customShaftData.lederfarbe) {
            formData.append('lederfarbe', customShaftData.lederfarbe)
        } else if (customShaftData.numberOfLeatherColors === '2' || customShaftData.numberOfLeatherColors === '3') {
            formData.append('numberOfLeatherColors', customShaftData.numberOfLeatherColors)
            customShaftData.leatherColors?.forEach((color: string, index: number) => {
                formData.append(`leatherColor_${index + 1}`, color)
            })
            if (customShaftData.leatherColorAssignments) {
                formData.append('leatherColorAssignments', JSON.stringify(customShaftData.leatherColorAssignments))
            }
        }

        // Add custom shaft fields
        if (customShaftData.innenfutter) formData.append('innenfutter', customShaftData.innenfutter)
        if (customShaftData.schafthohe) formData.append('schafthohe', customShaftData.schafthohe)
        if (customShaftData.polsterung?.length > 0) formData.append('polsterung', customShaftData.polsterung.join(','))
        if (customShaftData.vestarkungen?.length > 0) formData.append('vestarkungen', customShaftData.vestarkungen.join(','))
        if (customShaftData.polsterung_text) formData.append('polsterung_text', customShaftData.polsterung_text)
        if (customShaftData.vestarkungen_text) formData.append('vestarkungen_text', customShaftData.vestarkungen_text)
        if (customShaftData.nahtfarbe) formData.append('nahtfarbe', customShaftData.nahtfarbe)
        if (customShaftData.nahtfarbe_text) formData.append('nahtfarbe_text', customShaftData.nahtfarbe_text)
        if (customShaftData.lederType) formData.append('lederType', customShaftData.lederType)
        
        if (customShaftData.passenden_schnursenkel) {
            formData.append('passenden_schnursenkel', 'true')
            if (customShaftData.passenden_schnursenkel_price) {
                formData.append('passenden_schnursenkel_price', customShaftData.passenden_schnursenkel_price)
            }
        }
        if (customShaftData.osen_einsetzen) {
            formData.append('osen_einsetzen', 'true')
            if (customShaftData.osen_einsetzen_price) {
                formData.append('osen_einsetzen_price', customShaftData.osen_einsetzen_price)
            }
        }

        // Add Bodenkonstruktion data
        const konstruktionsart = getSelectedValue(selected.Konstruktionsart)
        if (konstruktionsart) {
            formData.append('Konstruktionsart', konstruktionsart)
        }
        const hinterkappe = getSelectedValue(selected.hinterkappe)
        if (hinterkappe) {
            formData.append('Fersenkappe', hinterkappe)
            if (hinterkappe === 'leder' && selected.hinterkappe_sub) {
                const hinterkappeSub = typeof selected.hinterkappe_sub === 'string' ? selected.hinterkappe_sub : null
                if (hinterkappeSub) {
                    formData.append('Fersenkappe_sub', hinterkappeSub)
                }
            }
        }
        const verbindungsleder = getSelectedValue(selected.verbindungsleder)
        if (verbindungsleder) {
            formData.append('Verbindungsleder', verbindungsleder)
        }
        const farbauswahl = getSelectedValue(selected.farbauswahl)
        if (farbauswahl) {
            formData.append('Farbauswahl_Bodenkonstruktion', farbauswahl)
        }
        const schlemmaterial = getSelectedValue(selected.schlemmaterial)
        if (schlemmaterial) {
            formData.append('Sohlenmaterial', schlemmaterial)
        }
        const brandsohle = getSelectedValue(selected.brandsohle)
        if (brandsohle) {
            formData.append('Brandsohle', brandsohle)
        }
        const absatzhoehe = getSelectedValue(selected.absatzhoehe)
        if (absatzhoehe) {
            formData.append('Absatz_Höhe', absatzhoehe)
        }
        const absatzform = getSelectedValue(selected.absatzform)
        if (absatzform) {
            formData.append('Absatz_Form', absatzform)
        }
        const abrollhilfe = getSelectedValue(selected.abrollhilfe)
        if (abrollhilfe) {
            formData.append('Abrollhilfe_Rolle', abrollhilfe)
        }
        const laufkohle = getSelectedValue(selected.laufkohle)
        if (laufkohle) {
            formData.append('Laufsohle_Profil_Art', laufkohle)
        }
        const schlenstaerke = getSelectedValue(selected.schlenstaerke)
        if (schlenstaerke) {
            formData.append('Sohlenstärke', schlenstaerke)
        }
        const laufsohle_lose_beilegen = getSelectedValue(selected.laufsohle_lose_beilegen)
        if (laufsohle_lose_beilegen) {
            formData.append('Laufsohle_lose_beilegen', laufsohle_lose_beilegen)
        }
        if (heelWidthAdjustment) {
            formData.append('heel_width_adjustment', JSON.stringify(heelWidthAdjustment))
        }
        if (textAreas.besondere_hinweise) {
            formData.append('Besondere_Hinweise', textAreas.besondere_hinweise)
        }
        if (textAreas.schlemmaterial_preferred_colour) {
            formData.append('Sohlenmaterial_Bevorzugte_Farbe', textAreas.schlemmaterial_preferred_colour)
        }

        // Add total price (Bodenkonstruktion grandTotal)
        formData.append('totalPrice', grandTotal.toFixed(2))

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

        // Note: Files (image3d_1, image3d_2) should be retrieved from order data if available
        // For now, we'll rely on the order having the files already stored

        return formData
    }

    // Prepare form data for API
    const prepareFormDataForAdmin3 = (pdfBlob: Blob | null): FormData => {
        const formData = new FormData()

        // Add PDF invoice if available
        if (pdfBlob) {
            formData.append('invoice', pdfBlob, 'invoice.pdf')
        }

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

        // totalPrice (grandTotal includes base price + all additional options)
        formData.append('totalPrice', grandTotal.toFixed(2))

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

    // Handle form submission to API
    const handleFormSubmit = async (pdfBlob: Blob | null) => {
        if (!orderId) {
            toast.error("Order ID is required")
            return
        }

        setIsSubmitting(true)
        try {
            const formData = prepareFormDataForAdmin3(pdfBlob)
            const response = await sendMassschuheOrderToAdmin3(orderId, formData)
            toast.success(response.message || "Bestellung erfolgreich gesendet!", { id: "sending-order" })
            // Close completion popup and navigate after successful API call
            setShowModal2(false)
            router.push("/dashboard/balance-dashboard")
        } catch (error) {
            console.error('Failed to send order to admin:', error)
            toast.error("Fehler beim Senden der Bestellung.", { id: "sending-order" })
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
                    productName={shoe2.name}
                    value={grandTotal.toFixed(2)}
                    isLoading={isSubmitting}
                    onConfirm={async () => {
                        // Call API when "Verbindlich bestellen" is clicked
                        if (orderId) {
                            await handleFormSubmit(pdfBlob)
                        } else {
                            // If no orderId, just navigate
                            router.push("/dashboard/balance-dashboard")
                            setShowModal2(false)
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
