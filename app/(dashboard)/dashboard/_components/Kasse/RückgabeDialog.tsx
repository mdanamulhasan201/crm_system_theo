'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, ArrowLeft, ChevronDown, ChevronUp, Check, FileText, Info, AlertTriangle } from 'lucide-react'
import type { Bon } from './BelegSuchenDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

type RückgabeType    = 'komplett' | 'teilweise' | null
type RückgabeGrund   = 'Passt nicht' | 'Falsche Größe' | 'Unzufrieden' | 'Widerruf' | 'Kulanz' | 'Defekt' | 'Sonstiges'
type PositionZustand = 'Wiederverkaufbar' | 'Beschädigt' | 'Defekt' | 'Hygienisch ausgeschlossen' | 'Nicht rücknahmefähig'
type RückgabeStep    = 'art' | 'grund' | 'zustand' | 'erstattung' | 'bestaetigung' | 'done'

const STEPS: { id: RückgabeStep; label: string }[] = [
  { id: 'art',          label: 'Art'         },
  { id: 'grund',        label: 'Grund'       },
  { id: 'zustand',      label: 'Zustand'     },
  { id: 'erstattung',   label: 'Erstattung'  },
  { id: 'bestaetigung', label: 'Bestätigung' },
]

const GRUENDE: RückgabeGrund[] = [
  'Passt nicht', 'Falsche Größe', 'Unzufrieden', 'Widerruf', 'Kulanz', 'Defekt', 'Sonstiges',
]

const ZUSTAENDE: PositionZustand[] = [
  'Wiederverkaufbar', 'Beschädigt', 'Defekt', 'Hygienisch ausgeschlossen', 'Nicht rücknahmefähig',
]

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: RückgabeStep }) {
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
              <div className={`h-1.5 w-full rounded-full transition-colors ${
                isActive || isComplete ? 'bg-orange-500' : 'bg-gray-200'
              }`} />
              <span className={`text-xs font-medium transition-colors ${
                isActive ? 'text-orange-600' : isComplete ? 'text-gray-500' : 'text-gray-400'
              }`}>
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

interface RückgabeDialogProps {
  isOpen: boolean
  onClose: () => void
  onCloseAll?: () => void
  bon: Bon | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RückgabeDialog({ isOpen, onClose, onCloseAll, bon }: RückgabeDialogProps) {
  const [step,               setStep]               = useState<RückgabeStep>('art')
  const [rückgabeType,       setRückgabeType]       = useState<RückgabeType>(null)
  const [selectedGrund,      setSelectedGrund]      = useState<RückgabeGrund | null>(null)
  const [bemerkung,          setBemerkung]          = useState('')
  const [selectedQty,        setSelectedQty]        = useState<Record<string, number>>({})
  const [positionZustand,    setPositionZustand]    = useState<Record<string, PositionZustand | null>>({})
  const [openDropdown,       setOpenDropdown]       = useState<string | null>(null)
  const [selectedErstattung, setSelectedErstattung] = useState<string | null>(null)
  const [rückgabeBelegNum,   setRückgabeBelegNum]   = useState('')

  if (!bon) return null

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('art')
      setRückgabeType(null)
      setSelectedGrund(null)
      setBemerkung('')
      setSelectedQty({})
      setPositionZustand({})
      setOpenDropdown(null)
      setSelectedErstattung(null)
      setRückgabeBelegNum('')
    }, 300)
  }

  const handleBack = () => {
    if (step === 'art')          { handleClose();          return }
    if (step === 'grund')        { setStep('art');         return }
    if (step === 'zustand')      { setStep('grund');       return }
    if (step === 'erstattung')   { setStep('zustand');     return }
    if (step === 'bestaetigung') { setStep('erstattung');  return }
  }

  const handleTypeSelect = (type: RückgabeType) => {
    setRückgabeType(type)
    if (type === 'komplett') {
      const map: Record<string, number> = {}
      bon.positions.forEach(p => { map[p.id] = p.quantity })
      setSelectedQty(map)
    } else {
      setSelectedQty({})
    }
    setStep('grund')
  }

  const rückgabeSumme = bon.positions.reduce(
    (sum, p) => sum + p.unitPrice * (selectedQty[p.id] ?? 0),
    0,
  )

  const activePositions = bon.positions.filter(p => (selectedQty[p.id] ?? 0) > 0)

  const canProceedZustand =
    activePositions.length > 0 &&
    activePositions.every(p => positionZustand[p.id] != null)

  const erstattungOptions = [bon.paymentMethod, 'Keine Erstattung']

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-130 w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Rückgabe {bon.bonNumber}</DialogTitle>

        {/* ── Shared header (all steps except done) ── */}
        {step !== 'done' && (
          <div className="px-5 pt-5 pb-4 shrink-0">
            <div className="flex items-start gap-3 mb-4">
              <button
                onClick={handleBack}
                className="mt-0.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-900">Rückgabe</h2>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{bon.bonNumber}</p>
              </div>
            </div>
            <Stepper current={step} />
          </div>
        )}

        <div className="h-px bg-gray-100 shrink-0" />

        {/* ── Step 1: Art ── */}
        {step === 'art' && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="text-base font-semibold text-orange-500 mb-5">
              Welche Art von Rückgabe möchten Sie erfassen?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleTypeSelect('komplett')}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all active:scale-[0.99]"
              >
                <p className="text-base font-bold text-gray-900 mb-1.5">Komplette Rückgabe</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Alle Artikel werden zurückgenommen. Der gesamte Beleg wird als zurückgegeben markiert.
                </p>
              </button>
              <button
                onClick={() => handleTypeSelect('teilweise')}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all active:scale-[0.99]"
              >
                <p className="text-base font-bold text-gray-900 mb-1.5">Teilweise Rückgabe</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Nur bestimmte Artikel oder Mengen werden zurückgebracht.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Grund ── */}
        {step === 'grund' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-base font-bold text-gray-900 mb-4">Rückgabegrund wählen</p>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {GRUENDE.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrund(g)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                      selectedGrund === g
                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Bemerkung (optional)</p>
                <Textarea
                  placeholder="Zusätzliche Hinweise..."
                  value={bemerkung}
                  onChange={e => setBemerkung(e.target.value)}
                  className="min-h-25 resize-none text-sm bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t shrink-0">
              <Button
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1"
                disabled={!selectedGrund}
                onClick={() => setStep('zustand')}
              >
                Weiter →
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Zustand ── */}
        {step === 'zustand' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              <div className="mb-1">
                <p className="text-base font-bold text-gray-900">Zustand der zurückgebrachten Artikel</p>
                <p className="text-sm text-gray-500 mt-0.5">Bitte den Zustand jeder Position erfassen.</p>
              </div>

              {bon.positions.map(pos => {
                const qty     = selectedQty[pos.id] ?? (rückgabeType === 'komplett' ? pos.quantity : 0)
                const zustand = positionZustand[pos.id] ?? null
                const isOpen  = openDropdown === pos.id

                return (
                  <div key={pos.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">{pos.name}</p>
                        <p className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
                          {fmt(pos.unitPrice * qty)} €
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{pos.description} · SKU: {pos.sku}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Verkauft: {pos.quantity} · Verfügbar: {pos.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() =>
                            setSelectedQty(prev => ({
                              ...prev,
                              [pos.id]: Math.max(0, (prev[pos.id] ?? pos.quantity) - 1),
                            }))
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                          <span className="text-sm font-bold leading-none">−</span>
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                        <button
                          onClick={() =>
                            setSelectedQty(prev => ({
                              ...prev,
                              [pos.id]: Math.min(
                                pos.quantity,
                                (prev[pos.id] ?? (rückgabeType === 'komplett' ? pos.quantity : 0)) + 1,
                              ),
                            }))
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                          <span className="text-sm font-bold leading-none">+</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : pos.id)}
                      className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className={zustand ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                        {zustand ?? 'Zustand wählen...'}
                      </span>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {ZUSTAENDE.map(z => (
                          <button
                            key={z}
                            onClick={() => {
                              setPositionZustand(prev => ({ ...prev, [pos.id]: z }))
                              setOpenDropdown(null)
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-orange-50 ${
                              zustand === z ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'
                            }`}
                          >
                            {z}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-3 bg-orange-50 border-t border-orange-100 shrink-0 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Rückgabe-Summe:</span>
              <span className="text-base font-bold text-orange-600 tabular-nums">−{fmt(rückgabeSumme)} €</span>
            </div>
            <div className="px-5 py-4 border-t shrink-0">
              <Button
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1"
                disabled={!canProceedZustand}
                onClick={() => setStep('erstattung')}
              >
                Weiter →
              </Button>
            </div>
          </>
        )}

        {/* ── Step 4: Erstattung ── */}
        {step === 'erstattung' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-base font-bold text-gray-900 mb-4">Erstattungsart wählen</p>
              <div className="space-y-2.5">
                {erstattungOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedErstattung(opt)}
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 text-sm transition-all ${
                      selectedErstattung === opt
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`font-semibold ${selectedErstattung === opt ? 'text-orange-700' : 'text-gray-900'}`}>
                      {opt === 'Keine Erstattung' ? 'Keine Erstattung' : `Rückerstattung auf ${opt}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {opt === 'Keine Erstattung'
                        ? 'Es erfolgt keine Rückerstattung an den Kunden.'
                        : `Der Betrag wird auf die ursprüngliche Zahlungsart (${opt}) zurückgebucht.`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t shrink-0">
              <Button
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1"
                disabled={!selectedErstattung}
                onClick={() => setStep('bestaetigung')}
              >
                Weiter →
              </Button>
            </div>
          </>
        )}

        {/* ── Step 5: Bestätigung ── */}
        {step === 'bestaetigung' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* Zusammenfassung box */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-sm font-bold text-orange-600">Rückgabe-Zusammenfassung</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Art</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {rückgabeType === 'komplett' ? 'Komplette Rückgabe' : 'Teilweise Rückgabe'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Grund</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedGrund}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Erstattung</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedErstattung === 'Keine Erstattung' ? 'Keine Erstattung' : selectedErstattung}
                  </span>
                </div>
              </div>

              {/* Positions */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Zurückgegebene Positionen</p>
                <div className="space-y-2">
                  {activePositions.map(pos => {
                    const qty = selectedQty[pos.id] ?? pos.quantity
                    return (
                      <div key={pos.id} className="border border-gray-200 rounded-xl px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">{pos.name}</p>
                          <p className="text-sm font-bold text-orange-600 tabular-nums shrink-0">
                            −{fmt(pos.unitPrice * qty)} €
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {pos.description} · {qty}× {fmt(pos.unitPrice)} €
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Zustand: {positionZustand[pos.id]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rückgabe-Betrag */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">Rückgabe-Betrag</span>
                <span className="text-base font-bold text-orange-600 tabular-nums">−{fmt(rückgabeSumme)} €</span>
              </div>

              {/* Hinweis */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-sm font-semibold text-blue-700">Hinweis</p>
                </div>
                <p className="text-sm text-blue-600 leading-relaxed">
                  Der Originalbeleg bleibt bestehen. Es wird ein Rückgabe-Folgebeleg erzeugt.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t shrink-0 space-y-2">
              <Button
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base rounded-xl gap-2"
                onClick={() => {
                  const num = `RUE-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
                  setRückgabeBelegNum(num)
                  setStep('done')
                }}
              >
                <RefreshCw className="w-5 h-5" />
                Rückgabe verbindlich erfassen
              </Button>
              <button
                onClick={() => setStep('erstattung')}
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
                <button
                  onClick={handleClose}
                  className="mt-0.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-gray-900">Rückgabe</h2>
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
                <h2 className="text-xl font-bold text-gray-900">Rückgabe erfasst</h2>
                <p className="text-sm text-gray-500 mt-1">Der Rückgabevorgang wurde erfolgreich angelegt.</p>
              </div>

              {/* Info card */}
              <div className="w-full border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Rückgabe-Beleg</span>
                  <span className="text-sm font-bold text-gray-900">{rückgabeBelegNum}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Typ</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {rückgabeType === 'komplett' ? 'Komplette Rückgabe' : 'Teilweise Rückgabe'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Betrag</span>
                  <span className="text-sm font-bold text-orange-600 tabular-nums">−{fmt(rückgabeSumme)} €</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Erstattung</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedErstattung}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-semibold text-blue-600">Simuliert</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-5 py-4 border-t shrink-0 space-y-2">
              <Button className="w-full h-12 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold text-base rounded-xl gap-2">
                <FileText className="w-5 h-5" />
                Rückgabe-Beleg ansehen
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
