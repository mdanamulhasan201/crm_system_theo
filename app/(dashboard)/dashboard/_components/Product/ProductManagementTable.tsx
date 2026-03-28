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
import { Download, Loader2 } from 'lucide-react'
import AddProduct from './AddProduct'
import EinlagenNachbestellenModal from './EinlagenNachbestellenModal'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import ProductManagementTableShimmer from '@/components/ShimmerEffect/Product/ProductManagementTableShimmer'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { getSingleStorage, switchStore } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import { normalizeFeatures } from './featureUtils'
import AutoOrderConfirmDialog from './AutoOrderConfirmDialog'
import { downloadBestellscheinPdf, shouldShowBestellscheinDownload } from '@/lib/bestellscheinPdf'

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
    features?: string[]
    create_status?: string
    adminStoreId?: string | null
    auto_order?: boolean
    able_auto_order?: string
    overviewSizeQuantities?: { [key: string]: { length?: number; quantity: number } }
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
// Guards against corrupted API data where quantity itself may be an object
const getQuantity = (sizeData: number | SizeData | undefined): number => {
    if (sizeData === undefined || sizeData === null) return 0;
    if (typeof sizeData === 'number') return sizeData;
    const qty = (sizeData as any).quantity;
    return typeof qty === 'number' ? qty : 0;
}

// Sanitize raw groessenMengen from API so quantity/length are always numbers
const sanitizeGroessenMengen = (raw: any): { [key: string]: number | SizeData } => {
    if (!raw || typeof raw !== 'object') return {};
    const result: { [key: string]: number | SizeData } = {};
    Object.entries(raw).forEach(([size, data]: [string, any]) => {
        if (typeof data === 'number') {
            result[size] = data;
        } else if (typeof data === 'object' && data !== null) {
            result[size] = {
                ...data,
                quantity: typeof data.quantity === 'number' ? data.quantity : 0,
                length: typeof data.length === 'number' ? data.length : 0,
            };
        } else {
            result[size] = { quantity: 0, length: 0 } as SizeData;
        }
    });
    return result;
}

// Helper function to truncate text to 3 characters with ".."
const truncateText = (text: string, maxLength: number = 15): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '..';
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
    /** Category label for modal title, e.g. "Einlagenrohlinge" or "Fräsblock" */
    categoryName?: string
    /** API type for order modal, e.g. "rady_insole" or "milling_block" */
    apiType?: 'rady_insole' | 'milling_block'
    /** Called after successful order; receives storeId to update only that row (no full reload) */
    onOrderSuccess?: (storeId?: string) => void
}

export default function ProductManagementTable({
    visibleProducts,
    sizeColumns,
    onShowHistory,
    hasLowStock,
    getLowStockSizes,
    onUpdateProduct,
    onDeleteProduct,
    isLoading = false,
    categoryName = 'Einlagenrohlinge',
    apiType = 'rady_insole',
    onOrderSuccess
}: ProductManagementTableProps) {
    const { getProductById } = useStockManagementSlice();
    const [editId, setEditId] = useState<string | undefined>(undefined)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null)
    const [selectedProductForImage, setSelectedProductForImage] = useState<Product | null>(null)
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [orderModalOpen, setOrderModalOpen] = useState(false)
    const [orderAdminStoreId, setOrderAdminStoreId] = useState<string | null>(null)
    const [orderStoreId, setOrderStoreId] = useState<string | null>(null)
    const [togglingAutoOrderId, setTogglingAutoOrderId] = useState<string | null>(null)
    const [autoOrderConfirmProduct, setAutoOrderConfirmProduct] = useState<Product | null>(null)
    const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null)

    // Convert API single-storage response to Product (for modal)
    const apiDataToProduct = (data: any): Product => ({
        features: (() => {
            const normalizedFeatures = normalizeFeatures(data.features)
            return normalizedFeatures.length > 0 ? normalizedFeatures : undefined
        })(),
        id: data.id,
        Produktname: data.produktname,
        Produktkürzel: data.artikelnummer,
        Hersteller: data.hersteller,
        Lagerort: data.lagerort,
        minStockLevel: data.mindestbestand,
        sizeQuantities: sanitizeGroessenMengen(data.groessenMengen),
        Status: data.Status,
        image: data.image,
        create_status: data.create_status,
        adminStoreId: data.adminStoreId ?? null,
        auto_order: Boolean(data.auto_order),
        able_auto_order: data.able_auto_order,
        overviewSizeQuantities: data.overview_groessenMengen || {},
        inventoryHistory: []
    })

    // When user clicks Lagerort image: fetch single product and show modal
    useEffect(() => {
        if (!selectedProductIdForModal) return

        let cancelled = false
        setIsModalLoading(true)
        setSelectedProductForImage(null)

        getSingleStorage(selectedProductIdForModal)
            .then((response: any) => {
                if (cancelled || !response?.success || !response?.data) return
                setSelectedProductForImage(apiDataToProduct(response.data))
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

    const getOverviewQuantity = (product: Product, size: string): number => {
        return product.overviewSizeQuantities?.[size]?.quantity ?? 0;
    };

    const hasAutoOrderOn = (product: Product): boolean => Boolean(product.auto_order);

    const isAdminManagedProduct = (product: Product): boolean =>
        product.create_status === 'by_admin' || product.create_status === 'by_models';

    const isAutoOrderEnabled = (product: Product): boolean =>
        isAdminManagedProduct(product) &&
        String(product.able_auto_order ?? '').trim().toLowerCase() === 'enable';

    const handleAutoOrderToggle = async (product: Product) => {
        if (!isAutoOrderEnabled(product) || togglingAutoOrderId === product.id) return;

        try {
            setTogglingAutoOrderId(product.id);
            await switchStore(product.id);

            const nextAutoOrder = !Boolean(product.auto_order);
            onUpdateProduct({
                ...product,
                auto_order: nextAutoOrder,
            });

            const response: any = await getSingleStorage(product.id);
            if (response?.success && response?.data) {
                onUpdateProduct({
                    ...product,
                    ...apiDataToProduct(response.data),
                    auto_order: Boolean(
                        response.data.auto_order ?? nextAutoOrder
                    ),
                    able_auto_order: response.data.able_auto_order ?? product.able_auto_order,
                });
            }

            toast.success(`Auto-Bestellung ${nextAutoOrder ? 'aktiviert' : 'deaktiviert'}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Auto-Bestellung konnte nicht aktualisiert werden');
        } finally {
            setTogglingAutoOrderId(null);
        }
    };

    const handleConfirmAutoOrderOn = async () => {
        if (!autoOrderConfirmProduct) return;
        const p = autoOrderConfirmProduct;
        try {
            await handleAutoOrderToggle(p);
        } finally {
            setAutoOrderConfirmProduct(null);
        }
    };

    const isEinlagenrohlinge = apiType === 'rady_insole';

    const handleBestellscheinPdf = async (product: Product) => {
        setPdfLoadingId(product.id)
        try {
            const response: any = await getSingleStorage(product.id)
            if (!response?.success || !response?.data) {
                toast.error('Produktdaten konnten nicht geladen werden.')
                return
            }
            const result = await downloadBestellscheinPdf(response.data)
            if (!result.ok) {
                toast.error('Keine Nachbestellzeilen für den PDF-Export.')
                return
            }
            toast.success('Bestellschein heruntergeladen')
        } catch (e: any) {
            toast.error(e?.message || 'PDF konnte nicht erstellt werden.')
        } finally {
            setPdfLoadingId(null)
        }
    }

    if (isLoading) {
        return <ProductManagementTableShimmer sizeColumns={sizeColumns} rows={5} />
    }

    return (
        <>
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                <div className="w-full overflow-x-auto">
                <Table className={`w-full bg-white rounded-lg overflow-hidden ${isEinlagenrohlinge ? 'min-w-[1500px]' : 'min-w-[1100px]'}`}>
                    <TableHeader>
                        <TableRow className={`border-b ${isEinlagenrohlinge ? 'bg-gray-100' : 'bg-white'}`}>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase w-[120px] min-w-[120px]">{isEinlagenrohlinge ? 'BILD' : 'LAGERORT'}</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">HERSTELLER</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">ARTIKELBEZEICHNUNG</TableHead>
                            {!isEinlagenrohlinge && <TableHead className="p-3 text-left font-medium text-gray-900 uppercase min-w-[160px]">ARTIKELNUMMER</TableHead>}
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">{isEinlagenrohlinge ? 'STATUS' : 'BESTANDSWARNUNG'}</TableHead>
                            {isEinlagenrohlinge && <TableHead className="p-3 text-left font-medium text-gray-700 uppercase">AUTO</TableHead>}
                            <TableHead className="p-3 text-left font-medium text-gray-700 uppercase min-w-[120px]">AKTIONEN</TableHead>
                            {sizeColumns.map(size => (
                                <TableHead key={size} className="p-3 text-center font-medium text-gray-700 uppercase min-w-[70px]">{size}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={sizeColumns.length + (isEinlagenrohlinge ? 7 : 6)}
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
                                        {/* BILD / Lagerort – clickable image or placeholder */}
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
                                                    {isEinlagenrohlinge ? 'Bild' : (
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.Hersteller}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {isEinlagenrohlinge ? (
                                            <div className="flex flex-col gap-0.5 uppercase">
                                                <span className="font-semibold text-gray-900 block">{product.Produktname}</span>
                                                <span className="text-sm text-gray-500">{product.Produktkürzel}</span>
                                            </div>
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="cursor-help uppercase">{truncateText(product.Produktname)}</span>
                                                    </TooltipTrigger>
                                                    {product.Produktname.length > 15 && (
                                                        <TooltipContent><p className="uppercase">{product.Produktname}</p></TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </TableCell>
                                    {!isEinlagenrohlinge && (
                                        <TableCell className="p-3 text-gray-900 uppercase">
                                            {product.Produktkürzel}
                                        </TableCell>
                                    )}
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
                                                            {getLowStockSizes(product).map(({ size, quantity, warningStatus }) => (
                                                                <p key={size}>Größe {size}: {quantity} Stück{warningStatus && ` (${warningStatus})`}</p>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p>Bestand ist ausreichend</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    {isEinlagenrohlinge && (
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={hasAutoOrderOn(product)}
                                                    disabled={!isAutoOrderEnabled(product) || togglingAutoOrderId === product.id}
                                                    onCheckedChange={(checked) => {
                                                        if (!isAutoOrderEnabled(product) || togglingAutoOrderId === product.id) return;
                                                        if (checked) {
                                                            setAutoOrderConfirmProduct(product);
                                                        } else {
                                                            void handleAutoOrderToggle(product);
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
                                    )}
                                    <TableCell className="min-w-[120px]">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            {shouldShowBestellscheinDownload(product.create_status, product.Status) && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => void handleBestellscheinPdf(product)}
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
                                                onClick={() => onShowHistory(product)}
                                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                title="Historie"
                                            >
                                                <IoTime className="w-4 h-4" />
                                            </Button>
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
                                    {sizeColumns.map(size => {
                                        const sizeData = product.sizeQuantities[size]
                                        const autoQty = getOverviewQuantity(product, size)
                                        return (
                                            <TableCell key={size} className="p-3 text-center text-gray-900">
                                                <div className="flex flex-col items-center justify-center gap-0.5">
                                                    <span
                                                        className={`${getSizeWarningStatus(product, size)?.includes('Niedriger Bestand')
                                                                ? 'text-red-600 font-semibold'
                                                                : ''
                                                            }`}
                                                    >
                                                        {getStockForSize(product, size)}
                                                    </span>
                                                    {isEinlagenrohlinge && autoQty > 0 && (
                                                        <span className="text-xs text-orange-600 font-medium">+{autoQty}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
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
                            const previousProduct = visibleProducts.find(product => product.id === editId)
                            const normalizedFeatures = normalizeFeatures(apiProduct.features)
                            const updatedProduct: Product = {
                                id: apiProduct.id,
                                Produktname: apiProduct.produktname,
                                Produktkürzel: apiProduct.artikelnummer,
                                Hersteller: apiProduct.hersteller,
                                Lagerort: apiProduct.lagerort,
                                minStockLevel: apiProduct.mindestbestand,
                                sizeQuantities: sanitizeGroessenMengen(apiProduct.groessenMengen),
                                Status: apiProduct.Status,
                                image: apiProduct.image ?? previousProduct?.image,
                                features: normalizedFeatures.length > 0
                                    ? normalizedFeatures
                                    : previousProduct?.features,
                                create_status: apiProduct.create_status ?? previousProduct?.create_status,
                                adminStoreId: apiProduct.adminStoreId ?? previousProduct?.adminStoreId ?? null,
                                overviewSizeQuantities: apiProduct.overview_groessenMengen || {},
                                auto_order: Boolean(apiProduct.auto_order ?? previousProduct?.auto_order),
                                able_auto_order: apiProduct.able_auto_order ?? previousProduct?.able_auto_order,
                                inventoryHistory: []
                            };
                            onUpdateProduct(updatedProduct);
                        } catch (err) {
                            console.error('Failed to fetch updated product', err);
                        }
                    }}
                />
            )}

            {/* Image View Modal – fetch single product on Lagerort click, then show (image, header, features, CTA) */}
            <Dialog
                open={!!selectedProductIdForModal || !!selectedProductForImage}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedProductIdForModal(null)
                        setSelectedProductForImage(null)
                    }
                }}
            >
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
                    <DialogTitle className="sr-only">
                        {selectedProductForImage ? `${selectedProductForImage.Produktname} – Produktdetails` : 'Produktdetails'}
                    </DialogTitle>
                    {isModalLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-[#61A178]" />
                        </div>
                    ) : selectedProductForImage ? (
                    <div className="space-y-0">
                        {/* Product Image – top, prominent */}
                        <div className="flex justify-center items-center bg-white pt-6 pb-4">
                            {selectedProductForImage.image ? (
                                <Image
                                    width={400}
                                    height={280}
                                    src={selectedProductForImage.image}
                                    alt={selectedProductForImage.Produktname}
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

                        {/* Dynamic header – category, then product name (e.g. "Einlagenrohlinge, Orthotech Comfort, Shore 45") */}
                        <div className="px-6 pb-2">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {categoryName}, {selectedProductForImage?.Produktname || '–'}
                            </h2>
                        </div>

                        {/* Bottom section: features list then one button (like reference) – only when create_status === 'by_admin' */}
                        <div className="px-6 pt-4 pb-6  border-gray-100">
                            {selectedProductForImage?.features && selectedProductForImage.features.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-900 mb-6">
                                    {selectedProductForImage.features.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6">Keine Eigenschaften hinterlegt.</p>
                            )}
                            {selectedProductForImage && isAdminManagedProduct(selectedProductForImage) && selectedProductForImage.adminStoreId ? (
                                <Button
                                    className="w-fit bg-[#65b87c] hover:bg-[#5aa86e] text-white font-medium rounded-lg py-2.5 cursor-pointer"
                                    onClick={() => {
                                        setOrderStoreId(selectedProductForImage.id)
                                        setOrderAdminStoreId(selectedProductForImage.adminStoreId!)
                                        setOrderModalOpen(true)
                                        setSelectedProductForImage(null)
                                    }}
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

            {/* Order modal – only for products with create_status === 'by_admin' */}
            <EinlagenNachbestellenModal
                isOpen={orderModalOpen}
                onClose={() => {
                    setOrderModalOpen(false)
                    setOrderAdminStoreId(null)
                    setOrderStoreId(null)
                }}
                adminStoreId={orderAdminStoreId}
                productType={apiType}
                onOrderSuccess={onOrderSuccess}
                initialQuantitiesZero
                storeId={orderStoreId}
            />

            <AutoOrderConfirmDialog
                open={!!autoOrderConfirmProduct}
                onOpenChange={(open) => {
                    if (!open) setAutoOrderConfirmProduct(null);
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
