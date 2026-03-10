import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import Image from 'next/image'
import { Button } from "@/components/ui/button"

interface MillingBlock {
    id: string
    Produktname: string
    Produktkürzel: string
    Hersteller: string
    Lagerort: string
    minStockLevel: number
    sizeQuantities: { [key: string]: number | { quantity?: number; auto_order_quantity?: number } }
    Status: string
    image?: string
    purchase_price?: number
    selling_price?: number
    features?: string[]
    create_status?: string
    adminStoreId?: string | null
}

interface MillingBlockImageModalProps {
    product: MillingBlock | null
    isOpen: boolean
    onClose: () => void
    /** Show loading spinner inside modal (e.g. while fetching single product) */
    isLoading?: boolean
    /** Category label for modal header, e.g. "Fräsblock" – same design as Einlagenrohlinge modal */
    categoryName?: string
    /** Called when "Einlage nachbestellen" is clicked (only when create_status === 'by_admin'). Opens order modal. Passes adminStoreId and storeId (table product id). */
    onOrderClick?: (adminStoreId: string, storeId: string) => void
}

export default function MillingBlockImageModal({
    product,
    isOpen,
    onClose,
    isLoading = false,
    categoryName = 'Fräsblock',
    onOrderClick
}: MillingBlockImageModalProps) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
                <DialogTitle className="sr-only">
                    {isLoading ? 'Produktdetails werden geladen' : product ? `${product.Produktname} – Produktdetails` : 'Produktdetails'}
                </DialogTitle>
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-[#61A178]" />
                    </div>
                ) : product ? (
                <div className="space-y-0">
                    {/* Product Image – top, prominent (same as Einlagenrohlinge modal) */}
                    <div className="flex justify-center items-center bg-white pt-6 pb-4">
                        {product.image ? (
                            <Image
                                width={400}
                                height={280}
                                src={product.image}
                                alt={product.Produktname}
                                className="max-w-full max-h-72 w-auto h-auto rounded-lg object-contain"
                            />
                        ) : (
                            <div className="w-72 h-48 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Dynamic header – category, then product name (same as Einlagenrohlinge) */}
                    <div className="px-6 pb-2">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {categoryName}, {product.Produktname || '–'}
                        </h2>
                    </div>

                    {/* Bottom section: features list then one button (same design as Einlagenrohlinge) */}
                    <div className="px-6 pt-4 pb-6 border-gray-100">
                        {product.features && product.features.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-sm text-gray-900 mb-6">
                                {product.features.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 mb-6">Keine Eigenschaften hinterlegt.</p>
                        )}
                        {product.create_status === 'by_admin' && product.adminStoreId ? (
                            <Button
                                className="w-fit bg-[#65b87c] hover:bg-[#5aa86e] text-white font-medium rounded-lg py-2.5 cursor-pointer"
                                onClick={() => onOrderClick?.(product.adminStoreId!, product.id)}
                            >
                                Einlage nachbestellen
                            </Button>
                        ) : (
                            <Button
                                className="w-fit bg-[#65b87c] text-white font-medium rounded-lg py-2.5 opacity-50 cursor-not-allowed"
                                disabled
                            >
                                Einlage nachbestellen
                            </Button>
                        )}
                    </div>
                </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
