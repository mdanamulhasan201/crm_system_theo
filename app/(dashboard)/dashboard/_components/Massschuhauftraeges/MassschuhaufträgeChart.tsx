'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { getMassschuheOrderChartData } from '@/apis/MassschuheManagemantApis';

interface ChartPoint {
    date: string;
    count: number;
    revenue: number;
}

interface ChartData {
    from: string;
    to: string;
    points: ChartPoint[];
    totalCount: number;
    totalRevenue: number;
}

// Format date from "2025-12-08" to "08/12"
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const revenue = payload[0].value;
    const count = payload[0].payload?.count || 0;

    return (
        <div className="rounded-xl border-2 border-emerald-500 bg-white px-4 py-2 text-center text-xs shadow-md">
            <div className="text-base font-semibold text-emerald-500">
                €{revenue.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-700">
                {label}
            </div>
            {count > 0 && (
                <div className="mt-1 text-[10px] text-slate-500">
                    {count} {count === 1 ? 'Auftrag' : 'Aufträge'}
                </div>
            )}
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
                fontSize={11}
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
                fontSize={10}
            >
                {payload.value}
            </text>
        </g>
    );
}

export default function MassschuhaufträgeChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChartData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMassschuheOrderChartData();
            if (response.success && response.data) {
                // Validate that we have points data
                if (response.data.points && Array.isArray(response.data.points) && response.data.points.length > 0) {
                    setChartData(response.data);
                } else {
                    setError('No chart data points available');
                }
            } else {
                setError('Failed to fetch chart data');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to fetch chart data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    // Transform API data to chart format and sort by date
    const transformedData = chartData?.points
        .filter((point) => point && point.date && typeof point.revenue === 'number' && !isNaN(point.revenue))
        .map((point) => ({
            date: formatDate(point.date),
            value: Number(point.revenue) || 0,
            count: Number(point.count) || 0,
            revenue: Number(point.revenue) || 0,
            originalDate: point.date, // Keep for sorting
        }))
        .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
        .map(({ originalDate, ...rest }) => rest) || [];

    // Calculate Y-axis domain with padding
    const getYAxisDomain = () => {
        if (transformedData.length === 0) return [0, 100];
        
        const values = transformedData.map((d) => d.value).filter(v => typeof v === 'number' && !isNaN(v));
        if (values.length === 0) return [0, 100];
        
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // If all values are zero, show a default range
        if (maxValue === 0) {
            return [0, 100];
        }
        
        // If all values are the same (non-zero), add padding
        if (minValue === maxValue && maxValue > 0) {
            const padding = Math.max(maxValue * 0.15, 20);
            return [0, maxValue + padding];
        }
        
        // Normal case: add padding to top, always start from 0
        const padding = Math.max(maxValue * 0.1, 20);
        return [0, maxValue + padding];
    };

    // Format Y-axis ticks to show currency
    const formatYAxisTick = (value: number) => {
        if (value >= 1000) {
            return `€${(value / 1000).toFixed(1)}k`;
        }
        return `€${value.toFixed(0)}`;
    };

    return (
        <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            {loading ? (
                <div className="h-72 w-full flex items-center justify-center">
                    <div className="text-slate-400">Loading chart data...</div>
                </div>
            ) : error ? (
                <div className="h-72 w-full flex items-center justify-center">
                    <div className="text-red-500">{error}</div>
                </div>
            ) : transformedData.length === 0 ? (
                <div className="h-72 w-full flex items-center justify-center">
                    <div className="text-slate-400">No chart data available</div>
                </div>
            ) : (
                <>
                    {chartData && (
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Revenue Chart</h3>
                                <p className="text-sm text-slate-500">
                                    Total: €{chartData.totalRevenue.toFixed(2)} • {chartData.totalCount} {chartData.totalCount === 1 ? 'Auftrag' : 'Aufträge'}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                key={`chart-${transformedData.length}`}
                                data={transformedData}
                                margin={{ top: 30, right: 30, left: 10, bottom: 20 }}
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
                                />
                                <YAxis
                                    domain={getYAxisDomain()}
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
                                    tickFormatter={formatYAxisTick}
                                    allowDataOverflow={false}
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
                                    dot={(props: any) => {
                                        // Show dot for all points, but make non-zero values more prominent
                                        const { cx, cy, payload } = props;
                                        if (payload.value > 0) {
                                            return (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={5}
                                                    strokeWidth={2}
                                                    stroke="#fff"
                                                    fill="#10b981"
                                                />
                                            );
                                        }
                                        // Smaller dot for zero values
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={2}
                                                strokeWidth={1}
                                                stroke="#e5e7eb"
                                                fill="#e5e7eb"
                                                opacity={0.5}
                                            />
                                        );
                                    }}
                                    activeDot={{
                                        r: 7,
                                        strokeWidth: 2,
                                        stroke: '#10b981',
                                        fill: '#fff',
                                    }}
                                    connectNulls={false}
                                    isAnimationActive={true}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
