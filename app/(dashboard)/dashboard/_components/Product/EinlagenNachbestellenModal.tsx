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
import { buyStore, buySingleStore, getSingleAdminStore } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface AdminStoreData {
    id: string
    image: string | null
    price: number
    brand: string
    productName: string
    artikelnummer: string
    eigenschaften?: string
    groessenMengen: {
        [key: string]: { quantity: number; length?: number }
    }
    type?: 'rady_insole' | 'milling_block'
    features?: string[] | null
}

const radyInsoleSizes = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
]
const millingBlockSizes = ['Size 1', 'Size 2', 'Size 3']

interface EinlagenNachbestellenModalProps {
    isOpen: boolean
    onClose: () => void
    adminStoreId: string | null
    productType: 'rady_insole' | 'milling_block'
    /** Called after successful order; pass storeId to update only that row instead of full table reload */
    onOrderSuccess?: (storeId?: string) => void
    /** When true (e.g. opened from Lagerort "Einlage nachbestellen"): use buySingleStore only */
    initialQuantitiesZero?: boolean
    /** Optional storage/store id – sent in buy body when ordering with groessenMengen */
    storeId?: string | null
}

function normalizeGroessenMengen(groessenMengen: AdminStoreData['groessenMengen'], type: string) {
    if (!groessenMengen) return {}
    if (type === 'milling_block') {
        const normalized: { [key: string]: { quantity: number; length?: number } } = {}
        Object.keys(groessenMengen).forEach(key => {
            const normalizedKey = key.startsWith('Size ') ? key : `Size ${key}`
            normalized[normalizedKey] = groessenMengen[key]
        })
        return normalized
    }
    return groessenMengen
}

export default function EinlagenNachbestellenModal({
    isOpen,
    onClose,
    adminStoreId,
    productType,
    onOrderSuccess,
    initialQuantitiesZero = false,
    storeId = null
}: EinlagenNachbestellenModalProps) {
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
    const [productData, setProductData] = useState<AdminStoreData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const sizeColumns = productType === 'milling_block' ? millingBlockSizes : radyInsoleSizes

    useEffect(() => {
        if (!isOpen || !adminStoreId) return

        const fetchData = async () => {
            setIsLoading(true)
            setProductData(null)
            setQuantities({})
            try {
                const response = await getSingleAdminStore(adminStoreId)
                if (response.success && response.data) {
                    const data = response.data as AdminStoreData
                    const type = data.type || productType
                    const normalized = {
                        ...data,
                        groessenMengen: normalizeGroessenMengen(data.groessenMengen || {}, type)
                    }
                    setProductData(normalized)
                    const initial: { [key: string]: number } = {}
                    const sizes = type === 'milling_block' ? millingBlockSizes : radyInsoleSizes
                    sizes.forEach(size => {
                        if (initialQuantitiesZero) {
                            initial[size] = 0
                        } else {
                            const qty = normalized.groessenMengen?.[size]
                            initial[size] = (typeof qty === 'object' && qty != null && 'quantity' in qty)
                                ? qty.quantity
                                : (typeof qty === 'number' ? qty : 0)
                        }
                    })
                    setQuantities(initial)
                } else {
                    toast.error(response.message || 'Produkt konnte nicht geladen werden')
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Fehler beim Laden')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [isOpen, adminStoreId, productType, initialQuantitiesZero])

    useEffect(() => {
        if (!isOpen) {
            setQuantities({})
            setProductData(null)
        }
    }, [isOpen])

    const handleQuantityChange = (size: string, value: string) => {
        const numValue = parseInt(value, 10) || 0
        setQuantities(prev => ({ ...prev, [size]: numValue >= 0 ? numValue : 0 }))
    }

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
    const totalPrice = productData ? productData.price * totalQuantity : 0

    const buildGroessenMengen = (): Record<string, { length: number; quantity: number }> => {
        const groessenMengen: Record<string, { length: number; quantity: number }> = {}
        sizeColumns.forEach(size => {
            const sizeData = productData!.groessenMengen?.[size]
            const length = typeof sizeData === 'object' && sizeData != null && 'length' in sizeData
                ? (sizeData.length ?? 0)
                : 0
            const quantity = quantities[size] ?? 0
            groessenMengen[size] = { length, quantity }
        })
        return groessenMengen
    }

    const handleOrder = async () => {
        if (!productData || !adminStoreId) return
        if (!initialQuantitiesZero && totalQuantity === 0) {
            toast.error('Bitte wählen Sie mindestens eine Menge aus')
            return
        }
        if (!storeId) {
            toast.error('storeId ist erforderlich')
            return
        }

        setIsSubmitting(true)
        try {
            const groessenMengen = buildGroessenMengen()
            const body = {
                storeId,
                admin_store_id: adminStoreId,
                groessenMengen
            }
            const apiCall = initialQuantitiesZero ? buySingleStore : buyStore
            const response = await apiCall(body)
            if (response.success) {
                toast.success(response.message || 'Bestellung erfolgreich')
                onClose()
                onOrderSuccess?.(storeId ?? undefined)
            } else {
                toast.error(response.message || 'Bestellung fehlgeschlagen')
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Bestellung fehlgeschlagen')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
    }

    const title = productType === 'milling_block' ? 'Fräsblock bestellen' : 'Einlagen bestellen'

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Geben Sie die gewünschten Mengen für jede Größe ein
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-[#61A178]" />
                    </div>
                ) : productData ? (
                    <div className="space-y-6 py-4">
                        {/* Product card */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            {productData.image ? (
                                <Image
                                    width={80}
                                    height={80}
                                    src={productData.image}
                                    alt={productData.productName}
                                    className="w-20 h-20 rounded border object-contain border-gray-200 shadow-sm"
                                />
                            ) : (
                                <div className="w-20 h-20 flex items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg text-gray-900 truncate">{productData.productName}</h3>
                                <p className="text-sm text-gray-600">{productData.brand}</p>
                                <p className="text-sm text-gray-600">Artikelnummer: {productData.artikelnummer}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-lg font-semibold text-gray-900">Preis: €{productData.price}</p>
                            </div>
                        </div>

                        {/* Mengen pro Größe */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Mengen pro Größe:</h4>
                            <div className={`grid gap-4 ${
                                productType === 'milling_block'
                                    ? 'grid-cols-1 sm:grid-cols-3'
                                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
                            }`}>
                                {sizeColumns.map(size => {
                                    const sizeData = productData.groessenMengen?.[size]
                                    const available = typeof sizeData === 'object' && sizeData != null && 'quantity' in sizeData
                                        ? sizeData.quantity
                                        : (typeof sizeData === 'number' ? sizeData : 0)
                                    const length = typeof sizeData === 'object' && sizeData != null && 'length' in sizeData
                                        ? sizeData.length
                                        : undefined
                                    const label =
                                        productType === 'milling_block'
                                            ? `${size} (${initialQuantitiesZero ? available : `Verfügbar: ${available}`})`
                                            : initialQuantitiesZero
                                                ? `Größe ${size} (${available})`
                                                : length != null
                                                    ? `Größe ${size} (${length})`
                                                    : `Größe ${size}`
                                    return (
                                        <div key={size} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 block">
                                                {label}
                                            </label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={initialQuantitiesZero ? undefined : available}
                                                value={initialQuantitiesZero && (quantities[size] ?? 0) === 0 ? '' : (quantities[size] ?? 0)}
                                                onChange={(e) => handleQuantityChange(size, e.target.value)}
                                                className="w-full"
                                                placeholder="0"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Footer: Gesamtmenge + Gesamtpreis */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Gesamtmenge:</p>
                                    <p className="text-lg font-semibold text-gray-900">{totalQuantity} Stück</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Gesamtpreis:</p>
                                    <p className="text-2xl font-bold text-[#61A178]">€{totalPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleOrder}
                        disabled={isLoading || !productData || (!initialQuantitiesZero && totalQuantity === 0) || isSubmitting}
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                    >
                        {isSubmitting ? 'Bestellen...' : 'Bestellen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
