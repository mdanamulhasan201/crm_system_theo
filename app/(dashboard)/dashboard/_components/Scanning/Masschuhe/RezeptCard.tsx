import React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PositionsnummerDropdown from '../Einlagen/Dropdowns/PositionsnummerDropdown';
import EmployeeDropdown from '../Common/EmployeeDropdown';
import LocationDropdown from '../Werkstattzettel/Dropdowns/LocationDropdown';

interface RezeptCardProps {
    ärztlicheDiagnose: string;
    onÄrztlicheDiagnoseChange: (value: string) => void;
    ärztlicheDiagnoseError?: string;
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
    itemSides?: Record<string, 'L' | 'R' | 'BDS'>;
    onItemSideChange?: (posNum: string, side: 'L' | 'R' | 'BDS') => void;
    vatCountry?: string;

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
    selectedEmployeeError?: string;

    halbprobeGeplant: boolean | null;
    onHalbprobeGeplantChange: (value: boolean) => void;
    kostenvoranschlag: boolean | null;
    onKostenvoranschlagChange: (value: boolean) => void;

    // Privat – PREIS & STEUER (same as SonstigesForm, Brutto only)
    nettoPreis?: string;
    onNettoPreisChange?: (value: string) => void;
    rabatt?: string;
    onRabattChange?: (value: string) => void;
    steuersatz?: number;
    onSteuersatzChange?: (value: number) => void;
    taxRates?: { rate: number; name: string; description?: string; isDefault?: boolean }[];
    defaultTaxRate?: { rate: number; name: string; description?: string };
    priceCalculations?: {
        basisPreis?: number;
        discountPercent?: number;
        discountAmount?: number;
        netto: number;
        mwst: number;
        brutto: number;
    };
}

export default function RezeptCard({
    ärztlicheDiagnose,
    onÄrztlicheDiagnoseChange,
    ärztlicheDiagnoseError,
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
    itemSides,
    onItemSideChange,
    vatCountry,
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
    selectedEmployeeError,
    halbprobeGeplant,
    onHalbprobeGeplantChange,
    kostenvoranschlag,
    onKostenvoranschlagChange,
    nettoPreis = '',
    onNettoPreisChange,
    rabatt = '',
    onRabattChange,
    steuersatz = 22,
    onSteuersatzChange,
    taxRates = [],
    defaultTaxRate = { rate: 22, name: 'Standard', description: 'Standard' },
    priceCalculations = { basisPreis: 0, discountPercent: 0, discountAmount: 0, netto: 0, mwst: 0, brutto: 0 },
}: RezeptCardProps) {
    const selectedTaxRate = taxRates?.find((r) => r.rate === steuersatz) || defaultTaxRate;
    // VAT and calculation helpers (match Einlagen RezeptAbrechnungCard)
    const getVatRate = (): number => {
        if (vatCountry === 'Italien (IT)') return 4;
        if (vatCountry === 'Österreich (AT)') return 20;
        return 0;
    };
    const calculateSubtotal = (): number =>
        (selectedPositionsnummer || []).reduce((sum, posNum) => {
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

  return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">REZEPT &amp; ABRECHNUNG</h2>

            {/* Diagnosis fields - Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ärztliche Diagnose *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={ärztlicheDiagnose}
                            onChange={(e) => onÄrztlicheDiagnoseChange(e.target.value)}
                            placeholder="Diagnose eingeben..."
                            className={`w-full px-3 py-2 pr-9 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent ${ärztlicheDiagnoseError ? 'border-red-500' : 'border-gray-300'}`}
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
                    <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${ärztlicheDiagnoseError ? 'visible' : 'invisible'}`}>
                        {ärztlicheDiagnoseError}
                    </p>
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
                    {/* First Row: Positionsnummer and Standort (same line) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mb-4">
                        {/* Positionsnummer */}
                        <div className="lg:col-span-6">
                            <PositionsnummerDropdown
                                label="Positionsnummer *"
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
                            <p className={`text-red-500 text-xs mt-1 min-h-[16px] ${positionsnummerError ? 'visible' : 'invisible'}`}>
                                {positionsnummerError}
                            </p>
                        </div>

                        {/* Standort */}
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
                            <p className="min-h-[16px] mt-1" />
                        </div>
                    </div>

                    {/* Second Row: Durchgeführt von and Halbprobe & KVA */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Durchgeführt von */}
                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Durchgeführt von *
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

                        {/* Halbprobe & KVA */}
                        <div className="lg:col-span-6">
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
                            <p className="min-h-[16px] mt-1" />
                        </div>
                    </div>

                    {/* Ausgewählte Positionen & Seite - only when Krankenkassa and positions selected */}
                    {Array.isArray(selectedPositionsnummer) &&
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
                                        // Netto pro Position (BDS = doppelter Preis)
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
                                {/* Zwischensumme, VAT, Gesamt */}
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
                </>
            )}

            {/* Layout for Privat – PREIS & STEUER (same as SonstigesForm) */}
            {billingType === 'Privat' && (
                <>
                    {/* PREIS & STEUER Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wide">PREIS &amp; STEUER</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left – Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Brutto-Preis (€)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={nettoPreis}
                                            onChange={(e) => onNettoPreisChange?.(e.target.value)}
                                            className="w-full h-10 pr-9"
                                        />
                                        {nettoPreis && (
                                            <span
                                                role="button"
                                                tabIndex={-1}
                                                onClick={() => onNettoPreisChange?.('0.00')}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNettoPreisChange?.('0.00'); } }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                                aria-label="Auswahl löschen"
                                            >
                                                <X className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rabatt (% - wechseln)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={100}
                                                placeholder="0"
                                                value={rabatt}
                                                onChange={(e) => onRabattChange?.(e.target.value)}
                                                className="w-full h-10 pr-9"
                                            />
                                            {rabatt && rabatt !== '0' && (
                                                <span
                                                    role="button"
                                                    tabIndex={-1}
                                                    onClick={() => onRabattChange?.('')}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRabattChange?.(''); } }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                                    aria-label="Auswahl löschen"
                                                >
                                                    <X className="h-4 w-4" />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Steuersatz
                                    </label>
                                    <Select
                                        value={String(steuersatz)}
                                        onValueChange={(value) => onSteuersatzChange?.(parseFloat(value))}
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue>
                                                {steuersatz}% - {selectedTaxRate.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {taxRates && taxRates.length > 0 ? (
                                                taxRates.map((rate, index) => (
                                                    <SelectItem key={`${rate.rate}-${rate.name}-${index}`} value={String(rate.rate)}>
                                                        {rate.rate}% - {rate.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value={String(defaultTaxRate.rate)}>
                                                    {defaultTaxRate.rate}% - {defaultTaxRate.name}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {/* Right – Price Summary (same as SonstigesForm, Brutto only) */}
                            <div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">Basispreis (Brutto):</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                €{(priceCalculations.basisPreis ?? 0).toFixed(2)}
                                            </span>
                                        </div>
                                        {(priceCalculations.discountPercent ?? 0) > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">
                                                    Rabatt ({(priceCalculations.discountPercent ?? 0).toFixed(2)}%):
                                                </span>
                                                <span className="text-sm font-medium text-red-600">
                                                    -€{(priceCalculations.discountAmount ?? 0).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">Netto nach Rabatt:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                €{priceCalculations.netto.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">MwSt ({steuersatz}%):</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                €{priceCalculations.mwst.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2.5 border-t border-gray-300">
                                            <span className="text-sm font-semibold text-gray-900">Brutto nach Rabatt:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                €{priceCalculations.brutto.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Standort row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mb-4">
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
                            <p className="min-h-[16px] mt-1" />
                        </div>
                    </div>

                    {/* Third Row: Durchgeführt von, KVA, and Halbprobe */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Durchgeführt von */}
                        <div className="lg:col-span-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Durchgeführt von *
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
                            <p className="min-h-[16px] mt-1" />
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
                            <p className="min-h-[16px] mt-1" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
