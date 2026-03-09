'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getHalbprobenerstellungCheckliste, updateHalbprobenerstellungCheckliste } from '@/apis/LeistenkonfiguratorManagementApis'
import toast from 'react-hot-toast'

const CHECKLIST_QUESTIONS = [
    { id: 'ferse_stabil', label: 'Ist die Ferse stabil ohne zu rutschen?' },
    { id: 'platz_vorfuss', label: 'Gibt es genügend Platz im Vorfuß- und Zehenbereich?' },
    { id: 'rist_angenehm', label: 'Liegt der Rist angenehm an, ohne Druck oder Spiel?' },
    { id: 'fussgewolbe', label: 'Ist die Fußgewölbeunterstützung korrekt (nicht zu stark, nicht zu schwach)?' },
    { id: 'weite_ballen', label: 'Passt die Weite im Ballen-/Zehenbereich ohne Druckstellen?' },
    { id: 'sitz_bequem', label: 'Empfindet der Kunde den Sitz als bequem?' },
    { id: 'anpassungen', label: 'Müssen Anpassungen vorgenommen werden?' },
] as const

export type ChecklistAnswer = 'Ja' | 'Nein' | null
export type ChecklistState = Record<string, { answer: ChecklistAnswer; details: string }>

/** All questions unselected - used when API returns checkliste_halbprobe: null */
const emptyChecklist = (): ChecklistState =>
    Object.fromEntries(
        CHECKLIST_QUESTIONS.map((q) => [q.id, { answer: null, details: '' }])
    )

interface HalbprobenerstellungModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string | null
    onSuccess?: () => void
}

export default function HalbprobenerstellungModal({
    isOpen,
    onClose,
    orderId,
    onSuccess,
}: HalbprobenerstellungModalProps) {
    const [checklist, setChecklist] = useState<ChecklistState>(emptyChecklist())
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const loadChecklist = useCallback(async () => {
        if (!orderId) return
        setLoading(true)
        setFetchError(null)
        try {
            const res = await getHalbprobenerstellungCheckliste(orderId)
            // API response: { success, message, data: { checkliste_halbprobe: { ferse_stabil: { answer, details }, ... } } }
            const inner = res?.data ?? res
            const halbprobe = (inner && typeof inner === 'object')
                ? (inner.checkliste_halbprobe ?? inner.checklisteHalbprobe)
                : null

            if (halbprobe == null || typeof halbprobe !== 'object') {
                setChecklist(emptyChecklist())
                return
            }

            const next = emptyChecklist()
            CHECKLIST_QUESTIONS.forEach((q) => {
                const item = halbprobe[q.id] ?? halbprobe[q.id.replace(/_/g, '-')]
                if (item && typeof item === 'object') {
                    const answer = item.answer === 'Nein' ? 'Nein' : item.answer === 'Ja' ? 'Ja' : null
                    const details = typeof item.details === 'string' ? item.details : ''
                    next[q.id] = { answer: answer ?? null, details }
                }
            })
            setChecklist(next)
        } catch (err: unknown) {
            setFetchError('Checkliste konnte nicht geladen werden.')
            setChecklist(emptyChecklist())
        } finally {
            setLoading(false)
        }
    }, [orderId])

    useEffect(() => {
        if (isOpen && orderId) {
            loadChecklist()
        }
    }, [isOpen, orderId, loadChecklist])

    const handleChange = (questionId: string, answer: 'Ja' | 'Nein', details: string = '') => {
        setChecklist((prev) => ({
            ...prev,
            [questionId]: { answer, details },
        }))
    }

    const handleSubmit = async () => {
        if (!orderId) return
        setSaving(true)
        try {
            await updateHalbprobenerstellungCheckliste(orderId, checklist)
            toast.success('Checkliste gespeichert')
            onSuccess?.()
            onClose()
        } catch (err: unknown) {
            toast.error('Speichern fehlgeschlagen')
        } finally {
            setSaving(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col print:shadow-none print:border-0">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl font-bold">Checkliste Halbprobe</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Überprüfen Sie während der Anprobe die wichtigsten Punkte zur Stabilität und zum Komfort und
                        notieren Sie eventuelle Änderungswünsche.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-gray-500">Laden...</div>
                ) : (
                    <div className="space-y-6 py-2 overflow-y-auto flex-1 min-h-0 max-h-[70vh] pr-1">
                        {fetchError && (
                            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                {fetchError}
                            </p>
                        )}
                        {CHECKLIST_QUESTIONS.map((q) => (
                            <div key={q.id} className="space-y-2">
                                <p className="text-sm font-medium text-gray-800">{q.label}</p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            checked={checklist[q.id]?.answer === 'Ja'}
                                            onChange={() => handleChange(q.id, 'Ja', '')}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm">Ja</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            checked={checklist[q.id]?.answer === 'Nein'}
                                            onChange={() => handleChange(q.id, 'Nein', '')}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm">Nein, bitte detailliert angeben</span>
                                    </label>
                                </div>
                                {checklist[q.id]?.answer === 'Nein' && (
                                    <textarea
                                        placeholder="Details angeben..."
                                        value={checklist[q.id]?.details ?? ''}
                                        onChange={(e) => handleChange(q.id, 'Nein', e.target.value)}
                                        className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        rows={2}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter className="flex flex-row items-center justify-between sm:justify-end gap-2 print:hidden shrink-0 pt-2 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="cursor-pointer">
                        Abbrechen
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || saving}
                            className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white"
                        >
                            Weiter
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={handlePrint} title="Drucken">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
