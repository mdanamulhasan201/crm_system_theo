'use client'

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import BestelldetailsModal, {
    type BestelldetailsModalData,
} from './BestelldetailsModal'

export interface BestellubersichtRow {
    bestelldatum: string
    menge: string
    produkt: string
    hersteller: string
    status: string
    /** Used when opening Bestelldetails modal on Menge click */
    orderDetails?: BestelldetailsModalData
}

const defaultOrderDetails: BestelldetailsModalData = {
    orderName: 'Springer',
    sizeRange: '36-41',
    productName: 'Orthopädische Einlage Komfort',
    items: [
        { size: '36', quantity: 12 },
        { size: '37', quantity: 12 },
        { size: '38', quantity: 11 },
        { size: '39', quantity: 10 },
        { size: '40', quantity: 9 },
        { size: '41', quantity: 8 },
    ],
}

const defaultData: BestellubersichtRow[] = [
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
    { bestelldatum: '14.11.2025 13:50', menge: '35', produkt: 'Orthopädische Einlage Komfort', hersteller: 'Orthotech', status: 'Ausstehend', orderDetails: defaultOrderDetails },
]

interface BestellubersichtTableProps {
    data?: BestellubersichtRow[]
}

export default function BestellubersichtTable({ data = defaultData }: BestellubersichtTableProps) {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<BestelldetailsModalData | null>(null)

    const openDetails = (row: BestellubersichtRow) => {
        if (row.orderDetails) {
            setModalData(row.orderDetails)
            setModalOpen(true)
        } else {
            setModalData({
                orderName: 'Bestellung',
                sizeRange: '-',
                productName: row.produkt,
                items: [],
            })
            setModalOpen(true)
        }
    }

    return (
        <>
            <div className="rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden h-full flex flex-col min-h-0 w-full min-w-0">
                <div className="p-4 sm:p-5 md:p-6 flex-1 min-h-0 flex flex-col min-w-0">
                    <div className="mt-4 sm:mt-6 flex-1 min-h-0 overflow-auto min-w-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-gray-200 bg-white hover:bg-white">
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm">Bestelldatum</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm">Menge</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm">Produkt</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm">Hersteller</TableHead>
                                    <TableHead className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 text-xs sm:text-sm">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow
                                        key={i}
                                        className="border-b border-gray-100 bg-white last:border-b-0 hover:bg-gray-50/50"
                                    >
                                        <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-normal text-gray-700 whitespace-nowrap">
                                            {row.bestelldatum}
                                        </TableCell>
                                        <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                                            <button
                                                type="button"
                                                onClick={() => openDetails(row)}
                                                className="text-xs sm:text-sm font-medium text-[#61A178] hover:underline cursor-pointer"
                                            >
                                                {row.menge}
                                            </button>
                                        </TableCell>
                                        <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-normal text-gray-700">
                                            {row.produkt}
                                        </TableCell>
                                        <TableCell className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-normal text-gray-700">
                                            {row.hersteller}
                                        </TableCell>
                                        <TableCell className="px-3 sm:px-4 py-2 sm:py-3">
                                            <span className="inline-flex items-center rounded-full bg-[#E8F5E9] px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-[#2E7D32]">
                                                {row.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <BestelldetailsModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                data={modalData}
                onAddToLager={() => {
                    // TODO: wire to add-to-lager API
                }}
            />
        </>
    )
}
