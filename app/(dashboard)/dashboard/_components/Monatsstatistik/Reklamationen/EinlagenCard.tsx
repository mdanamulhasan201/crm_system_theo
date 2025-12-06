'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

interface EinlagenCardProps {
    value: number;
    percentage: number;
    change: number;
    isPositive: boolean;
}

export default function EinlagenCard({ value, percentage, change, isPositive }: EinlagenCardProps) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                Einlagen
            </h3>
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                        {value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                        = {percentage}% aller Einlagen-Aufträge
                    </p>
                </div>
                <div className={`flex items-center gap-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? (
                        <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                    ) : (
                        <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold">
                        {isPositive ? '+' : ''}{change} zum Vormonat
                    </span>
                </div>
            </div>
        </div>
    );
}

