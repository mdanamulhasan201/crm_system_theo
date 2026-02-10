import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IoTime, IoArrowDown, IoDocumentText } from 'react-icons/io5'
import { getProductHistory } from '@/apis/storeManagement'
import toast from 'react-hot-toast'

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

// Extract size from reason field (e.g., "Order block 3" -> "Size 3")
const extractSizeFromReason = (reason: string | null): string => {
    if (!reason) return ''
    // Match patterns like "block 3", "block 1", "block 2" or "Size 1", "Size 2", "Size 3"
    const blockMatch = reason.match(/block\s*(\d+)/i)
    const sizeMatch = reason.match(/size\s*(\d+)/i)
    
    if (blockMatch) {
        return `Size ${blockMatch[1]}`
    }
    if (sizeMatch) {
        return `Size ${sizeMatch[1]}`
    }
    return reason
}

// Map changeType to HistoryEntry type
const mapChangeType = (changeType: string): 'delivery' | 'sale' | 'correction' | 'transfer' => {
    switch (changeType?.toLowerCase()) {
        case 'sales':
        case 'sale':
            return 'sale'
        case 'delivery':
        case 'deliveries':
            return 'delivery'
        case 'correction':
        case 'corrections':
            return 'correction'
        case 'transfer':
        case 'transfers':
            return 'transfer'
        default:
            return 'transfer'
    }
}

// Map API response to HistoryEntry
const mapApiEntryToHistoryEntry = (apiEntry: any): HistoryEntry => {
    // Extract size from reason field for milling_block
    const size = apiEntry.size || extractSizeFromReason(apiEntry.reason) || ''
    
    // Map changeType to type
    const type = mapChangeType(apiEntry.changeType || apiEntry.type)
    
    // Calculate previousStock from newStock and quantity based on changeType
    const newStock = apiEntry.newStock ?? null
    const quantity = apiEntry.quantity ?? null
    let previousStock = apiEntry.previousStock ?? null
    
    // If previousStock is not provided, calculate it based on changeType
    if (previousStock === null && newStock !== null && quantity !== null) {
        const changeType = (apiEntry.changeType || apiEntry.type || '').toLowerCase()
        if (changeType === 'sales' || changeType === 'sale') {
            // For sales, stock decreased, so previousStock = newStock + quantity
            previousStock = newStock + quantity
        } else if (changeType === 'delivery' || changeType === 'deliveries') {
            // For deliveries, stock increased, so previousStock = newStock - quantity
            previousStock = Math.max(0, newStock - quantity)
        } else {
            // For other types, assume stock increased
            previousStock = Math.max(0, newStock - quantity)
        }
    }
    
    // Extract user name
    const userName = apiEntry.user?.name || apiEntry.userName || apiEntry.user || 'System'
    
    // Use reason as notes if available
    const notes = apiEntry.notes || apiEntry.description || apiEntry.reason || ''
    
    return {
        id: apiEntry.id || '',
        date: apiEntry.date || apiEntry.createdAt || new Date().toISOString(),
        type: type,
        quantity: quantity,
        size: size,
        previousStock: previousStock,
        newStock: newStock,
        user: userName,
        notes: notes
    }
}

interface MillingBlockHistoryProps {
    product: MillingBlock | null
    isOpen: boolean
    onClose: () => void
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
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [pagination, setPagination] = useState<any>(null)

    // Fetch history when modal opens
    useEffect(() => {
        const fetchHistory = async () => {
            if (product && isOpen) {
                setIsLoadingHistory(true)
                setCurrentPage(1)
                setHistoryEntries([])
                setHasNextPage(false)

                try {
                    const response = await getProductHistory(product.id, 1, 10)
                    if (response.success && response.data) {
                        const mappedHistory: HistoryEntry[] = response.data.map(mapApiEntryToHistoryEntry)
                        setHistoryEntries(mappedHistory)
                        setPagination(response.pagination)
                        setHasNextPage(response.pagination?.hasNextPage || false)
                    } else {
                        setHistoryEntries([])
                        setHasNextPage(false)
                        if (response.data && response.data.length === 0) {
                            toast.error('Keine Historie gefunden')
                        }
                    }
                } catch (error: any) {
                    console.error('Failed to fetch history:', error)
                    setHistoryEntries([])
                    setHasNextPage(false)
                    toast.error(error?.response?.data?.message || 'Fehler beim Laden der Historie')
                } finally {
                    setIsLoadingHistory(false)
                }
            }
        }

        if (product && isOpen) {
            fetchHistory()
        }
    }, [product, isOpen])

    // Load more history entries
    const loadMoreHistory = async () => {
        if (!product || isLoadingMore || !hasNextPage) return

        setIsLoadingMore(true)
        const nextPage = currentPage + 1

        try {
            const response = await getProductHistory(product.id, nextPage, 10)
            if (response.success && response.data) {
                const mappedHistory: HistoryEntry[] = response.data.map(mapApiEntryToHistoryEntry)
                setHistoryEntries(prev => [...prev, ...mappedHistory])
                setCurrentPage(nextPage)
                setPagination(response.pagination)
                setHasNextPage(response.pagination?.hasNextPage || false)
            } else {
                setHasNextPage(false)
            }
        } catch (error: any) {
            console.error('Failed to load more history:', error)
            toast.error(error?.response?.data?.message || 'Fehler beim Laden weiterer Einträge')
        } finally {
            setIsLoadingMore(false)
        }
    }

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
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : historyEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <IoDocumentText className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-gray-500">Keine Historie gefunden</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pr-2">
                            {historyEntries.map((entry) => (
                                <div key={entry.id} className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    entry.type === 'sale' ? 'bg-red-100' :
                                                    entry.type === 'delivery' ? 'bg-green-100' :
                                                    entry.type === 'correction' ? 'bg-yellow-100' :
                                                    'bg-blue-100'
                                                }`}>
                                                    <IoArrowDown className={`w-6 h-6 ${
                                                        entry.type === 'sale' ? 'text-red-600' :
                                                        entry.type === 'delivery' ? 'text-green-600' :
                                                        entry.type === 'correction' ? 'text-yellow-600' :
                                                        'text-blue-600'
                                                    }`} />
                                                </div>
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header Row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyling(entry.type)}`}>
                                                            {getTypeLabel(entry.type)}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {entry.size.startsWith('Size ') ? entry.size : `Größe ${entry.size}`}
                                                            </span>
                                                            {entry.quantity !== null && (
                                                                <span className="text-sm font-bold text-gray-700">
                                                                    {entry.type === 'sale' ? '-' : '+'}{Math.abs(entry.quantity)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {entry.previousStock !== null && entry.newStock !== null && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                                    {entry.previousStock}
                                                                </span>
                                                                <span className="text-gray-400">→</span>
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded font-semibold">
                                                                    {entry.newStock}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Date and User */}
                                                    <div className="text-right flex-shrink-0 ml-4">
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                            <IoTime className="w-3 h-3" />
                                                            <span>{new Date(entry.date).toLocaleDateString('de-DE')}</span>
                                                            <span>{new Date(entry.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            von {entry.user}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                {entry.notes && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Button */}
                            {hasNextPage && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={loadMoreHistory}
                                        disabled={isLoadingMore}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {isLoadingMore ? 'Laden...' : 'Mehr laden'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

