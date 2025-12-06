'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    LabelList,
} from 'recharts';

// Comparison card component with bar chart
const ComparisonCard = () => {
    const data = [
        { name: 'Aktuell', value: 312 },
        { name: 'Vorjahr', value: 280 },
    ];

    const colors = ['#475569', '#cbd5e1']; // slate-700 and slate-300

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-4">
                Vergleich zum Vorjahr
            </h3>
            <div className="flex-1 flex flex-col justify-between">
                <div className="h-32 sm:h-40 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                            barCategoryGap="20%"
                        >
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={false}
                            />
                            <YAxis
                                hide={true}
                                domain={[0, 350]}
                            />
                            <Bar
                                dataKey="value"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index]} />
                                ))}
                                <LabelList
                                    dataKey="value"
                                    position="top"
                                    className="text-xs sm:text-sm font-semibold fill-gray-900"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-sm sm:text-base font-semibold">
                    <span className="text-emerald-500">+11%</span>{' '}
                    <span className="text-gray-900">ggu. Vorjahr</span>
                </div>
            </div>
        </div>
    );
};

// Metric card component
interface MetricCardProps {
    title: string;
    value: string;
    percentage: string;
    isPositive: boolean;
}

const MetricCard = ({ title, value, percentage, isPositive }: MetricCardProps) => {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-3 sm:mb-4">
                {title}
            </h3>
            <div className="flex-1 flex flex-col justify-between">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {value}
                </p>
                <div className={`flex items-center gap-2 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? (
                        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                        <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold">
                        {percentage} vs last month
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function Wochenstatistik() {
    // Get current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const dayName = days[now.getDay()];
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${dayName} ${hours}.${minutes} Uhr`;
    };

    return (
        <div className="p-4 sm:p-6 w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Wochenstatistik
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                    Aktualisiert: {getCurrentDateTime()}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                {/* Left Column - Comparison Cards */}
                <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
                    <ComparisonCard />
                    <ComparisonCard />
                </div>

                {/* Right Columns - Metric Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <MetricCard
                        title="Fertiggestellte Einlagen"
                        value="312"
                        percentage="10%"
                        isPositive={false}
                    />
                    <MetricCard
                        title="In Fertigung"
                        value="316"
                        percentage="20%"
                        isPositive={true}
                    />
                    <MetricCard
                        title="Fertiggestellte Masschuhe"
                        value="312"
                        percentage="10%"
                        isPositive={false}
                    />
                    <MetricCard
                        title="In Fertigung"
                        value="316"
                        percentage="20%"
                        isPositive={true}
                    />
                </div>
            </div>
        </div>
    );
}
