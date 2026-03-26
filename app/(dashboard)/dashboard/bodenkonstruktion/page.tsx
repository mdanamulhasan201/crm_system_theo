"use client"
import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, User } from "lucide-react"
import { GROUPS2, shoe2 } from "../_components/Massschuhauftraeges/Details/ShoeData"
import PDFPopup, { OrderDataForPDF } from "../_components/Massschuhauftraeges/Details/PDFPopup"
import CompletionPopUp from "../_components/Massschuhauftraeges/Details/Completion-PopUp"
import toast from "react-hot-toast"

// Types
import type { OptionInputsState, TextAreasState } from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/types"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"
import {
    defaultSohlenversteifungData,
    defaultSohlenaufbauData,
    type HeelWidthAdjustmentData,
    type VorderkappeSideData,
    type RahmenData,
    type HinterkappeMusterSideData,
    type HinterkappeSideData,
    type BrandsohleSideData,
    type SohlenversteifungData,
    type SohlenaufbauData,
} from "../_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields"

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
import { createCustomBodenkonstruktion } from "@/apis/MassschuheManagemantApis"

// Hooks - delivery date by category
import { useDeliveryDateByCategory } from "@/hooks/useDeliveryDateByCategory"
import StickyPriceSummary from "@/components/StickyPriceSummary/StickyPriceSummary"

export default function BodenkonstruktionPage() {
    const router = useRouter()

    // Customer name state
    const [customerName, setCustomerName] = useState<string>("")

    // Form states
    const [selected, setSelected] = useState<SelectedState>({ hinterkappe: "kunststoff", sohlenversteifung: "nein" })
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

    // Hooks
    const { soleOptions } = useSoleData()
    const { deliveryDate: deliveryDateFromApi, days: deliveryDaysCount } = useDeliveryDateByCategory("Bodenkonstruktion")
    const deliveryDate = deliveryDateFromApi ?? (() => {
        const d = new Date()
        d.setDate(d.getDate() + deliveryDaysCount)
        return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    })()

    // Base price - start with 194,99€
    const basePrice = 194.99

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

    // Handle final form submission (deliveryDate from CompletionPopUp when deliveryCategory is set)
    const handleFinalSubmit = async (deliveryDate?: string | null) => {
        setIsSubmitting(true)
        try {
            const formData = await prepareCustomBodenkonstruktionFormData(pdfBlob, deliveryDate ?? undefined)
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
    const prepareCustomBodenkonstruktionFormData = async (pdfBlob: Blob | null, deliveryDateFromModal?: string): Promise<FormData> => {
        const formData = new FormData()

        // Add customer name
        if (customerName) {
            formData.append('other_customer_name', customerName)
        }

        // Add delivery date (ISO format) - from modal when provided (DD.MM.YYYY), else from API count
        if (deliveryDateFromModal && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(deliveryDateFromModal)) {
            const [d, m, y] = deliveryDateFromModal.split('.').map(Number)
            formData.append('deliveryDate', new Date(y, m - 1, d).toISOString())
        } else {
            const deliveryDateObj = new Date()
            deliveryDateObj.setDate(deliveryDateObj.getDate() + deliveryDaysCount)
            formData.append('deliveryDate', deliveryDateObj.toISOString())
        }

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
                musterErstellung: hinterkappeMusterSide?.musterErstellung ?? "",
                musterart: hinterkappeMusterSide?.musterart ?? "",
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

            // === Sohlenversteifung ===
            sohlenversteifung: getSelectedValue(selected.sohlenversteifung) || "nein",
            Sohlenversteifung: getSelectedValue(selected.sohlenversteifung) || "nein",
            sohlenversteifung_detail: sohlenversteifung,
            sohlenaufbau_detail: sohlenaufbau,

            // === 6. Konstruktionsart ===
            Konstruktionsart: getSelectedValue(selected.Konstruktionsart) || "",
            Konstruktionsart_price: 0,

            // === 7. Rahmen ===
            rahmen: {} as any,
            Rahmenfarbe: "",

            Sohlenmaterial: "",
            ohlenmaterial: "",
            Bevorzugte_Farbe: "",
            schlemmaterial_preferred_colour: "",
            Sohlenerhöhung: "nein",
            Seite_der_Sohlenerhöhung: "",
            Höhe_der_Sohlenerhöhung_mm: "",
            sole_elevation: {},

            // === 9. Absatz Form ===
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
                rightValues: brandsohleSide.rightValues || [],
                korkEnabled: Boolean(brandsohleSide.korkEnabled),
                korkPosition: brandsohleSide.korkPosition || "",
                korkDicke: brandsohleSide.korkDicke || "",
                korkCustomMm: brandsohleSide.korkCustomMm || "",
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
                rightMaterial: vorderkappeSide.rightMaterial || "",
                laenge: vorderkappeSide.laenge ?? "normal",
            }
        }

        // 5. Rahmen (with Rahmenfarbe)
        if (rahmen && rahmen.type) {
            bodenkonstruktionJson.rahmen = {
                type: rahmen.type,
                color: rahmen.color || "",
                verschalungHoehe: rahmen.verschalungHoehe ?? "",
                verschalungAusfuehrung: rahmen.verschalungAusfuehrung ?? "",
            }
            bodenkonstruktionJson.Rahmenfarbe = rahmen.color || ""
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
                onCancel={() => router.back()}
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
