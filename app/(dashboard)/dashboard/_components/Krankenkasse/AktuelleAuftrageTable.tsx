'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ArrowUpDown, FileText, Loader2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SearchFilter from './SearchFilter'
import { getAllKrankenkasseData, type KrankenkasseOrderItem } from '@/apis/krankenkasseApis'

const TYPE_FILTERS = ['Alle', 'Insole', 'Shoes'] as const
const API_TYPE_MAP = { Alle: '', Insole: 'insole', Shoes: 'shoes' } as const

const STATUS_FILTERS = ['Alle', 'Offen', 'Gesendet', 'Genehmigt', 'Abgelehnt'] as const
const API_STATUS_MAP: Record<string, string> = {
    Alle: 'all',
    Offen: 'pending',
    Gesendet: 'sent',
    Genehmigt: 'approved',
    Abgelehnt: 'rejected',
}

const PAGE_SIZE = 10

type OrderRow = {
    id: string
    status: string
    verordnungVornr: string
    penr: string
    patient: string
    insurance_provider: string
    leistungsdatum: string
    betrag: string
    auftrag: string
    importlauf: string
}

function formatLeistungsdatum(iso: string): string {
    if (!iso) return '–'
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
}

function formatBetrag(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

function mapOrderToRow(item: KrankenkasseOrderItem): OrderRow {
    const p = item.prescription
    const c = item.customer
    return {
        id: item.id,
        status: item.insurance_status ?? '–',
        verordnungVornr: p?.prescription_number ?? '–',
        penr: p?.proved_number ?? '–',
        patient: [c?.vorname, c?.nachname].filter(Boolean).join(' ').trim() || '–',
        insurance_provider: p?.insurance_provider ?? '–',
        leistungsdatum: p?.prescription_date ? formatLeistungsdatum(p.prescription_date) : '–',
        betrag: formatBetrag(item.insuranceTotalPrice ?? 0),
        auftrag: p?.establishment_number ?? '–',
        importlauf: p?.aid_code ?? '–',
    }
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-0',
    approved: 'bg-green-100 text-green-700 border-0',
    genehmigt: 'bg-green-100 text-green-700 border-0',
    rejected: 'bg-red-100 text-red-700 border-0',
    abgelehnt: 'bg-red-100 text-red-700 border-0',
    gesendet: 'bg-blue-100 text-blue-700 border-0',
    sent: 'bg-blue-100 text-blue-700 border-0',
    offen: 'bg-gray-100 text-gray-600 border-0',
}

/** API status → German label for display in Status column */
const STATUS_LABELS_DE: Record<string, string> = {
    pending: 'Umänderung',
    rejected: 'Abgelehnt',
    approved: 'Genehmigt',
    sent: 'Gesendet',
    offen: 'Offen',
}

function getStatusLabel(status: string): string {
    if (!status) return '–'
    const key = status.toLowerCase()
    return STATUS_LABELS_DE[key] ?? status
}

function StatusBadge({ status }: { status: string }) {
    const key = (status || '').toLowerCase()
    const label = getStatusLabel(status)
    return (
        <Badge variant="outline" className={cn('rounded-md font-medium', STATUS_STYLES[key] ?? 'bg-gray-100 text-gray-600')}>
            {label}
        </Badge>
    )
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debouncedValue
}

export default function AktuelleAuftrage() {
    const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('Alle')
    const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('Alle')
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 400)
    const [sortBy, setSortBy] = useState<'leistungsdatum' | 'betrag' | null>(null)
    const [orders, setOrders] = useState<OrderRow[]>([])
    const [cursor, setCursor] = useState<string>('')
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchOrders = useCallback(
        (cursorValue: string, append: boolean) => {
            const apiType = API_TYPE_MAP[typeFilter]
            const apiStatus = API_STATUS_MAP[statusFilter] ?? 'all'
            const setLoadingState = append ? setLoadingMore : setLoading
            setLoadingState(true)
            if (!append) setError(null)
            getAllKrankenkasseData({
                type: apiType,
                search: debouncedSearch.trim(),
                insurance_status: apiStatus,
                limit: PAGE_SIZE,
                cursor: cursorValue,
            })
                .then((res) => {
                    const rawData = Array.isArray(res.data) ? res.data : []
                    const rows = rawData.map(mapOrderToRow)
                    setOrders((prev) => (append ? [...prev, ...rows] : rows))
                    const lastItem = rawData[rawData.length - 1] as KrankenkasseOrderItem | undefined
                    const nextCursor = res.nextCursor ?? lastItem?.createdAt ?? ''
                    setCursor(nextCursor)
                    setHasMore(rows.length >= PAGE_SIZE)
                })
                .catch((err) => {
                    setError(err?.message ?? 'Fehler beim Laden')
                    if (!append) setOrders([])
                })
                .finally(() => {
                    setLoadingState(false)
                })
        },
        [typeFilter, statusFilter, debouncedSearch]
    )

    useEffect(() => {
        setCursor('')
        setHasMore(true)
        fetchOrders('', false)
    }, [fetchOrders])

    const loadMore = () => {
        if (loadingMore || !hasMore || !cursor) return
        fetchOrders(cursor, true)
    }

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortBy === 'leistungsdatum') {
            const parseDate = (s: string) => {
                if (s === '–') return 0
                const [d, m, y] = s.split('.')
                return new Date(Number(y), Number(m) - 1, Number(d)).getTime()
            }
            return parseDate(a.leistungsdatum) - parseDate(b.leistungsdatum)
        }
        if (sortBy === 'betrag') {
            const num = (s: string) => parseFloat(s.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
            return num(a.betrag) - num(b.betrag)
        }
        return 0
    })

    return (
        <Card className="rounded-xl border bg-white shadow-sm">
            <CardContent className="p-0">
                <div className="border-b p-4 sm:p-5">
                    <SearchFilter
                        showSearch={true}
                        search={search}
                        onSearchChange={setSearch}
                        activeFilter={statusFilter}
                        onFilterChange={(value) => setStatusFilter(value as (typeof STATUS_FILTERS)[number])}
                        filters={STATUS_FILTERS}
                        placeholder="Suche nach KV-Nummer oder Rezept-Nummer..."
                    />
                </div>
                <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pb-5 mt-5">
                    <h3 className="text-lg font-bold text-gray-900">
                        Aktuelle Aufträge
                    </h3>
                    {/* Alle / Insole / Shoes type filter - uncomment when needed
                    <div className="flex flex-wrap gap-2">
                        {TYPE_FILTERS.map((t) => (
                            <Button
                                key={t}
                                variant={typeFilter === t ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    'cursor-pointer',
                                    typeFilter === t && 'bg-[#61A175] hover:bg-[#61A175]/90'
                                )}
                                onClick={() => setTypeFilter(t)}
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                    */}
                </div>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-200 hover:bg-transparent [&>th]:py-4 [&>th]:uppercase">
                                <TableHead className="text-gray-600 font-medium">Status</TableHead>
                                <TableHead className="text-gray-600 font-medium">Verordnung (Vornr)</TableHead>
                                <TableHead className="text-gray-600 font-medium">Penr</TableHead>
                                <TableHead className="text-gray-600 font-medium">Patient</TableHead>
                                <TableHead className="text-gray-600 font-medium">Krankenkasse</TableHead>
                                <TableHead
                                    className="text-gray-600 font-medium cursor-pointer select-none hover:text-gray-900 transition-colors"
                                    onClick={() => setSortBy((s) => (s === 'leistungsdatum' ? null : 'leistungsdatum'))}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Leistungsdatum
                                        <ArrowUpDown className="size-3.5 opacity-70" />
                                    </span>
                                </TableHead>
                                <TableHead
                                    className="text-gray-600 font-medium cursor-pointer select-none hover:text-gray-900 transition-colors"
                                    onClick={() => setSortBy((s) => (s === 'betrag' ? null : 'betrag'))}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Betrag
                                        <ArrowUpDown className="size-3.5 opacity-70" />
                                    </span>
                                </TableHead>
                                <TableHead className="text-gray-600 font-medium">Auftrag</TableHead>
                                <TableHead className="text-gray-600 font-medium">Importlauf</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                                        <Loader2 className="mx-auto mb-2 size-8 animate-spin text-gray-400" />
                                        <p className="text-sm">Laden...</p>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={9} className="h-32 text-center text-red-600">
                                        <p className="text-sm">{error}</p>
                                    </TableCell>
                                </TableRow>
                            ) : sortedOrders.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                                        <FileText className="mx-auto mb-2 size-8 text-gray-300" />
                                        <p className="text-sm">Keine Aufträge gefunden</p>
                                        <p className="text-xs mt-1">Filter nach Typ ändern</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedOrders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="border-gray-100 transition-colors cursor-pointer hover:bg-gray-50/80 [&>td]:py-4"
                                    >
                                        <TableCell>
                                            <StatusBadge status={order.status} />
                                        </TableCell>
                                        <TableCell className="text-gray-600">{order.verordnungVornr}</TableCell>
                                        <TableCell className="text-gray-600">{order.penr}</TableCell>
                                        <TableCell className="font-medium text-gray-900">{order.patient}</TableCell>
                                        <TableCell className="text-gray-600">{order.insurance_provider}</TableCell>
                                        <TableCell className="text-gray-600">{order.leistungsdatum}</TableCell>
                                        <TableCell className="text-gray-600">{order.betrag}</TableCell>
                                        <TableCell className="text-gray-600">{order.auftrag}</TableCell>
                                        <TableCell className="text-gray-600">{order.importlauf}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {!loading && !error && hasMore && orders.length > 0 && (
                        <div className="flex justify-center px-4 pb-4 sm:px-5 sm:pb-5 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="border-gray-300"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        Laden...
                                    </>
                                ) : (
                                    'Weitere laden'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
