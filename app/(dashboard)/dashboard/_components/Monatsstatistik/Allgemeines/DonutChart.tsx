'use client';

import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import { getSeallingLocationRevenueData } from '@/apis/monatsstatistikApis';


const baseColors = ['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'];

const generateColors = (count: number): string[] => {
    if (count <= baseColors.length) {
        return baseColors.slice(0, count);
    }
    
    const colors = [...baseColors];
    const additionalNeeded = count - baseColors.length;
    
    for (let i = 0; i < additionalNeeded; i++) {
        const hue = 150 + (i * 10) % 60; 
        const saturation = 50 + (i * 5) % 30; 
        const lightness = 30 + (i * 3) % 40; 
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
};

interface LocationData {
    location: string;
    percentage: number;
    count: number;
}

interface ApiResponse {
    success: boolean;
    data: {
        insoles: LocationData[];
        shoes: LocationData[];
    };
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                <p className="text-sm font-semibold text-gray-800">
                    {payload[0].name}
                </p>
                <p className="text-xs text-gray-600">
                    {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }: any) => {
    return (
        <div className="flex flex-col gap-2">
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-700 truncate">{entry.value}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-shrink-0 ml-2">
                        {entry.payload.value}%
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function DonutChart() {
    const [activeTab, setActiveTab] = useState<'insoles' | 'shoes'>('insoles');
    const [insolesData, setInsolesData] = useState<LocationData[]>([]);
    const [shoesData, setShoesData] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response: ApiResponse = await getSeallingLocationRevenueData();
                if (response.success && response.data) {
                    setInsolesData(response.data.insoles || []);
                    setShoesData(response.data.shoes || []);
                }
            } catch (error) {
                console.error('Error fetching location revenue data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Transform data for chart with dynamic color generation
    const transformData = (locations: LocationData[]) => {
        if (locations.length === 0) return [];
        
        const dynamicColors = generateColors(locations.length);
        return locations.map((item, index) => ({
            name: item.location,
            value: item.percentage,
            color: dynamicColors[index],
            count: item.count,
        }));
    };

    const currentData = activeTab === 'insoles' ? transformData(insolesData) : transformData(shoesData);

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-100 pb-2">
                <button
                    onClick={() => setActiveTab('insoles')}
                    className={`px-4 cursor-pointer py-2 text-sm font-medium transition-colors ${
                        activeTab === 'insoles'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Einlagen
                </button>
                <button
                    onClick={() => setActiveTab('shoes')}
                    className={`px-4 cursor-pointer py-2 text-sm font-medium transition-colors ${
                        activeTab === 'shoes'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Schuhe
                </button>
            </div>

            {/* Donut Chart */}
            {loading ? (
                <div className="flex items-center justify-center flex-1 min-h-[200px]">
                    <p className="text-gray-500">Laden...</p>
                </div>
            ) : currentData.length === 0 ? (
                <div className="flex items-center justify-center flex-1 min-h-[200px]">
                    <p className="text-gray-500">Keine Daten verfügbar</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-center py-4 sm:py-6 flex-1 min-h-[200px] sm:min-h-[240px] max-h-[280px]">
                        <div className="w-full h-full max-w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <Pie
                                        data={currentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="45%"
                                        outerRadius="70%"
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {currentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Legend at Bottom */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex-shrink-0 max-h-[200px] overflow-y-auto">
                        <CustomLegend payload={currentData.map((item) => ({
                            value: item.name,
                            color: item.color,
                            payload: item,
                        }))} />
                    </div>
                </>
            )}
        </div>
    );
}

