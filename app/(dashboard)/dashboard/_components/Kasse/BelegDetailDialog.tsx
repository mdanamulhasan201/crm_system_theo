'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle2, RotateCcw, RefreshCw } from 'lucide-react'
import type { Bon, BonStatus } from './BelegSuchenDialog'
import StornoDialog from './StornoDialog'
import RückgabeDialog from './RückgabeDialog'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

const STATUS_STYLE: Record<BonStatus, string> = {
  'Abgeschlossen':    'bg-green-100 text-green-700',
  'Teilw. storniert': 'bg-red-100 text-red-700',
  'Teilw. rückgabe':  'bg-orange-100 text-orange-700',
  'Storniert':        'bg-gray-100 text-gray-500',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BelegDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  onCloseAll?: () => void
  bon: Bon | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BelegDetailDialog({ isOpen, onClose, onCloseAll, bon }: BelegDetailDialogProps) {
  const [showStorno, setShowStorno] = useState(false)
  const [showRückgabe, setShowRückgabe] = useState(false)

  if (!bon) return null

  const isActionable = bon.status !== 'Storniert'

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Belegdetails {bon.bonNumber}</DialogTitle>

          {/* ── Header ── */}
          <div className="px-5 py-4 border-b shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-gray-900">{bon.bonNumber}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[bon.status]}`}>
                {bon.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {bon.date}, {bon.time} · {bon.employee}
            </p>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Meta cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Kunde</p>
                <p className="text-sm font-semibold text-gray-900 truncate" title={bon.customer}>
                  {bon.customer}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Zahlungsart</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{bon.paymentMethod}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Gesamt</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">{fmt(bon.amount)} €</p>
              </div>
            </div>

            {/* Positionen */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Positionen</p>
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {bon.positions.map(pos => (
                  <div key={pos.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{pos.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {pos.description}
                        {pos.sku && <span className="ml-2 text-gray-400">SKU: {pos.sku}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">
                        {fmt(pos.unitPrice * pos.quantity)} €
                      </p>
                      <p className="text-xs text-gray-500">{pos.quantity}× {fmt(pos.unitPrice)} €</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Netto</span>
                <span className="tabular-nums">{fmt(bon.netto)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>MwSt.</span>
                <span className="tabular-nums">{fmt(bon.mwst)} €</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Brutto</span>
                <span className="tabular-nums">{fmt(bon.amount)} €</span>
              </div>
            </div>

            {/* Zahlungen */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Zahlungen</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <CreditCard className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{bon.paymentMethod}</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(bon.amount)} €</span>
              </div>
            </div>

            {/* Verlauf */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Verlauf</p>
              <div className="space-y-2">
                {bon.history.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">{entry.action}</p>
                      <p className="text-xs text-gray-500">
                        {entry.date}, {entry.time} · {entry.employee}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex gap-2 px-5 py-4 border-t shrink-0">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
              onClick={() => setShowStorno(true)}
              disabled={!isActionable}
            >
              <RotateCcw className="w-4 h-4" />
              Storno
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
              onClick={() => setShowRückgabe(true)}
              disabled={!isActionable}
            >
              <RefreshCw className="w-4 h-4" />
              Rückgabe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StornoDialog
        isOpen={showStorno}
        onClose={() => setShowStorno(false)}
        onCloseAll={() => { setShowStorno(false); onClose(); onCloseAll?.() }}
        bon={bon}
      />
      <RückgabeDialog
        isOpen={showRückgabe}
        onClose={() => setShowRückgabe(false)}
        onCloseAll={() => { setShowRückgabe(false); onClose(); onCloseAll?.() }}
        bon={bon}
      />
    </>
  )
}
