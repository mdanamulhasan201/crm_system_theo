'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface KostenvoranschlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function KostenvoranschlagDialog({ open, onOpenChange, customerData }: KostenvoranschlagDialogProps) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Kostenvoranschlag</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        margin: 0;
                        color: #000;
                    }
                    h1 {
                        font-size: 1.25rem;
                        font-weight: bold;
                        margin-bottom: 1rem;
                        border-bottom: 2px solid #000;
                        padding-bottom: 0.5rem;
                    }
                    h3 {
                        font-size: 1rem;
                        font-weight: bold;
                        margin: 1.5rem 0 0.5rem 0;
                        border-bottom: 1px solid #000;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 1rem;
                        font-size: 0.875rem;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                    }
                    th {
                        background: #f3f4f6;
                        font-weight: 600;
                        text-align: left;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .bg-gray {
                        background: #f9fafb;
                    }
                    .font-bold {
                        font-weight: bold;
                    }
                    .header-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1.5rem;
                        font-size: 0.875rem;
                    }
                    @media print {
                        body { padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <h1>KOSTENVORANSCHLAG - ORTHOPÄDISCHE EINLAGEN</h1>

                <div class="header-info">
                    <div>
                        <p><strong>Orthopädie Schuhtechnik Musterbetrieb GmbH</strong></p>
                        <p>Musterstraße 12, 12345 Musterstadt</p>
                        <p>Tel: 0160 / 123456 – info@musterbetrieb.de</p>
                        <p>IK-Nummer: 123456789</p>
                    </div>
                    <div style="text-align: right;">
                        <p>KOSTENVORANSCHLAG (§302 SGB V)</p>
                        <p>KV-Nummer: KV-2025-00123</p>
                        <p>Datum: ${new Date().toLocaleDateString('de-DE')}</p>
                        <p>Gültig bis: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}</p>
                    </div>
                </div>

                <h3>Patienten- und Verordnungsdaten</h3>
                <table>
                    <tr>
                        <td class="bg-gray font-bold" style="width: 33%;">Name, Vorname:</td>
                        <td>${customerData?.nachname || 'Max'} ${customerData?.vorname || 'Mustermann'}</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Geburtsdatum:</td>
                        <td>${customerData?.geburtsdatum ? new Date(customerData.geburtsdatum).toLocaleDateString('de-DE') : '02.03.1985'}</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Versichertennummer:</td>
                        <td>${customerData?.land || 'A123456789'}</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Krankenkasse:</td>
                        <td>AOK Bayern – IK: 104212345</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Arzt / Ärztin:</td>
                        <td>Dr. med. Anna Beispiel</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Verordnungsdatum:</td>
                        <td>${new Date().toLocaleDateString('de-DE')}</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Rezeptnummer:</td>
                        <td>RX-45218</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Diagnose (ICD):</td>
                        <td>M21.4 – Knick-Senkfuß</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Hilfsmittelnummer:</td>
                        <td>08.03.01.0001</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Versorgungsart:</td>
                        <td>Erstversorgung</td>
                    </tr>
                </table>

                <h3>Leistungsübersicht</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Pos.</th>
                            <th>Beschreibung / Leistung</th>
                            <th class="text-center">Menge</th>
                            <th class="text-right">Einzelpreis (€)</th>
                            <th class="text-right">Gesamt (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Orthopädische Einlagen – Standardversorgung</td>
                            <td class="text-center">1 Paar</td>
                            <td class="text-right">95,00</td>
                            <td class="text-right">95,00</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Zusatzposten: Lederbezug (Premium)</td>
                            <td class="text-center">1 Paar</td>
                            <td class="text-right">20,00</td>
                            <td class="text-right">20,00</td>
                        </tr>
                        <tr class="bg-gray">
                            <td colspan="3" class="text-right font-bold">Gesamtsumme:</td>
                            <td colspan="2" class="text-right font-bold">115,00 €</td>
                        </tr>
                    </tbody>
                </table>

                <h3>Kostenaufstellung</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Bezeichnung</th>
                            <th class="text-right">Betrag (€)</th>
                            <th>Bemerkung</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Gesamtbetrag der Versorgung</td>
                            <td class="text-right">95,00</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Festbetrag Krankenkasse</td>
                            <td class="text-right">75,00</td>
                            <td>laut Vertrag AOK</td>
                        </tr>
                        <tr>
                            <td>Eigenanteil des Versicherten</td>
                            <td class="text-right">10,00</td>
                            <td>gesetzl. Zuzahlung (10 %)</td>
                        </tr>
                        <tr>
                            <td>Mehrkosten (Premiumoptionen)</td>
                            <td class="text-right">0,00</td>
                            <td></td>
                        </tr>
                        <tr class="bg-gray font-bold">
                            <td>Zu zahlender Gesamtbetrag Patient</td>
                            <td class="text-right">10,00</td>
                            <td>fällig bei Abholung</td>
                        </tr>
                    </tbody>
                </table>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        }
                    }
                </script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

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

                    {/* Print Button */}
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={handlePrint}
                            className="bg-[#61A07B] hover:bg-[#528c68] text-white px-6 py-2 flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            PDF drucken
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
