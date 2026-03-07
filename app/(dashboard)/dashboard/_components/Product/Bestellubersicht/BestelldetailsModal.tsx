'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Ruler, Layers } from 'lucide-react'

export interface SizeQuantity {
    size: string
    quantity: number
}

export interface ProductOrderDetail {
    productName: string
    items: SizeQuantity[]
}

export interface BestelldetailsModalData {
    orderName: string
    sizeRange: string
    /** Single product (legacy) – use productName + items */
    productName?: string
    items?: SizeQuantity[]
    /** Multiple models: quantity ordered per size per model */
    products?: ProductOrderDetail[]
}

const INITIAL_VISIBLE = 3

interface BestelldetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: BestelldetailsModalData | null
    onAddToLager?: () => void
}

const PILL_CLASS =
    'inline-flex items-center gap-1.5 rounded-full bg-[#E0E7ED] px-2.5 py-1 text-sm text-gray-700'

function ProductSection({
    productName,
    items,
}: {
    productName: string
    items: SizeQuantity[]
}) {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? items : items.slice(0, INITIAL_VISIBLE)
    const hasMore = items.length > INITIAL_VISIBLE

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">{productName}</h3>
            <div className="space-y-2.5">
                {visible.map((item, i) => (
                    <div
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-sm"
                    >
                        <span className="flex items-center gap-2 text-gray-700">
                            <span className="text-gray-600">Insole Size:</span>
                            <span className={PILL_CLASS}>
                                <Ruler className="size-3.5 shrink-0 text-gray-600" />
                                {item.size}
                            </span>
                        </span>
                        <span className="flex items-center gap-2 text-gray-700">
                            <span className="text-gray-600">Bestellte Menge</span>
                            <span className={PILL_CLASS}>
                                <Layers className="size-3.5 shrink-0 text-gray-600" />
                                {item.quantity} Stück
                            </span>
                        </span>
                    </div>
                ))}
            </div>
            {hasMore && (
                <div className="flex justify-center pt-1">
                    <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-gray-700 underline hover:no-underline"
                    >
                        {showAll ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default function BestelldetailsModal({
    open,
    onOpenChange,
    data,
    onAddToLager,
}: BestelldetailsModalProps) {
    if (!data) return null

    const productList: ProductOrderDetail[] = data.products?.length
        ? data.products
        : data.productName && data.items
            ? [{ productName: data.productName, items: data.items }]
            : []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-xl border border-gray-200 bg-white p-0 shadow-lg sm:max-w-lg">
                <DialogHeader className="border-b border-gray-200 px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between gap-3 pr-8">
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Bestelldetails {data.orderName}
                        </DialogTitle>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8F5E9] px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                            <Ruler className="size-3.5" />
                            {data.sizeRange}
                        </span>
                    </div>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-4">
                    {productList.length > 0 ? (
                        productList.map((product, idx) => (
                            <ProductSection
                                key={idx}
                                productName={product.productName}
                                items={product.items}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Keine Bestelldaten.</p>
                    )}
                </div>
                <div className="border-t border-gray-200 px-5 py-4">
                    <Button
                        type="button"
                        className="w-full rounded-lg bg-[#61A178] py-3 text-base font-medium text-white hover:bg-[#61A178]/90"
                        onClick={() => {
                            onAddToLager?.()
                            onOpenChange(false)
                        }}
                    >
                        Zu Lager hinzufügen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
