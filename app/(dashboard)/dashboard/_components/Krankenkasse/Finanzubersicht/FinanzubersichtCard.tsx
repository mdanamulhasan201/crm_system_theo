import React from 'react'
import { Wallet, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const CARDS = [
    { label: 'OFFENE FORDERUNGEN', value: '20.218,00 €', icon: Wallet },
    { label: 'ERWARTETE EINGÄNGE (30 TAGE)', value: '13.018,00 €', icon: TrendingUp, trend: '+12%' },
    { label: 'ÜBERFÄLLIGE BETRÄGE', value: '7.200,00 €', icon: AlertTriangle, variant: 'negative' as const },
    { label: 'ZAHLUNGSEINGÄNGE (MONAT)', value: '18.102,00 €', icon: FileText, trend: '+8%' },
]

export default function FinanzubersichtCard() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CARDS.map((card, index) => {
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
                        <span
                            className={cn(
                                'text-xl font-bold sm:text-2xl',
                                card.variant === 'negative' ? 'text-red-600' : 'text-gray-900'
                            )}
                        >
                            {card.value}
                        </span>
                        {card.trend && (
                            <div className="mt-2 flex items-center gap-1 text-sm font-medium text-green-600">
                                <TrendingUp className="size-4" />
                                {card.trend}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
