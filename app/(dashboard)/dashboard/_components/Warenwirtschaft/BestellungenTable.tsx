'use client'

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

type Status = 'Bestellt' | 'Geliefert' | 'Teilweise'
type Zahlung = 'Offen' | 'Bezahlt'

interface OrderRow {
    bestellnr: string
    lieferant: string
    datum: string
    betrag: string
    status: Status
    zahlung: Zahlung
    zahlungsdatum: string
}

const DEMO_ORDERS: OrderRow[] = [
    { bestellnr: 'B-2026-042', lieferant: 'Orthopädie Müller', datum: '07.02.2026', betrag: '2.860 €', status: 'Bestellt', zahlung: 'Offen', zahlungsdatum: '–' },
    { bestellnr: 'B-2026-041', lieferant: 'Lederwelt GmbH', datum: '05.02.2026', betrag: '3.420 €', status: 'Geliefert', zahlung: 'Offen', zahlungsdatum: '–' },
    { bestellnr: 'B-2026-040', lieferant: 'SchaumTech', datum: '03.02.2026', betrag: '1.580 €', status: 'Teilweise', zahlung: 'Offen', zahlungsdatum: '–' },
    { bestellnr: 'B-2026-039', lieferant: 'KorkNatur', datum: '01.02.2026', betrag: '940 €', status: 'Bestellt', zahlung: 'Offen', zahlungsdatum: '–' },
    { bestellnr: 'B-2026-035', lieferant: 'Renia Kleber', datum: '22.01.2026', betrag: '740 €', status: 'Geliefert', zahlung: 'Bezahlt', zahlungsdatum: '25.01.2026' },
    { bestellnr: 'B-2026-032', lieferant: 'SohlenDirekt', datum: '18.01.2026', betrag: '1.920 €', status: 'Geliefert', zahlung: 'Bezahlt', zahlungsdatum: '20.01.2026' },
]

function StatusBadge({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Bestellt: 'bg-blue-100 text-blue-700 border-blue-200',
        Geliefert: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Teilweise: 'bg-amber-100 text-amber-700 border-amber-200',
    }
    return (
        <Badge variant="outline" className={`border ${styles[status]} font-medium`}>
            {status}
        </Badge>
    )
}

function ZahlungBadge({ zahlung }: { zahlung: Zahlung }) {
    const styles: Record<Zahlung, string> = {
        Offen: 'bg-amber-100 text-amber-700 border-amber-200',
        Bezahlt: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return (
        <Badge variant="outline" className={`border ${styles[zahlung]} font-medium`}>
            {zahlung}
        </Badge>
    )
}

export default function BestellungenTable() {
    return (
        <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <CardHeader className="">
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Bestellungen
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                    Aktuelle und vergangene Bestellungen
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 ">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                                <TableHead className="h-14 px-4 font-semibold text-gray-700">Bestellnr.</TableHead>
                                <TableHead className="h-14 px-4 font-semibold text-gray-700">Lieferant</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Datum</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-right">Betrag</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Status</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Zahlung</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Zahlungsdatum</TableHead>
                                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {DEMO_ORDERS.map((order) => (
                                <TableRow
                                    key={order.bestellnr}
                                    className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50/50"
                                >
                                    <TableCell className="px-4 py-4 text-gray-900 font-medium">
                                        {order.bestellnr}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-700">
                                        {order.lieferant}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-700 text-center">
                                        {order.datum}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-900 text-right font-medium">
                                        {order.betrag}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center">
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-center">
                                        <ZahlungBadge zahlung={order.zahlung} />
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-gray-700 text-center">
                                        {order.zahlungsdatum}
                                    </TableCell>
                                    <TableCell className="px-4 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-transparent font-medium"
                                        >
                                            <ArrowRight className="size-4 mr-1 inline" />
                                            WE starten
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
