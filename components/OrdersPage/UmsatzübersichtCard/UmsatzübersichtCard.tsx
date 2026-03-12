'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Truck,
    TrendingUp,
    Calendar,
    ShoppingCart,
    ArrowUp,
    ArrowDown,
    type LucideIcon,
} from 'lucide-react';

export interface UmsatzCardItem {
    id: string;
    title: string;
    value: string;
    /** Optional: e.g. "97% aller Aufträge..." or "Standard-Lieferzeiten akzeptiert" */
    description?: string;
    /** Second metric in same card (e.g. Lieferungen + On-time in one card) */
    title2?: string;
    value2?: string;
    description2?: string;
    /** e.g. "+8,5% vs. Vorperiode" – if set, shows trend with green/red arrow */
    trendLabel?: string;
    /** positive = green, negative = red */
    trendDirection?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    /** If true, value is shown in green (e.g. percentage cards) */
    valueGreen?: boolean;
}

const DEMO_CARDS: UmsatzCardItem[] = [
    {
        id: 'lieferungen-ontime',
        title: 'Lieferungen vor Term',
        value: '97%',
        description: '',
        title2: 'On-time Wahrscheinlichkeit',
        value2: '87%',
        description2: '',
        icon: Truck,
        valueGreen: true,
    },
    {
        id: 'umsatz-woche',
        title: 'Umsatz diese Woche',
        value: '0,00 €',
        trendLabel: '-100% vs. Vorperiode',
        trendDirection: 'down',
        icon: TrendingUp,
    },
    {
        id: 'umsatz-monat',
        title: 'Umsatz diesen Monat',
        value: '1.129,00 €',
        trendLabel: '+8,5% vs. Vorperiode',
        trendDirection: 'up',
        icon: Calendar,
    },
    {
        id: 'avg-beste',
        title: 'Ø Beste',
        value: '564,50 €',
        trendLabel: '+3,2% vs. Vorperiode',
        trendDirection: 'up',
        icon: ShoppingCart,
    },
];

function SingleCard({ item }: { item: UmsatzCardItem }) {
    const Icon = item.icon;
    const hasTrend = item.trendLabel != null && item.trendDirection != null;
    const hasSecondBlock = item.title2 != null && item.value2 != null;

    return (
        <div
            className={cn(
                'relative flex min-w-0 flex-col rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
                'sm:p-6'
            )}
        >
            {/* Top row: title + icon (only one title when combined) */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-700 line-clamp-2 sm:text-base">
                    {hasSecondBlock ? 'Lieferungen & On-time' : item.title}
                </h3>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </span>
            </div>

            {/* First metric – when combined, both in flex row */}
            {hasSecondBlock ? (
                <div className="flex min-w-0 flex-row gap-4 sm:gap-6">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-600 sm:text-sm">{item.title}</p>
                        <p className="mt-1 text-lg font-bold tracking-tight text-emerald-600 sm:text-xl">
                            {item.value}
                        </p>
                        {item.description && (
                            <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">{item.description}</p>
                        )}
                    </div>
                    {item.title2 && item.value2 && (
                        <div className="min-w-0 flex-1 border-l border-gray-100 pl-4 sm:pl-6">
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">{item.title2}</p>
                            <p className="mt-1 text-lg font-bold tracking-tight text-emerald-600 sm:text-xl">
                                {item.value2}
                            </p>
                            {item.description2 && (
                                <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">{item.description2}</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <p
                        className={cn(
                            'mt-1 text-2xl font-bold tracking-tight sm:text-3xl',
                            item.valueGreen ? 'text-emerald-600' : 'text-gray-900'
                        )}
                    >
                        {item.value}
                    </p>
                    {item.description && (
                        <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">{item.description}</p>
                    )}
                </div>
            )}

            {/* Trend (only for single-metric cards that have trend) */}
            {!hasSecondBlock && hasTrend && item.trendLabel && (
                <div
                    className={cn(
                        'mt-2 flex items-center gap-1.5 text-xs font-medium sm:text-sm',
                        item.trendDirection === 'up' && 'text-emerald-600',
                        item.trendDirection === 'down' && 'text-red-600',
                        item.trendDirection === 'neutral' && 'text-gray-500'
                    )}
                >
                    {item.trendDirection === 'up' && (
                        <ArrowUp className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    {item.trendDirection === 'down' && (
                        <ArrowDown className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    <span>{item.trendLabel}</span>
                </div>
            )}
        </div>
    );
}

export interface UmsatzübersichtCardProps {
    /** Optional: override demo data with your own cards */
    items?: UmsatzCardItem[];
    className?: string;
}

export default function UmsatzübersichtCard({ items = DEMO_CARDS, className }: UmsatzübersichtCardProps) {
    return (
        <div
            className={cn(
                'grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4',
                className
            )}
        >
            {items.map((item) => (
                <SingleCard key={item.id} item={item} />
            ))}
        </div>
    );
}
