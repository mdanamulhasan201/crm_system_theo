'use client';

import React from 'react';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

export type ChartTimeRange = '7T' | '30T' | 'Monat' | 'Jahr';

export interface ChartDataPoint {
    date: string;
    value: number;
}

interface LineChartComponentProps {
    chartData: ChartDataPoint[];
    previousChartData?: ChartDataPoint[];
    timeRange: ChartTimeRange;
    onTimeRangeChange: (range: ChartTimeRange) => void;
}

const TIME_RANGE_OPTIONS: { value: ChartTimeRange; label: string }[] = [
    { value: '7T', label: '7T' },
    { value: '30T', label: '30T' },
    { value: 'Monat', label: 'Monat' },
    { value: 'Jahr', label: 'Jahr' },
];

export default function LineChartComponent({
    chartData,
    previousChartData = [],
    timeRange,
    onTimeRangeChange,
}: LineChartComponentProps) {
    // Merge current and previous by date for ComposedChart (same X axis)
    const mergedData = React.useMemo(() => {
        const byDate = new Map<string, { current?: number; previous?: number }>();
        chartData.forEach((d) => {
            byDate.set(d.date, { ...byDate.get(d.date), current: d.value });
        });
        previousChartData.forEach((d) => {
            const existing = byDate.get(d.date) ?? {};
            byDate.set(d.date, { ...existing, previous: d.value });
        });
        const dates = Array.from(new Set([...chartData.map((d) => d.date), ...previousChartData.map((d) => d.date)])).sort();
        return dates.map((date) => ({
            date,
            current: byDate.get(date)?.current ?? null,
            previous: byDate.get(date)?.previous ?? null,
        }));
    }, [chartData, previousChartData]);

    const hasPrevious = previousChartData.length > 0;
    const hasData = mergedData.length > 0 && mergedData.some((d) => d.current != null || d.previous != null);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                {payload.map((entry: any) => (
                    <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value != null ? `${Number(entry.value).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '—'}
                    </p>
                ))}
            </div>
        );
    };

    if (!hasData) {
        return (
            <div className="w-full">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Umsatzübersicht</h2>
                        <p className="text-sm text-gray-500">Umsatzentwicklung im Zeitverlauf</p>
                    </div>
                    <div className="mt-2 flex gap-1 sm:mt-0">
                        {TIME_RANGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onTimeRangeChange(opt.value)}
                                className={cn(
                                    'rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                                    timeRange === opt.value
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex h-[320px] items-center justify-center rounded-lg bg-gray-50">
                    <p className="text-gray-500">Keine Daten verfügbar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Umsatzübersicht</h2>
                    <p className="text-sm text-gray-500">Umsatzentwicklung im Zeitverlauf</p>
                </div>
                {/* <div className="flex gap-1">
                    {TIME_RANGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onTimeRangeChange(opt.value)}
                            className={cn(
                                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                                timeRange === opt.value
                                    ? 'border-gray-300 bg-gray-100 text-gray-800'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div> */}
            </div>

            <div className="min-w-[280px]" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={340}>
                    <ComposedChart
                        data={mergedData}
                        margin={{ top: 12, right: 16, left: 8, bottom: 24 }}
                    >
                        <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" horizontal={true} vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                            dy={8}
                        />
                        <YAxis
                            domain={[0, 'auto']}
                            tickFormatter={(v) => `${v} €`}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: 8 }}
                            align="left"
                            verticalAlign="bottom"
                            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                        />
                        {/* Aktueller Zeitraum: green area + solid line */}
                        <Area
                            type="monotone"
                            dataKey="current"
                            name="Aktueller Zeitraum"
                            stroke="#62A07C"
                            strokeWidth={2}
                            fill="#62A07C"
                            fillOpacity={0.25}
                            dot={false}
                            activeDot={{ r: 4, fill: '#62A07C', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={true}
                        />
                        {/* Vorperiode: dashed line only */}
                        {hasPrevious && (
                            <Line
                                type="monotone"
                                dataKey="previous"
                                name="Vorperiode"
                                stroke="#374151"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={false}
                                activeDot={{ r: 4, fill: '#374151', stroke: '#fff', strokeWidth: 2 }}
                                isAnimationActive={true}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
