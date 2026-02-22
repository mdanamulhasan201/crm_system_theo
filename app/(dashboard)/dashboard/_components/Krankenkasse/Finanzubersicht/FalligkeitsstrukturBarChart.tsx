'use client'

import React from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

const DATA = [
    { name: 'Aktuell', value: 0 },
    { name: '0-30 Tage', value: 0 },
    { name: '30-60 Tage', value: 0 },
    { name: '60+ Tage', value: 22000 },
]

const BAR_COLOR = '#ef4444'

export default function FalligkeitsstrukturBarChart() {
    return (
        <div className="flex h-full min-h-[340px] flex-col rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <header className="mb-4 shrink-0">
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    Fälligkeitsstruktur
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Offene Beträge nach Fälligkeit
                </p>
            </header>
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <BarChart
                        data={DATA}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            height={32}
                        />
                        <YAxis
                            domain={[0, 24000]}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            width={32}
                            tickFormatter={(v) => `${v / 1000}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => [
                                new Intl.NumberFormat('de-DE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(value) + ' €',
                                'Offener Betrag',
                            ]}
                            contentStyle={{
                                borderRadius: 6,
                                border: '1px solid #e5e7eb',
                            }}
                            cursor={{ fill: 'rgba(239, 68, 68, 0.08)' }}
                        />
                        <Bar
                            dataKey="value"
                            fill={BAR_COLOR}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={48}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
