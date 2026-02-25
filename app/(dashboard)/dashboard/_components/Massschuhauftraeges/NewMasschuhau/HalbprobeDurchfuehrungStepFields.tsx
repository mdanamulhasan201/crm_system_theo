'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ClipboardList, Pencil } from 'lucide-react';
import ChecklisteHalbprobeModal, { type ChecklisteHalbprobeData } from './ChecklisteHalbprobeModal';

export const PROBENERGEBNIS_OPTIONS = [
    { value: 'Gut', label: 'Gut', colorClass: 'border-emerald-500 text-emerald-700 hover:bg-emerald-50 data-[selected=true]:bg-emerald-50 data-[selected=true]:ring-2 data-[selected=true]:ring-emerald-500' },
    { value: 'Druckstellen', label: 'Druckstellen', colorClass: 'border-amber-500 text-amber-700 hover:bg-amber-50 data-[selected=true]:bg-amber-50 data-[selected=true]:ring-2 data-[selected=true]:ring-amber-500' },
    { value: 'Instabil', label: 'Instabil', colorClass: 'border-red-500 text-red-700 hover:bg-red-50 data-[selected=true]:bg-red-50 data-[selected=true]:ring-2 data-[selected=true]:ring-red-500' },
    { value: 'Änderungen', label: 'Änderungen', colorClass: 'border-gray-400 text-gray-700 hover:bg-gray-100 data-[selected=true]:bg-gray-100 data-[selected=true]:ring-2 data-[selected=true]:ring-gray-400' },
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
    /** JSON string of checklist answers (checkliste_halbprobe) */
    checklisteHalbprobe?: string;
    onProbenergebnisChange: (value: ProbenergebnisValue) => void;
    onSchafttypChange: (value: SchafttypValue) => void;
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
    checklisteHalbprobe,
    onProbenergebnisChange,
    onSchafttypChange,
    onChecklisteHalbprobeChange,
}: HalbprobeDurchfuehrungStepFieldsProps) {
    const router = useRouter();
    const [checklistModalOpen, setChecklistModalOpen] = useState(false);
    const initialChecklistData = parseChecklisteHalbprobe(checklisteHalbprobe);
    const hasChecklistData = initialChecklistData != null && initialChecklistData.length > 0;

    return (
        <div className="mb-6 space-y-6">
            {/* Probenergebnis * */}
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-3 block">
                    Probenergebnis <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full min-w-0">
                    {PROBENERGEBNIS_OPTIONS.map((opt) => {
                        const isSelected = probenergebnis === opt.value;
                        const isAenderungen = opt.value === 'Änderungen';
                        const showChecklistBadge = isAenderungen && hasChecklistData;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                data-selected={isSelected}
                                onClick={() => {
                                    onProbenergebnisChange(opt.value);
                                    if (isAenderungen) setChecklistModalOpen(true);
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
                        const isExtern = opt.value === 'Extern';
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onSchafttypChange(opt.value);
                                    if (isExtern) router.push('/dashboard/custom-shafts');
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
            </div>
        </div>
    );
}
