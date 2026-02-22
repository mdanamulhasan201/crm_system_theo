'use client'

import React, { useState } from 'react'
import { Search, ArrowUpDown, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const FILTERS = ['Alle', 'Offen', 'Gesendet', 'Genehmigt', 'Abgelehnt'] as const

type OrderStatus = 'Offen' | 'Gesendet' | 'Genehmigt' | 'Abgelehnt' | 'In Bearbeitung'

const ORDERS = [
    { kunde: 'Max Mustermann', krankenkasse: 'AOK Bayern', status: 'Genehmigt' as OrderStatus, betrag: '28,00 €', datum: 'Heute', kvNr: 'KV-2024-001' },
    { kunde: 'Lisa Müller', krankenkasse: 'Techniker Krankenkasse', status: 'In Bearbeitung' as OrderStatus, betrag: '35,00 €', datum: 'Heute', kvNr: 'KV-2024-002' },
    { kunde: 'Hans Schmidt', krankenkasse: 'Barmer', status: 'Genehmigt' as OrderStatus, betrag: '28,00 €', datum: 'Gestern', kvNr: 'KV-2024-003' },
    { kunde: 'Anna Weber', krankenkasse: 'DAK', status: 'Offen' as OrderStatus, betrag: '45,00 €', datum: 'Gestern', kvNr: 'KV-2024-004' },
    { kunde: 'Thomas Klein', krankenkasse: 'IKK Classic', status: 'Gesendet' as OrderStatus, betrag: '32,00 €', datum: 'Gestern', kvNr: 'KV-2024-005' },
    { kunde: 'Maria Fischer', krankenkasse: 'AOK Nord', status: 'Abgelehnt' as OrderStatus, betrag: '52,00 €', datum: 'Vor 2 Tagen', kvNr: 'KV-2024-006' },
]

const STATUS_STYLES: Record<string, string> = {
    Genehmigt: 'bg-green-100 text-green-700 border-0',
    'In Bearbeitung': 'bg-amber-100 text-amber-700 border-0',
    Offen: 'bg-gray-100 text-gray-600 border-0',
    Gesendet: 'bg-blue-100 text-blue-700 border-0',
    Abgelehnt: 'bg-red-100 text-red-700 border-0',
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge variant="outline" className={cn('rounded-md font-medium', STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600')}>
            {status}
        </Badge>
    )
}

export default function AktuelleAuftrage() {
    const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Alle')
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'datum' | 'betrag' | null>(null)

    const filteredOrders = ORDERS.filter((order) => {
        const matchesFilter = activeFilter === 'Alle' || order.status === activeFilter
        const searchLower = search.trim().toLowerCase()
        const matchesSearch =
            !searchLower ||
            order.kunde.toLowerCase().includes(searchLower) ||
            order.krankenkasse.toLowerCase().includes(searchLower) ||
            order.kvNr.toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower) ||
            order.betrag.replace(',', '.').includes(searchLower)
        return matchesFilter && matchesSearch
    })

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === 'datum') {
            const order = { Heute: 0, Gestern: 1, 'Vor 2 Tagen': 2 }
            return (order[a.datum as keyof typeof order] ?? 99) - (order[b.datum as keyof typeof order] ?? 99)
        }
        if (sortBy === 'betrag') {
            const num = (s: string) => parseFloat(s.replace(',', '.'))
            return num(a.betrag) - num(b.betrag)
        }
        return 0
    })

    return (
        <Card className="rounded-xl border bg-white shadow-sm">
            <CardContent className="p-0">
                <div className="border-b p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Suche nach KV-Nummer oder Rezept-Nummer..."
                                className="pl-9 border-gray-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map((filter) => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? 'default' : 'outline'}
                                    size="sm"
                                    className={cn(
                                        'cursor-pointer',
                                        activeFilter === filter && ' bg-[#61A175] hover:bg-[#61A175]/90'
                                    )}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pb-5 mt-5">
                    <h3 className="text-lg font-bold text-gray-900">
                        Aktuelle Aufträge
                    </h3>
                    <a
                        href="#"
                        className="text-sm font-medium text-[#61A175] hover:text-[#61A175]/90 hover:underline"
                    >
                        Alle anzeigen →
                    </a>
                </div>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent [&>th]:py-4">
                            <TableHead className="text-gray-600 font-medium">Kunde</TableHead>
                            <TableHead className="text-gray-600 font-medium">Krankenkasse</TableHead>
                            <TableHead className="text-gray-600 font-medium">Status</TableHead>
                            <TableHead
                                className="text-gray-600 font-medium cursor-pointer select-none hover:text-gray-900 transition-colors"
                                onClick={() => setSortBy((s) => (s === 'betrag' ? null : 'betrag'))}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Betrag
                                    <ArrowUpDown className="size-3.5 opacity-70" />
                                </span>
                            </TableHead>
                            <TableHead
                                className="text-gray-600 font-medium cursor-pointer select-none hover:text-gray-900 transition-colors"
                                onClick={() => setSortBy((s) => (s === 'datum' ? null : 'datum'))}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Datum
                                    <ArrowUpDown className="size-3.5 opacity-70" />
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedOrders.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-0">
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                    <FileText className="mx-auto mb-2 size-8 text-gray-300" />
                                    <p className="text-sm">Keine Aufträge gefunden</p>
                                    <p className="text-xs mt-1">Versuchen Sie andere Suchbegriffe oder Filter</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedOrders.map((order, index) => (
                                <TableRow
                                    key={index}
                                    className="border-gray-100 transition-colors cursor-pointer hover:bg-gray-50/80 [&>td]:py-4"
                                >
                                    <TableCell className="font-medium text-gray-900">
                                        {order.kunde}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {order.krankenkasse}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {order.betrag}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {order.datum}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    )
}
