'use client'

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
import { IoSearch } from 'react-icons/io5'
import { Input } from '@/components/ui/input'
import { getAllStores } from '@/apis/storeManagement'
import { STORE_LIST_FETCH_LIMIT } from '@/apis/productsManagementApis'
import toast from 'react-hot-toast'
import Image from 'next/image'
import useDebounce from '@/hooks/useDebounce'
import BuyStorageModal from '../_components/BuyStorage/BuyStorage'
import AddStorageModal from '../_components/BuyStorage/AddStorage'
import { useSearchParams } from 'next/navigation'

interface AdminStoreProduct {
    id: string
    image: string | null
    price: number
    brand: string
    productName: string
    artikelnummer: string
    eigenschaften: string
    groessenMengen: {
        [key: string]: {
            length?: number
            quantity: number
        }
    }
    createdAt: string
    updatedAt: string
    storesCount: number
}

// Type for modal components (requires length to be present)
type ModalProduct = Omit<AdminStoreProduct, 'groessenMengen'> & {
    groessenMengen: {
        [key: string]: {
            length: number
            quantity: number
        }
    }
}

// Size columns for rady_insole (numeric sizes)
const radyInsoleSizes = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
]

// Size columns for milling_block (Size 1, Size 2, Size 3)
const millingBlockSizes = ['Size 1', 'Size 2', 'Size 3']

export default function BuyStoragePage() {
    const searchParams = useSearchParams()
    const typeFromQuery = searchParams.get('type') as 'rady_insole' | 'milling_block' | null
    // Default to rady_insole if no type is provided
    const apiType = typeFromQuery || 'rady_insole'
    
    // Get size columns based on type
    const sizeColumns = apiType === 'milling_block' ? millingBlockSizes : radyInsoleSizes

    const [products, setProducts] = useState<AdminStoreProduct[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<ModalProduct | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProductForAdd, setSelectedProductForAdd] = useState<ModalProduct | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const debouncedSearch = useDebounce(searchQuery, 500)

    // Fetch admin stores
    useEffect(() => {
        const fetchStores = async () => {
            setIsLoading(true)
            try {
                const response = await getAllStores(1, STORE_LIST_FETCH_LIMIT, debouncedSearch, apiType)
                if (response.success && response.data) {
                    setProducts(response.data)
                } else {
                    toast.error(response.message || 'Failed to fetch stores')
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Failed to fetch stores')
            } finally {
                setIsLoading(false)
            }
        }

        fetchStores()
    }, [debouncedSearch, apiType])

    // Normalize product data to ensure length is always present for modal compatibility
    const normalizeProduct = (product: AdminStoreProduct): ModalProduct => {
        const normalizedGroessenMengen: { [key: string]: { length: number; quantity: number } } = {}
        Object.keys(product.groessenMengen).forEach(size => {
            const sizeData = product.groessenMengen[size]
            normalizedGroessenMengen[size] = {
                length: sizeData.length ?? 0,
                quantity: sizeData.quantity
            }
        })
        return {
            ...product,
            groessenMengen: normalizedGroessenMengen
        }
    }

    // Handle open modal
    const handleOpenModal = (product: AdminStoreProduct) => {
        setSelectedProduct(normalizeProduct(product))
        setIsModalOpen(true)
    }

    // Handle add storage
    const handleAddStorage = (product: AdminStoreProduct) => {
        setSelectedProductForAdd(normalizeProduct(product))
        setIsAddModalOpen(true)
    }

    // Handle add storage modal close
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false)
        setSelectedProductForAdd(null)
    }

    // Refresh products list after successful add
    const handleAddSuccess = async () => {
        const refreshResponse = await getAllStores(1, STORE_LIST_FETCH_LIMIT, debouncedSearch, apiType)
        if (refreshResponse.success && refreshResponse.data) {
            setProducts(refreshResponse.data)
        }
    }

    // Handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedProduct(null)
    }

    // Refresh products list after successful purchase
    const handleBuySuccess = async () => {
        const refreshResponse = await getAllStores(1, STORE_LIST_FETCH_LIMIT, debouncedSearch, apiType)
        if (refreshResponse.success && refreshResponse.data) {
            setProducts(refreshResponse.data)
        }
    }

    return (
        <div className="w-full px-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-10">
                <h1 className='text-2xl font-semibold'>
                    {apiType === 'milling_block' ? 'Fräsblock zum Lager hinzufügen' : 'Einlagen zum Lager hinzufügen'}
                </h1>

                <div className="relative w-64">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <Input
                        placeholder="Suchen"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                        }}
                        className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                    />
                </div>
            </div>

            {/* Section Title */}
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <h2 className="text-2xl font-semibold">
                        {apiType === 'milling_block' ? 'Fräsblock' : 'Einlagen'}
                    </h2>

                    {products.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            {products.length} {apiType === 'milling_block' ? 'Fräsblock' : 'Einlage'} gefunden
                        </p>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                <div className="w-full overflow-x-auto">
                <Table className='min-w-[1100px] w-full bg-white rounded-lg overflow-hidden'>
                    <TableHeader>
                        <TableRow className="border-b bg-gray-100">
                            <TableHead className="p-4 text-left font-semibold text-gray-900 w-[120px] min-w-[120px]">Bild</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Hersteller</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Produktname</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900 min-w-[160px]">Artikelnummer</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900 min-w-[120px]">Preis</TableHead>
                            <TableHead className="p-4 text-center font-semibold text-gray-900 min-w-[220px]">Verfügbare Größen</TableHead>
                            <TableHead className="p-4 text-center font-semibold text-gray-900 min-w-[260px]">Aktion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="p-8 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="p-8 text-center">
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Speicher gefunden</h3>
                                        <p className="text-gray-500 text-sm">Es wurden keine Speicher gefunden.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                // Get available sizes from the actual product data
                                // For milling blocks, use the keys from groessenMengen
                                // For rady_insole, filter by sizeColumns
                                const availableSizes = apiType === 'milling_block' 
                                    ? Object.keys(product.groessenMengen).filter(size => 
                                        product.groessenMengen[size] && product.groessenMengen[size].quantity > 0
                                    )
                                    : sizeColumns.filter(size => 
                                        product.groessenMengen[size] && product.groessenMengen[size].quantity > 0
                                    )
                                
                                return (
                                    <TableRow key={product.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                        <TableCell className="p-4 w-[120px] min-w-[120px]">
                                            <div className="flex items-center justify-center w-20 min-w-20">
                                                {product.image ? (
                                                    <Image
                                                        width={80}
                                                        height={80}
                                                        src={product.image}
                                                        alt={product.productName}
                                                        className="w-20 h-20 rounded-lg border object-contain border-gray-200 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4 text-gray-900 font-medium">
                                            {product.brand}
                                        </TableCell>
                                        <TableCell className="p-4 text-gray-900">
                                            <span className="font-medium">{product.productName}</span>
                                        </TableCell>
                                        <TableCell className="p-4 text-gray-600">
                                            {product.artikelnummer}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className="text-lg font-semibold text-gray-900">€{product.price}</span>
                                        </TableCell>
                                        <TableCell className="p-4 text-center min-w-[220px]">
                                            <div className="grid grid-cols-5 gap-1.5 max-w-[220px] mx-auto">
                                                {availableSizes.length > 0 ? (
                                                    <>
                                                    {availableSizes.map(size => (
                                                        <span 
                                                            key={size}
                                                            className="px-2 py-0.5 text-center bg-gray-100 text-gray-700 text-xs leading-5 font-medium rounded border border-gray-200"
                                                        >
                                                            {size}
                                                        </span>
                                                    ))}
                                                    </>
                                                ) : (
                                                    <span className="col-span-5 text-sm text-gray-400">Alle Größen</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                            <Button
                                                onClick={() => handleOpenModal(product)}
                                                className="bg-[#61A178] hover:bg-[#61A178]/90 text-white cursor-pointer text-xs shadow-sm hover:shadow transition-all"
                                            >
                                                {apiType === 'milling_block' ? 'Fräsblock bestellen' : 'Einlagen bestellen'}
                                            </Button>
                                            <Button
                                                onClick={() => handleAddStorage(product)}
                                                className="bg-[#61A178] hover:bg-[#61A178]/90 text-white cursor-pointer text-xs shadow-sm hover:shadow transition-all"
                                            >
                                                Lager hinzufügen
                                            </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
                </div>
            </div>

            {/* Buy Modal */}
            <BuyStorageModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedProduct={selectedProduct}
                onBuySuccess={handleBuySuccess}
            />

            {/* Add Storage Modal */}
            <AddStorageModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                selectedProduct={selectedProductForAdd}
                onAddSuccess={handleAddSuccess}
            />
        </div>
    )
}
