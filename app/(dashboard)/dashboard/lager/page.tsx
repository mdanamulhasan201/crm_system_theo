'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
import LagerChart from '@/components/LagerChart/LagerChart'
import ProductManagementTable from '../_components/Product/ProductManagementTable'
import DeleteConfirmModal from '../_components/Product/DeleteConfirmModal'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import InventoryHistory, { InventoryHistoryRef } from '../_components/Product/InventoryHistory'
import { deleteStorage } from '@/apis/productsManagementApis'
import toast from 'react-hot-toast'
import PerformerData from '@/components/LagerChart/PerformerData'
import useDebounce from '@/hooks/useDebounce'


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
const getQuantity = (sizeData: number | SizeData | undefined): number => {
    if (sizeData === undefined) return 0;
    if (typeof sizeData === 'number') return sizeData;
    return sizeData.quantity || 0;
}


// Define the size columns
const sizeColumns = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
];

export default function Lager() {
    const router = useRouter()
    // Stock management hook
    const { products, pagination, getAllProducts, refreshProducts, isLoadingProducts, error, updateExistingProduct } = useStockManagementSlice();

    // Pagination state
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [showPagination, setShowPagination] = useState(true)

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 500)

    // Product data state - convert API products to local format
    const [productsData, setProductsData] = useState<Product[]>([])


    // Component refs
    const inventoryHistoryRef = useRef<InventoryHistoryRef>(null)

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Product type toggle state
    const [selectedProductType, setSelectedProductType] = useState<'Einlagenrohlinge' | 'Fräsblock'>('Einlagenrohlinge')


    // Convert API product to local format
    const convertApiProductToLocal = (apiProduct: any): Product => {
        return {
            id: apiProduct.id,
            Produktname: apiProduct.produktname,
            Produktkürzel: apiProduct.artikelnummer,
            Hersteller: apiProduct.hersteller,
            Lagerort: apiProduct.lagerort,
            minStockLevel: apiProduct.mindestbestand,
            sizeQuantities: apiProduct.groessenMengen,
            Status: apiProduct.Status,
            image: apiProduct.image,
            inventoryHistory: [] // API doesn't provide history yet
        };
    };

    // Fetch products on component mount and when pagination/search changes
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiProducts = await getAllProducts(currentPage, itemsPerPage, debouncedSearch);
                const convertedProducts = apiProducts.map(convertApiProductToLocal);
                setProductsData(convertedProducts);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            }
        };

        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, debouncedSearch]);



    // Pagination calculations - use API pagination
    const totalPages = pagination?.totalPages || 1
    const visibleProducts = productsData // Already filtered by API


    // Search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1) // Reset to first page on search
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

    return (
        <div className="w-full px-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-10">
                <h1 className='text-2xl font-semibold'>Produktverwaltung</h1>

                <div className="flex items-center gap-4">
                    {/* <DeliveryNote
                        productsData={productsData}
                        onDeliveryNoteAdd={setProductsData}
                    /> */}

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
                    {/* Toggle Buttons */}
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => setSelectedProductType('Einlagenrohlinge')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                selectedProductType === 'Einlagenrohlinge'
                                    ? 'bg-[#61A178] text-white'
                                    : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                            }`}

                        >
                            Einlagenrohlinge
                        </button>
                        <button
                            onClick={() => setSelectedProductType('Fräsblock')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                selectedProductType === 'Fräsblock'
                                    ? 'bg-[#61A178] text-white'
                                    : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                            }`}

                        >
                            Fräsblock
                        </button>
                    </div>
                    {pagination && (
                        <p className="text-sm text-gray-600 mt-1">
                            {pagination.totalItems} Produkte gefunden
                        </p>
                    )}
                </div>
                {/* Buy Now Button */}
                <Button
                    onClick={() => router.push('/dashboard/buy-storage')}
                    disabled={isLoadingProducts}
                    className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                >
                    Lagerplätze kaufen
                </Button>

            </div>



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
                />
            )}

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
                                von {pagination.totalItems} Produkten
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

                                    {/* Show page numbers - limit to 5 pages at a time */}
                                    {(() => {
                                        const pages: (number | string)[] = [];
                                        const maxVisiblePages = 5;
                                        
                                        if (totalPages <= maxVisiblePages) {
                                            // Show all pages if total is less than max
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            // Show first page
                                            pages.push(1);
                                            
                                            if (currentPage > 3) {
                                                pages.push('...');
                                            }
                                            
                                            // Show pages around current page
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
                                            
                                            // Show last page
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

            {/* Chart */}
            <div className='flex flex-col xl:flex-row gap-4 lg:gap-6 items-stretch lg:items-start justify-center mt-14'>
                <div className='w-full lg:flex-1'>
                    <LagerChart />
                </div>
                <div className='w-full lg:flex-1'>
                    <PerformerData />
                </div>
            </div>

        </div>
    )
}
