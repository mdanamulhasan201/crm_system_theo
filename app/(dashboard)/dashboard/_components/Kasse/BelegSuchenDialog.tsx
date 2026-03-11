'use client'
import React, { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Receipt, ChevronRight } from 'lucide-react'
import BelegDetailDialog from './BelegDetailDialog'

// ─── Shared types (exported for child dialogs) ────────────────────────────────

export interface BonPosition {
  id: string
  name: string
  description: string
  sku: string
  unitPrice: number
  quantity: number
  vatRate: number
}

export type BonStatus = 'Abgeschlossen' | 'Teilw. storniert' | 'Teilw. rückgabe' | 'Storniert'

export interface Bon {
  id: string
  bonNumber: string
  status: BonStatus
  amount: number
  netto: number
  mwst: number
  date: string
  time: string
  employee: string
  customer: string
  paymentMethod: string
  folgebeleg?: number
  positions: BonPosition[]
  history: Array<{ action: string; date: string; time: string; employee: string }>
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

export const DUMMY_BONS: Bon[] = [
  {
    id: 'bon-047',
    bonNumber: 'BON-2026-0047',
    status: 'Abgeschlossen',
    amount: 126.70,
    netto: 106.47,
    mwst: 20.23,
    date: '07.03.2026',
    time: '10:23',
    employee: 'Anna M.',
    customer: 'David Schneider',
    paymentMethod: 'EC-Karte',
    positions: [
      { id: 'p1', name: 'Sporteinlagen Comfort', description: 'Größe 42',    sku: 'EIN-001', unitPrice: 95.00, quantity: 1, vatRate: 4  },
      { id: 'p2', name: 'Lederpflegecreme',       description: '50ml',         sku: 'PFL-002', unitPrice: 23.80, quantity: 1, vatRate: 22 },
      { id: 'p3', name: 'Schnürsenkel gewachst',  description: 'Schwarz, 90cm',sku: 'ZUB-003', unitPrice:  7.90, quantity: 1, vatRate: 22 },
    ],
    history: [
      { action: 'Verkauf erstellt',      date: '07.03.2026', time: '10:23', employee: 'Anna M.' },
      { action: 'Zahlung abgeschlossen', date: '07.03.2026', time: '10:25', employee: 'Anna M.' },
    ],
  },
  {
    id: 'bon-045',
    bonNumber: 'BON-2026-0045',
    status: 'Abgeschlossen',
    amount: 64.60,
    netto: 52.87,
    mwst: 11.73,
    date: '07.03.2026',
    time: '09:15',
    employee: 'Anna M.',
    customer: 'Anonymer Verkauf',
    paymentMethod: 'Bar',
    positions: [
      { id: 'p1', name: 'Fußpflege-Set Deluxe', description: '5-teilig',         sku: 'PFL-010', unitPrice: 34.90, quantity: 1, vatRate: 22 },
      { id: 'p2', name: 'Einlegesohlen Gel',     description: 'Universal 36–46', sku: 'ZUB-011', unitPrice: 29.70, quantity: 1, vatRate: 22 },
    ],
    history: [
      { action: 'Verkauf erstellt',      date: '07.03.2026', time: '09:15', employee: 'Anna M.' },
      { action: 'Zahlung abgeschlossen', date: '07.03.2026', time: '09:16', employee: 'Anna M.' },
    ],
  },
  {
    id: 'bon-042',
    bonNumber: 'BON-2026-0042',
    status: 'Abgeschlossen',
    amount: 493.90,
    netto: 432.28,
    mwst: 61.62,
    date: '05.03.2026',
    time: '13:40',
    employee: 'Stefan K.',
    customer: 'Maria Weber',
    paymentMethod: 'Krankenkasse, EC-Karte',
    positions: [
      { id: 'p1', name: 'Orthopädische Maßschuhe',   description: 'Schwarz, Gr. 43', sku: 'SCH-001', unitPrice: 389.00, quantity: 1, vatRate: 4  },
      { id: 'p2', name: 'Kompressionsstrümpfe Kl.2', description: 'Schwarz, M',      sku: 'SOC-006', unitPrice:  45.00, quantity: 1, vatRate: 22 },
      { id: 'p3', name: 'Einlegesohlen Gel',          description: 'Gr. 43',          sku: 'ZUB-011', unitPrice:  19.90, quantity: 1, vatRate: 22 },
      { id: 'p4', name: 'Schuhspanner Holz',          description: 'Gr. 40–45',       sku: 'ZUB-020', unitPrice:  29.90, quantity: 1, vatRate: 22 },
      { id: 'p5', name: 'Lederpflegecreme',            description: '50ml',            sku: 'PFL-002', unitPrice:  10.10, quantity: 1, vatRate: 22 },
    ],
    history: [
      { action: 'Verkauf erstellt',      date: '05.03.2026', time: '13:40', employee: 'Stefan K.' },
      { action: 'Zahlung abgeschlossen', date: '05.03.2026', time: '13:43', employee: 'Stefan K.' },
    ],
  },
  {
    id: 'bon-038',
    bonNumber: 'BON-2026-0038',
    status: 'Teilw. storniert',
    amount: 186.80,
    netto: 163.40,
    mwst: 23.40,
    date: '04.03.2026',
    time: '11:05',
    employee: 'Anna M.',
    customer: 'Klaus Fischer',
    paymentMethod: 'EC-Karte',
    folgebeleg: 1,
    positions: [
      { id: 'p1', name: 'Sporteinlagen Premium',  description: 'Größe 38', sku: 'EIN-002', unitPrice: 129.00, quantity: 1, vatRate: 4  },
      { id: 'p2', name: 'Schuhpflegeset',          description: 'Komplett', sku: 'ZUB-012', unitPrice:  57.80, quantity: 1, vatRate: 22 },
    ],
    history: [
      { action: 'Verkauf erstellt',      date: '04.03.2026', time: '11:05', employee: 'Anna M.' },
      { action: 'Zahlung abgeschlossen', date: '04.03.2026', time: '11:07', employee: 'Anna M.' },
      { action: 'Teilstorno durchgeführt', date: '04.03.2026', time: '15:22', employee: 'Anna M.' },
    ],
  },
  {
    id: 'bon-035',
    bonNumber: 'BON-2026-0035',
    status: 'Teilw. rückgabe',
    amount: 264.00,
    netto: 228.32,
    mwst: 35.68,
    date: '05.03.2026',
    time: '16:20',
    employee: 'Stefan K.',
    customer: 'Lisa Hoffmann',
    paymentMethod: 'Kreditkarte',
    folgebeleg: 1,
    positions: [
      { id: 'p1', name: 'Therapieschuhe Leder',   description: 'Braun, Gr. 41', sku: 'SCH-005', unitPrice: 249.00, quantity: 1, vatRate: 4  },
      { id: 'p2', name: 'Stützsocken Baumwolle',  description: 'Weiß, L',       sku: 'SOC-007', unitPrice:  15.00, quantity: 1, vatRate: 22 },
    ],
    history: [
      { action: 'Verkauf erstellt',      date: '05.03.2026', time: '16:20', employee: 'Stefan K.' },
      { action: 'Zahlung abgeschlossen', date: '05.03.2026', time: '16:22', employee: 'Stefan K.' },
      { action: 'Teilrückgabe verarbeitet', date: '06.03.2026', time: '09:10', employee: 'Anna M.' },
    ],
  },
]

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<BonStatus, string> = {
  'Abgeschlossen':    'bg-green-100 text-green-700',
  'Teilw. storniert': 'bg-red-100 text-red-700',
  'Teilw. rückgabe':  'bg-orange-100 text-orange-700',
  'Storniert':        'bg-gray-100 text-gray-500',
}

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

// ─── Props ────────────────────────────────────────────────────────────────────

interface BelegSuchenDialogProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BelegSuchenDialog({ isOpen, onClose }: BelegSuchenDialogProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'alle' | BonStatus>('alle')
  const [filterPayment, setFilterPayment] = useState('alle')
  const [selectedBon, setSelectedBon] = useState<Bon | null>(null)

  const allPaymentMethods = Array.from(new Set(DUMMY_BONS.flatMap(b => b.paymentMethod.split(', '))))

  const filtered = useMemo(() => {
    return DUMMY_BONS.filter(b => {
      if (filterStatus !== 'alle' && b.status !== filterStatus) return false
      if (filterPayment !== 'alle' && !b.paymentMethod.includes(filterPayment)) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          b.bonNumber.toLowerCase().includes(q) ||
          b.customer.toLowerCase().includes(q) ||
          b.positions.some(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [search, filterStatus, filterPayment])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSearch('')
      setFilterStatus('alle')
      setFilterPayment('alle')
    }, 300)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[680px] w-[95vw] max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogTitle className="sr-only">Beleg suchen</DialogTitle>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Beleg suchen</h2>
          </div>

          {/* Search + filters */}
          <div className="px-5 py-3 border-b shrink-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                autoFocus
                placeholder="Belegnummer, Kundenname, Artikel oder SKU..."
                className="pl-9 h-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1"
              >
                <option value="alle">Alle Status</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
                <option value="Teilw. storniert">Teilw. storniert</option>
                <option value="Teilw. rückgabe">Teilw. rückgabe</option>
                <option value="Storniert">Storniert</option>
              </select>
              <select
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1"
              >
                <option value="alle">Alle Zahlungsarten</option>
                {allPaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Receipt className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-sm">Keine Belege gefunden</p>
              </div>
            ) : (
              filtered.map(bon => (
                <button
                  key={bon.id}
                  onClick={() => setSelectedBon(bon)}
                  className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-[#61A175] hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* BON number + status */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-gray-900">{bon.bonNumber}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[bon.status]}`}>
                          {bon.status}
                        </span>
                        {bon.folgebeleg && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            {bon.folgebeleg} Folgebeleg
                          </span>
                        )}
                      </div>
                      {/* Date + employee */}
                      <p className="text-xs text-gray-500">
                        {bon.date}, {bon.time} · {bon.employee}
                      </p>
                      {/* Customer + positions + payment */}
                      <p className="text-xs text-gray-600 mt-0.5">
                        {bon.customer} · {bon.positions.reduce((s, p) => s + p.quantity, 0)} {bon.positions.length === 1 ? 'Position' : 'Positionen'} · {bon.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-base font-bold text-gray-900 tabular-nums">{fmt(bon.amount)} €</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#61A175] transition-colors" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BelegDetailDialog
        isOpen={!!selectedBon}
        onClose={() => setSelectedBon(null)}
        onCloseAll={() => { setSelectedBon(null); handleClose() }}
        bon={selectedBon}
      />
    </>
  )
}
