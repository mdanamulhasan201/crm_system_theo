import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { IoWarning } from 'react-icons/io5'
import { IoTime } from 'react-icons/io5'
import { IoCreate } from 'react-icons/io5'
import { IoTrash } from 'react-icons/io5'
import AddProduct from './AddProduct'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import ProductManagementTableShimmer from '@/components/ShimmerEffect/Product/ProductManagementTableShimmer'
import Image from 'next/image'

interface SizeData {
    length: number;
    quantity: number;
    mindestmenge?: number;
    warningStatus?: string;
}

interface Product {
    id: string
    Produktname: string
    Produktkürzel: string
    Hersteller: string
    Lagerort: string
    minStockLevel: number
    sizeQuantities: { [key: string]: number | SizeData }
    Status: string
    image?: string
    inventoryHistory: Array<{
        id: string
        date: string
        type: 'delivery' | 'sale' | 'correction' | 'transfer'
        quantity: number
        size: string
        previousStock: number
        newStock: number
        user: string
        notes: string
    }>
}

// Helper function to get quantity from sizeQuantities (handles both old and new format)
const getQuantity = (sizeData: number | SizeData | undefined): number => {
    if (sizeData === undefined) return 0;
    if (typeof sizeData === 'number') return sizeData;
    return sizeData.quantity || 0;
}

interface ProductManagementTableProps {
    visibleProducts: Product[]
    sizeColumns: string[]
    onShowHistory: (product: Product) => void
    hasLowStock: (product: Product) => boolean
    getLowStockSizes: (product: Product) => Array<{ size: string; quantity: number; warningStatus?: string }>
    onUpdateProduct: (product: Product) => void
    onDeleteProduct: (product: Product) => void
    isLoading?: boolean
}

export default function ProductManagementTable({
    visibleProducts,
    sizeColumns,
    onShowHistory,
    hasLowStock,
    getLowStockSizes,
    onUpdateProduct,
    onDeleteProduct,
    isLoading = false
}: ProductManagementTableProps) {
    const { getProductById } = useStockManagementSlice();
    const [editId, setEditId] = useState<string | undefined>(undefined)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedProductForImage, setSelectedProductForImage] = useState<Product | null>(null)

    // Helper to get stock for a size
    function getStockForSize(product: Product, size: string) {
        return getQuantity(product.sizeQuantities[size]);
    }

    const getSizeWarningStatus = (product: Product, size: string): string | undefined => {
        const sizeData = product.sizeQuantities[size];
        if (typeof sizeData === 'object' && sizeData !== null) {
            return sizeData.warningStatus;
        }
        return undefined;
    };

    if (isLoading) {
        return <ProductManagementTableShimmer sizeColumns={sizeColumns} rows={5} />
    }

    return (
        <>
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                <Table className='w-full bg-white rounded-lg overflow-hidden'>
                    <TableHeader>
                        <TableRow className="border-b bg-white">
                            <TableHead className="p-3 text-left font-medium text-gray-900">Bild</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Hersteller</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Artikelbezeichnung</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Artikelnummer</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Bestandswarnung</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Historie</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Aktionen</TableHead>
                            {sizeColumns.map(size => (
                                <TableHead key={size} className="p-3 text-center font-medium text-gray-900">{size}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={sizeColumns.length + 7}
                                    className="p-8 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="text-gray-400 mb-2">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Produkte gefunden</h3>
                                        <p className="text-gray-500 text-sm">Es wurden keine Produkte in der Datenbank gefunden.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleProducts.map((product) => (
                                <TableRow key={product.id} className="border-b bg-white">
                                    <TableCell className="p-3 w-20 min-w-[80px]">
                                        {/* Product Image Only - Clickable */}
                                        <div 
                                            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity w-20 h-20 min-w-[80px] min-h-[80px]"
                                            onClick={() => setSelectedProductForImage(product)}
                                        >
                                            {product.image ? (
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src={product.image}
                                                    alt={product.Produktname}
                                                    className="w-20 h-20 min-w-[80px] min-h-[80px] rounded border object-contain border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 min-w-[80px] min-h-[80px] flex items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.Hersteller}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.Produktname && product.Produktname.length > 15 
                                            ? `${product.Produktname.substring(0, 15)}...` 
                                            : product.Produktname}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.Produktkürzel}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    {hasLowStock(product) ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Niedriger Bestand
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Voller Bestand
                                                        </span>
                                                    )}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {hasLowStock(product) ? (
                                                        <div>
                                                            <p className="font-medium mb-1">Niedriger Bestand:</p>
                                                            {getLowStockSizes(product).map(({ size, quantity, warningStatus }) => (
                                                                <p key={size}>
                                                                    Größe {size}: {quantity} Stück
                                                                    {warningStatus && ` (${warningStatus})`}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p>Bestand ist ausreichend</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onShowHistory(product)}
                                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        >
                                            <IoTime className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={async () => {
                                                    setEditId(product.id);
                                                    setOpenEdit(true);
                                                }}
                                                className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            >
                                                <IoCreate className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onDeleteProduct(product)}
                                                className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <IoTrash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    {sizeColumns.map(size => (
                                        <TableCell key={size} className="p-3 text-center text-gray-900">
                                            <span
                                                className={`${getSizeWarningStatus(product, size)?.includes('Niedriger Bestand')
                                                        ? 'text-red-600 font-semibold'
                                                        : ''
                                                    }`}
                                            >
                                                {getStockForSize(product, size)}
                                            </span>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Hidden Edit Modal controlled here */}
            {editId && (
                <AddProduct
                    onAddProduct={() => { }}
                    sizeColumns={sizeColumns}
                    editProductId={editId}
                    open={openEdit}
                    onOpenChange={(o) => {
                        setOpenEdit(o)
                        if (!o) setEditId(undefined)
                    }}
                    showTrigger={false}
                    onUpdated={async () => {
                        try {
                            // Fetch the updated product from API and update only that row
                            const apiProduct: any = await getProductById(editId);
                            const updatedProduct: Product = {
                                id: apiProduct.id,
                                Produktname: apiProduct.produktname,
                                Produktkürzel: apiProduct.artikelnummer,
                                Hersteller: apiProduct.hersteller,
                                Lagerort: apiProduct.lagerort,
                                minStockLevel: apiProduct.mindestbestand,
                                sizeQuantities: apiProduct.groessenMengen,
                                Status: apiProduct.Status,
                                inventoryHistory: []
                            };
                            onUpdateProduct(updatedProduct);
                        } catch (err) {
                            console.error('Failed to fetch updated product', err);
                        }
                    }}
                />
            )}

            {/* Image View Modal with Eigenschaften */}
            <Dialog open={!!selectedProductForImage} onOpenChange={(open) => !open && setSelectedProductForImage(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedProductForImage?.Produktname}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Large Image */}
                        <div className="flex justify-center items-center bg-gray-50 rounded-lg p-6">
                            {selectedProductForImage?.image ? (
                                <Image
                                    width={500}
                                    height={500}
                                    src={selectedProductForImage.image}
                                    alt={selectedProductForImage.Produktname}
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
                                    <p className="text-base text-gray-900">{selectedProductForImage?.Produktname || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Artikelnummer</p>
                                    <p className="text-base text-gray-900">{selectedProductForImage?.Produktkürzel || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Hersteller</p>
                                    <p className="text-base text-gray-900">{selectedProductForImage?.Hersteller || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Lagerort</p>
                                    <p className="text-base text-gray-900">{selectedProductForImage?.Lagerort || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Mindestbestand</p>
                                    <p className="text-base text-gray-900">{selectedProductForImage?.minStockLevel || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-base text-gray-900">{selectedProductForImage?.Status || '-'}</p>
                                </div>
                            </div>

                            {/* Size Quantities Summary */}
                            {selectedProductForImage && Object.keys(selectedProductForImage.sizeQuantities).length > 0 && (
                                <div className="mt-6 space-y-1">
                                    <p className="text-sm font-medium text-gray-500 mb-3">Größenbestand</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
                                        {Object.entries(selectedProductForImage.sizeQuantities).map(([size, sizeData]) => {
                                            const quantity = getQuantity(sizeData);
                                            const warningStatus = typeof sizeData === 'object' && sizeData !== null ? sizeData.warningStatus : undefined;
                                            return (
                                                <div 
                                                    key={size} 
                                                    className={`p-2 rounded border text-center ${
                                                        warningStatus?.includes('Niedriger Bestand')
                                                            ? 'bg-red-50 border-red-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    <p className="text-xs font-medium text-gray-500">{size}</p>
                                                    <p className={`text-sm font-semibold ${
                                                        warningStatus?.includes('Niedriger Bestand')
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
        </>
    )
}
