"use client"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, User, Upload } from "lucide-react"
import { GROUPS2, shoe2 } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/ShoeData"
import PDFPopup, { OrderDataForPDF } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/PDFPopup"
import CompletionPopUp from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Completion-PopUp"
import toast from "react-hot-toast"

// Types
import type { OptionInputsState, TextAreasState } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/types"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"
import type { HeelWidthAdjustmentData, VorderkappeSideData, RahmenData, HinterkappeMusterSideData, HinterkappeSideData, BrandsohleSideData, SohlenversteifungData, SohlenaufbauData } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields"
import { defaultSohlenversteifungData, normalizeSohlenversteifungData, defaultSohlenaufbauData, normalizeSohlenaufbauData } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields"

// Components
import SoleSelectionSection from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/SoleSelectionSection"
import ChecklistSection from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/ChecklistSection"
import SoleSelectionModal from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/modals/SoleSelectionModal"
import SoleDetailModal from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/modals/SoleDetailModal"
import AbsatzFormModal from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/modals/AbsatzFormModal"

// Hooks
import { useSoleData } from "@/hooks/massschuhe/useSoleData"
import { useBodenkonstruktionCalculations } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"

// Utils
import { parseEuroFromText } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/HelperFunctions"

import StickyPriceSummary from "@/components/StickyPriceSummary/StickyPriceSummary"
import { updateMassschuheOrderStepBodenkonstruktion, getMassschuheOrderStepBodenkonstruktion } from "@/apis/MassschuheAddedApis"

const BODEN_STEP_STATUS = "Halbprobe_durchführen"

type BodenkonstruktionCustomerOrderViewProps = {
    embeddedOrderId?: string | null
    onCloseEmbedded?: () => void
}

export function BodenkonstruktionCustomerOrderView({
    embeddedOrderId,
    onCloseEmbedded,
}: BodenkonstruktionCustomerOrderViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = embeddedOrderId ?? searchParams.get("orderId")
    const handleCancel = onCloseEmbedded ?? (() => router.back())
    const prefillDoneRef = useRef(false)

    // Customer name state
    const [customerName, setCustomerName] = useState<string>("")

    // Form states
    const [selected, setSelected] = useState<SelectedState>({
        hinterkappe: "kunststoff",
        sohlenversteifung: "nein",
        Konstruktionsart: "geldakt",
    })
    const [optionInputs, setOptionInputs] = useState<OptionInputsState>({})
    const [textAreas, setTextAreas] = useState<TextAreasState>({
        besondere_hinweise: "",
    })
    const [heelWidthAdjustment, setHeelWidthAdjustment] = useState<HeelWidthAdjustmentData | null>(null)
    const [sohlenversteifung, setSohlenversteifung] = useState<SohlenversteifungData>(defaultSohlenversteifungData)
    const [sohlenaufbau, setSohlenaufbau] = useState<SohlenaufbauData>(defaultSohlenaufbauData)

    // Orthopedic fields
    const [vorderkappeSide, setVorderkappeSide] = useState<VorderkappeSideData | null>(null)
    const [rahmen, setRahmen] = useState<RahmenData | null>(null)

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

    // Order-step: image upload (when orderId present) + prefill loading
    const [bodenkonstruktionImageFile, setBodenkonstruktionImageFile] = useState<File | null>(null)
    const [bodenkonstruktionImagePreview, setBodenkonstruktionImagePreview] = useState<string | null>(null)
    const [prefillLoading, setPrefillLoading] = useState(!!orderId)

    // Hooks
    const { soleOptions } = useSoleData()
    const deliveryDate = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 14)
        return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }, [])

    // Base price - start with 189.99€
    const basePrice = 189.99

    // Calculations (include hinterkappeSide so Leder options e.g. Leder Dünn +4,99 € update sticky price)
    const { grandTotal } = useBodenkonstruktionCalculations(selected, basePrice, rahmen, hinterkappeMusterSide, hinterkappeSide, brandsohleSide, vorderkappeSide)

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

    // Prefill from GET when orderId present (step 5)
    useEffect(() => {
        if (!orderId || prefillDoneRef.current) return
        prefillDoneRef.current = true
        getMassschuheOrderStepBodenkonstruktion(orderId, BODEN_STEP_STATUS)
            .then((res: any) => {
                const data = res?.data ?? res
                const raw = data?.bodenkonstruktion_json
                if (!raw) {
                    setPrefillLoading(false)
                    return
                }
                const json = typeof raw === "string" ? (() => { try { return JSON.parse(raw) } catch { return null } })() : raw
                if (!json || typeof json !== "object") {
                    setPrefillLoading(false)
                    return
                }
                if (json.selected && typeof json.selected === "object") setSelected(json.selected as SelectedState)
                if (json.sohlenversteifung_detail != null) {
                    setSohlenversteifung(normalizeSohlenversteifungData(json.sohlenversteifung_detail))
                } else if (json.sohlenversteifung != null && typeof json.sohlenversteifung === "object" && !Array.isArray(json.sohlenversteifung)) {
                    setSohlenversteifung(normalizeSohlenversteifungData(json.sohlenversteifung))
                }
                if (json.sohlenaufbau_detail != null) {
                    setSohlenaufbau(normalizeSohlenaufbauData(json.sohlenaufbau_detail))
                } else if (json.sohlenaufbau != null && typeof json.sohlenaufbau === "object" && !Array.isArray(json.sohlenaufbau)) {
                    setSohlenaufbau(normalizeSohlenaufbauData(json.sohlenaufbau))
                }
                if (json.optionInputs && typeof json.optionInputs === "object") setOptionInputs(json.optionInputs as OptionInputsState)
                if (json.textAreas && typeof json.textAreas === "object") setTextAreas((prev) => ({ ...prev, ...json.textAreas } as TextAreasState))
                if (typeof json.customerName === "string") setCustomerName(json.customerName)
                if (json.heelWidthAdjustment != null) setHeelWidthAdjustment(json.heelWidthAdjustment as HeelWidthAdjustmentData | null)
                if (json.vorderkappeSide != null) setVorderkappeSide(json.vorderkappeSide as VorderkappeSideData | null)
                if (json.rahmen != null) setRahmen(json.rahmen as RahmenData | null)
                if (json.hinterkappeMusterSide != null) setHinterkappeMusterSide(json.hinterkappeMusterSide as HinterkappeMusterSideData | null)
                if (json.hinterkappeSide != null) setHinterkappeSide(json.hinterkappeSide as HinterkappeSideData | null)
                if (json.brandsohleSide != null) setBrandsohleSide(json.brandsohleSide as BrandsohleSideData | null)
                if (json.selectedSoleId != null && Array.isArray(soleOptions)) {
                    const sole = soleOptions.find((s: SoleType) => s.id === json.selectedSoleId)
                    if (sole) setSelectedSole(sole)
                }
                if (json.sole4Thickness != null) setSole4Thickness(json.sole4Thickness)
                if (json.sole4Color != null) setSole4Color(json.sole4Color)
                if (json.sole5Thickness != null) setSole5Thickness(json.sole5Thickness)
                if (json.sole5Color != null) setSole5Color(json.sole5Color)
                if (json.sole6Thickness != null) setSole6Thickness(json.sole6Thickness)
                if (json.sole6Color != null) setSole6Color(json.sole6Color)
                if (data?.bodenkonstruktion_image) setBodenkonstruktionImagePreview(data.bodenkonstruktion_image)
            })
            .catch(() => {})
            .finally(() => setPrefillLoading(false))
    }, [orderId, soleOptions])

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

        // When from order step (orderId): no modal – save directly and redirect to main page
        if (orderId) {
            await handleFinalSubmit()
            return
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

    // Build bodenkonstruktion_json payload (all form data except image)
    const buildBodenkonstruktionJson = () => ({
        selected,
        optionInputs,
        textAreas,
        customerName,
        heelWidthAdjustment,
        sohlenversteifung_detail: sohlenversteifung,
        sohlenaufbau_detail: sohlenaufbau,
        vorderkappeSide,
        rahmen,
        hinterkappeMusterSide,
        hinterkappeSide,
        brandsohleSide,
        selectedSoleId: selectedSole?.id ?? null,
        sole4Thickness,
        sole4Color,
        sole5Thickness,
        sole5Color,
        sole6Thickness,
        sole6Color,
    })

    // Handle final form submission: if orderId → POST order-step then redirect to order; else balance-dashboard
    const handleFinalSubmit = async (_deliveryDate?: string | null) => {
        setIsSubmitting(true)
        if (orderId) {
            try {
                const formData = new FormData()
                formData.append("bodenkonstruktion_json", JSON.stringify(buildBodenkonstruktionJson()))
                if (bodenkonstruktionImageFile) formData.append("bodenkonstruktion_image", bodenkonstruktionImageFile)
                await updateMassschuheOrderStepBodenkonstruktion(orderId, formData)
                toast.success("Bodenkonstruktion gespeichert!", { id: "bodenkonstruktion-saved" })
                setShowModal2(false)
                router.push(`/dashboard/massschuhauftraege/${orderId}?status=${encodeURIComponent(BODEN_STEP_STATUS)}`)
            } catch (e) {
                console.error(e)
                toast.error("Speichern fehlgeschlagen.")
            } finally {
                setIsSubmitting(false)
            }
        } else {
            toast.success("Bodenkonstruktion erfolgreich erstellt!", { id: "creating-bodenkonstruktion" })
            setShowModal2(false)
            setIsSubmitting(false)
            router.push("/dashboard/balance-dashboard")
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

    return (
        <div className="relative bg-white ">
            {prefillLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
                    <p className="text-sm font-medium text-gray-700">Lade Bodenkonstruktion...</p>
                </div>
            )}
            {/* Sticky Price Summary - bottom-right with Abbrechen + Weiter buttons (no price on customer-order page) */}
            <StickyPriceSummary
                price={grandTotal}
                onWeiterClick={handleWeiterClick}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                weiterLabel={orderId ? "Abschließen" : undefined}
                hidePrice={true}
            />

            {/* Header: product name + customer + delivery (no product image for standalone order) */}
            <div className="my-8">
                {/* <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                        FeetF1rst Massschuhpartner
                    </h1>
                </div> */}

                {/* header section — card layout */}
                <section className="rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                    <div className="p-5 sm:p-6 md:p-7">
                        <h2 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl mb-5 md:mb-6">
                            {shoe2.name || "Bodenkonstruktion"}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    <User className="size-3.5" />
                                    Kunde
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Kundenname eingeben"
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B9B87] focus:bg-white focus:ring-2 focus:ring-[#6B9B87]/20 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    <CalendarDays className="size-3.5" />
                                    Vorauss. Liefertermin
                                </label>
                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm font-medium text-gray-800">
                                    {deliveryDate}
                                </div>
                            </div>
                        </div>
                        {orderId && (
                            <div className="mt-4 pt-4 border-t border-gray-200/80">
                                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Bild (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="bodenkonstruktion-image"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file?.type.startsWith("image/")) {
                                            setBodenkonstruktionImageFile(file)
                                            const url = URL.createObjectURL(file)
                                            setBodenkonstruktionImagePreview(url)
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="bodenkonstruktion-image"
                                    className="flex flex-col items-center justify-center gap-2 w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                                >
                                    {bodenkonstruktionImagePreview ? (
                                        <img src={bodenkonstruktionImagePreview} alt="Bodenkonstruktion" className="max-h-24 object-contain rounded" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400" />
                                            <span className="text-xs text-gray-500">Bild hochladen</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Sole Selection Section */}
            <SoleSelectionSection
                selectedSole={selectedSole}
                onOpenModal={() => setShowSoleModal(true)}
                onClearSole={() => {
                    setSelectedSole(null)
                    setSole4Thickness(null)
                    setSole4Color(null)
                    setSole5Thickness(null)
                    setSole5Color(null)
                    setSole6Thickness(null)
                    setSole6Color(null)
                }}
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
                checkboxError={checkboxError}
                grandTotal={grandTotal}
                onWeiterClick={handleWeiterClick}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                hideActionButtons={true}
                selectedSole={selectedSole}
                showOrthopedicFields={true}
                onVorderkappeChange={setVorderkappeSide}
                vorderkappeSide={vorderkappeSide}
                onRahmenChange={setRahmen}
                rahmen={rahmen}
                onHinterkappeMusterChange={setHinterkappeMusterSide}
                hinterkappeMusterSide={hinterkappeMusterSide}
                onHinterkappeChange={setHinterkappeSide}
                hinterkappeSide={hinterkappeSide}
                onBrandsohleChange={setBrandsohleSide}
                brandsohleSide={brandsohleSide}
                verbindungslederUnifiedConfigUi={true}
                sohlenversteifungUnifiedConfigUi={true}
                sohlenversteifung={sohlenversteifung}
                onSohlenversteifungChange={setSohlenversteifung}
                sohlenaufbauUnifiedConfigUi={true}
                sohlenaufbau={sohlenaufbau}
                onSohlenaufbauChange={setSohlenaufbau}
                hideBrandsohlePrice={true}
                hideRahmenPrice={true}
                hideOptionPricesForGroupIds={["laufsohle_lose_beilegen"]}
                absatzAbrollhilfeUnifiedConfigUi={true}
                laufsohleLeistenUnifiedConfigUi={true}
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
                    vorderkappeSide={vorderkappeSide}
                    rahmen={rahmen}
                    hinterkappeMusterSide={hinterkappeMusterSide}
                    hinterkappeSide={hinterkappeSide}
                    brandsohleSide={brandsohleSide}
                    sohlenversteifung={sohlenversteifung}
                    sohlenaufbau={sohlenaufbau}
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
                    hidePrice={true}
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

export default function BodenkonstruktionCustomerOrderPage() {
    return <BodenkonstruktionCustomerOrderView />
}
