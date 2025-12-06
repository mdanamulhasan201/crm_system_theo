'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Download, ScanLine, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import TopNavigation from '../../../_components/Kundenordner/TopNavigation'

export default function RezeptePage() {
    const params = useParams()
    const router = useRouter()
    const customerId = String(params.id)

    return (
        <>
            {/* Back button */}
            <div className='p-4 space-y-6'>
                <Button 
                    onClick={() => router.push(`/dashboard/kundenordner/${customerId}`)} 
                    variant='outline' 
                    className='flex items-center gap-2 cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4' />
                    Back
                </Button>
            </div>

            <div className='mb-20 p-4 space-y-6'>
                <TopNavigation activeTab='rezepte' />

                {/* Header Section with Title and Action Buttons */}
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-3xl font-bold text-gray-900'>REZEPTE</h1>
                    <div className='flex items-center gap-3'>
                        <Button className='bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2'>
                            <Plus className='w-4 h-4' />
                            Neues Rezept hinzufügen
                        </Button>
                        <Button variant='outline' className='flex items-center gap-2'>
                            <Download className='w-4 h-4' />
                            Exportieren
                        </Button>
                    </div>
                </div>

                {/* Rezepte Section */}
                <div className='space-y-6'>
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Rezepte</h2>
                        {/* Prescription Card - Static Design */}
                        <div className='bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-6'>
                            <div className='flex items-start gap-4'>
                                
                                <div className='flex-1'>
                                    <div className='flex items-start justify-between mb-2'>
                                        <div className='flex items-center gap-2'>
                                            <span className='px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1'>
                                                <ScanLine className='w-3 h-3' />
                                                Scan
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-500'>13.11.2025</p>
                                    </div>
                                    <h3 className='font-bold text-lg text-gray-900 mb-1'>
                                        AOK Bayern
                                    </h3>
                                    <p className='text-sm text-gray-600'>
                                        Plattfuß beidseits, erworbene Fehlstellung
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Versicherungsdaten Section */}
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Versicherungsdaten</h2>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Kostenträger / Krankenkasse *
                                </label>
                                <Input
                                    type='text'
                                    placeholder='AOK Bayern'
                                    className='w-full bg-gray-50'
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Versicherungsnummer
                                </label>
                                <Input
                                    type='text'
                                    placeholder='A123456789'
                                    className='w-full bg-gray-50'
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rezeptinformationen Section */}
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Rezeptinformationen</h2>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Rezeptdatum
                                </label>
                                <Input
                                    type='text'
                                    placeholder='tt.mm.jjjj'
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Arztinformationen Section */}
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Arztinformationen</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Arzt
                                </label>
                                <Input
                                    type='text'
                                    placeholder=''
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Ort Arzt
                                </label>
                                <Input
                                    type='text'
                                    placeholder=''
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Arztnummer
                                </label>
                                <Input
                                    type='text'
                                    placeholder=''
                                    className='w-full'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Betriebsstättennummer
                                </label>
                                <Input
                                    type='text'
                                    placeholder=''
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medizinische Daten Section */}
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Medizinische Daten</h2>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Ärztliche Diagnose *
                                </label>
                                <Textarea
                                    placeholder='Plattfuß beidseits, erworbene Fehlstellung'
                                    className='w-full min-h-[80px]'
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Art der Einlage
                                </label>
                                <Input
                                    type='text'
                                    placeholder='Einlage nach Maß beidseits'
                                    className='w-full bg-gray-50'
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Gültigkeit des Rezepts
                                </label>
                                <Input
                                    type='text'
                                        placeholder='4 Wochen (gesetzlich)'
                                    className='w-full bg-gray-50'
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kassen- und Statusdaten Section */}
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Kassen- und Statusdaten</h2>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Kostenträgererkennung
                                    </label>
                                    <Input
                                        type='text'
                                        placeholder=''
                                        className='w-full'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Statusnummer
                                    </label>
                                    <Input
                                        type='text'
                                        placeholder=''
                                        className='w-full'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    BVH / Hilfsmittel / Impfstoff / Spr.-Str.-Bedarf / Code
                                </label>
                                <Input
                                    type='text'
                                    placeholder=''
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Unfallbezogene Angaben Section */}
                    <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-4'>Unfallbezogene Angaben</h2>
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='arbeitsunfall' />
                            <label
                                htmlFor='arbeitsunfall'
                                className='text-sm font-medium text-gray-700 cursor-pointer'
                            >
                                Arbeitsunfall
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-end gap-4 pt-6 border-t'>
                        <Button className='bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2'>
                            <Check className='w-4 h-4' />
                            Bearbeiten
                        </Button>
                        <Button variant='destructive' className='flex items-center gap-2'>
                            <Trash2 className='w-4 h-4' />
                            Löschen
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
