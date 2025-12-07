'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

// Donut chart data for Aufgabenverteilung
const aufgabenData = [
    { name: 'Urlaub', value: 60, color: '#065f46' },
    { name: 'Sonstisch', value: 30, color: '#10b981' },
    { name: 'Unsotigs', value: 10, color: '#34d399' },
];

// Custom Tooltip component
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                <p className="text-sm font-semibold text-gray-800">
                    {payload[0].name}
                </p>
                <p className="text-xs text-gray-600">
                    {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

export default function Aufgabenverteilung() {
    return (
        <div className="w-full mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
                {/* Left Card - Hours and Abvergungen */}
                <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                    <div className="flex flex-col gap-6 sm:gap-8">
                        {/* First Stat */}
                        <div>
                            <p className="text-3xl sm:text-4xl  font-bold text-emerald-500 mb-1">
                                125 h
                            </p>
                            <p className="text-sm sm:text-base text-slate-500">
                                0 Produktstunden
                            </p>
                        </div>

                        {/* Second Stat */}
                        <div>
                            <p className="text-3xl sm:text-4xl  font-bold text-emerald-500 mb-1">
                                340
                            </p>
                            <p className="text-sm sm:text-base text-slate-500">
                                Abvergungen
                            </p>
                        </div>
                    </div>
                </div>

                {/* Middle Card - Aufgabenverteilung with Donut Chart */}
                <div className="lg:col-span-6 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase mb-2 sm:mb-3">
                        Aufgabenverteilung
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                        Weniger produktionsstunden aber mehr versorgungen produktionssatz höher als vergangen monat
                    </p>

                    {/* Donut Chart and Legend */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Donut Chart */}
                        <div className="w-full sm:w-1/2 flex-shrink-0 flex items-center justify-center h-[200px] sm:h-[240px]">
                            <div className="w-full h-full max-w-full overflow-hidden">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                        <Pie
                                            data={aufgabenData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="45%"
                                            outerRadius="70%"
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {aufgabenData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full sm:w-1/2 flex flex-col gap-2 sm:gap-3">
                            {aufgabenData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 sm:gap-3">
                                    <div
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm sm:text-base text-slate-700">
                                        {item.value}% {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Card - Abwesenheitstage */}
                <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                    <div className="flex flex-col justify-center h-full">
                        <p className="text-3xl sm:text-4xl  font-bold text-emerald-500 mb-1">
                            16
                        </p>
                        <p className="text-sm sm:text-base text-slate-500">
                            Abwesenheiistage gomt
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
