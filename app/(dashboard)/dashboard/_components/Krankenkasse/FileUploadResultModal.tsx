'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, FileText, AlertTriangle } from 'lucide-react'
import type { ValidateChangelogResponse } from '@/apis/krankenkasseApis'

interface FileUploadResultModalProps {
    open: boolean
    onClose: () => void
    data: ValidateChangelogResponse | null
}

function formatProblemField(path: string): string {
    return path
        .replace(/\./g, ' → ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim()
}

export default function FileUploadResultModal({
    open,
    onClose,
    data,
}: FileUploadResultModalProps) {
    if (!data) return null

    const { matched, partialMatched } = data
    const fullCount = matched.length
    const partialCount = partialMatched.length

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl sm:max-w-2xl [&>button]:right-4 [&>button]:top-4">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="size-5 text-[#61A175]" />
                        Abgleichsergebnis
                    </DialogTitle>
                    <p className="text-sm text-gray-500 font-normal">
                        Auswertung aus dem hochgeladenen Dokument (KI-Extraktion).
                    </p>
                </DialogHeader>

                <div className="flex flex-wrap gap-3 shrink-0">
                    <div className="flex-1 min-w-[140px] rounded-lg border border-green-200 bg-green-50/80 px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                        <div className="min-w-0">
                            <span className="text-xs text-gray-600 block">Vollständig</span>
                            <span className="text-sm font-bold text-green-800">{fullCount}</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[140px] rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                        <div className="min-w-0">
                            <span className="text-xs text-gray-600 block">Teilweise</span>
                            <span className="text-sm font-bold text-amber-900">{partialCount}</span>
                        </div>
                    </div>
                </div>

                {partialMatched.length > 0 && (
                    <div className="min-h-0 flex flex-col">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="size-3.5 text-amber-600" />
                            Teilweise übereinstimmend ({partialMatched.length})
                        </h4>
                        <ul className="space-y-2 overflow-y-auto pr-1 border border-amber-100 rounded-lg bg-amber-50/30 p-2 max-h-48">
                            {partialMatched.map((order) => (
                                <li
                                    key={order.id}
                                    className="rounded-lg border border-amber-200/80 bg-white p-2.5 text-xs"
                                >
                                    <div className="font-medium text-gray-900">
                                        #{order.orderNumber} · {order.customer?.vorname}{' '}
                                        {order.customer?.nachname}
                                    </div>
                                    {order.prescription?.insurance_provider && (
                                        <p className="text-gray-600 mt-0.5">
                                            {order.prescription.insurance_provider}
                                        </p>
                                    )}
                                    {order.problemFields?.length ? (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {order.problemFields.map((f) => (
                                                <span
                                                    key={f}
                                                    className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900"
                                                >
                                                    {formatProblemField(f)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {matched.length > 0 && (
                    <div className="min-h-0 flex flex-col">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="size-3.5 text-green-600" />
                            Vollständig übereinstimmend ({matched.length})
                        </h4>
                        <ul className="space-y-2 overflow-y-auto pr-1 border border-green-100 rounded-lg bg-green-50/30 p-2 max-h-48">
                            {matched.map((order) => (
                                <li
                                    key={order.id}
                                    className="rounded-lg border border-green-100 bg-white p-2.5 text-xs text-gray-700"
                                >
                                    <div className="font-medium text-gray-900">
                                        #{order.orderNumber} · {order.customer?.vorname}{' '}
                                        {order.customer?.nachname}
                                    </div>
                                    {order.prescription?.insurance_provider && (
                                        <p className="text-gray-600 mt-0.5">
                                            {order.prescription.insurance_provider}
                                            {order.prescription.medical_diagnosis
                                                ? ` · ${order.prescription.medical_diagnosis}`
                                                : ''}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {matched.length === 0 && partialMatched.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">
                        Keine Aufträge in dieser Antwort — bitte Dokument oder Daten prüfen.
                    </p>
                )}

                <div className="shrink-0 flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-[#61A175] px-4 py-2 text-sm font-medium text-white hover:bg-[#61A175]/90"
                    >
                        Schließen
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
