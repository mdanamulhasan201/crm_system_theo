'use client';

import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    Cell,
} from 'recharts';
import { TbUser } from 'react-icons/tb';

// Skill categories with colors
const skillCategories = [
    { name: 'Einlagen', color: '#0A6A3F' },
    { name: 'Mabschuhe', color: '#2CB964' },
    { name: 'Versorgung', color: '#60D28E' },
    { name: 'Aubendienst', color: '#99EAD4' },
];

// Employee skill data
const employeeData = [
    {
        name: 'Peter',
        Einlagen: 40,
        Mabschuhe: 30,
        Versorgung: 20,
        Aubendienst: 10,
    },
    {
        name: 'Max',
        Einlagen: 25,
        Mabschuhe: 35,
        Versorgung: 25,
        Aubendienst: 15,
    },
    {
        name: 'Lisa',
        Einlagen: 20,
        Mabschuhe: 20,
        Versorgung: 40,
        Aubendienst: 20,
    },
    {
        name: 'Anna',
        Einlagen: 30,
        Mabschuhe: 25,
        Versorgung: 30,
        Aubendienst: 15,
    },
    {
        name: 'Michael',
        Einlagen: 15,
        Mabschuhe: 45,
        Versorgung: 25,
        Aubendienst: 15,
    },
];

// Summary statistics
const topPerformers = [
    { skill: 'Peete Einlagenstunden', name: 'Peter', hours: 124 },
    { skill: 'Meiste Mabschuhstunden', name: 'Michael', hours: 88 },
    { skill: 'Meiste Versorgung', name: 'Lisa', hours: 152 },
];

const mostStats = [
    { label: 'Meiste Mabschuhstunden', name: 'Michael', hours: 88 },
    { label: 'Meiste Versorgung', name: 'Lisa', hours: 152 },
    { label: 'Meiste Versorgung', name: 'Lisa', hours: 152 },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs text-gray-600">
                        <span style={{ color: entry.color }}>●</span> {entry.dataKey}: {entry.value}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function SkillAuswertung() {
    const [activeFilter, setActiveFilter] = useState('monat');

    return (
        <div className="w-full mt-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Skill-Auswertung
                    </h2>
                    <button
                        onClick={() => setActiveFilter('monat')}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-md transition-colors self-start sm:self-auto"
                    >
                        Monat
                    </button>
                </div>

                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Panel - Employee Skill Breakdown */}
                    <div className="lg:col-span-2">
                        {/* Stacked Bar Chart */}
                        <div className="h-[220px] sm:h-[260px] md:h-[280px] mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={employeeData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                    barCategoryGap="15%"
                                    barGap={0}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 13, fill: '#1f2937', fontWeight: 500 }}
                                        width={50}
                                        tickMargin={0}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Einlagen" stackId="a" fill="#0A6A3F" radius={[8, 0, 0, 8]} />
                                    <Bar dataKey="Mabschuhe" stackId="a" fill="#2CB964" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Versorgung" stackId="a" fill="#60D28E" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Aubendienst" stackId="a" fill="#99EAD4" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-slate-100">
                            {skillCategories.map((category, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="text-xs sm:text-sm text-slate-700">
                                        {category.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Summary Statistics */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Top Performers Card */}
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="space-y-3">
                                {topPerformers.map((performer, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <TbUser className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs sm:text-sm text-slate-700">
                                            <span className="font-medium">{performer.skill}:</span> {performer.name} ({performer.hours} h)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Most Stats Card */}
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                            <div className="space-y-3">
                                {mostStats.map((stat, index) => (
                                    <p key={index} className="text-xs sm:text-sm text-slate-700">
                                        <span className="font-bold">Meiste</span> {stat.label.replace('Meiste ', '')}: {stat.name} ({stat.hours} h)
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
