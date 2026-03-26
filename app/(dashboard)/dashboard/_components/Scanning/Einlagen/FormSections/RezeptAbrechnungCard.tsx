import React, { useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import PositionsnummerDropdown from '../Dropdowns/PositionsnummerDropdown';
import EmployeeDropdown from '../../Common/EmployeeDropdown';

function RequiredMark({ show }: { show: boolean }) {
    if (!show) return null;
    return <span className="text-red-500 ml-0.5" aria-hidden>*</span>;
}

interface RezeptAbrechnungCardProps {
    // Diagnosis fields
    ausführliche_diagnose: string;
    onAusführlicheDiagnoseChange: (value: string) => void;
    ausführlicheDiagnoseError?: string;
    requireAusführlicheDiagnose?: boolean;
    versorgung_laut_arzt: string;
    onVersorgungLautArztChange: (value: string) => void;
    versorgungLautArztError?: string;
    requireVersorgungLautArzt?: boolean;

    // Positionsnummer
    billingType: 'Krankenkassa' | 'Privat';
    selectedPositionsnummer: string[];
    positionsnummerOptions: any[];
    positionsnummerError?: string;
    showPositionsnummerDropdown: boolean;
    onPositionsnummerToggle: () => void;
    onPositionsnummerSelect: (values: string[]) => void;
    onPositionsnummerClear?: () => void;
    positionsnummerDisabled?: boolean;
    itemSides?: Record<string, 'L' | 'R' | 'BDS'>;
    onItemSideChange?: (posNum: string, side: 'L' | 'R' | 'BDS') => void;
    vatCountry?: string;

    // Diagnose (multi-select)
    selectedDiagnosisList: string[];
    diagnosisOptions: readonly string[];
    showDiagnosisDropdown: boolean;
    onDiagnosisToggle: () => void;
    onDiagnosisSelect: (value: string) => void;
    onDiagnosisClear?: () => void;
    onCloseDiagnosisDropdown?: () => void;

    // Employee
    selectedEmployee: string;
    employeeSearchText: string;
    isEmployeeDropdownOpen: boolean;
    employeeSuggestions: any[];
    employeeLoading: boolean;
    onEmployeeSearchChange: (value: string) => void;
    onEmployeeDropdownChange: (open: boolean) => void;
    onEmployeeSelect: (employee: { employeeName: string; id: string }) => void;
    onEmployeeClear?: () => void;
    selectedEmployeeError?: string;
    requireEmployee?: boolean;
    requireDiagnosisList?: boolean;
    diagnosisListError?: string;
    requirePositionsnummer?: boolean;
    requireKva?: boolean;
    requireHalbprobe?: boolean;
    kvaFieldError?: string;
    halbprobeFieldError?: string;

    // KVA & Lieferschein
    kostenvoranschlag: boolean | null;
    onKostenvoranschlagChange: (value: boolean) => void;
    lieferschein: boolean | null;
    onLieferscheinChange: (value: boolean) => void;
}

export default function RezeptAbrechnungCard({
    ausführliche_diagnose,
    onAusführlicheDiagnoseChange,
    ausführlicheDiagnoseError,
    versorgung_laut_arzt,
    onVersorgungLautArztChange,
    billingType,
    selectedPositionsnummer,
    positionsnummerOptions,
    positionsnummerError,
    showPositionsnummerDropdown,
    onPositionsnummerToggle,
    onPositionsnummerSelect,
    onPositionsnummerClear,
    positionsnummerDisabled,
    itemSides,
    onItemSideChange,
    vatCountry,
    selectedDiagnosisList,
    diagnosisOptions,
    showDiagnosisDropdown,
    onDiagnosisToggle,
    onDiagnosisSelect,
    onDiagnosisClear,
    onCloseDiagnosisDropdown,
    selectedEmployee,
    employeeSearchText,
    isEmployeeDropdownOpen,
    employeeSuggestions,
    employeeLoading,
    onEmployeeSearchChange,
    onEmployeeDropdownChange,
    onEmployeeSelect,
    onEmployeeClear,
    selectedEmployeeError,
    requireAusführlicheDiagnose = true,
    requireVersorgungLautArzt = false,
    versorgungLautArztError,
    requireEmployee = true,
    requireDiagnosisList = false,
    diagnosisListError,
    requirePositionsnummer = true,
    requireKva = false,
    requireHalbprobe = false,
    kvaFieldError,
    halbprobeFieldError,
    kostenvoranschlag,
    onKostenvoranschlagChange,
    lieferschein,
    onLieferscheinChange,
}: RezeptAbrechnungCardProps) {
    const diagnosisRef = useRef<HTMLDivElement>(null);

    // VAT helpers (match PositionsnummerDropdown: country-wise)
    const getVatRate = (): number => {
        if (vatCountry === 'Italien (IT)') return 4;
        if (vatCountry === 'Österreich (AT)' || vatCountry === 'Austria (AT)') return 20;
        return 0;
    };
    const calculateSubtotal = (): number =>
        selectedPositionsnummer.reduce((sum, posNum) => {
            const option = positionsnummerOptions?.find(
                (o: any) =>
                    o?.positionsnummer === posNum || o?.description?.positionsnummer === posNum
            );
            const basePrice = typeof option?.price === 'number' ? option.price : 0;
            const side = itemSides?.[posNum] || 'R';
            return sum + (side === 'BDS' ? basePrice * 2 : basePrice);
        }, 0);
    const calculateVatAmount = (amount: number): number => (amount * getVatRate()) / 100;
    const calculateTotalWithVat = (amount: number): number => amount + calculateVatAmount(amount);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (onCloseDiagnosisDropdown && diagnosisRef.current && !diagnosisRef.current.contains(target)) {
                onCloseDiagnosisDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onCloseDiagnosisDropdown]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">REZEPT & ABRECHNUNG</h2>

            {/* Input Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ärztliche Diagnose
                        <RequiredMark show={requireAusführlicheDiagnose} />
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={ausführliche_diagnose}
                            onChange={(e) => onAusführlicheDiagnoseChange(e.target.value)}
                            placeholder="Diagnose eingeben..."
                            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                        />
                        {ausführliche_diagnose && (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={() => onAusführlicheDiagnoseChange('')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onAusführlicheDiagnoseChange('');
                                    }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                aria-label="Auswahl löschen"
                            >
                                <X className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                    {ausführlicheDiagnoseError && (
                        <p className="text-red-500 text-xs mt-1">{ausführlicheDiagnoseError}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Versorgung laut Arzt
                        <RequiredMark show={requireVersorgungLautArzt} />
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={versorgung_laut_arzt}
                            onChange={(e) => onVersorgungLautArztChange(e.target.value)}
                            placeholder="Versorgung laut Arzt..."
                            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                        />
                        {versorgung_laut_arzt && (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={() => onVersorgungLautArztChange('')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onVersorgungLautArztChange('');
                                    }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                aria-label="Auswahl löschen"
                            >
                                <X className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                    {versorgungLautArztError && (
                        <p className="text-red-500 text-xs mt-1">{versorgungLautArztError}</p>
                    )}
                </div>
            </div>

            {/* Single Row with Positionsnummer, Diagnose, Durchgeführt von, and KVA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Positionsnummer - Only show when Krankenkassa is selected */}
                {billingType === 'Krankenkassa' && (
                    <div className={`lg:col-span-3 ${positionsnummerDisabled ? 'pointer-events-none opacity-50' : ''}`}>
                        <PositionsnummerDropdown
                            label={
                                <>
                                    Positionsnummer
                                    <RequiredMark show={requirePositionsnummer && !positionsnummerDisabled} />
                                </>
                            }
                            value={selectedPositionsnummer}
                            placeholder="Pos.-Nr."
                            options={positionsnummerOptions}
                            error={positionsnummerError}
                            isOpen={showPositionsnummerDropdown}
                            onToggle={() => {
                                if (positionsnummerDisabled) return;
                                onPositionsnummerToggle();
                            }}
                            onSelect={onPositionsnummerSelect}
                            onClear={onPositionsnummerClear}
                            itemSides={itemSides}
                            onItemSideChange={onItemSideChange}
                            vatCountry={vatCountry}
                        />
                        {/* Reserve fixed height for error so layout doesn't shift */}
                        <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                            {positionsnummerError ? positionsnummerError : ''}
                        </p>
                    </div>
                )}

                {/* Diagnose (smart multi-select — fixed height) */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'} ref={diagnosisRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diagnose
                        <RequiredMark show={requireDiagnosisList} />
                    </label>
                    <div className="relative">

                        {/* Fixed-height trigger: shows first tag + overflow count */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={onDiagnosisToggle}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDiagnosisToggle(); } }}
                            className={`h-[42px] w-full px-2.5 border rounded-md bg-white cursor-pointer flex items-center gap-1.5 focus:outline-none transition-colors overflow-hidden ${showDiagnosisDropdown ? 'border-[#61A178] ring-2 ring-[#61A178]/20' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                            {selectedDiagnosisList.length === 0 ? (
                                <span className="text-gray-400 text-sm flex-1 select-none">Auswählen...</span>
                            ) : (
                                <>
                                    {/* First selected tag */}
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#61A178]/10 text-[#61A178] border border-[#61A178]/25 flex-shrink-0 max-w-[55%]">
                                        <span className="truncate">{selectedDiagnosisList[0]}</span>
                                        <span
                                            role="button"
                                            tabIndex={-1}
                                            onClick={(e) => { e.stopPropagation(); onDiagnosisSelect(selectedDiagnosisList[0]); }}
                                            className="cursor-pointer text-[#61A178]/60 hover:text-[#61A178] transition-colors flex-shrink-0"
                                            aria-label={`${selectedDiagnosisList[0]} entfernen`}
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </span>
                                    {/* Overflow badge */}
                                    {selectedDiagnosisList.length > 1 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 flex-shrink-0">
                                            +{selectedDiagnosisList.length - 1}
                                        </span>
                                    )}
                                    <span className="flex-1" />
                                </>
                            )}
                            {/* Right-side icons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {selectedDiagnosisList.length > 0 && onDiagnosisClear && (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={(e) => { e.stopPropagation(); onDiagnosisClear(); }}
                                        className="rounded p-0.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                        aria-label="Alle löschen"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </span>
                                )}
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${showDiagnosisDropdown ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {showDiagnosisDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                {/* Selected summary header (when 2+ selected) */}
                                {selectedDiagnosisList.length > 1 && (
                                    <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-1">
                                        {selectedDiagnosisList.map((name) => (
                                            <span
                                                key={name}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#61A178]/10 text-[#61A178] border border-[#61A178]/25"
                                            >
                                                <span className="max-w-[140px] truncate">{name}</span>
                                                <span
                                                    role="button"
                                                    tabIndex={-1}
                                                    onClick={(e) => { e.stopPropagation(); onDiagnosisSelect(name); }}
                                                    className="cursor-pointer text-[#61A178]/60 hover:text-[#61A178] flex-shrink-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Options list */}
                                <div className="max-h-52 overflow-auto">
                                    {diagnosisOptions.map((option, index) => {
                                        const isSelected = selectedDiagnosisList.includes(option);
                                        return (
                                            <div
                                                key={`diagnosis-${index}-${option}`}
                                                onClick={(e) => { e.stopPropagation(); onDiagnosisSelect(option); }}
                                                className={`px-3 py-2.5 cursor-pointer text-sm flex items-center gap-2.5 transition-colors ${isSelected ? 'bg-[#61A178]/5 hover:bg-[#61A178]/10' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className={`flex-shrink-0 w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all ${isSelected ? 'bg-[#61A178] border-[#61A178]' : 'border-gray-300 bg-white'}`}>
                                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                                </div>
                                                <span className={isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>{option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Reserve fixed height so layout matches error-bearing columns */}
                    <p className="text-red-500 text-xs min-h-[16px] mt-1">
                        {diagnosisListError ?? ''}
                    </p>
                </div>

                {/* Durchgeführt von */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durchgeführt von
                        <RequiredMark show={requireEmployee} />
                    </label>
                    <EmployeeDropdown
                        selectedEmployee={selectedEmployee}
                        employeeSearchText={employeeSearchText}
                        isEmployeeDropdownOpen={isEmployeeDropdownOpen}
                        employeeSuggestions={employeeSuggestions}
                        employeeLoading={employeeLoading}
                        onEmployeeSearchChange={onEmployeeSearchChange}
                        onEmployeeDropdownChange={onEmployeeDropdownChange}
                        onEmployeeSelect={onEmployeeSelect}
                        onClear={onEmployeeClear}
                        placeholder="Mitarbeiter..."
                        error={selectedEmployeeError}
                    />
                    <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${selectedEmployeeError ? 'visible' : 'invisible'}`}>
                        {selectedEmployeeError}
                    </p>
                </div>

                {/* KVA & Lieferschein - Two separate button groups */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

                        {/* KVA button group */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                KVA
                                <RequiredMark show={requireKva} />
                            </label>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onKostenvoranschlagChange(true)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${kostenvoranschlag === true
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Ja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onKostenvoranschlagChange(false)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${kostenvoranschlag === false
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Nein
                                </button>
                            </div>
                            {kvaFieldError ? (
                                <p className="text-red-500 text-xs mt-1">{kvaFieldError}</p>
                            ) : null}
                        </div>

                        {/* Lieferschein button group */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Verordnungsvorschlag
                                <RequiredMark show={requireHalbprobe} />
                            </label>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onLieferscheinChange(true)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lieferschein === true
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Ja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onLieferscheinChange(false)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${lieferschein === false
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Nein
                                </button>
                            </div>
                            {halbprobeFieldError ? (
                                <p className="text-red-500 text-xs mt-1">{halbprobeFieldError}</p>
                            ) : null}
                        </div>
                    </div>
                    {/* Reserve fixed height to match other columns */}
                    <p className="min-h-[16px] mt-1" />
                </div>
            </div>

            {/* Bottom: All selected Positionen with Seite (L/R/BDS) - only when Krankenkassa and positions selected */}
            {billingType === 'Krankenkassa' &&
                Array.isArray(selectedPositionsnummer) &&
                selectedPositionsnummer.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                            Ausgewählte Positionen &amp; Seite
                        </p>
                        <ul className="space-y-2">
                            {selectedPositionsnummer.map((posNum) => {
                                const option = positionsnummerOptions?.find(
                                    (o: any) =>
                                        o?.positionsnummer === posNum ||
                                        o?.description?.positionsnummer === posNum
                                );
                                const desc =
                                    typeof option?.description === 'string'
                                        ? option.description
                                        : option?.description
                                            ? `${(option.description as any).title || ''}${(option.description as any).subtitle ? ` - ${(option.description as any).subtitle}` : ''}`.trim() || posNum
                                            : posNum;
                                const side = itemSides?.[posNum] || 'R';
                                const sideLabel =
                                    side === 'BDS' ? 'Beide (BDS)' : side === 'L' ? 'Links (L)' : 'Rechts (R)';
                                const basePrice = typeof option?.price === 'number' ? option.price : 0;
                                const itemNetPrice = side === 'BDS' ? basePrice * 2 : basePrice;
                                const itemVatAmount = calculateVatAmount(itemNetPrice);
                                const itemGrossPrice = itemNetPrice + itemVatAmount;
                                return (
                                    <li
                                        key={posNum}
                                        className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 px-3 rounded-md bg-gray-50 border border-gray-100"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <span className="font-semibold text-gray-900">{posNum}</span>
                                            <span className="text-gray-600 ml-1.5">— {desc}</span>
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#61A178]/15 text-[#61A178] border border-[#61A178]/30">
                                                Seite: {sideLabel}
                                            </span>
                                            <div className="text-xs text-gray-600 whitespace-nowrap">
                                                Netto: € {itemNetPrice.toFixed(2).replace('.', ',')}
                                            </div>
                                            {getVatRate() > 0 && (
                                                <div className="text-xs text-gray-600 whitespace-nowrap">
                                                    + {getVatRate()}% MwSt.: € {itemVatAmount.toFixed(2).replace('.', ',')}
                                                </div>
                                            )}
                                            <div className="text-sm font-semibold text-green-600 whitespace-nowrap">
                                                Gesamt: € {itemGrossPrice.toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {/* Total for selected Positionsnummer (with country-wise VAT, same as modal) */}
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Zwischensumme:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    € {calculateSubtotal().toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            {getVatRate() > 0 && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">+{getVatRate()}% VAT:</span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            € {calculateVatAmount(calculateSubtotal()).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                        <span className="text-base font-bold text-gray-900">Gesamt:</span>
                                        <span className="text-base font-bold text-green-600">
                                            € {calculateTotalWithVat(calculateSubtotal()).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </>
                            )}
                            {getVatRate() === 0 && (
                                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                                    <span className="text-base font-bold text-gray-900">Gesamt:</span>
                                    <span className="text-base font-bold text-green-600">
                                        € {calculateSubtotal().toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}

