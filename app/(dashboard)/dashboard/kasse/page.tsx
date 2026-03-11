'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Search, Download, AlertTriangle, Check, CheckCircle, Bell, Loader2, XCircle, Printer, Mail, Plus } from 'lucide-react'
import { FiPackage, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi'
import PaymentMethodDialog from '../_components/Kasse/PaymentMethodDialog'
import PickupPaymentDialog from '../_components/Kasse/PickupPaymentDialog'
import CashPaymentDialog from '../_components/Kasse/CashPaymentDialog'
import CardPaymentDialog from '../_components/Kasse/CardPaymentDialog'
import CardPaymentSuccessDialog from '../_components/Kasse/CardPaymentSuccessDialog'
import CashPaymentSuccessDialog from '../_components/Kasse/CashPaymentSuccessDialog'
import ProblemFeedbackDialog from '../_components/Kasse/ProblemFeedbackDialog'
import SchnellauftragDialog from '../_components/Kasse/SchnellauftragDialog'
import { getAllPickups, getPickupDetails, getReceiptByOrder, cancelReceipt, listReceipts, emailReceipt } from '@/apis/pickupsApis'
import type { PickupOrder, PickupOrderDetail, PickupProductType, PosReceipt } from '@/apis/pickupsApis'
import { generateReceiptHTML, generateReceiptPDF } from '@/utils/receiptUtils'
import toast from 'react-hot-toast'

type ActiveTab = 'all' | 'einlagen' | 'massschuhe' | 'belege'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatEuro = (amount: number) =>
    `${amount.toFixed(2).replace('.', ',')} €`

const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

const getProductTypeLabel = (type: string) => {
    switch (type) {
        case 'shoes': return 'Maßschuhe'
        case 'insole': return 'Einlagen'
        default: return type
    }
}

/** Maps the API `bezahlt` field to one of the three UI payment-status labels. */
const getPaymentStatusLabel = (bezahlt: string): 'Bezahlt' | 'Offen' | 'Teilweise' => {
    if (bezahlt === 'Bezahlt') return 'Bezahlt'
    if (bezahlt.toLowerCase().includes('teilweise')) return 'Teilweise'
    return 'Offen'
}

/** Maps the active tab to the productType query param required by the backend. */
const tabToProductType = (tab: ActiveTab): PickupProductType => {
    switch (tab) {
        case 'massschuhe': return 'shoes'
        case 'einlagen': return 'insole'
        default: return 'all'
    }
}

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

// ─── Component ───────────────────────────────────────────────────────────────

export default function KassePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<ActiveTab>('all')

    // Orders list state
    const [orders, setOrders] = useState<PickupOrder[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Selected order + detail state
    const [selectedListOrder, setSelectedListOrder] = useState<PickupOrder | null>(null)
    const [orderDetail, setOrderDetail] = useState<PickupOrderDetail | null>(null)
    const [isDetailLoading, setIsDetailLoading] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // Payment dialog states
    const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false)
    const [isPickupPaymentOpen, setIsPickupPaymentOpen] = useState(false)
    const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false)
    const [isCardPaymentOpen, setIsCardPaymentOpen] = useState(false)
    const [isCashSuccessOpen, setIsCashSuccessOpen] = useState(false)
    const [isCardSuccessOpen, setIsCardSuccessOpen] = useState(false)
    const [isCashProblemOpen, setIsCashProblemOpen] = useState(false)
    const [refreshCount, setRefreshCount] = useState(0)

    // Snapshotted when payment flow starts — stable through dialog transitions
    const [paymentOrderId, setPaymentOrderId] = useState('')
    const [paymentOrderType, setPaymentOrderType] = useState<'insole' | 'shoes'>('shoes')
    const [paymentIsPickup, setPaymentIsPickup] = useState(true)
    const [currentReceipt, setCurrentReceipt] = useState<PosReceipt | null>(null)

    // Receipt shown in the order detail sheet (fetched alongside order details)
    const [sheetReceipt, setSheetReceipt] = useState<PosReceipt | null>(null)
    const [isStorniertProcessing, setIsStorniertProcessing] = useState(false)

    // Belege tab state
    const [receipts, setReceipts] = useState<PosReceipt[]>([])
    const [isReceiptsLoading, setIsReceiptsLoading] = useState(false)

    // Schnellauftrag dialog
    const [isSchnellauftragOpen, setIsSchnellauftragOpen] = useState(false)

    // ── Fetch orders list ────────────────────────────────────────────────────

    useEffect(() => {
        if (activeTab === 'belege') return
        let cancelled = false
        const productType = tabToProductType(activeTab)

        setIsLoading(true)
        getAllPickups(productType)
            .then((res) => { if (!cancelled) setOrders(res.data) })
            .catch((err) => console.error('Failed to fetch pickup orders:', err))
            .finally(() => { if (!cancelled) setIsLoading(false) })

        return () => { cancelled = true }
    }, [activeTab, refreshCount])

    // ── Fetch receipts list (Belege tab) ─────────────────────────────────────

    useEffect(() => {
        if (activeTab !== 'belege') return
        let cancelled = false

        setIsReceiptsLoading(true)
        listReceipts()
            .then((res) => { if (!cancelled) setReceipts(res.data) })
            .catch((err) => console.error('Failed to fetch receipts:', err))
            .finally(() => { if (!cancelled) setIsReceiptsLoading(false) })

        return () => { cancelled = true }
    }, [activeTab, refreshCount])

    // ── Row click → fetch detail ─────────────────────────────────────────────

    const handleRowClick = async (order: PickupOrder) => {
        setSelectedListOrder(order)
        setOrderDetail(null)
        setSheetReceipt(null)
        setIsSheetOpen(true)
        setIsDetailLoading(true)
        try {
            const [detailRes, receiptRes] = await Promise.allSettled([
                getPickupDetails(order.id, order.type),
                getReceiptByOrder(order.id, order.type as 'insole' | 'shoes'),
            ])
            if (detailRes.status === 'fulfilled') setOrderDetail(detailRes.value.data)
            if (receiptRes.status === 'fulfilled') setSheetReceipt(receiptRes.value.data)
        } catch (err) {
            console.error('Failed to fetch order details:', err)
        } finally {
            setIsDetailLoading(false)
        }
    }

    const handleStornierung = async () => {
        if (!sheetReceipt) return
        const confirmed = window.confirm(
            `Beleg ${sheetReceipt.id.slice(0, 8)}… wirklich stornieren?\n\nDiese Aktion kann nicht rückgängig gemacht werden. Der Beleg wird bei der Agenzia delle Entrate als storniert gemeldet.`
        )
        if (!confirmed) return

        setIsStorniertProcessing(true)
        try {
            const res = await cancelReceipt(sheetReceipt.id)
            setSheetReceipt(res.data)
            toast.success('Beleg erfolgreich storniert')
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Stornierung fehlgeschlagen'
            toast.error(msg)
        } finally {
            setIsStorniertProcessing(false)
        }
    }

    // ── Belege (receipts) helpers ─────────────────────────────────────────────

    const filteredReceipts = receipts.filter(r => {
        if (!searchQuery) return true
        const order = r.receiptData?.transaction?.order ?? ''
        const customer = r.receiptData?.transaction?.customer ?? ''
        const q = searchQuery.toLowerCase()
        return order.toLowerCase().includes(q) || customer.toLowerCase().includes(q)
    })

    const handleReceiptPrint = (receipt: PosReceipt) => {
        const html = generateReceiptHTML(receipt)
        const win = window.open('', '_blank', 'width=350,height=600')
        if (win) {
            win.document.write(html)
            win.document.close()
            win.onload = () => win.print()
        }
    }

    const handleReceiptPDF = (receipt: PosReceipt) => {
        const blob = generateReceiptPDF(receipt)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Kassenbon-${receipt.receiptData?.transaction?.order ?? receipt.id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleReceiptEmail = async (receipt: PosReceipt) => {
        const email = prompt('E-Mail-Adresse eingeben:')
        if (!email) return
        try {
            await emailReceipt(receipt.id, email)
            toast.success('Beleg per E-Mail gesendet')
        } catch {
            toast.error('E-Mail konnte nicht gesendet werden')
        }
    }

    const handleReceiptStornierung = async (receipt: PosReceipt) => {
        if (!receipt.fiskalyRecordId || receipt.storniert) return
        const confirmed = window.confirm(
            `Beleg ${receipt.receiptData?.transaction?.order ?? receipt.id.slice(0, 8)} wirklich stornieren?\n\nDiese Aktion kann nicht rückgängig gemacht werden. Der Beleg wird bei der Agenzia delle Entrate als storniert gemeldet.`
        )
        if (!confirmed) return
        try {
            const res = await cancelReceipt(receipt.id)
            setReceipts(prev => prev.map(r => r.id === receipt.id ? res.data : r))
            toast.success('Beleg erfolgreich storniert')
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Stornierung fehlgeschlagen'
            toast.error(msg)
        }
    }

    // ── Stats derived from orders list ───────────────────────────────────────

    const stats = {
        readyForPickup: orders.filter(o => o.orderStatus === 'Abholbereit').length,
        pickupsToday: orders.filter(o => {
            const d = new Date(o.fertigstellungBis)
            const today = new Date()
            return d.toDateString() === today.toDateString()
        }).length,
        openPayments: orders.filter(o => getPaymentStatusLabel(o.bezahlt) === 'Offen').length,
        paymentsToday: orders.filter(o => {
            const d = new Date(o.fertigstellungBis)
            const today = new Date()
            return d.toDateString() === today.toDateString() && getPaymentStatusLabel(o.bezahlt) === 'Bezahlt'
        }).length,
        additionalOpen: orders.filter(o => o.orderStatus === 'Benachrichtigt').length,
    }

    // ── Search filter (client-side on fetched data) ──────────────────────────

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true
        const customerName = `${order.customer?.vorname ?? ''} ${order.customer?.nachname ?? ''}`.trim()
        const orderNumber = `#${order.orderNumber}`
        const q = searchQuery.toLowerCase()
        return customerName.toLowerCase().includes(q) || orderNumber.toLowerCase().includes(q)
    })

    // ── Status helpers ───────────────────────────────────────────────────────

    const getPaymentStatusColor = (label: string) => {
        switch (label) {
            case 'Bezahlt': return 'text-green-600 bg-green-50 border-green-200'
            case 'Offen': return 'text-orange-500 bg-orange-50 border-orange-200'
            case 'Teilweise': return 'text-blue-600 bg-blue-50 border-blue-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'Abgeholt': return 'text-gray-600 bg-gray-50 border-gray-200'
            case 'Benachrichtigt': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'Abholbereit':
            case 'Bereit': return 'text-green-600 bg-green-50 border-green-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    // ── Payment dialog helpers ───────────────────────────────────────────────

    const getPaymentData = () => {
        if (!orderDetail) return null
        return {
            orderNumber: `#${orderDetail.orderNumber}`,
            customerName: orderDetail.customerName,
            totalAmount: formatEuro(orderDetail.payment.total),
            insuranceAmount: formatEuro(orderDetail.payment.insurance),
            customerPayment: formatEuro(orderDetail.payment.coPayment),
            remainingAmount: orderDetail.payment.remaining,
        }
    }

    const handlePaymentClick = () => {
        if (orderDetail) {
            setPaymentOrderId(orderDetail.orderId)
            setPaymentOrderType(orderDetail.type as 'insole' | 'shoes')
            setPaymentIsPickup(orderDetail.canMarkAsPickedUp)
        }
        setCurrentReceipt(null)
        setIsSheetOpen(false)
        setIsPaymentMethodOpen(true)
    }

    const handleCashSelected = () => {
        setIsPaymentMethodOpen(false)
        setTimeout(() => setIsCashPaymentOpen(true), 100)
    }

    const handleCardSelected = () => {
        setIsPaymentMethodOpen(false)
        setTimeout(() => setIsPickupPaymentOpen(true), 100)
    }

    const handlePickupCashSelected = () => {
        setIsPickupPaymentOpen(false)
        setTimeout(() => setIsCashPaymentOpen(true), 100)
    }

    const handlePickupCardSelected = () => {
        setIsPickupPaymentOpen(false)
        setTimeout(() => setIsCardPaymentOpen(true), 100)
    }

    const handleBackToPaymentMethod = () => {
        setIsCashPaymentOpen(false)
        setIsCardPaymentOpen(false)
        setTimeout(() => setIsPickupPaymentOpen(true), 100)
    }

    const handleCashPaymentComplete = (receipt: PosReceipt | null) => {
        setCurrentReceipt(receipt)
        setIsCashPaymentOpen(false)
        setTimeout(() => setIsCashSuccessOpen(true), 100)
    }

    const handleCardPaymentComplete = (receipt: PosReceipt | null) => {
        setCurrentReceipt(receipt)
        setIsCardPaymentOpen(false)
        setTimeout(() => setIsCardSuccessOpen(true), 100)
    }

    const handlePaymentSuccess = () => {
        closeAllPaymentDialogs()
        setIsSheetOpen(false)
        setRefreshCount((c) => c + 1)
    }

    const handleCashProblem = () => {
        setIsCashSuccessOpen(false)
        setTimeout(() => setIsCashProblemOpen(true), 100)
    }

    const handleCardProblem = () => {
        setIsCardSuccessOpen(false)
        setTimeout(() => setIsCashProblemOpen(true), 100)
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

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kasse - Abholungen & Zahlungen</h1>
                    <p className="text-sm text-gray-600 mt-1">Kundenabholungen verwalten und Zahlungen abwickeln</p>
                </div>
                <Button
                    className="gap-2 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold shadow-sm"
                    onClick={() => setIsSchnellauftragOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    Schnellauftrag
                </Button>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2m4 0h2m4 0h2m4 0h2M3 20h2m4 0h2m4 0h2m4 0h2M3 12h2m4 0h2m4 0h2m4 0h2" />
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
                <div className="flex justify-center w-1/2">
                    <p className="text-xs text-gray-500 mt-2 text-center">Scanbereit • Enter drücken für manuelle Suche</p>
                </div>
            </div>

            {/* Tabs + Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                    {(['all', 'einlagen', 'massschuhe', 'belege'] as ActiveTab[]).map((tab) => {
                        const labels: Record<ActiveTab, string> = {
                            all: 'Alle Aufträge',
                            einlagen: 'Einlagen',
                            massschuhe: 'Maßschuhe',
                            belege: 'Belege',
                        }
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'text-[#61A175] border-b-2 border-[#61A175]'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {labels[tab]}
                            </button>
                        )
                    })}
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'belege' ? (
                        isReceiptsLoading ? (
                            <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Belege werden geladen…</span>
                            </div>
                        ) : filteredReceipts.length === 0 ? (
                            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                                Keine Belege gefunden
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auftrag</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunde</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produkt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReceipts.map((receipt) => {
                                        const d = receipt.receiptData
                                        return (
                                            <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(receipt.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {d?.transaction?.order ?? '–'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-[#61A175] rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">
                                                            {(d?.transaction?.customer ?? '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-gray-900">{d?.transaction?.customer ?? '–'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-45 truncate">
                                                    {d?.product?.description ?? '–'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {fmt(receipt.amount)} €
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {receipt.storniert ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-red-200 bg-red-50 text-red-700">
                                                            <XCircle className="w-3 h-3" /> Storniert
                                                        </span>
                                                    ) : receipt.fiskalyRecordId ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-700">
                                                            Fiskaliert
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600">
                                                            Beleg
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleReceiptPrint(receipt)}
                                                            title="Drucken"
                                                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReceiptPDF(receipt)}
                                                            title="PDF herunterladen"
                                                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReceiptEmail(receipt)}
                                                            title="Per E-Mail senden"
                                                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                        {receipt.fiskalyRecordId && !receipt.storniert && (
                                                            <button
                                                                onClick={() => handleReceiptStornierung(receipt)}
                                                                title="Beleg stornieren"
                                                                className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-700 transition-colors"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )
                    ) : isLoading ? (
                        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Aufträge werden geladen…</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                            Keine Aufträge gefunden
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunde</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abholtermin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zahlung</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => {
                                    const customerName = `${order.customer?.vorname ?? ''} ${order.customer?.nachname ?? ''}`.trim() || 'Unbekannt'
                                    const paymentLabel = getPaymentStatusLabel(order.bezahlt)
                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => handleRowClick(order)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-[#61A175] rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                                                        {customerName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{customerName}</div>
                                                        <div className="text-xs text-gray-500">{getProductTypeLabel(order.type)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(order.fertigstellungBis)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(paymentLabel)}`}>
                                                    {paymentLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
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
                <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                    Keine kürzlichen Abholungen
                </div>
            </div>

            {/* Order Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-100 sm:w-135 overflow-y-auto">
                    {isDetailLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Details werden geladen…</span>
                        </div>
                    ) : orderDetail ? (
                        <>
                            <SheetHeader className="border-b pb-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Auftrag #{orderDetail.orderNumber}</p>
                                        <SheetTitle className="text-xl font-bold">{orderDetail.customerName}</SheetTitle>
                                    </div>
                                </div>
                            </SheetHeader>

                            {/* Product Info */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-1">Produkt</p>
                                <p className="text-base font-semibold text-gray-900">{orderDetail.product.name}</p>
                                {orderDetail.product.description && (
                                    <p className="text-sm text-gray-500 mt-1">{orderDetail.product.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Abholdatum</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(orderDetail.pickupDate)}</p>
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
                                    <span className="text-sm font-medium">{orderDetail.paymentType}</span>
                                </div>
                            </div>

                            {/* Payment Warning */}
                            {orderDetail.paymentOutstanding && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900">Zahlung ausstehend</p>
                                        <p className="text-xs text-yellow-700 mt-1">{orderDetail.paymentOutstandingMessage}</p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Breakdown */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold mb-3">Zahlung</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Gesamtbetrag</span>
                                        <span className="text-sm font-medium text-gray-900">{formatEuro(orderDetail.payment.total)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            </div>
                                            <span className="text-sm text-gray-600">Krankenkasse</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{formatEuro(orderDetail.payment.insurance)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Zuzahlung Kunde</span>
                                        <span className="text-sm font-medium text-gray-900">{formatEuro(orderDetail.payment.coPayment)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Bereits bezahlt</span>
                                        <span className="text-sm font-medium text-gray-900">{formatEuro(orderDetail.payment.paid)}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-base font-semibold text-gray-900">Restbetrag</span>
                                        <span className={`text-xl font-bold ${orderDetail.payment.remaining > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                            {formatEuro(orderDetail.payment.remaining)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(orderDetail.orderStatus)}`}>
                                        {orderDetail.orderStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 mb-6">
                                {orderDetail.canPay && (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={handlePaymentClick}
                                    >
                                        <FiDollarSign className="w-4 h-4" />
                                        Bezahlen
                                    </Button>
                                )}
                                {orderDetail.canMarkAsPickedUp && (
                                    <Button
                                        className="w-full gap-2 bg-[#61A175] hover:bg-[#4f8a61]"
                                        onClick={handlePaymentClick}
                                    >
                                        <FiPackage className="w-4 h-4" />
                                        Abholen & Bezahlen
                                    </Button>
                                )}
                                {/* Stornierung — only shown when a fiscal receipt exists and is not yet cancelled */}
                                {sheetReceipt?.fiskalyRecordId && (
                                    <div className={`rounded-lg border p-3 ${sheetReceipt.storniert ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                                        {sheetReceipt.storniert ? (
                                            <div className="flex items-center gap-2 text-red-700">
                                                <XCircle className="w-4 h-4 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold">Beleg storniert</p>
                                                    {sheetReceipt.storniertAt && (
                                                        <p className="text-xs">
                                                            {new Date(sheetReceipt.storniertAt).toLocaleString('de-DE')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs text-orange-800 mb-2">
                                                    Rückgabe / Produkt zurückgeben? Fiskalbeleg stornieren:
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-50"
                                                    onClick={handleStornierung}
                                                    disabled={isStorniertProcessing}
                                                >
                                                    {isStorniertProcessing ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    Stornierung
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Order Timeline */}
                            {orderDetail.timeline.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold mb-3">Auftragsverlauf</h3>
                                    <div className="space-y-0">
                                        {orderDetail.timeline.map((entry, index) => {
                                            const isLast = index === orderDetail.timeline.length - 1
                                            return (
                                                <div key={index} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-3 h-3 rounded-full bg-[#61A175] shrink-0 mt-1" />
                                                        {!isLast && <div className="w-0.5 flex-1 bg-green-300" />}
                                                    </div>
                                                    <div className={`flex-1 ${isLast ? '' : 'pb-3'}`}>
                                                        <p className="text-sm font-medium text-gray-900">{entry.statusTo}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(entry.changedAt)}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {orderDetail.notes && (
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold mb-2">Notizen</h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-600">{orderDetail.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Actions */}
                            <div className="space-y-2 border-t pt-4">
                                {orderDetail.canMarkAsPickedUp && (
                                    <Button variant="outline" className="w-full gap-2 text-[#61A175] border-[#61A175] hover:bg-[#61A175]/10">
                                        <CheckCircle className="w-4 h-4" />
                                        Als abgeholt markieren
                                    </Button>
                                )}
                                {orderDetail.canSendReminder && (
                                    <Button variant="outline" className="w-full gap-2">
                                        <Bell className="w-4 h-4" />
                                        Erinnerung senden
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : selectedListOrder && !isDetailLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Details konnten nicht geladen werden
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            {/* Payment Dialogs */}
            {orderDetail && getPaymentData() && (
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
                        orderId={paymentOrderId}
                        orderType={paymentOrderType}
                        isPickup={paymentIsPickup}
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
                        orderId={paymentOrderId}
                        orderType={paymentOrderType}
                        isPickup={paymentIsPickup}
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
                        receiptNumber={`#${orderDetail.orderNumber}`}
                        orderId={paymentOrderId}
                        orderType={paymentOrderType}
                        receipt={currentReceipt}
                    />
                    <ProblemFeedbackDialog
                        isOpen={isCashProblemOpen}
                        onClose={handlePaymentSuccess}
                        amount={getPaymentData()!.customerPayment}
                        receiptNumber={`#${orderDetail.orderNumber}`}
                        orderId={paymentOrderId}
                        orderType={paymentOrderType}
                        receipt={currentReceipt}
                    />
                    <CardPaymentSuccessDialog
                        isOpen={isCardSuccessOpen}
                        onClose={handlePaymentSuccess}
                        onProblem={handleCardProblem}
                        amount={getPaymentData()!.customerPayment}
                        receiptNumber={`#${orderDetail.orderNumber}`}
                        orderId={paymentOrderId}
                        orderType={paymentOrderType}
                        receipt={currentReceipt}
                    />
                </>
            )}

            {/* Schnellauftrag POS dialog */}
            <SchnellauftragDialog
                isOpen={isSchnellauftragOpen}
                onClose={() => setIsSchnellauftragOpen(false)}
            />
        </div>
    )
}
