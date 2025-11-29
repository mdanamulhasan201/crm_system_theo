'use client';

import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const greenData = [
    { x: 0, y: 0 },
    { x: 1, y: 10 },
    { x: 2, y: 8 },
    { x: 3, y: 18 },
];

const redData = [
    { x: 0, y: 18 },
    { x: 1, y: 8 },
    { x: 2, y: 10 },
    { x: 3, y: 0 },
];

const cards = [
    {
        id: 'active',
        title: 'Aktive Masschuhaufträge',
        count: 15,
        trendLabel: '100%',
        trendColor: 'text-emerald-500',
        isUp: true,
        data: greenData,
        stroke: '#22c55e',
    },
    {
        id: 'waiting',
        title: 'Aufträge warten auf Versorgungstart',
        count: 15,
        trendLabel: '100%',
        trendColor: 'text-emerald-500',
        isUp: true,
        data: greenData,
        stroke: '#22c55e',
    },
    {
        id: 'completed',
        title: 'Abgeschlossene Aufträge',
        count: 15,
        trendLabel: '100%',
        trendColor: 'text-rose-500',
        isUp: false,
        data: redData,
        stroke: '#ef4444',
    },
] as const;

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

function MiniAreaChart({ data, color }: { data: { x: number; y: number }[]; color: string }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="x" hide />
                <YAxis dataKey="y" hide />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Area
                    type="monotone"
                    dataKey="y"
                    stroke={color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#color-${color})`}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}


export default function CardStatistik() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Massschuhaufträge</h1>
            <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <div className="mb-6 text-base  lg:text-lg font-medium text-slate-600">
                            {card.title}
                        </div>
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <div className="mb-3 text-3xl font-semibold text-slate-900">
                                    {card.count}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span
                                        className={`inline-flex items-center gap-1 font-medium ${card.trendColor}`}
                                    >
                                        {card.isUp ? (
                                            <FaArrowUp className="h-3 w-3" />
                                        ) : (
                                            <FaArrowDown className="h-3 w-3" />
                                        )}
                                        {card.trendLabel}
                                    </span>
                                    <span className="text-slate-400">vs last month</span>
                                </div>
                            </div>
                            <div className="h-24 w-40">
                                <MiniAreaChart data={card.data} color={card.stroke} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
