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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
    const [selectedProduct, setSelectedProduct] = useState<AdminStoreProduct | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
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

    // Handle open modal
    const handleOpenModal = (product: AdminStoreProduct) => {
        setSelectedProduct(product)
        // Initialize quantities with zeros for all sizes
        const initialQuantities: { [key: string]: number } = {}
        sizeColumns.forEach(size => {
            initialQuantities[size] = 0
        })
        setQuantities(initialQuantities)
        setIsModalOpen(true)
    }

    // Handle quantity change
    const handleQuantityChange = (size: string, value: string) => {
        const numValue = parseInt(value) || 0
        setQuantities(prev => ({
            ...prev,
            [size]: numValue >= 0 ? numValue : 0
        }))
    }

    // Calculate total price
    const calculateTotalPrice = (): number => {
        if (!selectedProduct) return 0
        const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
        return selectedProduct.price * totalQuantity
    }

    // Handle buy
    const handleBuy = async () => {
        if (!selectedProduct) return
        
        const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
        if (totalQuantity === 0) {
            toast.error('Bitte wählen Sie mindestens eine Menge aus')
            return
        }

        setBuyingId(selectedProduct.id)
        try {
            const response = await buyStore({ admin_store_id: selectedProduct.id })
            if (response.success) {
                toast.success(response.message || 'Store purchased successfully!')
                setIsModalOpen(false)
                setSelectedProduct(null)
                setQuantities({})
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
                    <h2 className="text-2xl font-semibold">Verfügbare EInlagen</h2>
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
                        <TableRow className="border-b bg-gray-100">
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Bild</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Hersteller</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Produktname</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Artikelnummer</TableHead>
                            <TableHead className="p-4 text-left font-semibold text-gray-900">Preis</TableHead>
                            <TableHead className="p-4 text-center font-semibold text-gray-900">Verfügbare Größen</TableHead>
                            <TableHead className="p-4 text-center font-semibold text-gray-900">Aktion</TableHead>
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
                                // Get available sizes
                                const availableSizes = sizeColumns.filter(size => 
                                    product.groessenMengen[size] && product.groessenMengen[size].quantity > 0
                                )
                                
                                return (
                                    <TableRow key={product.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                        <TableCell className="p-4">
                                            <div className="flex items-center justify-center">
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
                                        <TableCell className="p-4 text-center">
                                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                {availableSizes.length > 0 ? (
                                                    availableSizes.map(size => (
                                                        <span 
                                                            key={size}
                                                            className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200"
                                                        >
                                                            {size}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">Alle Größen</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Button
                                                onClick={() => handleOpenModal(product)}
                                                disabled={buyingId === product.id}
                                                className="bg-[#61A178] hover:bg-[#61A178]/90 text-white cursor-pointer shadow-sm hover:shadow transition-all"
                                            >
                                                Einlagen bestellen
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
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

            {/* Buy Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Einlagen bestellen</DialogTitle>
                        <DialogDescription>
                            Geben Sie die gewünschten Mengen für jede Größe ein
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProduct && (
                        <div className="space-y-6 py-4">
                            {/* Product Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                {selectedProduct.image ? (
                                    <Image
                                        width={80}
                                        height={80}
                                        src={selectedProduct.image}
                                        alt={selectedProduct.productName}
                                        className="w-20 h-20 rounded border object-contain border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-20 h-20 flex items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">{selectedProduct.productName}</h3>
                                    <p className="text-sm text-gray-600">{selectedProduct.brand}</p>
                                    <p className="text-sm text-gray-600">Artikelnummer: {selectedProduct.artikelnummer}</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">Preis: €{selectedProduct.price}</p>
                                </div>
                            </div>

                            {/* Quantity Inputs */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Mengen pro Größe:</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                    {sizeColumns.map(size => (
                                        <div key={size} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Größe {size}
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={quantities[size] || 0}
                                                onChange={(e) => handleQuantityChange(size, e.target.value)}
                                                className="w-full"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Price */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Gesamtmenge:</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {Object.values(quantities).reduce((sum, qty) => sum + qty, 0)} Stück
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Gesamtpreis:</p>
                                        <p className="text-2xl font-bold text-[#61A178]">
                                            €{calculateTotalPrice().toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false)
                                setSelectedProduct(null)
                                setQuantities({})
                            }}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleBuy}
                            disabled={buyingId === selectedProduct?.id || calculateTotalPrice() === 0}
                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                        >
                            {buyingId === selectedProduct?.id ? 'Bestellen...' : 'Bestellen'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
