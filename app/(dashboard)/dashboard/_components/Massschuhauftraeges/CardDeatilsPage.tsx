'use client';

import React, { useEffect, useState } from 'react';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

import BottomCard from './BottomCard';
import BottomChartData from './BottomChartData';
import { getProductionSummaryData } from '@/apis/MassschuheManagemantApis';

interface ProductionSummary {
    currentAverageDays: number;
    previousAverageDays: number;
    deltaDays: number;
}

export default function CardDetailsPage() {
    const [summaryData, setSummaryData] = useState<ProductionSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getProductionSummaryData();
                if (response.success) {
                    setSummaryData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch production summary data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format number with comma as decimal separator (German format)
    const formatNumber = (num: number) => {
        return num.toFixed(1).replace('.', ',');
    };

    // Determine if delta is positive, negative, or zero
    const isPositive = (summaryData?.deltaDays ?? 0) > 0;
    const isNegative = (summaryData?.deltaDays ?? 0) < 0;
    const absDelta = Math.abs(summaryData?.deltaDays ?? 0);

    return (
        <div className="w-full mt-8">
            {/* Top Row: 2 cards */}
            <div className="flex flex-row gap-6 mb-6">
                {/* Card 1: Aktuelle Dauer */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm w-full md:w-4/12">
                    <div className="mb-4 text-lg font-medium text-slate-700 text-center">
                        Aktuelle Dauer
                    </div>
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-12 bg-slate-200 rounded w-24 mx-auto mb-3"></div>
                            <div className="h-6 bg-slate-200 rounded w-16 mx-auto mb-3"></div>
                            <div className="h-5 bg-slate-200 rounded w-20 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3 text-center">
                                <div className="text-4xl font-semibold text-slate-900">
                                    {formatNumber(summaryData?.currentAverageDays ?? 0)}
                                </div>
                                <h2 className="text-xl text-black font-bold">Tage</h2>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-xl">
                                <span className={`inline-flex items-center gap-1 font-medium ${
                                    isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-slate-400'
                                }`}>
                                    {isPositive && <HiTrendingUp className="h-5 w-5" />}
                                    {isNegative && <HiTrendingDown className="h-5 w-5" />}
                                    {formatNumber(absDelta)} Tage
                                </span>
                                <span className="text-slate-400 text-lg">vs. Vormonat</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Card 2: Linienverlauf - Letzte Monate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm w-full md:w-8/12">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Linienverlauf - Letzte Monate
                    </div>
                    <div className="h-48 w-full">
                        <BottomChartData />
                    </div>
                </div>
            </div>

            <BottomCard />
        </div>
    );
}
