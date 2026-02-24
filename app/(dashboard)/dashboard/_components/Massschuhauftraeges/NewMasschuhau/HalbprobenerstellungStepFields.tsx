'use client';

import React from 'react';
import { CalendarIcon, FileText, Factory, ExternalLink, SkipForward } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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

export const HALBPROBE_DURCHFUEHRUNG_OPTIONS = [
    {
        value: 'Intern fertigen',
        label: 'Intern fertigen',
        description: 'Halbprobe wird in der eigenen Werkstatt erstellt',
        icon: Factory,
    },
    {
        value: 'Extern fertigen',
        label: 'Extern fertigen',
        description: 'Halbprobe wird bei einem externen Partner beauftragt',
        icon: ExternalLink,
    },
    {
        value: 'Überspringen',
        label: 'Überspringen',
        description: 'Keine Halbprobe erforderlich - Schritt wird übersprungen',
        icon: SkipForward,
    },
] as const;

export type HalbprobeDurchfuehrungValue = (typeof HALBPROBE_DURCHFUEHRUNG_OPTIONS)[number]['value'] | '';

export interface HalbprobenerstellungStepFieldsProps {
    preparation_date: string;
    anmerkungen_halbprobe: string;
    halbprobe_durchfuehrung: HalbprobeDurchfuehrungValue;
    checkliste_halbprobe: string;
    onPreparationDateChange: (value: string) => void;
    onAnmerkungenHalbprobeChange: (value: string) => void;
    onHalbprobeDurchfuehrungChange: (value: HalbprobeDurchfuehrungValue) => void;
    onChecklisteHalbprobeChange: (value: string) => void;
}

export default function HalbprobenerstellungStepFields({
    preparation_date,
    anmerkungen_halbprobe,
    halbprobe_durchfuehrung,
    checkliste_halbprobe,
    onPreparationDateChange,
    onAnmerkungenHalbprobeChange,
    onHalbprobeDurchfuehrungChange,
    onChecklisteHalbprobeChange,
}: HalbprobenerstellungStepFieldsProps) {
    return (
        <div className="mb-6 space-y-6">
            {/* Vorbereitungsdatum – shadcn Calendar + Popover */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-2 block">
                    Vorbereitungsdatum
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-14 w-full min-w-[280px] max-w-md justify-start gap-3 rounded-xl border-gray-300 bg-gray-50/80 pl-4 text-left text-base font-normal hover:bg-gray-100 hover:border-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                                !preparation_date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="h-5 w-5 shrink-0 text-gray-500" />
                            {preparation_date ? (
                                formatDateForDisplay(preparation_date)
                            ) : (
                                <span>Datum wählen</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={
                                preparation_date
                                    ? new Date(preparation_date + 'T00:00:00')
                                    : undefined
                            }
                            onSelect={(date) => {
                                if (date) {
                                    onPreparationDateChange(toISODateString(date));
                                }
                            }}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={new Date().getFullYear() - 2}
                            toYear={new Date().getFullYear() + 5}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Anmerkungen Halbprobe */}
            {/* <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <Label className="text-sm font-medium text-gray-800">
                        Anmerkungen Halbprobe
                    </Label>
                </div>
                <textarea
                    value={anmerkungen_halbprobe}
                    onChange={(e) => onAnmerkungenHalbprobeChange(e.target.value)}
                    placeholder="Interne Produktionsnotizen zur Halbprobe..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                    Sichtbar für Werkstatt-Mitarbeiter
                </p>
            </div> */}

            {/* Halbprobe Durchführung – 3 option cards */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Halbprobe Durchführung
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Wie soll die Halbprobe durchgeführt werden?
                </p>
                <div className="space-y-3">
                    {HALBPROBE_DURCHFUEHRUNG_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = halbprobe_durchfuehrung === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onHalbprobeDurchfuehrungChange(opt.value)}
                                className={cn(
                                    'flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                                    isSelected
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                                )}
                            >
                                <span className={cn(
                                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'
                                )}>
                                    {isSelected && (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-900">
                                        {opt.label}
                                    </span>
                                    <p className="mt-0.5 text-xs text-gray-600">
                                        {opt.description}
                                    </p>
                                </div>
                                <Icon className="h-5 w-5 shrink-0 text-gray-400" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Checkliste Halbprobe */}
            {/* <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-2 block">
                    Checkliste Halbprobe
                </Label>
                <Input
                    value={checkliste_halbprobe}
                    onChange={(e) => onChecklisteHalbprobeChange(e.target.value)}
                    placeholder="Checkliste..."
                    className="h-10 w-full rounded-lg border-gray-300 bg-gray-50/80 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
            </div> */}
        </div>
    );
}
