import React from "react"
import { GROUPS2 } from "../ShoeData"
import { SelectField, TextField, OptionGroup, HeelWidthAdjustmentField, YesNoField, VorderkappeSideField, RahmenField, HinterkappeMusterSideField, HinterkappeMusterSimpleField, HinterkappeSideField, BrandsohleSideField, type HeelWidthAdjustmentData, type VorderkappeSideData, type RahmenData, type HinterkappeMusterSideData, type HinterkappeSideData, type BrandsohleSideData } from "./FormFields"
import HinterkappeUnifiedConfigCard from "./HinterkappeUnifiedConfigCard"
import VorderkappeUnifiedConfigCard from "./VorderkappeUnifiedConfigCard"
import BrandsohleUnifiedConfigCard from "./BrandsohleUnifiedConfigCard"
import VerbindungslederConfigCard from "./VerbindungslederConfigCard"
import SohlenversteifungConfigCard from "./SohlenversteifungConfigCard"
import KonstruktionsartConfigCard from "./KonstruktionsartConfigCard"
import RahmenUnifiedConfigCard from "./RahmenUnifiedConfigCard"
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
    checkboxError: boolean
    grandTotal: number
    onWeiterClick: () => void
    onCancel: () => void
    isSubmitting?: boolean
    /** When true, hide Abbrechen/Weiter buttons (e.g. when using StickyPriceSummary for actions) */
    hideActionButtons?: boolean
    selectedSole?: SoleType | null
    // Orthopedic fields - only shown when showOrthopedicFields is true
    showOrthopedicFields?: boolean
    onVorderkappeChange?: (value: VorderkappeSideData | null) => void
    vorderkappeSide?: VorderkappeSideData | null
    onRahmenChange?: (value: RahmenData | null) => void
    rahmen?: RahmenData | null
    // Left/Right selection fields
    onHinterkappeMusterChange?: (value: HinterkappeMusterSideData | null) => void
    hinterkappeMusterSide?: HinterkappeMusterSideData | null
    /** When true, show simple Ja/Nein for Hinterkappe Muster only (no Left/Right). Used e.g. on bodenkonstruktion page. */
    hinterkappeMusterSimple?: boolean
    /** When true: single „Hinterkappe“ config card (Muster + Musterart + Ausführung + Material). */
    hinterkappeSplitConfigUi?: boolean
    /** When true: „Vorderkappe“ als eine ConfigCard (Ausführung + Material + Länge). */
    vorderkappeUnifiedConfigUi?: boolean
    /** When true: „Brandsohle“ als eine ConfigCard (Ausführung + OptionCards + erweiterte Korkeinlage). */
    brandsohleUnifiedConfigUi?: boolean
    /** When true: „Verbindungsleder“ als ConfigCard (Ja/Nein mit RadioOption). */
    verbindungslederUnifiedConfigUi?: boolean
    /** When true: „Sohlenversteifung“ als ConfigCard (Ja/Nein, Standard Nein). */
    sohlenversteifungUnifiedConfigUi?: boolean
    /** When true: „Konstruktionsart“ als ConfigCard (RadioOption; Optionen aus ShoeData). */
    konstruktionsartUnifiedConfigUi?: boolean
    /** When true: „Rahmen“ als ConfigCard (Rahmentyp + Verschalung mit Bildern). */
    rahmenUnifiedConfigUi?: boolean
    onHinterkappeChange?: (value: HinterkappeSideData | null) => void
    hinterkappeSide?: HinterkappeSideData | null
    onBrandsohleChange?: (value: BrandsohleSideData | null) => void
    brandsohleSide?: BrandsohleSideData | null
    /** When true, hide price in Brandsohle option labels (e.g. customer-order page only) */
    hideBrandsohlePrice?: boolean
    /** When true, hide price in Rahmen option labels (e.g. customer-order page only) */
    hideRahmenPrice?: boolean
    /** Group IDs for which option labels are shown without price (e.g. ["laufsohle_lose_beilegen"] on customer-order page) */
    hideOptionPricesForGroupIds?: string[]
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
    hideActionButtons = false,
    selectedSole,
    // Orthopedic fields
    showOrthopedicFields = false,
    onVorderkappeChange,
    vorderkappeSide,
    onRahmenChange,
    rahmen,
    // Left/Right selection fields
    onHinterkappeMusterChange,
    hinterkappeMusterSide,
    hinterkappeMusterSimple = false,
    hinterkappeSplitConfigUi = false,
    vorderkappeUnifiedConfigUi = false,
    brandsohleUnifiedConfigUi = false,
    verbindungslederUnifiedConfigUi = false,
    sohlenversteifungUnifiedConfigUi = false,
    konstruktionsartUnifiedConfigUi = false,
    rahmenUnifiedConfigUi = false,
    onHinterkappeChange,
    hinterkappeSide,
    onBrandsohleChange,
    brandsohleSide,
    hideBrandsohlePrice = false,
    hideRahmenPrice = false,
    hideOptionPricesForGroupIds,
}: ChecklistSectionProps) {
    // Orthopedic field IDs that should only show when showOrthopedicFields is true
    const orthopedicFieldIds = [
        "orthopaedic_section",
        "hinterkappe_muster",
        "vorderkappe",
        "rahmen",
        "leisten_belassen"
    ]

    // Filter groups based on showOrthopedicFields flag
    const filteredGroups = showOrthopedicFields 
        ? GROUPS2 
        : GROUPS2.filter(g => !orthopedicFieldIds.includes(g.id))

    const hinterkappeMaterialGroupDef = GROUPS2.find((x) => x.id === "hinterkappe")

    return (
        <div className="bg-white rounded-lg p-4 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Checkliste</h2>

            {filteredGroups.map((g) => {
                // Normalize selected value for SelectField (convert array to string or null)
                const normalizeSelected = (value: string | string[] | null | undefined): string | null => {
                    if (!value) return null
                    if (Array.isArray(value)) {
                        return value.length > 0 ? value[0] : null
                    }
                    return value
                }

                const normalizedSelected = normalizeSelected(selected[g.id])

                return (
                    <React.Fragment key={g.id}>
                        {g.fieldType === "section" ? (
                            <>
                                <div className="mt-8 mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 bg-green-50 px-4 py-3 rounded-lg border-l-4 border-green-500">
                                        {g.question}
                                    </h3>
                                </div>
                            </>
                        ) : g.fieldType === "select" ? (
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
                        ) : g.fieldType === "yesNo" ? (
                            g.id === "verbindungsleder" && verbindungslederUnifiedConfigUi ? (
                                <VerbindungslederConfigCard
                                    selected={normalizedSelected}
                                    onSelect={(optId) => onSetGroup(g.id, optId)}
                                    subtitle={
                                        g.tooltipText ||
                                        "Lederstück zur Verbindung von Vorder- und Hinterkappe für zusätzliche Stabilität im Schaftbereich."
                                    }
                                />
                            ) : g.id === "sohlenversteifung" && sohlenversteifungUnifiedConfigUi ? (
                                <SohlenversteifungConfigCard
                                    selected={normalizedSelected}
                                    onSelect={(optId) => onSetGroup(g.id, optId)}
                                />
                            ) : (
                                <YesNoField
                                    def={g}
                                    selected={normalizedSelected}
                                    onSelect={(optId) => onSetGroup(g.id, optId)}
                                    tooltipText={g.tooltipText || (
                                        g.id === "verbindungsleder"
                                            ? "Lederstück zur Verbindung von Vorder- und Hinterkappe für zusätzliche Stabilität im Schaftbereich."
                                            : undefined
                                    )}
                                />
                            )
                        ) : g.fieldType === "hinterkappeMusterSide" && showOrthopedicFields ? (
                            hinterkappeSplitConfigUi && hinterkappeMaterialGroupDef ? (
                                <HinterkappeUnifiedConfigCard
                                    materialDef={hinterkappeMaterialGroupDef}
                                    musterValue={hinterkappeMusterSide || null}
                                    materialValue={hinterkappeSide || null}
                                    onMusterChange={onHinterkappeMusterChange || (() => {})}
                                    onMaterialChange={onHinterkappeChange || (() => {})}
                                />
                            ) : hinterkappeMusterSimple ? (
                                <HinterkappeMusterSimpleField
                                    def={g}
                                    value={hinterkappeMusterSide || null}
                                    onChange={onHinterkappeMusterChange || (() => {})}
                                />
                            ) : (
                                <HinterkappeMusterSideField
                                    def={g}
                                    value={hinterkappeMusterSide || null}
                                    onChange={onHinterkappeMusterChange || (() => {})}
                                />
                            )
                        ) : g.fieldType === "hinterkappeSide" && showOrthopedicFields ? (
                            hinterkappeSplitConfigUi ? null : (
                                <HinterkappeSideField
                                    def={g}
                                    value={hinterkappeSide || null}
                                    onChange={onHinterkappeChange || (() => {})}
                                />
                            )
                        ) : g.fieldType === "brandsohleSide" ? (
                            brandsohleUnifiedConfigUi ? (
                                <BrandsohleUnifiedConfigCard
                                    value={brandsohleSide || null}
                                    onChange={onBrandsohleChange || (() => {})}
                                    hidePrice={hideBrandsohlePrice}
                                />
                            ) : (
                                <BrandsohleSideField
                                    def={g}
                                    value={brandsohleSide || null}
                                    onChange={onBrandsohleChange || (() => {})}
                                    hidePrice={hideBrandsohlePrice}
                                />
                            )
                        ) : g.fieldType === "vorderkappeSide" && showOrthopedicFields ? (
                            vorderkappeUnifiedConfigUi ? (
                                <VorderkappeUnifiedConfigCard
                                    value={vorderkappeSide || null}
                                    onChange={onVorderkappeChange || (() => {})}
                                />
                            ) : (
                                <VorderkappeSideField
                                    def={g}
                                    value={vorderkappeSide || null}
                                    onChange={onVorderkappeChange || (() => {})}
                                />
                            )
                        ) : g.fieldType === "rahmen" && showOrthopedicFields ? (
                            rahmenUnifiedConfigUi ? (
                                <RahmenUnifiedConfigCard
                                    value={rahmen || null}
                                    onChange={onRahmenChange || (() => {})}
                                    hidePrice={hideRahmenPrice}
                                />
                            ) : (
                                <RahmenField
                                    def={g}
                                    value={rahmen || null}
                                    onChange={onRahmenChange || (() => {})}
                                    hidePrice={hideRahmenPrice}
                                />
                            )
                        ) : g.id === "Konstruktionsart" &&
                          konstruktionsartUnifiedConfigUi &&
                          g.fieldType === "checkbox" ? (
                            <KonstruktionsartConfigCard
                                options={g.options}
                                selected={normalizedSelected}
                                onSelect={(optId) => onSetGroup(g.id, optId)}
                            />
                        ) : (
                            <OptionGroup
                                def={g}
                                selected={selected[g.id] ?? null}
                                onSelect={(optId) => onSetGroup(g.id, optId)}
                                optionInputs={optionInputs}
                                setOptionInputs={setOptionInputs}
                                onOptionClick={onAbsatzFormClick}
                                selectedSole={selectedSole}
                                tooltipText={(g as any).tooltipText}
                                hidePriceForGroupIds={hideOptionPricesForGroupIds}
                            />
                        )}
                        {!(hinterkappeSplitConfigUi && g.id === "hinterkappe") && (
                            <hr className="border-gray-200 my-4" />
                        )}
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

            {!hideActionButtons && (
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
            )}
        </div>
    )
}

