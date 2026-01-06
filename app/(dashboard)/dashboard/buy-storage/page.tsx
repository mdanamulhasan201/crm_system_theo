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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { IoSearch } from 'react-icons/io5'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllStores, buyStore } from '@/apis/storeManagement'
import toast from 'react-hot-toast'
import Image from 'next/image'
import useDebounce from '@/hooks/useDebounce'

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
            length: number
            quantity: number
        }
    }
    createdAt: string
    updatedAt: string
    storesCount: number
}

const sizeColumns = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
]

export default function BuyStoragePage() {
    const [products, setProducts] = useState<AdminStoreProduct[]>([])
    const [pagination, setPagination] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [buyingId, setBuyingId] = useState<string | null>(null)
    const debouncedSearch = useDebounce(searchQuery, 500)

    // Fetch admin stores
    useEffect(() => {
        const fetchStores = async () => {
            setIsLoading(true)
            try {
                const response = await getAllStores(currentPage, itemsPerPage, debouncedSearch)
                if (response.success && response.data) {
                    setProducts(response.data)
                    setPagination(response.pagination)
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
    }, [currentPage, itemsPerPage, debouncedSearch])

    // Handle buy
    const handleBuy = async (adminStoreId: string) => {
        setBuyingId(adminStoreId)
        try {
            const response = await buyStore({ admin_store_id: adminStoreId })
            if (response.success) {
                toast.success(response.message || 'Store purchased successfully!')
                // Refresh the list
                const refreshResponse = await getAllStores(currentPage, itemsPerPage, debouncedSearch)
                if (refreshResponse.success && refreshResponse.data) {
                    setProducts(refreshResponse.data)
                    setPagination(refreshResponse.pagination)
                }
            } else {
                toast.error(response.message || 'Failed to purchase store')
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to purchase store')
        } finally {
            setBuyingId(null)
        }
    }

    // Get quantity for size
    const getQuantity = (product: AdminStoreProduct, size: string): number => {
        return product.groessenMengen[size]?.quantity || 0
    }

    const totalPages = pagination?.totalPages || 1

    return (
        <div className="w-full px-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-10">
                <h1 className='text-2xl font-semibold'>Einlagen zum Lager hinzufügen</h1>

                <div className="relative w-64">
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <Input
                        placeholder="Suchen"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                    />
                </div>
            </div>

            {/* Section Title */}
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <h2 className="text-2xl font-semibold">Einlagen</h2>
                    {pagination && (
                        <p className="text-sm text-gray-600 mt-1">
                            {pagination.totalItems} Einlage gefunden
                        </p>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                <Table className='w-full bg-white rounded-lg overflow-hidden'>
                    <TableHeader>
                        <TableRow className="border-b bg-white">
                            <TableHead className="p-3 text-left font-medium text-gray-900">Bild</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Hersteller</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Produktname</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Artikelnummer</TableHead>
                            <TableHead className="p-3 text-left font-medium text-gray-900">Preis</TableHead>
                            {sizeColumns.map(size => (
                                <TableHead key={size} className="p-3 text-center font-medium text-gray-900">{size}</TableHead>
                            ))}
                            <TableHead className="p-3 text-left font-medium text-gray-900">Aktion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={sizeColumns.length + 6} className="p-8 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={sizeColumns.length + 6} className="p-8 text-center">
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Speicher gefunden</h3>
                                        <p className="text-gray-500 text-sm">Es wurden keine Speicher gefunden.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="border-b bg-white">
                                    <TableCell className="p-3">
                                        <div className="flex items-center justify-center">
                                            {product.image ? (
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src={product.image}
                                                    alt={product.productName}
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
                                        {product.brand}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.productName}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        {product.artikelnummer}
                                    </TableCell>
                                    <TableCell className="p-3 text-gray-900">
                                        €{product.price}
                                    </TableCell>
                                    {sizeColumns.map(size => (
                                        <TableCell key={size} className="p-3 text-center text-gray-900">
                                            {getQuantity(product, size)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="p-3">
                                        <Button
                                            onClick={() => handleBuy(product.id)}
                                            disabled={buyingId === product.id}
                                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                                        >
                                            {buyingId === product.id ? 'Einlagen bestellen...' : 'Einlagen bestellen'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalItems > 0 && (
                <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Zeige:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    const numValue = parseInt(value);
                                    setItemsPerPage(numValue);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">
                                von {pagination.totalItems} Speicher
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => {
                                                if (currentPage > 1) {
                                                    setCurrentPage(currentPage - 1);
                                                }
                                            }}
                                            className={currentPage === 1 || !pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {(() => {
                                        const pages: (number | string)[] = [];
                                        const maxVisiblePages = 5;

                                        if (totalPages <= maxVisiblePages) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            pages.push(1);

                                            if (currentPage > 3) {
                                                pages.push('...');
                                            }

                                            const start = Math.max(2, currentPage - 1);
                                            const end = Math.min(totalPages - 1, currentPage + 1);

                                            for (let i = start; i <= end; i++) {
                                                if (i !== 1 && i !== totalPages) {
                                                    pages.push(i);
                                                }
                                            }

                                            if (currentPage < totalPages - 2) {
                                                pages.push('...');
                                            }

                                            pages.push(totalPages);
                                        }

                                        return pages.map((page, index) => {
                                            if (page === '...') {
                                                return (
                                                    <PaginationItem key={`ellipsis-${index}`}>
                                                        <span className="px-2">...</span>
                                                    </PaginationItem>
                                                );
                                            }
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => setCurrentPage(page as number)}
                                                        isActive={currentPage === page}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        });
                                    })()}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => {
                                                if (currentPage < totalPages) {
                                                    setCurrentPage(currentPage + 1);
                                                }
                                            }}
                                            className={currentPage === totalPages || !pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>

                        <div className="text-sm text-gray-600">
                            Seite {currentPage} von {totalPages}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
