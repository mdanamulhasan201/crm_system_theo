'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pen, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface DatenschutzDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function DatenschutzDialog({ open, onOpenChange, customerData }: DatenschutzDialogProps) {
    const [showSignaturePrompt, setShowSignaturePrompt] = useState(true)
    const [needsSignature, setNeedsSignature] = useState<boolean | null>(null)
    const [signature, setSignature] = useState('')

    const handleDigitalSignature = () => {
        setNeedsSignature(true)
        setShowSignaturePrompt(false)
    }

    const handleNoSignature = () => {
        setNeedsSignature(false)
        setShowSignaturePrompt(false)
    }

    const handleReset = () => {
        setSignature('')
        toast.success('Unterschrift zurückgesetzt')
    }

    const handleSave = () => {
        if (needsSignature && !signature.trim()) {
            toast.error('Bitte unterschreiben Sie im Feld oben')
            return
        }
        toast.success('Datenschutzerklärung wurde gespeichert')
        onOpenChange(false)
        // Reset states when closing
        setTimeout(() => {
            setShowSignaturePrompt(true)
            setNeedsSignature(null)
            setSignature('')
        }, 300)
    }

    const handleBack = () => {
        if (!showSignaturePrompt) {
            setShowSignaturePrompt(true)
            setNeedsSignature(null)
        } else {
            onOpenChange(false)
            // Reset states when closing
            setTimeout(() => {
                setShowSignaturePrompt(true)
                setNeedsSignature(null)
                setSignature('')
            }, 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={showSignaturePrompt ? "max-w-md" : "max-w-4xl max-h-[90vh] overflow-y-auto"}>
                <DialogHeader className={showSignaturePrompt ? "" : "sr-only"}>
                    <DialogTitle className="text-lg font-semibold">
                        Datenschutzerklärung
                    </DialogTitle>
                </DialogHeader>

                {showSignaturePrompt ? (
                    // Initial Signature Prompt
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-600 mb-6">
                            Soll die Datenschutzerklärung digital unterzeichnet werden?
                        </p>

                        <button
                            onClick={handleDigitalSignature}
                            className="w-full p-4 bg-[#61A07B] hover:bg-[#528c68] text-white rounded-lg flex items-start gap-3 cursor-pointer transition-colors"
                        >
                            <Pen className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="font-semibold">Ja, digital unterschreiben</p>
                                <p className="text-sm text-white/90">Unterschrift direkt im System erfassen</p>
                            </div>
                        </button>

                        <button
                            onClick={handleNoSignature}
                            className="w-full p-4 border-2 border-gray-300 hover:bg-gray-50 rounded-lg flex items-start gap-3 cursor-pointer transition-colors"
                        >
                            <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="font-semibold">Nein, ohne digitale Unterschrift</p>
                                <p className="text-sm text-gray-600">PDF ohne Unterschrift erstellen</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    // Full Privacy Policy Document
                    <div className="space-y-6 p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold">Datenschutzhinweis für Kund:innen</h2>
                            <p className="text-sm text-gray-600 mt-1">(nach Art. 13 DSGVO — gültig für Deutschland & Österreich)</p>
                        </div>

                        {/* Section 1 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">1. Verantwortliche Stelle</h3>
                            <p className="text-sm mb-2">Verantwortlich für die Verarbeitung Ihrer personenbezogenen Daten ist:</p>
                            <div className="text-sm ml-4 space-y-1">
                                <p>[Name des Geschäfts]</p>
                                <p>[Adresse]</p>
                                <p>[E-Mail / Telefon]</p>
                            </div>
                            <p className="text-sm mt-3">Zur technischen Umsetzung nutzen wir die Softwareplattform FeetF1rst.</p>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">2. Welche Daten verarbeiten wir?</h3>
                            <p className="text-sm mb-2">Wir verarbeiten nur jene Daten, die für Ihre Versorgung und die Nutzung unserer Services erforderlich sind, insbesondere:</p>
                            <ul className="text-sm ml-4 space-y-1 list-disc list-inside">
                                <li>Kontaktdaten (Name, Adresse, Telefonnummer, E-Mail)</li>
                                <li>Gesundheits- und Versorgungsdaten (Rezepte, Diagnosen, Maße, 3D-Scans)</li>
                                <li>Dokumente zur Versorgung (Aufträge, Mess- und Scanprotokolle, Patientenakte)</li>
                                <li>Abrechnungsdaten (Krankenkasse, Versicherungsdaten, Rechnungen)</li>
                                <li>Nutzungsdaten der FeetF1rst-App (z. B. Scan-Uploads, gewählte Services, Anfragen)</li>
                                <li>Kommunikationsdaten (Terminabsprachen, Rückfragen, Benachrichtigungen)</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">3. Zweck der Verarbeitung</h3>
                            <p className="text-sm mb-2">Ihre Daten werden verarbeitet, um:</p>
                            <ul className="text-sm ml-4 space-y-1 list-disc list-inside">
                                <li>Ihre orthopädische bzw. medizinische Versorgung durchzuführen</li>
                                <li>Hilfsmittel anzufertigen, anzupassen und zu dokumentieren</li>
                                <li>3D-Scans zu speichern und für zukünftige Versorgungen zu nutzen</li>
                                <li>Ihnen personalisierte Empfehlungen (z. B. Schuh-Empfehlungen, Übungspläne) bereitzustellen</li>
                                <li>Ihnen einen personalisierten Zugang zur FeetF1rst-App zu ermöglichen</li>
                                <li>Termine zu planen und Ihre Anfragen zu bearbeiten</li>
                                <li>Leistungen abzurechnen und gesetzliche Pflichten zu erfüllen</li>
                                <li>Sie — sofern gewünscht — über relevante Services oder neue Versorgungen zu informieren</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">4. Empfänger der Daten</h3>
                            <p className="text-sm mb-2">Ihre Daten werden nur weitergegeben, wenn dies erforderlich ist, z. B. an:</p>
                            <ul className="text-sm ml-4 space-y-1 list-disc list-inside">
                                <li>behandelnde Ärzt:innen</li>
                                <li>Krankenkassen oder Versicherungen</li>
                                <li>Abrechnungsstellen</li>
                                <li>technische Dienstleister (z. B. Software- und Hostinganbieter)</li>
                            </ul>
                            <p className="text-sm mt-2">Alle Empfänger sind vertraglich zur Einhaltung der DSGVO verpflichtet.</p>
                        </div>

                        {/* Section 5 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">5. Kommunikation</h3>
                            <p className="text-sm mb-2">Wir kontaktieren Sie ausschließlich im Zusammenhang mit Ihrer Versorgung oder Nutzung unserer Services, z. B. für Termine, Rückfragen oder Benachrichtigungen.</p>
                            <p className="text-sm">Die Kontaktaufnahme erfolgt je nach Auswahl per Telefon, E-Mail, SMS, WhatsApp oder über die FeetF1rst-App. Newsletter oder Informationsmails erfolgen nur mit Ihrer ausdrücklichen Einwilligung.</p>
                        </div>

                        {/* Section 6 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">6. Speicherdauer</h3>
                            <p className="text-sm">Wir speichern Ihre Daten nur so lange, wie sie für die Versorgung, Nutzung der App oder aufgrund gesetzlicher Vorgaben erforderlich sind (in der Regel 6–10 Jahre, medizinische Daten ggf. länger).</p>
                        </div>

                        {/* Section 7 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">7. Ihre Rechte</h3>
                            <p className="text-sm mb-2">Sie haben jederzeit das Recht auf:</p>
                            <ul className="text-sm ml-4 space-y-1 list-disc list-inside">
                                <li>Auskunft</li>
                                <li>Berichtigung</li>
                                <li>Löschung (soweit gesetzlich möglich)</li>
                                <li>Einschränkung der Verarbeitung</li>
                                <li>Datenübertragbarkeit</li>
                                <li>Widerruf erteilter Einwilligungen</li>
                                <li>Beschwerde bei der zuständigen Datenschutz-Aufsichtsbehörde (in Deutschland bei der Landesdatenschutzbehörde Ihres Bundeslands, in Österreich bei der Datenschutzbehörde)</li>
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">8. Rechtsgrundlagen</h3>
                            <p className="text-sm mb-2">Die Verarbeitung erfolgt auf Grundlage von:</p>
                            <ul className="text-sm ml-4 space-y-1 list-disc list-inside">
                                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
                                <li>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)</li>
                                <li>Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsversorgung)</li>
                                <li>ggf. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
                            </ul>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-center">Bei Fragen zum Datenschutz wenden Sie sich jederzeit an unser Team.</p>
                        </div>

                        {/* Customer Info and Signature if needed */}
                        {needsSignature && (
                            <>
                                <div className="flex justify-between text-sm bg-gray-50 p-3 rounded mt-6">
                                    <div>
                                        <p className="text-gray-600 text-xs mb-1">Name:</p>
                                        <p className="font-medium">{customerData?.vorname || 'Miss'} {customerData?.nachname || 'Musterfrau'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-600 text-xs mb-1">Datum:</p>
                                        <p className="font-medium">{new Date().toLocaleDateString('de-DE')}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unterschrift
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded h-40 flex items-center justify-center bg-white">
                                        <textarea
                                            value={signature}
                                            onChange={(e) => setSignature(e.target.value)}
                                            className="w-full h-full p-4 bg-transparent resize-none focus:outline-none text-center"
                                            placeholder=""
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Bitte unterschreiben Sie im Feld oben
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-3 pt-2">
                            {needsSignature && (
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Zurücksetzen
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                className="bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer"
                            >
                                Speichern & erstellen
                            </Button>
                        </div>

                        {/* Back Link */}
                        <div className="text-center pt-2">
                            <button
                                onClick={handleBack}
                                className="text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer"
                            >
                                Zurück
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
