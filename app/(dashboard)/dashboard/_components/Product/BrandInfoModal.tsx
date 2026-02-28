'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getSingleManufacturer } from '@/apis/storeManagement'

export interface GroessenMengenItem {
    length?: number
    quantity: number
}

interface BrandInfoModalProps {
    isOpen: boolean
    onClose: () => void
    manufacturerId: string | null
    /** Called when Okay is clicked with groessenMengen so parent can fill Länge & Mindestmenge */
    onOkay?: (groessenMengen: Record<string, GroessenMengenItem>) => void
}

export default function BrandInfoModal({ isOpen, onClose, manufacturerId, onOkay }: BrandInfoModalProps) {
    const [brandName, setBrandName] = useState<string>('')
    const [groessenMengen, setGroessenMengen] = useState<Record<string, GroessenMengenItem>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen || !manufacturerId) {
            setBrandName('')
            setGroessenMengen({})
            setError(null)
            return
        }
        const fetchBrand = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getSingleManufacturer(manufacturerId)
                if (res?.success && res?.data) {
                    setBrandName(res.data.brand ?? '')
                    setGroessenMengen(res.data.groessenMengen ?? {})
                } else {
                    setError('Daten konnten nicht geladen werden.')
                }
            } catch {
                setError('Fehler beim Laden der Markeninformationen.')
            } finally {
                setLoading(false)
            }
        }
        fetchBrand()
    }, [isOpen, manufacturerId])

    const sizeKeys = Object.keys(groessenMengen).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '') || '0', 10)
        const numB = parseInt(b.replace(/\D/g, '') || '0', 10)
        return numA - numB
    })

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Markeninformationen: {loading ? '...' : brandName || '–'}
                    </DialogTitle>
                </DialogHeader>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                {loading ? (
                    <div className="py-8 text-center text-gray-500">Laden...</div>
                ) : (
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Größen & Mengen</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-medium">Größe</TableHead>
                                        <TableHead className="font-medium">Menge</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sizeKeys.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-gray-500 py-6">
                                                Keine Größen vorhanden.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sizeKeys.map((size) => {
                                            const row = groessenMengen[size]
                                            return (
                                                <TableRow key={size}>
                                                    <TableCell className="font-medium">{size}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            readOnly
                                                            value={row?.quantity ?? ''}
                                                            className="h-9 bg-gray-50"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
                {!loading && !error && sizeKeys.length > 0 && (
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            type="button"
                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                            onClick={() => {
                                onOkay?.(groessenMengen)
                                onClose()
                            }}
                        >
                            Okay
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
