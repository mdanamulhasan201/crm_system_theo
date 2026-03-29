'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { IoSearch } from 'react-icons/io5'
import MillingBlocksTable from './MillingBlocksTable'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import useDebounce from '@/hooks/useDebounce'
import { deleteStorage, getSingleStorage } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import AddProductTypeModal from '../AddProductTypeModal'
import { normalizeFeatures } from '../featureUtils'

// sizeQuantities values can be number or { quantity? } (matches MillingBlocksTable)
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

function getQuantity(val: number | { quantity?: number } | undefined): number {
    if (val == null) return 0
    return typeof val === 'object' ? (val.quantity ?? 0) : val
}

// Size columns - only 3 sizes
const sizeColumns = ['Size 1', 'Size 2', 'Size 3']

interface MillingBlocksProps {
    type?: 'rady_insole' | 'milling_block'
    setProductCount?: (n: number) => void
    openAddModal?: boolean
    onCloseAddModal?: () => void
    searchQuery?: string
    onSearchChange?: (value: string) => void
}

export default function MillingBlocks({ type = 'milling_block', setProductCount, openAddModal, onCloseAddModal, searchQuery: controlledSearch, onSearchChange }: MillingBlocksProps) {
    const router = useRouter()
    const { getAllProducts, isLoadingProducts } = useStockManagementSlice()
    const [products, setProducts] = useState<MillingBlock[]>([])
    const [internalSearch, setInternalSearch] = useState('')
    const searchQuery = controlledSearch !== undefined ? controlledSearch : internalSearch
    const setSearchQuery = onSearchChange ?? setInternalSearch
    const debouncedSearch = useDebounce(searchQuery, 500)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [addProductModalOpen, setAddProductModalOpen] = useState(false)

    useEffect(() => {
        if (setProductCount) setProductCount(products.length)
    }, [products.length, setProductCount])

    useEffect(() => {
        if (openAddModal) setAddProductModalOpen(true)
    }, [openAddModal])

    // Helper to check if product has low stock
    const hasLowStock = (product: MillingBlock): boolean => {
        return Object.values(product.sizeQuantities).some(
            val => getQuantity(val) <= product.minStockLevel && getQuantity(val) > 0
        );
    }

    // Helper to get low stock sizes
    const getLowStockSizes = (product: MillingBlock) => {
        return Object.entries(product.sizeQuantities)
            .filter(([, val]) => getQuantity(val) <= product.minStockLevel && getQuantity(val) > 0)
            .map(([size, val]) => ({ size, quantity: getQuantity(val) }));
    }

    // History handler (used by MillingBlocksTable)
    const showHistory = (product: MillingBlock) => {
        // History is handled by MillingBlocksTable which opens MillingBlockHistory modal
        // The modal fetches history using getProductHistory API
        console.log('Show history for:', product);
    }

    // Update only the changed row so the whole table does not reload
    const handleUpdateProduct = (updatedProduct: MillingBlock) => {
        setProducts(prev =>
            prev.map(product => (product.id === updatedProduct.id ? updatedProduct : product))
        )
    }

    // Delete product handler
    const handleDeleteProduct = async (product: MillingBlock) => {
        try {
            await deleteStorage(product.id);
            toast.success(`"${product.Produktname}" wurde erfolgreich gelöscht!`);

            // Remove deleted product locally
            setProducts(prev => prev.filter(p => p.id !== product.id));
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
            toast.error(`Fehler beim Löschen: ${errorMessage}`);
        }
    }

    // Normalize size keys for milling_block type (convert "1", "2", "3" to "Size 1", "Size 2", "Size 3")
    const normalizeSizeKeys = (groessenMengen: any, productType: string) => {
        if (productType === 'milling_block') {
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

    // Convert API product to local format
    const convertApiProductToLocal = (apiProduct: any): MillingBlock => {
        const normalizedFeatures = normalizeFeatures(apiProduct.features)

        // Normalize groessenMengen keys for milling_block type
        const productType = apiProduct.type || type
        const normalizedGroessenMengen = typeof apiProduct.groessenMengen === 'object'
            ? normalizeSizeKeys(apiProduct.groessenMengen, productType)
            : apiProduct.groessenMengen || {}
        const normalizedOverviewGroessenMengen = typeof apiProduct.overview_groessenMengen === 'object'
            ? normalizeSizeKeys(apiProduct.overview_groessenMengen, productType)
            : apiProduct.overview_groessenMengen || {}

        return {
            id: apiProduct.id,
            Produktname: apiProduct.produktname,
            Produktkürzel: apiProduct.artikelnummer,
            Hersteller: apiProduct.hersteller,
            Lagerort: apiProduct.lagerort,
            minStockLevel: apiProduct.mindestbestand,
            sizeQuantities: Object.fromEntries(
                Object.entries(normalizedGroessenMengen).map(([size, data]: [string, any]) => [
                    size,
                    typeof data === 'object' && data !== null
                        ? (typeof data.quantity === 'number' ? data.quantity : 0)
                        : (typeof data === 'number' ? data : 0)
                ])
            ),
            Status: apiProduct.Status,
            image: apiProduct.image,
            purchase_price: apiProduct.purchase_price,
            selling_price: apiProduct.selling_price,
            features: normalizedFeatures.length > 0 ? normalizedFeatures : undefined,
            create_status: apiProduct.create_status,
            adminStoreId: apiProduct.adminStoreId ?? null,
            auto_order: Boolean(apiProduct.auto_order),
            able_auto_order: apiProduct.able_auto_order,
            overviewSizeQuantities: normalizedOverviewGroessenMengen,
            store_brand_settings: apiProduct.store_brand_settings ?? null,
        }
    }

    // Fetch products on component mount and when pagination/search changes
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiProducts = await getAllProducts(currentPage, itemsPerPage, debouncedSearch, type)
                const convertedProducts = apiProducts.map(convertApiProductToLocal)
                setProducts(convertedProducts)
            } catch (err) {
                console.error('Failed to fetch milling blocks:', err)
            }
        }

        fetchProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, debouncedSearch, type])

    // Search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    // Filter products based on search query (now handled by API, but keeping for consistency)
    const filteredProducts = products

    const handleCloseAddModal = () => {
        setAddProductModalOpen(false)
        onCloseAddModal?.()
    }

    return (
        <div className="w-full mb-10">
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

            <MillingBlocksTable
                visibleProducts={filteredProducts}
                sizeColumns={sizeColumns}
                onShowHistory={showHistory}
                hasLowStock={hasLowStock}
                getLowStockSizes={getLowStockSizes}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                isLoading={isLoadingProducts}
                onOrderSuccess={async (storeId) => {
                    try {
                        if (storeId) {
                            const res: any = await getSingleStorage(storeId)
                            if (res?.success && res?.data) {
                                const updated = convertApiProductToLocal(res.data)
                                setProducts(prev => prev.map(p => p.id === storeId ? updated : p))
                                return
                            }
                        }
                        const apiProducts = await getAllProducts(currentPage, itemsPerPage, debouncedSearch, type)
                        const convertedProducts = apiProducts.map(convertApiProductToLocal)
                        setProducts(convertedProducts)
                    } catch (err) {
                        console.error('Failed to refresh products after order:', err)
                    }
                }}
            />

            {/* Add Product Modal */}
            <AddProductTypeModal
                isOpen={addProductModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={async () => {
                    handleCloseAddModal()
                    // Refresh products list
                    try {
                        const apiProducts = await getAllProducts(currentPage, itemsPerPage, debouncedSearch, type)
                        const convertedProducts = apiProducts.map(convertApiProductToLocal)
                        setProducts(convertedProducts)
                    } catch (err) {
                        console.error('Failed to refresh products:', err)
                    }
                }}
                type={type}
            />
        </div>
    )
}
