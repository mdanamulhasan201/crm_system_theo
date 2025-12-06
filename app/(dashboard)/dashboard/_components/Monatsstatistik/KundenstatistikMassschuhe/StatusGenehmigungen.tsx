'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const approvalData = [
    { name: 'Genehmigt', value: 35, color: '#065f46' },
    { name: 'Warten auf Genehmigung', value: 75, color: '#10b981' },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                <p className="text-sm font-semibold text-gray-800">
                    {payload[0].name}
                </p>
                <p className="text-xs text-gray-600">
                    {payload[0].value} Aufträge
                </p>
            </div>
        );
    }
    return null;
};

export default function StatusGenehmigungen() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col overflow-hidden">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                Status Genehmigungen
            </h3>
            <div className="flex-1 flex flex-col">
                {/* Donut Chart */}
                <div className="flex items-center justify-center py-4 sm:py-6 flex-1 min-h-[200px] sm:min-h-[240px] max-h-[280px]">
                    <div className="w-full h-full max-w-full overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <Pie
                                    data={approvalData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="45%"
                                    outerRadius="70%"
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {approvalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Legend at Bottom */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex-shrink-0">
                    <div className="flex flex-col gap-2 sm:gap-3">
                        {approvalData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                                        {entry.name}
                                    </span>
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 flex-shrink-0 ml-2">
                                    {entry.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

