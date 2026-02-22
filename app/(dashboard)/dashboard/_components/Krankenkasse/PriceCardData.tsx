'use client'

import React from 'react'
import { Building2, Clock, Check, Euro } from 'lucide-react'

const CARDS = [
    {
        title: 'Aktive Krankenkassen',
        value: '24',
        subtext: '+2 diesen Monat',
        icon: Building2,
        iconBg: 'bg-blue-500',
        iconColor: 'text-white',
    },
    {
        title: 'Offene Kostenvoranschläge',
        value: '12',
        subtext: '4 warten auf Genehmigung',
        icon: Clock,
        iconBg: 'bg-orange-500',
        iconColor: 'text-white',
    },
    {
        title: 'Genehmigte Aufträge',
        value: '156',
        subtext: '+18 diese Woche',
        icon: Check,
        iconBg: 'bg-green-500',
        iconColor: 'text-white',
    },
    {
        title: 'Umsatz (Monat)',
        value: '24.380 €',
        subtext: '-12% zum Vormonat',
        icon: Euro,
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
    },
]

export default function PriceCardData() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CARDS.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className="flex min-w-0 flex-row items-stretch justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600">
                                {card.title}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                                {card.value}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {card.subtext}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center">
                            <div
                                className={`flex size-12 items-center justify-center rounded-lg sm:size-14 ${card.iconBg} ${card.iconColor ?? 'text-white'}`}
                            >
                                <Icon className="size-6 sm:size-7" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
