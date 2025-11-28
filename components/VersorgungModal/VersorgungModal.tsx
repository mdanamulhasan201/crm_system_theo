'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createVersorgung, updateVersorgung } from '@/apis/versorgungApis'
import { getAllStorages } from '@/apis/productsManagementApis'
import toast from 'react-hot-toast'

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
    diagnosis_status?: string
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
    isAuswahl?: boolean
    onCategoryChange?: (category: 'alltagseinlagen' | 'sporteinlagen' | 'businesseinlagen') => void
    selectedDiagnosis?: string
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
    isAuswahl = false,
    onCategoryChange,
    selectedDiagnosis
}: VersorgungModalProps) {

    const [form, setForm] = useState(INITIAL_FORM_STATE)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [selectedDiagnosisState, setSelectedDiagnosisState] = useState<string>(selectedDiagnosis || '')

    // Storage products state
    const [storageProducts, setStorageProducts] = useState<StorageProduct[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<StorageProduct | null>(null)

    // Helper Functions
    const getCategoryTitle = () => CATEGORY_TITLES[category] || 'Versorgung'

    const getCategoryStatus = () => CATEGORY_TITLES[category] || 'Alltagseinlagen'

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
        setError(null)
        setSuccess(null)
        setIsLoading(false)
        setSelectedProduct(null)
        setMaterialienInput('')

        // Beim Öffnen des Modals:
        // 1. Falls wir bearbeiten und die Karte bereits eine diagnosis_status hat -> diese vorselektieren
        // 2. Sonst (z. B. aus Auswahl oder ohne Diagnose) -> selectedDiagnosis-Prop oder leer
        if (editingCard?.diagnosis_status) {
            setSelectedDiagnosisState(editingCard.diagnosis_status)
        } else {
            setSelectedDiagnosisState(selectedDiagnosis || '')
        }

        if (editingCard) {
            let materialienArray: string[] = []
            if (typeof editingCard.materialien === 'string') {
                materialienArray = editingCard.materialien
                    .split(/\n|,/)
                    .map(m => m.trim())
                    .filter(m => m.length > 0)
            } else if (Array.isArray(editingCard.materialien)) {
                materialienArray = editingCard.materialien
            }

            setForm({
                name: editingCard.name,
                rohlingHersteller: editingCard.rohlingHersteller,
                artikelHersteller: editingCard.artikelHersteller,
                artNr: editingCard.artNr,
                versorgung: editingCard.versorgung,
                materialien: materialienArray,
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
        setError(null)
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
                status: getCategoryStatus(),
                storeId: selectedProduct?.id || null,
                ...(selectedDiagnosisState && { diagnosis_status: selectedDiagnosisState })
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
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Effects
    useEffect(() => {
        if (open) {
            resetForm()
            fetchStorageProducts()
        } else {
            // Clean up states when modal closes
            setError(null)
            setSuccess(null)
            setIsLoading(false)
            setSelectedProduct(null)
            setSelectedDiagnosisState('')
        }
    }, [editingCard, open, resetForm])

    // Render Functions
    const renderProductDropdown = () => (
        <div>
            <label className="font-bold mb-1 block">Produkt aus Lager auswählen</label>
            <div className="relative">
                <select
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                        const productId = e.target.value
                        const product = storageProducts.find(p => p.id === productId)
                        if (product) {
                            handleProductSelect(product)
                        }
                    }}
                    className="border p-2 rounded w-full"
                    disabled={isLoadingProducts}
                >
                    <option value="">
                        {isLoadingProducts ? 'Lade Produkte...' : 'Produkt auswählen'}
                    </option>
                    {storageProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.produktname} - {product.artikelnummer}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )

    const renderSubmitButton = () => (
        <button
            type="submit"
            disabled={isLoading}
            className={`px-6 cursor-pointer py-2 rounded-full text-lg ${isLoading
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
                    {/* Product Selection Dropdown */}
                    {renderProductDropdown()}

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

                    {/* Materialien - Tag Input */}
                    <div>
                        <label className="font-bold mb-2 block">Materialien</label>

                        {/* Display added materials as tags */}
                        {form.materialien.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.materialien.map((material, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                    >
                                        <span>{material}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMaterialTag(index)}
                                            className="text-blue-600 hover:text-blue-900 font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Single input field for adding materials */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={materialienInput}
                                onChange={(e) => setMaterialienInput(e.target.value)}
                                onKeyDown={handleMaterialienKeyDown}
                                placeholder="Material eingeben (Enter oder Komma drücken zum Hinzufügen)"
                                className="border p-2 rounded flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleAddMaterialTag}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                                Hinzufügen
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Drücken Sie Enter oder Komma nach jedem Material
                        </p>
                    </div>

                    {/* Diagnosis Dropdown - Available for all categories */}
                    <div>
                        <label className="font-bold mb-1 block">Diagnose (Optional)</label>
                        <select
                            name="diagnosis"
                            value={selectedDiagnosisState}
                            onChange={(e) => {
                                setSelectedDiagnosisState(e.target.value)
                            }}
                            className="border p-2 rounded w-full"
                        >
                            <option value="">Keine Diagnose auswählen</option>
                            <option value="PLANTARFASZIITIS">Plantarfasziitis</option>
                            <option value="FERSENSPORN">Fersensporn</option>
                            <option value="SPREIZFUSS">Spreizfuß</option>
                            <option value="SENKFUSS">Senkfuß</option>
                            <option value="PLATTFUSS">Plattfuß</option>
                            <option value="HOHLFUSS">Hohlfuß</option>
                            <option value="KNICKFUSS">Knickfuß</option>
                            <option value="KNICK_SENKFUSS">Knick-Senkfuß</option>
                            <option value="HALLUX_VALGUS">Hallux valgus</option>
                            <option value="HALLUX_RIGIDUS">Hallux rigidus</option>
                            <option value="HAMMERZEHEN_KRALLENZEHEN">Hammerzehen / Krallenzehen</option>
                            <option value="MORTON_NEUROM">Morton-Neurom</option>
                            <option value="FUSSARTHROSE">Fußarthrose</option>
                            <option value="STRESSFRAKTUREN_IM_FUSS">Stressfrakturen im Fußbereich</option>
                            <option value="DIABETISCHES_FUSSSYNDROM">Diabetisches Fußsyndrom</option>
                        </select>
                    </div>

                    <DialogFooter>
                        {renderSubmitButton()}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
