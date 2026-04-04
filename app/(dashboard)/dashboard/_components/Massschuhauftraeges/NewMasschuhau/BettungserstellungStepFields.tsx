'use client';

import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BettungserstellungStepFieldsProps {
    values: BettungStep3InputData;
    onChange: (value: BettungStep3InputData) => void;
}

export interface BettungStep3InputData {
    notes: string;
    bettung_type: string;
    zusaetzliche_notizen: string;
    material: string;
    pelotte: string;
    versteifung: string;
    pelotte_hoehe_l: string;
    pelotte_hoehe_r: string;
    schicht1_starke: string;
    schicht2_starke: string;
    decksohle_starke: string;
    versteifung_zone: string;
    schicht1_material: string;
    schicht2_material: string;
    decksohle_material: string;
    versteifung_material: string;
}

export const defaultBettungStep3InputData = (): BettungStep3InputData => ({
    notes: '',
    bettung_type: '',
    zusaetzliche_notizen: '',
    material: '',
    pelotte: '',
    versteifung: '',
    pelotte_hoehe_l: '',
    pelotte_hoehe_r: '',
    schicht1_starke: '',
    schicht2_starke: '',
    decksohle_starke: '',
    versteifung_zone: '',
    schicht1_material: '',
    schicht2_material: '',
    decksohle_material: '',
    versteifung_material: '',
});

export default function BettungserstellungStepFields({
    values,
    onChange,
}: BettungserstellungStepFieldsProps) {
    const [editing, setEditing] = useState(false);

    const setField = (key: keyof BettungStep3InputData, value: string) => {
        onChange({ ...values, [key]: value });
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bettungserstellung</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {editing
                            ? 'Felder bearbeiten und abschließend „Fertig“ wählen.'
                            : 'Zur Bearbeitung „Bearbeiten“ wählen.'}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5 cursor-pointer"
                    onClick={() => setEditing((v) => !v)}
                >
                    {editing ? (
                        <>
                            <Check className="w-4 h-4" />
                            Fertig
                        </>
                    ) : (
                        <>
                            <Pencil className="w-4 h-4" />
                            Bearbeiten
                        </>
                    )}
                </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {(
                    [
                        ['zusaetzliche_notizen', 'Zusätzliche Notizen'],
                        ['material', 'Material'],
                        ['pelotte_hoehe_l', 'Höhe - Links (mm)'],
                        ['pelotte_hoehe_r', 'Höhe - Rechts (mm)'],
                        ['schicht1_starke', 'Dicke Ferse (mm)'],
                        ['schicht2_starke', 'Dicke Ballen (mm)'],
                        ['decksohle_starke', 'Dicke Spitze (mm)'],
                        ['versteifung_zone', 'Zone'],
                        ['schicht1_material', 'Schicht 1 - Material'],
                        ['schicht2_material', 'Schicht 2 - Material'],
                        ['decksohle_material', 'Decksohle - Material'],
                        ['versteifung_material', 'Versteifung - Material'],
                    ] as Array<[keyof BettungStep3InputData, string]>
                ).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                        <Label className="text-sm font-medium text-gray-800">{label}</Label>
                        <Input
                            readOnly={!editing}
                            value={values[key]}
                            onChange={(e) => setField(key, e.target.value)}
                            placeholder={
                                key === 'decksohle_material'
                                    ? 'z.B. Leder'
                                    : key === 'schicht1_starke' ||
                                        key === 'schicht2_starke' ||
                                        key === 'decksohle_starke' ||
                                        key === 'pelotte_hoehe_l' ||
                                        key === 'pelotte_hoehe_r'
                                      ? 'mm'
                                      : ''
                            }
                            className={cn(
                                'h-10 w-full rounded-lg border-gray-300',
                                editing
                                    ? 'bg-white focus-visible:ring-2 focus-visible:ring-emerald-500/30'
                                    : 'bg-gray-100/90 text-gray-900 cursor-default select-text',
                            )}
                        />
                    </div>
                ))}
                <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Leeres Feld = kein Wert übermittelt.</p>
                </div>
            </div>
        </div>
    );
}
