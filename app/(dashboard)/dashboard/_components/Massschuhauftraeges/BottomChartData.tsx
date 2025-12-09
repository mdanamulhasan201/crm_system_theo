'use client';

import React, { useEffect, useState } from 'react'
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { getProductionTimelineData } from '@/apis/MassschuheManagemantApis';

interface ChartPoint {
    month: string;
    averageDays: number;
    count: number;
}

interface ChartData {
    year: number;
    points: ChartPoint[];
    totalDelivered: number;
    overallAverageDays: number;
}


const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const averageDays = data.averageDays;
    const count = data.count;

    return (
        <div className="rounded-xl border-2 border-emerald-500 bg-white px-4 py-2 text-center text-xs shadow-md">
            <div className="text-base font-semibold text-emerald-500">
                {averageDays} Tage
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">
                {count} Aufträge
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


export default function BottomChartData() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const currentYear = new Date().getFullYear();
                const response = await getProductionTimelineData(currentYear);
                if (response.success) {
                    setChartData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch production timeline data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate max value for Y-axis domain
    const maxValue = chartData?.points
        ? Math.max(...chartData.points.map(p => p.averageDays), 6)
        : 6;

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-32 w-full bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData?.points || []}
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
                        domain={[0, maxValue]}
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
                        dataKey="averageDays"
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
    );
}