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
import { Check, X } from 'lucide-react'

type Zahlung = 'Offen' | 'Bezahlt'

interface InvoiceRow {
  rechnungsnr: string
  lieferant: string
  datum: string
  betrag: string
  zahlung: Zahlung
  weVerknuepft: boolean
}

const DEMO_INVOICES: InvoiceRow[] = [
  { rechnungsnr: 'RE-48291', lieferant: 'Lederwelt GmbH', datum: '06.02.2026', betrag: '3.420 €', zahlung: 'Offen', weVerknuepft: true },
  { rechnungsnr: 'RE-48290', lieferant: 'SchaumTech', datum: '04.02.2026', betrag: '1.580 €', zahlung: 'Bezahlt', weVerknuepft: true },
  { rechnungsnr: 'RE-48289', lieferant: 'Orthopädie Müller', datum: '02.02.2026', betrag: '2.860 €', zahlung: 'Offen', weVerknuepft: false },
  { rechnungsnr: 'RE-48288', lieferant: 'KorkNatur', datum: '01.02.2026', betrag: '940 €', zahlung: 'Bezahlt', weVerknuepft: true },
  { rechnungsnr: 'RE-48285', lieferant: 'Renia Kleber', datum: '24.01.2026', betrag: '740 €', zahlung: 'Bezahlt', weVerknuepft: true },
]

function ZahlungBadge({ zahlung }: { zahlung: Zahlung }) {
  const styles: Record<Zahlung, string> = {
    Offen: 'bg-orange-100 text-orange-700 border-orange-200',
    Bezahlt: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return (
    <Badge variant="outline" className={`border ${styles[zahlung]} font-medium`}>
      {zahlung}
    </Badge>
  )
}

export default function RechnungenTable() {
  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Rechnungen
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Eingangsrechnungen & Zuordnung
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                <TableHead className="h-14 px-4 font-semibold text-gray-700">Rechnungsnr.</TableHead>
                <TableHead className="h-14 px-4 font-semibold text-gray-700">Lieferant</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Datum</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-right">Betrag</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">Zahlung</TableHead>
                <TableHead className="h-11 px-4 font-semibold text-gray-700 text-center">WE verknüpft</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_INVOICES.map((row) => (
                <TableRow
                  key={row.rechnungsnr}
                  className="border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50/50"
                >
                  <TableCell className="px-4 py-4 text-gray-900 font-medium">
                    {row.rechnungsnr}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700">
                    {row.lieferant}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-center">
                    {row.datum}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-900 text-right font-medium">
                    {row.betrag}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <ZahlungBadge zahlung={row.zahlung} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    {row.weVerknuepft ? (
                      <Check className="size-5 text-emerald-600 mx-auto" strokeWidth={2.5} />
                    ) : (
                      <X className="size-5 text-gray-400 mx-auto" strokeWidth={2} />
                    )}
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
