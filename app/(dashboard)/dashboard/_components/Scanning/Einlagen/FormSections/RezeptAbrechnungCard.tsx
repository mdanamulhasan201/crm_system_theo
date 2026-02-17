import React from 'react';
import PositionsnummerDropdown from '../Dropdowns/PositionsnummerDropdown';

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
    itemSides?: Record<string, 'L' | 'R' | 'BDS'>;
    onItemSideChange?: (posNum: string, side: 'L' | 'R' | 'BDS') => void;
    
    // Diagnose
    selectedDiagnosis: string;
    diagnosisOptions: readonly string[];
    showDiagnosisDropdown: boolean;
    onDiagnosisToggle: () => void;
    onDiagnosisSelect: (value: string) => void;
    
    // Employee
    selectedEmployee: string;
    employeeSearchText: string;
    isEmployeeDropdownOpen: boolean;
    employeeSuggestions: any[];
    employeeLoading: boolean;
    onEmployeeSearchChange: (value: string) => void;
    onEmployeeDropdownChange: (open: boolean) => void;
    onEmployeeSelect: (employee: { employeeName: string; id: string }) => void;
    
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
    itemSides,
    onItemSideChange,
    selectedDiagnosis,
    diagnosisOptions,
    showDiagnosisDropdown,
    onDiagnosisToggle,
    onDiagnosisSelect,
    selectedEmployee,
    employeeSearchText,
    isEmployeeDropdownOpen,
    employeeSuggestions,
    employeeLoading,
    onEmployeeSearchChange,
    onEmployeeDropdownChange,
    onEmployeeSelect,
    kostenvoranschlag,
    onKostenvoranschlagChange,
    lieferschein,
    onLieferscheinChange,
}: RezeptAbrechnungCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">REZEPT & ABRECHNUNG</h2>
            
            {/* Input Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ärztliche Diagnose
                    </label>
                    <input
                        type="text"
                        value={ausführliche_diagnose}
                        onChange={(e) => onAusführlicheDiagnoseChange(e.target.value)}
                        placeholder="Diagnose eingeben..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                    />
                    {ausführlicheDiagnoseError && (
                        <p className="text-red-500 text-xs mt-1">{ausführlicheDiagnoseError}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Versorgung laut Arzt
                    </label>
                    <input
                        type="text"
                        value={versorgung_laut_arzt}
                        onChange={(e) => onVersorgungLautArztChange(e.target.value)}
                        placeholder="Versorgung laut Arzt..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                    />
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
                            itemSides={itemSides}
                            onItemSideChange={onItemSideChange}
                        />
                    </div>
                )}

                {/* Diagnose */}
                <div className={billingType === 'Krankenkassa' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diagnose
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={onDiagnosisToggle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent cursor-pointer"
                        >
                            <span className={selectedDiagnosis ? 'text-gray-900' : 'text-gray-400'}>
                                {selectedDiagnosis || 'Auswählen...'}
                            </span>
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
                    <div className="relative">
                        <input
                            type="text"
                            value={selectedEmployee || employeeSearchText}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                // Clear selected employee when user starts typing
                                if (selectedEmployee && newValue !== selectedEmployee) {
                                    onEmployeeSelect({ employeeName: '', id: '' });
                                }
                                onEmployeeSearchChange(newValue);
                                if (!isEmployeeDropdownOpen) {
                                    onEmployeeDropdownChange(true);
                                }
                            }}
                            onFocus={() => onEmployeeDropdownChange(true)}
                            onBlur={() => {
                                // Delay to allow click on dropdown item
                                setTimeout(() => onEmployeeDropdownChange(false), 200);
                            }}
                            placeholder="Mitarbeiter..."
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                        />
                        {selectedEmployee && (
                            <button
                                type="button"
                                onClick={() => {
                                    onEmployeeSelect({ employeeName: '', id: '' });
                                    onEmployeeSearchChange('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        {isEmployeeDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {employeeLoading ? (
                                    <div className="px-3 py-2 text-sm text-gray-500">Laden...</div>
                                ) : employeeSuggestions.length > 0 ? (
                                    employeeSuggestions.map((emp: any) => {
                                        const hasEmail = emp.email && emp.email !== 'null' && emp.email.trim() !== '';
                                        
                                        return (
                                            <div
                                                key={emp.id}
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Prevent blur from firing before click
                                                    onEmployeeSelect({ employeeName: emp.employeeName, id: emp.id });
                                                    onEmployeeDropdownChange(false);
                                                }}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{emp.employeeName}</span>
                                                    {hasEmail && (
                                                        <span className="text-xs text-gray-500">{emp.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500">Keine Mitarbeiter gefunden</div>
                                )}
                            </div>
                        )}
                    </div>
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
        </div>
    );
}

