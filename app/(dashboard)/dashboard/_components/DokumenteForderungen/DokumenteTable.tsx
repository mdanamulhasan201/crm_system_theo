'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import DocumentSearchBar from './DocumentSearchBar'
import DocumentFilterDropdown from './DocumentFilterDropdown'
import DocumentDataTable, {
  type DocumentDataTableColumn,
} from './DocumentDataTable'
import CursorPagination from '@/components/ui/cursor-pagination'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DokumentFilterTab } from './FilterTabButton'
import {
  deleteDocumentsClaims,
  getAllDocumentsClaims,
  getRecipientName,
} from '@/apis/warenwirtschaftApis'
import NeuerDokumenteModal from './NeuerDokumenteModal'
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

export interface DokumentRow extends Record<string, unknown> {
  id: string
  typ: 'Rechnung' | 'Kostenvoranschlag' | 'Lieferschein'
  nummer: string
  referenz: string
  kunde: string
  empfaenger: string
  gesamt: string
  bezahlt: string
  offen: string
  status: string
  datum: string
  erstelltVon: string
}

const DEFAULT_EMPFAENGER_OPTION = { value: 'all', label: 'Alle Empfänger' }

function TypPill({ value }: { value: string }) {
  return (
    <Badge
      variant="secondary"
      className="rounded-full border-0 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
    >
      {value}
    </Badge>
  )
}

function StatusPill({ status }: { status: string }) {
  const isGreen = ['Bezahlt', 'Gesendet', 'Erhalten', 'Versendet'].includes(status)
  const isRed = status === 'Überfällig'
  const isAmber = status === 'Offen'
  const isBlue = status === 'Gesendet' || status === 'Versendet'
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-full border-0 text-xs font-medium',
        isGreen && 'bg-green-100 text-green-700',
        isRed && 'bg-red-100 text-red-700',
        isAmber && 'bg-amber-100 text-amber-700',
        isBlue && 'bg-blue-100 text-blue-700',
        !isGreen && !isRed && !isAmber && !isBlue && 'bg-gray-100 text-gray-600'
      )}
    >
      {status}
    </Badge>
  )
}

const CATEGORY_MAP: Record<DokumentFilterTab, DokumentRow['typ'] | 'all'> = {
  Alle: 'all',
  Rechnungen: 'Rechnung',
  Kostenvoranschläge: 'Kostenvoranschlag',
  Lieferscheine: 'Lieferschein',
}

interface DokumenteTableProps {
  activeTab: DokumentFilterTab
}

export default function DokumenteTable({ activeTab }: DokumenteTableProps) {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [empfaenger, setEmpfaenger] = useState('all')
  const [empfaengerOptions, setEmpfaengerOptions] = useState<
    { value: string; label: string }[]
  >([DEFAULT_EMPFAENGER_OPTION])
  const [rows, setRows] = useState<DokumentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<DokumentRow | null>(null)

  const category = CATEGORY_MAP[activeTab]

  const showTypColumn = activeTab === 'Alle'

  const mapApiTypeToLabel = (apiType: string | null | undefined): DokumentRow['typ'] => {
    switch (apiType) {
      case 'invoices':
        return 'Rechnung'
      case 'cost_estimate':
        return 'Kostenvoranschlag'
      case 'delivery_notes':
        return 'Lieferschein'
      default:
        return 'Rechnung'
    }
  }

  const formatCurrency = (amount: unknown): string => {
    if (typeof amount === 'number') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }
    if (typeof amount === 'string' && amount.trim() !== '') {
      return amount
    }
    return '–'
  }

  const formatDate = (value: unknown): string => {
    if (typeof value === 'string' && value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('de-DE')
      }
      return value
    }
    return '–'
  }

  const mapApiItemToRow = (item: any): DokumentRow => {
    const apiType = item?.type ?? item?.document_type
    const paymentType = item?.payment_type as string | undefined
    let status: string = item?.status ?? ''

    if (!status && paymentType) {
      if (paymentType === 'Open') status = 'Offen'
      else if (paymentType === 'Paid') status = 'Bezahlt'
      else status = paymentType
    }

    return {
      id: String(item?.id ?? item?._id ?? ''),
      typ: mapApiTypeToLabel(apiType),
      nummer: String(item?.number ?? item?.documentNumber ?? item?.document_number ?? '–'),
      referenz: String(item?.reference ?? item?.reference_number ?? '–'),
      kunde: String(item?.customerName ?? item?.customer_name ?? '–'),
      empfaenger: String(item?.recipient ?? '–'),
      gesamt: formatCurrency(item?.in_total ?? item?.total_amount),
      bezahlt: formatCurrency(item?.paid),
      offen: formatCurrency(item?.open),
      status: status || '–',
      datum: formatDate(item?.date ?? item?.createdAt),
      erstelltVon: String(item?.created_by ?? item?.createdBy ?? '–'),
    }
  }

  const handleEditClick = useCallback((row: DokumentRow) => {
    setEditingId(row.id)
    setEditModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback(
    (row: DokumentRow) => {
      setRowToDelete(row)
      setDeleteConfirmOpen(true)
    },
    []
  )

  const confirmDelete = useCallback(
    async () => {
      if (!rowToDelete || deletingId) return
      setDeletingId(rowToDelete.id)
      try {
        await deleteDocumentsClaims(rowToDelete.id)
        toast.success('Dokument gelöscht.')
        setDeleteConfirmOpen(false)
        setRowToDelete(null)
        // reload from first page
        setRows([])
        setNextCursor(null)
        setHasNextPage(false)
        await loadPage('')
      } catch {
        toast.error('Dokument konnte nicht gelöscht werden.')
      } finally {
        setDeletingId(null)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowToDelete, deletingId]
  )

  const columns: DocumentDataTableColumn<DokumentRow>[] = React.useMemo(() => {
    const base: DocumentDataTableColumn<DokumentRow>[] = []
    if (showTypColumn) {
      base.push({
        key: 'typ',
        label: 'Typ',
        render: (_, row) => <TypPill value={row.typ} />,
      })
    }
    base.push(
      {
        key: 'nummer',
        label: 'Nummer',
        render: (_, row) => (
          <Link
            href="#"
            className="font-medium text-green-600 hover:text-green-700 hover:underline"
          >
            {row.nummer}
          </Link>
        ),
      },
      { key: 'referenz', label: 'Referenz', cellClassName: 'text-gray-500' },
      { key: 'kunde', label: 'Kunde', cellClassName: 'font-semibold text-gray-900' },
      { key: 'empfaenger', label: 'Empfänger' },
      {
        key: 'gesamt',
        label: 'Gesamt',
        align: 'right',
        cellClassName: 'font-medium text-gray-900',
      },
      { key: 'bezahlt', label: 'Bezahlt', align: 'right' },
      { key: 'offen', label: 'Offen', align: 'right' },
      {
        key: 'status',
        label: 'Status',
        render: (_, row) => <StatusPill status={row.status} />,
      },
      { key: 'datum', label: activeTab === 'Kostenvoranschläge' ? 'Fällig' : 'Datum' },
      { key: 'erstelltVon', label: 'Erstellt von' },
      {
        key: 'actions',
        label: 'Aktionen',
        align: 'right',
        render: (_, row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 rounded transition-colors"
              onClick={() => handleEditClick(row)}
              aria-label="Dokument bearbeiten"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 cursor-pointer text-gray-500 hover:text-red-600 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => handleDeleteClick(row)}
              aria-label="Dokument löschen"
              disabled={deletingId === row.id}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      }
    )
    return base
  }, [activeTab, showTypColumn, deletingId, handleEditClick, handleDeleteClick])

  const apiTypeForTab = (tab: DokumentFilterTab): string => {
    switch (tab) {
      case 'Rechnungen':
        return 'invoices'
      case 'Kostenvoranschläge':
        return 'cost_estimate'
      case 'Lieferscheine':
        return 'delivery_notes'
      default:
        return ''
    }
  }

  const loadPage = async (cursor: string) => {
    try {
      setLoading(true)
      const recipientParam = empfaenger === 'all' ? '' : empfaenger
      const typeParam = apiTypeForTab(activeTab)

      const res: any = await getAllDocumentsClaims(
        PAGE_SIZE,
        cursor,
        recipientParam,
        search.trim(),
        typeParam
      )

      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      const mapped = items.map(mapApiItemToRow)

      setRows((prev) => (cursor ? [...prev, ...mapped] : mapped))
      setHasNextPage(Boolean(res?.hasMore))
      setNextCursor(res?.nextCursor ?? null)
    } catch (error) {
      if (!cursor) {
        setRows([])
        setHasNextPage(false)
        setNextCursor(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const res: any = await getRecipientName()
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []

        const mapped = list
          .map((item: any) => {
            const name =
              typeof item === 'string'
                ? item.trim()
                : String(item?.recipient ?? item?.name ?? '').trim()
            if (!name) return null
            return { value: name, label: name }
          })
          .filter(Boolean) as { value: string; label: string }[]

        const uniqueByValue = Array.from(
          new Map(mapped.map((opt) => [opt.value, opt])).values()
        )

        setEmpfaengerOptions([DEFAULT_EMPFAENGER_OPTION, ...uniqueByValue])
      } catch {
        setEmpfaengerOptions([DEFAULT_EMPFAENGER_OPTION])
      }
    }

    void loadRecipients()
  }, [])

  useEffect(() => {
    // reset and load first page when filters or tab change
    setRows([])
    setNextCursor(null)
    setHasNextPage(false)
    void loadPage('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, search, empfaenger])

  // debounce search input -> search used for API calls
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(handle)
  }, [searchInput])

  const handleNextPage = () => {
    if (loading || !hasNextPage || !nextCursor) return
    void loadPage(nextCursor)
  }

  const emptyMessage =
    activeTab === 'Alle'
      ? 'Keine Dokumente gefunden.'
      : activeTab === 'Rechnungen'
        ? 'Keine Rechnungen gefunden.'
        : activeTab === 'Kostenvoranschläge'
          ? 'Keine Kostenvoranschläge gefunden.'
          : 'Keine Lieferscheine gefunden.'

  return (
    <div className="w-full space-y-4">
      <div className="flex w-fit flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="w-fit sm:max-w-[320px]">
          <DocumentSearchBar
            placeholder="Suche nach Nr., Kunde, Referenz..."
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap sm:ml-auto">
          <DocumentFilterDropdown
            placeholder="Alle Empfänger"
            options={empfaengerOptions}
            value={empfaenger}
            onValueChange={setEmpfaenger}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <DocumentDataTable<DokumentRow>
          columns={columns}
          data={rows}
          keyField="id"
          emptyMessage={emptyMessage}
          className="rounded-none border-0 shadow-none"
        />
        {rows.length > 0 && (
          <CursorPagination
            hasNextPage={hasNextPage}
            onNext={handleNextPage}
            nextCursor={nextCursor}
            totalShown={rows.length}
            totalCount={rows.length}
            pageSize={PAGE_SIZE}
            nextLabel="Mehr laden"
          />
        )}
      </div>

      <NeuerDokumenteModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open)
          if (!open) setEditingId(null)
        }}
        mode="edit"
        documentId={editingId ?? undefined}
        onSuccess={async () => {
          setRows([])
          setNextCursor(null)
          setHasNextPage(false)
          await loadPage('')
        }}
      />

      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) setRowToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dokument löschen?</DialogTitle>
            <DialogDescription>
              {rowToDelete
                ? `Möchten Sie das Dokument "${rowToDelete.nummer}" wirklich löschen?`
                : 'Möchten Sie dieses Dokument wirklich löschen?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={!!deletingId}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={!!deletingId}
            >
              {deletingId ? 'Wird gelöscht…' : 'Löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
