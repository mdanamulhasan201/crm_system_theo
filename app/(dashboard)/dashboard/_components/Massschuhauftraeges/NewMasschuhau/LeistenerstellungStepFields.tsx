'use client';

import React, { useState } from 'react';
import { ExternalLink, UserCog } from 'lucide-react';
import { Label } from '@/components/ui/label';
import LeistenBestellenModal from './LeistenBestellenModal';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';


export const LEISTENTYP_OPTIONS = [
    { value: 'Halbschuhleisten', label: 'Halbschuhleisten' },
    { value: 'Knöchelhoher Leisten', label: 'Knöchelhoher Leisten' },
] as const;

export const LEISTENFERTIGUNG_OPTIONS = ['Extern', 'Über F1rst'] as const;

export type LeistenfertigungValue = (typeof LEISTENFERTIGUNG_OPTIONS)[number] | '';

export interface LeistenerstellungStepFieldsProps {
    material: string;
    leistentyp: string;
    leistenfertigung: LeistenfertigungValue;
    onMaterialChange: (value: string) => void;
    onLeistentypChange: (value: string) => void;
    onLeistenfertigungChange: (value: LeistenfertigungValue) => void;
}

export default function LeistenerstellungStepFields({
    material,
    leistentyp,
    leistenfertigung,
    onMaterialChange,
    onLeistentypChange,
    onLeistenfertigungChange,
}: LeistenerstellungStepFieldsProps) {
    const [leistenModalOpen, setLeistenModalOpen] = useState(false);

    const handleÜberF1rstClick = () => {
        onLeistenfertigungChange('Über F1rst');
        setLeistenModalOpen(true);
    };

  

    return (
        <>
            <div className="mb-6 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                {/* Material & Leistentyp – grid on larger screens */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-800">
                            Material
                        </Label>
                        <Input
                            value={material}
                            onChange={(e) => onMaterialChange(e.target.value)}
                            placeholder="z.B. Leder, Synthetik"
                            className="h-10 w-full rounded-lg border-gray-300 bg-gray-50/80 transition-colors placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-800">
                            Leistentyp
                        </Label>
                        <Select value={leistentyp || undefined} onValueChange={onLeistentypChange}>
                            <SelectTrigger className="h-10 w-full rounded-lg border-gray-300 bg-gray-50/80 transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 [&>svg]:text-gray-500">
                                <SelectValue placeholder="Leistentyp wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEISTENTYP_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-100" />

                {/* Leistenfertigung starten – card-style choice */}
                <div>
                    <h3 className="text-base font-semibold tracking-tight text-gray-900">
                        Leistenfertigung starten
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Wie soll der Leisten gefertigt werden?
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => onLeistenfertigungChange('Extern')}
                            className={cn(
                                'flex h-12 w-full cursor-pointer min-w-0 items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-200 sm:gap-3 sm:px-4',
                                leistenfertigung === 'Extern'
                                    ? 'border-[#62A07C] bg-[#62A07C] text-white shadow-md shadow-[#62A07C]/20'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#62A07C] hover:bg-[#62A07C]/40'
                            )}
                        >
                            <span className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                leistenfertigung === 'Extern' ? 'bg-white/20' : 'bg-gray-200/70'
                            )}>
                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                            <span className="truncate">Intern</span>
                        </button>
                        <div className="flex min-w-0 flex-col items-stretch gap-1">
                            <button
                                type="button"
                                onClick={handleÜberF1rstClick}
                                className={cn(
                                    'flex h-12 w-full cursor-pointer min-w-0 items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-200 sm:gap-3 sm:px-4',
                                    leistenfertigung === 'Über F1rst'
                                        ? 'border-[#62A07C] bg-[#62A07C] text-white shadow-md shadow-[#62A07C]/20'
                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#62A07C] hover:bg-[#62A07C]/40'
                                )}
                            >
                                <span className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                                    leistenfertigung === 'Über F1rst' ? 'bg-white/20' : 'bg-gray-200/70'
                                )}>
                                    <UserCog className="h-4 w-4 sm:h-5 sm:w-5" />
                                </span>
                                <span className="truncate">Extern über FeetF1rst</span>
                            </button>
                            <span className="text-center text-xs text-gray-500">Nur mit 3D Scan möglich</span>
                        </div>
                    </div>
                </div>
            </div>

            <LeistenBestellenModal
                open={leistenModalOpen}
                onOpenChange={setLeistenModalOpen}
            />
        </>
    );
}
