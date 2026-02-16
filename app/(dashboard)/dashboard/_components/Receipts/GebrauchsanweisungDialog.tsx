'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Printer } from 'lucide-react'
import Image from 'next/image'

interface GebrauchsanweisungDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerData?: any
}

export default function GebrauchsanweisungDialog({ open, onOpenChange, customerData }: GebrauchsanweisungDialogProps) {
    const { user } = useAuth()
    const companyName = user?.busnessName || 'FeetFirst'

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const logoHtml = user?.image
            ? `<div style="position: relative; width: 128px; height: 80px;"><img src="${user.image}" alt="Company Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>`
            : '<div style="width: 128px; height: 80px; display: flex; align-items: center;"><div style="font-size: 2.25rem; font-weight: bold; color: #1f2937;">F</div></div>'

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Gebrauchsanweisung</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 2rem;
                        margin: 0;
                        color: #000;
                    }
                    h1 { font-size: 1.875rem; font-weight: bold; margin-bottom: 0.5rem; }
                    h3 { font-size: 1.125rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; }
                    p { margin-bottom: 1rem; line-height: 1.6; }
                    ul { margin-left: 1.5rem; margin-bottom: 2rem; }
                    li { margin-bottom: 0.75rem; line-height: 1.6; }
                    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; }
                    .color-blocks { display: flex; gap: 0.5rem; }
                    .color-block { width: 64px; height: 64px; }
                    .underline { width: 96px; height: 4px; background: #000; margin-bottom: 1.5rem; }
                    .divider { border-top: 1px solid #d1d5db; padding-top: 1.5rem; margin-top: 2rem; }
                    .footer { border-top: 4px solid #000; padding-top: 1.5rem; margin-top: 2rem; font-weight: bold; font-size: 1.125rem; }
                    @media print {
                        body { padding: 1rem; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    ${logoHtml}
                    <div class="color-blocks">
                        <div class="color-block" style="background: #6B9B87;"></div>
                        <div class="color-block" style="background: #8A9A8E;"></div>
                        <div class="color-block" style="background: #707070;"></div>
                    </div>
                </div>

                <h1>Gebrauchsanweisung für orthopädische Einlagen</h1>
                <div class="underline"></div>

                <p style="font-weight: 600; font-size: 1rem;">
                    Bitte beachten Sie die folgenden Anweisungen, um ihre volle Wirksamkeit zu gewährleisten:
                </p>

                <ul style="font-size: 0.875rem;">
                    <li><strong>Anfängliche Tragezeit:</strong> Beginnen Sie mit nur wenigen Stunden Tragezeit pro Tag und steigern Sie dies allmählich. Nach 20 Tagen sollten Sie die Einlagen problemlos den ganzen Tag tragen können.</li>
                    <li><strong>Verwendung in verschiedenen Schuhen:</strong> Überprüfen Sie die Passform in verschiedenen Schuhen. Dabei ist ausreichende Länge und Breite zu beachten.</li>
                    <li><strong>Tägliche Fußkontrolle:</strong> Überprüfen Sie zu Beginn täglich Ihre Füße auf Druckstellen oder Hautirritationen. Bei Auffälligkeiten kontaktieren Sie uns sofort und tragen Sie die Einlagen vorübergehend nicht.</li>
                </ul>

                <h3>Pflegehinweise:</h3>
                <ul style="font-size: 0.875rem;">
                    <li><strong>Belüftung:</strong> Lassen Sie die Einlagen täglich atmen, indem Sie sie aus den Schuhen nehmen oder täglich wechseln.</li>
                    <li><strong>Reinigung:</strong> Verwenden Sie ein feuchtes Tuch zur Reinigung und bei Bedarf ein mildes Desinfektionsmittel. Vermeiden Sie die Waschmaschine.</li>
                    <li><strong>Trocknung:</strong> Trocknen Sie nasse Einlagen an der Luft. Vermeiden Sie Hitzequellen wie Heizungen oder Föhne.</li>
                </ul>

                <h3>Hinweis zur Nutzungsdauer:</h3>
                <p style="font-size: 0.875rem; margin-bottom: 1rem;">
                    Bitte beachten Sie, dass die orthopädischen Einlagen von ${companyName} keine festgelegte Nutzungsdauer haben. Die Lebensdauer der Einlagen hängt von der Art und dem Umfang ihrer Verwendung ab. Im Normalfall beträgt die Nutzungsdauer jedoch um die drei Jahre.
                </p>
                <p style="font-size: 0.875rem;">
                    Die Abnutzung der Einlagen variiert je nach individueller Nutzung, weshalb es ratsam ist, regelmäßige Inspektionen durchzuführen, um sicherzustellen, dass die Einlagen weiterhin optimal funktionieren.
                </p>

                <div class="divider">
                    <p style="font-weight: bold; font-size: 1rem; margin-bottom: 1rem;">
                        Vielen Dank für Ihre Aufmerksamkeit und Ihr Vertrauen in unsere Produkte.
                    </p>
                    <p style="font-size: 0.875rem;">
                        <span style="font-weight: 600; text-decoration: underline;">Ihre Einlagen wurden individuell</span> von <span style="text-decoration: underline;">einem Fachbetrieb</span> auf <span style="font-weight: 600; text-decoration: underline;">Basis eines 3D-Scans</span> und ggf. fachlicher Empfehlung gefertigt.
                    </p>
                </div>

                <div class="footer">
                    Vielen Dank für Ihr Vertrauen in ${companyName}.
                </div>

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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Gebrauchsanweisung</DialogTitle>
                    </DialogHeader>

                <div className="p-8">
                    {/* Header with Partner Logo */}
                    <div className="flex justify-between items-start mb-8">
                        {user?.image ? (
                            <div className="relative w-32 h-20">
                                <Image
                                    src={user.image}
                                    alt="Company Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-32 h-20 flex items-center">
                                <div className="text-4xl font-bold text-gray-800">F</div>
                            </div>
                        )}

                        {/* Color Blocks */}
                        <div className="flex gap-2">
                            <div className="w-16 h-16 bg-[#6B9B87]"></div>
                            <div className="w-16 h-16 bg-[#8A9A8E]"></div>
                            <div className="w-16 h-16 bg-[#707070]"></div>
                        </div>
                    </div>

                    {/* Main Title */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Gebrauchsanweisung für orthopädische Einlagen</h1>
                        <div className="w-24 h-1 bg-black"></div>
                    </div>

                    {/* Introduction Text */}
                    <p className="text-base font-semibold mb-6">
                        Bitte beachten Sie die folgenden Anweisungen, um ihre volle Wirksamkeit zu gewährleisten:
                    </p>

                    {/* Instructions List */}
                    <ul className="space-y-3 mb-8 ml-6 list-disc text-sm">
                        <li className="leading-relaxed">
                            <span className="font-semibold">Anfängliche Tragezeit:</span> Beginnen Sie mit nur wenigen Stunden Tragezeit pro Tag und steigern Sie dies allmählich. Nach 20 Tagen sollten Sie die Einlagen problemlos den ganzen Tag tragen können.
                        </li>
                        <li className="leading-relaxed">
                            <span className="font-semibold">Verwendung in verschiedenen Schuhen:</span> Überprüfen Sie die Passform in verschiedenen Schuhen. Dabei ist ausreichende Länge und Breite zu beachten.
                        </li>
                        <li className="leading-relaxed">
                            <span className="font-semibold">Tägliche Fußkontrolle:</span> Überprüfen Sie zu Beginn täglich Ihre Füße auf Druckstellen oder Hautirritationen. Bei Auffälligkeiten kontaktieren Sie uns sofort und tragen Sie die Einlagen vorübergehend nicht.
                        </li>
                    </ul>

                    {/* Care Instructions */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Pflegehinweise:</h3>
                        <ul className="space-y-2 ml-6 list-disc text-sm">
                            <li className="leading-relaxed">
                                <span className="font-semibold">Belüftung:</span> Lassen Sie die Einlagen täglich atmen, indem Sie sie aus den Schuhen nehmen oder täglich wechseln.
                            </li>
                            <li className="leading-relaxed">
                                <span className="font-semibold">Reinigung:</span> Verwenden Sie ein feuchtes Tuch zur Reinigung und bei Bedarf ein mildes Desinfektionsmittel. Vermeiden Sie die Waschmaschine.
                            </li>
                            <li className="leading-relaxed">
                                <span className="font-semibold">Trocknung:</span> Trocknen Sie nasse Einlagen an der Luft. Vermeiden Sie Hitzequellen wie Heizungen oder Föhne.
                            </li>
                        </ul>
                    </div>

                    {/* Usage Duration Notice */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Hinweis zur Nutzungsdauer:</h3>
                        <p className="text-sm leading-relaxed mb-4">
                            Bitte beachten Sie, dass die orthopädischen Einlagen von {companyName} keine festgelegte Nutzungsdauer haben. Die Lebensdauer der Einlagen hängt von der Art und dem Umfang ihrer Verwendung ab. Im Normalfall beträgt die Nutzungsdauer jedoch um die drei Jahre.
                        </p>
                        <p className="text-sm leading-relaxed">
                            Die Abnutzung der Einlagen variiert je nach individueller Nutzung, weshalb es ratsam ist, regelmäßige Inspektionen durchzuführen, um sicherzustellen, dass die Einlagen weiterhin optimal funktionieren.
                        </p>
                    </div>

                    {/* Footer with divider */}
                    <div className="pt-6 border-t border-gray-300">
                        <p className="text-base font-bold mb-4">
                            Vielen Dank für Ihre Aufmerksamkeit und Ihr Vertrauen in unsere Produkte.
                        </p>
                        <p className="text-sm leading-relaxed">
                            <span className="font-semibold underline">Ihre Einlagen wurden individuell</span> von <span className="underline">einem Fachbetrieb</span> auf <span className="font-semibold underline">Basis eines 3D-Scans</span> und ggf. fachlicher Empfehlung gefertigt.
                        </p>
                    </div>

                    {/* Bottom Footer with Company Name */}
                    <div className="mt-8 pt-6 border-t-4 border-black">
                        <p className="text-lg font-bold">
                            Vielen Dank für Ihr Vertrauen in {companyName}.
                        </p>
                    </div>

                    {/* Print Button */}
                    <div className="mt-6 flex justify-center print:hidden">
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
