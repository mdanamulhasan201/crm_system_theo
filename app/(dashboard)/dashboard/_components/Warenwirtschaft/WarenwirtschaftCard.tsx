'use client'

import React from 'react'
import { ShoppingCart, FileText, Package, Info, LucideIcon, BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const CARDS = [
    { title: 'Offene Bestellungen', value: '4', icon: ShoppingCart },
    { title: 'Offene Rechnungen', value: '3', icon: FileText },
    { title: 'WE heute', value: '1', icon: Package },
    { title: 'WE diese Woche', value: '5', icon: Package },
    { title: 'Lagerwert aktuell', value: '84.6k €', icon: Info },
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
    return (
        <>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {CARDS.map((card, index) => (
                    <SingleCard
                        key={index}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                    />
                ))}
            </div>


            {/* new three cards for new data */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SingleCard
                    title="Gesamt-Ausgaben"
                    value="18.4k €"
                    icon={ShoppingCart}
                    trend="📈 9.5% vs. Vorperiode"
                />
                <SingleCard
                    title="Ø Ausgaben/Monat"
                    value="15.7k €"
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
