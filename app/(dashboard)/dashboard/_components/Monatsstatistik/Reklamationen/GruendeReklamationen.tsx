'use client';

import React from 'react';

const data = [
    { name: 'Passformproblem', value: 0 },
    { name: 'Materialfehler', value: 0 },
    { name: 'Lieferverzögerung', value: 0 },
    { name: 'Sonstiges', value: 0 },
];

export default function GruendeReklamationen() {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">
                Gründe der Reklamationen
            </h3>
            <div className="flex-1 flex flex-col">
                <div className="space-y-3 sm:space-y-4">
                    {data.map((item, index) => {
                        // If value is 0 or maxValue is 0, show full width gray bar
                        const barWidth = maxValue === 0 || item.value === 0 
                            ? 100 
                            : (item.value / maxValue) * 100;

                        return (
                            <div key={index} className="w-full">
                                <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="text-xs sm:text-sm text-gray-700 font-medium truncate pr-2">
                                        {item.name}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                                        {/* {item.value} */}
                                        ---
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3 overflow-hidden">
                                    <div
                                        className="bg-gray-200 h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${barWidth}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

