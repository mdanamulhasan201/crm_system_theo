'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface KonformitatDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function KonformitatDialog({ open, onOpenChange, customerData }: KonformitatDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sr-only">
                    <DialogTitle>Lieferschein & Konformitätserklärung</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 p-4 text-sm">
                    {/* Left Column - Lieferschein & Konformitätserklärung */}
                    <div className="space-y-4 border-r pr-6">
                        <div>
                            <h2 className="font-bold text-base mb-4">
                                Titel:<br />
                                Lieferschein & Konformitätserklärung (Sonderanfertigung gemäß MDR)
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <p className="font-bold">Hersteller / Leistungserbringer:</p>
                            <p>Firma: {'{'}{'{'} Firma {'}'}{'}'}}</p>
                            <p>Adresse: {'{'}{'{'} Adresse {'}'}{'}'}}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="font-bold">Patient:</p>
                            <p>Name: {'{'}{'{'} {customerData?.vorname || 'Patient'} {customerData?.nachname || ''} {'}'}{'}'}}</p>
                            <p>Geburtsdatum: {'{'}{'{'} {customerData?.geburtsdatum ? new Date(customerData.geburtsdatum).toLocaleDateString('de-DE') : 'Geburtsdatum'} {'}'}{'}'}}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="font-bold">Produkt:</p>
                            <p>Bezeichnung: {'{'}{'{'} Produktname {'}'}{'}'}}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span>Art:</span>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" className="w-4 h-4" />
                                    <span>Einlage</span>
                                </label>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" className="w-4 h-4" />
                                    <span>Kompressionsstrumpf</span>
                                </label>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" className="w-4 h-4" />
                                    <span>Maßschuh</span>
                                </label>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" className="w-4 h-4" />
                                    <span>Sonstiges:</span>
                                </label>
                                <span className="border-b border-gray-400 w-16">_____</span>
                            </div>
                            <p>Auftragsnr: {'{'}{'{'} Auftrag {'}'}{'}'}}</p>
                            <p>Herstellungsdatum: {'{'}{'{'} Datum {'}'}{'}'}}</p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <p className="font-bold">Konformitätserklärung</p>
                            <p className="text-xs leading-relaxed">
                                Wir erklären hiermit in alleiniger Verantwortung, dass das oben
                                genannte Medizinprodukt als Sonderanfertigung gemäß Art. 2 und
                                Anhang XIII der Verordnung (EU) 2017/745 (MDR) für die genannte Person
                                hergestellt wurde und den grundlegenden Sicherheits- und
                                Leistungsanforderungen entspricht.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p>Ort, Datum: ___________________</p>
                            <p>Unterschrift Hersteller / Verantwortliche Person: ____________________</p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <p className="font-bold">Übergabe & Einweisung</p>
                            <p className="font-bold text-xs">Der/die Patient:in bestätigt hiermit:</p>
                            <ul className="text-xs space-y-1 pl-4">
                                <li>• das oben genannte Produkt erhalten zu haben,</li>
                                <li>• in Gebrauch, Pflege und Wartung durch geschultes Fachpersonal
                                eingewiesen worden zu sein,</li>
                                <li>• und die Hinweise verstanden zu haben.</li>
                            </ul>
                        </div>

                        <div className="space-y-2 pt-2">
                            <p>Unterschrift Patient:in: ____________________ Datum: _________</p>
                            <p>Unterschrift Einweisende Person: ____________________ Datum: _________</p>
                        </div>
                    </div>

                    {/* Right Column - Mehrkosten-Vereinbarung */}
                    <div className="space-y-4 pl-6">
                        <div>
                            <h2 className="font-bold text-base mb-4">
                                Mehrkosten-Vereinbarung gemäß<br />
                                Hilfsmittelversorgung
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <p>Patient: {'{'}{'{'} {customerData?.vorname || 'Patient'} {customerData?.nachname || ''} {'}'}{'}'}}</p>
                            <p>Produkt: {'{'}{'{'} Produkt {'}'}{'}'}}</p>
                            <p>Verordnung vom: {'{'}{'{'} Datum {'}'}{'}'}}</p>
                        </div>

                        <div className="space-y-3 text-xs leading-relaxed">
                            <p>
                                Der/die Patient:in wurde darüber informiert,
                                dass für die verordnete Versorgung eine
                                mehrkostenfreie, zweckmäßige Alternative zur
                                Verfügung steht.
                            </p>

                            <p>
                                Der/die Patient:in wünscht ausdrücklich
                                folgende abweichende Versorgung:<br />
                                {'{'}{'{'} Beschreibung Mehrleistung {'}'}{'}'}}
                            </p>

                            <p>
                                Mehrkosten: € {'{'}{'{'} Betrag {'}'}{'}'}}
                            </p>

                            <p>
                                Der/die Patient:in erklärt sich bereit, die
                                Mehrkosten selbst zu tragen und wurde über
                                mögliche Alternativen aufgeklärt.
                            </p>
                        </div>

                        <div className="space-y-2 pt-4">
                            <p>Unterschrift Patient:in: ____________________</p>
                            <p>Datum: _________</p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <p>Unterschrift Leistungserbringer:</p>
                            <p>____________________ Datum: _________</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
