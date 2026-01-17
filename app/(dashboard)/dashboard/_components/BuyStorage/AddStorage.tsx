'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { addStorage } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface AdminStoreProduct {
    id: string
    image: string | null
    price: number
    brand: string
    productName: string
    artikelnummer: string
    eigenschaften: string
    groessenMengen: {
        [key: string]: {
            length: number
            quantity: number
        }
    }
    createdAt: string
    updatedAt: string
    storesCount: number
}

interface AddStorageModalProps {
    isOpen: boolean
    onClose: () => void
    selectedProduct: AdminStoreProduct | null
    onAddSuccess?: () => void
}

const sizeColumns = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
]

export default function AddStorageModal({ isOpen, onClose, selectedProduct, onAddSuccess }: AddStorageModalProps) {
    const [addingId, setAddingId] = useState<string | null>(null)

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setAddingId(null)
        }
    }, [isOpen])

    // Calculate total quantity from product's existing quantities
    const calculateTotalQuantity = (): number => {
        if (!selectedProduct) return 0
        return Object.values(selectedProduct.groessenMengen).reduce((sum, item) => sum + (item.quantity || 0), 0)
    }

    // Calculate total price
    const calculateTotalPrice = (): number => {
        if (!selectedProduct) return 0
        const totalQuantity = calculateTotalQuantity()
        return selectedProduct.price * totalQuantity
    }

    // Handle add storage
    const handleAddStorage = async () => {
        if (!selectedProduct) return

        setAddingId(selectedProduct.id)
        try {
            const response = await addStorage({ 
                admin_store_id: selectedProduct.id
            })
            if (response.success) {
                toast.success(response.message || 'Storage added successfully!')
                onClose()
                // Call the refresh callback if provided
                if (onAddSuccess) {
                    onAddSuccess()
                }
            } else {
                toast.error(response.message || 'Failed to add storage')
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to add storage')
        } finally {
            setAddingId(null)
        }
    }

    const handleClose = () => {
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Lager hinzufügen</DialogTitle>
                    <DialogDescription>
                        Geben Sie die gewünschten Mengen für jede Größe ein
                    </DialogDescription>
                </DialogHeader>

                {selectedProduct && (
                    <div className="space-y-6 py-4">
                        {/* Product Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            {selectedProduct.image ? (
                                <Image
                                    width={80}
                                    height={80}
                                    src={selectedProduct.image}
                                    alt={selectedProduct.productName}
                                    className="w-20 h-20 rounded border object-contain border-gray-200 shadow-sm"
                                />
                            ) : (
                                <div className="w-20 h-20 flex items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">{selectedProduct.productName}</h3>
                                <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                                <p className="text-sm text-gray-600">Artikelnummer: {selectedProduct.artikelnummer}</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">Preis: €{selectedProduct.price}</p>
                            </div>
                        </div>

                        {/* Quantity Inputs - Disabled */}
                        <div className="space-y-4 opacity-60">
                            <h4 className="font-medium text-gray-900">Mengen pro Größe:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {sizeColumns.map(size => {
                                    const existingData = selectedProduct.groessenMengen[size]
                                    const quantity = existingData?.quantity || 0
                                    return (
                                        <div key={size} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Größe {size}
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={quantity}
                                                disabled
                                                readOnly
                                                className="w-full bg-gray-100 cursor-not-allowed"
                                                placeholder={quantity.toString()}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Gesamtmenge:</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {calculateTotalQuantity()} Stück
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Gesamtpreis:</p>
                                    <p className="text-2xl font-bold text-[#61A178]">
                                        €{calculateTotalPrice().toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleAddStorage}
                        disabled={addingId === selectedProduct?.id}
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white disabled:opacity-50"
                    >
                        {addingId === selectedProduct?.id ? 'Hinzufügen...' : 'Hinzufügen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
