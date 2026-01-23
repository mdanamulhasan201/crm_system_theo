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
import type { HeelWidthAdjustmentData } from "./Bodenkonstruktion/FormFields"

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

        // Besondere_Hinweise
        if (textAreas.besondere_hinweise) {
            formData.append('Besondere_Hinweise', textAreas.besondere_hinweise)
        }
        if (textAreas.schlemmaterial_preferred_colour) {
            formData.append('Sohlenmaterial_Bevorzugte_Farbe', textAreas.schlemmaterial_preferred_colour)
        }

        // totalPrice (grandTotal includes base price + all additional options)
        formData.append('totalPrice', grandTotal.toFixed(2))

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
                checkboxError={checkboxError}
                grandTotal={grandTotal}
                onWeiterClick={handleWeiterClick}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
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
