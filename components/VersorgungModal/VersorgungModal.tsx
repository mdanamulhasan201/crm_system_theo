'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createVersorgung, updateVersorgung, getSingleStorageById } from '@/apis/versorgungApis'
import { getAllStorages } from '@/apis/productsManagementApis'
import toast from 'react-hot-toast'
import ProductSelector from './ProductSelector'
import MaterialienInput from './MaterialienInput'
import DiagnosisSelector from './DiagnosisSelector'

// Types and Interfaces
export interface VersorgungCard {
    id: number
    name: string
    rohlingHersteller: string
    artikelHersteller: string
    artNr: string
    versorgung: string
    materialien: string | string[]
    laenge: string
    // Optional: only set when eine Diagnose verknüpft ist
    diagnosis_status?: string | string[]
}

interface StorageProduct {
    id: string
    produktname: string
    hersteller: string
    artikelnummer: string
    lagerort: string
    mindestbestand: number
    groessenMengen: { [key: string]: number }
    purchase_price: number
    selling_price: number
    Status: string
    userId: string
    createdAt: string
    updatedAt: string
}

export interface VersorgungModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category: 'alltagseinlagen' | 'sporteinlagen' | 'businesseinlagen'
    editingCard: VersorgungCard | null
    onSubmit: (formData: Omit<VersorgungCard, 'id'>) => void
    selectedDiagnosis?: string | string[]
    supplyStatusId?: string
}

// Constants
const CATEGORY_TITLES = {
    alltagseinlagen: 'Alltagseinlagen',
    sporteinlagen: 'Sporteinlagen',
    businesseinlagen: 'Businesseinlagen',
} as const



const INITIAL_FORM_STATE = {
    name: '',
    rohlingHersteller: '',
    artikelHersteller: '',
    artNr: '',
    versorgung: '',
    materialien: [] as string[],
    laenge: '',
}

export default function VersorgungModal({
    open,
    onOpenChange,
    category,
    editingCard,
    onSubmit,
    selectedDiagnosis,
    supplyStatusId
}: VersorgungModalProps) {

    const [form, setForm] = useState(INITIAL_FORM_STATE)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [selectedDiagnosisState, setSelectedDiagnosisState] = useState<string[]>(
        selectedDiagnosis
            ? Array.isArray(selectedDiagnosis)
                ? selectedDiagnosis
                : [selectedDiagnosis]
            : []
    )
    const [pendingStoreId, setPendingStoreId] = useState<string | null>(null)
    const [isFetchingSingleVersorgung, setIsFetchingSingleVersorgung] = useState(false)

    // Storage products state
    const [storageProducts, setStorageProducts] = useState<StorageProduct[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<StorageProduct | null>(null)

    // Helper Functions
    const getCategoryTitle = () => CATEGORY_TITLES[category] || 'Versorgung'
    const getCategoryStatus = () => CATEGORY_TITLES[category] || 'Alltagseinlagen'

    const parseMaterialien = (materialSource: string | string[] | null | undefined) => {
        if (!materialSource) return []
        if (typeof materialSource === 'string') {
            return materialSource
                .split(/\n|,/)
                .map(m => m.trim())
                .filter(Boolean)
        }
        if (Array.isArray(materialSource)) {
            return materialSource.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
        }
        return []
    }

    // Fetch storage products
    const fetchStorageProducts = async () => {
        try {
            setIsLoadingProducts(true)
            const response = await getAllStorages()
            if (response.success && response.data) {
                setStorageProducts(response.data)
            }
        } catch (err: any) {
            console.error('Failed to fetch storage products:', err)
            toast.error('Failed to load products')
        } finally {
            setIsLoadingProducts(false)
        }
    }

    // Handle product selection
    const handleProductSelect = (product: StorageProduct) => {
        setSelectedProduct(product)

        // Auto-fill form fields
        setForm(prev => ({
            ...prev,
            name: product.produktname,
            artikelHersteller: product.artikelnummer,
            rohlingHersteller: product.hersteller,
        }))
    }

    const resetForm = useCallback(() => {
        setSuccess(null)
        setIsLoading(false)
        setSelectedProduct(null)
        setPendingStoreId(null)
        setMaterialienInput('')

        if (editingCard?.diagnosis_status) {
            // Handle both string (old format) and array (new format)
            const diagnosis: string[] = Array.isArray(editingCard.diagnosis_status)
                ? editingCard.diagnosis_status
                : editingCard.diagnosis_status
                    ? editingCard.diagnosis_status.split(',').map(d => d.trim()).filter(Boolean)
                    : []
            setSelectedDiagnosisState(diagnosis)
        } else {
            const diagnosis: string[] = selectedDiagnosis
                ? Array.isArray(selectedDiagnosis)
                    ? selectedDiagnosis
                    : [selectedDiagnosis]
                : []
            setSelectedDiagnosisState(diagnosis)
        }

        if (editingCard) {
            setForm({
                name: editingCard.name,
                rohlingHersteller: editingCard.rohlingHersteller,
                artikelHersteller: editingCard.artikelHersteller,
                artNr: editingCard.artNr,
                versorgung: editingCard.versorgung,
                materialien: parseMaterialien(editingCard.materialien),
                laenge: editingCard.laenge,
            })
        } else {
            setForm(INITIAL_FORM_STATE)
        }
    }, [editingCard, selectedDiagnosis])

    // Event Handlers
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // Handle materialien tag input
    const [materialienInput, setMaterialienInput] = useState('')

    const handleAddMaterialTag = () => {
        const trimmedInput = materialienInput.trim()
        if (trimmedInput && !form.materialien.includes(trimmedInput)) {
            setForm(prev => ({
                ...prev,
                materialien: [...prev.materialien, trimmedInput]
            }))
            setMaterialienInput('')
        }
    }

    const handleMaterialienKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            handleAddMaterialTag()
        }
    }

    const handleRemoveMaterialTag = (indexToRemove: number) => {
        setForm(prev => ({
            ...prev,
            materialien: prev.materialien.filter((_, index) => index !== indexToRemove)
        }))
    }


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setSuccess(null)

        try {
            // Transform form data to match API format
            // Filter out empty materialien and convert to array
            const materialienArray = form.materialien.filter(m => m.trim().length > 0)

            // Validate that at least one material is added
            if (materialienArray.length === 0) {
                toast.error('Bitte fügen Sie mindestens ein Material hinzu')
                setIsLoading(false)
                return
            }

            const apiData = {
                name: form.name,
                rohlingHersteller: form.rohlingHersteller,
                artikelHersteller: form.artikelHersteller,
                versorgung: form.versorgung,
                material: materialienArray, // Send as array
                ...(supplyStatusId ? { supplyStatusId: supplyStatusId } : { status: getCategoryStatus() }),
                storeId: selectedProduct?.id || null,
                ...(selectedDiagnosisState.length > 0 && { diagnosis_status: selectedDiagnosisState })
            }

            let response
            if (editingCard) {
                // Update existing versorgung
                response = await updateVersorgung({ ...apiData, id: editingCard.id })
            } else {
                // Create new versorgung (works for both regular versorgung and diagnosis)
                response = await createVersorgung(apiData)
            }

            const successMessage = response.message || (editingCard ? 'Versorgung erfolgreich aktualisiert!' : 'Versorgung erfolgreich erstellt!')
            setSuccess(successMessage)
            toast.success(successMessage)

            onSubmit(form)

            // Close modal after showing success message
            setTimeout(() => {
                onOpenChange(false)
            }, 100)
        } catch (error: any) {
            console.error('Error saving versorgung:', error)
            const errorMessage = error.response?.data?.message || `Failed to ${editingCard ? 'update' : 'create'} versorgung. Please try again.`
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSingleVersorgung = useCallback(async (versorgungId: number | string) => {
        if (!versorgungId) return
        try {
            setIsFetchingSingleVersorgung(true)
            const response = await getSingleStorageById(String(versorgungId))
            const versorgungData = response?.data || response
            if (versorgungData) {
                setForm({
                    name: versorgungData.name || '',
                    rohlingHersteller: versorgungData.rohlingHersteller || '',
                    artikelHersteller: versorgungData.artikelHersteller || '',
                    artNr: versorgungData.artNr || '',
                    versorgung: versorgungData.versorgung || '',
                    materialien: parseMaterialien(versorgungData.material ?? versorgungData.materialien),
                    laenge: versorgungData.laenge || '',
                })

                // Handle both string (old format) and array (new format)
                const diagnosis = versorgungData.diagnosis_status
                    ? Array.isArray(versorgungData.diagnosis_status)
                        ? versorgungData.diagnosis_status
                        : versorgungData.diagnosis_status.split(',').map((d: string) => d.trim()).filter(Boolean)
                    : selectedDiagnosis
                        ? [selectedDiagnosis]
                        : []
                setSelectedDiagnosisState(diagnosis)
                setPendingStoreId(versorgungData.storeId || null)
            }
        } catch (err) {

            toast.error('Versorgungsdetails konnten nicht geladen werden')
        } finally {
            setIsFetchingSingleVersorgung(false)
        }
    }, [selectedDiagnosis])

    useEffect(() => {
        if (!pendingStoreId) return
        const product = storageProducts.find(product => product.id === pendingStoreId)
        if (product) {
            setSelectedProduct(product)
            setPendingStoreId(null)
        }
    }, [pendingStoreId, storageProducts])

    // Effects
    useEffect(() => {
        if (open) {
            resetForm()
            fetchStorageProducts()
            if (editingCard?.id) {
                fetchSingleVersorgung(editingCard.id)
            }
        } else {
            // Clean up states when modal closes
            setSuccess(null)
            setIsLoading(false)
            setSelectedProduct(null)
            setSelectedDiagnosisState([])
        }
    }, [editingCard, open, resetForm, fetchSingleVersorgung])

    const renderSubmitButton = () => (
        <button
            type="submit"
            disabled={isLoading || isFetchingSingleVersorgung}
            className={`px-6 cursor-pointer py-2 rounded-full text-lg ${(isLoading || isFetchingSingleVersorgung)
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
                }`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editingCard ? 'Aktualisiere...' : 'Erstelle...'}
                </div>
            ) : success ? (
                'Erfolgreich!'
            ) : (
                editingCard ? 'Aktualisieren' : 'Abschließen'
            )}
        </button>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingCard ? 'Versorgung bearbeiten' : `Neue ${getCategoryTitle()} hinzufügen`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 overflow-hidden">
                    <ProductSelector
                        products={storageProducts}
                        isLoading={isLoadingProducts}
                        selectedProductId={selectedProduct?.id || ''}
                        onSelect={(productId) => {
                            const product = storageProducts.find(p => p.id === productId)
                            if (product) {
                                handleProductSelect(product)
                            }
                        }}
                    />

                    {/* Basic Information */}
                    {/* <input
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Name der Versorgung"
                        className="border p-2 rounded"
                        required
                    /> */}

                    <div className="flex gap-2">

                        <input
                            name="artikelHersteller"
                            value={form.artikelHersteller}
                            onChange={handleFormChange}
                            placeholder="Artikelhersteller"
                            className="border p-2 rounded w-1/2"
                            required
                        />
                        <input
                            name="rohlingHersteller"
                            value={form.rohlingHersteller}
                            onChange={handleFormChange}
                            placeholder="Rohling Hersteller"
                            className="border p-2 rounded w-1/2"
                            required
                        />

                    </div>



                    {/* Description Fields */}
                    <textarea
                        name="versorgung"
                        value={form.versorgung}
                        onChange={handleFormChange}
                        placeholder="Versorgung"
                        className="border p-2 rounded"
                        required
                    />

                    <MaterialienInput
                        materialien={form.materialien}
                        inputValue={materialienInput}
                        onInputChange={setMaterialienInput}
                        onAdd={handleAddMaterialTag}
                        onRemove={handleRemoveMaterialTag}
                        onKeyDown={handleMaterialienKeyDown}
                    />

                    <DiagnosisSelector
                        value={selectedDiagnosisState}
                        onChange={setSelectedDiagnosisState}
                    />

                    <DialogFooter>
                        {renderSubmitButton()}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}