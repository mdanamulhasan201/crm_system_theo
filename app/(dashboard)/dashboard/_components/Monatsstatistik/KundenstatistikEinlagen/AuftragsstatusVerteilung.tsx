'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { getInsoleQuantityParStatusData } from '@/apis/monatsstatistikApis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusData {
    status: string;
    count: number;
}

interface ApiResponse {
    success: boolean;
    data: StatusData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                <p className="text-sm font-semibold text-gray-800">
                    {payload[0].payload.name}
                </p>
                <p className="text-xs text-gray-600">
                    {payload[0].value} Bestellungen
                </p>
            </div>
        );
    }
    return null;
};

export default function AuftragsstatusVerteilung() {
    const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
    const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));

    // Generate year options (current year and previous 4 years)
    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const year = now.getFullYear() - i;
        return { value: String(year), label: String(year) };
    });

    // Generate month options
    const monthOptions = [
        { value: '1', label: 'Januar' },
        { value: '2', label: 'Februar' },
        { value: '3', label: 'März' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mai' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Dezember' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response: ApiResponse = await getInsoleQuantityParStatusData(selectedYear, selectedMonth);
                if (response.success && response.data) {
                    // Transform API data to chart format: status -> name, count -> value
                    const transformedData = response.data.map(item => ({
                        name: item.status,
                        value: item.count,
                    }));
                    setChartData(transformedData);
                }
            } catch (err) {
                console.error('Error fetching insole status data:', err);
                setError('Fehler beim Laden der Daten');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear, selectedMonth]);

    // Calculate Y-axis domain dynamically
    const maxValue = chartData.length > 0 
        ? Math.max(...chartData.map(item => item.value))
        : 35;
    const yAxisMax = Math.max(maxValue * 1.2, 10); // Add 20% padding, minimum 10
    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                    Auftragsstatus-Verteilung
                </h3>
                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                    <div className="animate-pulse text-gray-400">Laden...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                    Auftragsstatus-Verteilung
                </h3>
                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                    Auftragsstatus-Verteilung
                </h3>
                {/* Filter Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Jahr:</label>
                        <Select value={selectedYear} onValueChange={setSelectedYear} disabled={loading}>
                            <SelectTrigger className="w-[140px] cursor-pointer">
                                <SelectValue placeholder="Jahr auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Monat:</label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={loading}>
                            <SelectTrigger className="w-[160px] cursor-pointer">
                                <SelectValue placeholder="Monat auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px] md:min-h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        barCategoryGap="15%"
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false}
                            stroke="#e5e7eb"
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                        />
                        <YAxis
                            label={{ 
                                value: 'Anzahl Bestellungen', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
                            }}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            domain={[0, yAxisMax]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="value" 
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
