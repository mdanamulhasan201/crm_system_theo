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
import { buildSohlenaufbauGlbBlob } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/sohlenaufbau/sohlenaufbauExport"
import { canExportSohlenaufbau3d, getSohlenaufbauPreviewDataFromForm } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/sohlenaufbau/sohlenaufbauPreviewFromForm"

const DEFAULT_BODEN_ORDER_STEP_STATUS = "Halbprobe_durchführen"

type BodenkonstruktionCustomerOrderViewProps = {
    embeddedOrderId?: string | null
    onCloseEmbedded?: () => void
    /** Pre-filled customer name shown immediately when modal opens */
    defaultCustomerName?: string
    /** GET/redirect status for order-step Bodenkonstruktion (e.g. Halbprobe step vs. Bodenerstellen). */
    orderStepStatusForApi?: string
    /**
     * Standalone save handler (no orderId context).
     * When provided, "Abschließen" saves via this callback instead of
     * showing the PDF+completion popup flow.
     */
    onStandaloneSave?: (formData: FormData) => Promise<void>
    /**
     * sessionStorage key for standalone prefill (no orderId).
     * Parent writes `{ json, image }` before opening the modal;
     * this component reads and applies it once on mount.
     */
    standalonePrefillKey?: string
}

export function BodenkonstruktionCustomerOrderView({
    embeddedOrderId,
    onCloseEmbedded,
    defaultCustomerName = "",
    onStandaloneSave,
    standalonePrefillKey,
    orderStepStatusForApi = DEFAULT_BODEN_ORDER_STEP_STATUS,
}: BodenkonstruktionCustomerOrderViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = embeddedOrderId ?? searchParams.get("orderId")
    const handleCancel = onCloseEmbedded ?? (() => router.back())
    const prefillDoneRef = useRef(false)

    // Customer name state — initialize with defaultCustomerName so it shows immediately
    const [customerName, setCustomerName] = useState<string>(defaultCustomerName)

    // Form states
    const [selected, setSelected] = useState<SelectedState>({
        hinterkappe: "kunststoff",
        sohlenversteifung: "nein",
        verbindungsleder: "ja",
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

    const applyPrefillData = (json: any, imageUrl?: string | null) => {
        if (!json || typeof json !== "object") return

        // The JSON builder stores the full `selected` state under `checklist_selected`.
        // Support both keys so any stored JSON (old or new) restores correctly.
        const selectedData = json.selected ?? json.checklist_selected
        if (selectedData && typeof selectedData === "object") setSelected(selectedData as SelectedState)

        if (json.sohlenversteifung_detail != null) {
            setSohlenversteifung(normalizeSohlenversteifungData(json.sohlenversteifung_detail))
        } else if (json.form_data_v2?.sohlenversteifung != null) {
            setSohlenversteifung(normalizeSohlenversteifungData(json.form_data_v2.sohlenversteifung))
        } else if (json.sohlenversteifung != null && typeof json.sohlenversteifung === "object" && !Array.isArray(json.sohlenversteifung)) {
            setSohlenversteifung(normalizeSohlenversteifungData(json.sohlenversteifung))
        }

        if (json.sohlenaufbau_detail != null) {
            setSohlenaufbau(normalizeSohlenaufbauData(json.sohlenaufbau_detail))
        } else if (json.form_data_v2?.sohlenaufbau != null) {
            setSohlenaufbau(normalizeSohlenaufbauData(json.form_data_v2.sohlenaufbau))
        } else if (json.sohlenaufbau != null && typeof json.sohlenaufbau === "object" && !Array.isArray(json.sohlenaufbau)) {
            setSohlenaufbau(normalizeSohlenaufbauData(json.sohlenaufbau))
        }

        if (json.optionInputs && typeof json.optionInputs === "object") setOptionInputs(json.optionInputs as OptionInputsState)
        const textAreasData = json.textAreas ?? json.text_areas
        if (textAreasData && typeof textAreasData === "object") setTextAreas((prev) => ({ ...prev, ...textAreasData } as TextAreasState))
        if (typeof json.customerName === "string" && json.customerName.trim()) setCustomerName(json.customerName)

        // The JSON builder stores heelWidthAdjustment under `heel_width_adjustment` (top-level)
        // and also inside `form_data_v2.absatz_abrollhilfe.heel_width_adjustment`.
        const heelData =
            json.heelWidthAdjustment ??
            json.heel_width_adjustment ??
            json.form_data_v2?.absatz_abrollhilfe?.heel_width_adjustment ??
            null
        if (heelData != null) setHeelWidthAdjustment(heelData as HeelWidthAdjustmentData | null)

        const vorderkappeData = json.vorderkappeSide ?? json.form_data_v2?.vorderkappe ?? null
        if (vorderkappeData != null) setVorderkappeSide(vorderkappeData as VorderkappeSideData | null)

        const rahmenData = json.rahmen ?? json.form_data_v2?.rahmen ?? null
        if (rahmenData != null) setRahmen(rahmenData as RahmenData | null)

        const hinterkappeMusterData = json.hinterkappeMusterSide ?? json.form_data_v2?.hinterkappe_muster ?? null
        if (hinterkappeMusterData != null) setHinterkappeMusterSide(hinterkappeMusterData as HinterkappeMusterSideData | null)

        const hinterkappeData = json.hinterkappeSide ?? json.form_data_v2?.hinterkappe ?? null
        if (hinterkappeData != null) setHinterkappeSide(hinterkappeData as HinterkappeSideData | null)

        const brandsohleData = json.brandsohleSide ?? json.form_data_v2?.brandsohle ?? null
        if (brandsohleData != null) setBrandsohleSide(brandsohleData as BrandsohleSideData | null)

        // selected_sole.id is the stored key; selectedSoleId is a legacy camelCase alias
        const soleId = json.selectedSoleId ?? json.selected_sole?.id ?? null
        if (soleId != null && Array.isArray(soleOptions)) {
            const sole = soleOptions.find((s: SoleType) => s.id === soleId)
            if (sole) setSelectedSole(sole)
        }

        // sole_variant_options is the stored key; direct keys are legacy aliases
        const sv = json.sole_variant_options ?? {}
        const s4t = json.sole4Thickness ?? sv.sole4Thickness ?? null
        const s4c = json.sole4Color ?? sv.sole4Color ?? null
        const s5t = json.sole5Thickness ?? sv.sole5Thickness ?? null
        const s5c = json.sole5Color ?? sv.sole5Color ?? null
        const s6t = json.sole6Thickness ?? sv.sole6Thickness ?? null
        const s6c = json.sole6Color ?? sv.sole6Color ?? null
        if (s4t != null) setSole4Thickness(s4t)
        if (s4c != null) setSole4Color(s4c)
        if (s5t != null) setSole5Thickness(s5t)
        if (s5c != null) setSole5Color(s5c)
        if (s6t != null) setSole6Thickness(s6t)
        if (s6c != null) setSole6Color(s6c)

        if (imageUrl) setBodenkonstruktionImagePreview(imageUrl)
    }

    // Prefill for embedded step flow: sessionStorage from parent, else GET order-step for this status.
    useEffect(() => {
        if (!onCloseEmbedded || !orderId) return
        let cancelled = false
        prefillDoneRef.current = true
        ;(async () => {
            try {
                const raw = sessionStorage.getItem(`bodenkonstruktion-embedded-prefill:${orderId}`)
                if (raw) {
                    const parsed = JSON.parse(raw)
                    applyPrefillData(parsed?.json, parsed?.image)
                } else {
                    const res: any = await getMassschuheOrderStepBodenkonstruktion(orderId, orderStepStatusForApi)
                    if (cancelled) return
                    const data = res?.data ?? res
                    const rawJson = data?.bodenkonstruktion_json
                    if (rawJson) {
                        const json = typeof rawJson === "string" ? (() => { try { return JSON.parse(rawJson) } catch { return null } })() : rawJson
                        if (json && typeof json === "object") {
                            applyPrefillData(json, data?.bodenkonstruktion_image)
                        }
                    }
                }
            } catch {
                /* empty form */
            } finally {
                if (!cancelled) setPrefillLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [onCloseEmbedded, orderId, orderStepStatusForApi, soleOptions])

    // Prefill for standalone draft flow (no orderId) – parent writes sessionStorage before opening
    useEffect(() => {
        if (orderId || !standalonePrefillKey || prefillDoneRef.current) return
        prefillDoneRef.current = true
        try {
            const raw = sessionStorage.getItem(standalonePrefillKey)
            if (raw) {
                const parsed = JSON.parse(raw)
                applyPrefillData(parsed?.json, parsed?.image)
            }
        } catch {
            // fallback to empty form
        } finally {
            setPrefillLoading(false)
        }
    }, [standalonePrefillKey, orderId, soleOptions])   // eslint-disable-line react-hooks/exhaustive-deps

    // Prefill from GET when orderId present (legacy/order-step flow)
    useEffect(() => {
        if (onCloseEmbedded) return
        if (!orderId || prefillDoneRef.current) return
        prefillDoneRef.current = true
        getMassschuheOrderStepBodenkonstruktion(orderId, orderStepStatusForApi)
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
                applyPrefillData(json, data?.bodenkonstruktion_image)
            })
            .catch(() => {})
            .finally(() => setPrefillLoading(false))
    }, [orderId, soleOptions, onCloseEmbedded, orderStepStatusForApi])

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
        const isEmbedded = Boolean(orderId)
        // Also skip validations when a standalone save handler is provided
        const skipValidation = isEmbedded || Boolean(onStandaloneSave)

        // Validate customer name (skip for embedded modal)
        if (!skipValidation && !customerName.trim()) {
            toast.error("Bitte geben Sie einen Kundennamen ein.")
            return
        }

        // Validate required checkboxes (skip for embedded modal)
        if (!skipValidation) {
            if (!isAllCheckboxAnswered) {
                setCheckboxError(true)
                return
            }
            setCheckboxError(false)
        }

        // Validate sole selections (skip for embedded modal)
        if (!skipValidation) {
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
        }

        // When from order step (orderId) OR standalone save handler: save directly without modals
        if (isEmbedded || onStandaloneSave) {
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

    // Helper function to convert image to File
    const convertImageToFile = async (imageString: string, fileName: string = 'custom_model.png'): Promise<File | null> => {
        try {
            if (!imageString) return null
            if (imageString.startsWith('data:')) {
                const response = await fetch(imageString)
                const blob = await response.blob()
                return new File([blob], fileName, { type: blob.type })
            }
            if (imageString.startsWith('http') || imageString.startsWith('/')) {
                const response = await fetch(imageString)
                if (response.ok) {
                    const blob = await response.blob()
                    return new File([blob], fileName, { type: blob.type })
                }
            }
            return null
        } catch {
            return null
        }
    }

    // Build full bodenkonstruktion FormData (same payload structure as bodenkonstruktion/page.tsx)
    // isEmbedded=true skips threeDFile/staticImage (not accepted by order-step endpoint)
    const prepareFullBodenkonstruktionFormData = async (isEmbedded = false): Promise<FormData> => {
        const formData = new FormData()

        if (orderId) formData.append("shoe_order_id", orderId)
        if (customerName) formData.append("other_customer_name", customerName)

        // Delivery date (14 days out)
        const deliveryDateObj = new Date()
        deliveryDateObj.setDate(deliveryDateObj.getDate() + 14)
        formData.append("deliveryDate", deliveryDateObj.toISOString())
        formData.append("totalPrice", grandTotal.toFixed(2))

        if (bodenkonstruktionImageFile) formData.append("bodenkonstruktion_image", bodenkonstruktionImageFile)

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

        const bodenkonstruktionJson: any = {
            customerName: customerName || "",

            Mehr_ansehen_image: selectedSole?.image || "",
            Mehr_ansehen_title: selectedSole?.name || "",
            Mehr_ansehen_description: selectedSole?.description || "",

            hinterkappe_muster: {
                mode: hinterkappeMusterSide?.mode ?? "",
                sameValue: hinterkappeMusterSide?.sameValue ?? "",
                leftValue: hinterkappeMusterSide?.leftValue ?? "",
                rightValue: hinterkappeMusterSide?.rightValue ?? "",
                musterErstellung: hinterkappeMusterSide?.musterErstellung ?? "",
                musterart: hinterkappeMusterSide?.musterart ?? "",
                ...(hinterkappeMusterSide?.mode === "gleich" && { samePrice: 0 }),
                ...(hinterkappeMusterSide?.mode === "unterschiedlich" && { leftPrice: 0, rightPrice: 0 }),
            },

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

            vorderkappe: {} as any,

            brandsohle: "" as any,
            brandsohle_price: 0,

            verbindungsleder: getSelectedValue(selected.verbindungsleder) || "",

            sohlenversteifung: getSelectedValue(selected.sohlenversteifung) || "nein",
            Sohlenversteifung: getSelectedValue(selected.sohlenversteifung) || "nein",
            sohlenversteifung_detail: sohlenversteifung,
            sohlenaufbau_detail: sohlenaufbau,

            Konstruktionsart: getSelectedValue(selected.Konstruktionsart) || "",
            Konstruktionsart_price: 0,

            rahmen: {} as any,
            Rahmenfarbe: "",

            absatz_form: getSelectedValue(selected.absatzform) || "",
            absatz_höhe_am_besten_wie_bei_leisten_beachten: getSelectedValue(selected.absatzhoehe) || "",
            absatz_form_achtung_bitte_achten_Sohle_beachten_ob_möglich: getSelectedValue(selected.absatzform) || "",

            abrollhilfe_Rolle: getSelectedValue(selected.abrollhilfe) || "",

            Absatzbreite_anpassen: heelWidthAdjustment ? JSON.stringify(heelWidthAdjustment) : "",
            Linker_Schuh_innen_medial: heelWidthAdjustment?.leftMedial ? `${heelWidthAdjustment.leftMedial.op || ""} ${heelWidthAdjustment.leftMedial.mm || 0}mm` : "",
            Linker_Schuh_außen_lateral: heelWidthAdjustment?.leftLateral ? `${heelWidthAdjustment.leftLateral.op || ""} ${heelWidthAdjustment.leftLateral.mm || 0}mm` : "",
            Rechter_Schuh_innen_medial: heelWidthAdjustment?.rightMedial ? `${heelWidthAdjustment.rightMedial.op || ""} ${heelWidthAdjustment.rightMedial.mm || 0}mm` : "",
            Rechter_Schuh_außen_lateral: heelWidthAdjustment?.rightLateral ? `${heelWidthAdjustment.rightLateral.op || ""} ${heelWidthAdjustment.rightLateral.mm || 0}mm` : "",
            heel_width_adjustment: heelWidthAdjustment || {},

            möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen: getSelectedValue(selected.laufsohle_lose_beilegen) || "",
            möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price: 0,

            leisten_belassen: getSelectedValue(selected.leisten_belassen) || "",

            besondere_hinweise: textAreas.besondere_hinweise || "",
            Besondere_Hinweise: textAreas.besondere_hinweise || "",
        }

        const konstruktionsartValue = getSelectedValue(selected.Konstruktionsart)
        if (konstruktionsartValue) {
            bodenkonstruktionJson.Konstruktionsart_price = getOptionPrice("Konstruktionsart", konstruktionsartValue)
        }

        const laufsohleValue = getSelectedValue(selected.laufsohle_lose_beilegen)
        if (laufsohleValue) {
            bodenkonstruktionJson.möchten_Sie_die_Laufsohle_lose_der_Bestellung_beilegen_price = getOptionPrice("laufsohle_lose_beilegen", laufsohleValue)
        }

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
                const leftSubPrice = getSubOptionPrice("hinterkappe", leftSub)
                bodenkonstruktionJson.leder_auswahl_links_price = leftSubPrice
                bodenkonstruktionJson.leder_auswahl = bodenkonstruktionJson.leder_auswahl || leftSub
                bodenkonstruktionJson.leder_auswahl_price += leftSubPrice
            }
            if (rightVal === "leder" && rightSub) {
                bodenkonstruktionJson.leder_auswahl_rechts = rightSub
                if (hinterkappeSide.mode === "unterschiedlich") {
                    const rightSubPrice = getSubOptionPrice("hinterkappe", rightSub)
                    bodenkonstruktionJson.leder_auswahl_rechts_price = rightSubPrice
                    bodenkonstruktionJson.leder_auswahl = bodenkonstruktionJson.leder_auswahl ? `${bodenkonstruktionJson.leder_auswahl},${rightSub}` : rightSub
                    bodenkonstruktionJson.leder_auswahl_price += rightSubPrice
                } else {
                    bodenkonstruktionJson.leder_auswahl_rechts = leftSub
                    bodenkonstruktionJson.leder_auswahl_rechts_price = bodenkonstruktionJson.leder_auswahl_links_price
                    bodenkonstruktionJson.leder_auswahl_price = bodenkonstruktionJson.leder_auswahl_links_price * 2
                }
            }
        } else if (selected.hinterkappe === "leder" && selected.hinterkappe_sub) {
            const hinterkappeSub = typeof selected.hinterkappe_sub === 'string' ? selected.hinterkappe_sub : null
            if (hinterkappeSub) {
                bodenkonstruktionJson.leder_auswahl = hinterkappeSub
                bodenkonstruktionJson.leder_auswahl_price = getSubOptionPrice("hinterkappe", hinterkappeSub)
            }
        }

        if (brandsohleSide && brandsohleSide.mode) {
            bodenkonstruktionJson.Seite_wählen = brandsohleSide.mode
            bodenkonstruktionJson.brandsohleSide = {
                mode: brandsohleSide.mode,
                sameValues: brandsohleSide.sameValues || [],
                leftValues: brandsohleSide.leftValues || [],
                rightValues: brandsohleSide.rightValues || [],
                korkEnabled: Boolean(brandsohleSide.korkEnabled),
                korkPosition: brandsohleSide.korkPosition || "",
                korkDicke: brandsohleSide.korkDicke || "",
                korkCustomMm: brandsohleSide.korkCustomMm || "",
            }
            let price = 0
            if (brandsohleSide.mode === "gleich") {
                for (const id of (brandsohleSide.sameValues || [])) {
                    price += getOptionPrice("brandsohle", id) * 2
                }
            } else {
                for (const id of (brandsohleSide.leftValues || [])) price += getOptionPrice("brandsohle", id)
                for (const id of (brandsohleSide.rightValues || [])) price += getOptionPrice("brandsohle", id)
            }
            bodenkonstruktionJson.brandsohle_price = price
            const firstVal = brandsohleSide.mode === "gleich" ? brandsohleSide.sameValues?.[0] : (brandsohleSide.leftValues?.[0] ?? brandsohleSide.rightValues?.[0] ?? null)
            if (firstVal) bodenkonstruktionJson.brandsohle = firstVal
            const legacyArr = brandsohleSide.mode === "gleich" ? brandsohleSide.sameValues : [...(brandsohleSide.leftValues || []), ...(brandsohleSide.rightValues || [])]
            if (legacyArr?.length) bodenkonstruktionJson.brandsohle_legacy = legacyArr.join(',')
        } else {
            const brandsohleValue = getSelectedValue(selected.brandsohle)
            if (brandsohleValue) {
                bodenkonstruktionJson.brandsohle = brandsohleValue
                bodenkonstruktionJson.brandsohle_price = getOptionPrice("brandsohle", brandsohleValue)
            }
        }

        if (vorderkappeSide && vorderkappeSide.mode) {
            bodenkonstruktionJson.vorderkappe = {
                mode: vorderkappeSide.mode,
                sameMaterial: vorderkappeSide.sameMaterial || "",
                leftMaterial: vorderkappeSide.leftMaterial || "",
                rightMaterial: vorderkappeSide.rightMaterial || "",
                laenge: vorderkappeSide.laenge ?? "normal",
            }
        }

        if (rahmen && rahmen.type) {
            bodenkonstruktionJson.rahmen = {
                type: rahmen.type,
                color: rahmen.color || "",
                verschalungHoehe: rahmen.verschalungHoehe ?? "",
                verschalungAusfuehrung: rahmen.verschalungAusfuehrung ?? "",
            }
            bodenkonstruktionJson.Rahmenfarbe = rahmen.color || ""
        }

        bodenkonstruktionJson.checklist_selected = removeNulls({ ...selected })
        bodenkonstruktionJson.option_inputs = removeNulls(optionInputs)
        bodenkonstruktionJson.text_areas = removeNulls(textAreas)
        bodenkonstruktionJson.selectedSoleId = selectedSole?.id ?? null
        bodenkonstruktionJson.selected_sole = selectedSole
            ? removeNulls({ id: selectedSole.id, name: selectedSole.name, image: selectedSole.image, description: selectedSole.description, des: selectedSole.des ?? "" })
            : ""
        bodenkonstruktionJson.sole_variant_options = removeNulls({ sole4Thickness, sole4Color, sole5Thickness, sole5Color, sole6Thickness, sole6Color })
        bodenkonstruktionJson.pricing = removeNulls({ basePrice, grandTotal, currency: "EUR" })
        bodenkonstruktionJson.form_data_v2 = removeNulls({
            absatz_abrollhilfe: {
                absatzform: getSelectedValue(selected.absatzform) || "",
                abrollhilfe: selected.abrollhilfe ?? null,
                absatzhoehe: getSelectedValue(selected.absatzhoehe) || "",
                heel_width_adjustment: heelWidthAdjustment || null,
            },
            sohlenaufbau: sohlenaufbau,
            sohlenversteifung: sohlenversteifung,
            rahmen: rahmen || null,
            vorderkappe: vorderkappeSide || null,
            hinterkappe_muster: hinterkappeMusterSide || null,
            hinterkappe: hinterkappeSide || null,
            brandsohle: brandsohleSide || null,
        })
        bodenkonstruktionJson.delivery_date_display = deliveryDate
        bodenkonstruktionJson.product_name = shoe2.name || ""

        const cleanedJson = removeNulls(bodenkonstruktionJson)
        formData.append("bodenkonstruktion_json", JSON.stringify(cleanedJson))

        if (!isEmbedded && canExportSohlenaufbau3d(sohlenaufbau)) {
            try {
                const previewForGlb = getSohlenaufbauPreviewDataFromForm(sohlenaufbau)
                const glbBlob = await buildSohlenaufbauGlbBlob(previewForGlb)
                if (glbBlob) formData.append("threeDFile", glbBlob, "sohlenaufbau.glb")
            } catch {
                /* GLB optional */
            }
        }

        if (!isEmbedded && selectedSole?.image) {
            const staticImageFile = await convertImageToFile(selectedSole.image, 'sole_image.png')
            if (staticImageFile) formData.append("staticImage", staticImageFile)
            else formData.append("staticImage", selectedSole.image)
        }

        return formData
    }

    // Handle final form submission: if orderId → POST order-step then redirect to order; else balance-dashboard
    const handleFinalSubmit = async (_deliveryDate?: string | null) => {
        setIsSubmitting(true)
        if (orderId) {
            try {
                const formData = await prepareFullBodenkonstruktionFormData(true)
                await updateMassschuheOrderStepBodenkonstruktion(orderId, formData)
                toast.success("Bodenkonstruktion gespeichert!", { id: "bodenkonstruktion-saved" })
                setShowModal2(false)
                if (onCloseEmbedded) {
                    onCloseEmbedded()
                } else {
                    router.push(`/dashboard/massschuhauftraege/${orderId}?status=${encodeURIComponent(orderStepStatusForApi)}`)
                }
            } catch (e) {
                console.error(e)
                toast.error("Speichern fehlgeschlagen.")
            } finally {
                setIsSubmitting(false)
            }
        } else if (onStandaloneSave) {
            try {
                // Build full FormData (include 3D + image for draft endpoint)
                const formData = await prepareFullBodenkonstruktionFormData(false)
                await onStandaloneSave(formData)
                setShowModal2(false)
                if (onCloseEmbedded) onCloseEmbedded()
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
                hinterkappeSplitConfigUi={true}
                vorderkappeUnifiedConfigUi={true}
                onHinterkappeChange={setHinterkappeSide}
                hinterkappeSide={hinterkappeSide}
                onBrandsohleChange={setBrandsohleSide}
                brandsohleSide={brandsohleSide}
                brandsohleUnifiedConfigUi={true}
                verbindungslederUnifiedConfigUi={true}
                sohlenversteifungUnifiedConfigUi={true}
                sohlenversteifung={sohlenversteifung}
                onSohlenversteifungChange={setSohlenversteifung}
                sohlenaufbauUnifiedConfigUi={true}
                sohlenaufbau={sohlenaufbau}
                onSohlenaufbauChange={setSohlenaufbau}
                konstruktionsartUnifiedConfigUi={true}
                rahmenUnifiedConfigUi={true}
                hideBrandsohlePrice={true}
                hideRahmenPrice={true}
                absatzAbrollhilfeUnifiedConfigUi={true}
                hideLaufsohleLeisten={true}
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
