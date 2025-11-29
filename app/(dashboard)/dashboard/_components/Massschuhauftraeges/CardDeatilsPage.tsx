'use client';

import React, { useState } from 'react';
import { FaArrowUp, FaExclamationTriangle } from 'react-icons/fa';
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

// Line chart data for "Linienverlauf - Letzte Monate"
const lineChartData = [
    { month: 'Jan', value: 2 },
    { month: 'Feb', value: 3 },
    { month: 'März', value: 2.5 },
    { month: 'Apr', value: 3.5 },
    { month: 'Mai', value: 4 },
    { month: 'Jun', value: 5 },
];

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

function CustomMonthTick(props: any) {
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

export default function CardDetailsPage() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="w-full mt-8">
            {/* Top Row: 2 cards */}
            <div className="flex flex-row gap-6 mb-6">
                {/* Card 1: Aktuelle Dauer */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm w-full md:w-4/12">
                    <div className="mb-4 text-lg font-medium text-slate-700 text-center">
                        Aktuelle Dauer
                    </div>
                    <div className="mb-3 text-center">
                        <div className="text-4xl font-semibold text-slate-900">15,0</div>
                        <h2 className="text-xl text-black font-bold">Tage</h2>
                    </div>
                    <div className="flex flex-col  items-center gap-2 text-xl">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-500">
                            <FaArrowUp className="h-3 w-3" />
                            1,2 Tage
                        </span>
                        <span className="text-slate-400 text-lg">vs. Vormonat</span>
                    </div>
                </div>

                {/* Card 2: Linienverlauf - Letzte Monate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm w-full md:w-8/12">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Linienverlauf - Letzte Monate
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={lineChartData}
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
                                    dataKey="month"
                                    tick={(props) => (
                                        <CustomMonthTick
                                            {...props}
                                            activeIndex={activeIndex}
                                        />
                                    )}
                                    tickMargin={16}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 6]}
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
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
            </div>

            {/* Bottom Row: 3 cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card 3: Ausreisser */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Ausreisser
                    </div>
                    <div className="mb-4">
                        <div className="text-2xl font-semibold text-slate-900">14 Tage</div>
                    </div>
                    <div className="mb-4 space-y-3">
                        <div className="flex items-center  gap-5">
                            <div className="h-2 flex-1 max-w-24 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-slate-600 whitespace-nowrap">&gt;30 Tage</span>
                        </div>
                        <div className="flex items-center  gap-5">
                            <div className="h-2 flex-1 max-w-16 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-slate-600 whitespace-nowrap">&gt;50 Tage</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                        <FaExclamationTriangle className="mt-0.5 h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>Trigger: Zeigt Aufträge, die seit längerem nicht abgeschlossen wurden.</span>
                    </div>
                </div>

                {/* Card 4: Überfällige Fälle */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Überfällige Fälle
                    </div>
                    <div className="mb-2">
                        <div className="text-2xl font-semibold text-slate-900">6 Fälle</div>
                    </div>
                    <div className="text-sm text-slate-500">
                        &gt;10 Tage im Schnitt
                    </div>
                </div>

                {/* Card 5: Reklamationsquote */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Reklamationsquote
                    </div>
                    <div className="mb-3">
                        <div className="text-3xl font-semibold text-slate-900">2%</div>
                    </div>
                    <div className="text-sm font-medium text-emerald-500">
                        Nur 2% der Aufträge mussten nachgebessert werden
                    </div>
                </div>
            </div>
        </div>
    );
}
