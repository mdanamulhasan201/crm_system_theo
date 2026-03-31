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
import { Download, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import MillingBlockImageModal from './MillingBlockImageModal'
import EinlagenNachbestellenModal from '../EinlagenNachbestellenModal'
import EditMillingBlock from './EditMillingBlock'
import { getSingleStorage, switchStore } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import MillingBlockHistory from './MillingBlockHistory'
import DeleteMillingBlockModal from './DeleteMillingBlockModal'
import ProductManagementTableShimmer from '@/components/ShimmerEffect/Product/ProductManagementTableShimmer'
import { normalizeFeatures } from '../featureUtils'
import AutoOrderConfirmDialog from '../AutoOrderConfirmDialog'
import {
    downloadBestellscheinPdf,
    ReorderRow,
    shouldShowBestellscheinDownload,
} from '@/lib/bestellscheinPdf'
import BestellscheinPdfModal from '../BestellscheinPdfModal'

interface MillingBlock {
    id: string
    Produktname: string
    Produktkürzel: string
    Hersteller: string
    Lagerort: string
    minStockLevel: number
    sizeQuantities: { [key: string]: number | { quantity?: number } }
    Status: string
    image?: string
    purchase_price?: number
    selling_price?: number
    features?: string[]
    create_status?: string
    adminStoreId?: string | null
    auto_order?: boolean
    able_auto_order?: string
    overviewSizeQuantities?: { [key: string]: { length?: number; quantity: number } }
    store_brand_settings?: {
        brand?: string
        type?: string
        isActive?: boolean
        isPdf?: boolean
    } | null
}

// Helper function to truncate text to 15 characters with ".."
const truncateText = (text: string, maxLength: number = 15): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '..';
}

// Helper function to get quantity from sizeQuantities
const getQuantity = (sizeData: number | { quantity?: number } | undefined): number => {
    if (sizeData === undefined) return 0;
    if (typeof sizeData === 'number') return sizeData;
    return sizeData?.quantity ?? 0;
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
    onOrderSuccess?: (storeId?: string) => void
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
    const [orderStoreId, setOrderStoreId] = useState<string | null>(null)
    const [selectedProductForEdit, setSelectedProductForEdit] = useState<MillingBlock | null>(null)
    const [togglingAutoOrderId, setTogglingAutoOrderId] = useState<string | null>(null)
    const [autoOrderConfirmProduct, setAutoOrderConfirmProduct] = useState<MillingBlock | null>(null)
    const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null)
    const [pdfModalOpen, setPdfModalOpen] = useState(false)
    const [pdfModalProduct, setPdfModalProduct] = useState<any | null>(null)
    const [isPdfSubmitting, setIsPdfSubmitting] = useState(false)

    // Convert API single-storage response to MillingBlock (normalize size keys for milling_block)
    const apiDataToMillingBlock = (data: any): MillingBlock => {
        const normalizedFeatures = normalizeFeatures(data.features)
        const normalizedGroessenMengen: MillingBlock['sizeQuantities'] = {}
        const raw = data.groessenMengen || {}
        Object.keys(raw).forEach(key => {
            const normalizedKey = key.startsWith('Size ') ? key : `Size ${key}`
            const val = raw[key]
            if (typeof val === 'object' && val != null) {
                normalizedGroessenMengen[normalizedKey] = { quantity: val?.quantity ?? 0 }
            } else {
                normalizedGroessenMengen[normalizedKey] = typeof val === 'number' ? val : 0
            }
        })
        const normalizedOverviewGroessenMengen: NonNullable<MillingBlock['overviewSizeQuantities']> = {}
        const overviewRaw = data.overview_groessenMengen || {}
        Object.keys(overviewRaw).forEach(key => {
            const normalizedKey = key.startsWith('Size ') ? key : `Size ${key}`
            const val = overviewRaw[key]
            normalizedOverviewGroessenMengen[normalizedKey] = {
                length: val?.length ?? 0,
                quantity: val?.quantity ?? 0,
            }
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
            features: normalizedFeatures.length > 0 ? normalizedFeatures : undefined,
            create_status: data.create_status,
            adminStoreId: data.adminStoreId ?? null,
            auto_order: Boolean(data.auto_order),
            able_auto_order: data.able_auto_order,
            overviewSizeQuantities: normalizedOverviewGroessenMengen,
            store_brand_settings: data.store_brand_settings ?? null,
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

    const getOverviewQuantity = (product: MillingBlock, size: string): number => {
        return product.overviewSizeQuantities?.[size]?.quantity ?? 0
    }

    const hasAutoOrderOn = (product: MillingBlock): boolean => Boolean(product.auto_order);

    const isAdminManagedProduct = (product: MillingBlock): boolean =>
        product.create_status === 'by_admin' || product.create_status === 'by_models';

    const isAutoOrderEnabled = (product: MillingBlock): boolean =>
        isAdminManagedProduct(product) &&
        String(product.able_auto_order ?? '').trim().toLowerCase() === 'enable';

    const handleAutoOrderToggle = async (product: MillingBlock) => {
        if (!isAutoOrderEnabled(product) || togglingAutoOrderId === product.id) return;

        try {
            setTogglingAutoOrderId(product.id)
            await switchStore(product.id)

            const nextAutoOrder = !Boolean(product.auto_order)
            onUpdateProduct({
                ...product,
                auto_order: nextAutoOrder,
            })

            const response: any = await getSingleStorage(product.id)
            if (response?.success && response?.data) {
                onUpdateProduct({
                    ...product,
                    ...apiDataToMillingBlock(response.data),
                    auto_order: Boolean(
                        response.data.auto_order ?? nextAutoOrder
                    ),
                    able_auto_order: response.data.able_auto_order ?? product.able_auto_order,
                })
            }

            toast.success(`Auto-Bestellung ${nextAutoOrder ? 'aktiviert' : 'deaktiviert'}`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Auto-Bestellung konnte nicht aktualisiert werden')
        } finally {
            setTogglingAutoOrderId(null)
        }
    }

    const handleConfirmAutoOrderOn = async () => {
        if (!autoOrderConfirmProduct) return
        const p = autoOrderConfirmProduct
        try {
            await handleAutoOrderToggle(p)
        } finally {
            setAutoOrderConfirmProduct(null)
        }
    }

    const handleOpenBestellscheinPdf = async (product: MillingBlock) => {
        setPdfLoadingId(product.id)
        try {
            const response: any = await getSingleStorage(product.id)
            if (!response?.success || !response?.data) {
                toast.error('Produktdaten konnten nicht geladen werden.')
                return
            }
            setPdfModalProduct(response.data)
            setPdfModalOpen(true)
        } catch (e: any) {
            toast.error(e?.message || 'Produktdaten konnten nicht geladen werden.')
        } finally {
            setPdfLoadingId(null)
        }
    }

    const handleSubmitBestellscheinPdf = async (rows: ReorderRow[]) => {
        if (!pdfModalProduct) return
        setIsPdfSubmitting(true)
        try {
            const result = await downloadBestellscheinPdf(pdfModalProduct, { rows })
            if (!result.ok) {
                toast.error('Keine Nachbestellzeilen für den PDF-Export.')
                return
            }
            toast.success('Bestellschein heruntergeladen')
            setPdfModalOpen(false)
            setPdfModalProduct(null)
        } catch (e: any) {
            toast.error(e?.message || 'PDF konnte nicht erstellt werden.')
        } finally {
            setIsPdfSubmitting(false)
        }
    }

    if (isLoading) {
        return <ProductManagementTableShimmer sizeColumns={sizeColumns} rows={5} />
    }

    return (
        <>
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                <div className="w-full overflow-x-auto">
                <Table className='w-full min-w-[1100px] bg-white rounded-lg overflow-hidden'>
                    <TableHeader>
                        <TableRow className="border-b bg-gray-100">
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase w-[120px] min-w-[120px]">BILD</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">HERSTELLER</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">ARTIKELBEZEICHNUNG</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">STATUS</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">AUTO</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase min-w-[120px]">AKTIONEN</TableHead>
                            {sizeColumns.map(size => (
                                <TableHead key={size} className="p-3 text-center font-medium text-gray-700 uppercase min-w-[90px]">{size}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={sizeColumns.length + 6}
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
                                    <TableCell className="p-3 w-[120px] min-w-[120px]">
                                        <div
                                            className="flex items-center justify-center w-20 min-w-20 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedProductIdForModal(product.id)}
                                        >
                                            {product.image ? (
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src={product.image}
                                                    alt={product.Produktname}
                                                    className="w-20 h-20 rounded-lg border object-contain border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-400 text-xs font-medium">
                                                    Bild
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.Hersteller}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        <div className="flex flex-col gap-0.5 uppercase">
                                            <span className="font-semibold text-gray-900 block">{product.Produktname}</span>
                                            <span className="text-sm text-gray-500">{product.Produktkürzel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {hasLowStock(product) && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                                                Niedrig
                                                            </span>
                                                        )}
                                                        {product.create_status && !isAdminManagedProduct(product) && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                                Offen
                                                            </span>
                                                        )}
                                                        {!hasLowStock(product) && (!product.create_status || isAdminManagedProduct(product)) && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                Voller Bestand
                                                            </span>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {hasLowStock(product) ? (
                                                        <div>
                                                            <p className="font-medium mb-1">Niedriger Bestand:</p>
                                                            {getLowStockSizes(product).map(({ size, quantity }) => (
                                                                <p key={size}>{size}: {quantity} Stück</p>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p>Bestand ist ausreichend</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="p-3 min-w-[120px]">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <Switch
                                                checked={hasAutoOrderOn(product)}
                                                disabled={!isAutoOrderEnabled(product) || togglingAutoOrderId === product.id}
                                                onCheckedChange={(checked) => {
                                                    if (!isAutoOrderEnabled(product) || togglingAutoOrderId === product.id) return
                                                    if (checked) {
                                                        setAutoOrderConfirmProduct(product)
                                                    } else {
                                                        void handleAutoOrderToggle(product)
                                                    }
                                                }}
                                                className={`data-[state=checked]:bg-emerald-500 ${isAutoOrderEnabled(product)
                                                        ? 'cursor-pointer data-[state=unchecked]:bg-slate-300'
                                                        : 'cursor-not-allowed data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-slate-400'
                                                    }`}
                                            />
                                            <span
                                                className={`text-xs font-medium ${!isAutoOrderEnabled(product)
                                                        ? 'text-slate-400'
                                                        : hasAutoOrderOn(product)
                                                            ? 'text-emerald-600'
                                                            : 'text-gray-500'
                                                    }`}
                                            >
                                                {!isAutoOrderEnabled(product) ? 'Gesperrt' : hasAutoOrderOn(product) ? 'An' : 'Aus'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            {shouldShowBestellscheinDownload(
                                                product.create_status,
                                                product.Status,
                                                product.store_brand_settings
                                            ) && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => void handleOpenBestellscheinPdf(product)}
                                                    disabled={pdfLoadingId === product.id}
                                                    className="h-8 w-8 p-0 text-[#1a2b4b] hover:text-[#1a2b4b] hover:bg-emerald-50"
                                                    title="Bestellschein (PDF)"
                                                >
                                                    {pdfLoadingId === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setSelectedProductForHistory(product)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                title="Historie"
                                            >
                                                <IoTime className="w-4 h-4" />
                                            </Button>
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
                                        const sizeData = product.sizeQuantities[size];
                                        const stock = getStockForSize(product, size);
                                        const isLowStock = stock <= product.minStockLevel && stock > 0;
                                        const autoQty = getOverviewQuantity(product, size);
                                        return (
                                            <TableCell key={size} className="p-3 text-center text-gray-900">
                                                <div className="flex flex-col items-center justify-center gap-0.5">
                                                    <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                                                        {stock}
                                                    </span>
                                                    {autoQty > 0 && (
                                                        <span className="text-xs text-orange-600 font-medium">+{autoQty}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
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
                onOrderClick={(adminStoreId, storeId) => {
                    setOrderAdminStoreId(adminStoreId)
                    setOrderStoreId(storeId)
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
                    setOrderStoreId(null)
                }}
                adminStoreId={orderAdminStoreId}
                productType="milling_block"
                onOrderSuccess={onOrderSuccess}
                initialQuantitiesZero
                storeId={orderStoreId}
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

            <BestellscheinPdfModal
                isOpen={pdfModalOpen}
                onClose={() => {
                    if (isPdfSubmitting) return
                    setPdfModalOpen(false)
                    setPdfModalProduct(null)
                }}
                product={pdfModalProduct}
                isPreparing={!!pdfLoadingId}
                isSubmitting={isPdfSubmitting}
                onSubmit={handleSubmitBestellscheinPdf}
            />

            <AutoOrderConfirmDialog
                open={!!autoOrderConfirmProduct}
                onOpenChange={(open) => {
                    if (!open) setAutoOrderConfirmProduct(null)
                }}
                onConfirm={handleConfirmAutoOrderOn}
                isLoading={
                    !!autoOrderConfirmProduct &&
                    togglingAutoOrderId === autoOrderConfirmProduct.id
                }
            />
        </>
    )
}

