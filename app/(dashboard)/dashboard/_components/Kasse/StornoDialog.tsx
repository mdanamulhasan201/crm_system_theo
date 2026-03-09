'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, ArrowLeft, Check, Ban, FileText, Info } from 'lucide-react'
import type { Bon } from './BelegSuchenDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

type StornoType   = 'komplett' | 'teilweise' | null
type StornoReason = 'Bedienfehler' | 'Falscher Artikel' | 'Falscher Preis' | 'Doppelt kassiert' | 'Kunde reklamiert sofort' | 'Sonstiges'
type StornoStep   = 'art' | 'grund' | 'bestaetigung' | 'done'

const STEPS: { id: StornoStep; label: string }[] = [
  { id: 'art',          label: 'Art'         },
  { id: 'grund',        label: 'Grund'       },
  { id: 'bestaetigung', label: 'Bestätigung' },
]

const REASONS: StornoReason[] = [
  'Bedienfehler',
  'Falscher Artikel',
  'Falscher Preis',
  'Doppelt kassiert',
  'Kunde reklamiert sofort',
  'Sonstiges',
]

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: StornoStep }) {
  const activeIdx = STEPS.findIndex(s => s.id === current)
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((s, idx) => {
        const isActive   = idx === activeIdx
        const isComplete = idx < activeIdx
        const isLast     = idx === STEPS.length - 1
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  isActive || isComplete ? 'bg-red-500' : 'bg-gray-200'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-red-600' : isComplete ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {!isLast && <div className="w-2 shrink-0" />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StornoDialogProps {
  isOpen: boolean
  onClose: () => void
  onCloseAll?: () => void
  bon: Bon | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StornoDialog({ isOpen, onClose, onCloseAll, bon }: StornoDialogProps) {
  const [step,              setStep]              = useState<StornoStep>('art')
  const [stornoType,        setStornoType]        = useState<StornoType>(null)
  const [selectedReason,    setSelectedReason]    = useState<StornoReason | null>(null)
  const [hinweise,          setHinweise]          = useState('')
  const [selectedQty,       setSelectedQty]       = useState<Record<string, number>>({})
  const [folgebelegNumber,  setFolgebelegNumber]  = useState('')

  if (!bon) return null

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (step === 'art')          { handleClose(); return }
    if (step === 'grund')        { setStep('art');          return }
    if (step === 'bestaetigung') { setStep('grund');        return }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('art')
      setStornoType(null)
      setSelectedReason(null)
      setHinweise('')
      setSelectedQty({})
      setFolgebelegNumber('')
    }, 300)
  }

  const handleTypeSelect = (type: StornoType) => {
    setStornoType(type)
    setStep('grund')
  }

  const handleGrundWeiter = () => {
    if (!selectedReason) return
    setStep('bestaetigung')
  }

  // ── Computed ────────────────────────────────────────────────────────────────

  const stornoPositions = stornoType === 'komplett'
    ? bon.positions
    : bon.positions.filter(p => (selectedQty[p.id] ?? 0) > 0)

  const stornoAmount = bon.positions.reduce((sum, p) => {
    if (stornoType === 'komplett') return sum + p.unitPrice * p.quantity
    return sum + p.unitPrice * (selectedQty[p.id] ?? 0)
  }, 0)

  const canConfirm = stornoType === 'komplett'
    ? true
    : Object.values(selectedQty).some(v => v > 0)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-130 w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Storno {bon.bonNumber}</DialogTitle>

        {/* ── Shared header ── */}
        {step !== 'done' && (
          <div className="px-5 pt-5 pb-4 shrink-0">
            {/* Back + title row */}
            <div className="flex items-start gap-3 mb-4">
              <button
                onClick={handleBack}
                className="mt-0.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-gray-900">Storno</h2>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{bon.bonNumber}</p>
              </div>
            </div>
            {/* Stepper */}
            <Stepper current={step} />
          </div>
        )}

        <div className="h-px bg-gray-100 shrink-0" />

        {/* ── Step 1: Art ── */}
        {step === 'art' && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="text-base font-semibold text-red-600 mb-5">
              Wie soll der Storno durchgeführt werden?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleTypeSelect('komplett')}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50/30 transition-all active:scale-[0.99]"
              >
                <p className="text-base font-bold text-gray-900 mb-1.5">Komplett stornieren</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Der gesamte Beleg wird aufgehoben. Alle verfügbaren Positionen werden storniert.
                </p>
              </button>
              <button
                onClick={() => handleTypeSelect('teilweise')}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50/30 transition-all active:scale-[0.99]"
              >
                <p className="text-base font-bold text-gray-900 mb-1.5">Teilweise stornieren</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Nur bestimmte Positionen oder Mengen werden storniert.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Grund ── */}
        {step === 'grund' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-base font-bold text-gray-900 mb-4">Stornogrund wählen</p>
              {/* 2-column reason grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                      selectedReason === r
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {/* Note */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Bemerkung (optional)</p>
                <Textarea
                  placeholder="Zusätzliche Hinweise..."
                  value={hinweise}
                  onChange={e => setHinweise(e.target.value)}
                  className="min-h-25 resize-none text-sm bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t shrink-0">
              <Button
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
                disabled={!selectedReason}
                onClick={handleGrundWeiter}
              >
                Weiter
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Bestätigung ── */}
        {step === 'bestaetigung' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Summary box */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm font-bold text-red-600">Storno-Zusammenfassung</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Art</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stornoType === 'komplett' ? 'Komplettstorno' : 'Teilstorno'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Grund</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedReason}</span>
                </div>
              </div>

              {/* Stornierte Positionen — individual cards */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Stornierte Positionen</p>
                <div className="space-y-2">
                  {bon.positions.map(pos => {
                    const qty = stornoType === 'komplett' ? pos.quantity : (selectedQty[pos.id] ?? 0)
                    return (
                      <div
                        key={pos.id}
                        className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{pos.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{pos.description}</p>
                        </div>
                        {stornoType === 'teilweise' ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setSelectedQty(prev => ({ ...prev, [pos.id]: Math.max(0, (prev[pos.id] ?? 0) - 1) }))}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                            >
                              <span className="text-sm font-bold leading-none">−</span>
                            </button>
                            <span className="w-6 text-center text-sm font-semibold tabular-nums">
                              {selectedQty[pos.id] ?? 0}
                            </span>
                            <button
                              onClick={() => setSelectedQty(prev => ({ ...prev, [pos.id]: Math.min(pos.quantity, (prev[pos.id] ?? 0) + 1) }))}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                            >
                              <span className="text-sm font-bold leading-none">+</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-red-600 tabular-nums">
                              −{fmt(pos.unitPrice * qty)} €
                            </p>
                            <p className="text-xs text-gray-400">{qty}× {fmt(pos.unitPrice)} €</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Storno-Betrag + Zahlungsart */}
              <div className="border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Storno-Betrag</span>
                  <span className="text-base font-bold text-red-600 tabular-nums">−{fmt(stornoAmount)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Zahlungsart</span>
                  <span className="text-sm font-medium text-gray-700">{bon.paymentMethod}</span>
                </div>
              </div>

              {/* Blue info hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-blue-700 mb-0.5">Hinweis</p>
                <p className="text-sm text-blue-600 leading-relaxed">
                  Der Originalbeleg bleibt erhalten. Es wird ein Storno-Folgebeleg erzeugt.
                </p>
              </div>

              {hinweise && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Ihre Anmerkung</p>
                  <p className="text-sm text-gray-700">{hinweise}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t shrink-0 space-y-2">
              <Button
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-xl gap-2"
                disabled={!canConfirm}
                onClick={() => {
                  const num = `STO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
                  setFolgebelegNumber(num)
                  setStep('done')
                }}
              >
                <Ban className="w-5 h-5" />
                Verbindlich stornieren
              </Button>
              <button
                onClick={() => setStep('grund')}
                className="w-full h-10 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Zurück
              </button>
            </div>
          </>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <>
            {/* Minimal header — no stepper */}
            <div className="px-5 pt-5 pb-4 border-b shrink-0">
              <div className="flex items-start gap-3">
                <button onClick={handleClose} className="mt-0.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900">Storno</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{bon.bonNumber}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 py-8 gap-5">
              {/* Success icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Storno erstellt</h2>
                <p className="text-sm text-gray-500 mt-1">Der Vorgang wurde erfolgreich angelegt.</p>
              </div>

              {/* Info card */}
              <div className="w-full border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Folgebeleg</span>
                  <span className="text-sm font-bold text-gray-900">{folgebelegNumber}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Typ</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stornoType === 'komplett' ? 'Komplettstorno' : 'Teilstorno'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Betrag</span>
                  <span className="text-sm font-bold text-red-600 tabular-nums">−{fmt(stornoAmount)} €</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Erstattungsstatus</span>
                  <span className="text-sm font-semibold text-blue-600">Simuliert</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Zahlungsrückabwicklung wird vom Backend verarbeitet.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="px-5 py-4 border-t shrink-0 space-y-2">
              <Button className="w-full h-12 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold text-base rounded-xl gap-2">
                <FileText className="w-5 h-5" />
                Folgebeleg ansehen
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-[#61A175] border-[#61A175] hover:bg-[#61A175]/10 font-semibold text-base rounded-xl"
                onClick={onCloseAll ?? handleClose}
              >
                Zurück zum POS
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
