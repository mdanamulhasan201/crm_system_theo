'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react'
import type { ValidateChangelogResponse } from '@/apis/krankenkasseApis'

interface FileUploadResultModalProps {
    open: boolean
    onClose: () => void
    data: ValidateChangelogResponse | null
}

export default function FileUploadResultModal({
    open,
    onClose,
    data,
}: FileUploadResultModalProps) {
    if (!data) return null

    const { message, approved, rejected, summary } = data

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl sm:max-w-lg [&>button]:right-4 [&>button]:top-4">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="size-5 text-[#61A175]" />
                        Validierungsergebnis
                    </DialogTitle>
                </DialogHeader>
                {/* <p className="text-sm text-gray-600 -mt-1 shrink-0">
                    {message}
                </p> */}

                {/* Summary */}
                <div className="flex gap-3 shrink-0">
                    <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Gesamt</span>
                        <span className="text-sm font-bold text-gray-900">{summary.total}</span>
                    </div>
                    <div className="flex-1 rounded-lg border border-green-200 bg-green-50/80 px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                        <span className="text-xs text-gray-600">Genehmigt</span>
                        <span className="text-sm font-bold text-green-700">{summary.approved}</span>
                    </div>
                    <div className="flex-1 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 flex items-center gap-2">
                        <XCircle className="size-4 text-red-600 shrink-0" />
                        <span className="text-xs text-gray-600">Abgelehnt</span>
                        <span className="text-sm font-bold text-red-700">{summary.rejected}</span>
                    </div>
                </div>

                {/* Rejected list */}
                {rejected.length > 0 && (
                    <div className="min-h-0 flex flex-col">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <AlertCircle className="size-3.5" />
                            Abgelehnt ({rejected.length})
                        </h4>
                        <ul className="space-y-2 overflow-y-auto pr-1 border border-gray-200 rounded-lg bg-gray-50/50 p-2">
                            {rejected.map((item, i) => (
                                <li
                                    key={`${item.rowIndex}-${item.orderNumber}-${i}`}
                                    className="rounded-lg border border-red-100 bg-white p-2.5 text-xs"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-medium text-gray-900">
                                            Zeile {item.rowIndex} · Auftrag #{item.orderNumber}
                                        </span>
                                        {item.type && (
                                            <span className="shrink-0 text-gray-500">{item.type}</span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-red-700 font-medium">{item.reason}</p>
                                    <p className="mt-0.5 text-gray-600">{item.message}</p>
                                    {item.excelData && (
                                        <p className="mt-1 text-gray-500">
                                            Excel: Betrag {item.excelData.betrag ?? '–'}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Approved list (compact) */}
                {approved.length > 0 && (
                    <div className="min-h-0 flex flex-col">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="size-3.5 text-green-600" />
                            Genehmigt ({approved.length})
                        </h4>
                        <ul className="space-y-1 overflow-y-auto pr-1 border border-gray-200 rounded-lg bg-gray-50/50 p-2 max-h-32">
                            {approved.map((order) => (
                                <li
                                    key={order.id}
                                    className="text-xs text-gray-700 py-1"
                                >
                                    #{order.orderNumber} · {order.customer?.vorname} {order.customer?.nachname}
                                </li>
                            ))}
                        </ul>
                    </div>
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
