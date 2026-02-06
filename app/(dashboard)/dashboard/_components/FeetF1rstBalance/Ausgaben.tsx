'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, Calendar } from 'lucide-react'

interface RevenueOrder {
    id: string
    orderNumber: string
    type: 'Maßschuhe' | 'Einlagen' | 'Sonstiges'
    createdDate: string
    completedDate: string
    customerName: string
    grossAmount: number
    vatAmount: number
    netAmount: number
    status: 'Bezahlt' | 'Offen' | 'Teilweise' | 'Storniert'
}

const mockRevenueOrders: RevenueOrder[] = [
    {
        id: '1',
        orderNumber: 'SN1001',
        type: 'Sonstiges',
        createdDate: '15.12.2025',
        completedDate: '15.12.2025',
        customerName: 'Eva Schneider',
        grossAmount: 45.00,
        vatAmount: 8.55,
        netAmount: 36.45,
        status: 'Bezahlt'
    },
    {
        id: '2',
        orderNumber: 'MS1002',
        type: 'Maßschuhe',
        createdDate: '10.12.2025',
        completedDate: '20.12.2025',
        customerName: 'Lisa Hoffmann',
        grossAmount: 1295.97,
        vatAmount: 246.23,
        netAmount: 1049.74,
        status: 'Bezahlt'
    },
    {
        id: '3',
        orderNumber: 'MS1003',
        type: 'Maßschuhe',
        createdDate: '10.12.2025',
        completedDate: '',
        customerName: 'Peter Braun',
        grossAmount: 979.97,
        vatAmount: 186.19,
        netAmount: 793.78,
        status: 'Storniert'
    },
    {
        id: '4',
        orderNumber: 'MS1001',
        type: 'Maßschuhe',
        createdDate: '12.08.2025',
        completedDate: '',
        customerName: 'Klaus Fischer',
        grossAmount: 850.00,
        vatAmount: 161.50,
        netAmount: 688.50,
        status: 'Offen'
    },
    {
        id: '5',
        orderNumber: 'EN1003',
        type: 'Einlagen',
        createdDate: '10.08.2025',
        completedDate: '15.08.2025',
        customerName: 'Maria Weber',
        grossAmount: 300.00,
        vatAmount: 57.00,
        netAmount: 243.00,
        status: 'Bezahlt'
    },
    {
        id: '6',
        orderNumber: 'EN1002',
        type: 'Einlagen',
        createdDate: '05.08.2025',
        completedDate: '',
        customerName: 'Thomas Schmidt',
        grossAmount: 150.00,
        vatAmount: 28.50,
        netAmount: 121.50,
        status: 'Teilweise'
    },
    {
        id: '7',
        orderNumber: 'EN1001',
        type: 'Einlagen',
        createdDate: '01.08.2025',
        completedDate: '',
        customerName: 'Anna Müller',
        grossAmount: 150.00,
        vatAmount: 28.50,
        netAmount: 121.50,
        status: 'Offen'
    }
]

export default function Ausgaben() {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'Maßschuhe' | 'Einlagen' | 'Sonstiges'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'Bezahlt' | 'Offen' | 'Teilweise' | 'Storniert'>('all')
    const [orders] = useState<RevenueOrder[]>(mockRevenueOrders)

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = typeFilter === 'all' || order.type === typeFilter
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        return matchesSearch && matchesType && matchesStatus
    })

    // Calculate totals
    const totals = filteredOrders.reduce(
        (acc, order) => ({
            gross: acc.gross + order.grossAmount,
            net: acc.net + order.netAmount
        }),
        { gross: 0, net: 0 }
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Bezahlt':
                return 'bg-green-100 text-green-800'
            case 'Offen':
                return 'bg-blue-100 text-blue-800'
            case 'Teilweise':
                return 'bg-yellow-100 text-yellow-800'
            case 'Storniert':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Maßschuhe':
                return 'bg-purple-100 text-purple-700'
            case 'Einlagen':
                return 'bg-blue-100 text-blue-700'
            case 'Sonstiges':
                return 'bg-gray-100 text-gray-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="pt-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Kassenmanagement</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Type Filters */}
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === 'all'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Alle Typen
                    </button>
                    <button
                        onClick={() => setTypeFilter('Maßschuhe')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === 'Maßschuhe'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Maßschuhe
                    </button>
                    <button
                        onClick={() => setTypeFilter('Einlagen')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === 'Einlagen'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Einlagen
                    </button>
                    <button
                        onClick={() => setTypeFilter('Sonstiges')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === 'Sonstiges'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Sonstiges
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    {/* Status Filters */}
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === 'all'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Alle Status
                    </button>
                    <button
                        onClick={() => setStatusFilter('Offen')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === 'Offen'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Offen
                    </button>
                    <button
                        onClick={() => setStatusFilter('Teilweise')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === 'Teilweise'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Teilweise
                    </button>
                    <button
                        onClick={() => setStatusFilter('Bezahlt')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === 'Bezahlt'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Bezahlt
                    </button>
                    <button
                        onClick={() => setStatusFilter('Storniert')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === 'Storniert'
                            ? 'bg-[#61A175] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Storniert
                    </button>
                </div>
            </div>

            {/* Search and Export */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Suchen nach Auftragsnummer, Kunde..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Zeitraum wählen
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Exportieren
                        </Button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Auftragsnr. ↕
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Typ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Erstellt ↕
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Abgeschlossen ↕
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kunde ↕
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brutto ↕
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    MwSt. ↕
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Netto ↕
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status ↕
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#61A175] font-medium">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(order.type)}`}>
                                            {order.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.createdDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.completedDate || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.grossAmount.toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.vatAmount.toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.netAmount.toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer with totals */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            {filteredOrders.length} Einträge
                        </span>
                        <div className="flex gap-6 text-sm font-medium">
                            <span className="text-gray-900">
                                Brutto: <span className="font-semibold">{totals.gross.toFixed(2)} €</span>
                            </span>
                            <span className="text-gray-900">
                                Netto: <span className="font-semibold">{totals.net.toFixed(2)} €</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
