'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Download, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TopNavigation from '../../../_components/Kundenordner/TopNavigation'
import RezepteModal from '../../../_components/Rezepte/RezepteModal'

export default function RezeptePage() {
    const params = useParams()
    const router = useRouter()
    const customerId = String(params.id)
    const [rezepteModalOpen, setRezepteModalOpen] = useState(false)

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
                    <h1 className='font-sans text-3xl font-bold tracking-tight text-gray-900 antialiased'>
                    REZEPTE
                </h1>
                    <div className='flex items-center gap-3'>
                        <Button
                            onClick={() => setRezepteModalOpen(true)}
                            className='font-sans bg-[#61A07B] cursor-pointer hover:bg-[#4A8A6A] text-white flex items-center gap-2 font-medium tracking-wide'
                        >
                            <Plus className='w-4 h-4' />
                            Neues Rezept hinzufügen
                        </Button>
                        <Button variant='outline' className='font-sans flex items-center gap-2 cursor-pointer font-medium'>
                            <Download className='w-4 h-4' />
                            Exportieren
                        </Button>
                    </div>
                </div>

                {/* Rezepte Section */}
                <div className='space-y-6'>
                    <div>
                        <h2 className='font-sans text-xl font-semibold tracking-tight text-gray-900 mb-4'>
                        Rezepte
                    </h2>
                        {/* Prescription Card - Static Design */}
                        <div className='bg-blue-50/80 border border-blue-400/60 rounded-xl p-4 mb-6 shadow-sm'>
                            <div className='flex items-start gap-4'>
                                
                                <div className='flex-1'>
                                    <div className='flex items-start justify-between mb-2'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-sans px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1 tracking-wide'>
                                                <ScanLine className='w-3 h-3' />
                                                Scan
                                            </span>
                                        </div>
                                        <p className='font-sans text-xs text-gray-500 tabular-nums'>13.11.2025</p>
                                    </div>
                                    <h3 className='font-sans font-semibold text-lg tracking-tight text-gray-900 mb-1'>
                                        AOK Bayern
                                    </h3>
                                    <p className='font-sans text-sm text-gray-600 leading-snug'>
                                        Plattfuß beidseits, erworbene Fehlstellung
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                
                </div>
            </div>

            <RezepteModal
                open={rezepteModalOpen}
                onOpenChange={setRezepteModalOpen}
                customerId={customerId}
                onSuccess={() => {
                    // Optional: refetch rezepte list here
                }}
            />
        </>
    )
}
