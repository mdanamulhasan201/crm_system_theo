'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, ClipboardList, Pencil } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ChecklisteHalbprobeModal, { type ChecklisteHalbprobeData } from './ChecklisteHalbprobeModal';

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

export const SCHAFTTYP_OPTIONS = [
    { value: 'Intern', label: 'Intern' },
    { value: 'Extern', label: 'Extern' },
] as const;

export type ProbenergebnisValue = (typeof PROBENERGEBNIS_OPTIONS)[number]['value'] | '';
export type SchafttypValue = (typeof SCHAFTTYP_OPTIONS)[number]['value'] | '';

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
    onProbenergebnisChange,
    onSchafttypChange,
    onFittingDateChange,
    onAdjustmentsChange,
    onCustomerReviewsChange,
    onChecklisteHalbprobeChange,
}: HalbprobeDurchfuehrungStepFieldsProps) {
    const router = useRouter();
    const [checklistModalOpen, setChecklistModalOpen] = useState(false);
    const [externOrderDialogOpen, setExternOrderDialogOpen] = useState(false);
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
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Label className="text-sm font-medium text-gray-800">
                                {probenergebnis === 'Gut' ? 'Anmerkungen zur Freigabe' : 'Anmerkungen zu großen Nacharbeiten'}
                            </Label>
                            <Button type="button" variant="outline" size="sm" className="text-gray-700 border-gray-400 hover:bg-gray-100">
                                erweitert
                            </Button>
                        </div>
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

            {/* Schafttyp * */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-3 block">
                    Schafttyp <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full min-w-0">
                    {SCHAFTTYP_OPTIONS.map((opt) => {
                        const isSelected = schafttyp === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onSchafttypChange(opt.value);
                                }}
                                className={cn(
                                    'relative flex cursor-pointer min-w-0 flex-1 basis-[calc(50%-0.375rem)] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                                    'border-gray-300 bg-gray-50/80 text-gray-800 hover:border-gray-400 hover:bg-gray-100',
                                    isSelected && 'border-emerald-500 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500 ring-offset-2'
                                )}
                            >
                                {isSelected && <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
                {schafttyp === 'Intern' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Label className="text-sm font-medium text-gray-800">
                                Hinweise zur internen Schaftfertigung
                            </Label>
                            <Button type="button" variant="outline" size="sm" className="text-gray-700 border-gray-400 hover:bg-gray-100">
                                erweitert
                            </Button>
                        </div>
                        <textarea
                            value={customer_reviews}
                            onChange={(e) => onCustomerReviewsChange(e.target.value)}
                            placeholder="Details, Besonderheiten oder Wünsche für den internen Schaft..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
                {schafttyp === 'Extern' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Label className="text-sm font-medium text-gray-800">
                                Hinweise zur externen Schaftfertigung
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-gray-700 border-gray-400 hover:bg-gray-100"
                                onClick={() => setExternOrderDialogOpen(true)}
                            >
                                erweitert
                            </Button>
                        </div>
                        <textarea
                            value={customer_reviews}
                            onChange={(e) => onCustomerReviewsChange(e.target.value)}
                            placeholder="Notizen für die externe Schaftfertigung..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
            </div>
            <Dialog open={externOrderDialogOpen} onOpenChange={setExternOrderDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Externe Schaft-Bestellung</DialogTitle>
                        <DialogDescription>
                            Möchten Sie jetzt die externe Schaftfertigung bestellen?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setExternOrderDialogOpen(false)}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            className="bg-[#61A178] hover:bg-[#4A8A5F]"
                            onClick={() => {
                                setExternOrderDialogOpen(false);
                                router.push('/dashboard/custom-shafts');
                            }}
                        >
                            Jetzt bestellen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
