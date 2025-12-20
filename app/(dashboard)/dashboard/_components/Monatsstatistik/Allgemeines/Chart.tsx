'use client';

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { getRevenueChartData } from '@/apis/monatsstatistikApis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartDataItem {
    date: string;
    value: number;
}

interface ApiResponse {
    success: boolean;
    data: ChartDataItem[];
}

// Format date from "DD-MM-YYYY" to "DD/MM" for display
const formatDate = (dateString: string): string => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}`;
    }
    return dateString;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const value = payload[0].value;

    return (
        <div className="rounded-xl border-2 border-emerald-500 bg-white px-4 py-2 text-center text-xs shadow-md">
            <div className="text-base font-semibold text-emerald-500">
                {value}
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-700">
                {label}
            </div>
        </div>
    );
};

function CustomDateTick(props: any) {
    const { x, y, payload, activeIndex } = props;
    const isActive = payload.index === activeIndex;

    if (!isActive) {
        return (
            <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fill="#6b7280"
                fontSize={9}
            >
                {payload.value}
            </text>
        );
    }

    const boxWidth = 40;
    const boxHeight = 20;

    return (
        <g transform={`translate(${x}, ${y + 6})`}>
            <rect
                x={-boxWidth / 2}
                y={0}
                width={boxWidth}
                height={boxHeight}
                rx={4}
                ry={4}
                fill="#f9fafb"
                stroke="#9ca3af"
            />
            <text
                x={0}
                y={13}
                textAnchor="middle"
                fill="#374151"
                fontSize={9}
            >
                {payload.value}
            </text>
        </g>
    );
}

export default function Chart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('small');
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
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

    // Fetch chart data from API
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response: ApiResponse = await getRevenueChartData(selectedYear, selectedMonth);
                if (response.success && response.data) {
                    // Format dates for display
                    const formattedData = response.data.map(item => ({
                        ...item,
                        date: formatDate(item.date),
                    }));
                    setChartData(formattedData);
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
                setError('Fehler beim Laden der Daten');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [selectedYear, selectedMonth]);

    // Calculate minimum width based on data points (each point needs ~50px width)
    const minChartWidth = Math.max(800, chartData.length * 50);

    // Calculate Y-axis domain dynamically based on max value
    const getYAxisDomain = () => {
        if (chartData.length === 0) return [0, 9];
        const maxValue = Math.max(...chartData.map(item => item.value));
        // Add 10% padding to the top, or minimum of 1
        const maxDomain = Math.max(maxValue * 1.1, 1);
        return [0, Math.ceil(maxDomain)];
    };

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('small');
            } else if (width < 1024) {
                setScreenSize('medium');
            } else {
                setScreenSize('large');
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Determine X-axis interval based on screen size
    const getXAxisInterval = () => {
        if (screenSize === 'small') return 0; // Show all on small (with scroll)
        if (screenSize === 'medium') return 2; // Show every 3rd label on medium to prevent overlap
        return 'preserveStartEnd'; // Smart spacing on large
    };

    // Adjust chart margins based on screen size
    const getChartMargin = () => {
        if (screenSize === 'small') return { top: 20, right: 10, left: 0, bottom: 30 };
        if (screenSize === 'medium') return { top: 20, right: 20, left: 10, bottom: 40 };
        return { top: 20, right: 30, left: 20, bottom: 50 };
    };

    return (
        <div className="w-full h-full rounded-2xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm flex flex-col overflow-hidden">
            {/* Filter Buttons - Always Visible */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 pb-3 border-b border-gray-100">
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

            {/* Chart Area - Shows loading/error/content */}
            {loading ? (
                <div className="flex-1 w-full min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[350px] overflow-x-auto md:overflow-x-hidden overflow-y-hidden">
                    <div className="h-full w-full p-4 relative">
                        {/* Y-axis shimmer */}
                        <div className="absolute left-4 top-4 bottom-12 w-8 flex flex-col justify-between">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-3 w-8 bg-gray-200 animate-pulse rounded" />
                            ))}
                        </div>
                        
                        {/* Chart content area shimmer */}
                        <div className="ml-12 mr-4 h-full relative">
                            {/* Grid lines shimmer */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-px bg-gray-200/50 animate-pulse" />
                                ))}
                            </div>
                            
                            {/* Line chart shimmer - curved line */}
                            <div className="absolute inset-0 flex items-end pb-12">
                                <svg className="w-full h-[calc(100%-3rem)]" preserveAspectRatio="none" viewBox="0 0 800 200">
                                    <path
                                        d="M 0 180 Q 150 150, 300 120 T 600 80 T 800 50"
                                        stroke="#d1d5db"
                                        strokeWidth="3"
                                        fill="none"
                                        className="animate-pulse"
                                    />
                                    {/* Dots */}
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map((i) => {
                                        const x = (i / 29) * 800;
                                        const y = 180 - (i / 29) * 130;
                                        return (
                                            <circle
                                                key={i}
                                                cx={x}
                                                cy={y}
                                                r="4"
                                                fill="#d1d5db"
                                                className="animate-pulse"
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                            
                            {/* X-axis labels shimmer */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                    <div key={i} className="h-3 w-10 bg-gray-200 animate-pulse rounded" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 w-full min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[350px] flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex-1 w-full min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[350px] flex items-center justify-center">
                    <p className="text-gray-500">Keine Daten verfügbar</p>
                </div>
            ) : (
                <div className="flex-1 w-full min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[350px] overflow-x-auto md:overflow-x-hidden overflow-y-hidden">
                <div
                    className="h-full w-full md:w-auto"
                    style={{
                        minWidth: screenSize === 'small' ? `${minChartWidth}px` : '100%'
                    }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={getChartMargin()}
                            onMouseMove={(state: any) => {
                                if (
                                    state &&
                                    typeof state.activeTooltipIndex === 'number'
                                ) {
                                    setActiveIndex(state.activeTooltipIndex);
                                } else {
                                    setActiveIndex(null);
                                }
                            }}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={(props) => (
                                    <CustomDateTick
                                        {...props}
                                        activeIndex={activeIndex}
                                    />
                                )}
                                tickMargin={16}
                                axisLine={false}
                                tickLine={false}
                                interval={getXAxisInterval()}
                                height={50}
                            />
                            <YAxis
                                domain={getYAxisDomain()}
                                tick={{ fontSize: screenSize === 'medium' ? 9 : 10, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickMargin={4}
                                width={screenSize === 'medium' ? 35 : screenSize === 'large' ? 40 : 30}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#a7f3d0', strokeDasharray: '4 4' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#10b981' }}
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 2,
                                    stroke: '#10b981',
                                    fill: '#fff',
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                </div>
            )}
        </div>
    );
}
