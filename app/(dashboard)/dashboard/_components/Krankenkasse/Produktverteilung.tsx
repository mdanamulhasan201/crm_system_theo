import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const ITEMS = [
    { label: 'Standard', pct: '58%', count: '91 Aufträge', color: 'bg-gray-400' },
    { label: 'Premium', pct: '32%', count: '50 Aufträge', color: 'bg-blue-500' },
    { label: 'Spezial', pct: '10%', count: '15 Aufträge', color: 'bg-blue-400' },
]

export default function Produktverteilung() {
    return (
        <Card className="rounded-xl border bg-white shadow-sm">
            <CardContent className="">
                <h3 className="mb-6 text-lg font-bold text-gray-900">
                    Produktverteilung
                </h3>
                <div className="space-y-5">
                    {ITEMS.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-start justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`size-3 shrink-0 rounded-full ${item.color}`}
                                />
                                <span className="text-sm font-medium text-gray-900">
                                    {item.label}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {item.pct}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {item.count}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
