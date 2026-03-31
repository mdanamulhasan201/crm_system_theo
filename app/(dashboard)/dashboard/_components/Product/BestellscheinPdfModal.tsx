'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import {
    buildEditableReorderRowsFromApiProduct,
    ReorderRow,
} from '@/lib/bestellscheinPdf'

type BestellscheinApiProduct = {
    produktname?: string | null
    artikelnummer?: string | null
    hersteller?: string | null
    image?: string | null
    groessenMengen?: Record<string, unknown> | null
    mindestbestand?: number | null
}

interface BestellscheinPdfModalProps {
    isOpen: boolean
    onClose: () => void
    product: BestellscheinApiProduct | null
    isPreparing?: boolean
    isSubmitting?: boolean
    onSubmit: (rows: ReorderRow[]) => Promise<void> | void
}

export default function BestellscheinPdfModal({
    isOpen,
    onClose,
    product,
    isPreparing = false,
    isSubmitting = false,
    onSubmit,
}: BestellscheinPdfModalProps) {
    const initialRows = useMemo(
        () => (product ? buildEditableReorderRowsFromApiProduct(product) : []),
        [product]
    )
    const [rows, setRows] = useState<ReorderRow[]>([])

    useEffect(() => {
        if (!isOpen) return
        setRows(initialRows)
    }, [isOpen, initialRows])

    const handleQtyChange = (index: number, value: string) => {
        const parsed = parseInt(value, 10)
        const safeValue = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
        setRows((prev) =>
            prev.map((row, i) =>
                i === index
                    ? {
                          ...row,
                          recommendedOrder: safeValue,
                      }
                    : row
            )
        )
    }

    const totalOrderQty = rows.reduce((sum, row) => sum + (row.recommendedOrder || 0), 0)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bestellschein bearbeiten</DialogTitle>
                    <DialogDescription>
                        Mengen anpassen und danach als PDF herunterladen.
                    </DialogDescription>
                </DialogHeader>

                {isPreparing ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : !product ? (
                    <p className="text-sm text-red-500 py-8">Produktdaten konnten nicht geladen werden.</p>
                ) : (
                    <div className="space-y-5 py-2">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.produktname || 'Produkt'}
                                    width={72}
                                    height={72}
                                    className="h-[72px] w-[72px] rounded border object-contain bg-white"
                                />
                            ) : (
                                <div className="h-[72px] w-[72px] rounded border bg-white" />
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                    {product.produktname || '-'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Artikelnummer: {product.artikelnummer || '-'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Hersteller: {product.hersteller || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-100 text-xs font-semibold text-gray-700 uppercase">
                                <div className="col-span-4 px-3 py-2">Größe</div>
                                <div className="col-span-4 px-3 py-2 text-center">Aktueller Bestand</div>
                                <div className="col-span-4 px-3 py-2 text-center">Bestellmenge</div>
                            </div>
                            <div className="max-h-[380px] overflow-y-auto">
                                {rows.length === 0 ? (
                                    <div className="px-3 py-6 text-sm text-gray-500">Keine Größen verfügbar.</div>
                                ) : (
                                    rows.map((row, index) => (
                                        <div
                                            key={row.sizeLabel}
                                            className="grid grid-cols-12 items-center border-t"
                                        >
                                            <div className="col-span-4 px-3 py-2 text-sm text-gray-900">
                                                {row.sizeLabel}
                                            </div>
                                            <div className="col-span-4 px-3 py-2 text-sm text-center text-gray-700">
                                                {row.currentStock}
                                            </div>
                                            <div className="col-span-4 px-3 py-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={row.recommendedOrder}
                                                    onChange={(e) => handleQtyChange(index, e.target.value)}
                                                    className="h-9 text-center"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-gray-50 px-4 py-3">
                            <p className="text-sm text-gray-600">Gesamte Bestellmenge</p>
                            <p className="text-xl font-bold text-[#1a2b4b]">{totalOrderQty}</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button
                        onClick={() => onSubmit(rows)}
                        disabled={isPreparing || isSubmitting || !product}
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white"
                    >
                        {isSubmitting ? 'PDF wird erstellt...' : 'PDF herunterladen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
