'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'

interface RechnungDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function RechnungDialog({ open, onOpenChange, customerData }: RechnungDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Rechnung (Firma)</DialogTitle>
                </DialogHeader>

                {/* Green Header Section */}
                <div className="bg-[#5BA888] text-white p-6 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-white/30 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">FEET FIRST</div>
                            <div className="text-sm">👣</div>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">Angebot Nr. 1234</p>
                        </div>
                    </div>

                    {/* Company and Date Info */}
                    <div className="flex justify-between text-sm">
                        <div>
                            <p>Via Pipen, 5</p>
                            <p>38031 Brunico (BZ)</p>
                            <p>Italien</p>
                            <p>info@feetfirst.com</p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-semibold">Datum:</span> {new Date().toLocaleDateString('de-DE')}</p>
                            <p><span className="font-semibold">Gültig bis:</span> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}</p>
                            <p><span className="font-semibold">Kundennummer:</span> {customerData?.customerNumber || '123456'}</p>
                        </div>
                    </div>
                </div>

                {/* White Content Section */}
                <div className="bg-white p-6 space-y-6">
                    {/* Customer Section */}
                    <div className="flex justify-between border-l-4 border-[#5BA888] pl-4">
                        <div>
                            <p className="font-bold mb-2">KUNDEN</p>
                            <p className="text-sm">{customerData?.vorname || 'Michael'} {customerData?.nachname || 'Riefers'}</p>
                            <p className="text-sm">Musterstr. 5, 12345 Musterstadt</p>
                            <p className="text-sm">{customerData?.telefonnummer || customerData?.telefon || '0123 / 7890'}</p>
                        </div>
                        <div>
                            <p className="font-bold mb-2">PROJEKTBESCHREIBUNG:</p>
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-4xl">👟</span>
                            </div>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="border border-gray-200 rounded overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left p-3 font-bold">BESCHREIBUNG</th>
                                    <th className="text-center p-3 font-bold">ANZAHL</th>
                                    <th className="text-right p-3 font-bold">PREIS</th>
                                    <th className="text-right p-3 font-bold">SUMME</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="p-3">Beschreibung des Artikels oder der Dienstleistung</td>
                                    <td className="text-center p-3">5</td>
                                    <td className="text-right p-3">100 €</td>
                                    <td className="text-right p-3">500 €</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="p-3">Beschreibung des Artikels oder der Dienstleistung</td>
                                    <td className="text-center p-3">5</td>
                                    <td className="text-right p-3">100 €</td>
                                    <td className="text-right p-3">500 €</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="p-3">Beschreibung des Artikels oder der Dienstleistung</td>
                                    <td className="text-center p-3">5</td>
                                    <td className="text-right p-3">100 €</td>
                                    <td className="text-right p-3">500 €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Terms and Totals */}
                    <div className="flex justify-between gap-6">
                        <div className="w-1/2 text-xs">
                            <p className="font-bold mb-2">ALLGEMEINE GESCHÄFTSBEDINGUNGEN</p>
                            <ul className="space-y-1 text-gray-700">
                                <li>• Die oben genannten Informationen sind keine Rechnung, sondern eine Schätzung von Waren/Dienstleistungen.</li>
                                <li>• Die Zahlung wird vor der Bereitstellung oder Lieferung von Waren/Dienstleistungen fällig</li>
                            </ul>
                        </div>
                        <div className="w-1/3">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>ZWISCHEN-SUMME:</span>
                                    <span className="font-bold">1500 €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>STEUER:</span>
                                    <span className="font-bold">100 €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SONSTIGES:</span>
                                    <span className="font-bold">0 €</span>
                                </div>
                                <div className="flex justify-between text-base pt-2 border-t-2 border-gray-300">
                                    <span className="font-bold">SUMME</span>
                                    <span className="font-bold">1600 €</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className="pt-4">
                        <p className="text-center mb-6 text-sm">
                            Bitte bestätige deine Zustimmung zu diesem Angebot:
                        </p>
                        <div className="flex justify-between items-end gap-6">
                            <div className="flex-1">
                                <div className="border-b-2 border-gray-400 pb-2 mb-1">
                                </div>
                                <span className="text-xs text-gray-500">Unterschrift über gedruckten Namen</span>
                            </div>
                            <div className="w-1/3">
                                <div className="border-b-2 border-gray-400 pb-2 mb-1">
                                </div>
                                <span className="text-xs text-gray-500">Datum</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
