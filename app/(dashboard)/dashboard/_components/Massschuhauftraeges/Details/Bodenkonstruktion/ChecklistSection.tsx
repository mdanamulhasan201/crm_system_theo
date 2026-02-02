import React from "react"
import { GROUPS2 } from "../ShoeData"
import { SelectField, TextField, OptionGroup, HeelWidthAdjustmentField, SoleElevationField, YesNoField, type HeelWidthAdjustmentData, type SoleElevationData } from "./FormFields"
import type { OptionInputsState, TextAreasState } from "./types"
import type { SelectedState } from "@/hooks/massschuhe/useBodenkonstruktionCalculations"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"

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
    onSoleElevationChange?: (value: SoleElevationData | null) => void
    soleElevation?: SoleElevationData | null
    checkboxError: boolean
    grandTotal: number
    onWeiterClick: () => void
    onCancel: () => void
    isSubmitting?: boolean
    selectedSole?: SoleType | null
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
    onSoleElevationChange,
    soleElevation,
    checkboxError,
    grandTotal,
    onWeiterClick,
    onCancel,
    isSubmitting = false,
    selectedSole,
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

                const normalizedSelected = normalizeSelected(selected[g.id])

                const showSohlenmaterialColorInput =
                    g.id === "schlemmaterial" && !!normalizedSelected

                return (
                    <React.Fragment key={g.id}>
                        {g.fieldType === "select" ? (
                            <SelectField
                                def={g}
                                selected={normalizedSelected}
                                onSelect={(optId) => onSetGroup(g.id, optId)}
                                subSelected={
                                    g.id === "hinterkappe"
                                        ? normalizeSelected(selected.hinterkappe_sub)
                                        : undefined
                                }
                                onSubSelect={g.id === "hinterkappe" ? onSetHinterkappeSub : undefined}
                            />
                        ) : g.fieldType === "text" ? (
                            <TextField
                                def={g}
                                selected={normalizedSelected}
                                onSelect={(value) => onSetGroup(g.id, value)}
                            />
                        ) : g.fieldType === "heelWidthAdjustment" ? (
                            <HeelWidthAdjustmentField
                                def={g}
                                value={heelWidthAdjustment || null}
                                onChange={onHeelWidthChange || (() => {})}
                            />
                        ) : g.fieldType === "soleElevation" ? (
                            <SoleElevationField
                                def={g}
                                value={soleElevation || null}
                                onChange={onSoleElevationChange || (() => {})}
                            />
                        ) : g.fieldType === "yesNo" ? (
                            <YesNoField
                                def={g}
                                selected={normalizedSelected}
                                onSelect={(optId) => onSetGroup(g.id, optId)}
                                tooltipText={
                                    g.id === "verbindungsleder"
                                        ? "Lederstück zur Verbindung von Vorder- und Hinterkappe für zusätzliche Stabilität im Schaftbereich."
                                        : undefined
                                }
                            />
                        ) : (
                            <>
                                <OptionGroup
                                    def={g}
                                    selected={selected[g.id] ?? null}
                                    onSelect={(optId) => onSetGroup(g.id, optId)}
                                    optionInputs={optionInputs}
                                    setOptionInputs={setOptionInputs}
                                    onOptionClick={onAbsatzFormClick}
                                    selectedSole={selectedSole}
                                />

                                {/* Bevorzugte Farbe input für Sohlenmaterial */}
                                {showSohlenmaterialColorInput && (
                                    <div className="mt-2 ml-10">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                                            Bevorzugte Farbe
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Bevorzugte Farbe (z. B. Schwarz, Dunkelblau …)"
                                            value={textAreas.schlemmaterial_preferred_colour || ""}
                                            onChange={(e) =>
                                                onTextAreaChange(
                                                    "schlemmaterial_preferred_colour",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <hr className="border-gray-200 my-4" />
                    </React.Fragment>
                )
            })}

            <div className="mb-4">
                <label className="block text-base font-bold text-gray-800 mb-2">
                    Besondere Hinweise <span className="text-gray-500 font-normal text-sm">(Optional)</span>
                </label>
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
                    className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onWeiterClick}
                    disabled={isSubmitting}
                >
                    {isSubmitting && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isSubmitting ? 'Wird gesendet...' : `Weiter €${grandTotal.toFixed(2)}`}
                </button>
            </div>
        </div>
    )
}

