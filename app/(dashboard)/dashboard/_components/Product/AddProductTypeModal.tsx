'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SizeData {
    length?: number;
    quantity: number;
    mindestmenge?: number;
    autoOrderLimit?: number;
    orderQuantity?: number;
}

interface AddProductTypeModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    type: 'rady_insole' | 'milling_block'
}

export default function AddProductTypeModal({ isOpen, onClose, onSuccess, type }: AddProductTypeModalProps) {
    const { createNewProduct, isLoading } = useStockManagementSlice()
    
    // Define size columns based on type
    const sizeColumns = type === 'milling_block' 
        ? ['Size 1', 'Size 2', 'Size 3']
        : ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']

    const [formData, setFormData] = useState({
        Produktname: '',
        Hersteller: '',
        Produktkürzel: '',
        Lagerort: '',
        minStockLevel: 0,
        purchase_price: 0,
        selling_price: 0,
        image: ''
    })

    const [sizeQuantities, setSizeQuantities] = useState<{ [key: string]: SizeData }>(() => {
        const initial: { [key: string]: SizeData } = {}
        sizeColumns.forEach(size => {
            initial[size] = {
                quantity: 0,
                mindestmenge: 0,
                ...(type === 'rady_insole' && { length: 0 }),
                autoOrderLimit: undefined,
                orderQuantity: undefined
            }
        })
        return initial
    })

    const [increaseAllSizesInput, setIncreaseAllSizesInput] = useState<string>('')
    const [cumulativeIncreaseValue, setCumulativeIncreaseValue] = useState<number>(0)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                Produktname: '',
                Hersteller: '',
                Produktkürzel: '',
                Lagerort: '',
                minStockLevel: 0,
                purchase_price: 0,
                selling_price: 0,
                image: ''
            })
            const resetSizes: { [key: string]: SizeData } = {}
            sizeColumns.forEach(size => {
                resetSizes[size] = {
                    quantity: 0,
                    mindestmenge: 0,
                    ...(type === 'rady_insole' && { length: 0 }),
                    autoOrderLimit: undefined,
                    orderQuantity: undefined
                }
            })
            setSizeQuantities(resetSizes)
            setIncreaseAllSizesInput('')
            setCumulativeIncreaseValue(0)
            setImagePreview(null)
            setImageFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type])

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSizeChange = (size: string, field: keyof SizeData, value: string | number | undefined) => {
        setSizeQuantities(prev => {
            const processedValue = value === undefined 
                ? undefined 
                : (typeof value === 'string' 
                    ? (value === '' ? (field === 'autoOrderLimit' || field === 'orderQuantity' ? undefined : 0) : parseFloat(value) || 0)
                    : value)
            
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
                const currentQuantity = updatedSizeQuantities[size]?.quantity || 0
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.Produktname || !formData.Hersteller || !formData.Produktkürzel) {
            toast.error('Bitte füllen Sie alle Pflichtfelder aus')
            return
        }

        try {
            // Convert sizeQuantities to match ProductFormData interface
            const convertedSizeQuantities: { [key: string]: { length: number; quantity: number; mindestmenge?: number; autoOrderLimit?: number; orderQuantity?: number } } = {}
            Object.keys(sizeQuantities).forEach(size => {
                const sizeData = sizeQuantities[size]
                convertedSizeQuantities[size] = {
                    length: sizeData.length ?? 0,
                    quantity: sizeData.quantity,
                    ...(sizeData.mindestmenge !== undefined && { mindestmenge: sizeData.mindestmenge }),
                    ...(sizeData.autoOrderLimit !== undefined && { autoOrderLimit: sizeData.autoOrderLimit }),
                    ...(sizeData.orderQuantity !== undefined && { orderQuantity: sizeData.orderQuantity })
                }
            })

            const productData = {
                Produktname: formData.Produktname,
                Hersteller: formData.Hersteller,
                Produktkürzel: formData.Produktkürzel,
                Lagerort: formData.Lagerort,
                minStockLevel: formData.minStockLevel,
                purchase_price: formData.purchase_price,
                selling_price: formData.selling_price,
                sizeQuantities: convertedSizeQuantities,
                imageFile: imageFile || undefined // Send file directly, not base64
            }

            const response = await createNewProduct(productData, type)
            
            if (response.success) {
                toast.success('Produkt erfolgreich erstellt')
                onClose()
                onSuccess()
            } else {
                toast.error(response.message || 'Fehler beim Erstellen des Produkts')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Erstellen des Produkts'
            toast.error(errorMessage)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Produkt manuell hinzufügen ({type === 'milling_block' ? 'Fräsblock' : 'Einlagenrohlinge'})
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Section - Top */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Produktbild
                        </label>
                        <div className="flex flex-col items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isLoading}
                            />
                            {imagePreview ? (
                                <div className="relative group">
                                    <div className="relative w-64 h-64 border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-gray-50">
                                        <Image
                                            src={imagePreview}
                                            alt="Product preview"
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        disabled={isLoading}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#61A178] hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-600">Bild hochladen</p>
                                    <p className="text-xs text-gray-500 mt-1">Klicken Sie hier oder ziehen Sie ein Bild</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Product Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Produktname <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={formData.Produktname}
                                onChange={(e) => handleInputChange('Produktname', e.target.value)}
                                placeholder="Produktname eingeben"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hersteller <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={formData.Hersteller}
                                onChange={(e) => handleInputChange('Hersteller', e.target.value)}
                                placeholder="Hersteller eingeben"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Artikelnummer <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={formData.Produktkürzel}
                                onChange={(e) => handleInputChange('Produktkürzel', e.target.value)}
                                placeholder="Artikelnummer eingeben"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lagerort
                            </label>
                            <Input
                                type="text"
                                value={formData.Lagerort}
                                onChange={(e) => handleInputChange('Lagerort', e.target.value)}
                                placeholder="Lagerort eingeben"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mindestbestand
                            </label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.minStockLevel}
                                onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Einkaufspreis (€)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={formData.purchase_price}
                                onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value) || 0)}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verkaufspreis (€)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={formData.selling_price}
                                onChange={(e) => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Bulk Quantity Update Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alle Größen um X erhöhen
                                {cumulativeIncreaseValue > 0 && (
                                    <span className="ml-2 text-sm text-gray-500">(Gesamt: {cumulativeIncreaseValue})</span>
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
                                    placeholder="Anzahl eingeben..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    onClick={handleIncreaseAllSizes}
                                    className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                                    disabled={isLoading}
                                >
                                    Hinzufügen
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Size Quantities Table */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Größen & Mengen
                        </label>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-medium">Größe</TableHead>
                                        <TableHead className="font-medium">Bestand</TableHead>
                                        {type === 'rady_insole' && (
                                            <TableHead className="font-medium">Länge (cm)</TableHead>
                                        )}
                                        <TableHead className="font-medium">Mindestmenge</TableHead>
                                        <TableHead className="font-medium">Auto-Bestellgrenze</TableHead>
                                        <TableHead className="font-medium">Bestellmenge</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sizeColumns.map(size => (
                                        <TableRow key={size}>
                                            <TableCell className="font-medium">{size}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={sizeQuantities[size]?.quantity || 0}
                                                    onChange={(e) => handleSizeChange(size, 'quantity', e.target.value)}
                                                    className="w-full"
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
                                                        placeholder="z.B. 150"
                                                        className="w-full"
                                                        disabled={isLoading}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                    value={sizeQuantities[size]?.mindestmenge ?? ''}
                                                    onChange={(e) => handleSizeChange(size, 'mindestmenge', e.target.value)}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="3"
                                                    value={sizeQuantities[size]?.autoOrderLimit !== undefined ? sizeQuantities[size]?.autoOrderLimit : ''}
                                                    onChange={(e) => handleSizeChange(size, 'autoOrderLimit', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="10"
                                                    value={sizeQuantities[size]?.orderQuantity !== undefined ? sizeQuantities[size]?.orderQuantity : ''}
                                                    onChange={(e) => handleSizeChange(size, 'orderQuantity', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
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
    )
}

