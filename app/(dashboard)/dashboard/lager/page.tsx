'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import LagerChart from '@/components/LagerChart/LagerChart'
import ProductManagementTable from '../_components/Product/ProductManagementTable'
import AddProduct from '../_components/Product/AddProduct'
import DeleteConfirmModal from '../_components/Product/DeleteConfirmModal'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'
import InventoryHistory, { InventoryHistoryRef } from '../_components/Product/InventoryHistory'
import { deleteStorage } from '@/apis/productsManagementApis'
import toast from 'react-hot-toast'
import PerformerData from '@/components/LagerChart/PerformerData'

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

interface NewProduct {
    Produktname: string
    Produktkürzel: string
    Hersteller: string
    purchase_price: number
    selling_price: number
    sizeQuantities: { [key: string]: SizeData }
}

// Define the size columns
const sizeColumns = [
    "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"
];

export default function Lager() {
    // Stock management hook
    const { products, pagination, getAllProducts, refreshProducts, isLoadingProducts, error, updateExistingProduct } = useStockManagementSlice();

    // Pagination state
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [currentPage, setCurrentPage] = useState(1)
    const [showPagination, setShowPagination] = useState(false)

    // Product data state - convert API products to local format
    const [productsData, setProductsData] = useState<Product[]>([])


    // Component refs
    const inventoryHistoryRef = useRef<InventoryHistoryRef>(null)

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
            inventoryHistory: [] // API doesn't provide history yet
        };
    };

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiProducts = await getAllProducts();
                const convertedProducts = apiProducts.map(convertApiProductToLocal);
                setProductsData(convertedProducts);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            }
        };

        fetchProducts();
    }, [getAllProducts]);



    // Pagination calculations
    const totalPages = Math.ceil(productsData.length / 10)
    const startIndex = showPagination ? (currentPage - 1) * 10 : 0
    const visibleProducts = showPagination
        ? productsData.slice(startIndex, startIndex + 10)
        : productsData.slice(0, itemsPerPage)

    // Pagination handlers
    const handleShowMore = () => {
        setItemsPerPage(10)
        setShowPagination(true)
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

    // Add product handler - refresh data from API
    const handleAddProduct = (newProduct: NewProduct) => {
        // Refresh products from API to get the latest data including the newly created product
        refreshProducts()
            .then(apiProducts => {
                const convertedProducts = apiProducts.map(convertApiProductToLocal);
                setProductsData(convertedProducts);
            })
            .catch(err => {
                console.error('Failed to refresh products after adding:', err);
            });
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
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <h2 className="text-2xl font-semibold">Einlagenrohlinge</h2>
                    {pagination && (
                        <p className="text-sm text-gray-600 mt-1">
                            {pagination.totalItems} Produkte gefunden
                        </p>
                    )}
                </div>
                {/* Add Product Component */}
                <AddProduct
                    onAddProduct={handleAddProduct}
                    sizeColumns={sizeColumns}
                />
            </div>



            {/* Product Management Table */}
            {isLoadingProducts ? (
                <div className="flex justify-center items-center py-8">
                    <div className="text-lg">Lade Produkte...</div>
                </div>
            ) : error ? (
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
                    onLagerortChange={handleLagerortChange}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                />
            )}

            {/* Pagination */}
            <div className="mt-6">
                {!showPagination && itemsPerPage < productsData.length && (
                    <div className="flex justify-center">
                        <Button
                            onClick={handleShowMore}
                            variant="outline"
                            size="lg"
                            className="px-8 py-3 cursor-pointer"
                        >
                            Mehr anzeigen
                        </Button>
                    </div>
                )}

                {showPagination && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Zeige:</span>
                            <Select
                                value="10"
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
                            <span className="text-sm text-gray-600">von {pagination?.totalItems || productsData.length} Produkten</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>

                        <div className="text-sm text-gray-600">
                            Seite {currentPage} von {totalPages}
                        </div>
                    </div>
                )}
            </div>

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
