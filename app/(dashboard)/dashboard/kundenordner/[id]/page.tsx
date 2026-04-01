'use client'

import React from 'react'
import {
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react'

import TopNavigation from '../../_components/Kundenordner/TopNavigation'
import { cn } from '@/lib/utils'

const STATS = [
    { icon: FileText, value: '11', label: 'Dokumente' },
    { icon: Clock, value: '1', label: 'Diese Woche' },
    { icon: AlertCircle, value: '3', label: 'Offen' },
    { icon: CheckCircle2, value: '8', label: 'Abgeschlossen' },
] as const

const ACTIVITIES = [
    {
        name: '968d3431c50e.pdf',
        status: 'Hochgeladen',
        badge: 'PDF',
        badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-100/80',
        time: 'vor 7 Tagen',
    },
    {
        name: '23.jpg',
        status: 'Hochgeladen',
        badge: 'JPG',
        badgeClass: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100/80',
        time: 'vor 8 Tagen',
    },
    {
        name: 'Ashraf_L.stl',
        status: 'Hochgeladen',
        badge: '3D Modell',
        badgeClass: 'bg-purple-50 text-purple-700 ring-1 ring-purple-100/80',
        time: 'vor 8 Tagen',
    },
    {
        name: 'f95c40f9756d.pdf',
        status: 'Bearbeitet',
        badge: 'PDF',
        badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-100/80',
        time: 'vor 8 Tagen',
    },
] as const

export default function KundenordnerUebersichtPage() {
    return (
        <div className="mb-20 w-full max-w-full space-y-8 p-4">
            <TopNavigation />

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map(({ icon: Icon, value, label }) => (
                    <div
                        key={label}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <Icon className="h-6 w-6 text-gray-600" strokeWidth={2} aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
                            <p className="text-sm text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Letzte Aktivitäten */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900">Letzte Aktivitäten</h2>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {ACTIVITIES.map((row, index) => (
                        <div
                            key={`${row.name}-${index}`}
                            className={cn(
                                'flex flex-col gap-3 border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
                                index < ACTIVITIES.length - 1 && 'border-b'
                            )}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <FileText className="h-5 w-5 text-gray-500" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-gray-900">{row.name}</p>
                                    <p className="text-sm text-gray-500">{row.status}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end sm:pl-4">
                                <span
                                    className={cn(
                                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                                        row.badgeClass
                                    )}
                                >
                                    {row.badge}
                                </span>
                                <span className="text-sm tabular-nums text-gray-500">{row.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
