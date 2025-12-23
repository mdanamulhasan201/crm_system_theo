'use client'
import React, { useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface FAQItem {
    question: string
    answer: string
}

interface FAQSection {
    title: string
    items: FAQItem[]
}

interface FAQSubSection {
    title: string
    items: FAQItem[]
}

interface FAQWithSubSections {
    title: string
    subsections: FAQSubSection[]
}

const faqData = {
    shoeFinder: {
        title: 'Shoe Finder',
        isDialog: true,
        dialogContent: {
            title: 'Coming Soon',
            description: 'Best passende Schuhe für Ihre Kunden. Kein Mehraufwand. Mehr Service & mehr Zufriedenheit.'
        }
    },
    auftragserstellung: {
        title: 'Auftragserstellung-Einlagen',
        items: [
            {
                question: 'Werden Kunden über den Bestellstatus informiert?',
                answer: 'Ja. Standardmäßig erhält der Kunde eine Auftragsbestätigung sowie eine Nachricht, sobald die Einlage zur Abholung bereitsteht. Weitere automatische Benachrichtigungen werden folgen und können später in den Einstellungen ein- oder ausgeschaltet werden.'
            },
            {
                question: 'Kann die Lieferadresse des Kunden geändert werden?',
                answer: 'Solange die Bestellung nicht versendet wurde, kann die Adresse im Dashboard angepasst werden.'
            },
            {
                question: 'Kann ich als Partner sehen, welcher Mitarbeiter die Einlage fertigt?',
                answer: 'Ja. In der Auftragstabelle sieht man genau, wer den Kunden gemessen hat, wer die Versorgung erstellt hat, zu welcher Zeit das passiert ist und wann der Auftrag in Arbeit gesetzt wurde.'
            },
            {
                question: 'Kann der Kunde seine Bestellung selbst im System sehen?',
                answer: 'Ja. In der App sieht der Kunde seine Bestellung inklusive Status, Abholhinweis und allen relevanten Informationen, sodass nicht jeder kleine Rückfrage-Anruf bei euch landet.'
            }
        ]
    },
    lager: {
        title: 'Lager',
        items: [
            {
                question: 'Werden Kunden über den Bestellstatus informiert?',
                answer: 'Ja. Standardmäßig erhält der Kunde eine Auftragsbestätigung sowie eine Nachricht, sobald die Einlage zur Abholung bereitsteht. Weitere automatische Benachrichtigungen werden folgen und können später in den Einstellungen ein- oder ausgeschaltet werden.'
            },
            {
                question: 'Kann die Lieferadresse des Kunden geändert werden?',
                answer: 'Solange die Bestellung nicht versendet wurde, kann die Adresse im Dashboard angepasst werden.'
            },
            {
                question: 'Wie sehe ich Lagerbewegungen?',
                answer: 'Jede Bewegung wird automatisch protokolliert. In der Artikelansicht finden Sie eine komplette Historie aller Zu- und Abgänge.'
            },
            {
                question: 'Kann ich eigene Lagerorte anlegen?',
                answer: 'Aktuell ist das System auf ein Hauptlager ausgelegt. Ein zweiter Lagerplatz funktioniert in vielen Fällen bereits, wird aber gerade vollständig ausgebaut.'
            },
            {
                question: 'Wie korrigiere ich fehlerhafte Lagerbuchungen?',
                answer: 'Über „Bestand anpassen" lassen sich Mengen manuell korrigieren. Jede Änderung wird protokolliert, damit die gesamte Bewegungshistorie nachvollziehbar bleibt.'
            },
            {
                question: 'Kann ich als Partner sehen, welcher Mitarbeiter die Einlage fertigt?',
                answer: 'Ja. In der Auftragstabelle sieht man genau, wer den Kunden gemessen hat, wer die Versorgung erstellt hat, zu welcher Zeit das passiert ist und wann der Auftrag in Arbeit gesetzt wurde.'
            },
            {
                question: 'Kann der Kunde seine Bestellung selbst im System sehen?',
                answer: 'Ja. In der App sieht der Kunde seine Bestellung inklusive Status, Abholhinweis und allen relevanten Informationen, sodass nicht jeder kleine Rückfrage-Anruf bei euch landet.'
            }
        ]
    },
    bestellungen: {
        title: 'FeetF1rst-Bestellungen',
        subsections: [
            {
                title: '1. Bearbeitung & Auftragsstatus',
                items: [
                    {
                        question: 'Wie lange dauert die Bearbeitung?',
                        answer: '– Probeschuhe/Halbproben: 10–14 Werktage\n– Maßschäfte: 10 Werktage\n– Komplettfertigung (Schaft + Boden): 15 Werktage\n\nDas sind Maximalzeiten. Danach geht\'s direkt in den Versand. Bitte erst nach Ablauf nachfragen; bei dringenden Fällen: info@feetf1rst.com'
                    },
                    {
                        question: 'Warum wird meine Bestellung nicht angezeigt?',
                        answer: 'Sie erscheint auf der FeetF1rst Balance Seite. Wenn nicht: neu laden. Wenn immer noch nicht: Bestellung war unvollständig ⇒ neu anlegen.'
                    }
                ]
            },
            {
                title: '2. Änderungen, Storno & Korrekturen',
                items: [
                    {
                        question: 'Wie stornieren oder ändern ich eine Bestellung?',
                        answer: 'Alles möglich, solange der Status nicht „In Produktion" zeigt. Danach ist der Zug abgefahren.'
                    },
                    {
                        question: 'Ich habe einen falschen Scan hochgeladen – was tun?',
                        answer: 'Auftrag stornieren und korrekt neu anlegen. Wenn schon in Bearbeitung: sofort Support.'
                    },
                    {
                        question: 'Kann die Passform des Probeschuhs nachträglich verändert werden?',
                        answer: 'Ja. Leisten lassen sich jederzeit nach der Anprobe anpassen (Formular). Bei großen Bettungsfehlern fertigen wir eine neue Bettung.'
                    }
                ]
            },
            {
                title: '3. Funktionen & Schaftbestellung',
                items: [
                    {
                        question: 'Kann ich einen Auftrag duplizieren?',
                        answer: 'Aktuell nicht. Feedback willkommen.'
                    },
                    {
                        question: 'Kann ich eine frühere Konfiguration erneut verwenden?',
                        answer: 'Ja. Im Kundenbereich unter Maßschuhauftrag duplizierbar. Alle Parameter bleiben identisch.'
                    },
                    {
                        question: 'Können Partner eigene Schaftmodelle anlegen?',
                        answer: 'Diese Funktion kommt bald.'
                    },
                    {
                        question: 'Muss ich das Leder selbst bereitstellen?',
                        answer: 'Nein, wir stellen das Leder. Optional kann eigenes geliefert werden.'
                    },
                    {
                        question: 'Der Leisten-Import funktioniert nicht – was tun?',
                        answer: 'Verbindung prüfen und erneut probieren. Wenn\'s hartnäckig bleibt: Fehlermeldung + Auftragsnummer + Scans an info@feetf1rst.com senden.'
                    },
                    {
                        question: 'Sind Maßschäfte mit 3D-Scans verknüpft?',
                        answer: 'Ja. Der Schaft basiert direkt auf dem individuellen Leisten-Scan.'
                    }
                ]
            },
            {
                title: '4. Rückgabe & Reklamation',
                items: [
                    {
                        question: 'Wer trägt die Versandkosten bei einer Rückgabe?',
                        answer: 'Der Kunde. Bei Produktionsfehlern zahlen wir Rück- und Neuversand.'
                    },
                    {
                        question: 'Gibt es Rückerstattung bei Unzufriedenheit?',
                        answer: 'Nein. Individuelle Produkte sind vom Widerruf ausgeschlossen. Erstattung nur bei Produktionsfehlern oder Fehlern unsererseits.'
                    }
                ]
            }
        ]
    },
    sonstige: {
        title: 'Sonstige',
        items: [
            {
                question: 'Kann ich mehrere Geräte gleichzeitig verwenden?',
                answer: 'Ja. Die Software unterstützt parallele Sitzungen auf mehreren Geräten, solange Sie im selben Partnerkonto angemeldet sind.'
            },
            {
                question: 'Werden meine Einstellungen automatisch gespeichert?',
                answer: 'Ja. Alle Anpassungen wie Filter, Sichtbarkeiten oder aktive Module werden automatisch gespeichert und beim nächsten Login wiederhergestellt.'
            },
            {
                question: 'Kann ich Benutzerrechte individuell einschränken?',
                answer: 'Ja. Rollen und Berechtigungen können pro Mitarbeiter definiert werden, damit nur relevante Bereiche zugänglich sind.'
            },
            {
                question: 'Ist die Software mit anderen Scannern außer FeetF1rst kompatibel?',
                answer: 'Nicht jeder Scanner ist kompatibel. Die Unterstützung hängt vom jeweiligen Modell und dessen Exportformaten ab. Senden Sie uns bitte ein Foto oder die Modellbezeichnung, damit wir die Kompatibilität prüfen können.'
            },
            {
                question: 'Gibt es auch persönliche Einweisungen für Praxen oder Mitarbeitende?',
                answer: 'Ja. Auf Anfrage bieten wir individuelle Online-Schulungen sowie persönliche Vor-Ort-Einweisungen an. Schreiben Sie bei Interesse bitte an info@feetf1rst.com'
            }
        ]
    }
}

export default function FAQ() {
    const [openDialog, setOpenDialog] = useState(false)

    const renderFAQItem = (item: FAQItem, index: number, sectionKey: string) => (
        <AccordionItem key={index} value={`${sectionKey}-item-${index}`}>
            <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline">
                {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 whitespace-pre-line">
                {item.answer}
            </AccordionContent>
        </AccordionItem>
    )

    const renderSectionWithItems = (section: { title: string; items: FAQItem[] }, key: string) => (
        <div key={key} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={key} className="border-0">
                    <AccordionTrigger className="bg-gray-800 text-white p-4 font-medium hover:no-underline data-[state=open]:bg-gray-700">
                        <span className="text-white">{section.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                        <Accordion type="single" collapsible className="w-full">
                            {section.items.map((item, index) => renderFAQItem(item, index, key))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )

    const renderSectionWithSubsections = (section: { title: string; subsections: FAQSubSection[] }, key: string) => (
        <div key={key} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={key} className="border-0">
                    <AccordionTrigger className="bg-gray-800 text-white p-4 font-medium hover:no-underline data-[state=open]:bg-gray-700">
                        <span className="text-white">{section.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                        <Accordion type="single" collapsible className="w-full">
                            {section.subsections.map((subsection, subIndex) => (
                                <AccordionItem key={subIndex} value={`${key}-subsection-${subIndex}`}>
                                    <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline">
                                        {subsection.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Accordion type="single" collapsible className="w-full mt-2">
                                            {subsection.items.map((item, itemIndex) => 
                                                renderFAQItem(item, itemIndex, `${key}-sub-${subIndex}`)
                                            )}
                                        </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">FAQ & HILFE</h2>
                <p className="text-sm text-gray-600">
                    Finden Sie Antworten auf häufige Fragen - schnell & einfach.
                </p>
            </div>

            {/* Shoe Finder - Clickable item that opens dialog */}
            <div 
                className="border border-gray-300 rounded-lg overflow-hidden bg-white cursor-pointer"
                onClick={() => setOpenDialog(true)}
            >
                <div className="bg-gray-800 text-white p-4 font-medium flex items-center justify-between hover:bg-gray-700 transition-colors">
                    <span>{faqData.shoeFinder.title}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* Dialog for Shoe Finder */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">
                            {faqData.shoeFinder.dialogContent.title}
                        </DialogTitle>
                        <DialogDescription className="text-center pt-4 text-base">
                            {faqData.shoeFinder.dialogContent.description}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Other FAQ Sections */}
            {renderSectionWithItems(faqData.auftragserstellung, 'auftragserstellung')}
            {renderSectionWithItems(faqData.lager, 'lager')}
            {renderSectionWithSubsections(faqData.bestellungen, 'bestellungen')}
            {renderSectionWithItems(faqData.sonstige, 'sonstige')}
        </div>
    )
}
