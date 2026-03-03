'use client'

import React, { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Shield,
    FileText,
    Heart,
    Building2,
    AlertTriangle,
    CalendarIcon,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface RezepteFormState {
    kostentraeger: string
    versicherungsnummer: string
    rezeptdatum: string
    arzt: string
    ortArzt: string
    arztnummer: string
    betriebsstaettennummer: string
    diagnose: string
    artEinlage: string
    gueltigkeit: string
    kostentraegererkennung: string
    statusnummer: string
    bvhCode: string
    arbeitsunfall: boolean
}

const initialFormState: RezepteFormState = {
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

function formatDateDE(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0')
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const y = date.getFullYear()
    return `${d}.${m}.${y}`
}

function parseDateDE(str: string): Date | undefined {
    if (!str || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(str.trim())) return undefined
    const parts = str.trim().split('.')
    const d = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const y = parseInt(parts[2], 10)
    const date = new Date(y, m, d)
    return isNaN(date.getTime()) ? undefined : date
}

interface RezepteFormProps {
    editData?: Partial<RezepteFormState> | null
    onSaved?: () => void
    /** When true, show delete button (edit mode) */
    showDelete?: boolean
}

export default function RezepteForm({
    editData = null,
    onSaved,
    showDelete = false,
}: RezepteFormProps) {
    const [form, setForm] = useState<RezepteFormState>(() => ({
        ...initialFormState,
        ...editData,
        rezeptdatum:
            editData?.rezeptdatum || formatDateDE(new Date()),
    }))
    const [activeTab, setActiveTab] = useState('versicherung')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateField = useCallback(
        (field: keyof RezepteFormState, value: string | boolean) => {
            setForm((prev) => ({ ...prev, [field]: value }))
        },
        []
    )

    const resetForm = useCallback(() => {
        setForm({
            ...initialFormState,
            rezeptdatum: formatDateDE(new Date()),
        })
        setActiveTab('versicherung')
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            // TODO: API call to save rezept
            await new Promise((r) => setTimeout(r, 400))
            resetForm()
            onSaved?.()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Rezept wirklich löschen?')) return
        setIsSubmitting(true)
        try {
            // TODO: API call to delete
            await new Promise((r) => setTimeout(r, 300))
            resetForm()
            onSaved?.()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
        >
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
            >
                <TabsList className='w-auto inline-flex h-auto p-1 bg-gray-100 rounded-lg gap-0.5 mb-6'>
                    <TabsTrigger
                        value='versicherung'
                        className='text-xs data-[state=active]:bg-[#61A07B] data-[state=active]:text-white rounded-md px-3 py-2 gap-1.5'
                    >
                        <Shield className='w-3.5 h-3.5' />
                        Versicherung
                    </TabsTrigger>
                    <TabsTrigger
                        value='rezept-arzt'
                        className='text-xs data-[state=active]:bg-[#61A07B] data-[state=active]:text-white rounded-md px-3 py-2 gap-1.5'
                    >
                        <FileText className='w-3.5 h-3.5' />
                        Rezept & Arzt
                    </TabsTrigger>
                    <TabsTrigger
                        value='medizin'
                        className='text-xs data-[state=active]:bg-[#61A07B] data-[state=active]:text-white rounded-md px-3 py-2 gap-1.5'
                    >
                        <Heart className='w-3.5 h-3.5' />
                        Medizin
                    </TabsTrigger>
                    <TabsTrigger
                        value='kassen'
                        className='text-xs data-[state=active]:bg-[#61A07B] data-[state=active]:text-white rounded-md px-3 py-2 gap-1.5'
                    >
                        <Building2 className='w-3.5 h-3.5' />
                        Kassen & Sonstiges
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='versicherung' className='mt-0 space-y-4 outline-none'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Kostenträger / Krankenkasse *
                        </label>
                        <Input
                            value={form.kostentraeger}
                            onChange={(e) =>
                                updateField('kostentraeger', e.target.value)
                            }
                            placeholder='z.B. AOK Bayern'
                            className='w-full bg-gray-50'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Versicherungsnummer
                        </label>
                        <Input
                            value={form.versicherungsnummer}
                            onChange={(e) =>
                                updateField('versicherungsnummer', e.target.value)
                            }
                            placeholder='A123456789'
                            className='w-full bg-gray-50'
                        />
                    </div>
                </TabsContent>

                <TabsContent value='rezept-arzt' className='mt-0 space-y-5 outline-none'>
                    <div>
                        <h3 className='text-sm font-semibold text-gray-800 mb-2'>
                            Rezeptinformationen
                        </h3>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Rezeptdatum
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
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
                                    selected={
                                        parseDateDE(form.rezeptdatum) ?? undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            updateField(
                                                'rezeptdatum',
                                                formatDateDE(date)
                                            )
                                        }
                                    }}
                                    initialFocus
                                    captionLayout='dropdown'
                                    fromYear={new Date().getFullYear() - 2}
                                    toYear={new Date().getFullYear() + 5}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <h3 className='text-sm font-semibold text-gray-800 mb-2'>
                            Arztinformationen
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                    Arzt
                                </label>
                                <Input
                                    value={form.arzt}
                                    onChange={(e) =>
                                        updateField('arzt', e.target.value)
                                    }
                                    placeholder='Name des Arztes'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                    Ort Arzt
                                </label>
                                <Input
                                    value={form.ortArzt}
                                    onChange={(e) =>
                                        updateField('ortArzt', e.target.value)
                                    }
                                    placeholder='Ort'
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                    Arztnummer
                                </label>
                                <Input
                                    value={form.arztnummer}
                                    onChange={(e) =>
                                        updateField('arztnummer', e.target.value)
                                    }
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                    Betriebsstättennummer
                                </label>
                                <Input
                                    value={form.betriebsstaettennummer}
                                    onChange={(e) =>
                                        updateField(
                                            'betriebsstaettennummer',
                                            e.target.value
                                        )
                                    }
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value='medizin' className='mt-0 space-y-4 outline-none'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Ärztliche Diagnose *
                        </label>
                        <Textarea
                            value={form.diagnose}
                            onChange={(e) =>
                                updateField('diagnose', e.target.value)
                            }
                            placeholder='z.B. Plattfuß beidseits, erworbene Fehlstellung'
                            className='w-full min-h-[80px] resize-y'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Art der Einlage
                        </label>
                        <Input
                            value={form.artEinlage}
                            onChange={(e) =>
                                updateField('artEinlage', e.target.value)
                            }
                            placeholder='z.B. Einlage nach Maß beidseits'
                            className='w-full'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Gültigkeit des Rezepts
                        </label>
                        <Input
                            value={form.gueltigkeit}
                            onChange={(e) =>
                                updateField('gueltigkeit', e.target.value)
                            }
                            placeholder='z.B. 4 Wochen (gesetzlich)'
                            className='w-full'
                        />
                    </div>
                </TabsContent>

                <TabsContent value='kassen' className='mt-0 space-y-4 outline-none'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                Kostenträgererkennung
                            </label>
                            <Input
                                value={form.kostentraegererkennung}
                                onChange={(e) =>
                                    updateField(
                                        'kostentraegererkennung',
                                        e.target.value
                                    )
                                }
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                Statusnummer
                            </label>
                            <Input
                                value={form.statusnummer}
                                onChange={(e) =>
                                    updateField('statusnummer', e.target.value)
                                }
                                className='w-full'
                            />
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            BVH / Hilfsmittel / Impfstoff / Spr.-Str.-Bedarf / Code
                        </label>
                        <Input
                            value={form.bvhCode}
                            onChange={(e) =>
                                updateField('bvhCode', e.target.value)
                            }
                            className='w-full'
                        />
                    </div>
                    <div className='pt-2 flex items-center gap-2'>
                        <Checkbox
                            id='arbeitsunfall'
                            checked={form.arbeitsunfall}
                            onChange={(e) =>
                                updateField('arbeitsunfall', e.target.checked)
                            }
                        />
                        <label
                            htmlFor='arbeitsunfall'
                            className='text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1.5'
                        >
                            <AlertTriangle className='w-4 h-4 text-amber-500' />
                            Arbeitsunfall
                        </label>
                    </div>
                </TabsContent>
            </Tabs>

            <div className='flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-100'>
                <div>
                    {showDelete && (
                        <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className='gap-2'
                        >
                            Löschen
                        </Button>
                    )}
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={resetForm}
                        disabled={isSubmitting}
                    >
                        Zurücksetzen
                    </Button>
                    <Button
                        type='submit'
                        className='bg-[#61A07B] hover:bg-[#4A8A6A] text-white gap-2 cursor-pointer'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Wird gespeichert…' : 'Speichern'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
