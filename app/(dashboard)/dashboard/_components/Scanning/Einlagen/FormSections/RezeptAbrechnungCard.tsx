import React, { useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import PositionsnummerDropdown from '../Dropdowns/PositionsnummerDropdown';
import EmployeeDropdown from '../../Common/EmployeeDropdown';

interface RezeptAbrechnungCardProps {
    // Diagnosis fields
    ausführliche_diagnose: string;
    onAusführlicheDiagnoseChange: (value: string) => void;
    ausführlicheDiagnoseError?: string;
    versorgung_laut_arzt: string;
    onVersorgungLautArztChange: (value: string) => void;
    
    // Positionsnummer
    billingType: 'Krankenkassa' | 'Privat';
    selectedPositionsnummer: string[];
    positionsnummerOptions: any[];
    positionsnummerError?: string;
    showPositionsnummerDropdown: boolean;
    onPositionsnummerToggle: () => void;
    onPositionsnummerSelect: (values: string[]) => void;
    onPositionsnummerClear?: () => void;
    itemSides?: Record<string, 'L' | 'R' | 'BDS'>;
    onItemSideChange?: (posNum: string, side: 'L' | 'R' | 'BDS') => void;
    vatCountry?: string;
    
    // Diagnose
    selectedDiagnosis: string;
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
    itemSides,
    onItemSideChange,
    vatCountry,
    selectedDiagnosis,
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
    kostenvoranschlag,
    onKostenvoranschlagChange,
    lieferschein,
    onLieferscheinChange,
}: RezeptAbrechnungCardProps) {
    const diagnosisRef = useRef<HTMLDivElement>(null);

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
                </div>
            </div>

            {/* Single Row with Positionsnummer, Diagnose, Durchgeführt von, and KVA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                {/* Positionsnummer - Only show when Krankenkassa is selected */}
                {billingType === 'Krankenkassa' && (
                    <div className="lg:col-span-3">
                        <PositionsnummerDropdown
                            label="Positionsnummer"
                            value={selectedPositionsnummer}
                            placeholder="Pos.-Nr."
                            options={positionsnummerOptions}
                            error={positionsnummerError}
                            isOpen={showPositionsnummerDropdown}
                            onToggle={onPositionsnummerToggle}
                            onSelect={onPositionsnummerSelect}
                            onClear={onPositionsnummerClear}
                            itemSides={itemSides}
                            onItemSideChange={onItemSideChange}
                            vatCountry={vatCountry}
                        />
                    </div>
                )}

                {/* Diagnose */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'} ref={diagnosisRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diagnose
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={onDiagnosisToggle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent cursor-pointer flex items-center justify-between gap-2"
                        >
                            <span className={`truncate flex-1 ${selectedDiagnosis ? 'text-gray-900' : 'text-gray-400'}`}>
                                {selectedDiagnosis || 'Auswählen...'}
                            </span>
                            <div className="flex items-center shrink-0">
                                {selectedDiagnosis && onDiagnosisClear ? (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDiagnosisClear();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onDiagnosisClear();
                                            }
                                        }}
                                        className="rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                ) : (
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                )}
                            </div>
                        </button>
                        {showDiagnosisDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {diagnosisOptions.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            onDiagnosisSelect(option);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Durchgeführt von */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durchgeführt von
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
                    />
                </div>

                {/* KVA & Lieferschein - Two separate button groups */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* KVA button group */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                KVA
                            </label>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onKostenvoranschlagChange(true)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        kostenvoranschlag === true
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Ja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onKostenvoranschlagChange(false)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        kostenvoranschlag === false
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Nein
                                </button>
                            </div>
                        </div>

                        {/* Lieferschein button group */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Lieferschein
                            </label>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onLieferscheinChange(true)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        lieferschein === true
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Ja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onLieferscheinChange(false)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        lieferschein === false
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Nein
                                </button>
                            </div>
                        </div>
                    </div>
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
                                const itemPrice = side === 'BDS' ? basePrice * 2 : basePrice;
                                const priceStr = `€ ${itemPrice.toFixed(2).replace('.', ',')}`;
                                return (
                                    <li
                                        key={posNum}
                                        className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 px-3 rounded-md bg-gray-50 border border-gray-100"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <span className="font-semibold text-gray-900">{posNum}</span>
                                            <span className="text-gray-600 ml-1.5">— {desc}</span>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#61A178]/15 text-[#61A178] border border-[#61A178]/30">
                                                Seite: {sideLabel}
                                            </span>
                                            <span className="font-semibold text-green-600 whitespace-nowrap">
                                                {priceStr}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
        </div>
    );
}

