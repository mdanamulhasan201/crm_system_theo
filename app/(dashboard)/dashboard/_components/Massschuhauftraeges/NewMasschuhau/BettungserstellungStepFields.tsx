'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface BettungserstellungStepFieldsProps {
    material: string;
    thickness: string;
    onMaterialChange: (value: string) => void;
    onThicknessChange: (value: string) => void;
}

export default function BettungserstellungStepFields({
    material,
    thickness,
    onMaterialChange,
    onThicknessChange,
}: BettungserstellungStepFieldsProps) {
    return (
        <div className="mb-6 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
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
                        Dicke
                    </Label>
                    <Input
                        value={thickness}
                        onChange={(e) => onThicknessChange(e.target.value)}
                        placeholder="z.B. 3 mm"
                        className="h-10 w-full rounded-lg border-gray-300 bg-gray-50/80 transition-colors placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                </div>
            </div>
        </div>
    );
}
