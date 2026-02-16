import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Image from 'next/image'

interface MillingBlock {
    id: string
    Produktname: string
    Produktkürzel: string
    Hersteller: string
    Lagerort: string
    minStockLevel: number
    sizeQuantities: { [key: string]: number }
    Status: string
    image?: string
    purchase_price?: number
    selling_price?: number
}

interface MillingBlockImageModalProps {
    product: MillingBlock | null
    isOpen: boolean
    onClose: () => void
}

export default function MillingBlockImageModal({
    product,
    isOpen,
    onClose
}: MillingBlockImageModalProps) {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product.Produktname}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Large Image */}
                    <div className="flex justify-center items-center bg-gray-50 rounded-lg p-6">
                        {product.image ? (
                            <Image
                                width={500}
                                height={500}
                                src={product.image}
                                alt={product.Produktname}
                                className="max-w-full max-h-96 rounded-lg object-contain shadow-lg"
                            />
                        ) : (
                            <div className="w-96 h-96 flex items-center justify-center rounded-lg border-2 border-gray-200 bg-white">
                                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Eigenschaften Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Eigenschaften</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Artikelbezeichnung</p>
                                <p className="text-base text-gray-900">{product.Produktname || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Artikelnummer</p>
                                <p className="text-base text-gray-900">{product.Produktkürzel || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Hersteller</p>
                                <p className="text-base text-gray-900">{product.Hersteller || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Lagerort</p>
                                <p className="text-base text-gray-900">{product.Lagerort || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Mindestbestand</p>
                                <p className="text-base text-gray-900">{product.minStockLevel || 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className="text-base text-gray-900">{product.Status || '-'}</p>
                            </div>
                        </div>

                        {/* Size Quantities Summary */}
                        {product && Object.keys(product.sizeQuantities).length > 0 && (
                            <div className="mt-6 space-y-1">
                                <p className="text-sm font-medium text-gray-500 mb-3">Größenbestand</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(product.sizeQuantities).map(([size, quantity]) => {
                                        const isLowStock = quantity <= product.minStockLevel && quantity > 0;
                                        return (
                                            <div 
                                                key={size} 
                                                className={`p-2 rounded border text-center ${
                                                    isLowStock
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <p className="text-xs font-medium text-gray-500">{size}</p>
                                                <p className={`text-sm font-semibold ${
                                                    isLowStock
                                                        ? 'text-red-600'
                                                        : 'text-gray-900'
                                                }`}>
                                                    {quantity}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

