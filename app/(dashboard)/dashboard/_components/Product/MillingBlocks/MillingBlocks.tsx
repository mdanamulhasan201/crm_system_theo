'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { IoSearch } from 'react-icons/io5'
import MillingBlocksTable from './MillingBlocksTable'

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

// Mock data for design demonstration
const mockMillingBlocks: MillingBlock[] = [
    {
        id: '1',
        Produktname: 'Fräsblock Typ A',
        Produktkürzel: 'FB-001',
        Hersteller: 'Hersteller A',
        Lagerort: 'Lager 1',
        minStockLevel: 10,
        sizeQuantities: { 'Size 1': 15, 'Size 2': 8, 'Size 3': 12 },
        Status: 'Aktiv',
        purchase_price: 25.50,
        selling_price: 35.00,
    },
    {
        id: '2',
        Produktname: 'Fräsblock Typ B',
        Produktkürzel: 'FB-002',
        Hersteller: 'Hersteller B',
        Lagerort: 'Lager 2',
        minStockLevel: 10,
        sizeQuantities: { 'Size 1': 5, 'Size 2': 12, 'Size 3': 20 },
        Status: 'Aktiv',
        purchase_price: 30.00,
        selling_price: 40.00,
    },
]

// Size columns - only 3 sizes
const sizeColumns = ['Size 1', 'Size 2', 'Size 3']

export default function MillingBlocks() {
    const router = useRouter()
    const [products, setProducts] = useState<MillingBlock[]>(mockMillingBlocks)
    const [searchQuery, setSearchQuery] = useState('')

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

    // History handler
    const showHistory = (product: MillingBlock) => {
        // TODO: Implement history functionality
        console.log('Show history for:', product);
    }

    // Update product handler
    const handleUpdateProduct = (updatedProduct: MillingBlock) => {
        setProducts(prev =>
            prev.map(product => (product.id === updatedProduct.id ? updatedProduct : product))
        );
    }

    // Delete product handler
    const handleDeleteProduct = async (product: MillingBlock) => {
        // TODO: Implement API call to delete milling block
        // For now, just remove from local state
        setProducts(prev => prev.filter(p => p.id !== product.id));
    }

    // Search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) {
            return products
        }
        const query = searchQuery.toLowerCase()
        return products.filter(product =>
            product.Produktname.toLowerCase().includes(query) ||
            product.Produktkürzel.toLowerCase().includes(query) ||
            product.Hersteller.toLowerCase().includes(query) ||
            product.Lagerort.toLowerCase().includes(query)
        )
    }, [products, searchQuery])

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
                isLoading={false}
            />
        </div>
    )
}
