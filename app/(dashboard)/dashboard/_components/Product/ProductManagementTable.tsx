import React, { useState } from 'react'
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
import { IoWarning } from 'react-icons/io5'
import { IoTime } from 'react-icons/io5'
import { IoCreate } from 'react-icons/io5'
import { IoTrash } from 'react-icons/io5'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useAuth } from '@/contexts/AuthContext'
import AddProduct from './AddProduct'
import { useStockManagementSlice } from '@/hooks/stockManagement/useStockManagementSlice'

interface SizeData {
    length: number;
    quantity: number;
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

interface ProductManagementTableProps {
    visibleProducts: Product[]
    sizeColumns: string[]
    onShowHistory: (product: Product) => void
    hasLowStock: (product: Product) => boolean
    getLowStockSizes: (product: Product) => Array<{ size: string; quantity: number }>
    onLagerortChange: (productId: string, newLagerort: string) => void
    onUpdateProduct: (product: Product) => void
    onDeleteProduct: (product: Product) => void
    onRefreshAfterEdit?: () => void
}

export default function ProductManagementTable({
    visibleProducts,
    sizeColumns,
    onShowHistory,
    hasLowStock,
    getLowStockSizes,
    onLagerortChange,
    onUpdateProduct,
    onDeleteProduct,
    onRefreshAfterEdit
}: ProductManagementTableProps) {
    const { user } = useAuth();
    const { getProductById } = useStockManagementSlice();
    const [editId, setEditId] = useState<string | undefined>(undefined)
    const [openEdit, setOpenEdit] = useState(false)

    // Helper to get stock for a size
    function getStockForSize(product: Product, size: string) {
        return getQuantity(product.sizeQuantities[size]);
    }

    return (
        <>
        <Table className='border-2 border-gray-500 rounded-lg mt-5'>
            <TableHeader>
                <TableRow>
                    <TableHead className="border-2 border-gray-500 p-2">Lagerort</TableHead>
                    <TableHead className="border-2 border-gray-500 p-2">Hersteller</TableHead>
                    <TableHead className="border-2 border-gray-500 p-2">Artikelbezeichnung</TableHead>
                    <TableHead className="border-2 border-gray-500 p-2">Artikelnummer</TableHead>
                    <TableHead className="border-2 border-gray-500 p-2">Status</TableHead>
                    <TableHead className="border-2 border-gray-500 p-2">Historie</TableHead>
                    <TableHead className="border-2 border-gray-500 p-2">Aktionen</TableHead>
                    {sizeColumns.map(size => (
                        <TableHead key={size} className="border-2 border-gray-500 p-2 text-center">{size}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {visibleProducts.length === 0 ? (
                    <TableRow>
                        <TableCell 
                            colSpan={sizeColumns.length + 7} 
                            className="border-2 border-gray-500 p-8 text-center"
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
                        <TableRow key={product.id}>
                        <TableCell className="border-2 border-gray-500 p-2">
                            {/* Lagerort as editable dropdown */}
                            <Select value={product.Lagerort} onValueChange={(value) => onLagerortChange(product.id, value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alle Lagerorte">Alle Lagerorte</SelectItem>
                                    {user?.hauptstandort && user.hauptstandort.length > 0 ? (
                                        user.hauptstandort.map((location, index) => (
                                            <SelectItem key={index} value={location}>
                                                {location}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="Lager 1">Lager 1</SelectItem>
                                            <SelectItem value="Lager 2">Lager 2</SelectItem>
                                            <SelectItem value="Lager 3">Lager 3</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell className="border-2 border-gray-500 p-2">
                            {product.Hersteller}
                        </TableCell>
                        <TableCell className="border-2 border-gray-500 p-2">
                            {product.Produktname}
                        </TableCell>
                        <TableCell className="border-2 border-gray-500 p-2">
                            {product.Produktkürzel}
                        </TableCell>
                        <TableCell className="border-2 border-gray-500 p-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="flex items-center gap-2">
                                            {(product.Status === 'Critical Low Stock' || product.Status === 'Low Stock Warning' || product.Status === 'Out of Stock') && (
                                                <IoWarning className="text-red-500 text-lg" />
                                            )}
                                            <span className={`text-sm ${
                                                product.Status === 'Critical Low Stock' ? 'text-red-600 font-semibold' :
                                                product.Status === 'Low Stock Warning' ? 'text-orange-600 font-medium' :
                                                product.Status === 'Out of Stock' ? 'text-red-800 font-bold' :
                                                'text-green-600'
                                            }`}>
                                                {product.Status}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {hasLowStock(product) ? (
                                            <div >
                                                <p>Niedriger Bestand:</p>
                                                {getLowStockSizes(product).map(({ size, quantity }) => (
                                                    <p key={size}>Größe {size}: {quantity} Stück</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>Bestand ist ausreichend</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </TableCell>
                        <TableCell className="border-2 border-gray-500 p-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onShowHistory(product)}
                                className="h-8 w-8 p-0"
                            >
                                <IoTime className="w-4 h-4" />
                            </Button>
                        </TableCell>
                        <TableCell className="border-2 border-gray-500 p-2">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                        setEditId(product.id);
                                        setOpenEdit(true);
                                    }}
                                    className="h-8 w-8 p-0 cursor-pointer"
                                >
                                    <IoCreate className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onDeleteProduct(product)}
                                    className="h-8 w-8 p-0 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <IoTrash className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                        {sizeColumns.map(size => (
                            <TableCell key={size} className="border-2 border-gray-500 p-2 text-center">
                                {getStockForSize(product, size)}
                            </TableCell>
                        ))}
                    </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
        {/* Hidden Edit Modal controlled here */}
        {editId && (
            <AddProduct
                onAddProduct={() => {}}
                sizeColumns={sizeColumns}
                editProductId={editId}
                open={openEdit}
                onOpenChange={(o) => {
                    setOpenEdit(o)
                    if (!o) setEditId(undefined)
                }}
                showTrigger={false}
                onUpdated={() => {
                    onRefreshAfterEdit && onRefreshAfterEdit()
                }}
            />
        )}
        </>
    )
}
