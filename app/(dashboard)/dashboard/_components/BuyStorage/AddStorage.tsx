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
import { addStorage, getSingleStore } from '@/apis/storeManagement'
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
            length?: number
            quantity: number
        }
    }
    type?: 'rady_insole' | 'milling_block'
    createdAt: string
    updatedAt: string
    storesCount?: number
}

interface AddStorageModalProps {
    isOpen: boolean
    onClose: () => void
    selectedProduct: AdminStoreProduct | null
    onAddSuccess?: () => void
}

// Size columns for rady_insole (numeric sizes)
const radyInsoleSizes = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
]

// Size columns for milling_block (Size 1, Size 2, Size 3)
const millingBlockSizes = ['Size 1', 'Size 2', 'Size 3']

export default function AddStorageModal({ isOpen, onClose, selectedProduct, onAddSuccess }: AddStorageModalProps) {
    const [addingId, setAddingId] = useState<string | null>(null)
    const [productData, setProductData] = useState<AdminStoreProduct | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Normalize groessenMengen keys for milling_block type (convert "1", "2", "3" to "Size 1", "Size 2", "Size 3")
    const normalizeGroessenMengen = (groessenMengen: any, type: string) => {
        if (type === 'milling_block') {
            const normalized: any = {}
            Object.keys(groessenMengen).forEach(key => {
                // Convert "1", "2", "3" to "Size 1", "Size 2", "Size 3"
                const normalizedKey = key.startsWith('Size ') ? key : `Size ${key}`
                normalized[normalizedKey] = groessenMengen[key]
            })
            return normalized
        }
        return groessenMengen
    }

    // Fetch single store data when modal opens
    useEffect(() => {
        const fetchProductData = async () => {
            if (selectedProduct?.id && isOpen) {
                setIsLoading(true)
                try {
                    const response = await getSingleStore(selectedProduct.id)
                    if (response.success && response.data) {
                        // Normalize groessenMengen keys for milling_block
                        const type = response.data.type || 'rady_insole'
                        const normalizedData = {
                            ...response.data,
                            groessenMengen: normalizeGroessenMengen(response.data.groessenMengen, type)
                        }
                        setProductData(normalizedData)
                    }
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'Failed to fetch product data')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchProductData()
    }, [selectedProduct?.id, isOpen])

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setAddingId(null)
            setProductData(null)
        }
    }, [isOpen])

    // Get the product to use (fetched data or selected product)
    const product = productData || selectedProduct
    const productType = product?.type || 'rady_insole'
    const sizeColumns = productType === 'milling_block' ? millingBlockSizes : radyInsoleSizes

    // Calculate total quantity from product's existing quantities
    const calculateTotalQuantity = (): number => {
        if (!productData) return 0
        return Object.values(productData.groessenMengen || {}).reduce((sum, item) => sum + (item.quantity || 0), 0)
    }

    // Calculate total price
    const calculateTotalPrice = (): number => {
        if (!product) return 0
        const totalQuantity = calculateTotalQuantity()
        return product.price * totalQuantity
    }

    // Handle add storage
    const handleAddStorage = async () => {
        if (!product) return

        setAddingId(product.id)
        try {
            const response = await addStorage({ 
                admin_store_id: product.id
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
                        {productType === 'milling_block' 
                            ? 'Alle verfügbaren Größen werden zum Lager hinzugefügt'
                            : 'Alle verfügbaren Größen werden zum Lager hinzugefügt'}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : product && productData && (
                    <div className="space-y-6 py-4">
                        {/* Product Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            {product.image ? (
                                <Image
                                    width={80}
                                    height={80}
                                    src={product.image}
                                    alt={product.productName}
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
                                <h3 className="font-semibold text-lg text-gray-900">{product.productName}</h3>
                                <p className="text-sm text-gray-600">{product.brand}</p>
                                <p className="text-sm text-gray-600">Artikelnummer: {product.artikelnummer}</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">Preis: €{product.price}</p>
                            </div>
                        </div>

                        {/* Quantity Inputs - Disabled */}
                        <div className="space-y-4 opacity-60">
                            <h4 className="font-medium text-gray-900">Mengen pro Größe:</h4>
                            <div className={`grid gap-4 ${
                                productType === 'milling_block' 
                                    ? 'grid-cols-1 sm:grid-cols-3' 
                                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
                            }`}>
                                {sizeColumns.map(size => {
                                    // Use size directly as key (API returns "Size 1", "Size 2", "Size 3" for milling_block)
                                    // Use productData directly to ensure we have the latest data
                                    const existingData = productData.groessenMengen?.[size]
                                    const quantity = existingData?.quantity || 0
                                    const length = existingData?.length
                                    
                                    return (
                                        <div key={size} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                {size}
                                                {productType === 'rady_insole' && length && (
                                                    <span className="text-xs text-gray-500 ml-1">
                                                        ({length}mm)
                                                    </span>
                                                )}
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
                        disabled={addingId === product?.id || isLoading}
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white disabled:opacity-50"
                    >
                        {addingId === product?.id ? 'Hinzufügen...' : 'Hinzufügen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
