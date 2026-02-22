'use client'

import React from 'react'
import { TrendingUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TOP_KRANKENKASSEN = [
  { rang: 1, name: 'AOK Bayern', anzahl: 42, umsatz: 8420, anteil: 35, trend: 16 },
  { rang: 2, name: 'Techniker Krankenkasse', anzahl: 31, umsatz: 6240, anteil: 26, trend: 10 },
  { rang: 3, name: 'Barmer', anzahl: 24, umsatz: 4680, anteil: 19, trend: 12 },
  { rang: 4, name: 'IKK Classic', anzahl: 18, umsatz: 3120, anteil: 13, trend: 15 },
  { rang: 5, name: 'DAK Gesundheit', anzahl: 9, umsatz: 1920, anteil: 7, trend: 9 },
]

function formatUmsatz(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function KrankenkassenTable() {
  return (
    <Card className="rounded-xl border bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="border-b px-4 py-4 sm:px-5 sm:py-5">
          <h3 className="text-lg font-bold text-gray-900">
            Top 5 Krankenkassen nach Umsatz
          </h3>
        </div>
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-transparent [&>th]:py-4">
                <TableHead className="text-gray-600 font-medium">Rang</TableHead>
                <TableHead className="text-gray-600 font-medium">Krankenkasse</TableHead>
                <TableHead className="text-gray-600 font-medium">Anzahl</TableHead>
                <TableHead className="text-gray-600 font-medium">Umsatz</TableHead>
                <TableHead className="text-gray-600 font-medium">Anteil</TableHead>
                <TableHead className="text-gray-600 font-medium text-right w-0">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_KRANKENKASSEN.map((row) => (
                <TableRow
                  key={row.rang}
                  className="border-gray-100 hover:bg-gray-50/80 [&>td]:py-4"
                >
                  <TableCell className="align-middle">
                    <span
                      className={cn(
                        'inline-flex size-8 items-center justify-center rounded-full text-sm font-medium text-white',
                        'bg-[#61A175]'
                      )}
                    >
                      {row.rang}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {row.anzahl} Aufträge
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatUmsatz(row.umsatz)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="h-2 flex-1 min-w-0 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#61A175] transition-all"
                          style={{ width: `${row.anteil}%` }}
                        />
                      </div>
                      <span className="text-sm tabular-nums shrink-0 w-8">
                        {row.anteil}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-0">
                    <span className="inline-flex items-center justify-end gap-1 text-green-600 font-medium">
                      <TrendingUp className="size-4" />
                      +{row.trend}%
                    </span>
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
