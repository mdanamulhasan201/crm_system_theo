"use client"
import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { GroupDef2 } from "./Types"
import { normalizeUnderscores, parseEuroFromText } from "./HelperFunctions"
import { GROUPS2, shoe2 } from "./ShoeData"
import PDFPopup from "./PDFPopup"
import CompletionPopUp from "./Completion-PopUp"
import { FaArrowLeft } from "react-icons/fa"

type OptionDef = {
    id: string
    label: string
}

type GroupDef = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text"
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

function SelectField({
    def,
    selected,
    onSelect,
    subSelected,
    onSubSelect,
}: {
    def: GroupDef2
    selected: string | null
    onSelect: (optionId: string | null) => void
    subSelected?: string | null
    onSubSelect?: (optionId: string | null) => void
}) {
    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-2">{def.question}</label>
            <select
                className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                value={selected || ""}
                onChange={(e) => onSelect(e.target.value || null)}
                aria-label={def.question}
            >
                <option value="">Select</option>
                {def.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {def.id === "hinterkappe" && selected === "leder" && def.subOptions?.leder && (
                <div className="mt-4">
                    <label className="block text-base font-bold text-gray-800 mb-2">Leder Auswahl</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                        value={subSelected || ""}
                        onChange={(e) => onSubSelect && onSubSelect(e.target.value || null)}
                        aria-label="Leder Auswahl"
                    >
                        <option value="">Bitte wählen</option>
                        {def.subOptions.leder.map((opt: { id: string; label: string; price: number }) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
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
                    className="w-32 px-3 py-2 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
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
                                    className={`h-5 w-5 border-2 rounded cursor-pointer transition-all flex items-center justify-center ${
                                        isChecked 
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

export default function Bodenkonstruktion() {
    const [selected, setSelected] = useState<SelectedState>({ hinterkappe: "kunststoff" })
    const [optionInputs, setOptionInputs] = useState<OptionInputsState>({})
    const [showModal2, setShowModal2] = useState(false)
    const router = useRouter()
    const [textAreas, setTextAreas] = useState<TextAreasState>({
        besondere_hinweise: "",
    })
    const [showModal, setShowModal] = useState(false)
    const [checkboxError, setCheckboxError] = useState(false)

    const setGroup = (groupId: string, optId: string | null) => {
        setSelected((prev) => ({ ...prev, [groupId]: optId }))
        if (groupId === "hinterkappe" && optId !== "leder") {
            setSelected((prev) => ({ ...prev, hinterkappe_sub: null }))
        }
    }
    const setHinterkappeSub = (optId: string | null) => {
        setSelected((prev) => ({ ...prev, hinterkappe_sub: optId }))
    }

    const extraPriceTotal = useMemo(() => {
        let sum = 0
        for (const group of GROUPS2) {
            const selectedOptId = selected[group.id]
            if (!selectedOptId) continue
            const opt = group.options.find((o) => o.id === selectedOptId)
            if (!opt) continue
            sum += parseEuroFromText(opt.label)
            if (group.id === "hinterkappe" && selectedOptId === "leder" && group.subOptions?.leder) {
                const subId = selected.hinterkappe_sub
                const subOpt = group.subOptions.leder.find((o) => o.id === subId)
                if (subOpt) sum += subOpt.price
            }
        }
        return sum
    }, [selected])

    const grandTotal = useMemo(() => shoe2.price + extraPriceTotal, [extraPriceTotal])

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

    return (
        <div className="relative bg-white ">
            {/* back button */}
            <button className="px-6 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50" onClick={() => router.back()}>
                <FaArrowLeft />
            </button>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-black">FeetF1rst Massschuhpartner</h1>

                </div>

                {/* Product Card */}
                <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex gap-6">
                        {/* Image Section */}
                        <div className="bg-white rounded-lg p-4 flex-shrink-0">
                            <img
                                src={shoe2.imageUrl || "/placeholder.svg"}
                                alt={shoe2.name}
                                className="w-48 h-48 object-contain"
                            />
                        </div>

                        {/* Product Info Section */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-black mb-2">{shoe2.name}</h2>
                            <p className="text-lg text-black mb-2">{shoe2.brand}</p>
                            <p className="text-base text-black mb-4">
                                Bestellnr: <span className="font-bold">#121212</span> &nbsp; Voraussichtlicher Liefertermin: <span>10.02.2025</span>
                            </p>
                            <p className="text-sm text-black underline cursor-pointer">
                                Bild hier hochladen, wenn die Bodenkonstruktion nach Vorlage erfolgen soll.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Section */}
            <div className="bg-white rounded-lg p-4 w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Checkliste</h2>

                {GROUPS2.map((g) => (
                    <React.Fragment key={g.id}>
                        {g.fieldType === "select" ? (
                            <SelectField
                                def={g}
                                selected={selected[g.id] ?? null}
                                onSelect={(optId) => setGroup(g.id, optId)}
                                subSelected={g.id === "hinterkappe" ? selected.hinterkappe_sub ?? null : undefined}
                                onSubSelect={g.id === "hinterkappe" ? setHinterkappeSub : undefined}
                            />
                        ) : g.fieldType === "text" ? (
                            <TextField def={g} selected={selected[g.id] ?? null} onSelect={(value) => setGroup(g.id, value)} />
                        ) : (
                            <OptionGroup
                                def={g}
                                selected={selected[g.id] ?? null}
                                onSelect={(optId) => setGroup(g.id, optId)}
                                optionInputs={optionInputs}
                                setOptionInputs={setOptionInputs}
                            />
                        )}
                        <hr className="border-gray-200 my-4" />
                    </React.Fragment>
                ))}

                <div className="mb-4">
                    <label className="block text-base font-bold text-gray-800 mb-2">Besondere Hinweise</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                        placeholder="Textfeld"
                        value={textAreas.besondere_hinweise}
                        onChange={(e) =>
                            setTextAreas((prev) => ({
                                ...prev,
                                besondere_hinweise: e.target.value,
                            }))
                        }
                    />
                </div>

                {checkboxError && (
                    <div className="mb-4 text-red-600 text-sm">
                        Bitte beantworten Sie alle Pflichtfragen (Checkbox-Gruppen).
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        className="px-6 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                        onClick={() => router.back()}
                    >
                        Abbrechen
                    </button>
                    <button
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold"
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
                    onConfirm={() => {
                        setShowModal(false)
                        setShowModal2(true)
                    }}
                    filteredGroups={GROUPS2.filter((g) => {
                        const sel = selected[g.id]
                        if (g.fieldType === "text" && sel && sel.trim() !== "") {
                            return true
                        }
                        if (sel && sel !== "" && sel !== null) {
                            const opt = g.options.find((o) => o.id === sel)
                            if (opt && opt.label && !["Keine", "Select"].includes(opt.label.trim())) {
                                return true
                            }
                            const inputs = optionInputs[g.id]?.[sel] || []
                            if (inputs.some((val) => val && val.trim() !== "")) {
                                return true
                            }
                        }
                        const optInputs = optionInputs[g.id] || {}
                        return Object.values(optInputs).some((arr) => arr.some((val) => val && val.trim() !== ""))
                    })}
                    selected={selected}
                    optionInputs={optionInputs}
                    textAreas={textAreas}
                />
            )}

            {showModal2 && (
                <CompletionPopUp
                    onClose={() => setShowModal2(false)}
                    productName={shoe2.name}
                    value={grandTotal.toFixed(2)}
                    onConfirm={() => {
                        router.push("/dashboard/balance-dashboard")
                        setShowModal2(false)
                    }}
                />
            )}
        </div>
    )
}
