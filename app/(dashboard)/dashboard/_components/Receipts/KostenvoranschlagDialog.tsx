'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface KostenvoranschlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function KostenvoranschlagDialog({ open, onOpenChange, customerData }: KostenvoranschlagDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-bold">
                        KOSTENVORANSCHLAG - ORTHOPÄDISCHE EINLAGEN
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 p-4">
                    {/* Company Information */}
                    <div className="flex justify-between text-sm">
                        <div>
                            <p className="font-semibold">Orthopädie Schuhtechnik Musterbetrieb GmbH</p>
                            <p>Musterstraße 12, 12345 Musterstadt</p>
                            <p>Tel: 0160 / 123456 – info@musterbetrieb.de</p>
                            <p>IK-Nummer: 123456789</p>
                        </div>
                        <div className="text-right">
                            <p>KOSTENVORANSCHLAG (§302 SGB V)</p>
                            <p>KV-Nummer: KV-2025-00123</p>
                            <p>Datum: {new Date().toLocaleDateString('de-DE')}</p>
                            <p>Gültig bis: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}</p>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div>
                        <h3 className="font-bold mb-2 border-b">Patienten- und Verordnungsdaten</h3>
                        <table className="w-full text-sm border-collapse">
                            <tbody>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold w-1/3">Name, Vorname:</td>
                                    <td className="border p-2">{customerData?.nachname || 'Max'} {customerData?.vorname || 'Mustermann'}</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Geburtsdatum:</td>
                                    <td className="border p-2">{customerData?.geburtsdatum ? new Date(customerData.geburtsdatum).toLocaleDateString('de-DE') : '02.03.1985'}</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Versichertennummer:</td>
                                    <td className="border p-2">{customerData?.land || 'A123456789'}</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Krankenkasse:</td>
                                    <td className="border p-2">AOK Bayern – IK: 104212345</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Arzt / Ärztin:</td>
                                    <td className="border p-2">Dr. med. Anna Beispiel</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Verordnungsdatum:</td>
                                    <td className="border p-2">{new Date().toLocaleDateString('de-DE')}</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Rezeptnummer:</td>
                                    <td className="border p-2">RX-45218</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Diagnose (ICD):</td>
                                    <td className="border p-2">M21.4 – Knick-Senkfuß</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Hilfsmittelnummer:</td>
                                    <td className="border p-2">08.03.01.0001</td>
                                </tr>
                                <tr className="border">
                                    <td className="border p-2 bg-gray-50 font-semibold">Versorgungsart:</td>
                                    <td className="border p-2">Erstversorgung</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Services Overview */}
                    <div>
                        <h3 className="font-bold mb-2 border-b">Leistungsübersicht</h3>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">Pos.</th>
                                    <th className="border p-2 text-left">Beschreibung / Leistung</th>
                                    <th className="border p-2 text-center">Menge</th>
                                    <th className="border p-2 text-right">Einzelpreis (€)</th>
                                    <th className="border p-2 text-right">Gesamt (€)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2">1</td>
                                    <td className="border p-2">Orthopädische Einlagen – Standardversorgung</td>
                                    <td className="border p-2 text-center">1 Paar</td>
                                    <td className="border p-2 text-right">95,00</td>
                                    <td className="border p-2 text-right">95,00</td>
                                </tr>
                                <tr>
                                    <td className="border p-2">2</td>
                                    <td className="border p-2">Zusatzposten: Lederbezug (Premium)</td>
                                    <td className="border p-2 text-center">1 Paar</td>
                                    <td className="border p-2 text-right">20,00</td>
                                    <td className="border p-2 text-right">20,00</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td colSpan={3} className="border p-2 text-right font-semibold">Gesamtsumme:</td>
                                    <td colSpan={2} className="border p-2 text-right font-bold">115,00 €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Cost Breakdown */}
                    <div>
                        <h3 className="font-bold mb-2 border-b">Kostenaufstellung</h3>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">Bezeichnung</th>
                                    <th className="border p-2 text-right">Betrag (€)</th>
                                    <th className="border p-2 text-left">Bemerkung</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2">Gesamtbetrag der Versorgung</td>
                                    <td className="border p-2 text-right">95,00</td>
                                    <td className="border p-2"></td>
                                </tr>
                                <tr>
                                    <td className="border p-2">Festbetrag Krankenkasse</td>
                                    <td className="border p-2 text-right">75,00</td>
                                    <td className="border p-2">laut Vertrag AOK</td>
                                </tr>
                                <tr>
                                    <td className="border p-2">Eigenanteil des Versicherten</td>
                                    <td className="border p-2 text-right">10,00</td>
                                    <td className="border p-2">gesetzl. Zuzahlung (10 %)</td>
                                </tr>
                                <tr>
                                    <td className="border p-2">Mehrkosten (Premiumoptionen)</td>
                                    <td className="border p-2 text-right">0,00</td>
                                    <td className="border p-2"></td>
                                </tr>
                                <tr className="bg-gray-50 font-bold">
                                    <td className="border p-2">Zu zahlender Gesamtbetrag Patient</td>
                                    <td className="border p-2 text-right">10,00</td>
                                    <td className="border p-2">fällig bei Abholung</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
