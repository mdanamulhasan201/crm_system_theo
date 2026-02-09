import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { IoTime, IoArrowDown, IoDocumentText } from 'react-icons/io5'

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

interface HistoryEntry {
    id: string
    date: string
    type: 'delivery' | 'sale' | 'correction' | 'transfer'
    quantity: number | null
    size: string
    previousStock: number | null
    newStock: number | null
    user: string
    notes: string
}

interface MillingBlockHistoryProps {
    product: MillingBlock | null
    isOpen: boolean
    onClose: () => void
}

// Mock history entry for design demonstration
const mockHistoryEntry: HistoryEntry = {
    id: '1',
    date: new Date().toISOString(),
    type: 'sale',
    quantity: 5,
    size: 'Size 1',
    previousStock: 15,
    newStock: 10,
    user: 'Admin User',
    notes: 'Verkauf an Kunde'
}

const getTypeLabel = (type: string): string => {
    switch (type) {
        case 'sale': return 'Verkauf'
        case 'delivery': return 'Lieferung'
        case 'correction': return 'Korrektur'
        case 'transfer': return 'Transfer'
        default: return 'Bewegung'
    }
}

const getTypeStyling = (type: string): string => {
    switch (type) {
        case 'sale': return 'bg-red-100 text-red-800'
        case 'delivery': return 'bg-green-100 text-green-800'
        case 'correction': return 'bg-yellow-100 text-yellow-800'
        case 'transfer': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

export default function MillingBlockHistory({
    product,
    isOpen,
    onClose
}: MillingBlockHistoryProps) {
    if (!product) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold">
                        Lagerhistorie
                    </DialogTitle>
                    {/* Product Header */}
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Produkt</span>
                            <span className="font-semibold text-gray-900">{product.Produktname}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Artikelnummer</span>
                            <span className="font-semibold text-gray-900">{product.Produktkürzel}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Hersteller</span>
                            <span className="font-semibold text-gray-900">{product.Hersteller}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Lagerort</span>
                            <span className="font-semibold text-gray-900">{product.Lagerort}</span>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto mt-4">
                    <div className="space-y-4 pr-2">
                        {/* History Entry Card */}
                        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                            <div className="p-5">
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                                            <IoArrowDown className="w-6 h-6 text-red-600" />
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyling(mockHistoryEntry.type)}`}>
                                                    {getTypeLabel(mockHistoryEntry.type)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        Größe {mockHistoryEntry.size}
                                                    </span>
                                                    {mockHistoryEntry.quantity !== null && (
                                                        <span className="text-sm font-bold text-gray-700">
                                                            {mockHistoryEntry.type === 'sale' ? '-' : '+'}{Math.abs(mockHistoryEntry.quantity)}
                                                        </span>
                                                    )}
                                                </div>
                                                {mockHistoryEntry.previousStock !== null && mockHistoryEntry.newStock !== null && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                            {mockHistoryEntry.previousStock}
                                                        </span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded font-semibold">
                                                            {mockHistoryEntry.newStock}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Date and User */}
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                    <IoTime className="w-3 h-3" />
                                                    <span>{new Date(mockHistoryEntry.date).toLocaleDateString('de-DE')}</span>
                                                    <span>{new Date(mockHistoryEntry.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    von {mockHistoryEntry.user}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {mockHistoryEntry.notes && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                {mockHistoryEntry.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

