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
                            BITTE BEACHTEN SIE DIE FOLGENDEN HINWEISE, UM <span className="underline">EINE OPTIMALE WIRKUNG ZU UNTERSTÜTZEN:</span>
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="leading-relaxed">
                                • <span className="font-bold underline">Mindestens täglich tragen:</span> Tragen Sie sie <span className="underline">so oft</span> wie möglich, idealerweise pro Tag und <span className="underline">täglich</span> Sie sind <span className="underline">täglich</span> im Alltag. Nach 20 Tagen haben sich die <span className="underline">Füßen</span> oft an die <span className="underline">Veränderung gewöhnt</span>.
                            </li>
                            <li className="leading-relaxed">
                                • <span className="font-bold underline">Eingewöhnung</span> in verschiedenen Schuhen: Überwinden Sie die <span className="underline">Fesslung</span> in verschiedenen <span className="underline">Schuhen</span>. Diese ist <span className="underline">normalerweise</span> kurze und <span className="underline">vorübergehend</span>.
                            </li>
                            <li className="leading-relaxed">
                                • <span className="font-bold underline">Tägliche Fußkontrolle kontrollieren:</span> Sie ihre <span className="underline">Füße</span> in den ersten Tagen <span className="underline">regelmäßig</span> auf Druckstellen oder Hautreizungen.
                            </li>
                            <li className="leading-relaxed">
                                Bei <span className="underline font-bold">Auffälligkeiten</span> setzen Sie die <span className="underline">Nutzung</span> bitte aus und <span className="underline font-bold">kontaktieren</span> Sie <span className="underline">Ihren</span> Ansprechpartner.
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
                                • <span className="font-bold underline">Reinigung:</span> Lassen Sie die <span className="underline">Einlagen täglich trocknen lüften</span>. Sie sie aus den <span className="underline">Schuhen</span> nehmen <span className="font-bold underline">oder</span> täglich wechseln.
                            </li>
                            <li className="leading-relaxed">
                                • <span className="font-bold underline">Feuchtigkeit:</span> Verwenden Sie ein <span className="underline">feuchtes Tuch</span> zur <span className="underline">Reinigung</span> und bei <span className="underline">Bedarf</span> ein mildes Reinigungsmittel. Vermeiden Sie <span className="underline">Einweichen</span>.
                            </li>
                            <li className="leading-relaxed">
                                • <span className="font-bold underline">Trocknung:</span> Trocknen Sie nasse <span className="underline">Einlagen</span> an der Luft. <span className="underline">Vermeiden</span> Sie <span className="underline">Hitzequellen</span> wie Heizkörpern oder <span className="underline">Föhns</span>.
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
