import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

const ITEMS = [
    { label: 'Kassenanteil', value: '19.504 €', pct: '80%', color: 'bg-green-500' },
    { label: 'Eigenanteile', value: '4.876 €', pct: '20%', color: 'bg-blue-500' },
]

export default function Umsatzverteilung() {
    return (
        <Card className="rounded-xl border bg-white shadow-sm">
            <CardContent className="">
                <h3 className="mb-6 text-lg font-bold text-gray-900">
                    Umsatzverteilung
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
                                    {item.value}
                                </p>
                                <p className="text-xs text-gray-500">{item.pct}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 h-3 w-full overflow-hidden rounded-full">
                    <div className="flex h-full w-full">
                        <div
                            className="rounded-l-full bg-green-500"
                            style={{ width: '80%' }}
                        />
                        <div
                            className="rounded-r-full bg-blue-500"
                            style={{ width: '20%' }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
