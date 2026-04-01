'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
    const setField = (key: keyof BettungStep3InputData, value: string) => {
        onChange({ ...values, [key]: value });
    };

    return (
        <div className="mb-6 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
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
                            className="h-10 w-full rounded-lg border-gray-300 bg-gray-50/80"
                        />
                    </div>
                ))}
                <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Step 3 data shown as input fields. No value = blank field.</p>
                </div>
            </div>
        </div>
    );
}
