'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    getAllKrankenkassePrescription,
    manageKrankenkassePrescription,
    type KrankenkassePrescriptionListItem,
} from '@/apis/krankenkasseApis'

const PER_PAGE = 5

function formatPrescriptionDate(iso: string): string {
    if (!iso) return '–'
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
}

interface UpdateDataListProps {
    isOpen: boolean
    onClose: () => void
    customerId: string
    orderId: string
    type: string
    onSuccess: (prescription: KrankenkassePrescriptionListItem) => void
}

export default function UpdateDataList({
    isOpen,
    onClose,
    customerId,
    orderId,
    type,
    onSuccess,
}: UpdateDataListProps) {
    const [list, setList] = useState<KrankenkassePrescriptionListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [cursor, setCursor] = useState('')
    const [hasMore, setHasMore] = useState(false)
    const [linkingId, setLinkingId] = useState<string | null>(null)

    const fetchPrescriptions = useCallback(
        (cursorValue: string, append: boolean) => {
            if (!customerId) return
            const setLoad = append ? setLoadingMore : setLoading
            setLoad(true)
            getAllKrankenkassePrescription(customerId, true, PER_PAGE, cursorValue)
                .then((res) => {
                    const items = res?.data ?? []
                    setList((prev) => (append ? [...prev, ...items] : items))
                    setHasMore(res?.hasMore ?? false)
                    const last = items[items.length - 1]
                    setCursor(last?.id ?? '')
                })
                .catch(() => {
                    if (!append) setList([])
                    toast.error('Rezepte konnten nicht geladen werden.')
                })
                .finally(() => setLoad(false))
        },
        [customerId]
    )

    useEffect(() => {
        if (isOpen && customerId) {
            setList([])
            setCursor('')
            setHasMore(false)
            fetchPrescriptions('', false)
        }
    }, [isOpen, customerId, fetchPrescriptions])

    const loadMore = () => {
        if (loadingMore || !hasMore || !cursor) return
        fetchPrescriptions(cursor, true)
    }

    const handleSelectPrescription = async (prescriptionId: string) => {
        setLinkingId(prescriptionId)
        try {
            const res = await manageKrankenkassePrescription(type, orderId, prescriptionId)
            const selected = list.find((p) => p.id === prescriptionId)
            if (res?.success && selected) {
                toast.success(res?.message ?? 'Rezept erfolgreich verknüpft.')
                onSuccess(selected)
                onClose()
            } else if (!res?.success) {
                toast.error(res?.message ?? 'Verknüpfung fehlgeschlagen.')
            }
        } catch {
            toast.error('Verknüpfung fehlgeschlagen.')
        } finally {
            setLinkingId(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Rezeptdaten aktualisieren
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-500 -mt-2">
                    Rezept auswählen, um es mit diesem Auftrag zu verknüpfen.
                </p>
                <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg border-gray-200 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Loader2 className="size-8 animate-spin text-gray-400 mb-2" />
                            <p className="text-sm">Laden...</p>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <FileText className="size-8 text-gray-300 mb-2" />
                            <p className="text-sm">Keine Rezepte gefunden</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {list.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPrescription(item.id)}
                                        disabled={!!linkingId}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {item.insurance_provider}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {item.medical_diagnosis}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Rezeptdatum: {formatPrescriptionDate(item.prescription_date)}
                                                    {item.validity_weeks ? ` · Gültigkeit: ${item.validity_weeks} Wo.` : ''}
                                                </p>
                                            </div>
                                            {linkingId === item.id ? (
                                                <Loader2 className="size-5 shrink-0 animate-spin text-gray-500" />
                                            ) : null}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!loading && hasMore && list.length > 0 && (
                        <div className="p-3 border-t border-gray-200 flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="cursor-pointer"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        Laden...
                                    </>
                                ) : (
                                    'Weitere laden'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
