'use client'

import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getSingleRecipe } from '@/apis/rezepteApis'
import type { Prescription } from '@/apis/rezepteApis'
import { Loader2, Shield, User, FileText, Stethoscope, Calendar, ImageIcon } from 'lucide-react'

function formatDateDE(iso?: string): string {
    if (!iso) return '–'
    try {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return iso
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const year = d.getFullYear()
        return `${day}.${month}.${year}`
    } catch {
        return iso
    }
}

function formatValue(value: unknown, key: keyof Prescription): string {
    if (value == null || value === '') return '–'
    if (key === 'prescription_date' || key === 'createdAt') {
        return formatDateDE(String(value))
    }
    if (key === 'is_work_accident') return value ? 'Ja' : 'Nein'
    if (key === 'validity_weeks' && typeof value === 'number') return `${value}`
    return String(value)
}

/** Section: title + rows of label/value */
function DetailSection({
    title,
    icon: Icon,
    rows,
}: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    rows: { label: string; value: string }[]
}) {
    const hasContent = rows.some((r) => r.value !== '–')
    if (!hasContent) return null
    return (
        <div className='rounded-xl border border-gray-200 bg-gray-50/80 p-4'>
            <div className='flex items-center gap-2 mb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#61A07B]/15 text-[#61A07B]'>
                    <Icon className='h-4 w-4' />
                </div>
                <h3 className='text-sm font-semibold text-gray-800'>{title}</h3>
            </div>
            <dl className='grid gap-2 sm:grid-cols-2'>
                {rows.map(({ label, value }) =>
                    value === '–' ? null : (
                        <div key={label} className='flex flex-col gap-0.5'>
                            <dt className='text-xs font-medium uppercase tracking-wide text-gray-500'>
                                {label}
                            </dt>
                            <dd className='text-sm font-medium text-gray-900'>{value}</dd>
                        </div>
                    )
                )}
            </dl>
        </div>
    )
}

interface RezepteDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    recipeId: string | null
}

export default function RezepteDetailsModal({
    open,
    onOpenChange,
    recipeId,
}: RezepteDetailsModalProps) {
    const [data, setData] = useState<Prescription | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open || !recipeId) {
            setData(null)
            setError(null)
            return
        }
        let cancelled = false
        setLoading(true)
        setError(null)
        getSingleRecipe(recipeId)
            .then((res) => {
                if (!cancelled) {
                    setData(res.data)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Details konnten nicht geladen werden.')
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [open, recipeId])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='font-sans max-h-[90vh] overflow-y-auto sm:max-w-xl'>
                <DialogHeader>
                    <DialogTitle className='text-xl font-semibold text-gray-900'>
                        Rezept-Details
                    </DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='h-8 w-8 animate-spin text-[#61A07B]' />
                    </div>
                )}

                {error && (
                    <p className='text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md'>
                        {error}
                    </p>
                )}

                {!loading && !error && data && (
                    <div className='space-y-4 pt-2'>
                        {/* Image Section — view only */}
                        {data.image && (
                            <div className='rounded-xl border border-gray-200 bg-gray-50/80 p-4'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#61A07B]/15 text-[#61A07B]'>
                                        <ImageIcon className='h-4 w-4' />
                                    </div>
                                    <h3 className='text-sm font-semibold text-gray-800'>Rezeptbild</h3>
                                </div>
                                <div className='rounded-lg border border-gray-200 overflow-hidden'>
                                    <img
                                        src={data.image}
                                        alt='Rezeptbild'
                                        className='w-full max-h-60 object-contain bg-white'
                                    />
                                </div>
                            </div>
                        )}

                        <DetailSection
                            title='Versicherung'
                            icon={Shield}
                            rows={[
                                { label: 'Versicherung', value: formatValue(data.insurance_provider, 'insurance_provider') },
                                { label: 'Versicherungsnummer', value: formatValue(data.insurance_number, 'insurance_number') },
                            ]}
                        />
                        <DetailSection
                            title='Rezept & Nummern'
                            icon={FileText}
                            rows={[
                                { label: 'Rezeptdatum', value: formatValue(data.prescription_date, 'prescription_date') },
                                { label: 'Rezeptnummer', value: formatValue(data.prescription_number, 'prescription_number') },
                                { label: 'PeNr.', value: formatValue(data.proved_number, 'proved_number') },
                                { label: 'Rezeptnummer (Referenz)', value: formatValue(data.referencen_number, 'referencen_number') },
                                { label: 'Gültigkeit', value: data.validity_weeks != null ? `${data.validity_weeks} Wochen` : '–' },
                            ]}
                        />
                        <DetailSection
                            title='Arzt & Betrieb'
                            icon={Stethoscope}
                            rows={[
                                { label: 'Arzt Name', value: formatValue(data.doctor_name, 'doctor_name') },
                                { label: 'Arzt Ort', value: formatValue(data.doctor_location, 'doctor_location') },
                                { label: 'Betriebsnummer', value: formatValue(data.establishment_number, 'establishment_number') },
                            ]}
                        />
                        <DetailSection
                            title='Diagnose & Einreichung'
                            icon={User}
                            rows={[
                                { label: 'Diagnose', value: formatValue(data.medical_diagnosis, 'medical_diagnosis') },
                                { label: 'Art der Einreichung', value: formatValue(data.type_of_deposit, 'type_of_deposit') },
                                { label: 'Kostenträger ID', value: formatValue(data.cost_bearer_id, 'cost_bearer_id') },
                                { label: 'Statusnummer', value: formatValue(data.status_number, 'status_number') },
                                { label: 'Hilfsmittelcode', value: formatValue(data.aid_code, 'aid_code') },
                                { label: 'Arbeitsunfall', value: formatValue(data.is_work_accident, 'is_work_accident') },
                            ]}
                        />
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <Calendar className='h-3.5 w-3.5 shrink-0' />
                            <span>Erstellt am {formatValue(data.createdAt, 'createdAt')}</span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
