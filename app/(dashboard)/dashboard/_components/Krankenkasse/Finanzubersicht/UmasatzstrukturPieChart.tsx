'use client'

import React, { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const DATA = [
    { name: 'Kassenanteil', value: 82, amount: 31302, color: '#61A175' },
    { name: 'Eigenanteil', value: 18, amount: 7018, color: '#94a3b8' },
]

const TOTAL = 38320

function formatAmount(n: number) {
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n) + ' €'
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; amount: number; value: number } }> }) {
    if (!active || !payload?.length) return null
    const { name, amount, value } = payload[0].payload
    return (
        <div className="relative z-[9999] rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-xl">
            <p className="text-sm font-semibold text-gray-900">{name}</p>
            <p className="text-base font-bold text-gray-800 mt-1">{formatAmount(amount)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{value}% vom Gesamtumsatz</p>
        </div>
    )
}

export default function UmasatzstrukturPieChart() {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

    return (
        <div className="flex h-full min-h-[340px] flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <header className="mb-4 shrink-0">
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    Umsatzstruktur
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Kasse vs. Eigenanteil
                </p>
            </header>
            <div className="relative min-h-[260px] flex-1">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900 sm:text-sm">
                            {formatAmount(TOTAL)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Gesamtumsatz</p>
                    </div>
                </div>
                <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius="58%"
                            outerRadius="82%"
                            paddingAngle={3}
                            dataKey="value"
                            activeIndex={activeIndex}
                            activeShape={{ stroke: 'white', strokeWidth: 3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                        >
                            {DATA.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.color}
                                    stroke={activeIndex === index ? 'white' : 'transparent'}
                                    strokeWidth={activeIndex === index ? 3 : 0}
                                    style={{ cursor: 'pointer', transition: 'filter 0.2s' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                            wrapperStyle={{ zIndex: 9999 }}
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 shrink-0">
                {DATA.map((entry) => (
                    <div
                        key={entry.name}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-2.5">
                            <span
                                className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white ring-offset-1 shadow-sm"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {entry.name}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {formatAmount(entry.amount)} ({entry.value}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
