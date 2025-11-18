import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IoWarning } from 'react-icons/io5'

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

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    product: Product | null
    isLoading: boolean
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    product,
    isLoading
}: DeleteConfirmModalProps) {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <IoWarning className="w-5 h-5" />
                        Produkt löschen bestätigen
                    </DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                    <p className="text-gray-700 mb-4">
                        Sind Sie sicher, dass Sie dieses Produkt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-2">Produktdetails:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Name:</span> {product.Produktname}</p>
                            <p><span className="font-medium">Hersteller:</span> {product.Hersteller}</p>
                            <p><span className="font-medium">Artikelnummer:</span> {product.Produktkürzel}</p>
                            <p><span className="font-medium">Lagerort:</span> {product.Lagerort}</p>
                            <p><span className="font-medium">Status:</span> 
                                <span className={`ml-1 ${
                                    product.Status === 'Critical Low Stock' ? 'text-red-600 font-semibold' :
                                    product.Status === 'Low Stock Warning' ? 'text-orange-600 font-medium' :
                                    product.Status === 'Out of Stock' ? 'text-red-800 font-bold' :
                                    'text-green-600'
                                }`}>
                                    {product.Status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? 'Löschen...' : 'Löschen'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
