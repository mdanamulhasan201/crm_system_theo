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

const chartData = [
    { date: '23/03', value: 0.4 },
    { date: '23/03', value: 0.9 },
    { date: '23/03', value: 1.9 },
    { date: '23/03', value: 4.0 },
    { date: '23/03', value: 4.5 },
    { date: '23/03', value: 5.2 },
    { date: '23/03', value: 7.2 },
    { date: '23/03', value: 3.9 },
    { date: '23/03', value: 0.5 },
    { date: '23/03', value: 0.0 },
    { date: '23/03', value: 0.6 },
    { date: '23/03', value: 1.8 },
    { date: '23/03', value: 2.7 },
    { date: '23/03', value: 2.8 },
    { date: '23/03', value: 3.8 },
    { date: '23/03', value: 5.1 },
    { date: '17-04-2025', value: 7.3 },
    { date: '23/03', value: 6.8 },
    { date: '23/03', value: 5.5 },
    { date: '23/03', value: 4.7 },
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

    // Calculate minimum width based on data points (each point needs ~50px width)
    const minChartWidth = Math.max(800, chartData.length * 50);

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
                                domain={[0, 9]}
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
        </div>
    );
}
