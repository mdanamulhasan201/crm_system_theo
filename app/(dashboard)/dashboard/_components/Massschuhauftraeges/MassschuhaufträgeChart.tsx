'use client';

import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const chartData = [
    { date: '11/03', value: 0.3 },
    { date: '13/03', value: 0.5 },
    { date: '15/03', value: 3 },
    { date: '17/03', value: 4 },
    { date: '19/03', value: 5.5 },
    { date: '21/03', value: 7.2 },
    { date: '23/03', value: 6 },
    { date: '25/03', value: 4.5 },
    { date: '27/03', value: 1.2 },
    { date: '29/03', value: 0.1 },
    { date: '31/03', value: 0.4 },
    { date: '02/04', value: 2 },
    { date: '04/04', value: 2.6 },
    { date: '06/04', value: 6.1 },
    { date: '08/04', value: 7.5 },
    { date: '10/04', value: 6.8 },
    { date: '12/04', value: 5.5 },
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

    return (
        <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
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
    );
}
