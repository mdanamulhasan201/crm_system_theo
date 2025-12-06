'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const data = [
    { name: 'Halbprobe', value: 12 },
    { name: 'Schaft', value: 21 },
    { name: 'Boden-erstellung', value: 8 },
    { name: 'Abholbereit', value: 30 },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                <p className="text-sm font-semibold text-gray-800">
                    {payload[0].payload.name}
                </p>
                <p className="text-xs text-gray-600">
                    {payload[0].value} Aufträge
                </p>
            </div>
        );
    }
    return null;
};

export default function AuftragsstatusVerteilung() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                Auftragsstatus-Verteilung
            </h3>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px] md:min-h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        barCategoryGap="15%"
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false}
                            stroke="#e5e7eb"
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                        />
                        <YAxis
                            label={{ 
                                value: 'Anzahl', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
                            }}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            domain={[0, 35]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="value" 
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
