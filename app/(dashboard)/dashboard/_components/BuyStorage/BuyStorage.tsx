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
import { buyStore } from '@/apis/storeManagement'
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

interface BuyStorageModalProps {
    isOpen: boolean
    onClose: () => void
    selectedProduct: AdminStoreProduct | null
    onBuySuccess?: () => void
}

const sizeColumns = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
]

export default function BuyStorageModal({ isOpen, onClose, selectedProduct, onBuySuccess }: BuyStorageModalProps) {
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
    const [buyingId, setBuyingId] = useState<string | null>(null)
    const [showConfirmation, setShowConfirmation] = useState(false)

    // Initialize quantities when product changes
    useEffect(() => {
        if (selectedProduct && isOpen) {
            const initialQuantities: { [key: string]: number } = {}
            sizeColumns.forEach(size => {
                initialQuantities[size] = 0
            })
            setQuantities(initialQuantities)
        }
    }, [selectedProduct, isOpen])

    // Reset quantities when modal closes
    useEffect(() => {
        if (!isOpen) {
            setQuantities({})
            setBuyingId(null)
            setShowConfirmation(false)
        }
    }, [isOpen])

    // Handle quantity change
    const handleQuantityChange = (size: string, value: string) => {
        const numValue = parseInt(value) || 0
        setQuantities(prev => ({
            ...prev,
            [size]: numValue >= 0 ? numValue : 0
        }))
    }

    // Calculate total price
    const calculateTotalPrice = (): number => {
        if (!selectedProduct) return 0
        const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
        return selectedProduct.price * totalQuantity
    }

    // Handle buy - show confirmation first
    const handleBuy = () => {
        if (!selectedProduct) return
        
        const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
        if (totalQuantity === 0) {
            toast.error('Bitte wählen Sie mindestens eine Menge aus')
            return
        }

        // Show confirmation modal
        setShowConfirmation(true)
    }

    // Confirm and submit the order
    const confirmBuy = async () => {
        if (!selectedProduct) return

        setBuyingId(selectedProduct.id)
        setShowConfirmation(false)
        try {
            const response = await buyStore({ admin_store_id: selectedProduct.id })
            if (response.success) {
                toast.success(response.message || 'Store purchased successfully!')
                onClose()
                // Call the refresh callback if provided
                if (onBuySuccess) {
                    onBuySuccess()
                }
            } else {
                toast.error(response.message || 'Failed to purchase store')
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to purchase store')
        } finally {
            setBuyingId(null)
        }
    }

    const handleClose = () => {
        onClose()
        setQuantities({})
        setShowConfirmation(false)
    }

    // Get selected quantities (only sizes with quantity > 0)
    const getSelectedQuantities = () => {
        return Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([size, qty]) => ({ size, quantity: qty }))
    }

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Einlagen bestellen</DialogTitle>
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

                        {/* Quantity Inputs */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Mengen pro Größe:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {sizeColumns.map(size => (
                                    <div key={size} className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Größe {size}
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={quantities[size] || 0}
                                            onChange={(e) => handleQuantityChange(size, e.target.value)}
                                            className="w-full"
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total Price */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Gesamtmenge:</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {Object.values(quantities).reduce((sum, qty) => sum + qty, 0)} Stück
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
                        onClick={handleBuy}
                        disabled={buyingId === selectedProduct?.id || calculateTotalPrice() === 0}
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                    >
                        {buyingId === selectedProduct?.id ? 'Bestellen...' : 'Bestellen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bestellung bestätigen</DialogTitle>
                    <DialogDescription>
                        Bitte überprüfen Sie Ihre Bestellung noch einmal.
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
                                <p className="text-sm text-gray-600">Artikelnummer: {selectedProduct.artikelnummer}</p>
                            </div>
                        </div>

                        {/* Selected Quantities */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Ausgewählte Mengen:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {getSelectedQuantities().map(({ size, quantity }) => (
                                    <div key={size} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-sm font-medium text-gray-700">Größe {size}</span>
                                        <span className="text-sm font-semibold text-gray-900">{quantity} Stück</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Gesamtmenge:</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {totalQuantity} Stück
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

                        {/* Confirmation Question */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                Sind Sie sicher, dass Sie mit dieser Bestellung fortfahren möchten?
                            </p>
                            <p className="text-xs text-gray-600">
                                Nach der Bestätigung wird die Bestellung verbindlich übermittelt.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setShowConfirmation(false)}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={confirmBuy}
                        disabled={buyingId === selectedProduct?.id}
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                    >
                        {buyingId === selectedProduct?.id ? 'Bestellen...' : 'Bestellung bestätigen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}
