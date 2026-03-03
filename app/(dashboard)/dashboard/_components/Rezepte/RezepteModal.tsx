'use client'

import React, { useState, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    createRecipe,
    updateRecipe,
    type CreateRecipeBody,
    type Prescription,
} from '@/apis/rezepteApis'

function formatDateDE(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0')
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const y = date.getFullYear()
    return `${d}.${m}.${y}`
}

/** dd.mm.yyyy -> ISO string for API */
function rezeptdatumToISO(ddMmYyyy: string): string {
    if (!ddMmYyyy || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(ddMmYyyy.trim()))
        return ''
    const [d, m, y] = ddMmYyyy.trim().split('.').map(Number)
    const date = new Date(y, m - 1, d)
    return isNaN(date.getTime()) ? '' : date.toISOString()
}

/** Parse validity_weeks from "4 Wochen (gesetzlich)" or "6" etc. */
function parseValidityWeeks(gueltigkeit: string): number {
    const trimmed = (gueltigkeit || '').trim()
    const num = parseInt(trimmed, 10)
    if (!Number.isNaN(num)) return num
    const match = trimmed.match(/(\d+)\s*Wochen?/i)
    return match ? parseInt(match[1], 10) : 0
}

/** ISO date -> dd.mm.yyyy */
function isoToDDMMYYYY(iso?: string): string {
    if (!iso) return ''
    try {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return ''
        return formatDateDE(d)
    } catch {
        return ''
    }
}

/** Map Prescription to form state */
function prescriptionToForm(p: Prescription) {
    return {
        kostentraeger: p.insurance_provider ?? '',
        versicherungsnummer: p.insurance_number ?? '',
        rezeptdatum: isoToDDMMYYYY(p.prescription_date) || formatDateDE(new Date()),
        arzt: p.prescription_number ?? '',
        ortArzt: p.doctor_location ?? '',
        arztnummer: p.doctor_name ?? '',
        betriebsstaettennummer: p.establishment_number ?? '',
        diagnose: p.medical_diagnosis ?? '',
        artEinlage: p.type_of_deposit ?? '',
        gueltigkeit: p.validity_weeks != null ? String(p.validity_weeks) : '',
        kostentraegererkennung: p.cost_bearer_id ?? '',
        statusnummer: p.status_number ?? '',
        bvhCode: p.aid_code ?? '',
        arbeitsunfall: !!p.is_work_accident,
    }
}

interface RezepteModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerId: string
    onSuccess?: () => void
    /** When set, modal is in edit mode (prefill + update instead of create) */
    editRecipe?: Prescription | null
}

const initialForm = {
    kostentraeger: '',
    versicherungsnummer: '',
    rezeptdatum: '',
    arzt: '',
    ortArzt: '',
    arztnummer: '',
    betriebsstaettennummer: '',
    diagnose: '',
    artEinlage: '',
    gueltigkeit: '',
    kostentraegererkennung: '',
    statusnummer: '',
    bvhCode: '',
    arbeitsunfall: false,
}

export default function RezepteModal({
    open,
    onOpenChange,
    customerId,
    onSuccess,
    editRecipe = null,
}: RezepteModalProps) {
    const isEdit = !!editRecipe?.id
    const [form, setForm] = useState(() =>
        editRecipe
            ? prescriptionToForm(editRecipe)
            : { ...initialForm, rezeptdatum: formatDateDE(new Date()) }
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const update = useCallback(
        (field: keyof typeof form, value: string | boolean) => {
            setForm((prev) => ({ ...prev, [field]: value }))
            setSubmitError(null)
        },
        []
    )

    const resetForm = useCallback(() => {
        setForm({
            ...initialForm,
            rezeptdatum: formatDateDE(new Date()),
        })
        setSubmitError(null)
    }, [])

    React.useEffect(() => {
        if (!open) return
        if (editRecipe?.id) {
            setForm(prescriptionToForm(editRecipe))
        } else {
            setForm({
                ...initialForm,
                rezeptdatum: formatDateDE(new Date()),
            })
        }
    }, [open, editRecipe])

    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!next) resetForm()
            onOpenChange(next)
        },
        [onOpenChange, resetForm]
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            const body: CreateRecipeBody = {
                customerId,
                insurance_provider: form.kostentraeger,
                insurance_number: form.versicherungsnummer,
                prescription_date: rezeptdatumToISO(form.rezeptdatum),
                prescription_number: form.arzt,
                doctor_location: form.ortArzt,
                doctor_name: form.arztnummer,
                establishment_number: form.betriebsstaettennummer,
                medical_diagnosis: form.diagnose,
                type_of_deposit: form.artEinlage,
                validity_weeks: parseValidityWeeks(form.gueltigkeit),
                cost_bearer_id: form.kostentraegererkennung,
                status_number: form.statusnummer,
                aid_code: form.bvhCode,
                is_work_accident: form.arbeitsunfall,
            }
            if (isEdit && editRecipe?.id) {
                await updateRecipe(editRecipe.id, body)
            } else {
                await createRecipe(body)
            }
            handleOpenChange(false)
            onSuccess?.()
        } catch (err: unknown) {
            const message =
                err && typeof err === 'object' && 'message' in err
                    ? String((err as { message: unknown }).message)
                    : 'Fehler beim Speichern.'
            setSubmitError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const rezeptdatumDate =
        form.rezeptdatum && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(form.rezeptdatum.trim())
            ? (() => {
                  const [d, m, y] = form.rezeptdatum.trim().split('.').map(Number)
                  const date = new Date(y, m - 1, d)
                  return isNaN(date.getTime()) ? undefined : date
              })()
            : undefined

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto font-sans'>
                <DialogHeader>
                    <DialogTitle className='text-xl font-bold tracking-tight text-gray-900 antialiased'>
                        {isEdit ? 'Rezept bearbeiten' : 'Neues Rezept'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-6 pt-2'>
                    {/* Versicherungsdaten */}
                    <div>
                        <h2 className='text-lg font-semibold tracking-tight text-gray-900 mb-4'>
                            Versicherungsdaten
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2 antialiased'>
                                    Kostenträger / Krankenkasse *
                                </label>
                                <Input
                                    value={form.kostentraeger}
                                    onChange={(e) =>
                                        update('kostentraeger', e.target.value)
                                    }
                                    placeholder='AOK Bayern'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2 antialiased'>
                                    Versicherungsnummer
                                </label>
                                <Input
                                    value={form.versicherungsnummer}
                                    onChange={(e) =>
                                        update('versicherungsnummer', e.target.value)
                                    }
                                    placeholder='A123456789'
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rezeptinformationen */}
                    <div>
                        <h2 className='text-lg font-semibold tracking-tight text-gray-900 mb-4'>
                            Rezeptinformationen
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Rezeptdatum
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start gap-2 text-left font-normal h-10',
                                                !form.rezeptdatum && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className='h-4 w-4 shrink-0' />
                                            {form.rezeptdatum ? (
                                                form.rezeptdatum
                                            ) : (
                                                <span>tt.mm.jjjj</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={rezeptdatumDate}
                                            onSelect={(date) => {
                                                if (date) update('rezeptdatum', formatDateDE(date))
                                            }}
                                            initialFocus
                                            captionLayout='dropdown'
                                            fromYear={new Date().getFullYear() - 2}
                                            toYear={new Date().getFullYear() + 5}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Arztinformationen */}
                    <div>
                        <h2 className='text-lg font-semibold tracking-tight text-gray-900 mb-4'>
                            Arztinformationen
                        </h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Arzt
                                </label>
                                <Input
                                    value={form.arzt}
                                    onChange={(e) => update('arzt', e.target.value)}
                                    placeholder='z.B. 123456789'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Ort Arzt
                                </label>
                                <Input
                                    value={form.ortArzt}
                                    onChange={(e) => update('ortArzt', e.target.value)}
                                    placeholder='z.B. Munich'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Arztnummer
                                </label>
                                <Input
                                    value={form.arztnummer}
                                    onChange={(e) => update('arztnummer', e.target.value)}
                                    placeholder='z.B. Dr. Max Mustermann'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Betriebsstättennummer
                                </label>
                                <Input
                                    value={form.betriebsstaettennummer}
                                    onChange={(e) =>
                                        update('betriebsstaettennummer', e.target.value)
                                    }
                                    placeholder='z.B. LANR123456'
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medizinische Daten */}
                    <div>
                        <h2 className='text-lg font-semibold tracking-tight text-gray-900 mb-4'>
                            Medizinische Daten
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Ärztliche Diagnose *
                                </label>
                                <Textarea
                                    value={form.diagnose}
                                    onChange={(e) => update('diagnose', e.target.value)}
                                    placeholder='Plattfuß beidseits, erworbene Fehlstellung'
                                    className='w-full min-h-[80px]'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Art der Einlage
                                </label>
                                <Input
                                    value={form.artEinlage}
                                    onChange={(e) => update('artEinlage', e.target.value)}
                                    placeholder='z.B. Orthopedic insoles'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Gültigkeit des Rezepts (Wochen)
                                </label>
                                <Input
                                    value={form.gueltigkeit}
                                    onChange={(e) => update('gueltigkeit', e.target.value)}
                                    placeholder='z.B. 4 oder 4 Wochen (gesetzlich)'
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kassen- und Statusdaten */}
                    <div>
                        <h2 className='text-lg font-semibold tracking-tight text-gray-900 mb-4'>
                            Kassen- und Statusdaten
                        </h2>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Kostenträgererkennung
                                    </label>
                                    <Input
                                        value={form.kostentraegererkennung}
                                        onChange={(e) =>
                                            update('kostentraegererkennung', e.target.value)
                                        }
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Statusnummer
                                    </label>
                                    <Input
                                        value={form.statusnummer}
                                        onChange={(e) =>
                                            update('statusnummer', e.target.value)
                                        }
                                        className='w-full'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    BVH / Hilfsmittel / Impfstoff / Spr.-Str.-Bedarf / Code
                                </label>
                                <Input
                                    value={form.bvhCode}
                                    onChange={(e) => update('bvhCode', e.target.value)}
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Unfallbezogene Angaben */}
                    <div>
                        <h2 className='text-lg font-semibold tracking-tight text-gray-900 mb-4'>
                            Unfallbezogene Angaben
                        </h2>
                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='arbeitsunfall'
                                checked={form.arbeitsunfall}
                                onChange={(e) =>
                                    update('arbeitsunfall', e.target.checked)
                                }
                            />
                            <label
                                htmlFor='arbeitsunfall'
                                className='text-sm font-medium text-gray-700 cursor-pointer'
                            >
                                Arbeitsunfall
                            </label>
                        </div>
                    </div>

                    {submitError && (
                        <p className='text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md'>
                            {submitError}
                        </p>
                    )}

                    <div className='flex items-center justify-end gap-4 pt-6 border-t border-gray-200'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='font-sans cursor-pointer font-medium bg-[#61A07B] hover:bg-[#4A8A6A] text-white flex items-center gap-2 tracking-wide'
                        >
                            <Check className='w-4 h-4' />
                            {isSubmitting ? 'Wird gespeichert…' : 'Speichern'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
