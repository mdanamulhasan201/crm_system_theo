'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowRight, Loader2, Pencil, Trash2 } from 'lucide-react'
import { getAllInventories, deleteInventory, type InventoryItem, type InventoryStatus, type PaymentStatus } from '@/apis/warenwirtschaftApis'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const STATUS_LABELS: Record<InventoryStatus, string> = {
  Ordered: 'Bestellt',
  Delivered: 'Geliefert',
  Partially: 'Teilweise',
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  Open: 'Offen',
  Paid: 'Bezahlt',
}

type StatusBadgeStatus = 'Bestellt' | 'Geliefert' | 'Teilweise'
type ZahlungBadgeStatus = 'Offen' | 'Bezahlt'

function formatDate(iso: string) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  const styles: Record<StatusBadgeStatus, string> = {
    Bestellt: 'bg-blue-100 text-blue-700 border-blue-200',
    Geliefert: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Teilweise: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return (
    <Badge variant="outline" className={`border ${styles[status]} font-medium`}>
      {status}
    </Badge>
  )
}

function ZahlungBadge({ zahlung }: { zahlung: ZahlungBadgeStatus }) {
  const styles: Record<ZahlungBadgeStatus, string> = {
    Offen: 'bg-amber-100 text-amber-700 border-amber-200',
    Bezahlt: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return (
    <Badge variant="outline" className={`border ${styles[zahlung]} font-medium`}>
      {zahlung}
    </Badge>
  )
}

interface BestellungenTableProps {
  refreshTrigger?: number
  onEditInventory?: (id: string) => void
  onDeleted?: () => void
}

export default function BestellungenTable({ refreshTrigger, onEditInventory, onDeleted }: BestellungenTableProps) {
  const [data, setData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (nextCursor: string, append: boolean, silent = false) => {
    if (!silent) {
      if (append) setLoadingMore(true)
      else setLoading(true)
    }
    setError(null)
    try {
      const res = await getAllInventories(PAGE_SIZE, nextCursor, 'Orders')
      setData((prev) => (append ? [...prev, ...res.data] : res.data))
      setHasMore(res.hasMore)
      const next = res.nextCursor ?? (res.data.length > 0 ? res.data[res.data.length - 1].id : '')
      setCursor(next)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Fehler beim Laden.'
      setError(msg)
    } finally {
      if (!silent) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [])

  useEffect(() => {
    load('', false)
  }, [load])

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      load('', false, true)
    }
  }, [refreshTrigger, load])

  const loadMore = () => {
    if (loadingMore || !hasMore || !cursor) return
    load(cursor, true)
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id)
    setDeleteConfirmOpen(true)
  }

  const closeDeleteConfirm = () => {
    if (!deleting) {
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await deleteInventory(deleteTargetId)
      toast.success('Bestellung gelöscht.')
      onDeleted?.()
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
    } catch {
      toast.error('Löschen fehlgeschlagen.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && data.length === 0) {
    return (
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Bestellungen</CardTitle>
          <CardDescription className="text-sm text-gray-500">Aktuelle und vergangene Bestellungen</CardDescription>
        </CardHeader>
        <CardContent className="px-6 flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#62A17C]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Bestellungen</CardTitle>
        <CardDescription className="text-sm text-gray-500">Aktuelle und vergangene Bestellungen (Orders)</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                <TableHead className="h-14 px-4 font-semibold text-gray-700">Bestellnr.</TableHead>
                <TableHead className="h-14 px-4 font-semibold text-gray-700">Lieferant</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Datum</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-right">Betrag</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Status</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Zahlung</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Zahlungsdatum</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Keine Bestellungen vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50/50"
                  >
                    <TableCell className="px-4 py-4 text-gray-900 font-medium">{order.number}</TableCell>
                    <TableCell className="px-4 py-4 text-gray-700">{order.supplier}</TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-center">{formatDate(order.date)}</TableCell>
                    <TableCell className="px-4 py-4 text-gray-900 text-right font-medium">{formatAmount(order.amount)}</TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <StatusBadge status={STATUS_LABELS[order.status] as StatusBadgeStatus} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <ZahlungBadge zahlung={PAYMENT_LABELS[order.payment_status] as ZahlungBadgeStatus} />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-center">{formatDate(order.payment_date) || '–'}</TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 cursor-pointer text-gray-600 hover:text-[#62A17C] hover:bg-[#62A17C]/10"
                          onClick={() => onEditInventory?.(order.id)}
                          title="Bearbeiten"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 cursor-pointer text-gray-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteConfirm(order.id)}
                          title="Löschen"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-transparent font-medium"
                        >
                          <ArrowRight className="size-4 mr-1 inline" />
                          WE starten
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {hasMore && data.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? <Loader2 className="size-4 animate-spin" /> : 'Weitere laden'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={deleteConfirmOpen} onOpenChange={(open) => !open && closeDeleteConfirm()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bestellung löschen?</DialogTitle>
          <DialogDescription>
            Möchten Sie diese Bestellung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={closeDeleteConfirm}
            disabled={deleting}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : 'Löschen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
