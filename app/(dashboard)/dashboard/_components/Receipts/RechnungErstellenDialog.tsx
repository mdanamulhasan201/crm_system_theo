'use client'

import React, { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface LineItem {
    id: string
    beschreibung: string
    menge: number
    einzelpreis: number
    mwst: string
}

interface RechnungErstellenDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
    onErstellen: (data: { lineItems: LineItem[], totals: any }) => void
}

export default function RechnungErstellenDialog({
    open,
    onOpenChange,
    customerData,
    onErstellen
}: RechnungErstellenDialogProps) {
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: '1', beschreibung: 'Beschreibung', menge: 1, einzelpreis: 0, mwst: '22%' }
    ])

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            beschreibung: 'Beschreibung',
            menge: 1,
            einzelpreis: 0,
            mwst: '22%'
        }
        setLineItems([...lineItems, newItem])
    }

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id))
        }
    }

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const totals = useMemo(() => {
        const zwischensumme = lineItems.reduce((sum, item) => {
            return sum + (item.menge * item.einzelpreis)
        }, 0)

        const mwst = lineItems.reduce((sum, item) => {
            const rate = parseFloat(item.mwst) / 100
            return sum + (item.menge * item.einzelpreis * rate)
        }, 0)

        const gesamtsumme = zwischensumme + mwst

        return {
            zwischensumme: zwischensumme.toFixed(2),
            mwst: mwst.toFixed(2),
            gesamtsumme: gesamtsumme.toFixed(2)
        }
    }, [lineItems])

    const handleErstellen = () => {
        onErstellen({ lineItems, totals })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Rechnung erstellen</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Rechnungsadresse Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">Rechnungsadresse</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                            <p className="font-semibold">
                                {customerData?.vorname || 'TESTTEST'} {customerData?.nachname || ''}
                            </p>
                            <p>{customerData?.straße || 'TEST %'}</p>
                            <p>{customerData?.ort || '39031 Brunico'}</p>
                            <p>{customerData?.land || 'Italien'}</p>
                            <p className="text-gray-500">UID: s*$*%423rr2</p>
                        </div>
                    </div>

                    {/* Rechnungspositionen Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">Rechnungspositionen</h3>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-600">
                            <div className="col-span-5">Positionstext</div>
                            <div className="col-span-2">Menge</div>
                            <div className="col-span-2">Einzelpreis €</div>
                            <div className="col-span-2">MwSt.</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Line Items */}
                        {lineItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <div className="col-span-5">
                                    <Input
                                        value={item.beschreibung}
                                        onChange={(e) => updateLineItem(item.id, 'beschreibung', e.target.value)}
                                        placeholder="Beschreibung"
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.menge}
                                        onChange={(e) => updateLineItem(item.id, 'menge', parseInt(e.target.value) || 1)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.einzelpreis}
                                        onChange={(e) => updateLineItem(item.id, 'einzelpreis', parseFloat(e.target.value) || 0)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Select
                                        value={item.mwst}
                                        onValueChange={(value) => updateLineItem(item.id, 'mwst', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0%">0%</SelectItem>
                                            <SelectItem value="10%">10%</SelectItem>
                                            <SelectItem value="22%">22%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {lineItems.length > 1 && (
                                        <button
                                            onClick={() => removeLineItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add Line Button */}
                        <Button
                            onClick={addLineItem}
                            variant="outline"
                            className="w-full mt-4 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span className="text-xl">+</span> Zeile hinzufügen
                        </Button>
                    </div>

                    {/* Totals Section */}
                    <div className="border-t pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Zwischensumme:</span>
                                <span className="font-semibold">{totals.zwischensumme} €</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>MwSt.:</span>
                                <span className="font-semibold">{totals.mwst} €</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Gesamtsumme:</span>
                                <span>{totals.gesamtsumme} €</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleErstellen}
                        className="bg-[#4ADE80] hover:bg-[#3BC670] text-white cursor-pointer"
                    >
                        Erstellen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
