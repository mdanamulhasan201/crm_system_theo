import React from "react"
import { GroupDef2 } from "../Types"
import { normalizeUnderscores } from "../HelperFunctions"
import type { OptionDef, OptionInputsState } from "./types"

type GroupDef = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text"
}

// SelectField Component
export function SelectField({
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

// TextField Component
export function TextField({
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

// InlineLabelWithInputs Component
export function InlineLabelWithInputs({
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

// OptionGroup Component
export function OptionGroup({
    def,
    selected,
    onSelect,
    optionInputs,
    setOptionInputs,
    onOptionClick,
}: {
    def: GroupDef
    selected: string | null
    onSelect: (optionId: string | null) => void
    optionInputs: OptionInputsState
    setOptionInputs: React.Dispatch<React.SetStateAction<OptionInputsState>>
    onOptionClick?: (groupId: string, optionId: string) => void
}) {
    const handleSelect = (optId: string) => {
        if (onOptionClick && def.id === "absatzform") {
            onOptionClick(def.id, optId)
        } else {
            onSelect(optId)
        }
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
            onDoubleClick={() => onSelect(null)}
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
                                    onClick={() => {
                                        if (def.id === "absatzform" && onOptionClick) {
                                            onOptionClick(def.id, opt.id)
                                        } else {
                                            handleSelect(opt.id)
                                        }
                                    }}
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
                                <label 
                                    htmlFor={inputId} 
                                    className="text-base text-gray-700 cursor-pointer"
                                    onClick={() => {
                                        if (def.id === "absatzform" && onOptionClick) {
                                            onOptionClick(def.id, opt.id)
                                        } else {
                                            handleSelect(opt.id)
                                        }
                                    }}
                                >
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

