'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getPreviousOrders, getPreviousOrdersByProductType } from '@/apis/productsOrder'
import Loading from '@/components/Shared/Loading'

interface PreviousOrdersModalProps {
    isOpen: boolean
    onClose: () => void
    customerId: string
    fetchType: 'all' | 'customer' // 'all' for all supplies, 'customer' for customer-specific
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
    fetchType
}: PreviousOrdersModalProps) {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedProductType, setSelectedProductType] = useState<'insole' | 'shoes'>('insole')
    const [cursor, setCursor] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (isOpen && customerId) {
            // For customer type, fetch insole data by default
            if (fetchType === 'customer') {
                fetchOrders('insole')
            } else {
                fetchOrders()
            }
        } else {
            // Reset state when modal closes
            setOrders([])
            setError(null)
            setSelectedProductType('insole')
            setCursor(undefined)
        }
    }, [isOpen, customerId, fetchType])

    const fetchOrders = async (productType?: 'insole' | 'shoes') => {
        setLoading(true)
        setError(null)
        try {
            let response
            const limit = fetchType === 'all' ? 1 : 10 // For all supplies, get 1, for customer get 10
            
            if (fetchType === 'customer' && productType) {
                // Fetch by product type for customer orders
                response = await getPreviousOrdersByProductType(
                    customerId,
                    limit,
                    cursor,
                    productType
                )
            } else {
                // Fetch all orders (for 'all' type or initial load)
                response = await getPreviousOrders(customerId, limit, cursor)
            }

            // Handle API response structure: { success, message, data, hasMore }
            const responseData = (response as any)?.data
            const ordersArray = Array.isArray(responseData) ? responseData : []
            
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

    const handleProductTypeFilter = (type: 'insole' | 'shoes') => {
        setSelectedProductType(type)
        fetchOrders(type)
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

                {/* Product Type Filter Buttons */}
                {fetchType === 'customer' && (
                    <div className="flex gap-4 mb-4">
                        <Button
                            onClick={() => handleProductTypeFilter('insole')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                selectedProductType === 'insole'
                                    ? 'bg-[#62A17C] text-white hover:bg-[#4A8A5F]'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Einlagen
                        </Button>
                        <Button
                            onClick={() => handleProductTypeFilter('shoes')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                selectedProductType === 'shoes'
                                    ? 'bg-[#62A17C] text-white hover:bg-[#4A8A5F]'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Schuhe
                        </Button>
                    </div>
                )}

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
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Left Column */}
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-semibold text-gray-700">Bestellnummer:</span>{' '}
                                            <span className="text-gray-900">{order.orderNumber}</span>
                                        </div>
                                        {order.createdAt && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Erstellt am:</span>{' '}
                                                <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                                            </div>
                                        )}
                                        {order.datumAuftrag && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Auftragsdatum:</span>{' '}
                                                <span className="text-gray-900">{order.datumAuftrag}</span>
                                            </div>
                                        )}
                                        {order.delivery_date && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Lieferdatum:</span>{' '}
                                                <span className="text-gray-900">{order.delivery_date}</span>
                                            </div>
                                        )}
                                        {order.orderCategory && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Kategorie:</span>{' '}
                                                <span className="text-gray-900 capitalize">{order.orderCategory}</span>
                                            </div>
                                        )}
                                        {order.type && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Typ:</span>{' '}
                                                <span className="text-gray-900">{order.type}</span>
                                            </div>
                                        )}
                                        {order.einlagentyp && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Einlagentyp:</span>{' '}
                                                <span className="text-gray-900">{order.einlagentyp}</span>
                                            </div>
                                        )}
                                        {order.überzug && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Überzug:</span>{' '}
                                                <span className="text-gray-900">{order.überzug}</span>
                                            </div>
                                        )}
                                        {order.quantity && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Menge:</span>{' '}
                                                <span className="text-gray-900">{order.quantity}</span>
                                            </div>
                                        )}
                                        {order.schuhmodell_wählen && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Schuhmodell:</span>{' '}
                                                <span className="text-gray-900">{order.schuhmodell_wählen}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-2">
                                        {(order.kundenName || order.kunde) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Kundenname:</span>{' '}
                                                <span className="text-gray-900">{order.kundenName || order.kunde}</span>
                                            </div>
                                        )}
                                        {order.auftragsDatum && !order.datumAuftrag && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Auftragsdatum:</span>{' '}
                                                <span className="text-gray-900">{order.auftragsDatum}</span>
                                            </div>
                                        )}
                                        {order.wohnort && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Wohnort:</span>{' '}
                                                <span className="text-gray-900">{order.wohnort}</span>
                                            </div>
                                        )}
                                        {order.telefon && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Telefon:</span>{' '}
                                                <span className="text-gray-900">{order.telefon}</span>
                                            </div>
                                        )}
                                        {order.email && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Email:</span>{' '}
                                                <span className="text-gray-900">{order.email}</span>
                                            </div>
                                        )}
                                        {(order.geschaeftsstandort || order.filiale) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Geschäftsstandort:</span>{' '}
                                                <span className="text-gray-900">
                                                    {order.geschaeftsstandort 
                                                        ? (typeof order.geschaeftsstandort === 'string' 
                                                            ? order.geschaeftsstandort 
                                                            : `${order.geschaeftsstandort.address || ''} ${order.geschaeftsstandort.description || ''}`.trim())
                                                        : (order.filiale && typeof order.filiale === 'object' && !Array.isArray(order.filiale) && ('address' in order.filiale || 'description' in order.filiale)
                                                            ? `${('address' in order.filiale ? order.filiale.address : '') || ''} ${('description' in order.filiale ? order.filiale.description : '') || ''}`.trim()
                                                            : order.location || '')}
                                                </span>
                                            </div>
                                        )}
                                        {(order.mitarbeiter || order.durchgeführt_von) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Mitarbeiter:</span>{' '}
                                                <span className="text-gray-900">{order.mitarbeiter || order.durchgeführt_von}</span>
                                            </div>
                                        )}
                                        {order.versorgung_note && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Versorgung Notiz:</span>{' '}
                                                <span className="text-gray-900">{order.versorgung_note}</span>
                                            </div>
                                        )}
                                        {order.versorgung && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Versorgung:</span>{' '}
                                                <span className="text-gray-900">{order.versorgung}</span>
                                            </div>
                                        )}
                                        {(order.ausführliche_diagnose || order.usführliche_diagnose || order.arztliche_diagnose) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Diagnose:</span>{' '}
                                                <span className="text-gray-900">{order.ausführliche_diagnose || order.usführliche_diagnose || order.arztliche_diagnose}</span>
                                            </div>
                                        )}
                                        {order.versorgung_laut_arzt && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Versorgung laut Arzt:</span>{' '}
                                                <span className="text-gray-900">{order.versorgung_laut_arzt}</span>
                                            </div>
                                        )}
                                        {order.rezeptnummer && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Rezeptnummer:</span>{' '}
                                                <span className="text-gray-900">{order.rezeptnummer}</span>
                                            </div>
                                        )}
                                        {order.paymentType && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Zahlungsart:</span>{' '}
                                                <span className="text-gray-900 capitalize">{order.paymentType}</span>
                                            </div>
                                        )}
                                        {order.statusBezahlt !== undefined && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Bezahlt:</span>{' '}
                                                <span className="text-gray-900">{order.statusBezahlt ? 'Ja' : 'Nein'}</span>
                                            </div>
                                        )}
                                        {(order.note || order.customer_note || order.orderNote) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Notiz:</span>{' '}
                                                <span className="text-gray-900">{order.note || order.customer_note || order.orderNote}</span>
                                            </div>
                                        )}
                                        {order.fertigstellungBis && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Fertigstellung bis:</span>{' '}
                                                <span className="text-gray-900">{order.fertigstellungBis}</span>
                                            </div>
                                        )}
                                        {order.bezahlt && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Bezahlt:</span>{' '}
                                                <span className="text-gray-900">{order.bezahlt}</span>
                                            </div>
                                        )}
                                        {(order.fussanalysePreis !== undefined || order.fußanalyse !== undefined) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Fußanalyse Preis:</span>{' '}
                                                <span className="text-gray-900">{order.fussanalysePreis || order.fußanalyse} €</span>
                                            </div>
                                        )}
                                        {(order.einlagenversorgungPreis !== undefined || order.einlagenversorgung !== undefined) && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Einlagenversorgung Preis:</span>{' '}
                                                <span className="text-gray-900">{order.einlagenversorgungPreis || order.einlagenversorgung} €</span>
                                            </div>
                                        )}
                                        {order.halbprobe_geplant !== undefined && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Halbprobe geplant:</span>{' '}
                                                <span className="text-gray-900">{order.halbprobe_geplant ? 'Ja' : 'Nein'}</span>
                                            </div>
                                        )}
                                        {order.discount !== null && order.discount !== undefined && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Rabatt:</span>{' '}
                                                <span className="text-gray-900">{order.discount} €</span>
                                            </div>
                                        )}
                                        {order.totalPrice !== undefined && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Gesamtpreis:</span>{' '}
                                                <span className="text-gray-900">{order.totalPrice} €</span>
                                            </div>
                                        )}
                                        {order.kostenvoranschlag !== undefined && (
                                            <div>
                                                <span className="font-semibold text-gray-700">Kostenvoranschlag:</span>{' '}
                                                <span className="text-gray-900">{order.kostenvoranschlag ? 'Ja' : 'Nein'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Insole Standards */}
                                {order.insoleStandards && order.insoleStandards.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <h4 className="font-semibold text-gray-700 mb-2">Einlagen Standards:</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {order.insoleStandards.map((standard, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="font-medium">{standard.name}:</span>{' '}
                                                    <span>Links: {standard.left}, Rechts: {standard.right}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Versorgung Status */}
                                {order.Versorgungen?.supplyStatus && (
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <h4 className="font-semibold text-gray-700 mb-2">Versorgung Status:</h4>
                                        <div className="flex items-center gap-4">
                                            {order.Versorgungen.supplyStatus.image && (
                                                <img
                                                    src={order.Versorgungen.supplyStatus.image}
                                                    alt={order.Versorgungen.supplyStatus.name}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{order.Versorgungen.supplyStatus.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    Preis: {order.Versorgungen.supplyStatus.price} €
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {order.Versorgungen && !order.Versorgungen.supplyStatus && (
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <div className="text-sm text-gray-500">Kein Versorgung Status verfügbar</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

