'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ArrowUpDown, FileText, Loader2, Database, Upload } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SearchFilter from './SearchFilter'
import UpdateDataList from './UpdateDataList'
import FileUploadModal from './FileUploadModal'
import { getAllKrankenkasseData, type KrankenkasseOrderItem, type KrankenkassePrescriptionListItem } from '@/apis/krankenkasseApis'

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
    customerId: string
    insuranceType: string
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
        customerId: c?.id ?? '',
        insuranceType: item.insuranceType ?? 'insole',
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

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    pending:   { label: 'Umänderung', dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border border-orange-200' },
    approved:  { label: 'Genehmigt',  dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border border-green-200'   },
    genehmigt: { label: 'Genehmigt',  dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border border-green-200'   },
    rejected:  { label: 'Abgelehnt',  dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border border-red-200'         },
    abgelehnt: { label: 'Abgelehnt',  dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border border-red-200'         },
    sent:      { label: 'Gesendet',   dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border border-blue-200'      },
    gesendet:  { label: 'Gesendet',   dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border border-blue-200'      },
    offen:     { label: 'Offen',      dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600 border border-gray-200'     },
}

function StatusBadge({ status }: { status: string }) {
    const key = (status || '').toLowerCase()
    const cfg = STATUS_CONFIG[key] ?? { label: status || '–', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600 border border-gray-200' }
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', cfg.badge)}>
            <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
        </span>
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
    const [updateModalOrder, setUpdateModalOrder] = useState<{
        orderId: string
        customerId: string
        type: string
    } | null>(null)
    const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false)

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
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 w-full">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Aktuelle Aufträge
                            </h3>
                        </div>
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer bg-[#61A175] hover:bg-[#61A175]/90 text-white"
                                onClick={() => setFileUploadModalOpen(true)}
                            >
                                <Upload className="size-4" />
                                Upload
                            </Button>
                        </div>
                    </div>
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
                                <TableHead className="text-gray-600 font-medium w-[80px]">Aktion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={10} className="h-32 text-center text-gray-500">
                                        <Loader2 className="mx-auto mb-2 size-8 animate-spin text-gray-400" />
                                        <p className="text-sm">Laden...</p>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={10} className="h-32 text-center text-red-600">
                                        <p className="text-sm">{error}</p>
                                    </TableCell>
                                </TableRow>
                            ) : sortedOrders.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-0">
                                    <TableCell colSpan={10} className="h-32 text-center text-gray-500">
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
                                        <TableCell className="text-center">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (order.customerId) {
                                                        setUpdateModalOrder({
                                                            orderId: order.id,
                                                            customerId: order.customerId,
                                                            type: order.insuranceType || 'insole',
                                                        })
                                                    }
                                                }}
                                                disabled={!order.customerId}
                                                className="inline-flex cursor-pointer items-center justify-center size-9 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                title="Rezeptdaten aktualisieren"
                                            >
                                                <Database className="size-5" />
                                            </button>
                                        </TableCell>
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
                                className="border-gray-300 cursor-pointer"
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
                <FileUploadModal
                    isOpen={fileUploadModalOpen}
                    onClose={() => setFileUploadModalOpen(false)}
                />
                {updateModalOrder && (
                    <UpdateDataList
                        isOpen={!!updateModalOrder}
                        onClose={() => setUpdateModalOrder(null)}
                        customerId={updateModalOrder.customerId}
                        orderId={updateModalOrder.orderId}
                        type={updateModalOrder.type}
                        onSuccess={(prescription: KrankenkassePrescriptionListItem) => {
                            const orderId = updateModalOrder.orderId
                            setOrders((prev) =>
                                prev.map((row) =>
                                    row.id !== orderId
                                        ? row
                                        : {
                                            ...row,
                                            insurance_provider: prescription.insurance_provider ?? row.insurance_provider,
                                            leistungsdatum: prescription.prescription_date ? formatLeistungsdatum(prescription.prescription_date) : row.leistungsdatum,
                                            penr: prescription.proved_number ?? row.penr,
                                            verordnungVornr: prescription.referencen_number ?? row.verordnungVornr,
                                        }
                                )
                            )
                        }}
                    />
                )}
            </CardContent>
        </Card>
    )
}
