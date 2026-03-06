import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
/** Thickness fields for "built_up" – separate for left (Links) and right (Rechts) */
export interface Step3Data {
    material: string;
    thickness: string;
    notes: string;
    bettung_type?: BettungType | null;
    bettung_notes?: string;
    thickness_heel_l?: string;
    thickness_heel_r?: string;
    thickness_ball_l?: string;
    thickness_ball_r?: string;
    thickness_toe_l?: string;
    thickness_toe_r?: string;
    /** Notes when bettung_type === 'built_up' (shown at bottom of section) */
    bettung_built_up_notes?: string;
    /** Erweiterte Daten (on_last): AUFBAU + ZUSATZELEMENTE */
    schicht1_material?: string;
    schicht1_starke?: string;
    schicht2_material?: string;
    schicht2_starke?: string;
    decksohle_material?: string;
    decksohle_starke?: string;
    versteifung?: boolean | null;
    /** Shown when Versteifung === Ja */
    versteifung_material?: string;
    versteifung_zone?: string;
    pelotte?: boolean | null;
    /** Höhe (mm) when Pelotte === Ja – left and right */
    pelotte_hoehe_l?: string;
    pelotte_hoehe_r?: string;
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
                                            <SelectValue placeholder="Leistentyp wählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEISTENTYP_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* <div>
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
                                </div> */}
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
                                    thickness_heel_l: '', thickness_heel_r: '',
                                    thickness_ball_l: '', thickness_ball_r: '',
                                    thickness_toe_l: '', thickness_toe_r: '',
                                    bettung_built_up_notes: '',
                                    schicht1_material: footbedData.schicht1_material ?? '',
                                    schicht1_starke: footbedData.schicht1_starke ?? '',
                                    schicht2_material: footbedData.schicht2_material ?? '',
                                    schicht2_starke: footbedData.schicht2_starke ?? '',
                                    decksohle_material: footbedData.decksohle_material ?? '',
                                    decksohle_starke: footbedData.decksohle_starke ?? '',
                                    versteifung: footbedData.versteifung ?? null,
                                    versteifung_material: footbedData.versteifung_material ?? '',
                                    versteifung_zone: footbedData.versteifung_zone ?? '',
                                    pelotte: footbedData.pelotte ?? null,
                                    pelotte_hoehe_l: footbedData.pelotte_hoehe_l ?? '',
                                    pelotte_hoehe_r: footbedData.pelotte_hoehe_r ?? '',
                                })}
                                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 text-left ${
                                    footbedData.bettung_type === 'on_last'
                                        ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <span className="block">Bettung wird auf dem Leisten erstellt</span>
                                <span className="block text-xs font-normal text-gray-500 mt-0.5">(Form wird direkt in den Leisten eingeschliffen)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onFootbedDataChange({
                                    ...footbedData,
                                    bettung_type: 'built_up',
                                    bettung_notes: '',
                                    thickness_heel_l: footbedData.thickness_heel_l ?? '',
                                    thickness_heel_r: footbedData.thickness_heel_r ?? '',
                                    thickness_ball_l: footbedData.thickness_ball_l ?? '',
                                    thickness_ball_r: footbedData.thickness_ball_r ?? '',
                                    thickness_toe_l: footbedData.thickness_toe_l ?? '',
                                    thickness_toe_r: footbedData.thickness_toe_r ?? '',
                                    bettung_built_up_notes: footbedData.bettung_built_up_notes ?? '',
                                    schicht1_material: '', schicht1_starke: '', schicht2_material: '', schicht2_starke: '',
                                    decksohle_material: '', decksohle_starke: '', versteifung: null, versteifung_material: '', versteifung_zone: '', pelotte: null, pelotte_hoehe_l: '', pelotte_hoehe_r: '',
                                })}
                                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 text-left ${
                                    footbedData.bettung_type === 'built_up'
                                        ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <span className="block">Bettung wird brutto aufgebaut</span>
                                <span className="block text-xs font-normal text-gray-500 mt-0.5">(Einlage wird gefräst oder separat ergänzt)</span>
                            </button>
                        </div>
                        {footbedData.bettung_type == null && (
                            <p className="text-xs text-red-600 mb-2">Bitte eine Ausführungsart wählen.</p>
                        )}
                        {footbedData.bettung_type === 'on_last' && (
                            <div className="space-y-4">
                                {/* Zusätzliche Notizen – normal field, NOT inside accordion */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Zusätzliche Notizen (Pflichtfeld)
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
                                {/* Erweiterte Daten – shadcn accordion with new fields */}
                                <Accordion type="single" collapsible defaultValue="erweiterte-daten" className="rounded-md border border-gray-200 bg-white">
                                    <AccordionItem value="erweiterte-daten" className="border-none">
                                        <AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-700 hover:no-underline hover:bg-gray-50 rounded-t-md data-[state=open]:rounded-b-none">
                                            Erweiterte Daten ausblenden
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-0">
                                            <div className="space-y-5">
                                                {/* AUFBAU */}
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">AUFBAU</h4>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Schicht 1 – Material</label>
                                                                <input
                                                                    type="text"
                                                                    value={footbedData.schicht1_material ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, schicht1_material: e.target.value })}
                                                                    placeholder="z.B. EVA"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Schicht 1 – Stärke (mm)</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={footbedData.schicht1_starke ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, schicht1_starke: e.target.value })}
                                                                    placeholder="mm"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Schicht 2 – Material</label>
                                                                <input
                                                                    type="text"
                                                                    value={footbedData.schicht2_material ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, schicht2_material: e.target.value })}
                                                                    placeholder="z.B. Kork"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Schicht 2 – Stärke (mm)</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={footbedData.schicht2_starke ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, schicht2_starke: e.target.value })}
                                                                    placeholder="mm"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* ZUSATZELEMENTE */}
                                                <div className="pt-3 border-t border-gray-200">
                                                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">ZUSATZELEMENTE</h4>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Decksohle – Material</label>
                                                                <input
                                                                    type="text"
                                                                    value={footbedData.decksohle_material ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, decksohle_material: e.target.value })}
                                                                    placeholder="z.B. Leder"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Decksohle – Stärke (mm)</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={footbedData.decksohle_starke ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, decksohle_starke: e.target.value })}
                                                                    placeholder="mm"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Versteifung</label>
                                                            <div className="flex gap-3 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, versteifung: true })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.versteifung === true ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Ja
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, versteifung: false, versteifung_material: '', versteifung_zone: '' })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.versteifung === false ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Nein
                                                                </button>
                                                            </div>
                                                            {footbedData.versteifung === true && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Material</label>
                                                                        <input
                                                                            type="text"
                                                                            value={footbedData.versteifung_material ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, versteifung_material: e.target.value })}
                                                                            placeholder="z.B. Carbonfaser"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Zone</label>
                                                                        <input
                                                                            type="text"
                                                                            value={footbedData.versteifung_zone ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, versteifung_zone: e.target.value })}
                                                                            placeholder="z.B. Mittelfuß"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Pelotte</label>
                                                            <div className="flex gap-3 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, pelotte: true })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.pelotte === true ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Ja
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, pelotte: false, pelotte_hoehe_l: '', pelotte_hoehe_r: '' })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.pelotte === false ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Nein
                                                                </button>
                                                            </div>
                                                            {footbedData.pelotte === true && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Höhe – Links (mm)</label>
                                                                        <input
                                                                            type="text"
                                                                            inputMode="decimal"
                                                                            value={footbedData.pelotte_hoehe_l ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, pelotte_hoehe_l: e.target.value })}
                                                                            placeholder="mm"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Höhe – Rechts (mm)</label>
                                                                        <input
                                                                            type="text"
                                                                            inputMode="decimal"
                                                                            value={footbedData.pelotte_hoehe_r ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, pelotte_hoehe_r: e.target.value })}
                                                                            placeholder="mm"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        )}
                        {footbedData.bettung_type === 'built_up' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Zusätzliche Notizen (optional)
                                    </label>
                                    <textarea
                                        value={footbedData.bettung_built_up_notes ?? ''}
                                        onChange={(e) => onFootbedDataChange({ ...footbedData, bettung_built_up_notes: e.target.value })}
                                        placeholder="Besondere Vorgaben zur Form oder Bearbeitung angeben"
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mb-2">Alle Felder sind Pflichtfelder (Links und Rechts getrennt).</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Dicke Ferse (mm)', keyL: 'thickness_heel_l' as const, keyR: 'thickness_heel_r' as const },
                                        { label: 'Dicke Ballen (mm)', keyL: 'thickness_ball_l' as const, keyR: 'thickness_ball_r' as const },
                                        { label: 'Dicke Spitze (mm)', keyL: 'thickness_toe_l' as const, keyR: 'thickness_toe_r' as const },
                                    ].map(({ label, keyL, keyR }) => {
                                        const valL = footbedData[keyL] ?? '';
                                        const valR = footbedData[keyR] ?? '';
                                        const numL = valL === '' ? NaN : parseFloat(String(valL).replace(',', '.'));
                                        const numR = valR === '' ? NaN : parseFloat(String(valR).replace(',', '.'));
                                        const isEmptyL = valL.trim() === '';
                                        const isEmptyR = valR.trim() === '';
                                        const invalidL = !isEmptyL && (Number.isNaN(numL) || numL <= 0);
                                        const invalidR = !isEmptyR && (Number.isNaN(numR) || numR <= 0);
                                        const errMsg = (empty: boolean, invalid: boolean, num: number) => {
                                            if (empty) return 'Dieses Feld ist erforderlich.';
                                            if (invalid) return num <= 0 ? 'Wert muss größer als 0 sein.' : 'Bitte einen gültigen Wert in mm eingeben.';
                                            return null;
                                        };
                                        return (
                                            <div key={label} className="space-y-3">
                                                <p className="text-xs font-medium text-gray-700">{label}</p>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Links</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={valL}
                                                        onChange={(e) => onFootbedDataChange({ ...footbedData, [keyL]: e.target.value })}
                                                        placeholder="mm"
                                                        className={cn(
                                                            "w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent",
                                                            (isEmptyL || invalidL) ? "border-red-400" : "border-gray-300"
                                                        )}
                                                    />
                                                    {(isEmptyL || invalidL) && <p className="text-xs text-red-600 mt-1">{errMsg(isEmptyL, invalidL, numL)}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Rechts</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={valR}
                                                        onChange={(e) => onFootbedDataChange({ ...footbedData, [keyR]: e.target.value })}
                                                        placeholder="mm"
                                                        className={cn(
                                                            "w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent",
                                                            (isEmptyR || invalidR) ? "border-red-400" : "border-gray-300"
                                                        )}
                                                    />
                                                    {(isEmptyR || invalidR) && <p className="text-xs text-red-600 mt-1">{errMsg(isEmptyR, invalidR, numR)}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Erweiterte Daten ausblenden – design only, bottom of built_up section */}
                                <Accordion type="single" collapsible defaultValue="" className="rounded-md border border-gray-200 bg-white mt-4">
                                    <AccordionItem value="erweiterte-daten-built-up" className="border-none">
                                        <AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-700 hover:no-underline hover:bg-gray-50 rounded-t-md data-[state=open]:rounded-b-none">
                                            Erweiterte Daten ausblenden
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-0">
                                            <div className="space-y-5">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">ZUSATZELEMENTE</h4>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Decksohle – Material</label>
                                                                <input
                                                                    type="text"
                                                                    value={footbedData.decksohle_material ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, decksohle_material: e.target.value })}
                                                                    placeholder="z.B. Leder"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Decksohle – Stärke (mm)</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={footbedData.decksohle_starke ?? ''}
                                                                    onChange={(e) => onFootbedDataChange({ ...footbedData, decksohle_starke: e.target.value })}
                                                                    placeholder="mm"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Versteifung</label>
                                                            <div className="flex gap-3 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, versteifung: true })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.versteifung === true ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Ja
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, versteifung: false, versteifung_material: '', versteifung_zone: '' })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.versteifung === false ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Nein
                                                                </button>
                                                            </div>
                                                            {footbedData.versteifung === true && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Material</label>
                                                                        <input
                                                                            type="text"
                                                                            value={footbedData.versteifung_material ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, versteifung_material: e.target.value })}
                                                                            placeholder="z.B. Carbonfaser"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Zone</label>
                                                                        <input
                                                                            type="text"
                                                                            value={footbedData.versteifung_zone ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, versteifung_zone: e.target.value })}
                                                                            placeholder="z.B. Mittelfuß"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Pelotte</label>
                                                            <div className="flex gap-3 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, pelotte: true })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.pelotte === true ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Ja
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onFootbedDataChange({ ...footbedData, pelotte: false, pelotte_hoehe_l: '', pelotte_hoehe_r: '' })}
                                                                    className={cn(
                                                                        "flex-1 px-4 py-2.5 rounded-md text-sm font-medium border-2 cursor-pointer transition-all",
                                                                        footbedData.pelotte === false ? "bg-green-50 text-[#61A178] border-green-400" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                                    )}
                                                                >
                                                                    Nein
                                                                </button>
                                                            </div>
                                                            {footbedData.pelotte === true && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Höhe – Links (mm)</label>
                                                                        <input
                                                                            type="text"
                                                                            inputMode="decimal"
                                                                            value={footbedData.pelotte_hoehe_l ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, pelotte_hoehe_l: e.target.value })}
                                                                            placeholder="mm"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Höhe – Rechts (mm)</label>
                                                                        <input
                                                                            type="text"
                                                                            inputMode="decimal"
                                                                            value={footbedData.pelotte_hoehe_r ?? ''}
                                                                            onChange={(e) => onFootbedDataChange({ ...footbedData, pelotte_hoehe_r: e.target.value })}
                                                                            placeholder="mm"
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
