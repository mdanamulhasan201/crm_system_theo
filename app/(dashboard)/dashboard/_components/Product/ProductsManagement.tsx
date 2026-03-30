'use client'

import React, { useState, useRef, useEffect } from 'react'
import { IoSearch } from 'react-icons/io5'
import { Input } from '@/components/ui/input'
import LagerChart from '@/components/LagerChart/LagerChart'
import ProductManagementTable from './ProductManagementTable'
import DeleteConfirmModal from './DeleteConfirmModal'
import AddProductTypeModal from './AddProductTypeModal'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import InventoryHistory, { InventoryHistoryRef } from './InventoryHistory'
import { deleteStorage, getSingleStorage } from '@/apis/storeManagement'
import { STORE_LIST_FETCH_LIMIT } from '@/apis/productsManagementApis'
import toast from 'react-hot-toast'
import PerformerData from '@/components/LagerChart/PerformerData'
import useDebounce from '@/hooks/useDebounce'
import { normalizeFeatures } from './featureUtils'


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
    store_brand_settings?: {
        brand?: string
        type?: string
        isActive?: boolean
        isPdf?: boolean
    } | null
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


// Define the size columns
const sizeColumns = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
];

interface ProductsManagementProps {
    type?: 'rady_insole' | 'milling_block'
    setProductCount?: (n: number) => void
    openAddModal?: boolean
    onCloseAddModal?: () => void
    searchQuery?: string
    onSearchChange?: (value: string) => void
}

export default function ProductsManagement({ type = 'rady_insole', setProductCount, openAddModal, onCloseAddModal, searchQuery: controlledSearch, onSearchChange }: ProductsManagementProps) {
    const router = useRouter()
    // Stock management hook
    const { pagination, getAllProducts, isLoadingProducts, error, updateExistingProduct } = useStockManagementSlice();

    const [internalSearch, setInternalSearch] = useState('')
    const searchQuery = controlledSearch !== undefined ? controlledSearch : internalSearch
    const setSearchQuery = onSearchChange ?? setInternalSearch
    const debouncedSearch = useDebounce(searchQuery, 500)

    // Product data state - convert API products to local format
    const [productsData, setProductsData] = useState<Product[]>([])


    // Component refs
    const inventoryHistoryRef = useRef<InventoryHistoryRef>(null)

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Add product modal state
    const [addProductModalOpen, setAddProductModalOpen] = useState(false)

    // Report count to parent (e.g. lager page)
    useEffect(() => {
        if (setProductCount && pagination != null) setProductCount(pagination.totalItems ?? 0)
    }, [pagination?.totalItems, setProductCount])

    // Open add modal when parent requests (e.g. "Manuelles Lager" in lager page)
    useEffect(() => {
        if (openAddModal) setAddProductModalOpen(true)
    }, [openAddModal])

    // Convert API product to local format
    const convertApiProductToLocal = (apiProduct: any): Product => {
        const normalizedFeatures = normalizeFeatures(apiProduct.features)

        return {
            id: apiProduct.id,
            Produktname: apiProduct.produktname,
            Produktkürzel: apiProduct.artikelnummer,
            Hersteller: apiProduct.hersteller,
            Lagerort: apiProduct.lagerort,
            minStockLevel: apiProduct.mindestbestand,
            sizeQuantities: sanitizeGroessenMengen(apiProduct.groessenMengen),
            Status: apiProduct.Status,
            image: apiProduct.image,
            features: normalizedFeatures.length > 0 ? normalizedFeatures : undefined,
            create_status: apiProduct.create_status,
            adminStoreId: apiProduct.adminStoreId ?? null,
            auto_order: Boolean(apiProduct.auto_order),
            able_auto_order: apiProduct.able_auto_order,
            overviewSizeQuantities: apiProduct.overview_groessenMengen || {},
            store_brand_settings: apiProduct.store_brand_settings ?? null,
            inventoryHistory: [] // API doesn't provide history yet
        };
    };

    // Fetch full list (API returns all rows; no server pagination)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiProducts = await getAllProducts(1, STORE_LIST_FETCH_LIMIT, debouncedSearch, type);
                const convertedProducts = apiProducts.map(convertApiProductToLocal);
                setProductsData(convertedProducts);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            }
        };

        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, type]);



    const visibleProducts = productsData // Already filtered by API


    // Search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Stock level helpers
    const hasLowStock = (product: Product) => {
        return Object.values(product.sizeQuantities).some((sizeData) => {
            if (typeof sizeData === 'object' && sizeData !== null) {
                // Prefer backend warningStatus if available
                if (sizeData.warningStatus) {
                    return sizeData.warningStatus.includes('Niedriger Bestand');
                }
                // Fallback to comparison with product.minStockLevel
                const quantity = getQuantity(sizeData);
                return quantity <= product.minStockLevel && quantity > 0;
            }
            const quantity = getQuantity(sizeData);
            return quantity <= product.minStockLevel && quantity > 0;
        });
    }

    const getLowStockSizes = (product: Product) => {
        return Object.entries(product.sizeQuantities)
            .filter(([, sizeData]) => {
                if (typeof sizeData === 'object' && sizeData !== null) {
                    if (sizeData.warningStatus) {
                        return sizeData.warningStatus.includes('Niedriger Bestand');
                    }
                    const quantity = getQuantity(sizeData);
                    return quantity <= product.minStockLevel && quantity > 0;
                }
                const quantity = getQuantity(sizeData);
                return quantity <= product.minStockLevel && quantity > 0;
            })
            .map(([size, sizeData]) => ({
                size,
                quantity: getQuantity(sizeData),
                warningStatus:
                    typeof sizeData === 'object' && sizeData !== null
                        ? sizeData.warningStatus
                        : undefined,
            }));
    }


    // History handler
    const showHistory = (product: Product) => {
        if (inventoryHistoryRef.current) {
            inventoryHistoryRef.current.showHistory(product);
        }
    };

    // Lagerort change handler
    const handleLagerortChange = async (productId: string, newLagerort: string) => {
        // keep previous state for rollback
        const previousProducts = productsData;

        // optimistic update
        setProductsData(prev => prev.map(product =>
            product.id === productId ? { ...product, Lagerort: newLagerort } : product
        ));
        try {
            await updateExistingProduct(productId, { lagerort: newLagerort });
            toast.success('Lagerort aktualisiert');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Update fehlgeschlagen');
            // revert on failure
            setProductsData(previousProducts);
        }
    };


    // Update product handler: update only the edited product locally
    const handleUpdateProduct = (updatedProduct: Product) => {
        setProductsData(prev =>
            prev.map(product => (product.id === updatedProduct.id ? updatedProduct : product))
        );
    };

    // Delete product handler
    const handleDeleteProduct = (product: Product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    // Confirm delete handler
    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        try {
            await deleteStorage(productToDelete.id);
            toast.success(`"${productToDelete.Produktname}" wurde erfolgreich gelöscht!`);

            // Remove deleted product locally without full reload
            setProductsData(prev => prev.filter(p => p.id !== productToDelete.id));

            // Close modal
            setDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
            toast.error(`Fehler beim Löschen: ${errorMessage}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseAddModal = () => {
        setAddProductModalOpen(false)
        onCloseAddModal?.()
    }

    return (
        <div className="w-full">
            {/* Search is in lager page when controlled; only show when not controlled */}
            {controlledSearch === undefined && (
                <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-end mb-4">
                    <div className="relative w-64">
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <Input
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                        />
                    </div>
                </div>
            )}

            {/* Product Management Table */}
            {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-medium">Fehler beim Laden der Produkte</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <ProductManagementTable
                    visibleProducts={visibleProducts}
                    sizeColumns={sizeColumns}
                    onShowHistory={showHistory}
                    hasLowStock={hasLowStock}
                    getLowStockSizes={getLowStockSizes}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    isLoading={isLoadingProducts}
                    categoryName={type === 'rady_insole' ? 'Einlagenrohlinge' : 'Fräsblock'}
                    apiType={type}
                    onOrderSuccess={async (storeId) => {
                        try {
                            if (storeId) {
                                const res: any = await getSingleStorage(storeId);
                                if (res?.success && res?.data) {
                                    const updated = convertApiProductToLocal(res.data);
                                    setProductsData(prev => prev.map(p => p.id === storeId ? updated : p));
                                    return;
                                }
                            }
                            const apiProducts = await getAllProducts(1, STORE_LIST_FETCH_LIMIT, debouncedSearch, type);
                            const convertedProducts = apiProducts.map(convertApiProductToLocal);
                            setProductsData(convertedProducts);
                        } catch (err) {
                            console.error('Failed to refresh products after order:', err);
                        }
                    }}
                />
            )}


            {/* Inventory History Component */}
            <InventoryHistory
                ref={inventoryHistoryRef}
                productsData={productsData}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                product={productToDelete}
                isLoading={isDeleting}
            />

           

            {/* Add Product Modal */}
            <AddProductTypeModal
                isOpen={addProductModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={(createdProduct) => {
                    handleCloseAddModal()

                    if (!createdProduct) return

                    const newProduct = convertApiProductToLocal(createdProduct)
                    const normalizedSearch = debouncedSearch.trim().toLowerCase()
                    const matchesSearch =
                        !normalizedSearch ||
                        [
                            newProduct.Produktname,
                            newProduct.Produktkürzel,
                            newProduct.Hersteller,
                        ]
                            .filter(Boolean)
                            .some((value) => value.toLowerCase().includes(normalizedSearch))

                    if (!matchesSearch) return

                    setProductsData((prev) => {
                        const withoutDuplicate = prev.filter(product => product.id !== newProduct.id)
                        return [newProduct, ...withoutDuplicate]
                    })

                    setProductCount?.((pagination?.totalItems ?? productsData.length) + 1)
                }}
                type={type}
            />

        </div>
    )
}
