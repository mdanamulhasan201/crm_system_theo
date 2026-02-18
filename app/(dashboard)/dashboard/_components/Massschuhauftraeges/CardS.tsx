'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { getMassschuheOrderData } from '@/apis/MassschuheManagemantApis';

interface StatsData {
    completed: {
        current: number;
        previous: number;
        changePercent: number;
    };
    waitingToStart: {
        current: number;
        previous: number;
        changePercent: number;
    };
    active: {
        current: number;
        previous: number;
        changePercent: number;
    };
}

// Static chart data - same for all cards
const staticGreenData = [
    { x: 0, y: 0 },
    { x: 1, y: 10 },
    { x: 2, y: 8 },
    { x: 3, y: 18 },
];

const staticRedData = [
    { x: 0, y: 18 },
    { x: 1, y: 8 },
    { x: 2, y: 10 },
    { x: 3, y: 0 },
];

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


export default function CardStatistik({ onRefetchReady }: { onRefetchReady?: (refetch: () => void) => void }) {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMassschuheOrderData();
            if (response.success && response.data) {
                setStatsData(response.data);
            } else {
                setError('Failed to fetch stats data');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Expose refetch function to parent component
    useEffect(() => {
        if (onRefetchReady) {
            onRefetchReady(fetchStats);
        }
    }, [onRefetchReady, fetchStats]);

    // Generate cards from API data
    // Chart is static, but color/arrow based on current vs previous comparison
    const cards = statsData ? [
        {
            id: 'active',
            title: 'Aktive Masschuhaufträge',
            count: statsData.waitingToStart.current,
            trendLabel: `${Math.abs(statsData.waitingToStart.changePercent).toFixed(2)}%`,
            // current > previous = high (green/up), current < previous = low (red/down)
            trendColor: statsData.waitingToStart.current > statsData.waitingToStart.previous ? 'text-emerald-500' : 'text-rose-500',
            isUp: statsData.waitingToStart.current > statsData.waitingToStart.previous,
            data: statsData.waitingToStart.current > statsData.waitingToStart.previous ? staticGreenData : staticRedData,
            stroke: statsData.waitingToStart.current > statsData.waitingToStart.previous ? '#22c55e' : '#ef4444',
        },
        {
            id: 'waiting',
            title: 'Aufträge warten auf Versorgungstart',
            count: statsData.active.current,
            trendLabel: `${Math.abs(statsData.active.changePercent).toFixed(2)}%`,
            trendColor: statsData.active.current > statsData.active.previous ? 'text-emerald-500' : 'text-rose-500',
            isUp: statsData.active.current > statsData.active.previous,
            data: statsData.active.current > statsData.active.previous ? staticGreenData : staticRedData,
            stroke: statsData.active.current > statsData.active.previous ? '#22c55e' : '#ef4444',
        },
        {
            id: 'completed',
            title: 'Abgeschlossene Aufträge',
            count: statsData.completed.current,
            trendLabel: `${Math.abs(statsData.completed.changePercent).toFixed(2)}%`,
            trendColor: statsData.completed.current > statsData.completed.previous ? 'text-emerald-500' : 'text-rose-500',
            isUp: statsData.completed.current > statsData.completed.previous,
            data: statsData.completed.current > statsData.completed.previous ? staticGreenData : staticRedData,
            stroke: statsData.completed.current > statsData.completed.previous ? '#22c55e' : '#ef4444',
        },
    ] : [];

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Massschuhaufträge</h1>
            {loading ? (
                <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse"
                        >
                            <div className="mb-6 h-6 bg-slate-200 rounded w-3/4"></div>
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <div className="mb-3 h-10 bg-slate-200 rounded w-16"></div>
                                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                                </div>
                                <div className="h-24 w-40 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
                    {error}
                </div>
            ) : (
                <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-6 text-sm font-medium text-slate-600">
                                {card.title}
                            </div>
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <div className="mb-3 text-2xl font-semibold text-slate-900">
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
            )}
        </>
    )
}
