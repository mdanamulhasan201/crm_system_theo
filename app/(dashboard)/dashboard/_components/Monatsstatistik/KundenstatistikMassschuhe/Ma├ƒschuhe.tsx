'use client';

import React from 'react';

const data = [
    { 
        title: 'Durchschnitt Dauer', 
        subtitle: 'Scan - Fertigstellung', 
        value: 28, 
        percentage: 70 
    },
    { 
        title: 'Arbeitsschritt', 
        subtitle: 'längste Dauer', 
        value: 15, 
        percentage: 40 
    },
    { 
        title: 'Ausreißer', 
        subtitle: 'außer geplanten Zeit', 
        value: 22, 
        percentage: 60 
    },
];

const totalOrders = 110;

export default function Maßschuhe() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                Maßschuhe - Zeit & Ausreißer
            </h3>
            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4 sm:space-y-5 mb-4 sm:mb-6">
                    {data.map((item, index) => (
                        <div key={index} className="w-full">
                            <div className="mb-2">
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-gray-600">
                                    {item.subtitle}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex-1 bg-gray-100 rounded-full h-2 sm:h-3 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${item.percentage}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm sm:text-base font-bold text-gray-900 flex-shrink-0 min-w-[40px] text-right">
                                    {item.value}
                                </span>
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
