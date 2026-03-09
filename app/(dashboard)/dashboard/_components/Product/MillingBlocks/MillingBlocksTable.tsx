import React, { useState, useEffect } from 'react'
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
import { IoTime } from 'react-icons/io5'
import { IoCreate } from 'react-icons/io5'
import { IoTrash } from 'react-icons/io5'
import Image from 'next/image'
import MillingBlockImageModal from './MillingBlockImageModal'
import EinlagenNachbestellenModal from '../EinlagenNachbestellenModal'
import EditMillingBlock from './EditMillingBlock'
import { getSingleStorage } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import MillingBlockHistory from './MillingBlockHistory'
import DeleteMillingBlockModal from './DeleteMillingBlockModal'
import ProductManagementTableShimmer from '@/components/ShimmerEffect/Product/ProductManagementTableShimmer'

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
    features?: string[]
    create_status?: string
    adminStoreId?: string | null
}

// Helper function to truncate text to 15 characters with ".."
const truncateText = (text: string, maxLength: number = 15): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '..';
}

// Helper function to get quantity from sizeQuantities
const getQuantity = (sizeData: number | undefined): number => {
    if (sizeData === undefined) return 0;
    return sizeData;
}

interface MillingBlocksTableProps {
    visibleProducts: MillingBlock[]
    sizeColumns: string[]
    onShowHistory: (product: MillingBlock) => void
    hasLowStock: (product: MillingBlock) => boolean
    getLowStockSizes: (product: MillingBlock) => Array<{ size: string; quantity: number }>
    onUpdateProduct: (product: MillingBlock) => void
    onDeleteProduct: (product: MillingBlock) => void
    isLoading?: boolean
    onOrderSuccess?: () => void
}

export default function MillingBlocksTable({
    visibleProducts,
    sizeColumns,
    onShowHistory,
    hasLowStock,
    getLowStockSizes,
    onUpdateProduct,
    onDeleteProduct,
    isLoading = false,
    onOrderSuccess
}: MillingBlocksTableProps) {
    const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null)
    const [selectedProductForImage, setSelectedProductForImage] = useState<MillingBlock | null>(null)
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [orderModalOpen, setOrderModalOpen] = useState(false)
    const [orderAdminStoreId, setOrderAdminStoreId] = useState<string | null>(null)
    const [selectedProductForEdit, setSelectedProductForEdit] = useState<MillingBlock | null>(null)

    // Convert API single-storage response to MillingBlock (normalize size keys for milling_block)
    const apiDataToMillingBlock = (data: any): MillingBlock => {
        const normalizedGroessenMengen: { [key: string]: number } = {}
        const raw = data.groessenMengen || {}
        Object.keys(raw).forEach(key => {
            const normalizedKey = key.startsWith('Size ') ? key : `Size ${key}`
            const val = raw[key]
            normalizedGroessenMengen[normalizedKey] = typeof val === 'object' ? val?.quantity : val
        })
        return {
            id: data.id,
            Produktname: data.produktname,
            Produktkürzel: data.artikelnummer,
            Hersteller: data.hersteller,
            Lagerort: data.lagerort,
            minStockLevel: data.mindestbestand,
            sizeQuantities: normalizedGroessenMengen,
            Status: data.Status,
            image: data.image,
            purchase_price: data.purchase_price,
            selling_price: data.selling_price,
            features: Array.isArray(data.features) ? data.features : undefined,
            create_status: data.create_status,
            adminStoreId: data.adminStoreId ?? null,
        }
    }

    // When user clicks Lagerort image: fetch single product and show modal
    useEffect(() => {
        if (!selectedProductIdForModal) return

        let cancelled = false
        setIsModalLoading(true)
        setSelectedProductForImage(null)

        getSingleStorage(selectedProductIdForModal)
            .then((response: any) => {
                if (cancelled || !response?.success || !response?.data) return
                setSelectedProductForImage(apiDataToMillingBlock(response.data))
            })
            .catch((err: any) => {
                if (!cancelled) {
                    toast.error(err?.response?.data?.message || 'Produkt konnte nicht geladen werden')
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsModalLoading(false)
                    setSelectedProductIdForModal(null)
                }
            })

        return () => { cancelled = true }
    }, [selectedProductIdForModal])
    const [selectedProductForHistory, setSelectedProductForHistory] = useState<MillingBlock | null>(null)
    const [selectedProductForDelete, setSelectedProductForDelete] = useState<MillingBlock | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Helper to get stock for a size
    function getStockForSize(product: MillingBlock, size: string) {
        return getQuantity(product.sizeQuantities[size]);
    }

    if (isLoading) {
        return <ProductManagementTableShimmer sizeColumns={sizeColumns} rows={5} />
    }

    return (
        <>
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                <Table className='w-full bg-white rounded-lg overflow-hidden'>
                    <TableHeader>
                        <TableRow className="border-b bg-white">
                            <TableHead className="p-3 text-left font-medium text-gray-900">Lagerort</TableHead>
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
                                    <TableCell className="p-3">
                                        {/* Product Image Only - Clickable */}
                                        <div 
                                            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedProductIdForModal(product.id)}
                                        >
                                            {product.image ? (
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src={product.image}
                                                    alt={product.Produktname}
                                                    className="w-20 h-20 rounded border object-contain border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 flex items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
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
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-help">
                                                        {truncateText(product.Produktname)}
                                                    </span>
                                                </TooltipTrigger>
                                                {product.Produktname.length > 15 && (
                                                    <TooltipContent>
                                                        <p>{product.Produktname}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
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
                                                            {getLowStockSizes(product).map(({ size, quantity }) => (
                                                                <p key={size}>
                                                                    {size}: {quantity} Stück
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
                                            onClick={() => setSelectedProductForHistory(product)}
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
                                                onClick={() => setSelectedProductForEdit(product)}
                                                className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            >
                                                <IoCreate className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setSelectedProductForDelete(product)}
                                                className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <IoTrash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    {sizeColumns.map(size => {
                                        const stock = getStockForSize(product, size);
                                        const isLowStock = stock <= product.minStockLevel && stock > 0;
                                        return (
                                            <TableCell key={size} className="p-3 text-center text-gray-900">
                                                <span
                                                    className={isLowStock ? 'text-red-600 font-semibold' : ''}
                                                >
                                                    {stock}
                                                </span>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Image View Modal – fetch single product on Lagerort click, then show (same design as Einlagenrohlinge) */}
            <MillingBlockImageModal
                product={selectedProductForImage}
                isOpen={!!selectedProductIdForModal || !!selectedProductForImage}
                onClose={() => {
                    setSelectedProductIdForModal(null)
                    setSelectedProductForImage(null)
                }}
                isLoading={!!selectedProductIdForModal}
                categoryName="Fräsblock"
                onOrderClick={(adminStoreId) => {
                    setOrderAdminStoreId(adminStoreId)
                    setSelectedProductForImage(null)
                    setSelectedProductIdForModal(null)
                    setOrderModalOpen(true)
                }}
            />

            {/* Order modal – only for products with create_status === 'by_admin' */}
            <EinlagenNachbestellenModal
                isOpen={orderModalOpen}
                onClose={() => {
                    setOrderModalOpen(false)
                    setOrderAdminStoreId(null)
                }}
                adminStoreId={orderAdminStoreId}
                productType="milling_block"
                onOrderSuccess={onOrderSuccess}
            />

            {/* Edit Modal */}
            <EditMillingBlock
                product={selectedProductForEdit}
                isOpen={!!selectedProductForEdit}
                onClose={() => setSelectedProductForEdit(null)}
                onUpdated={(updatedProduct) => {
                    onUpdateProduct(updatedProduct)
                    setSelectedProductForEdit(null)
                }}
                sizeColumns={sizeColumns}
            />

            {/* History Modal */}
            <MillingBlockHistory
                product={selectedProductForHistory}
                isOpen={!!selectedProductForHistory}
                onClose={() => setSelectedProductForHistory(null)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteMillingBlockModal
                isOpen={!!selectedProductForDelete}
                onClose={() => {
                    setSelectedProductForDelete(null)
                    setIsDeleting(false)
                }}
                onConfirm={async () => {
                    if (!selectedProductForDelete) return
                    setIsDeleting(true)
                    try {
                        await onDeleteProduct(selectedProductForDelete)
                        setSelectedProductForDelete(null)
                    } catch (error) {
                        console.error('Delete failed:', error)
                    } finally {
                        setIsDeleting(false)
                    }
                }}
                product={selectedProductForDelete}
                isLoading={isDeleting}
            />
        </>
    )
}

