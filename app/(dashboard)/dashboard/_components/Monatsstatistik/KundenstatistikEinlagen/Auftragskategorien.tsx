'use client';

import React from 'react';

const data = [
    { name: 'Neukunden', value: 45 },
    { name: 'Neukunden durch App', value: 28 },
    { name: 'Bestandskunden Nachbestellungen', value: 15 },
    { name: 'Bestandskunden neuer Auffrag', value: 22 },
];

const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

export default function Auftragskategorien() {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                Auftragskategorien
            </h3>
            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {data.map((item, index) => (
                        <div key={index} className="w-full">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate pr-2">
                                    {item.name}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-gray-900 flex-shrink-0">
                                    {item.value}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 text-center">
                        {totalOrders} Abgeschlossene Aufträge
                    </p>
                </div>
            </div>
        </div>
    );
}
