'use client'

import React, { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TopNavigation from '../../../_components/Kundenordner/TopNavigation'
import RezepteModal from '../../../_components/Rezepte/RezepteModal'
import RezepteData from '../../../_components/Rezepte/RezepteData'
import { getSingleRecipe } from '@/apis/rezepteApis'
import type { Prescription } from '@/apis/rezepteApis'
import * as XLSX from 'xlsx'

export default function RezeptePage() {
    const params = useParams()
    const router = useRouter()
    const customerId = String(params.id)
    const [rezepteModalOpen, setRezepteModalOpen] = useState(false)
    const [refetchTrigger, setRefetchTrigger] = useState(0)
    const [editRecipe, setEditRecipe] = useState<Prescription | null>(null)
    const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null)
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
    const [exportLoading, setExportLoading] = useState(false)

    const handleModalOpenChange = useCallback((open: boolean) => {
        if (!open) setEditRecipe(null)
        setRezepteModalOpen(open)
    }, [])

    const handleEdit = useCallback(async (recipe: Prescription) => {
        if (!recipe.id) return
        setEditingRecipeId(recipe.id)
        try {
            const res = await getSingleRecipe(recipe.id)
            setEditRecipe(res.data)
            setRezepteModalOpen(true)
        } catch {
            setEditingRecipeId(null)
        } finally {
            setEditingRecipeId(null)
        }
    }, [])

    /** Format ISO date for Excel display (dd.mm.yyyy) */
    const formatDateForExcel = (iso?: string) => {
        if (!iso) return ''
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

    const handleExport = useCallback(async () => {
        if (!selectedRecipeId) return
        try {
            setExportLoading(true)
            const res = await getSingleRecipe(selectedRecipeId)
            const d = res.data
            const row: Record<string, string | number | boolean> = {
                'ID': d.id ?? '',
                'Kunden-ID': d.customerId ?? '',
                'Versicherung': d.insurance_provider ?? '',
                'Versicherungsnummer': d.insurance_number ?? '',
                'Rezeptdatum': formatDateForExcel(d.prescription_date),
                'Rezeptnummer': d.prescription_number ?? '',
                'Arzt Ort': d.doctor_location ?? '',
                'Arzt Name': d.doctor_name ?? '',
                'Betriebsnummer': d.establishment_number ?? '',
                'Diagnose': d.medical_diagnosis ?? '',
                'Art der Einreichung': d.type_of_deposit ?? '',
                'Gültigkeit (Wochen)': d.validity_weeks ?? 0,
                'Kostenträger ID': d.cost_bearer_id ?? '',
                'Statusnummer': d.status_number ?? '',
                'Hilfsmittelcode': d.aid_code ?? '',
                'Arbeitsunfall': d.is_work_accident ?? false,
                'Erstellt am': formatDateForExcel(d.createdAt),
            }
            const workbook = XLSX.utils.book_new()
            const sheet = XLSX.utils.json_to_sheet([row])
            XLSX.utils.book_append_sheet(workbook, sheet, 'Rezept')
            const fileName = `Rezept_Export_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(workbook, fileName)
        } catch {
            alert('Export fehlgeschlagen. Bitte erneut versuchen.')
        } finally {
            setExportLoading(false)
        }
    }, [selectedRecipeId])

    return (
        <>
            {/* Back button */}
            {/* <div className='p-4 space-y-6'>
                <Button
                    onClick={() => router.push(`/dashboard/kundenordner/${customerId}`)}
                    variant='outline'
                    className='flex items-center gap-2 cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4' />
                    Back
                </Button>
            </div> */}

            <div className='mb-20 p-4 space-y-6'>
                <TopNavigation activeTab='rezepte' />

                {/* Header Section with Title and Action Buttons */}
                <div className='flex flex-col gap-4 lg:flex-row items-center justify-between mb-6'>
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
                        <Button
                            variant='outline'
                            className='font-sans flex items-center gap-2 cursor-pointer font-medium'
                            disabled={!selectedRecipeId}
                            onClick={handleExport}
                        >
                            {exportLoading ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                                <Download className='w-4 h-4' />
                            )}
                            Exportieren
                        </Button>
                    </div>
                </div>

                {/* Rezepte Section */}
                <RezepteData
                    customerId={customerId}
                    refetchTrigger={refetchTrigger}
                    onEdit={handleEdit}
                    editingRecipeId={editingRecipeId}
                    selectedRecipeId={selectedRecipeId}
                    onSelectRecipe={setSelectedRecipeId}
                />
            </div>

            <RezepteModal
                open={rezepteModalOpen}
                onOpenChange={handleModalOpenChange}
                customerId={customerId}
                onSuccess={() => setRefetchTrigger((t) => t + 1)}
                editRecipe={editRecipe}
            />
        </>
    )
}
