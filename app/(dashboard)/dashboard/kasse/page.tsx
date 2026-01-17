'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Search, Download, X, AlertTriangle, Check, CheckCircle, Bell } from 'lucide-react'
import { FiPackage, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi'
import PaymentMethodDialog from '../_components/Kasse/PaymentMethodDialog'
import PickupPaymentDialog from '../_components/Kasse/PickupPaymentDialog'
import CashPaymentDialog from '../_components/Kasse/CashPaymentDialog'
import CardPaymentDialog from '../_components/Kasse/CardPaymentDialog'
import CardPaymentSuccessDialog from '../_components/Kasse/CardPaymentSuccessDialog'
import CashPaymentSuccessDialog from '../_components/Kasse/CashPaymentSuccessDialog'
import ProblemFeedbackDialog from '../_components/Kasse/ProblemFeedbackDialog'

interface Order {
    id: string
    customerName: string
    productType: string
    createdDate: string
    pickupDate: string
    paymentAmount: string
    paymentStatus: 'Bezahlt' | 'Offen' | 'Teilweise'
    orderStatus: 'Abholbereit' | 'Benachrichtigt' | 'Abgeholt' | 'Bereit'
    orderNumber: string
}

const mockOrders: Order[] = [
    {
        id: '1',
        customerName: 'David Schneider',
        productType: 'Sporteinlagen',
        createdDate: '28.07.2025',
        pickupDate: '12.08.2025',
        paymentAmount: '245.00',
        paymentStatus: 'Bezahlt',
        orderStatus: 'Benachrichtigt',
        orderNumber: '#45279'
    },
    {
        id: '2',
        customerName: 'Maria Weber',
        productType: 'Sporteinlagen',
        createdDate: '05.08.2025',
        pickupDate: '18.08.2025',
        paymentAmount: '180.00',
        paymentStatus: 'Bezahlt',
        orderStatus: 'Bereit',
        orderNumber: '#45280'
    },
    {
        id: '3',
        customerName: 'Klaus Fischer',
        productType: 'Kompressionsstrümpfe',
        createdDate: '25.07.2025',
        pickupDate: '10.08.2025',
        paymentAmount: '125.50',
        paymentStatus: 'Teilweise',
        orderStatus: 'Benachrichtigt',
        orderNumber: '#45281'
    },
    {
        id: '4',
        customerName: 'Lisa Hoffmann',
        productType: 'Orthopädische Maßschuhe',
        createdDate: '08.08.2025',
        pickupDate: '20.08.2025',
        paymentAmount: '450.00',
        paymentStatus: 'Offen',
        orderStatus: 'Bereit',
        orderNumber: '#45282'
    },
    {
        id: '5',
        customerName: 'Peter Braun',
        productType: 'Arbeitsschutzeinlagen',
        createdDate: '09.08.2025',
        pickupDate: '19.08.2025',
        paymentAmount: '200.00',
        paymentStatus: 'Bezahlt',
        orderStatus: 'Abgeholt',
        orderNumber: '#45283'
    }
]

const recentPickups: Order[] = [
    {
        id: '6',
        customerName: 'Peter Braun',
        productType: 'Arbeitsschutzeinlagen',
        createdDate: '19.08.2025',
        pickupDate: '19.08.2025',
        paymentAmount: '200.00',
        paymentStatus: 'Bezahlt',
        orderStatus: 'Abgeholt',
        orderNumber: '#45278'
    }
]

export default function KassePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'einlagen' | 'massschuhe' | 'sonstiges'>('all')
    const [orders, setOrders] = useState<Order[]>(mockOrders)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Payment Dialog States
    const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false)
    const [isPickupPaymentOpen, setIsPickupPaymentOpen] = useState(false)
    const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false)
    const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(false)
    const [isCashSuccessOpen, setIsCashSuccessOpen] = useState(false)
    const [isCardSuccessOpen, setIsCardSuccessOpen] = useState(false)
    const [isCashProblemOpen, setIsCashProblemOpen] = useState(false)

    // Calculate statistics
    const stats = {
        readyForPickup: orders.filter(o => o.orderStatus === 'Abholbereit' || o.orderStatus === 'Bereit').length,
        pickupsToday: orders.filter(o => o.pickupDate === new Date().toLocaleDateString('de-DE')).length,
        openPayments: orders.filter(o => o.paymentStatus === 'Offen').length,
        paymentsToday: orders.filter(o => o.paymentStatus === 'Bezahlt' && o.pickupDate === new Date().toLocaleDateString('de-DE')).length,
        additionalOpen: orders.filter(o => o.orderStatus === 'Benachrichtigt').length
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Bezahlt':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'Offen':
                return 'text-orange-500 bg-orange-50 border-orange-200'
            case 'Teilweise':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'Abgeholt':
                return 'text-gray-600 bg-gray-50 border-gray-200'
            case 'Benachrichtigt':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'Bereit':
            case 'Abholbereit':
                return 'text-green-600 bg-green-50 border-green-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'all') return matchesSearch
        if (activeTab === 'einlagen') return matchesSearch && order.productType.toLowerCase().includes('einlagen')
        if (activeTab === 'massschuhe') return matchesSearch && order.productType.toLowerCase().includes('schuhe')
        if (activeTab === 'sonstiges') return matchesSearch && !order.productType.toLowerCase().includes('einlagen') && !order.productType.toLowerCase().includes('schuhe')

        return matchesSearch
    })

    // Payment Dialog Handlers
    const handlePaymentClick = () => {
        setIsSheetOpen(false) // Close the sheet before opening payment dialog
        setIsPaymentMethodOpen(true)
    }

    const handleCashSelected = () => {
        setIsPaymentMethodOpen(false)
        // Small delay to ensure smooth transition between dialogs
        setTimeout(() => {
            setIsCashPaymentOpen(true)
        }, 100)
    }

    const handleCardSelected = () => {
        setIsPaymentMethodOpen(false)
        // Small delay to ensure smooth transition between dialogs
        setTimeout(() => {
            setIsPickupPaymentOpen(true)
        }, 100)
    }

    const handlePickupCashSelected = () => {
        setIsPickupPaymentOpen(false)
        // Small delay to ensure smooth transition between dialogs
        setTimeout(() => {
            setIsCashPaymentOpen(true)
        }, 100)
    }

    const handlePickupCardSelected = () => {
        setIsPickupPaymentOpen(false)
        // Small delay to ensure smooth transition between dialogs
        setTimeout(() => {
            setIsCardPaymentOpen(true)
        }, 100)
    }

    const handleBackToPaymentMethod = () => {
        setIsCashPaymentOpen(false)
        setIsCardPaymentOpen(false)
        // Small delay to ensure smooth transition between dialogs
        setTimeout(() => {
            setIsPickupPaymentOpen(true)
        }, 100)
    }

    const handleCashPaymentComplete = () => {
        // Close cash payment dialog and open success dialog
        setIsCashPaymentOpen(false)
        setTimeout(() => {
            setIsCashSuccessOpen(true)
        }, 100)
    }

    const handleCardPaymentComplete = () => {
        // Close card payment dialog and open success dialog
        setIsCardPaymentOpen(false)
        setTimeout(() => {
            setIsCardSuccessOpen(true)
        }, 100)
    }

    const handlePaymentSuccess = () => {
        // Update order status to paid and picked up
        if (selectedOrder) {
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === selectedOrder.id
                        ? { ...order, paymentStatus: 'Bezahlt' as const, orderStatus: 'Abgeholt' as const }
                        : order
                )
            )
        }
        // Close all dialogs
        setIsCashSuccessOpen(false)
        setIsCardSuccessOpen(false)
        setIsCashProblemOpen(false)
        setIsPaymentMethodOpen(false)
        setIsSheetOpen(false)
    }

    const handleCashProblem = () => {
        // Close success dialog and open problem dialog
        setIsCashSuccessOpen(false)
        setTimeout(() => {
            setIsCashProblemOpen(true)
        }, 100)
    }

    const closeAllPaymentDialogs = () => {
        setIsPaymentMethodOpen(false)
        setIsPickupPaymentOpen(false)
        setIsCashPaymentOpen(false)
        setIsCardPaymentOpen(false)
        setIsCashSuccessOpen(false)
        setIsCardSuccessOpen(false)
        setIsCashProblemOpen(false)
    }

    // Get payment data for dialogs
    const getPaymentData = () => {
        if (!selectedOrder) return null

        return {
            orderNumber: selectedOrder.orderNumber,
            customerName: selectedOrder.customerName,
            totalAmount: '185,00 €',
            insuranceAmount: '145,00 €',
            customerPayment: '40,00 €',
            remainingAmount: selectedOrder.paymentStatus === 'Bezahlt' ? 0 : 40.00
        }
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Kasse - Abholungen & Zahlungen</h1>
                <p className="text-sm text-gray-600 mt-1">Kundenabholungen verwalten und Zahlungen abwickeln</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-green-700">{stats.readyForPickup}</p>
                            <p className="text-sm text-gray-600 mt-1">Abholbereit</p>
                        </div>
                        <div className="bg-green-200 p-3 rounded-lg">
                            <FiPackage className="w-6 h-6 text-green-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-blue-700">{stats.pickupsToday}</p>
                            <p className="text-sm text-gray-600 mt-1">Abholungen heute</p>
                        </div>
                        <div className="bg-blue-200 p-3 rounded-lg">
                            <FiCalendar className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-red-700">{stats.openPayments}</p>
                            <p className="text-sm text-gray-600 mt-1">Offene Zahlungen</p>
                        </div>
                        <div className="bg-red-200 p-3 rounded-lg">
                            <FiDollarSign className="w-6 h-6 text-red-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-yellow-700">{stats.paymentsToday}</p>
                            <p className="text-sm text-gray-600 mt-1">Zahlungen heute</p>
                        </div>
                        <div className="bg-yellow-200 p-3 rounded-lg">
                            <FiDollarSign className="w-6 h-6 text-yellow-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-purple-700">{stats.additionalOpen}</p>
                            <p className="text-sm text-gray-600 mt-1">Zusatzung offen</p>
                        </div>
                        <div className="bg-purple-200 p-3 rounded-lg">
                            <FiClock className="w-6 h-6 text-purple-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col items-start mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-1/2">
                    <div className="flex items-center gap-3 p-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                            <svg 
                                className="w-6 h-6 text-gray-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 4v16m8-8H4" 
                                />
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M3 4h2m4 0h2m4 0h2m4 0h2M3 20h2m4 0h2m4 0h2m4 0h2M3 12h2m4 0h2m4 0h2m4 0h2" 
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Barcode scannen oder Auftragsnummer eingeben..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0 h-10"
                            />
                        </div>
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className='flex justify-center w-1/2'>

                <p className="text-xs text-gray-500 mt-2 text-center">Scanbereit • Enter drücken für manuelle Suche</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Alle Aufträge
                    </button>
                    <button
                        onClick={() => setActiveTab('einlagen')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'einlagen'
                                ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Einlagen
                    </button>
                    <button
                        onClick={() => setActiveTab('massschuhe')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'massschuhe'
                                ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Maßschuhe
                    </button>
                    <button
                        onClick={() => setActiveTab('sonstiges')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'sonstiges'
                                ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Sonstiges
                    </button>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kunde
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Erstellt
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Abholtermin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zahlung
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => {
                                        setSelectedOrder(order)
                                        setIsSheetOpen(true)
                                    }}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-[#61A175] rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                                                {order.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                                <div className="text-xs text-gray-500">{order.productType}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.createdDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.pickupDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Pickups Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Letzte Abholungen</h2>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Bericht exportieren
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kunde
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produkt
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Abholdatum
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zahlung
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Auftrags-Nr.
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentPickups.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.productType}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.pickupDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-50 border-green-200">
                                            Abgeschlossen
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{order.orderNumber}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <SheetHeader className="border-b pb-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Order {selectedOrder.orderNumber}</p>
                                        <SheetTitle className="text-xl font-bold">{selectedOrder.customerName}</SheetTitle>
                                    </div>
                                </div>
                            </SheetHeader>

                            {/* Product Info */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-1">Produkt</p>
                                <p className="text-base font-semibold text-gray-900">{selectedOrder.productType}</p>
                                <p className="text-sm text-gray-500 mt-1">Medizinische Kompression, Knielang</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Abholdatum</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedOrder.pickupDate}</p>
                                        {selectedOrder.pickupDate === '10.08.2025' && (
                                            <span className="text-xs text-red-600 font-medium">(überfällig)</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Type */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Zahlungsart</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <span className="text-sm font-medium">Krankenkasse</span>
                                </div>
                            </div>

                            {/* Payment Warning */}
                            {selectedOrder.paymentStatus !== 'Bezahlt' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900">Zahlung ausstehend</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Zuzahlung von {selectedOrder.paymentAmount.includes('125') ? '25,00' : '25,00'} € ist noch offen. Abholung ist dennoch möglich.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Breakdown */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold mb-3">Zahlung</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Gesamtbetrag</span>
                                        <span className="text-sm font-medium text-gray-900">95,00 €</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center mr-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>
                                        <span className="text-sm text-gray-600 flex-1">Krankenkasse</span>
                                        <span className="text-sm font-medium text-gray-900">70,00 €</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Zuzahlung Kunde</span>
                                        <span className="text-sm font-medium text-gray-900">25,00 €</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Bereits bezahlt</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedOrder.paymentStatus === 'Bezahlt' ? '25,00' : '0,00'} €
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-base font-semibold text-gray-900">Restbetrag</span>
                                        <span className="text-xl font-bold text-orange-500">
                                            {selectedOrder.paymentStatus === 'Bezahlt' ? '0,00' : '25,00'} €
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(selectedOrder.orderStatus)}`}>
                                        {selectedOrder.orderStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 mb-6">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={handlePaymentClick}
                                >
                                    <FiDollarSign className="w-4 h-4" />
                                    Bezahlen
                                </Button>
                                <Button
                                    className="w-full gap-2 bg-[#61A175] hover:bg-[#4f8a61]"
                                    onClick={handlePaymentClick}
                                >
                                    <FiPackage className="w-4 h-4" />
                                    Abholen & Bezahlen
                                </Button>
                            </div>

                            {/* Order Timeline */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold mb-3">Auftragsverlauf</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Auftrag erstellt</p>
                                            <p className="text-xs text-gray-500">{selectedOrder.createdDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Produktion abgeschlossen</p>
                                            <p className="text-xs text-gray-500">18.08.2025</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Kunde benachrichtigt</p>
                                            <p className="text-xs text-gray-500">18.08.2025</p>
                                        </div>
                                    </div>
                                    {selectedOrder.orderStatus === 'Abgeholt' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">Abgeholt</p>
                                                <p className="text-xs text-gray-500">{selectedOrder.pickupDate}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold mb-2">Notizen</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-600 italic">
                                        Kunde bevorzugt Abholung vormittags. Linker Schuh muss angepasst werden.
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="space-y-2 border-t pt-4">
                                {selectedOrder.orderStatus !== 'Abgeholt' && (
                                    <Button variant="outline" className="w-full gap-2 text-[#61A175] border-[#61A175] hover:bg-[#61A175]/10">
                                        <CheckCircle className="w-4 h-4" />
                                        Als abgeholt markieren
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full gap-2">
                                    <Bell className="w-4 h-4" />
                                    Erinnerung senden
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Payment Dialogs */}
            {selectedOrder && getPaymentData() && (
                <>
                    <PaymentMethodDialog
                        isOpen={isPaymentMethodOpen}
                        onClose={closeAllPaymentDialogs}
                        onSelectCash={handleCashSelected}
                        onSelectCard={handleCardSelected}
                        orderNumber={getPaymentData()!.orderNumber}
                        customerName={getPaymentData()!.customerName}
                        totalAmount={getPaymentData()!.totalAmount}
                        insuranceAmount={getPaymentData()!.insuranceAmount}
                        customerPayment={getPaymentData()!.customerPayment}
                    />
                    <PickupPaymentDialog
                        isOpen={isPickupPaymentOpen}
                        onClose={closeAllPaymentDialogs}
                        onSelectCash={handlePickupCashSelected}
                        onSelectCard={handlePickupCardSelected}
                        orderNumber={getPaymentData()!.orderNumber}
                        customerName={getPaymentData()!.customerName}
                        totalAmount={getPaymentData()!.totalAmount}
                        insuranceAmount={getPaymentData()!.insuranceAmount}
                        customerPayment={getPaymentData()!.customerPayment}
                    />
                    <CashPaymentDialog
                        isOpen={isCashPaymentOpen}
                        onClose={closeAllPaymentDialogs}
                        onBack={handleBackToPaymentMethod}
                        onComplete={handleCashPaymentComplete}
                        orderNumber={getPaymentData()!.orderNumber}
                        customerName={getPaymentData()!.customerName}
                        totalAmount={getPaymentData()!.totalAmount}
                        insuranceAmount={getPaymentData()!.insuranceAmount}
                        customerPayment={getPaymentData()!.customerPayment}
                        remainingAmount={getPaymentData()!.remainingAmount}
                    />
                    <CardPaymentDialog
                        isOpen={isCardPaymentOpen}
                        onClose={closeAllPaymentDialogs}
                        onBack={handleBackToPaymentMethod}
                        onComplete={handleCardPaymentComplete}
                        orderNumber={getPaymentData()!.orderNumber}
                        customerName={getPaymentData()!.customerName}
                        totalAmount={getPaymentData()!.totalAmount}
                        insuranceAmount={getPaymentData()!.insuranceAmount}
                        customerPayment={getPaymentData()!.customerPayment}
                    />
                    <CashPaymentSuccessDialog
                        isOpen={isCashSuccessOpen}
                        onClose={handlePaymentSuccess}
                        onProblem={handleCashProblem}
                        amount={getPaymentData()!.customerPayment}
                        receiptNumber="KB001002"
                    />
                    <ProblemFeedbackDialog
                        isOpen={isCashProblemOpen}
                        onClose={handlePaymentSuccess}
                        amount={getPaymentData()!.customerPayment}
                        receiptNumber="KB001002"
                    />
                    <CardPaymentSuccessDialog
                        isOpen={isCardSuccessOpen}
                        onClose={handlePaymentSuccess}
                        amount={getPaymentData()!.customerPayment}
                        receiptNumber="KB001002"
                    />
                </>
            )}
        </div>
    )
}
