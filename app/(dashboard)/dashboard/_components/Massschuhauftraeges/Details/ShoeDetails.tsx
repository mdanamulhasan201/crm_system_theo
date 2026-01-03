"use client"
import React, { useMemo, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GroupDef } from "./Types"
import { normalizeUnderscores, parseEuroFromText } from "./HelperFunctions"
import { GROUPS, shoe } from "./ShoeData"
import PDFPopup, { OrderDataForPDF } from "./PDFPopup"
import CompletionPopUp from "./Completion-PopUp"
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder"
import { FaArrowLeft } from "react-icons/fa"
import { Upload } from "lucide-react"
import { sendMassschuheOrderToAdmin1 } from "@/apis/MassschuheManagemantApis"
import toast from "react-hot-toast"

type OptionDef = {
    id: string
    label: string
}

type SelectedState = {
    [groupId: string]: string | null
}

type OptionInputsState = {
    [groupId: string]: {
        [optionId: string]: string[]
    }
}

type TextAreasState = {
    [key: string]: string
}

function TextField({
    def,
    selected,
    onSelect,
}: {
    def: GroupDef
    selected: string | null
    onSelect: (value: string) => void
}) {
    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-2">{def.question}</label>
            <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden w-fit">
                <input
                    type="number"
                    className="w-24 px-3 py-2 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
                    placeholder="...................."
                    value={selected || ""}
                    onChange={(e) => onSelect(e.target.value)}
                    aria-label={def.question}
                    step="0.01"
                    min="0"
                />
                <span className="text-base text-gray-700 px-3 py-2 bg-transparent border-l border-gray-300">mm</span>
            </div>
        </div>
    )
}

function TextAreaField({
    def,
    value,
    onChange,
}: {
    def: GroupDef
    value: string
    onChange: (value: string) => void
}) {
    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-2">{def.question}</label>
            <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={def.placeholder || def.question}
                aria-label={def.question}
            />
        </div>
    )
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="bg-gray-100 rounded-lg p-4 mb-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
    )
}

function InlineLabelWithInputs({
    groupId,
    option,
    values,
    onChange,
}: {
    groupId: string
    option: OptionDef
    values: string[]
    onChange: (idx: number, val: string) => void
}) {
    const normalized = normalizeUnderscores(option.label)
    const parts = normalized.split("___")

    const restrictNumber = (value: string): string => {
        const cleaned = value.replace(/[^\d.,]/g, "")
        if (cleaned === "") return ""

        const sepMatch = cleaned.match(/[.,]/)
        const sepIndex = sepMatch ? (sepMatch.index ?? -1) : -1
        const intPartRaw = sepIndex >= 0 ? cleaned.slice(0, sepIndex) : cleaned
        const intPart = intPartRaw.replace(/\D/g, "").slice(0, 2)
        if (sepIndex === -1) {
            return intPart
        }
        const decPartRaw = cleaned.slice(sepIndex + 1)
        const decPart = decPartRaw.replace(/\D/g, "").slice(0, 2)

        return `${intPart}.${decPart}`
    }

    const isNumericAt = (i: number): boolean => {
        if (groupId === "absatzhoehe") return true
        const prev = parts[i] ?? ""
        const next = parts[i + 1] ?? ""
        if (/\bmm\b/i.test(prev) || /\bmm\b/i.test(next)) return true
        return false
    }

    return (
        <span>
            {parts.map((part, idx) => (
                <React.Fragment key={idx}>
                    <span>{part}</span>
                    {idx < parts.length - 1 &&
                        (() => {
                            const numeric = isNumericAt(idx)
                            const val = values[idx] ?? ""
                            return (
                                <input
                                    type={numeric ? "number" : "text"}
                                    className={`inline-block mx-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent ${numeric ? "w-16" : "w-32"}`}
                                    aria-label={`Eingabefeld ${idx + 1} für ${option.label}`}
                                    value={val}
                                    onChange={(e) => onChange(idx, numeric ? restrictNumber(e.target.value) : e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                    inputMode={numeric ? "decimal" : undefined}
                                    step={numeric ? "0.01" : undefined}
                                    min={numeric ? 0 : undefined}
                                    placeholder={numeric ? "_ _ _" : "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _"}
                                />
                            )
                        })()}
                </React.Fragment>
            ))}
        </span>
    )
}

function OptionGroup({
    def,
    selected,
    onSelect,
    optionInputs,
    setOptionInputs,
}: {
    def: GroupDef
    selected: string | null
    onSelect: (optionId: string | null) => void
    optionInputs: OptionInputsState
    setOptionInputs: React.Dispatch<React.SetStateAction<OptionInputsState>>
}) {
    const handleSelect = (optId: string) => {
        onSelect(optId)
    }

    const handleDoubleClick = () => {
        onSelect(null)
    }

    const getOptionInlineCount = (label: string) => {
        const norm = normalizeUnderscores(label)
        return Math.max(0, norm.split("___").length - 1)
    }

    React.useEffect(() => {
        def.options.forEach((opt) => {
            const placeholderCount = getOptionInlineCount(opt.label)
            if (placeholderCount > 0) {
                const current = optionInputs[def.id]?.[opt.id] ?? []
                if (current.length !== placeholderCount) {
                    setOptionInputs((prev) => {
                        const prevGroup = prev[def.id] ?? {}
                        const nextValues = Array.from({ length: placeholderCount }, (_, i) => current[i] ?? "")
                        return {
                            ...prev,
                            [def.id]: {
                                ...prevGroup,
                                [opt.id]: nextValues,
                            },
                        }
                    })
                }
            }
        })
    }, [def, optionInputs, setOptionInputs])

    return (
        <div
            className="flex items-start mb-6"
            role="radiogroup"
            aria-label={def.question}
            onDoubleClick={handleDoubleClick}
        >
            <div className="text-base font-bold text-gray-800 mr-6 min-w-[200px]">{def.question}</div>
            <div className="flex flex-wrap items-center gap-4">
                {def.options.map((opt) => {
                    const isChecked = selected === opt.id
                    const placeholderCount = getOptionInlineCount(opt.label)
                    const inputsForOpt = optionInputs[def.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")

                    const inputId = `opt-${def.id}-${opt.id}`
                    return (
                        <div
                            key={opt.id}
                            className="flex items-center gap-2"
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                onSelect(null)
                            }}
                        >
                            <div className="relative flex items-center">
                                <input
                                    id={inputId}
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isChecked}
                                    onChange={() => handleSelect(opt.id)}
                                    aria-label={opt.label}
                                />
                                <div
                                    className={`h-5 w-5 border-2 rounded cursor-pointer transition-all flex items-center justify-center ${isChecked
                                        ? 'bg-green-500 border-green-500'
                                        : 'bg-white border-gray-300 hover:border-green-400'
                                        }`}
                                    onClick={() => handleSelect(opt.id)}
                                >
                                    {isChecked && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {placeholderCount > 0 ? (
                                <div
                                    className="text-base text-gray-700 cursor-pointer"
                                    onClick={() => handleSelect(opt.id)}
                                    role="button"
                                    aria-label={opt.label}
                                >
                                    <InlineLabelWithInputs
                                        groupId={def.id}
                                        option={opt}
                                        values={inputsForOpt}
                                        onChange={(idx, val) =>
                                            setOptionInputs((prev) => ({
                                                ...prev,
                                                [def.id]: {
                                                    ...(prev[def.id] ?? {}),
                                                    [opt.id]: inputsForOpt.map((v, i) => (i === idx ? val : v)),
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            ) : (
                                <label htmlFor={inputId} className="text-base text-gray-700 cursor-pointer">
                                    {opt.label}
                                </label>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

interface ShoeDetailsProps {
    orderId?: string | null
}

export default function ShoeDetails({ orderId: orderIdProp }: ShoeDetailsProps) {
    const [selected, setSelected] = useState<SelectedState>({})
    const [optionInputs, setOptionInputs] = useState<OptionInputsState>({})
    const [showModal2, setShowModal2] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get orderId from prop or URL search params
    const orderId = orderIdProp || searchParams?.get('orderId') || null
    const [textAreas, setTextAreas] = useState<TextAreasState>({
        korrektur_bereich: "",
        fussproblem_bettung: "",
        bettung_wuensche: "",
        fussproblem_leisten: "",
        leisten_wuensche: "",
    })
    const [showModal, setShowModal] = useState(false)
    const [checkboxError, setCheckboxError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // File upload states for STL files
    const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null)
    const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(null)
    const [linkerLeistenFileName, setLinkerLeistenFileName] = useState<string>("")
    const [rechterLeistenFileName, setRechterLeistenFileName] = useState<string>("")
    const linkerLeistenInputRef = useRef<HTMLInputElement>(null)
    const rechterLeistenInputRef = useRef<HTMLInputElement>(null)
    
    // PDF file state
    const [pdfFile, setPdfFile] = useState<File | null>(null)

    // Fetch order data if orderId is provided
    const { order } = useGetSingleMassschuheOrder(orderId ?? null)

    // Prepare order data for PDF
    const orderDataForPDF: OrderDataForPDF = useMemo(() => {
        if (!order) return {}

        // Format delivery date
        let formattedDeliveryDate = '-'
        if (order.delivery_date) {
            try {
                const date = new Date(order.delivery_date)
                formattedDeliveryDate = date.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
            } catch {
                formattedDeliveryDate = order.delivery_date
            }
        }

        // Calculate total price from order
        const fußanalysePrice = order.fußanalyse ?? 0
        const einlagenversorgungPrice = order.einlagenversorgung ?? 0
        const totalPrice = fußanalysePrice + einlagenversorgungPrice

        // Get footer data from order.user or order.partner
        const partnerData = (order as any).partner || (order as any).user

        return {
            orderNumber: order.orderNumber ? `#${order.orderNumber}` : `#${order.id?.slice(0, 8) || '000000'}`,
            customerName: order.kunde || 'Kunde',
            productName: 'Halbprobenerstellung',
            deliveryDate: formattedDeliveryDate,
            status: order.status,
            filiale: order.filiale,
            totalPrice: totalPrice > 0 ? totalPrice : undefined,
            // Footer data from order
            footerPhone: partnerData?.phone || undefined,
            footerEmail: partnerData?.email || undefined,
            footerBusinessName: partnerData?.busnessName || undefined,
            footerImage: partnerData?.image || null
        }
    }, [order])

    const setGroup = (groupId: string, optId: string | null) => {
        setSelected((prev) => ({ ...prev, [groupId]: optId }))
    }

    // Calculate total price from ALL selected options that have prices
    const extraPriceTotal = useMemo(() => {
        let sum = 0
        for (const group of GROUPS) {
            // Skip section headers and textareas as they don't have price options
            if (group.fieldType === "section" || group.fieldType === "textarea" || group.fieldType === "text") {
                continue
            }
            
            const selectedOptId = selected[group.id]
            if (!selectedOptId) continue
            
            const opt = group.options.find((o) => o.id === selectedOptId)
            if (!opt) continue
            
            // Parse price from option label (e.g., "+3,99€" or "(+3,99€)" or "(9,99€)")
            // The parseEuroFromText function handles formats like: (+3,99€), (+1,99€), (9,99€), +4,99€, etc.
            const price = parseEuroFromText(opt.label)
            if (price > 0) {
                sum += price
            }
        }
        return sum
    }, [selected])

    // Calculate total price: use order's price if available, otherwise calculate from selected options
    const grandTotal = useMemo(() => {
        // If order exists and has a totalPrice, use that
        if (order) {
            const fußanalysePrice = order.fußanalyse ?? 0
            const einlagenversorgungPrice = order.einlagenversorgung ?? 0
            const orderTotalPrice = fußanalysePrice + einlagenversorgungPrice
            
            if (orderTotalPrice > 0) {
                // Use order's price as base, then add selected options prices for real-time updates
                return orderTotalPrice + extraPriceTotal
            }
        }
        
        // Otherwise calculate from base shoe price + selected options
        return shoe.price + extraPriceTotal
    }, [order, extraPriceTotal])

    const requiredCheckboxGroups = useMemo(
        () => GROUPS.filter(g => !g.fieldType || g.fieldType === "checkbox").filter(g => g.fieldType !== "section" && g.fieldType !== "textarea"),
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

    return (
        <div className="relative bg-white">
            {/* back button */}
            <button className="px-6 cursor-pointer py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50" onClick={() => router.back()}>
                <FaArrowLeft />
            </button>
            {/* Header Section */}
            <div className="my-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-black">Willkommen zurück!</h1>
                </div>

                {/* Product Card */}
                <div className="bg-gray-100  p-4">
                    <div className="flex justify-center items-center gap-6">
                        {/* Image Section */}
                        <div className="bg-white rounded-lg p-4 flex-shrink-0">
                            <img
                                src={shoe.imageUrl || "/placeholder.svg"}
                                alt={shoe.name}
                                className="w-48 h-48 object-contain"
                            />
                        </div>

                        {/* Product Info Section */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-black mb-2">{orderDataForPDF.productName || shoe.name}</h2>
                            <p className="text-lg text-black mb-2">
                                Kunde: <span className="font-medium">{orderDataForPDF.customerName || shoe.brand}</span>
                            </p>
                            <p className="text-base text-black mb-4">
                                Bestellnr: <span className="font-bold">{orderDataForPDF.orderNumber || '#123456789'}</span> &nbsp; Liefertermin: <span className="font-bold">{orderDataForPDF.deliveryDate || '12.04.2024'}</span>
                            </p>
                            
                            {/* STL File Upload Buttons */}
                            <div className="flex flex-col gap-3 mt-4">
                                {/* Left Side Upload Button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => linkerLeistenInputRef.current?.click()}
                                        className="w-fit flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                    >
                                        <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-base text-gray-700">
                                            {linkerLeistenFileName || "Upload 3D-Datei Linker Leisten"}
                                        </span>
                                    </button>
                                    <input
                                        type="file"
                                        accept=".stl,.obj"
                                        ref={linkerLeistenInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setLinkerLeistenFile(file)
                                                setLinkerLeistenFileName(file.name)
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    {linkerLeistenFileName && (
                                        <div className="mt-2 text-sm text-green-600 font-medium">
                                            ✓ {linkerLeistenFileName}
                                        </div>
                                    )}
                                </div>

                                {/* Right Side Upload Button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => rechterLeistenInputRef.current?.click()}
                                        className="w-fit flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                    >
                                        <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-base text-gray-700">
                                            {rechterLeistenFileName || "Upload 3D-Datei Rechter Leisten"}
                                        </span>
                                    </button>
                                    <input
                                        type="file"
                                        accept=".stl,.obj"
                                        ref={rechterLeistenInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setRechterLeistenFile(file)
                                                setRechterLeistenFileName(file.name)
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    {rechterLeistenFileName && (
                                        <div className="mt-2 text-sm text-green-600 font-medium">
                                            ✓ {rechterLeistenFileName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Section */}
            <div className="bg-white rounded-lg p-4 mx-auto">

                {GROUPS.map((g) => (
                    <React.Fragment key={g.id}>
                        {g.fieldType === "section" ? (
                            <SectionHeader title={g.question} />
                        ) : g.fieldType === "textarea" ? (
                            <>
                                <TextAreaField
                                    def={g}
                                    value={textAreas[g.id] ?? ""}
                                    onChange={(value) => setTextAreas((prev) => ({ ...prev, [g.id]: value }))}
                                />
                                <hr className="border-gray-200 my-4" />
                            </>
                        ) : g.fieldType === "text" ? (
                            <>
                                <TextField def={g} selected={selected[g.id] ?? null} onSelect={(value) => setGroup(g.id, value)} />
                                <hr className="border-gray-200 my-4" />
                            </>
                        ) : (
                            <>
                                <OptionGroup
                                    def={g}
                                    selected={selected[g.id] ?? null}
                                    onSelect={(optId) => setGroup(g.id, optId)}
                                    optionInputs={optionInputs}
                                    setOptionInputs={setOptionInputs}
                                />
                                <hr className="border-gray-200 my-4" />
                            </>
                        )}
                    </React.Fragment>
                ))}

                {checkboxError && (
                    <div className="mb-4 text-red-600 text-sm">
                        Bitte beantworten Sie alle Pflichtfragen (Checkbox-Gruppen).
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        className="px-6 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                        onClick={() => router.back()}
                    >
                        Abbrechen
                    </button>
                    <button
                        className="px-6 py-2 cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold"
                        onClick={handleWeiterClick}
                    >
                        Weiter €{grandTotal.toFixed(2)}
                    </button>
                </div>
            </div>

            {showModal && (
                <PDFPopup
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false)
                    }}
                    onConfirm={(pdfBlob?: Blob) => {
                        // Convert PDF blob to File if available
                        if (pdfBlob) {
                            const pdfFileObj = new File([pdfBlob], 'invoice.pdf', { type: 'application/pdf' })
                            setPdfFile(pdfFileObj)
                        }
                        setShowModal(false)
                        setShowModal2(true)
                    }}
                    allGroups={GROUPS.filter((g) => g.fieldType !== "section" && g.fieldType !== "textarea")}
                    selected={selected}
                    optionInputs={optionInputs}
                    textAreas={textAreas}
                    showDetails={true}
                    orderData={orderDataForPDF}
                />
            )}

            {showModal2 && (
                <CompletionPopUp
                    onClose={() => setShowModal2(false)}
                    productName={shoe.name}
                    value={grandTotal.toFixed(2)}
                    isLoading={isSubmitting}
                    onConfirm={async () => {
                        // Check if orderId is available
                        if (!orderId) {
                            toast.error('Bestellungs-ID fehlt. Bitte versuchen Sie es erneut.')
                            setShowModal2(false)
                            return
                        }

                        setIsSubmitting(true)
                        try {
                            const formData = new FormData()
                            
                            // File uploads - Backend expects: image3d_1, image3d_2
                            if (linkerLeistenFile) {
                                formData.append('image3d_1', linkerLeistenFile)
                            }
                            
                            if (rechterLeistenFile) {
                                formData.append('image3d_2', rechterLeistenFile)
                            }
                            
                            if (pdfFile) {
                                formData.append('invoice', pdfFile)
                            }
                            
                            // Helper function to get selected option label
                            const getSelectedOptionLabel = (groupId: string): string => {
                                const selectedOptId = selected[groupId]
                                if (!selectedOptId) return ""
                                const group = GROUPS.find(g => g.id === groupId)
                                const option = group?.options.find(o => o.id === selectedOptId)
                                return option?.label || ""
                            }
                            
                            // Helper function to get selected option with inputs
                            const getSelectedOptionWithInputs = (groupId: string): string => {
                                const selectedOptId = selected[groupId]
                                if (!selectedOptId) return ""
                                const group = GROUPS.find(g => g.id === groupId)
                                const option = group?.options.find(o => o.id === selectedOptId)
                                if (!option) return ""
                                
                                const inputs = optionInputs[groupId]?.[selectedOptId] || []
                                const inputsString = inputs.filter(i => i.trim()).join(", ")
                                
                                if (inputsString) {
                                    // Replace placeholder underscores with actual input values
                                    let label = option.label
                                    const placeholderCount = (label.match(/_{3,}/g) || []).length
                                    if (placeholderCount > 0) {
                                        // Replace first placeholder with inputs
                                        label = label.replace(/_{3,}/, inputsString)
                                    } else {
                                        // Append inputs if no placeholder
                                        label = `${label} | ${inputsString}`
                                    }
                                    return label
                                }
                                return option.label
                            }
                            
                            // Add all required fields to FormData (send all fields, even if empty)
                            
                            // Bettung_korrigierend
                            const bettungValue = getSelectedOptionLabel("bettung")
                            formData.append('Bettung_korrigierend', bettungValue || "")
                            
                            // Bettungsdicke
                            const bettungsdickeValue = getSelectedOptionLabel("bettungsdicke")
                            formData.append('Bettungsdicke', bettungsdickeValue || "")
                            
                            // Haertegrad_Shore
                            const shoreValue = getSelectedOptionLabel("shore")
                            formData.append('Haertegrad_Shore', shoreValue || "")
                            
                            // Fersenschale
                            const fersenschaleValue = getSelectedOptionLabel("fersenschale")
                            formData.append('Fersenschale', fersenschaleValue || "")
                            
                            // Laengsgewölbestütze
                            const laengsgewoelbeValue = getSelectedOptionLabel("laengsgewoelbe")
                            formData.append('Laengsgewölbestütze', laengsgewoelbeValue || "")
                            
                            // Palotte_oder_Querpalotte
                            const pelotteValue = getSelectedOptionLabel("pelotte")
                            formData.append('Palotte_oder_Querpalotte', pelotteValue || "")
                            
                            // Korrektur_der_Fußstellung
                            const fussstellungValue = getSelectedOptionLabel("fussstellung")
                            formData.append('Korrektur_der_Fußstellung', fussstellungValue || "")
                            
                            // Zehenelemente_Details
                            const zehenelementeValue = getSelectedOptionWithInputs("zehenelemente")
                            formData.append('Zehenelemente_Details', zehenelementeValue || "")
                            
                            // eine_korrektur_nötig_ist
                            const korrekturBereichValue = textAreas["korrektur_bereich"] || ""
                            formData.append('eine_korrektur_nötig_ist', korrekturBereichValue)
                            
                            // Spezielles_Fußproblem
                            const fussproblemBettungValue = textAreas["fussproblem_bettung"] || ""
                            formData.append('Spezielles_Fußproblem', fussproblemBettungValue)
                            
                            // Zusatzkorrektur_Absatzerhöhung
                            const zusatzkorrekturenValue = getSelectedOptionWithInputs("zusatzkorrekturen")
                            formData.append('Zusatzkorrektur_Absatzerhöhung', zusatzkorrekturenValue || "")
                            
                            // Vertiefungen_Aussparungen
                            const vertiefungenValue = getSelectedOptionLabel("vertiefungen")
                            formData.append('Vertiefungen_Aussparungen', vertiefungenValue || "")
                            
                            // Oberfläche_finish
                            const finishValue = getSelectedOptionLabel("finish")
                            formData.append('Oberfläche_finish', finishValue || "")
                            
                            // Überzug_Stärke
                            const ueberzugValue = getSelectedOptionWithInputs("ueberzug")
                            formData.append('Überzug_Stärke', ueberzugValue || "")
                            
                            // Anmerkungen_zur_Bettung
                            const bettungWuenscheValue = textAreas["bettung_wuensche"] || ""
                            formData.append('Anmerkungen_zur_Bettung', bettungWuenscheValue)
                            
                            // Leisten_mit_ohne_Platzhalter
                            const leistenPlatzhalterValue = getSelectedOptionLabel("leisten_platzhalter")
                            formData.append('Leisten_mit_ohne_Platzhalter', leistenPlatzhalterValue || "")
                            
                            // Schuhleisten_Typ
                            const schuhleistenTypValue = getSelectedOptionLabel("schuhleisten_typ")
                            formData.append('Schuhleisten_Typ', schuhleistenTypValue || "")
                            
                            // Material_des_Leisten
                            const leistenMaterialValue = getSelectedOptionLabel("leisten_material")
                            formData.append('Material_des_Leisten', leistenMaterialValue || "")
                            
                            // Leisten_gleiche_Länge
                            const gleicheLaengeValue = getSelectedOptionLabel("gleiche_laenge")
                            formData.append('Leisten_gleiche_Länge', gleicheLaengeValue || "")
                            
                            // Absatzhöhe
                            const absatzhoeheValue = getSelectedOptionLabel("absatzhoehe")
                            formData.append('Absatzhöhe', absatzhoeheValue || "")
                            
                            // Abrollhilfe
                            const abrollhilfeValue = getSelectedOptionLabel("abrollhilfe")
                            formData.append('Abrollhilfe', abrollhilfeValue || "")
                            
                            // Spezielle_Fußprobleme_Leisten
                            const fussproblemLeistenValue = textAreas["fussproblem_leisten"] || ""
                            formData.append('Spezielle_Fußprobleme_Leisten', fussproblemLeistenValue)
                            
                            // Anmerkungen_zum_Leisten
                            const leistenWuenscheValue = textAreas["leisten_wuensche"] || ""
                            formData.append('Anmerkungen_zum_Leisten', leistenWuenscheValue)
                            
                            // totalPrice (always send)
                            formData.append('totalPrice', grandTotal.toFixed(2))
                            
                            console.log('Calling API with orderId:', orderId)
                            console.log('FormData entries:', Array.from(formData.entries()))
                            
                            const response = await sendMassschuheOrderToAdmin1(orderId, formData)
                            
                            // Check if response indicates failure
                            if (response && response.success === false && response.message) {
                                toast.error(response.message)
                                return
                            }
                            
                            toast.success('Bestellung erfolgreich gesendet')
                            router.push("/dashboard/balance-dashboard")
                            setShowModal2(false)
                        } catch (error: any) {
                            console.error('Error sending order:', error)
                            
                            // Extract error message from response
                            const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Senden der Bestellung'
                            toast.error(errorMessage)
                        } finally {
                            setIsSubmitting(false)
                        }
                    }}
                />
            )}
        </div>
    )
}
