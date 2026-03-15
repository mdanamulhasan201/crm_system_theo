'use client'

import React, { useEffect, useState } from 'react'
import {
    ShoppingCart,
    FileText,
    Package,
    Info,
    LucideIcon,
    BarChart3,
    TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCardDataDashboardKpis } from '@/apis/warenwirtschaftApis'

type DashboardKpis = {
    open_orders: number
    we_this_week: number
    total_expenditures: number
    average_monthly_expenses: number
}

const CARDS: {
    title: string
    icon: LucideIcon
    key?: keyof DashboardKpis
    fallback: string
}[] = [
    { title: 'Offene Bestellungen', key: 'open_orders', icon: ShoppingCart, fallback: '4' },
    { title: 'Offene Rechnungen', icon: FileText, fallback: '3' },
    { title: 'WE heute', icon: Package, fallback: '1' },
    { title: 'WE diese Woche', key: 'we_this_week', icon: Package, fallback: '5' },
    { title: 'Lagerwert aktuell', icon: Info, fallback: '84.6k €' },
]

function SingleCard({
    title,
    value,
    icon: Icon,
    trend,
    className,
}: {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: string
    className?: string
}) {
    return (
        <div
            className={cn(
                'relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm min-w-0 transition-shadow hover:shadow-md',
                className
            )}
        >
            <div className="absolute right-4 top-4 text-gray-400">
                <Icon className="size-5" strokeWidth={1.5} />
            </div>
            <span className="mb-2 text-sm font-medium text-gray-600">{title}</span>
            <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{value}</span>
            {trend && (
                <span className="mt-2 text-sm font-medium text-emerald-600">{trend}</span>
            )}
        </div>
    )
}

export default function WarenwirtschaftCard() {
    const [kpis, setKpis] = useState<DashboardKpis | null>(null)

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const res: any = await getCardDataDashboardKpis()
                const data = res?.data ?? res
                if (data) {
                    setKpis(data as DashboardKpis)
                }
            } catch {
                // ignore and keep static fallback values
            }
        }

        void fetchKpis()
    }, [])

    const formatCurrency = (amount: number | undefined) => {
        if (typeof amount !== 'number') return '–'
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {CARDS.map((card, index) => (
                    <SingleCard
                        key={index}
                        title={card.title}
                        value={
                            card.key && kpis && typeof kpis[card.key] === 'number'
                                ? kpis[card.key]!
                                : card.fallback
                        }
                        icon={card.icon}
                    />
                ))}
            </div>


            {/* new three cards for new data */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SingleCard
                    title="Gesamt-Ausgaben"
                    value={
                        kpis ? formatCurrency(kpis.total_expenditures) : '18.4k €'
                    }
                    icon={ShoppingCart}
                    trend=""
                />
                <SingleCard
                    title="Ø Ausgaben/Monat"
                    value={
                        kpis ? formatCurrency(kpis.average_monthly_expenses) : '15.7k €'
                    }
                    icon={BarChart3}
                />
                <SingleCard
                    title="Top-Ausgabenmonat"
                    value="18.8k €"
                    icon={TrendingUp}
                />
            </div>


        </>
    )
}
