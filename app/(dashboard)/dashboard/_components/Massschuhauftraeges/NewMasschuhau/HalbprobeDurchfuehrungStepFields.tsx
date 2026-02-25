'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
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
                               
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

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
                                    'relative flex cursor-pointer min-w-0 flex-1 basis-[calc(50%-0.375rem)] items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-gray-50/80 px-4 py-3 text-sm font-medium text-gray-800 transition-all hover:border-gray-400 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                                    isSelected && 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500 ring-offset-2'
                                )}
                            >
                               
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
