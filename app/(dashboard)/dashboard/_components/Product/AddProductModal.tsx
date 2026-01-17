'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import toast from 'react-hot-toast'

interface AddProductModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

interface SizeData {
    length: number
    quantity: number
    mindestmenge: number
    autoOrderLimit: number
    orderQuantity: number
}

const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    const { createNewProduct, isLoading } = useStockManagementSlice()

    const [formData, setFormData] = useState({
        Produktname: '',
        Hersteller: '',
        Produktkürzel: '',
        Lagerort: '',
        minStockLevel: 0,
        purchase_price: 0,
        selling_price: 0,
    })

    const [sizeQuantities, setSizeQuantities] = useState<{ [key: string]: SizeData }>(() => {
        const initial: { [key: string]: SizeData } = {}
        sizes.forEach(size => {
            initial[size] = {
                length: 0,
                quantity: 0,
                mindestmenge: 0,
                autoOrderLimit: 0,
                orderQuantity: 0,
            }
        })
        return initial
    })

    const [bulkUpdateValue, setBulkUpdateValue] = useState('')

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSizeChange = (size: string, field: keyof SizeData, value: string | number) => {
        setSizeQuantities(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                [field]: typeof value === 'string' ? (value === '' ? 0 : parseFloat(value) || 0) : value
            }
        }))
    }

    // Helper to get display value (empty string if 0, otherwise the value)
    const getDisplayValue = (value: number): string => {
        return value === 0 ? '' : value.toString()
    }

    const handleBulkUpdate = () => {
        const increment = parseFloat(bulkUpdateValue) || 0
        if (increment === 0) return

        setSizeQuantities(prev => {
            const updated = { ...prev }
            sizes.forEach(size => {
                updated[size] = {
                    ...updated[size],
                    quantity: updated[size].quantity + increment
                }
            })
            return updated
        })
        setBulkUpdateValue('')
        toast.success(`Alle Größen um ${increment} erhöht`)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.Produktname.trim()) {
            toast.error('Produktname ist erforderlich')
            return
        }
        if (!formData.Hersteller.trim()) {
            toast.error('Hersteller ist erforderlich')
            return
        }
        if (!formData.Produktkürzel.trim()) {
            toast.error('Artikelnummer ist erforderlich')
            return
        }

        try {
            const productData = {
                Produktname: formData.Produktname,
                Hersteller: formData.Hersteller,
                Produktkürzel: formData.Produktkürzel,
                Lagerort: formData.Lagerort,
                minStockLevel: formData.minStockLevel,
                purchase_price: formData.purchase_price,
                selling_price: formData.selling_price,
                sizeQuantities: sizeQuantities
            }

            const response = await createNewProduct(productData)
            
            if (response.success) {
                toast.success('Produkt erfolgreich erstellt')
                handleClose()
                if (onSuccess) {
                    onSuccess()
                }
            } else {
                toast.error(response.message || 'Fehler beim Erstellen des Produkts')
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Erstellen des Produkts'
            toast.error(errorMessage)
        }
    }

    const handleClose = () => {
        // Reset form
        setFormData({
            Produktname: '',
            Hersteller: '',
            Produktkürzel: '',
            Lagerort: '',
            minStockLevel: 0,
            purchase_price: 0,
            selling_price: 0,
        })
        const resetSizes: { [key: string]: SizeData } = {}
        sizes.forEach(size => {
            resetSizes[size] = {
                length: 0,
                quantity: 0,
                mindestmenge: 0,
                autoOrderLimit: 0,
                orderQuantity: 0,
            }
        })
        setSizeQuantities(resetSizes)
        setBulkUpdateValue('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center justify-between">
                        <span>Produkt manuell hinzufügen</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Produktname
                            </label>
                            <Input
                                type="text"
                                value={formData.Produktname}
                                onChange={(e) => handleInputChange('Produktname', e.target.value)}
                                placeholder="Produktname eingeben"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hersteller
                            </label>
                            <Input
                                type="text"
                                value={formData.Hersteller}
                                onChange={(e) => handleInputChange('Hersteller', e.target.value)}
                                placeholder="Hersteller eingeben"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Artikelnummer
                            </label>
                            <Input
                                type="text"
                                value={formData.Produktkürzel}
                                onChange={(e) => handleInputChange('Produktkürzel', e.target.value)}
                                placeholder="Artikelnummer eingeben"
                                required
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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Einkaufspreis (€)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.purchase_price === 0 ? '' : formData.purchase_price}
                                onChange={(e) => handleInputChange('purchase_price', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verkaufspreis (€)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.selling_price === 0 ? '' : formData.selling_price}
                                onChange={(e) => handleInputChange('selling_price', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mindestbestand
                            </label>
                            <Input
                                type="number"
                                value={formData.minStockLevel === 0 ? '' : formData.minStockLevel}
                                onChange={(e) => handleInputChange('minStockLevel', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Bulk Update Section */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Alle Größen um X erhöhen
                            </label>
                            <Input
                                type="number"
                                value={bulkUpdateValue}
                                onChange={(e) => setBulkUpdateValue(e.target.value)}
                                placeholder="Anzahl eingeben..."
                                className="max-w-[200px]"
                            />
                            <Button
                                type="button"
                                onClick={handleBulkUpdate}
                                className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                            >
                                Hinzufügen
                            </Button>
                        </div>
                    </div>

                    {/* Sizes & Quantities Table */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Größen & Mengen</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 text-sm font-medium text-gray-700">Größe</th>
                                        <th className="text-left p-2 text-sm font-medium text-gray-700">Bestand</th>
                                        <th className="text-left p-2 text-sm font-medium text-gray-700">Länge (cm)</th>
                                        <th className="text-left p-2 text-sm font-medium text-gray-700">Mindestmenge</th>
                                        <th className="text-left p-2 text-sm font-medium text-gray-700">Auto-Befüllgrenze</th>
                                        <th className="text-left p-2 text-sm font-medium text-gray-700">Bestellmenge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sizes.map((size) => (
                                        <tr key={size} className="border-b hover:bg-gray-50">
                                            <td className="p-2 text-sm text-gray-900">{size}</td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={getDisplayValue(sizeQuantities[size].quantity)}
                                                    onChange={(e) => handleSizeChange(size, 'quantity', e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 h-8"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={getDisplayValue(sizeQuantities[size].length)}
                                                    onChange={(e) => handleSizeChange(size, 'length', e.target.value)}
                                                    placeholder="z.B. 150"
                                                    className="w-32 h-8"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={getDisplayValue(sizeQuantities[size].mindestmenge)}
                                                    onChange={(e) => handleSizeChange(size, 'mindestmenge', e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 h-8"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={getDisplayValue(sizeQuantities[size].autoOrderLimit)}
                                                    onChange={(e) => handleSizeChange(size, 'autoOrderLimit', e.target.value)}
                                                    placeholder="0"
                                                    className="w-24 h-8"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    value={getDisplayValue(sizeQuantities[size].orderQuantity)}
                                                    onChange={(e) => handleSizeChange(size, 'orderQuantity', e.target.value)}
                                                    placeholder="0"
                                                    className="w-24 h-8"
                                                    min="0"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Wird erstellt...' : 'Produkt erstellen'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

