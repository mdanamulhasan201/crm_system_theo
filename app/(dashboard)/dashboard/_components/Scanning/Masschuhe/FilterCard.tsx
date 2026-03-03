import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const LEISTENTYP_OPTIONS = ['Halbschuhleisten', 'Knöchelhoher Leisten'] as const;
export type LeistentypValue = typeof LEISTENTYP_OPTIONS[number];

export interface Step2Data {
    material: string;
    leistentyp?: string;
    leistengroesse?: string;
    notes: string;
}
export type BettungType = 'on_last' | 'built_up';
export interface Step3Data {
    material: string;
    thickness: string;
    notes: string;
    bettung_type?: BettungType | null;
    bettung_notes?: string;
    thickness_heel?: string;
    thickness_ball?: string;
    thickness_toe?: string;
}
export interface CustomerFittingData {
    fittingDate: Date | undefined;
    adjustments: string;
    customerNotes: string;
}
export interface InternalPrepData {
    notes: string;
    preparationDate: Date | undefined;
}

interface FilterCardProps {
    halbprobeErforderlich: boolean | null;
    onHalbprobeErforderlichChange: (v: boolean | null) => void;
    leistenVorhanden: boolean | null;
    onLeistenVorhandenChange: (v: boolean | null) => void;
    bettungErforderlich: boolean | null;
    onBettungErforderlichChange: (v: boolean | null) => void;
    lastData: Step2Data;
    onLastDataChange: (v: Step2Data) => void;
    footbedData: Step3Data;
    onFootbedDataChange: (v: Step3Data) => void;
    internalPrepData: InternalPrepData;
    onInternalPrepDataChange: (v: InternalPrepData) => void;
    customerFittingData: CustomerFittingData;
    onCustomerFittingDataChange: (v: CustomerFittingData) => void;
}

export default function FilterCard({
    halbprobeErforderlich,
    onHalbprobeErforderlichChange,
    leistenVorhanden,
    onLeistenVorhandenChange,
    bettungErforderlich,
    onBettungErforderlichChange,
    lastData,
    onLastDataChange,
    footbedData,
    onFootbedDataChange,
    internalPrepData,
    onInternalPrepDataChange,
    customerFittingData,
    onCustomerFittingDataChange,
}: FilterCardProps) {
  return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">PRODUKTIONSWORKFLOW</h2>

            {/* 1. Halbprobe erforderlich? */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Halbprobe erforderlich?</h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onHalbprobeErforderlichChange(true)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            halbprobeErforderlich === true
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Ja – Halbprobe einplanen
                    </button>
                    <button
                        type="button"
                        onClick={() => onHalbprobeErforderlichChange(false)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            halbprobeErforderlich === false
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Nein – direkt zur Fertigung
                    </button>
                </div>

                {/* Step 4: Internal Preparation - Only show if Halbprobe = Yes */}
                {halbprobeErforderlich === true && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Schritt 4</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Vorbereitungsdatum
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal text-sm h-10"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {internalPrepData.preparationDate ? (
                                                format(internalPrepData.preparationDate, 'dd.MM.yyyy')
                                            ) : (
                                                <span className="text-gray-400">Datum auswählen</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={internalPrepData.preparationDate}
                                            onSelect={(date) => onInternalPrepDataChange({ ...internalPrepData, preparationDate: date })}
                                            initialFocus
                                            captionLayout="dropdown"
                                            fromYear={new Date().getFullYear()}
                                            toYear={new Date().getFullYear() + 5}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Notizen
                                </label>
                                <textarea
                                    value={internalPrepData.notes}
                                    onChange={(e) => onInternalPrepDataChange({ ...internalPrepData, notes: e.target.value })}
                                    placeholder="Interne Vorbereitungsnotizen..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Customer Fitting - Only show if Halbprobe = Yes */}
                {halbprobeErforderlich === true && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Schritt 5</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Anprobedatum
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal text-sm h-10"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {customerFittingData.fittingDate ? (
                                                format(customerFittingData.fittingDate, 'dd.MM.yyyy')
                                            ) : (
                                                <span className="text-gray-400">Datum auswählen</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={customerFittingData.fittingDate}
                                            onSelect={(date) => onCustomerFittingDataChange({ ...customerFittingData, fittingDate: date })}
                                            initialFocus
                                            captionLayout="dropdown"
                                            fromYear={new Date().getFullYear()}
                                            toYear={new Date().getFullYear() + 5}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Anpassungen
                                    </label>
                                    <textarea
                                        value={customerFittingData.adjustments}
                                        onChange={(e) => onCustomerFittingDataChange({ ...customerFittingData, adjustments: e.target.value })}
                                        placeholder="Anpassungen während der Anprobe..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Kundennotizen
                                    </label>
                                    <textarea
                                        value={customerFittingData.customerNotes}
                                        onChange={(e) => onCustomerFittingDataChange({ ...customerFittingData, customerNotes: e.target.value })}
                                        placeholder="Kundenwünsche und Notizen..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Leisten vorhanden? */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Leisten vorhanden?</h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onLeistenVorhandenChange(true)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            leistenVorhanden === true
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Ja – vorhandenen Leisten verwenden
                    </button>
                    <button
                        type="button"
                        onClick={() => onLeistenVorhandenChange(false)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            leistenVorhanden === false
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Nein – Leisten muss erstellt werden
                    </button>
                </div>

                {/* Step 2: Last Data Input - Only show if Leisten = No */}
                {leistenVorhanden === false && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Schritt 2</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Material
                                    </label>
                                    <input
                                        type="text"
                                        value={lastData.material}
                                        onChange={(e) => onLastDataChange({ ...lastData, material: e.target.value })}
                                        placeholder="Leisten-Material..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Leistentyp 
                                    </label>
                                    <Select
                                        value={lastData.leistentyp || undefined}
                                        onValueChange={(value) => onLastDataChange({ ...lastData, leistentyp: value })}
                                    >
                                        <SelectTrigger className="w-full h-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#61A178] focus:border-transparent">
                                            <SelectValue placeholder="Leistentyp wählen (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEISTENTYP_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Leistengröße (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={lastData.leistengroesse ?? ''}
                                        onChange={(e) => onLastDataChange({ ...lastData, leistengroesse: e.target.value })}
                                        placeholder="Leistengröße..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Notizen
                                </label>
                                <textarea
                                    value={lastData.notes}
                                    onChange={(e) => onLastDataChange({ ...lastData, notes: e.target.value })}
                                    placeholder="Leisten-Notizen..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Bettung erforderlich? */}
            <div className="mb-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Bettung erforderlich?</h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onBettungErforderlichChange(true)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            bettungErforderlich === true
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Ja
                    </button>
                    <button
                        type="button"
                        onClick={() => onBettungErforderlichChange(false)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            bettungErforderlich === false
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Nein
                    </button>
                </div>

                {/* Step 3: Wie soll die Bettung erstellt werden? – Only show if Bettung erforderlich = Ja */}
                {bettungErforderlich === true && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Schritt 3</h4>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Wie soll die Bettung erstellt werden?</h3>
                        <div className="flex gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => onFootbedDataChange({
                                    ...footbedData,
                                    bettung_type: 'on_last',
                                    bettung_notes: footbedData.bettung_notes ?? '',
                                    thickness_heel: '',
                                    thickness_ball: '',
                                    thickness_toe: '',
                                })}
                                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                                    footbedData.bettung_type === 'on_last'
                                        ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                Bettung wird auf dem Leisten erstellt
                            </button>
                            <button
                                type="button"
                                onClick={() => onFootbedDataChange({
                                    ...footbedData,
                                    bettung_type: 'built_up',
                                    bettung_notes: '',
                                    thickness_heel: footbedData.thickness_heel ?? '',
                                    thickness_ball: footbedData.thickness_ball ?? '',
                                    thickness_toe: footbedData.thickness_toe ?? '',
                                })}
                                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                                    footbedData.bettung_type === 'built_up'
                                        ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                Bettung wird brutto aufgebaut
                            </button>
                        </div>
                        {footbedData.bettung_type == null && (
                            <p className="text-xs text-red-600 mb-2">Bitte eine Ausführungsart wählen.</p>
                        )}
                        {footbedData.bettung_type === 'on_last' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Zusätzliche Notizen zur Bettung (Pflichtfeld)
                                    </label>
                                    <textarea
                                        value={footbedData.bettung_notes ?? ''}
                                        onChange={(e) => onFootbedDataChange({ ...footbedData, bettung_notes: e.target.value })}
                                        placeholder="Besondere Vorgaben zur Form oder Bearbeitung angeben"
                                        rows={3}
                                        className={cn(
                                            "w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none",
                                            !(footbedData.bettung_notes?.trim()) ? "border-red-400" : "border-gray-300"
                                        )}
                                    />
                                    {!(footbedData.bettung_notes?.trim()) && (
                                        <p className="text-xs text-red-600 mt-1">Dieses Feld ist erforderlich.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {footbedData.bettung_type === 'built_up' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { key: 'thickness_heel' as const, label: 'Dicke Ferse (mm)' },
                                        { key: 'thickness_ball' as const, label: 'Dicke Ballen (mm)' },
                                        { key: 'thickness_toe' as const, label: 'Dicke Spitze (mm)' },
                                    ].map(({ key, label }) => {
                                        const val = footbedData[key] ?? '';
                                        const num = val === '' ? NaN : parseFloat(val.replace(',', '.'));
                                        const isEmpty = val.trim() === '';
                                        const invalid = !isEmpty && (Number.isNaN(num) || num <= 0);
                                        const showRequired = isEmpty;
                                        const showInvalid = invalid;
                                        return (
                                            <div key={key}>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    {label}
                                                </label>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={val}
                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, [key]: e.target.value })}
                                                    placeholder="mm"
                                                    step={0.1}
                                                    className={cn(
                                                        "w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent",
                                                        (showRequired || showInvalid) ? "border-red-400" : "border-gray-300"
                                                    )}
                                                />
                                                {showRequired && <p className="text-xs text-red-600 mt-1">Dieses Feld ist erforderlich.</p>}
                                                {showInvalid && <p className="text-xs text-red-600 mt-1">{num <= 0 ? 'Wert muss größer als 0 sein.' : 'Bitte einen gültigen Wert in mm eingeben.'}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
