'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import { getAllManufacturers, getAllModelName } from '@/apis/storeManagement'
import useDebounce from '@/hooks/useDebounce'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SizeData {
    length?: number;
    /** Leer im UI → undefined, Submit → 0 */
    quantity?: number;
    mindestmenge?: number;
    autoOrderLimit?: number;
    orderQuantity?: number;
}

interface AddProductTypeModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (createdProduct?: any) => void
    type: 'rady_insole' | 'milling_block'
}

interface ModelOption {
    id: string
    brand: string
    productName: string
    artikelnummer?: string
    type?: string
}

export default function AddProductTypeModal({ isOpen, onClose, onSuccess, type }: AddProductTypeModalProps) {
    const { createNewProduct, isLoading } = useStockManagementSlice()

    // Define size columns based on type
    const sizeColumns = type === 'milling_block'
        ? ['Size 1', 'Size 2', 'Size 3']
        : ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']
    const initialVisibleSizeCount = type === 'milling_block' ? sizeColumns.length : 4

    const [formData, setFormData] = useState<{
        Produktname: string
        Hersteller: string
        Produktkürzel: string
        Lagerort: string
        minStockLevel: number | undefined
        purchase_price: number | undefined
        selling_price: number | undefined
        image: string
    }>({
        Produktname: '',
        Hersteller: '',
        Produktkürzel: '',
        Lagerort: '',
        minStockLevel: undefined,
        purchase_price: undefined,
        selling_price: undefined,
        image: ''
    })

    // Multiple features: add with Enter or comma; display as removable badges
    const [featuresList, setFeaturesList] = useState<string[]>([])
    const [featureInputValue, setFeatureInputValue] = useState('')

    const [sizeQuantities, setSizeQuantities] = useState<{ [key: string]: SizeData }>(() => {
        const initial: { [key: string]: SizeData } = {}
        sizeColumns.forEach(size => {
            initial[size] = {
                quantity: undefined,
                mindestmenge: undefined,
                ...(type === 'rady_insole' && { length: 0 }),
                autoOrderLimit: undefined,
                orderQuantity: undefined
            }
        })
        return initial
    })
    const [visibleSizeColumns, setVisibleSizeColumns] = useState<string[]>(() =>
        sizeColumns.slice(0, initialVisibleSizeCount)
    )

    const [increaseAllSizesInput, setIncreaseAllSizesInput] = useState<string>('')
    const [cumulativeIncreaseValue, setCumulativeIncreaseValue] = useState<number>(0)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Hersteller dropdown: brands from API
    const [herstellerDropdownOpen, setHerstellerDropdownOpen] = useState(false)
    const [manufacturers, setManufacturers] = useState<{ id: string; brand: string; type: string }[]>([])
    const [manufacturersTotal, setManufacturersTotal] = useState(0)
    const [loadingManufacturers, setLoadingManufacturers] = useState(false)
    const herstellerSearch = formData.Hersteller
    const debouncedHerstellerSearch = useDebounce(herstellerSearch, 400)
    const herstellerDropdownRef = useRef<HTMLDivElement>(null)
    const [productNameDropdownOpen, setProductNameDropdownOpen] = useState(false)
    const [modelOptions, setModelOptions] = useState<ModelOption[]>([])
    const [loadingModelOptions, setLoadingModelOptions] = useState(false)
    const produktnameDropdownRef = useRef<HTMLDivElement>(null)
    const debouncedProduktnameSearch = useDebounce(formData.Produktname, 300)
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

    const fetchManufacturers = useCallback(async () => {
        setLoadingManufacturers(true)
        try {
            const res = await getAllManufacturers(1, 10, debouncedHerstellerSearch, type)
            if (res?.success && res?.data) {
                setManufacturers(Array.isArray(res.data) ? res.data : [])
                setManufacturersTotal(res?.pagination?.totalItems ?? 0)
            } else {
                setManufacturers([])
                setManufacturersTotal(0)
            }
        } catch {
            setManufacturers([])
            setManufacturersTotal(0)
        } finally {
            setLoadingManufacturers(false)
        }
    }, [debouncedHerstellerSearch, type])

    const fetchModelOptions = useCallback(async () => {
        const selectedBrand = formData.Hersteller.trim()
        if (!selectedBrand) {
            setModelOptions([])
            return
        }

        setLoadingModelOptions(true)
        try {
            const res = await getAllModelName(selectedBrand, '', 100)
            if (res?.success && Array.isArray(res.data)) {
                const uniqueModels = res.data.reduce((acc: ModelOption[], item: ModelOption) => {
                    const alreadyExists = acc.some(
                        (model) => model.productName.trim().toLowerCase() === item.productName.trim().toLowerCase()
                    )
                    if (!alreadyExists) {
                        acc.push(item)
                    }
                    return acc
                }, [])
                setModelOptions(uniqueModels)
            } else {
                setModelOptions([])
            }
        } catch {
            setModelOptions([])
        } finally {
            setLoadingModelOptions(false)
        }
    }, [formData.Hersteller])

    useEffect(() => {
        if (herstellerDropdownOpen) {
            fetchManufacturers()
        }
    }, [herstellerDropdownOpen, fetchManufacturers])

    useEffect(() => {
        if (productNameDropdownOpen) {
            fetchModelOptions()
        }
    }, [productNameDropdownOpen, fetchModelOptions])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (herstellerDropdownRef.current && !herstellerDropdownRef.current.contains(e.target as Node)) {
                setHerstellerDropdownOpen(false)
            }
            if (produktnameDropdownRef.current && !produktnameDropdownRef.current.contains(e.target as Node)) {
                setProductNameDropdownOpen(false)
            }
        }
        if (herstellerDropdownOpen || productNameDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [herstellerDropdownOpen, productNameDropdownOpen])

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                Produktname: '',
                Hersteller: '',
                Produktkürzel: '',
                Lagerort: '',
                minStockLevel: undefined,
                purchase_price: undefined,
                selling_price: undefined,
                image: ''
            })
            setFeaturesList([])
            setFeatureInputValue('')
            setHerstellerDropdownOpen(false)
            setProductNameDropdownOpen(false)
            setModelOptions([])
            setSelectedModelId(null)
            const resetSizes: { [key: string]: SizeData } = {}
            sizeColumns.forEach(size => {
                resetSizes[size] = {
                    quantity: undefined,
                    mindestmenge: undefined,
                    ...(type === 'rady_insole' && { length: 0 }),
                    autoOrderLimit: undefined,
                    orderQuantity: undefined
                }
            })
            setSizeQuantities(resetSizes)
            setVisibleSizeColumns(sizeColumns.slice(0, initialVisibleSizeCount))
            setIncreaseAllSizesInput('')
            setCumulativeIncreaseValue(0)
            setImagePreview(null)
            setImageFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
        if (isOpen) {
            setVisibleSizeColumns(sizeColumns.slice(0, initialVisibleSizeCount))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type])

    const handleInputChange = (field: string, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    /** Preisfelder: leer = kein Wert im State (nur Placeholder sichtbar), Submit → 0 */
    const handleOptionalPriceInput = (field: 'purchase_price' | 'selling_price', raw: string) => {
        const trimmed = raw.trim()
        if (trimmed === '') {
            handleInputChange(field, undefined)
            return
        }
        const n = parseFloat(trimmed.replace(',', '.'))
        if (!Number.isNaN(n)) {
            handleInputChange(field, n)
        }
    }

    const filteredModelOptions = modelOptions.filter((model) =>
        model.productName.toLowerCase().includes(debouncedProduktnameSearch.trim().toLowerCase())
    )
    const isApiModelSelected = Boolean(selectedModelId)

    const handleSizeChange = (size: string, field: keyof SizeData, value: string | number | undefined) => {
        setSizeQuantities(prev => {
            let processedValue: string | number | undefined
            if (value === undefined) {
                processedValue = undefined
            } else if (typeof value === 'string') {
                if (value === '') {
                    if (
                        field === 'autoOrderLimit' ||
                        field === 'orderQuantity' ||
                        field === 'quantity' ||
                        field === 'mindestmenge'
                    ) {
                        processedValue = undefined
                    } else {
                        processedValue = 0
                    }
                } else {
                    const n = parseFloat(value.replace(',', '.'))
                    if (field === 'quantity' || field === 'mindestmenge') {
                        processedValue = Number.isNaN(n) ? undefined : n
                    } else {
                        processedValue = Number.isNaN(n) ? 0 : n
                    }
                }
            } else {
                processedValue = value
            }

            return {
                ...prev,
                [size]: {
                    ...prev[size],
                    [field]: processedValue
                }
            }
        })
    }

    const handleIncreaseAllSizes = () => {
        if (!increaseAllSizesInput || increaseAllSizesInput.trim() === '') {
            return
        }

        const numValue = parseInt(increaseAllSizesInput) || 0
        if (numValue <= 0) return

        // Update all sizes by adding the entered value
        setSizeQuantities(prev => {
            const updatedSizeQuantities = { ...prev }
            Object.keys(updatedSizeQuantities).forEach(size => {
                const currentQuantity = updatedSizeQuantities[size]?.quantity ?? 0
                updatedSizeQuantities[size] = {
                    ...updatedSizeQuantities[size],
                    quantity: currentQuantity + numValue
                }
            })
            return updatedSizeQuantities
        })

        // Update cumulative value and clear input for next entry
        setCumulativeIncreaseValue(prev => prev + numValue)
        setIncreaseAllSizesInput('')
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Bitte wählen Sie eine Bilddatei aus')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Bildgröße darf maximal 5MB betragen')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        setImageFile(file)
        // Create preview URL for display only
        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result as string
            if (result && typeof result === 'string') {
                setImagePreview(result)
            }
        }
        reader.onerror = () => {
            toast.error('Fehler beim Lesen der Bilddatei')
            setImageFile(null)
            setImagePreview(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setImageFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleAddNextSize = () => {
        const nextSize = sizeColumns[visibleSizeColumns.length]
        if (!nextSize) return
        setVisibleSizeColumns(prev => [...prev, nextSize])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.Produktname || !formData.Hersteller) {
            toast.error('Bitte füllen Sie alle Pflichtfelder aus')
            return
        }

        try {
            // Convert sizeQuantities to match ProductFormData interface
            const convertedSizeQuantities: { [key: string]: { length: number; quantity: number; mindestmenge?: number; autoOrderLimit?: number; orderQuantity?: number } } = {}
            visibleSizeColumns.forEach(size => {
                const sizeData = sizeQuantities[size]
                convertedSizeQuantities[size] = {
                    length: sizeData.length ?? 0,
                    quantity: sizeData.quantity ?? 0,
                    ...(sizeData.mindestmenge !== undefined && { mindestmenge: sizeData.mindestmenge }),
                    ...(sizeData.autoOrderLimit !== undefined && { autoOrderLimit: sizeData.autoOrderLimit }),
                    ...(sizeData.orderQuantity !== undefined && { orderQuantity: sizeData.orderQuantity })
                }
            })

            const productData = {
                Produktname: formData.Produktname,
                Hersteller: formData.Hersteller,
                Produktkürzel: formData.Produktkürzel,
                ...(selectedModelId && { model_id: selectedModelId }),
                Lagerort: formData.Lagerort,
                minStockLevel: formData.minStockLevel ?? 0,
                purchase_price: formData.purchase_price ?? 0,
                selling_price: formData.selling_price ?? 0,
                sizeQuantities: convertedSizeQuantities,
                imageFile: imageFile || undefined, // Send file directly, not base64
                ...(featuresList.length > 0 && { features: featuresList })
            }

            const response = await createNewProduct(productData, type)

            if (response.success) {
                toast.success('Produkt erfolgreich erstellt')
                onClose()
                onSuccess(response.data)
            } else {
                toast.error(response.message || 'Fehler beim Erstellen des Produkts')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Erstellen des Produkts'
            toast.error(errorMessage)
        }
    }

    return (
        <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="sm:max-w-5xl max-h-[92vh] overflow-visible p-0 gap-0"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="border-b border-gray-200 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        Produkt manuell hinzufügen
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        {type === 'milling_block' ? 'Fräsblock' : 'Einlagenrohlinge'} anlegen und Bestandsdaten direkt erfassen.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-88px)] flex-col">
                    <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Grunddaten</h3>
                                <p className="text-sm text-gray-500">Basisinformationen zum Produkt und optionales Bild.</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-5 overflow-visible">
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 overflow-visible">
                                        <div ref={produktnameDropdownRef} className="relative self-start">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                                Produktname <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.Produktname}
                                                onChange={(e) => {
                                                    handleInputChange('Produktname', e.target.value)
                                                    setSelectedModelId(null)
                                                }}
                                                onFocus={() => {
                                                    if (formData.Hersteller.trim()) {
                                                        setProductNameDropdownOpen(true)
                                                    }
                                                }}
                                                placeholder=""
                                                required
                                                disabled={isLoading}
                                                className="h-11 border-gray-200 bg-white"
                                            />
                                            {productNameDropdownOpen && formData.Hersteller.trim() && (
                                                <div className="absolute left-0 right-0 z-80 rounded-xl border border-gray-200 bg-white shadow-lg" style={{ top: 'calc(100% + 6px)' }}>
                                                    {loadingModelOptions ? (
                                                        <div className="px-3 py-4 text-sm text-gray-500">Laden...</div>
                                                    ) : (
                                                        <>
                                                            <ul className="max-h-48 overflow-y-auto py-1">
                                                                {filteredModelOptions.map((model) => (
                                                                    <li key={model.id}>
                                                                        <button
                                                                            type="button"
                                                                            className="w-full px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                            onClick={() => {
                                                                                handleInputChange('Produktname', model.productName)
                                                                                setSelectedModelId(model.id)
                                                                                setProductNameDropdownOpen(false)
                                                                            }}
                                                                        >
                                                                            {model.productName}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                                {!loadingModelOptions && filteredModelOptions.length === 0 && (
                                                                    <li className="px-3 py-2 text-sm text-gray-500">Keine Modelle gefunden</li>
                                                                )}
                                                            </ul>
                                                            <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                                                                {filteredModelOptions.length} Modelle gefunden
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div ref={herstellerDropdownRef} className="relative self-start">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                                Hersteller <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.Hersteller}
                                                onChange={(e) => {
                                                    handleInputChange('Hersteller', e.target.value)
                                                    setSelectedModelId(null)
                                                }}
                                                onFocus={() => setHerstellerDropdownOpen(true)}
                                                placeholder=""
                                                required
                                                disabled={isLoading}
                                                className="h-11 border-gray-200 bg-white"
                                            />
                                            {herstellerDropdownOpen && (
                                                <div className="absolute left-0 right-0 z-80 rounded-xl border border-gray-200 bg-white shadow-lg" style={{ top: 'calc(100% + 6px)' }}>
                                                    {loadingManufacturers ? (
                                                        <div className="px-3 py-4 text-sm text-gray-500">Laden...</div>
                                                    ) : (
                                                        <>
                                                            <ul className="max-h-48 overflow-y-auto py-1">
                                                                {manufacturers.map((m) => (
                                                                    <li key={m.id}>
                                                                        <button
                                                                            type="button"
                                                                            className="w-full px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                            onClick={() => {
                                                                                handleInputChange('Hersteller', m.brand)
                                                                                setHerstellerDropdownOpen(false)
                                                                                setProductNameDropdownOpen(false)
                                                                                setModelOptions([])
                                                                                setSelectedModelId(null)
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    Hersteller: m.brand,
                                                                                    Produktname: ''
                                                                                }))
                                                                            }}
                                                                        >
                                                                            {m.brand}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                                {!loadingManufacturers && manufacturers.length === 0 && (
                                                                    <li className="px-3 py-2 text-sm text-gray-500">Keine Marken gefunden</li>
                                                                )}
                                                            </ul>
                                                            <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                                                                {debouncedHerstellerSearch
                                                                    ? `${manufacturersTotal} Marken gefunden für '${debouncedHerstellerSearch}'`
                                                                    : `${manufacturersTotal} Marken gefunden`}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                                Artikelnummer <span className="text-xs font-normal text-gray-400">(optional)</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.Produktkürzel}
                                                onChange={(e) => handleInputChange('Produktkürzel', e.target.value)}
                                                placeholder=""
                                                disabled={isLoading}
                                                className="h-11 border-gray-200 bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                                Lagerort <span className="text-xs font-normal text-gray-400">(optional)</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.Lagerort}
                                                onChange={(e) => handleInputChange('Lagerort', e.target.value)}
                                                placeholder=""
                                                disabled={isLoading}
                                                className="h-11 border-gray-200 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-800">
                                            Produktbild <span className="text-xs font-normal text-gray-400">(optional)</span>
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isLoading}
                                        />
                                        {imagePreview ? (
                                            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                                                <div className="relative h-48 w-full">
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Product preview"
                                                        fill
                                                        className="object-contain p-3"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
                                                    disabled={isLoading}
                                                >
                                                    Entfernen
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isLoading}
                                                className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center transition-colors hover:border-[#61A178] hover:bg-[#f7fbf8]"
                                            >
                                                <svg className="mb-2 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-700">Bild hochladen</p>
                                                <p className="mt-1 text-xs text-gray-500">PNG, JPG oder WEBP bis 5 MB</p>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Preis & Bestand</h3>
                                <p className="text-sm text-gray-500">Einkaufs-, Verkaufspreise und Mindestbestandsmengen.</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                            Einkaufspreis <span className="text-xs font-normal text-gray-400">(optional)</span>
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            placeholder="0"
                                            value={formData.purchase_price === undefined ? '' : formData.purchase_price}
                                            onChange={(e) => handleOptionalPriceInput('purchase_price', e.target.value)}
                                            disabled={isLoading}
                                            className="h-11 border-gray-200 bg-white"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">In Euro (EUR), netto</p>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                            Verkaufspreis <span className="text-xs font-normal text-gray-400">(optional)</span>
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            placeholder="0"
                                            value={formData.selling_price === undefined ? '' : formData.selling_price}
                                            onChange={(e) => handleOptionalPriceInput('selling_price', e.target.value)}
                                            disabled={isLoading}
                                            className="h-11 border-gray-200 bg-white"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Kann leer bleiben oder als Durchschnittspreis verwendet werden.</p>
                                    </div>

                                    {/* <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                            Mindestbestand
                                        </label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={formData.minStockLevel}
                                            onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                                            disabled={isLoading}
                                            className="h-11 border-gray-200 bg-white"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Globale Grenze, falls keine größenbezogene Mindestmenge gesetzt ist.</p>
                                    </div> */}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Größen & Mengen</h3>
                                <p className="text-sm text-gray-500">Bestände, Längen und Nachbestellregeln je Größe.</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-5">
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="w-full max-w-sm">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-800">
                                            Alle Bestände um X ändern
                                            {cumulativeIncreaseValue > 0 && (
                                                <span className="ml-2 text-xs font-normal text-gray-400">Gesamt: {cumulativeIncreaseValue}</span>
                                            )}
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                value={increaseAllSizesInput}
                                                onChange={(e) => setIncreaseAllSizesInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        handleIncreaseAllSizes()
                                                    }
                                                }}
                                                placeholder="+/- Anzahl"
                                                className="h-10 border-gray-200 bg-white"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleIncreaseAllSizes}
                                                className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                                                disabled={isLoading}
                                            >
                                                Anwenden
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Größe</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bestand</TableHead>
                                                {type === 'rady_insole' && (
                                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Länge (cm)</TableHead>
                                                )}
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">MIN. BESTAND</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Auto-Bestellgrenze</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bestellmenge</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {visibleSizeColumns.map(size => (
                                                <TableRow key={size}>
                                                    <TableCell className="font-medium text-gray-800">{size}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            value={sizeQuantities[size]?.quantity === undefined ? '' : sizeQuantities[size].quantity}
                                                            onChange={(e) => handleSizeChange(size, 'quantity', e.target.value)}
                                                            className="h-9 border-gray-200 bg-[#fcfcfc]"
                                                            disabled={isLoading}
                                                        />
                                                    </TableCell>
                                                    {type === 'rady_insole' && (
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                min={0}
                                                                value={sizeQuantities[size]?.length || ''}
                                                                onChange={(e) => handleSizeChange(size, 'length', e.target.value)}
                                                                placeholder="225"
                                                                className="h-9 border-gray-200 bg-[#fcfcfc]"
                                                                disabled={isLoading}
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            value={
                                                                sizeQuantities[size]?.mindestmenge === undefined
                                                                    ? ''
                                                                    : sizeQuantities[size].mindestmenge
                                                            }
                                                            onChange={(e) => handleSizeChange(size, 'mindestmenge', e.target.value)}
                                                            className="h-9 border-gray-200 bg-[#fcfcfc]"
                                                            disabled={isLoading}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            value={sizeQuantities[size]?.autoOrderLimit !== undefined ? sizeQuantities[size]?.autoOrderLimit : ''}
                                                            onChange={(e) => handleSizeChange(size, 'autoOrderLimit', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                            className="h-9 border-gray-200 bg-[#fcfcfc]"
                                                            disabled={isLoading || !isApiModelSelected}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            value={sizeQuantities[size]?.orderQuantity !== undefined ? sizeQuantities[size]?.orderQuantity : ''}
                                                            onChange={(e) => handleSizeChange(size, 'orderQuantity', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                            className="h-9 border-gray-200 bg-[#fcfcfc]"
                                                            disabled={isLoading || !isApiModelSelected}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {visibleSizeColumns.length < sizeColumns.length && (
                                    <div className="mt-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAddNextSize}
                                            disabled={isLoading}
                                            className="cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        >
                                            + Größe hinzufügen
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Erweiterte Optionen</h3>
                                <p className="text-sm text-gray-500">Zusätzliche Merkmale und Eigenschaften.</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-800">
                                        Merkmale <span className="text-xs font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <div className="flex min-h-12 flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-3">
                                        {featuresList.map((item, index) => (
                                            <Badge
                                                key={`${item}-${index}`}
                                                variant="secondary"
                                                className="gap-1 rounded-md bg-[#e8f3ec] px-2 py-1 font-normal text-[#2f6f49]"
                                            >
                                                {item}
                                                <button
                                                    type="button"
                                                    onClick={() => setFeaturesList(prev => prev.filter((_, i) => i !== index))}
                                                    disabled={isLoading}
                                                    className="cursor-pointer rounded-full p-0.5 hover:bg-black/5 focus:outline-none"
                                                    aria-label="Entfernen"
                                                >
                                                    <span className="sr-only">Entfernen</span>
                                                    <span className="text-xs leading-none">×</span>
                                                </button>
                                            </Badge>
                                        ))}
                                        <Input
                                            type="text"
                                            value={featureInputValue}
                                            onChange={(e) => setFeatureInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault()
                                                    const value = featureInputValue.trim()
                                                    if (value) {
                                                        setFeaturesList(prev => [...prev, value])
                                                        setFeatureInputValue('')
                                                    }
                                                }
                                            }}
                                            placeholder="Eingabe + Enter oder Komma"
                                            disabled={isLoading}
                                            className="h-auto min-w-[220px] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="cursor-pointer"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                        >
                            {isLoading ? 'Erstellen...' : 'Hinzufügen'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

    </>
    )
}

