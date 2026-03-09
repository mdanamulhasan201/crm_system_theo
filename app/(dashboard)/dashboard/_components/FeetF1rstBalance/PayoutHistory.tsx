'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { getAllPayoutRequest } from '@/apis/MassschuheManagemantApis'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

const LIMIT = 10

export interface PayoutItem {
    id: string
    partnerId: string
    totalAmount: number
    status: string
    createdAt: string
    updatedAt: string
}

interface PayoutHistoryResponse {
    success: boolean
    message: string
    data: PayoutItem[]
    hasMore: boolean
}

const statusLabel: Record<string, string> = {
    panding: 'Ausstehend',
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt',
    paid: 'Ausgezahlt',
    complete: 'Abgeschlossen',
    completed: 'Abgeschlossen',
    complated: 'Abgeschlossen', // API typo
}

// Colorful status: complated/complete/paid/approved = green, pending = amber, rejected = red
function getStatusStyles(status: string): string {
    const s = (status || '').toLowerCase()
    if (s === 'complated' || s === 'complete' || s === 'completed' || s === 'paid' || s === 'approved') {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
    if (s === 'rejected') {
        return 'bg-red-50 text-red-700 border border-red-200'
    }
    // panding, pending, or unknown
    return 'bg-amber-50 text-amber-800 border border-amber-200'
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return iso
    }
}

function formatCurrency(value: number) {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface PayoutHistoryProps {
    /** When this changes, refetch and load all pages so table shows full data at once */
    refreshKey?: number
}

export default function PayoutHistory({ refreshKey }: PayoutHistoryProps) {
    const [items, setItems] = useState<PayoutItem[]>([])
    const [cursor, setCursor] = useState<string>('')
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [refreshingAll, setRefreshingAll] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadPage = useCallback(async (cursorValue: string, append: boolean) => {
        const setLoader = append ? setLoadingMore : setLoading
        setLoader(true)
        setError(null)
        try {
            const response = await getAllPayoutRequest(LIMIT, cursorValue) as PayoutHistoryResponse
            const list = response?.data ?? []
            const nextCursor = list.length > 0 ? list[list.length - 1].id : ''
            setItems((prev) => append ? [...prev, ...list] : list)
            setCursor(nextCursor)
            setHasMore(response?.hasMore ?? false)
        } catch (e) {
            console.error('Failed to fetch payout history:', e)
            setError('Auszahlungsanfragen konnten nicht geladen werden.')
            if (!append) setItems([])
        } finally {
            setLoader(false)
        }
    }, [])

    // Initial load: first page only
    useEffect(() => {
        loadPage('', false)
    }, [loadPage])

    // When refreshKey changes (e.g. after new payout): fetch ALL pages and show full table at once
    useEffect(() => {
        if (refreshKey === undefined || refreshKey === 0) return

        let cancelled = false
        setError(null)
        setRefreshingAll(true)

        const loadAll = async () => {
            const all: PayoutItem[] = []
            let nextCursor = ''
            let hasMorePages = true
            try {
                while (hasMorePages && !cancelled) {
                    const response = await getAllPayoutRequest(LIMIT, nextCursor) as PayoutHistoryResponse
                    const list = response?.data ?? []
                    all.push(...list)
                    hasMorePages = response?.hasMore ?? false
                    nextCursor = list.length > 0 ? list[list.length - 1].id : ''
                }
                if (!cancelled) {
                    setItems(all)
                    setCursor(nextCursor)
                    setHasMore(false)
                }
            } catch (e) {
                console.error('Failed to fetch payout history:', e)
                if (!cancelled) {
                    setError('Auszahlungsanfragen konnten nicht geladen werden.')
                    setItems([])
                }
            } finally {
                if (!cancelled) setRefreshingAll(false)
            }
        }
        loadAll()
        return () => { cancelled = true }
    }, [refreshKey])

    const loadMore = () => {
        if (!loadingMore && hasMore && cursor) loadPage(cursor, true)
    }

    const isLoading = loading || refreshingAll

    if (isLoading && items.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Auszahlungsanfragen</h2>
                <p className="text-gray-500">Lädt...</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Auszahlungsanfragen</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {items.length === 0 && !isLoading ? (
                <p className="text-gray-500">Noch keine Auszahlungsanfragen.</p>
            ) : (
                <>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-gray-200">
                                    <TableHead className="font-semibold text-gray-700">Betrag</TableHead>
                                    <TableHead className="font-semibold text-gray-700 !text-right">Erstellt (createdAt)</TableHead>
                                    <TableHead className="font-semibold text-gray-700 !text-right">Aktualisiert (updatedAt)</TableHead>
                                    <TableHead className="font-semibold text-gray-700 !text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((row) => (
                                    <TableRow key={row.id} className="border-gray-100">
                                        <TableCell className="text-gray-900 font-semibold tabular-nums">
                                            {formatCurrency(row.totalAmount)} €
                                        </TableCell>
                                        <TableCell className="text-gray-800 font-medium !text-right">
                                            {formatDate(row.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-gray-800 font-medium !text-right">
                                            {formatDate(row.updatedAt)}
                                        </TableCell>
                                        <TableCell className="!text-center">
                                            <span
                                                className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium border min-w-[120px] ${getStatusStyles(row.status)}`}
                                            >
                                                {statusLabel[row.status] ?? row.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {(refreshingAll && (
                        <p className="text-sm text-gray-500 mt-4 text-center">Aktualisiere alle Einträge…</p>
                    )) || (hasMore && (
                        <div className="mt-4 flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="min-w-[140px]"
                            >
                                {loadingMore ? 'Lädt...' : 'Weitere laden'}
                            </Button>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}
