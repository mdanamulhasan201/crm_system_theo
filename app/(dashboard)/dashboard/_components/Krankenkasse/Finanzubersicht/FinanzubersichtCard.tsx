'use client'

import React, { useEffect, useState } from 'react'
import { Wallet, TrendingUp, AlertTriangle, FileText, Loader2 } from 'lucide-react'
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

    const cards = [
        {
            label: 'OFFENE FORDERUNGEN',
            value: data ? formatCurrency(data.openReceivablesAmount) : '—',
            icon: Wallet,
        },
        {
            label: 'ERWARTETE EINGÄNGE (30 TAGE)',
            value: data ? formatCurrency(data.expectedIn30DaysAmount) : '—',
            icon: TrendingUp,
        },
        {
            label: 'ÜBERFÄLLIGE BETRÄGE',
            value: data ? formatCurrency(data.overdueAmount) : '—',
            icon: AlertTriangle,
            variant: 'negative' as const,
        },
        {
            label: 'ZAHLUNGSEINGÄNGE (MONAT)',
            value: data ? formatCurrency(data.revenueThisMonth) : '—',
            icon: FileText,
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className={cn(
                            'relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 min-w-0'
                        )}
                    >
                        <div
                            className={cn(
                                'absolute right-4 top-4',
                                card.variant === 'negative' ? 'text-red-600' : 'text-gray-400'
                            )}
                        >
                            <Icon className="size-5" />
                        </div>
                        <span className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                            {card.label}
                        </span>
                        {loading ? (
                            <Loader2 className="mt-1 size-5 animate-spin text-gray-400" />
                        ) : (
                            <span
                                className={cn(
                                    'text-xl font-bold sm:text-2xl',
                                    card.variant === 'negative' ? 'text-red-600' : 'text-gray-900'
                                )}
                            >
                                {card.value}
                            </span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
