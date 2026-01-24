'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GebrauchsanweisungDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function GebrauchsanweisungDialog({ open, onOpenChange, customerData }: GebrauchsanweisungDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sr-only">
                    <DialogTitle>Gebrauchsanweisung</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 p-6">
                    {/* Header with Logo */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="text-xl font-bold text-gray-400">FEET FIRST</div>
                        <div className="text-sm">👣</div>
                    </div>

                    {/* Color Blocks */}
                    <div className="flex gap-2 mb-6">
                        <div className="w-20 h-12 bg-[#5BA888]"></div>
                        <div className="w-20 h-12 bg-[#A8C5B8]"></div>
                        <div className="w-20 h-12 bg-gray-400"></div>
                    </div>

                    {/* Main Title */}
                    <div className="border-b-4 border-black pb-2 mb-6">
                        <h1 className="text-3xl font-bold">EINLAGEN RICHTIG NUTZEN –</h1>
                        <h2 className="text-2xl font-bold text-right">SO GEHT'S</h2>
                    </div>

                    {/* Introduction */}
                    <div className="mb-6">
                        <p className="text-lg font-bold mb-4">
                            <span className="underline">Vielen Dank</span> für <span className="underline">Ihr Vertrauen</span> in <span className="font-bold">FeetFirst.</span>
                        </p>
                        <p className="text-sm leading-relaxed">
                            <span className="font-bold underline">Ihre Einlagen wurden individuell</span> von <span className="underline">einem Fachbetrieb</span> auf <span className="font-bold underline">Basis eines 3D-Scans</span> und <span className="underline">ggf. fachlicher Empfehlung</span> gefertigt.
                        </p>
                    </div>

                    {/* Instructions Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 border-b-2 border-black pb-1">
                            BITTE BEACHTEN SIE DIE FOLGENDEN HINWEISE, UM EINE OPTIMALE WIRKUNG ZU UNTERSTÜTZEN:
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="leading-relaxed">
                                <span className="font-bold">Anfängliche Tragezeit:</span> Beginnen Sie mit nur wenigen Stunden Tragezeit pro Tag und steigern Sie dies allmählich. Nach 20 Tagen sollten Sie die Einlagen problemlos den ganzen Tag tragen können.
                            </li>
                            <li className="leading-relaxed">
                                <span className="font-bold">Verwendung in verschiedenen Schuhen:</span> Überprüfen Sie die Passform in verschiedenen Schuhen. Dabei ist auf ausreichende Länge und Breite zu achten.
                            </li>
                            <li className="leading-relaxed">
                                <span className="font-bold">Tägliche Fußkontrolle:</span> Kontrollieren Sie Ihre Füße in den ersten Tagen regelmäßig auf Druckstellen oder Hautreizungen. Bei Auffälligkeiten setzen Sie die Nutzung bitte aus und kontaktieren Sie Ihren Ansprechpartner.
                            </li>
                        </ul>
                    </div>

                    {/* Care Instructions */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 border-b-2 border-black pb-1">
                            PFLEGEHINWEISE:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="leading-relaxed">
                                <span className="font-bold">Belüftung:</span> Lassen Sie die Einlagen täglich atmen, indem Sie sie aus den Schuhen nehmen oder täglich wechseln.
                            </li>
                            <li className="leading-relaxed">
                                <span className="font-bold">Reinigung:</span> Verwenden Sie ein feuchtes Tuch zur Reinigung und bei Bedarf ein mildes Desinfektionsmittel. Vermeiden Sie die Waschmaschine.
                            </li>
                            <li className="leading-relaxed">
                                <span className="font-bold">Trocknung:</span> Trocknen Sie nasse Einlagen an der Luft. Vermeiden Sie Hitzequellen wie Heizungen oder Föhn.
                            </li>
                        </ul>
                    </div>

                    {/* Usage Duration Notice */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 border-b-2 border-black pb-1">
                            HINWEIS ZUR NUTZUNGSDAUER:
                        </h3>
                        <p className="text-sm leading-relaxed mb-3">
                            Die <span className="underline">orthopädischen Einlagen</span> der idee. <span className="font-bold">FeetFirst</span> <span className="underline">empfohlen</span> wurden, haben keine festgelegte Lebensdauer. Bitte führen Sie <span className="underline">regelmäßig</span> Kontrollen durch, um zu überprüfen, ob die <span className="underline">Einlagen</span> noch Ihren Bedürfnissen entsprechen. Sprechen Sie mit Ihrem Arzt oder Sanitätshaus über geeignete individuelle Wechselintervalle. Die Wahl der geeigneten individuell angepassten Einlagen lässt sich nicht verallgemeinern, so bleiben Sie gesund.
                        </p>
                        <p className="text-sm leading-relaxed">
                            <span className="font-bold underline">Außerdem</span> bieten einige Partner eine professionelle Aufbewahrung an (90 € <span className="underline">zzgl.</span> Versand). Sie <span className="underline">erhalten Gutschein, Inserts</span> und Optik auf und eine <span className="underline">verlängerte</span> die Lebensdauer Ihrer Einlagen.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
