'use client'

import React, { useEffect, useMemo, useState } from 'react'
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

const ALL_DATA: DokumentRow[] = [
  {
    id: 'kv-1',
    typ: 'Kostenvoranschlag',
    nummer: 'KV-2024-0078',
    referenz: 'AUF-2024-089',
    kunde: 'Thomas Müller',
    empfaenger: 'AOK Bayern',
    gesamt: '4.850,00 €',
    bezahlt: '–',
    offen: '–',
    status: 'Gesendet',
    datum: '30.10.2024',
    erstelltVon: 'Dr. Schmidt',
  },
  {
    id: 'kv-2',
    typ: 'Kostenvoranschlag',
    nummer: 'KV-2024-0082',
    referenz: 'AUF-2024-110',
    kunde: 'Sabine Braun',
    empfaenger: 'TK',
    gesamt: '3.100,00 €',
    bezahlt: '–',
    offen: '–',
    status: 'Erstellt',
    datum: '15.1.2025',
    erstelltVon: 'Fr. Becker',
  },
  {
    id: 'kv-3',
    typ: 'Kostenvoranschlag',
    nummer: 'KV-2025-0005',
    referenz: 'AUF-2025-012',
    kunde: 'Werner Schulz',
    empfaenger: 'DAK',
    gesamt: '6.700,00 €',
    bezahlt: '–',
    offen: '–',
    status: 'Erstellt',
    datum: '1.3.2025',
    erstelltVon: 'Dr. Schmidt',
  },
  {
    id: 're-1',
    typ: 'Rechnung',
    nummer: 'RE-2024-1201',
    referenz: 'KV-2024-0078',
    kunde: 'Thomas Müller',
    empfaenger: 'AOK Bayern',
    gesamt: '4.850,00 €',
    bezahlt: '–',
    offen: '4.850,00 €',
    status: 'Offen',
    datum: '30.11.2024',
    erstelltVon: 'Dr. Schmidt',
  },
  {
    id: 're-2',
    typ: 'Rechnung',
    nummer: 'RE-2024-1198',
    referenz: 'AUF-2024-110',
    kunde: 'Sabine Braun',
    empfaenger: 'TK',
    gesamt: '3.100,00 €',
    bezahlt: '3.100,00 €',
    offen: '–',
    status: 'Bezahlt',
    datum: '15.11.2024',
    erstelltVon: 'Fr. Becker',
  },
  {
    id: 're-3',
    typ: 'Rechnung',
    nummer: 'RE-2025-0002',
    referenz: 'AUF-2025-012',
    kunde: 'Werner Schulz',
    empfaenger: 'DAK',
    gesamt: '6.700,00 €',
    bezahlt: '–',
    offen: '6.700,00 €',
    status: 'Überfällig',
    datum: '1.2.2025',
    erstelltVon: 'Dr. Schmidt',
  },
  {
    id: 'ls-1',
    typ: 'Lieferschein',
    nummer: 'LS-2024-0892',
    referenz: 'AUF-2024-089',
    kunde: 'Thomas Müller',
    empfaenger: 'AOK Bayern',
    gesamt: '4.850,00 €',
    bezahlt: '–',
    offen: '–',
    status: 'Versendet',
    datum: '28.10.2024',
    erstelltVon: 'Dr. Schmidt',
  },
  {
    id: 'ls-2',
    typ: 'Lieferschein',
    nummer: 'LS-2025-0012',
    referenz: 'AUF-2025-012',
    kunde: 'Werner Schulz',
    empfaenger: 'DAK',
    gesamt: '6.700,00 €',
    bezahlt: '–',
    offen: '–',
    status: 'Erstellt',
    datum: '15.2.2025',
    erstelltVon: 'Dr. Schmidt',
  },
  {
    id: 'ls-3',
    typ: 'Lieferschein',
    nummer: 'LS-2024-0898',
    referenz: 'AUF-2024-110',
    kunde: 'Sabine Braun',
    empfaenger: 'TK',
    gesamt: '3.100,00 €',
    bezahlt: '–',
    offen: '–',
    status: 'Erhalten',
    datum: '10.11.2024',
    erstelltVon: 'Fr. Becker',
  },
]

const EMPFAENGER_OPTIONS = [
  { value: 'all', label: 'Alle Empfänger' },
  { value: 'aok', label: 'AOK Bayern' },
  { value: 'tk', label: 'TK' },
  { value: 'dak', label: 'DAK' },
]

const STATUS_OPTIONS_KV = [
  { value: 'all', label: 'Alle Status' },
  { value: 'Gesendet', label: 'Gesendet' },
  { value: 'Erstellt', label: 'Erstellt' },
]

const STATUS_OPTIONS_RE = [
  { value: 'all', label: 'Alle Status' },
  { value: 'Offen', label: 'Offen' },
  { value: 'Bezahlt', label: 'Bezahlt' },
  { value: 'Überfällig', label: 'Überfällig' },
]

const STATUS_OPTIONS_LS = [
  { value: 'all', label: 'Alle Status' },
  { value: 'Erstellt', label: 'Erstellt' },
  { value: 'Versendet', label: 'Versendet' },
  { value: 'Erhalten', label: 'Erhalten' },
]

const TYP_OPTIONS = [
  { value: 'all', label: 'Alle Typen' },
  { value: 'Rechnung', label: 'Rechnung' },
  { value: 'Kostenvoranschlag', label: 'Kostenvoranschlag' },
  { value: 'Lieferschein', label: 'Lieferschein' },
]

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
  const [empfaenger, setEmpfaenger] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typFilter, setTypFilter] = useState('all')

  const category = CATEGORY_MAP[activeTab]

  const statusOptions =
    activeTab === 'Rechnungen'
      ? STATUS_OPTIONS_RE
      : activeTab === 'Lieferscheine'
        ? STATUS_OPTIONS_LS
        : activeTab === 'Kostenvoranschläge'
          ? STATUS_OPTIONS_KV
          : TYP_OPTIONS

  const showTypColumn = activeTab === 'Alle'
  const isSecondFilterTyp = activeTab === 'Alle'

  const columns: DocumentDataTableColumn<DokumentRow>[] = useMemo(() => {
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
      { key: 'erstelltVon', label: 'Erstellt von' }
    )
    return base
  }, [activeTab, showTypColumn])

  const filteredData = useMemo(() => {
    let list = ALL_DATA.filter((row) => {
      if (category === 'all') return true
      return row.typ === category
    })
    if (activeTab === 'Alle' && typFilter !== 'all') {
      list = list.filter((row) => row.typ === typFilter)
    }
    if (activeTab !== 'Alle' && statusFilter !== 'all') {
      list = list.filter((row) => row.status === statusFilter)
    }
    if (empfaenger !== 'all') {
      list = list.filter((row) =>
        row.empfaenger.toLowerCase().includes(empfaenger)
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (row) =>
          row.nummer.toLowerCase().includes(q) ||
          row.kunde.toLowerCase().includes(q) ||
          row.referenz.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeTab, category, search, empfaenger, statusFilter, typFilter])

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, empfaenger, statusFilter, typFilter, activeTab])

  const paginatedData = useMemo(
    () => filteredData.slice(0, visibleCount),
    [filteredData, visibleCount]
  )
  const hasNextPage = visibleCount < filteredData.length
  const nextCursor =
    paginatedData.length > 0 ? paginatedData[paginatedData.length - 1].id : null

  const handleNextPage = () => {
    setVisibleCount((v) => v + PAGE_SIZE)
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
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap sm:ml-auto">
          <DocumentFilterDropdown
            placeholder="Alle Empfänger"
            options={EMPFAENGER_OPTIONS}
            value={empfaenger}
            onValueChange={setEmpfaenger}
          />
          <DocumentFilterDropdown
            placeholder={isSecondFilterTyp ? 'Alle Typen' : 'Alle Status'}
            options={statusOptions}
            value={isSecondFilterTyp ? typFilter : statusFilter}
            onValueChange={isSecondFilterTyp ? setTypFilter : setStatusFilter}
            showFilterIcon
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <DocumentDataTable<DokumentRow>
          columns={columns}
          data={paginatedData}
          keyField="id"
          emptyMessage={emptyMessage}
          className="rounded-none border-0 shadow-none"
        />
        {filteredData.length > 0 && (
          <CursorPagination
            hasNextPage={hasNextPage}
            onNext={handleNextPage}
            nextCursor={nextCursor}
            totalShown={paginatedData.length}
            totalCount={filteredData.length}
            pageSize={PAGE_SIZE}
            nextLabel="Mehr laden"
          />
        )}
      </div>
    </div>
  )
}
