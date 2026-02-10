import React from "react"
import { GroupDef2 } from "../Types"
import { normalizeUnderscores } from "../HelperFunctions"
import type { OptionDef, OptionInputsState } from "./types"

type GroupDef = {
    id: string
    question: string
    options: OptionDef[]
    fieldType?: "checkbox" | "select" | "text" | "heelWidthAdjustment" | "soleElevation" | "yesNo" | "vorderkappeSide" | "rahmen" | "sohlenhoeheDifferenziert" | "section" | "hinterkappeMusterSide" | "hinterkappeSide" | "brandsohleSide"
}

export type HeelWidthAdjustmentData = {
    // New structure: four specific fields for left/right and medial/lateral
    leftMedial?: { op: "widen" | "narrow" | null; mm: number }      // Linker Schuh – innen (medial)
    leftLateral?: { op: "widen" | "narrow" | null; mm: number }     // Linker Schuh – außen (lateral)
    rightMedial?: { op: "widen" | "narrow" | null; mm: number }     // Rechter Schuh – innen (medial)
    rightLateral?: { op: "widen" | "narrow" | null; mm: number }    // Rechter Schuh – außen (lateral)
    // Keep old fields for backward compatibility
    left?: { op: "widen" | "narrow" | null; mm: number }
    right?: { op: "widen" | "narrow" | null; mm: number }
    medial?: { op: "widen" | "narrow" | null; mm: number }
    lateral?: { op: "widen" | "narrow" | null; mm: number }
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

// HeelWidthAdjustmentField Component
export function HeelWidthAdjustmentField({
    def,
    value,
    onChange,
}: {
    def: GroupDef
    value: HeelWidthAdjustmentData | null
    onChange: (value: HeelWidthAdjustmentData | null) => void
}) {
    // New structure: four specific fields
    const leftMedial = value?.leftMedial || { op: null, mm: 0 }      // Linker Schuh – innen (medial)
    const leftLateral = value?.leftLateral || { op: null, mm: 0 }     // Linker Schuh – außen (lateral)
    const rightMedial = value?.rightMedial || { op: null, mm: 0 }     // Rechter Schuh – innen (medial)
    const rightLateral = value?.rightLateral || { op: null, mm: 0 }   // Rechter Schuh – außen (lateral)
    
    // Keep old fields for backward compatibility
    const left = value?.left || { op: null, mm: 0 }
    const right = value?.right || { op: null, mm: 0 }
    const medial = value?.medial || { op: null, mm: 0 }
    const lateral = value?.lateral || { op: null, mm: 0 }

    // Update functions for new structure
    const updateLeftMedial = (updates: Partial<typeof leftMedial>) => {
        const newLeftMedial = { ...leftMedial, ...updates }
        if (newLeftMedial.mm === 0) {
            newLeftMedial.op = null
        }
        const newValue: HeelWidthAdjustmentData = {
            ...value,
            leftMedial: newLeftMedial.mm > 0 ? newLeftMedial : undefined,
            leftLateral: value?.leftLateral,
            rightMedial: value?.rightMedial,
            rightLateral: value?.rightLateral,
        }
        if (!newValue.leftMedial && !newValue.leftLateral && !newValue.rightMedial && !newValue.rightLateral) {
            onChange(null)
        } else {
            onChange(newValue)
        }
    }

    const updateLeftLateral = (updates: Partial<typeof leftLateral>) => {
        const newLeftLateral = { ...leftLateral, ...updates }
        if (newLeftLateral.mm === 0) {
            newLeftLateral.op = null
        }
        const newValue: HeelWidthAdjustmentData = {
            ...value,
            leftMedial: value?.leftMedial,
            leftLateral: newLeftLateral.mm > 0 ? newLeftLateral : undefined,
            rightMedial: value?.rightMedial,
            rightLateral: value?.rightLateral,
        }
        if (!newValue.leftMedial && !newValue.leftLateral && !newValue.rightMedial && !newValue.rightLateral) {
            onChange(null)
        } else {
            onChange(newValue)
        }
    }

    const updateRightMedial = (updates: Partial<typeof rightMedial>) => {
        const newRightMedial = { ...rightMedial, ...updates }
        if (newRightMedial.mm === 0) {
            newRightMedial.op = null
        }
        const newValue: HeelWidthAdjustmentData = {
            ...value,
            leftMedial: value?.leftMedial,
            leftLateral: value?.leftLateral,
            rightMedial: newRightMedial.mm > 0 ? newRightMedial : undefined,
            rightLateral: value?.rightLateral,
        }
        if (!newValue.leftMedial && !newValue.leftLateral && !newValue.rightMedial && !newValue.rightLateral) {
            onChange(null)
        } else {
            onChange(newValue)
        }
    }

    const updateRightLateral = (updates: Partial<typeof rightLateral>) => {
        const newRightLateral = { ...rightLateral, ...updates }
        if (newRightLateral.mm === 0) {
            newRightLateral.op = null
        }
        const newValue: HeelWidthAdjustmentData = {
            ...value,
            leftMedial: value?.leftMedial,
            leftLateral: value?.leftLateral,
            rightMedial: value?.rightMedial,
            rightLateral: newRightLateral.mm > 0 ? newRightLateral : undefined,
        }
        if (!newValue.leftMedial && !newValue.leftLateral && !newValue.rightMedial && !newValue.rightLateral) {
            onChange(null)
        } else {
            onChange(newValue)
        }
    }
    
    // Helper function to render a single input field
    const renderInputField = (
        label: string,
        currentValue: { op: "widen" | "narrow" | null; mm: number },
        onUpdate: (updates: Partial<{ op: "widen" | "narrow" | null; mm: number }>) => void
    ) => {
        return (
            <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (currentValue.mm === 0) return
                            onUpdate({ op: currentValue.op === "widen" ? null : "widen" })
                        }}
                        className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                            currentValue.op === "widen"
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } ${currentValue.mm === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={currentValue.mm === 0}
                    >
                        +
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (currentValue.mm === 0) return
                            onUpdate({ op: currentValue.op === "narrow" ? null : "narrow" })
                        }}
                        className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                            currentValue.op === "narrow"
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } ${currentValue.mm === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={currentValue.mm === 0}
                    >
                        −
                    </button>
                    <select
                        value={currentValue.mm}
                        onChange={(e) => {
                            const mm = parseInt(e.target.value)
                            onUpdate({ mm, op: mm === 0 ? null : (currentValue.op || "widen") })
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                            <option key={val} value={val}>
                                {val} mm
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-4">
                {def.question}
                {def.id === "absatzbreite" && <span className="text-gray-500 font-normal text-sm ml-2">(Optional)</span>}
            </label>
            
            {/* 2×2 Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {/* Linker Schuh – innen (medial) */}
                {renderInputField(
                    "Linker Schuh – innen (medial)",
                    leftMedial,
                    updateLeftMedial
                )}
                
                {/* Linker Schuh – außen (lateral) */}
                {renderInputField(
                    "Linker Schuh – außen (lateral)",
                    leftLateral,
                    updateLeftLateral
                )}
                
                {/* Rechter Schuh – innen (medial) */}
                {renderInputField(
                    "Rechter Schuh – innen (medial)",
                    rightMedial,
                    updateRightMedial
                )}
                
                {/* Rechter Schuh – außen (lateral) */}
                {renderInputField(
                    "Rechter Schuh – außen (lateral)",
                    rightLateral,
                    updateRightLateral
                )}
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-500 mt-1">+ = aufbauen, − = einschleifen</p>
        </div>
    )
}

export type SoleElevationData = {
    enabled: boolean
    side: "links" | "rechts" | "beidseitig" | null
    height_mm: number
}

// SoleElevationField Component
export function SoleElevationField({
    def,
    value,
    onChange,
}: {
    def: GroupDef
    value: SoleElevationData | null
    onChange: (value: SoleElevationData | null) => void
}) {
    const enabled = value?.enabled || false
    const side = value?.side || null
    const height_mm = value?.height_mm || 0

    const handleEnabledChange = (newEnabled: boolean) => {
        if (newEnabled) {
            // When enabling, initialize with default values
            onChange({
                enabled: true,
                side: null,
                height_mm: 0,
            })
        } else {
            // When disabling, clear the data
            onChange(null)
        }
    }

    const handleSideChange = (newSide: "links" | "rechts" | "beidseitig") => {
        onChange({
            enabled: true,
            side: newSide,
            height_mm: height_mm,
        })
    }

    const handleHeightChange = (newHeight: number) => {
        onChange({
            enabled: true,
            side: side,
            height_mm: newHeight,
        })
    }

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <label className="block text-base font-bold text-gray-800">{def.question}</label>
                <div className="relative group">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-help hover:bg-gray-300 transition-colors">
                        <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Erhöhung der Sohle zum Ausgleich einer Beinlängendifferenz.
                    </div>
                </div>
            </div>
            
            {/* Ja/Nein Options - simple checkbox style like YesNoField */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {[
                    { id: "ja", label: "Ja", value: true },
                    { id: "nein", label: "Nein", value: false }
                ].map((option) => {
                    const isChecked = enabled === option.value
                    const handleToggle = () => {
                        // Toggle: if already checked, uncheck it; otherwise check it
                        if (isChecked) {
                            onChange(null)
                        } else {
                            handleEnabledChange(option.value)
                        }
                    }
                    return (
                        <div key={option.id} className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isChecked}
                                    onChange={handleToggle}
                                    aria-label={option.label}
                                />
                                <div 
                                    className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                        isChecked 
                                            ? 'bg-green-500 border-green-500 cursor-pointer' 
                                            : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                    }`}
                                    onClick={handleToggle}
                                >
                                    {isChecked && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-base text-gray-700 cursor-pointer" onClick={handleToggle}>
                                {option.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Conditional fields - shown only when "Ja" is selected */}
            {enabled && (
                <div className="ml-6 mt-4 space-y-4">
                    {/* Side Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Seite der Sohlenerhöhung
                        </label>
                        <select
                            value={side || ""}
                            onChange={(e) => {
                                const newSide = e.target.value as "links" | "rechts" | "beidseitig"
                                handleSideChange(newSide)
                            }}
                            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required={enabled}
                        >
                            <option value="">Bitte wählen</option>
                            <option value="links">Links</option>
                            <option value="rechts">Rechts</option>
                            <option value="beidseitig">Beidseitig</option>
                        </select>
                    </div>

                    {/* Height Input */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Höhe der Sohlenerhöhung (mm)
                            </label>
                            <div className="relative group">
                                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center cursor-help hover:bg-gray-300 transition-colors">
                                    <svg className="w-2.5 h-2.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    Die Angabe bezieht sich auf die gesamte Sohlenerhöhung.
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden w-fit">
                            <input
                                type="number"
                                className="w-32 px-3 py-2 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
                                placeholder="z. B. 5"
                                value={height_mm || ""}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0
                                    handleHeightChange(val)
                                }}
                                min="0"
                                step="0.1"
                                required={enabled}
                                aria-label="Höhe der Sohlenerhöhung"
                            />
                            <span className="text-base text-gray-700 px-3 py-2 bg-transparent border-l border-gray-300">mm</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// YesNoField Component (for simple Ja/Nein fields with tooltip)
export function YesNoField({
    def,
    selected,
    onSelect,
    tooltipText,
}: {
    def: GroupDef
    selected: string | null
    onSelect: (optionId: string | null) => void
    tooltipText?: string
}) {
    // Support both generic "ja/nein" and custom option values from def.options
    const options = def.options && def.options.length > 0 ? def.options : [
        { id: "ja", label: "Ja" },
        { id: "nein", label: "Nein" }
    ]

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <label className="block text-base font-bold text-gray-800">{def.question}</label>
                {tooltipText && (
                    <div className="relative group">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-help hover:bg-gray-300 transition-colors">
                            <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {tooltipText}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Options - simple checkbox style like Brandsohle */}
            <div className="flex flex-wrap items-center gap-4">
                {options.map((option) => {
                    const isChecked = selected === option.id
                    const handleToggle = () => {
                        // Toggle: if already checked, uncheck it; otherwise check it
                        onSelect(isChecked ? null : option.id)
                    }
                    return (
                        <div key={option.id} className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isChecked}
                                    onChange={handleToggle}
                                    aria-label={option.label}
                                />
                                <div 
                                    className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                        isChecked 
                                            ? 'bg-green-500 border-green-500 cursor-pointer' 
                                            : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                    }`}
                                    onClick={handleToggle}
                                >
                                    {isChecked && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-base text-gray-700 cursor-pointer" onClick={handleToggle}>
                                {option.label}
                            </span>
                        </div>
                    )
                })}
            </div>
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
    selectedSole,
    tooltipText,
}: {
    def: GroupDef & { multiSelect?: boolean }
    selected: string | string[] | null
    onSelect: (optionId: string | null) => void
    optionInputs: OptionInputsState
    setOptionInputs: React.Dispatch<React.SetStateAction<OptionInputsState>>
    onOptionClick?: (groupId: string, optionId: string) => void
    selectedSole?: { id: string; name: string; [key: string]: any } | null
    tooltipText?: string
}) {
    const isMultiSelect = def.multiSelect === true
    const selectedArray = isMultiSelect 
        ? (Array.isArray(selected) ? selected : (typeof selected === 'string' ? [selected] : []))
        : null
    const selectedValue = isMultiSelect ? null : (selected as string | null)

    const handleSelect = (optId: string) => {
        if (onOptionClick && def.id === "absatzform") {
            onOptionClick(def.id, optId)
        } else {
            // For multi-select, always pass the optionId (even when unselecting)
            // The setGroup handler will check if it's already in the array and toggle it
            if (isMultiSelect) {
                // Always pass the optionId - setGroup will handle the toggle logic
                onSelect(optId)
            } else {
                // Single select: Toggle: if already selected, unselect it; otherwise select it
                if (selectedValue === optId) {
                    onSelect(null)
                } else {
                    onSelect(optId)
                }
            }
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

    // Special layout for certain fields: question on top, options below
    const verticalLayoutFields = [
        "Konstruktionsart",
        "brandsohle",
        "schlemmaterial",
        "abrollhilfe",
        "absatzform",
        "laufsohle_lose_beilegen"
    ]
    const useVerticalLayout = verticalLayoutFields.includes(def.id)

    return (
        <div
            className={useVerticalLayout ? "mb-6" : "flex items-start mb-6"}
            role="radiogroup"
            aria-label={def.question}
            onDoubleClick={() => onSelect(null)}
        >
            <div className={`text-base font-bold text-gray-800 ${useVerticalLayout ? "mb-4" : "mr-6 min-w-[200px]"} flex items-center gap-2`}>
                <span>{def.question}</span>
                {tooltipText && (
                    <div className="relative group">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-help hover:bg-gray-300 transition-colors">
                            <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                            {tooltipText}
                        </div>
                    </div>
                )}
            </div>
            <div className={`flex flex-wrap items-center gap-4`}>
                {def.options.map((opt) => {
                    const isChecked = isMultiSelect 
                        ? (selectedArray?.includes(opt.id) || false)
                        : (selectedValue === opt.id)
                    
                    // Disable options based on selected sole:
                    // - Sole id "1": disable Keilabsatz and Stegkeil (absatzform)
                    // - Sole id "2" or "3": disable Absatzkeil (absatzform)
                    // - Sole id "8": disable Stegkeil and Absatzkeil (absatzform)
                    // - Sole id "9", "10", "11", or "12": disable Keilabsatz and Stegkeil (absatzform), disable Absatzrolle (abrollhilfe)
                    const shouldDisableDueToSole = 
                        (
                            (def.id === "absatzform" && 
                                (
                                    (selectedSole?.id === "1" && (opt.id === "Keilabsatz" || opt.id === "Stegkeil")) ||
                                    ((selectedSole?.id === "2" || selectedSole?.id === "3") && opt.id === "Absatzkeil") ||
                                    (selectedSole?.id === "8" && (opt.id === "Stegkeil" || opt.id === "Absatzkeil")) ||
                                    ((selectedSole?.id === "9" || selectedSole?.id === "10" || selectedSole?.id === "11" || selectedSole?.id === "12") && (opt.id === "Keilabsatz" || opt.id === "Stegkeil"))
                                )
                            ) ||
                            (def.id === "abrollhilfe" && (selectedSole?.id === "9" || selectedSole?.id === "10" || selectedSole?.id === "11" || selectedSole?.id === "12") && opt.id === "abzezzolle")
                        )
                    
                    const isDisabled = opt.disabled === true || shouldDisableDueToSole
                    const placeholderCount = getOptionInlineCount(opt.label)
                    const inputsForOpt = optionInputs[def.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")
                    const inputId = `opt-${def.id}-${opt.id}`

                    return (
                        <div
                            key={opt.id}
                            className="flex items-center gap-2"
                            onDoubleClick={(e) => {
                                if (!isDisabled) {
                                    e.stopPropagation()
                                    onSelect(null)
                                }
                            }}
                        >
                            <div className="relative flex items-center">
                                <input
                                    id={inputId}
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => !isDisabled && handleSelect(opt.id)}
                                    aria-label={opt.label}
                                    aria-disabled={isDisabled}
                                />
                                <div 
                                    className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                        isDisabled
                                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                                            : isChecked 
                                                ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                    }`}
                                    onClick={() => {
                                        if (isDisabled) return
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
                                    className={`text-base ${
                                        isDisabled 
                                            ? 'text-gray-400 cursor-not-allowed opacity-60' 
                                            : 'text-gray-700 cursor-pointer'
                                    } ${shouldDisableDueToSole ? 'line-through' : ''}`}
                                    onClick={() => !isDisabled && handleSelect(opt.id)}
                                    role="button"
                                    aria-label={opt.label}
                                    aria-disabled={isDisabled}
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
                                    className={`text-base ${
                                        isDisabled 
                                            ? 'text-gray-400 cursor-not-allowed opacity-60' 
                                            : 'text-gray-700 cursor-pointer'
                                    } ${shouldDisableDueToSole ? 'line-through' : ''}`}
                                    onClick={() => {
                                        if (isDisabled) return
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

// Vorderkappe Field - Side selection + Material selection (separate for each side)
export type VorderkappeSideSelection = "links" | "rechts" | "beidseitig" | null
export type VorderkappeMatSel = "leicht" | "normal" | "doppelt" | null

// Helper function to get display label for material
export const getVorderkappeMaterialLabel = (material: VorderkappeMatSel): string => {
    switch (material) {
        case "leicht":
            return "Leicht 0,5-0,6mm"
        case "normal":
            return "Normal 1-1,1mm"
        case "doppelt":
            return "Doppelt 2-2,20mm"
        default:
            return ""
    }
}

export type VorderkappeSideData = {
    side: VorderkappeSideSelection
    leftMaterial?: VorderkappeMatSel
    rightMaterial?: VorderkappeMatSel
}

export function VorderkappeSideField({
    def,
    value,
    onChange,
}: {
    def: GroupDef
    value: VorderkappeSideData | null
    onChange: (value: VorderkappeSideData | null) => void
}) {
    const side = value?.side || null
    const leftMaterial = value?.leftMaterial || null
    const rightMaterial = value?.rightMaterial || null

    const updateSide = (newSide: VorderkappeSideSelection) => {
        const newValue: VorderkappeSideData = {
            side: newSide,
            leftMaterial: (newSide === "links" || newSide === "beidseitig") ? (leftMaterial || null) : undefined,
            rightMaterial: (newSide === "rechts" || newSide === "beidseitig") ? (rightMaterial || null) : undefined,
        }
        onChange(newValue)
    }

    const updateLeftMaterial = (newMaterial: VorderkappeMatSel) => {
        if (!side) return
        const newValue: VorderkappeSideData = {
            side,
            leftMaterial: newMaterial,
            rightMaterial: rightMaterial,
        }
        onChange(newValue)
    }

    const updateRightMaterial = (newMaterial: VorderkappeMatSel) => {
        if (!side) return
        const newValue: VorderkappeSideData = {
            side,
            leftMaterial: leftMaterial,
            rightMaterial: newMaterial,
        }
        onChange(newValue)
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-3">{def.question}</label>
            
            {/* Side Selection */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Seite wählen:</div>
                <div className="flex flex-wrap items-center gap-4">
                    {["links", "rechts", "beidseitig"].map((sideOption) => {
                        const isChecked = side === sideOption
                        const handleToggle = () => {
                            // Toggle: if already checked, uncheck it; otherwise check it
                            updateSide(isChecked ? null : (sideOption as VorderkappeSideSelection))
                        }
                        return (
                            <div key={sideOption} className="flex items-center gap-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isChecked}
                                        onChange={handleToggle}
                                        aria-label={sideOption}
                                    />
                                    <div 
                                        className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                            isChecked 
                                                ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                        }`}
                                        onClick={handleToggle}
                                    >
                                        {isChecked && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-base text-gray-700 cursor-pointer capitalize" onClick={handleToggle}>
                                    {sideOption}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Material Selection - show based on selected side */}
            {side && (side === "links" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Material (Links):</div>
                    <div className="flex flex-wrap items-center gap-4">
                        {["leicht", "normal", "doppelt"].map((matOption) => {
                            const isChecked = leftMaterial === matOption
                            const handleToggle = () => {
                                // Toggle: if already checked, uncheck it; otherwise check it
                                updateLeftMaterial(isChecked ? null : (matOption as VorderkappeMatSel))
                            }
                            return (
                                <div key={matOption} className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={handleToggle}
                                            aria-label={`Material Links ${matOption}`}
                                        />
                                        <div 
                                            className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                                isChecked 
                                                    ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                    : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                            }`}
                                            onClick={handleToggle}
                                        >
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-base text-gray-700 cursor-pointer" onClick={handleToggle}>
                                        {getVorderkappeMaterialLabel(matOption as VorderkappeMatSel)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {side && (side === "rechts" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Material (Rechts):</div>
                    <div className="flex flex-wrap items-center gap-4">
                        {["leicht", "normal", "doppelt"].map((matOption) => {
                            const isChecked = rightMaterial === matOption
                            const handleToggle = () => {
                                // Toggle: if already checked, uncheck it; otherwise check it
                                updateRightMaterial(isChecked ? null : (matOption as VorderkappeMatSel))
                            }
                            return (
                                <div key={matOption} className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={handleToggle}
                                            aria-label={`Material Rechts ${matOption}`}
                                        />
                                        <div 
                                            className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                                isChecked 
                                                    ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                    : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                            }`}
                                            onClick={handleToggle}
                                        >
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-base text-gray-700 cursor-pointer" onClick={handleToggle}>
                                        {getVorderkappeMaterialLabel(matOption as VorderkappeMatSel)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// Rahmen Field - Selection + Color Text Input
export type RahmenData = {
    type: "eva" | "gummi" | null
    color?: string
}

export function RahmenField({
    def,
    value,
    onChange,
}: {
    def: GroupDef
    value: RahmenData | null
    onChange: (value: RahmenData | null) => void
}) {
    const type = value?.type || null
    const color = value?.color || ""

    const updateType = (newType: "eva" | "gummi" | null) => {
        if (newType === null) {
            onChange(null)
        } else {
            const newValue: RahmenData = {
                type: newType,
                color: newType === "gummi" ? color : undefined,
            }
            onChange(newValue)
        }
    }

    const updateColor = (newColor: string) => {
        if (type !== "gummi") return
        const newValue: RahmenData = {
            type,
            color: newColor,
        }
        onChange(newValue)
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-3">{def.question}</label>
            
            {/* Type Selection */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {[
                    { value: "eva", label: "EVA-Rahmen" },
                    { value: "gummi", label: "Gummi-Rahmen (+20,00 €)" }
                ].map((option) => {
                    const isChecked = type === option.value
                    const handleToggle = () => {
                        // Toggle: if already checked, uncheck it; otherwise check it
                        updateType(isChecked ? null : (option.value as "eva" | "gummi"))
                    }
                    return (
                        <div key={option.value} className="flex items-center gap-2">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isChecked}
                                    onChange={handleToggle}
                                    aria-label={option.label}
                                />
                                <div 
                                    className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                        isChecked 
                                            ? 'bg-green-500 border-green-500 cursor-pointer' 
                                            : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                    }`}
                                    onClick={handleToggle}
                                >
                                    {isChecked && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-base text-gray-700 cursor-pointer" onClick={handleToggle}>
                                {option.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Color Input - only show if Gummi-Rahmen is selected */}
            {type === "gummi" && (
                <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Rahmenfarbe
                    </label>
                    <input
                        type="text"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Farbe eingeben (z. B. Schwarz, Braun...)"
                        value={color}
                        onChange={(e) => updateColor(e.target.value)}
                    />
                </div>
            )}
        </div>
    )
}

// Sohlenhöhe Differenziert Field - 3 mm inputs (Ferse, Ballen, Spitze)
export type SohlenhoeheDifferenziertData = {
    ferse?: number
    ballen?: number
    spitze?: number
}

export function SohlenhoeheDifferenziertField({
    def,
    value,
    onChange,
}: {
    def: GroupDef
    value: SohlenhoeheDifferenziertData | null
    onChange: (value: SohlenhoeheDifferenziertData | null) => void
}) {
    const ferse = value?.ferse || 0
    const ballen = value?.ballen || 0
    const spitze = value?.spitze || 0

    const updateValue = (field: "ferse" | "ballen" | "spitze", newValue: number) => {
        const updatedData: SohlenhoeheDifferenziertData = {
            ferse: field === "ferse" ? newValue : ferse,
            ballen: field === "ballen" ? newValue : ballen,
            spitze: field === "spitze" ? newValue : spitze,
        }
        // Only save if at least one value is > 0
        if ((updatedData.ferse || 0) > 0 || (updatedData.ballen || 0) > 0 || (updatedData.spitze || 0) > 0) {
            onChange(updatedData)
        } else {
            onChange(null)
        }
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-3">{def.question}</label>
            <div className="text-sm text-gray-600 mb-3">
                Detaillierte Höhenangabe für orthopädische Fertigung
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ferse */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Ferse (mm)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        value={ferse || ""}
                        onChange={(e) => updateValue("ferse", parseFloat(e.target.value) || 0)}
                    />
                </div>
                
                {/* Ballen */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Ballen (mm)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        value={ballen || ""}
                        onChange={(e) => updateValue("ballen", parseFloat(e.target.value) || 0)}
                    />
                </div>
                
                {/* Spitze */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Spitze (mm)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        value={spitze || ""}
                        onChange={(e) => updateValue("spitze", parseFloat(e.target.value) || 0)}
                    />
                </div>
            </div>
        </div>
    )
}

// ============================================
// Left/Right Selection Fields
// ============================================

// Common type for side selection
export type SideSelection = "links" | "rechts" | "beidseitig" | null

// 1. Hinterkappe Muster Side Field
export type HinterkappeMusterSideData = {
    side: SideSelection
    leftValue?: "ja" | "nein" | null
    rightValue?: "ja" | "nein" | null
}

export function HinterkappeMusterSideField({
    def,
    value,
    onChange,
}: {
    def: GroupDef2
    value: HinterkappeMusterSideData | null
    onChange: (value: HinterkappeMusterSideData | null) => void
}) {
    const side = value?.side || null
    const leftValue = value?.leftValue || null
    const rightValue = value?.rightValue || null

    const updateSide = (newSide: SideSelection) => {
        const newValue: HinterkappeMusterSideData = {
            side: newSide,
            leftValue: (newSide === "links" || newSide === "beidseitig") ? (leftValue || null) : undefined,
            rightValue: (newSide === "rechts" || newSide === "beidseitig") ? (rightValue || null) : undefined,
        }
        onChange(newValue)
    }

    const updateLeftValue = (newValue: "ja" | "nein" | null) => {
        if (!side) return
        onChange({
            side,
            leftValue: newValue,
            rightValue: rightValue,
        })
    }

    const updateRightValue = (newValue: "ja" | "nein" | null) => {
        if (!side) return
        onChange({
            side,
            leftValue: leftValue,
            rightValue: newValue,
        })
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-3">{def.question}</label>
            <p className="text-sm text-gray-600 mb-3">Auswahl gilt separat für linken und rechten Schuh</p>
            
            {/* Side Selection */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Seite wählen:</div>
                <div className="flex flex-wrap items-center gap-4">
                    {["links", "rechts", "beidseitig"].map((sideOption) => {
                        const isChecked = side === sideOption
                        return (
                            <div key={sideOption} className="flex items-center gap-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isChecked}
                                        onChange={() => updateSide(isChecked ? null : (sideOption as SideSelection))}
                                        aria-label={sideOption}
                                    />
                                    <div 
                                        className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                            isChecked 
                                                ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                        }`}
                                        onClick={() => updateSide(isChecked ? null : (sideOption as SideSelection))}
                                    >
                                        {isChecked && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-base text-gray-700 cursor-pointer capitalize" onClick={() => updateSide(isChecked ? null : (sideOption as SideSelection))}>
                                    {sideOption}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Left Value Selection */}
            {side && (side === "links" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Auswahl (Links):</div>
                    <div className="flex flex-wrap items-center gap-4">
                        {def.options.map((opt) => {
                            const isChecked = leftValue === opt.id
                            return (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={() => updateLeftValue(isChecked ? null : (opt.id as "ja" | "nein"))}
                                            aria-label={`Links ${opt.label}`}
                                        />
                                        <div 
                                            className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                                isChecked 
                                                    ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                    : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                            }`}
                                            onClick={() => updateLeftValue(isChecked ? null : (opt.id as "ja" | "nein"))}
                                        >
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-base text-gray-700 cursor-pointer" onClick={() => updateLeftValue(isChecked ? null : (opt.id as "ja" | "nein"))}>
                                        {opt.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Right Value Selection */}
            {side && (side === "rechts" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Auswahl (Rechts):</div>
                    <div className="flex flex-wrap items-center gap-4">
                        {def.options.map((opt) => {
                            const isChecked = rightValue === opt.id
                            return (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={() => updateRightValue(isChecked ? null : (opt.id as "ja" | "nein"))}
                                            aria-label={`Rechts ${opt.label}`}
                                        />
                                        <div 
                                            className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                                isChecked 
                                                    ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                    : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                            }`}
                                            onClick={() => updateRightValue(isChecked ? null : (opt.id as "ja" | "nein"))}
                                        >
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-base text-gray-700 cursor-pointer" onClick={() => updateRightValue(isChecked ? null : (opt.id as "ja" | "nein"))}>
                                        {opt.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// 2. Hinterkappe Side Field (Material & Leder-Auswahl)
export type HinterkappeSideData = {
    side: SideSelection
    leftValue?: string | null
    leftSubValue?: string | null
    rightValue?: string | null
    rightSubValue?: string | null
}

export function HinterkappeSideField({
    def,
    value,
    onChange,
}: {
    def: GroupDef2
    value: HinterkappeSideData | null
    onChange: (value: HinterkappeSideData | null) => void
}) {
    const side = value?.side || null
    const leftValue = value?.leftValue || null
    const leftSubValue = value?.leftSubValue || null
    const rightValue = value?.rightValue || null
    const rightSubValue = value?.rightSubValue || null

    const updateSide = (newSide: SideSelection) => {
        const newValue: HinterkappeSideData = {
            side: newSide,
            leftValue: (newSide === "links" || newSide === "beidseitig") ? (leftValue || null) : undefined,
            leftSubValue: (newSide === "links" || newSide === "beidseitig") ? (leftSubValue || null) : undefined,
            rightValue: (newSide === "rechts" || newSide === "beidseitig") ? (rightValue || null) : undefined,
            rightSubValue: (newSide === "rechts" || newSide === "beidseitig") ? (rightSubValue || null) : undefined,
        }
        onChange(newValue)
    }

    const updateLeftValue = (newValue: string | null) => {
        if (!side) return
        onChange({
            side,
            leftValue: newValue,
            leftSubValue: newValue === "leder" ? leftSubValue : undefined,
            rightValue: rightValue,
            rightSubValue: rightSubValue,
        })
    }

    const updateLeftSubValue = (newValue: string | null) => {
        if (!side) return
        onChange({
            side,
            leftValue: leftValue,
            leftSubValue: newValue,
            rightValue: rightValue,
            rightSubValue: rightSubValue,
        })
    }

    const updateRightValue = (newValue: string | null) => {
        if (!side) return
        onChange({
            side,
            leftValue: leftValue,
            leftSubValue: leftSubValue,
            rightValue: newValue,
            rightSubValue: newValue === "leder" ? rightSubValue : undefined,
        })
    }

    const updateRightSubValue = (newValue: string | null) => {
        if (!side) return
        onChange({
            side,
            leftValue: leftValue,
            leftSubValue: leftSubValue,
            rightValue: rightValue,
            rightSubValue: newValue,
        })
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-3">{def.question}</label>
            <p className="text-sm text-gray-600 mb-3">Material und Leder können links und rechts unterschiedlich gewählt werden</p>
            
            {/* Side Selection */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Seite wählen:</div>
                <div className="flex flex-wrap items-center gap-4">
                    {["links", "rechts", "beidseitig"].map((sideOption) => {
                        const isChecked = side === sideOption
                        return (
                            <div key={sideOption} className="flex items-center gap-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isChecked}
                                        onChange={() => updateSide(isChecked ? null : (sideOption as SideSelection))}
                                        aria-label={sideOption}
                                    />
                                    <div 
                                        className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                            isChecked 
                                                ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                        }`}
                                        onClick={() => updateSide(isChecked ? null : (sideOption as SideSelection))}
                                    >
                                        {isChecked && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-base text-gray-700 cursor-pointer capitalize" onClick={() => updateSide(isChecked ? null : (sideOption as SideSelection))}>
                                    {sideOption}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Left Value Selection */}
            {side && (side === "links" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Material (Links):</div>
                    <select
                        className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none mb-2"
                        value={leftValue || ""}
                        onChange={(e) => updateLeftValue(e.target.value || null)}
                        aria-label="Material Links"
                    >
                        <option value="">Bitte wählen</option>
                        {def.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {leftValue === "leder" && def.subOptions?.leder && (
                        <div className="mt-2">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Leder Auswahl (Links):</div>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                                value={leftSubValue || ""}
                                onChange={(e) => updateLeftSubValue(e.target.value || null)}
                                aria-label="Leder Auswahl Links"
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
            )}

            {/* Right Value Selection */}
            {side && (side === "rechts" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Material (Rechts):</div>
                    <select
                        className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none mb-2"
                        value={rightValue || ""}
                        onChange={(e) => updateRightValue(e.target.value || null)}
                        aria-label="Material Rechts"
                    >
                        <option value="">Bitte wählen</option>
                        {def.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {rightValue === "leder" && def.subOptions?.leder && (
                        <div className="mt-2">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Leder Auswahl (Rechts):</div>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                                value={rightSubValue || ""}
                                onChange={(e) => updateRightSubValue(e.target.value || null)}
                                aria-label="Leder Auswahl Rechts"
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
            )}
        </div>
    )
}

// 3. Brandsohle Side Field
export type BrandsohleSideData = {
    side: SideSelection
    leftValues?: string[] | null
    rightValues?: string[] | null
}

export function BrandsohleSideField({
    def,
    value,
    onChange,
}: {
    def: GroupDef2
    value: BrandsohleSideData | null
    onChange: (value: BrandsohleSideData | null) => void
}) {
    const side = value?.side || null
    const leftValues = value?.leftValues || []
    const rightValues = value?.rightValues || []

    const updateSide = (newSide: SideSelection) => {
        const newValue: BrandsohleSideData = {
            side: newSide,
            leftValues: (newSide === "links" || newSide === "beidseitig") ? (leftValues || []) : undefined,
            rightValues: (newSide === "rechts" || newSide === "beidseitig") ? (rightValues || []) : undefined,
        }
        onChange(newValue)
    }

    const toggleLeftValue = (optionId: string) => {
        if (!side) return
        const currentArray = Array.isArray(leftValues) ? leftValues : []
        const newArray = currentArray.includes(optionId)
            ? currentArray.filter(id => id !== optionId)
            : [...currentArray, optionId]
        onChange({
            side,
            leftValues: newArray.length > 0 ? newArray : null,
            rightValues: rightValues,
        })
    }

    const toggleRightValue = (optionId: string) => {
        if (!side) return
        const currentArray = Array.isArray(rightValues) ? rightValues : []
        const newArray = currentArray.includes(optionId)
            ? currentArray.filter(id => id !== optionId)
            : [...currentArray, optionId]
        onChange({
            side,
            leftValues: leftValues,
            rightValues: newArray.length > 0 ? newArray : null,
        })
    }

    return (
        <div className="mb-6">
            <label className="block text-base font-bold text-gray-800 mb-3">{def.question}</label>
            <p className="text-sm text-gray-600 mb-3">Brandsohle kann links und rechts unterschiedlich konfiguriert werden</p>
            
            {/* Side Selection */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Seite wählen:</div>
                <div className="flex flex-wrap items-center gap-4">
                    {["links", "rechts", "beidseitig"].map((sideOption) => {
                        const isChecked = side === sideOption
                        return (
                            <div key={sideOption} className="flex items-center gap-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isChecked}
                                        onChange={() => updateSide(isChecked ? null : (sideOption as SideSelection))}
                                        aria-label={sideOption}
                                    />
                                    <div 
                                        className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                            isChecked 
                                                ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                        }`}
                                        onClick={() => updateSide(isChecked ? null : (sideOption as SideSelection))}
                                    >
                                        {isChecked && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-base text-gray-700 cursor-pointer capitalize" onClick={() => updateSide(isChecked ? null : (sideOption as SideSelection))}>
                                    {sideOption}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Left Values Selection */}
            {side && (side === "links" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Auswahl (Links):</div>
                    <div className="flex flex-wrap items-center gap-4">
                        {def.options.map((opt) => {
                            const isChecked = Array.isArray(leftValues) && leftValues.includes(opt.id)
                            return (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={() => toggleLeftValue(opt.id)}
                                            aria-label={`Links ${opt.label}`}
                                        />
                                        <div 
                                            className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                                isChecked 
                                                    ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                    : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                            }`}
                                            onClick={() => toggleLeftValue(opt.id)}
                                        >
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-base text-gray-700 cursor-pointer" onClick={() => toggleLeftValue(opt.id)}>
                                        {opt.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Right Values Selection */}
            {side && (side === "rechts" || side === "beidseitig") && (
                <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Auswahl (Rechts):</div>
                    <div className="flex flex-wrap items-center gap-4">
                        {def.options.map((opt) => {
                            const isChecked = Array.isArray(rightValues) && rightValues.includes(opt.id)
                            return (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={() => toggleRightValue(opt.id)}
                                            aria-label={`Rechts ${opt.label}`}
                                        />
                                        <div 
                                            className={`h-5 w-5 border-2 rounded transition-all flex items-center justify-center ${
                                                isChecked 
                                                    ? 'bg-green-500 border-green-500 cursor-pointer' 
                                                    : 'bg-white border-gray-300 hover:border-green-400 cursor-pointer'
                                            }`}
                                            onClick={() => toggleRightValue(opt.id)}
                                        >
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-base text-gray-700 cursor-pointer" onClick={() => toggleRightValue(opt.id)}>
                                        {opt.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

