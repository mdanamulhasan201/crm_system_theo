'use client'

import React, { useEffect, useState } from 'react'
import { Building2, Clock, Check, Euro } from 'lucide-react'
import { getCalculationData } from '@/apis/krankenkasseApis'

interface CalculationData {
    activeKrankenkassen: { count: number; changeCountThisMonth: number }
    ordersWaitingForGenehmigt: { count: number; waitingThisMonthCount: number }
    approvedOrders: { count: number; changeCountThisWeek: number }
    revenueMonth: { amountThisMonth: number; changePercentVsLastMonth: number }
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)

const formatChange = (value: number, suffix = '') => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value}${suffix}`
}

const ICON_CONFIGS = [
    { iconBg: 'bg-blue-500', iconColor: 'text-white', icon: Building2 },
    { iconBg: 'bg-orange-500', iconColor: 'text-white', icon: Clock },
    { iconBg: 'bg-green-500', iconColor: 'text-white', icon: Check },
    { iconBg: 'bg-sky-100', iconColor: 'text-sky-600', icon: Euro },
]

function ShimmerCard({ iconBg }: { iconBg: string }) {
    return (
        <div className="flex min-w-0 flex-row items-stretch justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm sm:p-5 overflow-hidden">
            <div className="min-w-0 flex-1 space-y-3">
                <div className="h-3.5 w-2/3 rounded bg-gray-200 animate-pulse" />
                <div className="h-8 w-1/2 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="flex shrink-0 items-center">
                <div className={`size-12 sm:size-14 rounded-lg animate-pulse ${iconBg} opacity-40`} />
            </div>
        </div>
    )
}

export default function PriceCardData() {
    const [data, setData] = useState<CalculationData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCalculationData()
            .then((res) => {
                if (res?.success && res?.data) setData(res.data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {ICON_CONFIGS.map((c, i) => <ShimmerCard key={i} iconBg={c.iconBg} />)}
            </div>
        )
    }

    const cards = [
        {
            title: 'Aktive Krankenkassen',
            value: data ? String(data.activeKrankenkassen.count) : '—',
            subtext: data ? `${formatChange(data.activeKrankenkassen.changeCountThisMonth)} diesen Monat` : '—',
            ...ICON_CONFIGS[0],
        },
        {
            title: 'Offene Kostenvoranschläge',
            value: data ? String(data.ordersWaitingForGenehmigt.count) : '—',
            subtext: data ? `${data.ordersWaitingForGenehmigt.waitingThisMonthCount} warten auf Genehmigung` : '—',
            ...ICON_CONFIGS[1],
        },
        {
            title: 'Genehmigte Aufträge',
            value: data ? String(data.approvedOrders.count) : '—',
            subtext: data ? `${formatChange(data.approvedOrders.changeCountThisWeek)} diese Woche` : '—',
            ...ICON_CONFIGS[2],
        },
        {
            title: 'Umsatz (Monat)',
            value: data ? formatCurrency(data.revenueMonth.amountThisMonth) : '—',
            subtext: data ? `${formatChange(data.revenueMonth.changePercentVsLastMonth, '%')} zum Vormonat` : '—',
            ...ICON_CONFIGS[3],
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className="flex min-w-0 flex-row items-stretch justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{card.value}</p>
                            <p className="mt-1 text-sm text-gray-500">{card.subtext}</p>
                        </div>
                        <div className="flex shrink-0 items-center">
                            <div className={`flex size-12 items-center justify-center rounded-lg sm:size-14 ${card.iconBg} ${card.iconColor}`}>
                                <Icon className="size-6 sm:size-7" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
