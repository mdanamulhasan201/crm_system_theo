'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPreviousOrders } from '@/apis/productsOrder'
// import Loading from '@/components/Shared/Loading'

interface PreviousOrdersModalProps {
    isOpen: boolean
    onClose: () => void
    customerId: string
    fetchType: 'all' | 'customer' // 'all' for all supplies, 'customer' for customer-specific
    productType?: 'insole' | 'shoes' | 'sonstiges'
}

interface OrderData {
    id: string
    orderNumber: number
    createdAt: string
    customerId: string
    versorgungId?: string
    screenerId?: string
    einlagentyp?: string
    überzug?: string
    quantity?: number
    versorgung_note?: string
    schuhmodell_wählen?: string
    kostenvoranschlag?: boolean
    ausführliche_diagnose?: string
    versorgung_laut_arzt?: string
    kundenName?: string | null
    auftragsDatum?: string | null
    wohnort?: string | null
    telefon?: string | null
    email?: string | null
    geschaeftsstandort?: string | {
        address?: string
        description?: string
    }
    mitarbeiter?: string | null
    fertigstellungBis?: string
    versorgung?: string | null
    bezahlt?: string
    fussanalysePreis?: number
    einlagenversorgungPreis?: number
    employeeId?: string
    discount?: number
    totalPrice?: number
    orderCategory?: string
    type?: string
    insoleStandards?: Array<{
        name: string
        left: number
        right: number
    }>
    Versorgungen?: {
        supplyStatus?: {
            id: string
            name: string
            price: number
            image: string
        } | null
    }
    // Shoes data structure fields
    arztliche_diagnose?: string
    button_text?: string
    customer_note?: string
    datumAuftrag?: string
    delivery_date?: string
    durchgeführt_von?: string
    einlagenversorgung?: number
    filiale?: {
        address?: string
        description?: string
    } | {}
    fußanalyse?: number
    halbprobe_geplant?: boolean
    kunde?: string
    location?: string
    note?: string
    orderNote?: string
    paymentType?: string
    rezeptnummer?: string
    statusBezahlt?: boolean
    usführliche_diagnose?: string
}

export default function PreviousOrdersModal({
    isOpen,
    onClose,
    customerId,
    fetchType,
    productType = 'insole'
}: PreviousOrdersModalProps) {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cursor, setCursor] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (isOpen && customerId) {
            fetchOrders()
        } else {
            // Reset state when modal closes
            setOrders([])
            setError(null)
            setCursor(undefined)
        }
    }, [isOpen, customerId, fetchType, productType])

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const limit = fetchType === 'all' ? 1 : 10
            const response = await getPreviousOrders(customerId, limit, cursor, productType)
            const responseData = (response as any)?.data
            const ordersArray = Array.isArray(responseData)
                ? responseData
                : responseData
                    ? [responseData]
                    : []

            setOrders(ordersArray)
            
            // Note: cursor handling might be needed for pagination in future
            // For now, we just display the orders
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Laden der vorherigen Bestellungen.')
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl uppercase font-semibold">
                        {fetchType === 'all' 
                            ? 'Letzte Versorgung' 
                            : 'Vorherige Bestellungen'}
                    </DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-[#62A17C] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                            <div className="w-3 h-3 bg-[#62A17C] rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></div>
                            <div className="w-3 h-3 bg-[#62A17C] rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></div>
                        </div>
                        <p className="text-gray-500 text-sm">Lade Daten...</p>
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-sm mb-4 p-4 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="text-gray-500 text-center py-8">
                        Keine vorherigen Bestellungen gefunden.
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm"
                            >
                                <div className="w-full h-40 bg-gray-100">
                                    {order.Versorgungen?.supplyStatus?.image ? (
                                        <img
                                            src={order.Versorgungen.supplyStatus.image}
                                            alt={order.Versorgungen.supplyStatus.name || 'Versorgung'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                            Kein Bild
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 space-y-2">
                                    <div className="text-sm text-gray-500">
                                        {order.createdAt ? formatDate(order.createdAt) : ''}
                                    </div>

                                    <div className="font-semibold text-gray-900 line-clamp-2">
                                        {order.Versorgungen?.supplyStatus?.name ||
                                            order.versorgung ||
                                            order.einlagentyp ||
                                            order.schuhmodell_wählen ||
                                            'Versorgung'}
                                    </div>

                                    <div className="text-sm text-gray-700 space-y-1">
                                        <div>
                                            <span className="font-medium">Bestellnummer:</span>{' '}
                                            <span>{order.orderNumber}</span>
                                        </div>
                                        {(order.kundenName || order.kunde) && (
                                            <div className="truncate">
                                                <span className="font-medium">Kunde:</span>{' '}
                                                <span>{order.kundenName || order.kunde}</span>
                                            </div>
                                        )}
                                        {order.quantity !== undefined && (
                                            <div>
                                                <span className="font-medium">Menge:</span>{' '}
                                                <span>{order.quantity}</span>
                                            </div>
                                        )}
                                        {order.totalPrice !== undefined && (
                                            <div>
                                                <span className="font-medium">Gesamt:</span>{' '}
                                                <span>{order.totalPrice} €</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

