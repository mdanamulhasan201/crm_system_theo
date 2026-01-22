import React from "react"
import { GROUPS2 } from "../ShoeData"
import { SelectField, TextField, OptionGroup, HeelWidthAdjustmentField, type HeelWidthAdjustmentData } from "./FormFields"
import type { OptionInputsState, TextAreasState } from "./types"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"

interface ChecklistSectionProps {
    selected: SelectedState
    optionInputs: OptionInputsState
    setOptionInputs: React.Dispatch<React.SetStateAction<OptionInputsState>>
    textAreas: TextAreasState
    onSetGroup: (groupId: string, optId: string | null) => void
    onSetHinterkappeSub: (optId: string | null) => void
    onAbsatzFormClick: (groupId: string, optionId: string) => void
    onTextAreaChange: (key: string, value: string) => void
    onHeelWidthChange?: (value: HeelWidthAdjustmentData | null) => void
    heelWidthAdjustment?: HeelWidthAdjustmentData | null
    checkboxError: boolean
    grandTotal: number
    onWeiterClick: () => void
    onCancel: () => void
    isSubmitting?: boolean
}

export default function ChecklistSection({
    selected,
    optionInputs,
    setOptionInputs,
    textAreas,
    onSetGroup,
    onSetHinterkappeSub,
    onAbsatzFormClick,
    onTextAreaChange,
    onHeelWidthChange,
    heelWidthAdjustment,
    checkboxError,
    grandTotal,
    onWeiterClick,
    onCancel,
    isSubmitting = false,
}: ChecklistSectionProps) {
    return (
        <div className="bg-white rounded-lg p-4 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Checkliste</h2>

            {GROUPS2.map((g) => {
                // Normalize selected value for SelectField (convert array to string or null)
                const normalizeSelected = (value: string | string[] | null | undefined): string | null => {
                    if (!value) return null
                    if (Array.isArray(value)) {
                        return value.length > 0 ? value[0] : null
                    }
                    return value
                }

                return (
                <React.Fragment key={g.id}>
                    {g.fieldType === "select" ? (
                        <SelectField
                            def={g}
                            selected={normalizeSelected(selected[g.id])}
                            onSelect={(optId) => onSetGroup(g.id, optId)}
                            subSelected={g.id === "hinterkappe" ? normalizeSelected(selected.hinterkappe_sub) : undefined}
                            onSubSelect={g.id === "hinterkappe" ? onSetHinterkappeSub : undefined}
                        />
                    ) : g.fieldType === "text" ? (
                        <TextField 
                            def={g} 
                            selected={normalizeSelected(selected[g.id])} 
                            onSelect={(value) => onSetGroup(g.id, value)} 
                        />
                    ) : g.fieldType === "heelWidthAdjustment" ? (
                        <HeelWidthAdjustmentField
                            def={g}
                            value={heelWidthAdjustment || null}
                            onChange={onHeelWidthChange || (() => {})}
                        />
                    ) : (
                        <OptionGroup
                            def={g}
                            selected={selected[g.id] ?? null}
                            onSelect={(optId) => onSetGroup(g.id, optId)}
                            optionInputs={optionInputs}
                            setOptionInputs={setOptionInputs}
                            onOptionClick={onAbsatzFormClick}
                        />
                    )}
                    <hr className="border-gray-200 my-4" />
                </React.Fragment>
                )
            })}

            <div className="mb-4">
                <label className="block text-base font-bold text-gray-800 mb-2">Besondere Hinweise</label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                    placeholder="Textfeld"
                    value={textAreas.besondere_hinweise}
                    onChange={(e) => onTextAreaChange("besondere_hinweise", e.target.value)}
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
                    onClick={onCancel}
                >
                    Abbrechen
                </button>
                <button
                    className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onWeiterClick}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Wird gesendet...' : `Weiter €${grandTotal.toFixed(2)}`}
                </button>
            </div>
        </div>
    )
}

