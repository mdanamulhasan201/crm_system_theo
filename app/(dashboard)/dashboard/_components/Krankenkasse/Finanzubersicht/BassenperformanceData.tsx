'use client'

import React from 'react'

const INSURANCES = [
    { name: 'AOK Bayern', cases: 2, paid: 8880, total: 13840 },
    { name: 'Barmer', cases: 2, paid: 4480, total: 10240 },
    { name: 'TK', cases: 2, paid: 2340, total: 4820 },
    { name: 'DAK', cases: 1, paid: 1512, total: 1512 },
    { name: 'IKK Classic', cases: 1, paid: 890, total: 890 },
]

function formatAmount(n: number) {
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n) + ' €'
}

export default function BassenperformanceData() {
    return (
        <div className="flex h-full min-h-[340px] flex-col rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <header className="mb-4 shrink-0">
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    Kassenperformance
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Zahlungsverhalten nach Krankenkasse
                </p>
            </header>
            <div className="min-h-0 flex-1 space-y-4 overflow-auto">
                {INSURANCES.map((item) => {
                    const pct = Math.round((item.paid / item.total) * 100)
                    const fallText = item.cases === 1 ? '1 Fall' : `${item.cases} Fälle`
                    return (
                        <div key={item.name} className="space-y-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="font-medium text-gray-900">
                                    {item.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {fallText}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                                <span>
                                    {formatAmount(item.paid)} /{' '}
                                    {formatAmount(item.total)}
                                </span>
                                <span
                                    className={
                                        pct === 100
                                            ? 'font-medium text-[#61A175]'
                                            : 'text-gray-600'
                                    }
                                >
                                    {pct}% bezahlt
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-[#61A175] transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
