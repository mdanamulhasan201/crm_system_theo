'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import BestelldetailsModal, {
    type BestelldetailsModalData,
} from './BestelldetailsModal'
import { getAllMyStoreOverview, partnerConfirmation } from '@/apis/storeManagement'
import toast from 'react-hot-toast'

interface OverviewSizeData {
    length?: number
    quantity: number
}

interface StoreOverviewItem {
    id: string
    produktname: string
    hersteller: string
    artikelnummer: string
    groessenMengen: Record<string, OverviewSizeData>
    status: string
    type: string
    createdAt: string
}

const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'In_bearbeitung':
            return 'Ausstehend'
        case 'Geliefert':
            return 'Geliefert'
        case 'Confirmation':
            return 'Zur Bestätigung'
        default:
            return status.replace(/_/g, ' ')
    }
}

const getStatusClassName = (status: string) => {
    if (status === 'In_bearbeitung') {
        return 'bg-[#FFF3E0] text-[#F57C00]'
    }

    if (status === 'Geliefert') {
        return 'bg-[#E8F5E9] text-[#2E7D32]'
    }

    if (status === 'Confirmation') {
        return 'bg-blue-50 text-blue-800 ring-1 ring-blue-100'
    }

    return 'bg-gray-100 text-gray-700'
}

const getOrderedItems = (groessenMengen: Record<string, OverviewSizeData>) => {
    return Object.entries(groessenMengen)
        .filter(([, value]) => (value?.quantity ?? 0) > 0)
        .map(([size, value]) => ({
            size,
            quantity: value.quantity,
        }))
}

const ITEMS_PER_PAGE = 5

export default function BestellubersichtTable() {
    const [rows, setRows] = useState<StoreOverviewItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [currentCursor, setCurrentCursor] = useState('')
    const [cursorHistory, setCursorHistory] = useState<string[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<BestelldetailsModalData | null>(null)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [partnerConfirmOpen, setPartnerConfirmOpen] = useState(false)
    const [partnerConfirmTarget, setPartnerConfirmTarget] = useState<{
        id: string
        produktname: string
        hersteller: string
    } | null>(null)

    const loadOverview = useCallback(async (options?: { silent?: boolean }) => {
        const silent = options?.silent === true
        if (!silent) setIsLoading(true)
        try {
            const response = await getAllMyStoreOverview(ITEMS_PER_PAGE, currentCursor)
            if (response?.success && Array.isArray(response?.data)) {
                setRows(response.data)
                setHasMore(Boolean(response.hasMore))
            } else {
                setRows([])
                setHasMore(false)
            }
        } catch (err: any) {
            if (!silent) {
                setRows([])
                setHasMore(false)
            }
            toast.error(err?.response?.data?.message || 'Bestellübersicht konnte nicht geladen werden')
        } finally {
            if (!silent) setIsLoading(false)
        }
    }, [currentCursor])

    useEffect(() => {
        loadOverview()
    }, [loadOverview])

    const openPartnerConfirmDialog = (row: StoreOverviewItem) => {
        setPartnerConfirmTarget({
            id: row.id,
            produktname: row.produktname,
            hersteller: row.hersteller,
        })
        setPartnerConfirmOpen(true)
    }

    const handlePartnerConfirmDialogOpenChange = (open: boolean) => {
        if (!open && confirmingId) return
        setPartnerConfirmOpen(open)
        if (!open) setPartnerConfirmTarget(null)
    }

    const handlePartnerConfirmSubmit = async () => {
        if (!partnerConfirmTarget) return
        const id = partnerConfirmTarget.id
        setConfirmingId(id)
        try {
            const res = await partnerConfirmation(id)
            toast.success(
                typeof res?.message === 'string' ? res.message : 'Bestätigung erfolgreich',
            )
            setPartnerConfirmOpen(false)
            setPartnerConfirmTarget(null)
            await loadOverview({ silent: true })
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Bestätigung fehlgeschlagen')
        } finally {
            setConfirmingId(null)
        }
    }

    const openDetails = (row: StoreOverviewItem) => {
        const items = getOrderedItems(row.groessenMengen)
        const sizeRange = items.length > 0
            ? `${items[0].size}-${items[items.length - 1].size}`
            : '-'

        setModalData({
            orderName: row.hersteller,
            sizeRange,
            productName: row.produktname,
            items,
        })
        setModalOpen(true)
    }

    const handleNextPage = () => {
        if (!hasMore || rows.length === 0) return
        setCursorHistory((prev) => [...prev, currentCursor])
        setCurrentCursor(rows[rows.length - 1].id)
    }

    const handlePreviousPage = () => {
        if (cursorHistory.length === 0) return

        const previousCursor = cursorHistory[cursorHistory.length - 1]
        setCursorHistory((prev) => prev.slice(0, -1))
        setCurrentCursor(previousCursor)
    }

    const currentPage = cursorHistory.length + 1

    return (
        <>
            <div className="rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden h-full flex flex-col min-h-0 w-full min-w-0">
                <div className="p-4 sm:p-5 md:p-6 flex-1 min-h-0 flex flex-col min-w-0">
                    <div className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-auto min-w-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-gray-200 bg-white hover:bg-white">
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm uppercase">BESTELLDATUM</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm uppercase">LIEFERANT</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm uppercase">PRODUKT</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm uppercase">BESTELLTE MENGEN</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm uppercase">STATUS</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm uppercase">AKTION</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-b border-gray-100 bg-white">
                                        <TableCell colSpan={6} className="px-3 sm:px-4 py-8 text-center text-sm text-gray-500">
                                            Lädt...
                                        </TableCell>
                                    </TableRow>
                                ) : rows.length === 0 ? (
                                    <TableRow className="border-b border-gray-100 bg-white">
                                        <TableCell colSpan={6} className="px-3 sm:px-4 py-8 text-center text-sm text-gray-500">
                                            Keine Bestellungen gefunden.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => {
                                        const orderedItems = getOrderedItems(row.groessenMengen)
                                        const previewItems = orderedItems.slice(0, 4)

                                        return (
                                            <TableRow
                                                key={row.id}
                                                className="border-b border-gray-100 bg-white last:border-b-0 hover:bg-gray-50/50"
                                            >
                                                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-normal text-gray-700 whitespace-nowrap">
                                                    {formatDateTime(row.createdAt)}
                                                </TableCell>
                                                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                                                    {row.hersteller}
                                                </TableCell>
                                                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-normal text-gray-700">
                                                    {row.produktname}
                                                </TableCell>
                                                <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetails(row)}
                                                        className="grid grid-cols-2 gap-1.5 text-left cursor-pointer"
                                                    >
                                                        {previewItems.length > 0 ? (
                                                            previewItems.map((item) => (
                                                                <span
                                                                    key={item.size}
                                                                    className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                                                                >
                                                                    {item.size}: {item.quantity}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs sm:text-sm font-medium text-[#61A178] hover:underline">
                                                                Keine Mengen
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium ${getStatusClassName(row.status)}`}>
                                                        {getStatusLabel(row.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                    {row.status === 'Confirmation' ? (
                                                        <button
                                                            type="button"
                                                            disabled={confirmingId === row.id}
                                                            onClick={() => openPartnerConfirmDialog(row)}
                                                            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#61A178] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#528a6a] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Bestätigen
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-gray-500">
                            Zeige {rows.length} Bestellungen, Seite {currentPage}
                        </div>
                        <Pagination className="mx-0 w-auto justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={handlePreviousPage}
                                        className={cursorHistory.length === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={handleNextPage}
                                        className={!hasMore ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
            <BestelldetailsModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                data={modalData}
                onAddToLager={() => {
                    // TODO: wire to add-to-lager API
                }}
            />

            <Dialog open={partnerConfirmOpen} onOpenChange={handlePartnerConfirmDialogOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bestellung bestätigen</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-2 pt-1 text-sm text-gray-600">
                                <p>
                                    Möchten Sie diese Bestellung wirklich bestätigen? Diese Aktion kann nicht
                                    rückgängig gemacht werden.
                                </p>
                                {partnerConfirmTarget && (
                                    <div className="rounded-md bg-gray-50 px-3 py-2 text-left text-gray-800">
                                        <p className="font-medium">{partnerConfirmTarget.produktname}</p>
                                        <p className="text-xs text-gray-500">{partnerConfirmTarget.hersteller}</p>
                                    </div>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-5">
                        <button
                            type="button"
                            disabled={Boolean(confirmingId)}
                            onClick={() => handlePartnerConfirmDialogOpenChange(false)}
                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="button"
                            disabled={Boolean(confirmingId)}
                            onClick={handlePartnerConfirmSubmit}
                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-[#61A178] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#528a6a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {confirmingId ? 'Wird bestätigt…' : 'Ja, bestätigen'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
