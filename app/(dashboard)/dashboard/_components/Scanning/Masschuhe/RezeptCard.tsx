import React from 'react';
import { X } from 'lucide-react';
import PositionsnummerDropdown from '../Einlagen/Dropdowns/PositionsnummerDropdown';
import EmployeeDropdown from '../Common/EmployeeDropdown';
import LocationDropdown from '../Werkstattzettel/Dropdowns/LocationDropdown';

interface RezeptCardProps {
    ärztlicheDiagnose: string;
    onÄrztlicheDiagnoseChange: (value: string) => void;
    ausführlicheDiagnose: string;
    onAusführlicheDiagnoseChange: (value: string) => void;

    billingType: 'Krankenkassa' | 'Privat';
    selectedPositionsnummer: string[];
    positionsnummerOptions: any[];
    positionsnummerError?: string;
    showPositionsnummerDropdown: boolean;
    onPositionsnummerToggle: () => void;
    onPositionsnummerSelect: (values: string[]) => void;
    onPositionsnummerClear?: () => void;
    vatCountry?: string;

    rezeptnummer: string;
    onRezeptnummerChange: (value: string) => void;

    // Location dropdown
    selectedLocation: any | null;
    locations: any[];
    locationsLoading: boolean;
    isLocationDropdownOpen: boolean;
    onLocationDropdownChange: (open: boolean) => void;
    onLocationSelect: (location: any) => void;
    onLocationClear?: () => void;

    selectedEmployee: string;
    employeeSearchText: string;
    isEmployeeDropdownOpen: boolean;
    employeeSuggestions: any[];
    employeeLoading: boolean;
    onEmployeeSearchChange: (value: string) => void;
    onEmployeeDropdownChange: (open: boolean) => void;
    onEmployeeSelect: (employee: { employeeName: string; id: string }) => void;
    onEmployeeClear?: () => void;

    halbprobeGeplant: boolean | null;
    onHalbprobeGeplantChange: (value: boolean) => void;
    kostenvoranschlag: boolean | null;
    onKostenvoranschlagChange: (value: boolean) => void;
    
    // Privat billing fields
    price?: string;
    onPriceChange?: (value: string) => void;
    tax?: string;
    onTaxChange?: (value: string) => void;
}

export default function RezeptCard({
    ärztlicheDiagnose,
    onÄrztlicheDiagnoseChange,
    ausführlicheDiagnose,
    onAusführlicheDiagnoseChange,
    billingType,
    selectedPositionsnummer,
    positionsnummerOptions,
    positionsnummerError,
    showPositionsnummerDropdown,
    onPositionsnummerToggle,
    onPositionsnummerSelect,
    onPositionsnummerClear,
    vatCountry,
    rezeptnummer,
    onRezeptnummerChange,
    selectedLocation,
    locations,
    locationsLoading,
    isLocationDropdownOpen,
    onLocationDropdownChange,
    onLocationSelect,
    onLocationClear,
    selectedEmployee,
    employeeSearchText,
    isEmployeeDropdownOpen,
    employeeSuggestions,
    employeeLoading,
    onEmployeeSearchChange,
    onEmployeeDropdownChange,
    onEmployeeSelect,
    onEmployeeClear,
    halbprobeGeplant,
    onHalbprobeGeplantChange,
    kostenvoranschlag,
    onKostenvoranschlagChange,
    price = '',
    onPriceChange,
    tax = '',
    onTaxChange,
}: RezeptCardProps) {
  return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">REZEPT &amp; ABRECHNUNG</h2>

            {/* Diagnosis fields - Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ärztliche Diagnose
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={ärztlicheDiagnose}
                            onChange={(e) => onÄrztlicheDiagnoseChange(e.target.value)}
                            placeholder="Diagnose eingeben..."
                            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                        />
                        {ärztlicheDiagnose && (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={() => onÄrztlicheDiagnoseChange('')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onÄrztlicheDiagnoseChange(''); } }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                aria-label="Auswahl löschen"
                            >
                                <X className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ausführliche Diagnose
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={ausführlicheDiagnose}
                            onChange={(e) => onAusführlicheDiagnoseChange(e.target.value)}
                            placeholder="Ausführliche Diagnose..."
                            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                        />
                        {ausführlicheDiagnose && (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={() => onAusführlicheDiagnoseChange('')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAusführlicheDiagnoseChange(''); } }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                aria-label="Auswahl löschen"
                            >
                                <X className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Layout for Krankenkassa */}
            {billingType === 'Krankenkassa' && (
                <>
                    {/* First Row: Positionsnummer and Rezeptnummer */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-4">
                        {/* Positionsnummer */}
                        <div className="lg:col-span-6">
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
                                vatCountry={vatCountry}
                            />
                        </div>

                        {/* Rezeptnummer */}
                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rezeptnummer
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={rezeptnummer}
                                    onChange={(e) => onRezeptnummerChange(e.target.value)}
                                    placeholder="Rezeptnummer..."
                                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                />
                                {rezeptnummer && (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={() => onRezeptnummerChange('')}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRezeptnummerChange(''); } }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Second Row: Standort, Durchgeführt von, and Halbprobe & KVA */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        {/* Partner Location */}
                        <div className="lg:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Standort
                            </label>
                            <LocationDropdown
                                value={selectedLocation}
                                locations={locations}
                                isOpen={isLocationDropdownOpen}
                                onOpenChange={onLocationDropdownChange}
                                onChange={onLocationSelect}
                                onSelect={onLocationSelect}
                                onClear={onLocationClear}
                            />
                        </div>

                        {/* Durchgeführt von */}
                        <div className="lg:col-span-4">
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

                        {/* Halbprobe & KVA */}
                        <div className="lg:col-span-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Halbprobe
                                    </label>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onHalbprobeGeplantChange(true)}
                                            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                                halbprobeGeplant === true
                                                    ? 'bg-[#61A178] text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            Ja
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onHalbprobeGeplantChange(false)}
                                            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                                halbprobeGeplant === false
                                                    ? 'bg-[#61A178] text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            Nein
                                        </button>
                                    </div>
                                </div>

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
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Layout for Privat - Two rows */}
            {billingType === 'Privat' && (
                <>
                    {/* First Row: Preis and Steuersatz */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-4">
                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Preis (€)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step=""
                                    value={price}
                                    onChange={(e) => onPriceChange?.(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                />
                                {price && (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={() => onPriceChange?.('')}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPriceChange?.(''); } }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Steuersatz (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step=""
                                    value={tax}
                                    onChange={(e) => onTaxChange?.(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                />
                                {tax && (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={() => onTaxChange?.('')}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTaxChange?.(''); } }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Second Row: Rezeptnummer and Standort */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-4">
                        {/* Rezeptnummer */}
                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rezeptnummer
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={rezeptnummer}
                                    onChange={(e) => onRezeptnummerChange(e.target.value)}
                                    placeholder="Rezeptnummer..."
                                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                />
                                {rezeptnummer && (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={() => onRezeptnummerChange('')}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRezeptnummerChange(''); } }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Partner Location */}
                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Standort
                            </label>
                            <LocationDropdown
                                value={selectedLocation}
                                locations={locations}
                                isOpen={isLocationDropdownOpen}
                                onOpenChange={onLocationDropdownChange}
                                onChange={onLocationSelect}
                                onSelect={onLocationSelect}
                                onClear={onLocationClear}
                            />
                        </div>
                    </div>

                    {/* Third Row: Durchgeführt von, KVA, and Halbprobe */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        {/* Durchgeführt von */}
                        <div className="lg:col-span-6">
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

                        {/* KVA */}
                        <div className="lg:col-span-3">
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

                        {/* Halbprobe */}
                        <div className="lg:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Halbprobe
                            </label>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onHalbprobeGeplantChange(true)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        halbprobeGeplant === true
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Ja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onHalbprobeGeplantChange(false)}
                                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                        halbprobeGeplant === false
                                            ? 'bg-[#61A178] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Nein
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
