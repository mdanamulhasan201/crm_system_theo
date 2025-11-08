'use client'
import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { BsFillQuestionCircleFill } from 'react-icons/bs'
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
    materialien: string
    laenge: string
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
const DEFAULT_LENGTHS = [
    { value: '250', label: '35' },
    { value: '255', label: '36' },
    { value: '260', label: '37' },
    { value: '265', label: '38' },
    { value: '270', label: '39' },
    { value: '275', label: '40' },
    { value: '280', label: '41' },
    { value: '285', label: '42' },
    { value: '290', label: '43' },
    { value: '295', label: '44' },
    { value: '300', label: '45' },
    { value: '305', label: '46' },
    { value: '310', label: '47' },
    { value: '315', label: '48' },
]

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
    materialien: '',
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
    const [lengths, setLengths] = useState(DEFAULT_LENGTHS)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Storage products state
    const [storageProducts, setStorageProducts] = useState<StorageProduct[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<StorageProduct | null>(null)

    // Carousel Setup
    const [lengthEmblaRef, lengthEmblaApi] = useEmblaCarousel({
        slidesToScroll: 3,
        align: 'start',
        containScroll: 'trimSnaps'
    })

    // Carousel Navigation States
    const [canScrollLengthPrev, setCanScrollLengthPrev] = useState(false)
    const [canScrollLengthNext, setCanScrollLengthNext] = useState(false)

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

        // Update lengths based on groessenMengen
        const newLengths = DEFAULT_LENGTHS.map((length, index) => {
            const size = length.label
            const quantity = product.groessenMengen[size] || 0
            return {
                ...length,
                value: quantity.toString()
            }
        })
        setLengths(newLengths)
    }

    const resetForm = useCallback(() => {
        setError(null)
        setSuccess(null)
        setIsLoading(false)
        setSelectedProduct(null)

        if (editingCard) {
            setForm({
                name: editingCard.name,
                rohlingHersteller: editingCard.rohlingHersteller,
                artikelHersteller: editingCard.artikelHersteller,
                artNr: editingCard.artNr,
                versorgung: editingCard.versorgung,
                materialien: editingCard.materialien,
                laenge: editingCard.laenge,
            })
        } else {
            setForm(INITIAL_FORM_STATE)
            setLengths(DEFAULT_LENGTHS)
        }
    }, [editingCard])

    // Event Handlers
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }


    const handleLengthInputChange = (index: number, newValue: string) => {
        setLengths(prev => {
            const newLengths = [...prev]
            newLengths[index].value = newValue
            for (let i = index + 1; i < newLengths.length; i++) {
                const prevValue = parseInt(newLengths[i - 1].value)
                newLengths[i].value = (prevValue + 5).toString()
            }

            return newLengths
        })
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const loadingToastId = toast.loading(editingCard ? 'Versorgung wird aktualisiert...' : 'Versorgung wird erstellt...')

        try {
            // Transform form data to match API format
            const langenempfehlung: { [key: string]: number } = {}
            lengths.forEach(l => {
                langenempfehlung[l.label] = parseInt(l.value)
            })

            const apiData = {
                name: form.name,
                rohlingHersteller: form.rohlingHersteller,
                artikelHersteller: form.artikelHersteller,
                versorgung: form.versorgung,
                material: form.materialien,
                langenempfehlung,
                status: getCategoryStatus(),
                storeId: selectedProduct?.id || null,
                ...(isAuswahl && { diagnosis_status: selectedDiagnosis })
            }

            let response
            if (editingCard) {
                // Update existing versorgung
                response = await updateVersorgung({ ...apiData, id: editingCard.id })
            } else {
                // Create new versorgung (works for both regular versorgung and diagnosis)
                response = await createVersorgung(apiData)
            }

            toast.dismiss(loadingToastId)
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

            toast.dismiss(loadingToastId)

            const errorMessage = error.response?.data?.message || `Failed to ${editingCard ? 'update' : 'create'} versorgung. Please try again.`
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Carousel Navigation Handlers
    const scrollLengthPrev = useCallback(() => {
        if (lengthEmblaApi) lengthEmblaApi.scrollPrev()
    }, [lengthEmblaApi])

    const scrollLengthNext = useCallback(() => {
        if (lengthEmblaApi) lengthEmblaApi.scrollNext()
    }, [lengthEmblaApi])

    const onLengthSelect = useCallback(() => {
        if (!lengthEmblaApi) return
        setCanScrollLengthPrev(lengthEmblaApi.canScrollPrev())
        setCanScrollLengthNext(lengthEmblaApi.canScrollNext())
    }, [lengthEmblaApi])

    // Effects
    useEffect(() => {
        if (!lengthEmblaApi) return

        onLengthSelect()
        lengthEmblaApi.on('select', onLengthSelect)
        lengthEmblaApi.on('reInit', onLengthSelect)

        return () => {
            lengthEmblaApi.off('select', onLengthSelect)
            lengthEmblaApi.off('reInit', onLengthSelect)
        }
    }, [lengthEmblaApi, onLengthSelect])

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

    const renderLengthCarousel = () => (
        <div>
            <div className='flex items-center gap-2'>
                <label className="font-bold mb-1 block">Längenempfehlung</label>
                <BsFillQuestionCircleFill className='text-gray-700' />
            </div>
            <div className="relative">
                <div className="overflow-hidden" ref={lengthEmblaRef}>
                    <div className="flex gap-2">
                        {lengths.map((length, index) => (
                            <div key={index} className="flex-[0_0_auto] min-w-[60px]">
                                <div className="p-1 text-center">
                                    <input
                                        type="number"
                                        value={length.value}
                                        onChange={(e) => handleLengthInputChange(index, e.target.value)}
                                        className="border text-center px-1 py-2 rounded text-xs mb-1"
                                        placeholder={length.value}
                                    />
                                    <div className="text-xs text-gray-500">{length.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carousel Navigation Arrows */}
                {canScrollLengthPrev && (
                    <button
                        type="button"
                        onClick={scrollLengthPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 cursor-pointer rounded-full shadow-lg hover:bg-gray-100 z-10 border"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                )}
                {canScrollLengthNext && (
                    <button
                        type="button"
                        onClick={scrollLengthNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 cursor-pointer rounded-full shadow-lg hover:bg-gray-100 z-10 border"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                )}
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

                    <textarea
                        name="materialien"
                        value={form.materialien}
                        onChange={handleFormChange}
                        placeholder="Materialien"
                        className="border p-2 rounded"
                        required
                    />

                    {/* Category Dropdown - Only for Auswahl */}
                    {isAuswahl && (
                        <div>
                            <label className="font-bold mb-1 block">Kategorie</label>
                            <select
                                name="category"
                                value={category}
                                onChange={(e) => {
                                    if (onCategoryChange) {
                                        onCategoryChange(e.target.value as 'alltagseinlagen' | 'sporteinlagen' | 'businesseinlagen');
                                    }
                                }}
                                className="border p-2 rounded w-full"
                                required
                            >
                                <option value="alltagseinlagen">Alltagseinlagen</option>
                                <option value="sporteinlagen">Sporteinlagen</option>
                                <option value="businesseinlagen">Businesseinlagen</option>
                            </select>
                        </div>
                    )}

                    {/* Length Recommendation */}
                    {renderLengthCarousel()}

                    <DialogFooter>
                        {renderSubmitButton()}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
