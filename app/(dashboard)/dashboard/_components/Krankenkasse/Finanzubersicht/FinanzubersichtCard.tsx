'use client'

import React, { useEffect, useState } from 'react'
import { Wallet, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCalculationExtraData } from '@/apis/krankenkasseApis'

interface ExtraData {
    openReceivablesAmount: number
    expectedIn30DaysAmount: number
    overdueAmount: number
    revenueThisMonth: number
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)

const CARD_DEFS = [
    { label: 'OFFENE FORDERUNGEN', icon: Wallet },
    { label: 'ERWARTETE EINGÄNGE (30 TAGE)', icon: TrendingUp },
    { label: 'ÜBERFÄLLIGE BETRÄGE', icon: AlertTriangle, variant: 'negative' as const },
    { label: 'ZAHLUNGSEINGÄNGE (MONAT)', icon: FileText },
]

function ShimmerCard({ variant }: { variant?: 'negative' }) {
    return (
        <div className="relative flex flex-col rounded-xl border bg-white p-4 shadow-sm sm:p-5 min-w-0 overflow-hidden">
            <div className="absolute right-4 top-4 size-5 rounded bg-gray-200 animate-pulse" />
            <div className="mb-3 h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className={cn('h-7 w-1/2 rounded animate-pulse', variant === 'negative' ? 'bg-red-100' : 'bg-gray-200')} />
        </div>
    )
}

export default function FinanzubersichtCard() {
    const [data, setData] = useState<ExtraData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCalculationExtraData()
            .then((res) => {
                if (res?.success && res?.data) setData(res.data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {CARD_DEFS.map((c, i) => <ShimmerCard key={i} variant={c.variant} />)}
            </div>
        )
    }

    const cards = [
        { ...CARD_DEFS[0], value: data ? formatCurrency(data.openReceivablesAmount) : '—' },
        { ...CARD_DEFS[1], value: data ? formatCurrency(data.expectedIn30DaysAmount) : '—' },
        { ...CARD_DEFS[2], value: data ? formatCurrency(data.overdueAmount) : '—' },
        { ...CARD_DEFS[3], value: data ? formatCurrency(data.revenueThisMonth) : '—' },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className="relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 min-w-0"
                    >
                        <div className={cn('absolute right-4 top-4', card.variant === 'negative' ? 'text-red-600' : 'text-gray-400')}>
                            <Icon className="size-5" />
                        </div>
                        <span className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                            {card.label}
                        </span>
                        <span className={cn('text-xl font-bold sm:text-2xl', card.variant === 'negative' ? 'text-red-600' : 'text-gray-900')}>
                            {card.value}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
