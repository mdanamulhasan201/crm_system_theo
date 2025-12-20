'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    LabelList,
} from 'recharts';
import { 
    getRevenueCompareMonthWithYearInsoleData,
    getRevenueCompareMonthWithYearShoesData
} from '@/apis/monatsstatistikApis';

interface ComparisonData {
    currentValue: number;
    previousYearValue: number;
    percentageChange: number;
}

interface ApiResponse {
    success: boolean;
    data: ComparisonData;
}

interface ComparisonCardProps {
    useApiData?: boolean;
    apiType?: 'insoles' | 'shoes';
}

export default function ComparisonCard({ useApiData = false, apiType = 'insoles' }: ComparisonCardProps) {
    const [apiData, setApiData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (useApiData) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response: ApiResponse = apiType === 'shoes' 
                        ? await getRevenueCompareMonthWithYearShoesData()
                        : await getRevenueCompareMonthWithYearInsoleData();
                    if (response.success && response.data) {
                        setApiData(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching comparison data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [useApiData, apiType]);

    // Use API data if available, otherwise use default data
    const currentValue = apiData?.currentValue ?? 312;
    const previousYearValue = apiData?.previousYearValue ?? 280;
    const percentageChange = apiData?.percentageChange ?? 11;

    const data = [
        { name: 'Aktuell', value: currentValue },
        { name: 'Vorjahr', value: previousYearValue },
    ];

    const colors = ['#475569', '#cbd5e1']; // slate-700 and slate-300

    // Calculate Y-axis domain dynamically
    const maxValue = Math.max(currentValue, previousYearValue);
    const yAxisMax = Math.max(maxValue * 1.2, 100); // Add 20% padding, minimum 100

    // Determine if percentage change is positive
    const isPositive = percentageChange >= 0;
    const formattedPercentage = `${isPositive ? '+' : ''}${percentageChange}%`;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-4">
                Vergleich zum Vorjahr
            </h3>
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Laden...</div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="h-32 sm:h-40 w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                                barCategoryGap="20%"
                            >
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={false}
                                />
                                <YAxis
                                    hide={true}
                                    domain={[0, yAxisMax]}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index]} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        className="text-xs sm:text-sm font-semibold fill-gray-900"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-sm sm:text-base font-semibold">
                        <span className={isPositive ? 'text-emerald-500' : 'text-red-500'}>
                            {formattedPercentage}
                        </span>{' '}
                        <span className="text-gray-900">ggu. Vorjahr</span>
                    </div>
                </div>
            )}
        </div>
    );
}

