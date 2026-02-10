'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { IoSearch } from 'react-icons/io5'
import MillingBlocksTable from './MillingBlocksTable'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import useDebounce from '@/hooks/useDebounce'

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

// Size columns - only 3 sizes
const sizeColumns = ['Size 1', 'Size 2', 'Size 3']

interface MillingBlocksProps {
    type?: 'rady_insole' | 'milling_block'
}

export default function MillingBlocks({ type = 'milling_block' }: MillingBlocksProps) {
    const router = useRouter()
    const { getAllProducts, isLoadingProducts, refreshProducts } = useStockManagementSlice()
    const [products, setProducts] = useState<MillingBlock[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 500)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Helper to check if product has low stock
    const hasLowStock = (product: MillingBlock): boolean => {
        return Object.values(product.sizeQuantities).some(
            quantity => quantity <= product.minStockLevel && quantity > 0
        );
    }

    // Helper to get low stock sizes
    const getLowStockSizes = (product: MillingBlock) => {
        return Object.entries(product.sizeQuantities)
            .filter(([, quantity]) => quantity <= product.minStockLevel && quantity > 0)
            .map(([size, quantity]) => ({ size, quantity }));
    }

    // History handler (used by MillingBlocksTable)
    const showHistory = (product: MillingBlock) => {
        // History is handled by MillingBlocksTable which opens MillingBlockHistory modal
        // The modal fetches history using getProductHistory API
        console.log('Show history for:', product);
    }

    // Update product handler - refresh data from API after update
    const handleUpdateProduct = async (updatedProduct: MillingBlock) => {
        // Optimistically update local state
        setProducts(prev =>
            prev.map(product => (product.id === updatedProduct.id ? updatedProduct : product))
        );
        
        // Refresh data from API to ensure consistency
        try {
            const apiProducts = await refreshProducts(currentPage, itemsPerPage, debouncedSearch, type)
            const convertedProducts = apiProducts.map(convertApiProductToLocal)
            setProducts(convertedProducts)
        } catch (err) {
            console.error('Failed to refresh products after update:', err)
        }
    }

    // Delete product handler
    const handleDeleteProduct = async (product: MillingBlock) => {
        // TODO: Implement API call to delete milling block
        // For now, just remove from local state
        setProducts(prev => prev.filter(p => p.id !== product.id));
    }

    // Convert API product to local format
    const convertApiProductToLocal = (apiProduct: any): MillingBlock => {
        return {
            id: apiProduct.id,
            Produktname: apiProduct.produktname,
            Produktkürzel: apiProduct.artikelnummer,
            Hersteller: apiProduct.hersteller,
            Lagerort: apiProduct.lagerort,
            minStockLevel: apiProduct.mindestbestand,
            sizeQuantities: typeof apiProduct.groessenMengen === 'object' 
                ? Object.fromEntries(
                    Object.entries(apiProduct.groessenMengen).map(([size, data]: [string, any]) => [
                        size,
                        typeof data === 'object' ? data.quantity : data
                    ])
                )
                : apiProduct.groessenMengen || {},
            Status: apiProduct.Status,
            image: apiProduct.image,
            purchase_price: apiProduct.purchase_price,
            selling_price: apiProduct.selling_price,
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

    return (
        <div className="w-full px-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-10">
                <h1 className='text-2xl font-semibold'>Fräsblock Verwaltung</h1>

                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <Input
                            placeholder="Search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <p className="text-sm text-gray-600 mt-1">
                        {filteredProducts.length} Produkte gefunden
                    </p>
                </div>
                {/* Buy Now Button */}
                <Button
                    onClick={() => router.push(`/dashboard/buy-storage?type=${type}`)}
                    disabled={isLoadingProducts}
                    className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                >
                    Lagerplätze kaufen
                </Button>
            </div>

            <MillingBlocksTable
                visibleProducts={filteredProducts}
                sizeColumns={sizeColumns}
                onShowHistory={showHistory}
                hasLowStock={hasLowStock}
                getLowStockSizes={getLowStockSizes}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                isLoading={isLoadingProducts}
            />
        </div>
    )
}
