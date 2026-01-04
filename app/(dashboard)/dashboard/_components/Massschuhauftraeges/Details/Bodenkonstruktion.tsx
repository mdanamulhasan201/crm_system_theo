"use client"
import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { GROUPS2, shoe2 } from "./ShoeData"
import PDFPopup, { OrderDataForPDF } from "./PDFPopup"
import CompletionPopUp from "./Completion-PopUp"
import { FaArrowLeft } from "react-icons/fa"
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder"
import { sendMassschuheOrderToAdmin3 } from "@/apis/MassschuheManagemantApis"
import toast from "react-hot-toast"

// Types
import type { OptionInputsState, TextAreasState } from "./Bodenkonstruktion/types"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"

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
        setSelected((prev) => ({ ...prev, [groupId]: optId }))
        if (groupId === "hinterkappe" && optId !== "leder") {
            setSelected((prev) => ({ ...prev, hinterkappe_sub: null }))
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
        return sel !== undefined && sel !== null && sel !== ""
    })

    const handleWeiterClick = () => {
        if (!isAllCheckboxAnswered) {
            setCheckboxError(true)
            return
        }
        setCheckboxError(false)
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

    // Prepare form data for API
    const prepareFormDataForAdmin3 = (pdfBlob: Blob | null): FormData => {
        const formData = new FormData()

        // Add PDF invoice if available
        if (pdfBlob) {
            formData.append('invoice', pdfBlob, 'invoice.pdf')
        }

        // Map form fields to API fields
        // Konstruktionsart
        if (selected.Konstruktionsart) {
            formData.append('Konstruktionsart', selected.Konstruktionsart)
        }

        // Fersenkappe (hinterkappe)
        if (selected.hinterkappe) {
            formData.append('Fersenkappe', selected.hinterkappe)
            // Add sub-option if leder is selected
            if (selected.hinterkappe === 'leder' && selected.hinterkappe_sub) {
                formData.append('Fersenkappe_sub', selected.hinterkappe_sub)
            }
        }

        // Farbauswahl_Bodenkonstruktion
        if (selected.farbauswahl) {
            formData.append('Farbauswahl_Bodenkonstruktion', selected.farbauswahl)
        }

        // Sohlenmaterial
        if (selected.schlemmaterial) {
            formData.append('Sohlenmaterial', selected.schlemmaterial)
        }

        // Brandsohle
        if (selected.brandsohle) {
            formData.append('Brandsohle', selected.brandsohle)
        }

        // Absatz_Höhe
        if (selected.absatzhoehe) {
            formData.append('Absatz_Höhe', selected.absatzhoehe)
        }

        // Absatz_Form
        if (selected.absatzform) {
            formData.append('Absatz_Form', selected.absatzform)
        }

        // Abrollhilfe_Rolle
        if (selected.abrollhilfe) {
            formData.append('Abrollhilfe_Rolle', selected.abrollhilfe)
        }

        // Laufsohle_Profil_Art
        if (selected.laufkohle) {
            formData.append('Laufsohle_Profil_Art', selected.laufkohle)
        }

        // Sohlenstärke
        if (selected.schlenstaerke) {
            formData.append('Sohlenstärke', selected.schlenstaerke)
        }

        // Besondere_Hinweise
        if (textAreas.besondere_hinweise) {
            formData.append('Besondere_Hinweise', textAreas.besondere_hinweise)
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
            {/* Back Button */}
            <button 
                className="px-6 cursor-pointer py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50" 
                onClick={() => router.back()}
            >
                <FaArrowLeft />
            </button>

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
                checkboxError={checkboxError}
                grandTotal={grandTotal}
                onWeiterClick={handleWeiterClick}
                onCancel={() => router.back()}
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
