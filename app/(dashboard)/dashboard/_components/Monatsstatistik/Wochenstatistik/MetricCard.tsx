'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    percentage: string | number;
    isPositive: boolean;
    loading?: boolean;
}

export default function MetricCard({ 
    title, 
    value, 
    percentage, 
    isPositive, 
    loading = false 
}: MetricCardProps) {
    const formattedPercentage = typeof percentage === 'number' ? `${percentage}%` : percentage;
    
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-3 sm:mb-4">
                {title}
            </h3>
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Laden...</div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                        {value}
                    </p>
                    <div className={`flex items-center gap-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? (
                            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        <span className="text-xs sm:text-sm font-semibold">
                            {formattedPercentage} vs last month
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

