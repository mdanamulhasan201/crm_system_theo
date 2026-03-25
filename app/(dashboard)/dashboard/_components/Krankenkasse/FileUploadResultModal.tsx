'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, FileText, AlertTriangle, ChevronDown, ChevronUp, User, Stethoscope, ShoppingBag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { approvedKrankenkasseData } from '@/apis/krankenkasseApis'
import type { ValidateChangelogResponse, InsuranceChangelogMatchOrder, InsuranceChangelogPartialOrder } from '@/apis/krankenkasseApis'

interface FileUploadResultModalProps {
    open: boolean
    onClose: () => void
    data: ValidateChangelogResponse | null
    onApproved?: () => void
}

function isProblem(problemFields: string[], key: string): boolean {
    return problemFields.includes(key)
}

function fmt(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nein'
    return String(value)
}

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtCurrency(val: number | null | undefined): string {
    if (val === null || val === undefined) return '—'
    return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

interface FieldRowProps {
    label: string
    value: string
    problem?: boolean
}

function FieldRow({ label, value, problem }: FieldRowProps) {
    return (
        <div className={cn(
            'flex items-start justify-between gap-3 py-1.5 px-2 rounded-md text-xs',
            problem ? 'bg-red-50 ring-1 ring-red-200' : 'bg-transparent'
        )}>
            <span className={cn('text-gray-500 shrink-0 w-40', problem && 'text-red-600 font-medium')}>{label}</span>
            <span className={cn('text-gray-900 text-right font-medium break-all', problem && 'text-red-700')}>{value}</span>
            {problem && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 ml-1">
                    ⚠ Problem
                </span>
            )}
        </div>
    )
}

type AnyOrder = InsuranceChangelogMatchOrder | InsuranceChangelogPartialOrder

function isPartial(order: AnyOrder): order is InsuranceChangelogPartialOrder {
    return 'problemFields' in order
}

interface OrderCardProps {
    order: AnyOrder
    variant: 'matched' | 'partial'
}

function OrderCard({ order, variant }: OrderCardProps) {
    const [expanded, setExpanded] = useState(true)
    const problemFields: string[] = isPartial(order) ? order.problemFields ?? [] : []
    const { prescription: rx, customer } = order

    return (
        <div className={cn(
            'rounded-xl border bg-white overflow-hidden shadow-sm',
            variant === 'partial' ? 'border-red-200' : 'border-green-200'
        )}>
            {/* Header */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-gray-50/70 transition-colors"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                        'shrink-0 inline-flex size-6 items-center justify-center rounded-full text-white text-[10px] font-bold',
                        variant === 'partial' ? 'bg-red-500' : 'bg-green-500'
                    )}>
                        {variant === 'partial' ? '!' : '✓'}
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            Auftrag #{order.orderNumber}
                            <span className="ml-2 text-xs font-normal text-gray-500">· {order.insuranceType}</span>
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {customer?.vorname} {customer?.nachname}
                            {customer?.telefon ? ` · ${customer.telefon}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {problemFields.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            <AlertTriangle className="size-2.5" />
                            {problemFields.length} Problem{problemFields.length > 1 ? 'e' : ''}
                        </span>
                    )}
                    {expanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-4">
                    {/* Order */}
                    <section>
                        <h5 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                            <ShoppingBag className="size-3" /> Auftrag
                        </h5>
                        <div className="space-y-0.5">
                            <FieldRow label="Auftragsnummer" value={fmt(order.orderNumber)} />
                            <FieldRow label="Zahlungsart" value={fmt(order.paymnentType)} />
                            <FieldRow
                                label="Gesamtpreis"
                                value={fmtCurrency(order.totalPrice)}
                                problem={isProblem(problemFields, 'totalPrice')}
                            />
                            <FieldRow
                                label="KV-Betrag"
                                value={fmtCurrency(order.insuranceTotalPrice)}
                                problem={isProblem(problemFields, 'insuranceTotalPrice')}
                            />
                            <FieldRow label="Versicherungsstatus" value={fmt(order.insurance_status)} />
                            <FieldRow label="MwSt.-Satz" value={order.vatRate !== undefined ? `${order.vatRate} %` : '—'} />
                            <FieldRow label="Erstellt am" value={fmtDate(order.createdAt)} />
                            <FieldRow
                                label="Privat bezahlt"
                                value={fmt(order.private_payed)}
                                problem={isProblem(problemFields, 'private_payed')}
                            />
                        </div>
                    </section>

                    {/* Customer */}
                    {customer && (
                        <section>
                            <h5 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                <User className="size-3" /> Kunde
                            </h5>
                            <div className="space-y-0.5">
                                <FieldRow
                                    label="Vorname"
                                    value={fmt(customer.vorname)}
                                    problem={isProblem(problemFields, 'customer.vorname')}
                                />
                                <FieldRow
                                    label="Nachname"
                                    value={fmt(customer.nachname)}
                                    problem={isProblem(problemFields, 'customer.nachname')}
                                />
                                <FieldRow
                                    label="Telefon"
                                    value={fmt(customer.telefon)}
                                    problem={isProblem(problemFields, 'customer.telefon')}
                                />
                            </div>
                        </section>
                    )}

                    {/* Prescription */}
                    {rx && (
                        <section>
                            <h5 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                                <Stethoscope className="size-3" /> Rezept
                            </h5>
                            <div className="space-y-0.5">
                                <FieldRow
                                    label="Krankenkasse"
                                    value={fmt(rx.insurance_provider)}
                                    problem={isProblem(problemFields, 'prescription.insurance_provider')}
                                />
                                <FieldRow
                                    label="KV-Nummer"
                                    value={fmt((rx as { insurance_number?: string | null }).insurance_number)}
                                    problem={isProblem(problemFields, 'prescription.insurance_number')}
                                />
                                <FieldRow
                                    label="Rezept-Datum"
                                    value={fmtDate(rx.prescription_date)}
                                    problem={isProblem(problemFields, 'prescription.prescription_date')}
                                />
                                <FieldRow
                                    label="Arzt"
                                    value={fmt(rx.doctor_name)}
                                    problem={isProblem(problemFields, 'prescription.doctor_name')}
                                />
                                <FieldRow
                                    label="Arztort"
                                    value={fmt(rx.doctor_location)}
                                    problem={isProblem(problemFields, 'prescription.doctor_location')}
                                />
                                <FieldRow
                                    label="Rezept-Nr."
                                    value={fmt(rx.prescription_number)}
                                    problem={isProblem(problemFields, 'prescription.prescription_number')}
                                />
                                <FieldRow
                                    label="Betriebsstätten-Nr."
                                    value={fmt(rx.establishment_number)}
                                    problem={isProblem(problemFields, 'prescription.establishment_number')}
                                />
                                <FieldRow
                                    label="Geprüfte Nr."
                                    value={fmt(rx.proved_number)}
                                    problem={isProblem(problemFields, 'prescription.proved_number')}
                                />
                                <FieldRow
                                    label="Referenz-Nr."
                                    value={fmt(rx.referencen_number)}
                                    problem={isProblem(problemFields, 'prescription.referencen_number')}
                                />
                                <FieldRow
                                    label="Diagnose"
                                    value={fmt(rx.medical_diagnosis)}
                                    problem={isProblem(problemFields, 'prescription.medical_diagnosis')}
                                />
                                <FieldRow
                                    label="Einlagentyp"
                                    value={fmt((rx as { type_of_deposit?: string | null }).type_of_deposit)}
                                    problem={isProblem(problemFields, 'prescription.type_of_deposit')}
                                />
                                <FieldRow
                                    label="Gültigkeit (Wochen)"
                                    value={fmt(rx.validity_weeks)}
                                    problem={isProblem(problemFields, 'prescription.validity_weeks')}
                                />
                                <FieldRow
                                    label="Kostenträger-ID"
                                    value={fmt((rx as { cost_bearer_id?: string | null }).cost_bearer_id)}
                                    problem={isProblem(problemFields, 'prescription.cost_bearer_id')}
                                />
                                <FieldRow
                                    label="Status-Nr."
                                    value={fmt((rx as { status_number?: string | null }).status_number)}
                                    problem={isProblem(problemFields, 'prescription.status_number')}
                                />
                                <FieldRow
                                    label="Hilfsmittelkennzeichen"
                                    value={fmt(rx.aid_code)}
                                    problem={isProblem(problemFields, 'prescription.aid_code')}
                                />
                                <FieldRow
                                    label="Arbeitsunfall"
                                    value={fmt((rx as { is_work_accident?: boolean }).is_work_accident)}
                                    problem={isProblem(problemFields, 'prescription.is_work_accident')}
                                />
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
}

export default function FileUploadResultModal({
    open,
    onClose,
    data,
    onApproved,
}: FileUploadResultModalProps) {
    const [approving, setApproving] = useState(false)

    if (!data) return null

    const { matched, partialMatched } = data

    const handleApprove = async () => {
        const approvedIds = matched.map((o) => ({ id: o.id, type: o.insuranceType }))
        const rejectedIds = partialMatched.map((o) => ({ id: o.id, type: o.insuranceType }))
        setApproving(true)
        try {
            await approvedKrankenkasseData(approvedIds, rejectedIds)
            toast.success('Erfolgreich gespeichert!')
            onClose()
            onApproved?.()
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Fehler beim Speichern.'
            toast.error(msg)
        } finally {
            setApproving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[88vh] overflow-hidden flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl sm:max-w-2xl [&>button]:right-4 [&>button]:top-4">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="size-5 text-[#61A175]" />
                        Abgleichsergebnis
                    </DialogTitle>
                    <p className="text-sm text-gray-500 font-normal">
                        KI-Auswertung aus dem hochgeladenen Dokument.
                    </p>
                </DialogHeader>

                {/* Summary */}
                <div className="flex flex-wrap gap-3 shrink-0">
                    <div className="flex-1 min-w-[140px] rounded-lg border border-green-200 bg-green-50 px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                        <div>
                            <span className="text-[10px] text-gray-500 block uppercase tracking-wide">Vollständig</span>
                            <span className="text-sm font-bold text-green-800">{matched.length}</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[140px] rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-center gap-2">
                        <AlertTriangle className="size-4 text-red-500 shrink-0" />
                        <div>
                            <span className="text-[10px] text-gray-500 block uppercase tracking-wide">Teilweise</span>
                            <span className="text-sm font-bold text-red-700">{partialMatched.length}</span>
                        </div>
                    </div>
                </div>

                {/* Lists */}
                <div className="min-h-0 overflow-y-auto space-y-3 pr-1">
                    {partialMatched.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                <AlertTriangle className="size-3.5 text-red-500" />
                                Teilweise übereinstimmend ({partialMatched.length})
                            </h4>
                            <div className="space-y-3">
                                {partialMatched.map((order) => (
                                    <OrderCard key={order.id} order={order} variant="partial" />
                                ))}
                            </div>
                        </div>
                    )}

                    {matched.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                <CheckCircle2 className="size-3.5 text-green-600" />
                                Vollständig übereinstimmend ({matched.length})
                            </h4>
                            <div className="space-y-3">
                                {matched.map((order) => (
                                    <OrderCard key={order.id} order={order} variant="matched" />
                                ))}
                            </div>
                        </div>
                    )}

                    {matched.length === 0 && partialMatched.length === 0 && (
                        <p className="text-sm text-gray-500 py-4 text-center">
                            Keine Aufträge in dieser Antwort — bitte Datei oder Daten prüfen.
                        </p>
                    )}
                </div>

                <div className="shrink-0 flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 leading-snug">
                        <span className="font-medium text-green-700">{matched.length} vollständig</span>
                        {' · '}
                        <span className="font-medium text-red-600">{partialMatched.length} teilweise</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={approving}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Schließen
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={approving || (matched.length === 0 && partialMatched.length === 0)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#61A175] px-5 py-2 text-sm font-semibold text-white hover:bg-[#61A175]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {approving ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Wird gespeichert …
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="size-4" />
                                    Speichern
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
