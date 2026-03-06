'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, ClipboardList, Pencil } from 'lucide-react';
import ChecklisteHalbprobeModal, { type ChecklisteHalbprobeData } from './ChecklisteHalbprobeModal';
import SchafttypFieldText, { type SchafttypValue } from './SchafttypFieldText';
import BodenkonstruktionFiledText from './BodenkonstruktionFiledText';

function formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function toISODateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export const PROBENERGEBNIS_OPTIONS = [
    { value: 'Gut', label: 'Freigeben', colorClass: 'border-emerald-500 text-emerald-700 hover:bg-emerald-50 data-[selected=true]:bg-emerald-50 data-[selected=true]:ring-2 data-[selected=true]:ring-emerald-500' },
    { value: 'Druckstellen', label: 'kleine Nacharbeit', colorClass: 'border-amber-500 text-amber-700 hover:bg-amber-50 data-[selected=true]:bg-amber-50 data-[selected=true]:ring-2 data-[selected=true]:ring-amber-500' },
    { value: 'Instabil', label: 'große Nacharbeiten', colorClass: 'border-red-500 text-red-700 hover:bg-red-50 data-[selected=true]:bg-red-50 data-[selected=true]:ring-2 data-[selected=true]:ring-red-500' },
] as const;

export type ProbenergebnisValue = (typeof PROBENERGEBNIS_OPTIONS)[number]['value'] | '';
export type { SchafttypValue };

export interface HalbprobeDurchfuehrungStepFieldsProps {
    probenergebnis: ProbenergebnisValue;
    schafttyp: SchafttypValue;
    fitting_date: string;
    adjustments: string;
    customer_reviews: string;
    /** Order ID for navigation when "Intern" is clicked (go to step Schaft_fertigen) */
    orderId?: string;
    /** JSON string of checklist answers (checkliste_halbprobe) */
    checklisteHalbprobe?: string;
    /** Bodenkonstruktion: option + notes for step-5 payload (bodenkonstruktion_intem_note, bodenkonstruktion_extem_note) */
    bodenOption?: 'Intern' | 'Extern' | '';
    bodenkonstruktionInternNote?: string;
    bodenkonstruktionExternNote?: string;
    onBodenOptionChange?: (value: 'Intern' | 'Extern' | '') => void;
    onBodenkonstruktionInternNoteChange?: (value: string) => void;
    onBodenkonstruktionExternNoteChange?: (value: string) => void;
    /** Schafttyp Intern erweitert modal: save as massschafterstellung_image + massschafterstellung_json */
    onMassschafterstellungSave?: (data: { file: File | null; json: string }) => void;
    onProbenergebnisChange: (value: ProbenergebnisValue) => void;
    onSchafttypChange: (value: SchafttypValue) => void;
    onFittingDateChange: (value: string) => void;
    onAdjustmentsChange: (value: string) => void;
    onCustomerReviewsChange: (value: string) => void;
    onChecklisteHalbprobeChange?: (jsonString: string) => void;
}

function parseChecklisteHalbprobe(json: string | undefined): ChecklisteHalbprobeData | undefined {
    if (!json || typeof json !== 'string') return undefined;
    try {
        const parsed = JSON.parse(json) as ChecklisteHalbprobeData;
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export default function HalbprobeDurchfuehrungStepFields({
    probenergebnis,
    schafttyp,
    fitting_date,
    adjustments,
    customer_reviews,
    orderId,
    checklisteHalbprobe,
    bodenOption = '',
    bodenkonstruktionInternNote = '',
    bodenkonstruktionExternNote = '',
    onBodenOptionChange,
    onBodenkonstruktionInternNoteChange,
    onBodenkonstruktionExternNoteChange,
    onMassschafterstellungSave,
    onProbenergebnisChange,
    onSchafttypChange,
    onFittingDateChange,
    onAdjustmentsChange,
    onCustomerReviewsChange,
    onChecklisteHalbprobeChange,
}: HalbprobeDurchfuehrungStepFieldsProps) {
    const [checklistModalOpen, setChecklistModalOpen] = useState(false);
    const initialChecklistData = parseChecklisteHalbprobe(checklisteHalbprobe);
    const hasChecklistData = initialChecklistData != null && initialChecklistData.length > 0;

    return (
        <div className="mb-6 space-y-6">
            {/* Anprobedatum (fitting_date) */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-2 block">
                    Anprobedatum
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-14 w-full min-w-[280px] max-w-md justify-start gap-3 rounded-xl border-gray-300 bg-gray-50/80 pl-4 text-left text-base font-normal hover:bg-gray-100 hover:border-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                                !fitting_date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="h-5 w-5 shrink-0 text-gray-500" />
                            {fitting_date ? formatDateForDisplay(fitting_date) : <span>Datum auswählen</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={fitting_date ? new Date(fitting_date + 'T00:00:00') : undefined}
                            onSelect={(date) => date && onFittingDateChange(toISODateString(date))}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={new Date().getFullYear() - 2}
                            toYear={new Date().getFullYear() + 5}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Anpassungen & Kundennotizen – side by side */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                    <Label className="text-sm font-medium text-gray-800 mb-2 block">Anpassungen</Label>
                    <textarea
                        value={adjustments}
                        onChange={(e) => onAdjustmentsChange(e.target.value)}
                        placeholder="Anpassungen während der Anprobe..."
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                    />
                </div>
                <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                    <Label className="text-sm font-medium text-gray-800 mb-2 block">Kundennotizen</Label>
                    <textarea
                        value={customer_reviews}
                        onChange={(e) => onCustomerReviewsChange(e.target.value)}
                        placeholder="Kundenwünsche und Notizen..."
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                    />
                </div>
            </div> */}

            {/* Probenergebnis * */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-3 block">
                    Probenergebnis <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full min-w-0">
                    {PROBENERGEBNIS_OPTIONS.map((opt) => {
                        const isSelected = probenergebnis === opt.value;
                        const isKleineNacharbeit = opt.value === 'Druckstellen';
                        const showChecklistBadge = isKleineNacharbeit && hasChecklistData;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                data-selected={isSelected}
                                onClick={() => {
                                    onProbenergebnisChange(opt.value);
                                    if (isKleineNacharbeit) setChecklistModalOpen(true);
                                }}
                                className={cn(
                                    'relative flex min-w-0 cursor-pointer flex-1 basis-[calc(50%-0.375rem)] sm:basis-[calc(25%-0.5625rem)] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                    opt.colorClass
                                )}
                            >
                                {showChecklistBadge && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white" title="Checkliste ausgefüllt">
                                        <Check className="h-3 w-3" strokeWidth={2.5} />
                                    </span>
                                )}
                                {isSelected && !showChecklistBadge && <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
                {/* Text field when Freigeben or große Nacharbeiten is selected – inside same card */}
                {(probenergebnis === 'Gut' || probenergebnis === 'Instabil') && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80">
                        <Label className="text-sm font-medium text-gray-800 mb-2 block">
                            {probenergebnis === 'Gut' ? 'Anmerkungen zur Freigabe' : 'Anmerkungen zu großen Nacharbeiten'}
                        </Label>
                        <textarea
                            value={adjustments}
                            onChange={(e) => onAdjustmentsChange(e.target.value)}
                            placeholder={
                                probenergebnis === 'Gut'
                                    ? 'Optionale Notizen zur Freigabe...'
                                    : 'Beschreibung der notwendigen großen Nacharbeiten...'
                            }
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
            </div>

            {/* Sichtbare Info: Checkliste-Daten gespeichert */}
            {hasChecklistData && (
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <ClipboardList className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-emerald-900">Checkliste Halbprobe gespeichert</p>
                                <p className="text-xs text-emerald-700">
                                    {initialChecklistData.filter((i) => i.value === 'Ja').length}× Ja, {initialChecklistData.filter((i) => i.value === 'Nein').length}× Nein – wird mit Schritt abschließen mitgesendet
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-emerald-400 bg-white text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500"
                            onClick={() => setChecklistModalOpen(true)}
                        >
                            <Pencil className="h-4 w-4 mr-1.5" />
                            Bearbeiten
                        </Button>
                    </div>
                </div>
            )}

            <ChecklisteHalbprobeModal
                open={checklistModalOpen}
                onOpenChange={setChecklistModalOpen}
                initialData={initialChecklistData}
                onWeiter={(data) => onChecklisteHalbprobeChange?.(JSON.stringify(data))}
            />

            <SchafttypFieldText
                schafttyp={schafttyp}
                customer_reviews={customer_reviews}
                onSchafttypChange={onSchafttypChange}
                onCustomerReviewsChange={onCustomerReviewsChange}
                onMassschafterstellungSave={onMassschafterstellungSave}
            />

            {/* Bodenkonstruktion */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <BodenkonstruktionFiledText
                    bodenOption={bodenOption}
                    bodenkonstruktionInternNote={bodenkonstruktionInternNote}
                    bodenkonstruktionExternNote={bodenkonstruktionExternNote}
                    onBodenOptionChange={onBodenOptionChange ?? (() => {})}
                    onBodenkonstruktionInternNoteChange={onBodenkonstruktionInternNoteChange ?? (() => {})}
                    onBodenkonstruktionExternNoteChange={onBodenkonstruktionExternNoteChange ?? (() => {})}
                />
            </div>
        </div>
    );
}
