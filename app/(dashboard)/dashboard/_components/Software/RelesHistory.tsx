'use client'
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion'

interface ReleaseHistoryItem {
    version: string
    date: string
    details?: {
        newFeatures?: string[]
        improvements?: string[]
        bugfixes?: string[]
    }
}

const releaseHistory: ReleaseHistoryItem[] = [
    {
        version: '1.2',
        date: '12. Februar 2024',
        details: {
            newFeatures: [
                'Neue Dashboard-Übersicht',
                'Verbesserte Scan-Funktionalität'
            ],
            improvements: [
                'Performance-Optimierungen',
                'UI-Verbesserungen'
            ],
            bugfixes: [
                'Behoben: Fehler bei der Datenübertragung',
                'Behoben: Anzeigeprobleme auf mobilen Geräten'
            ]
        }
    }
]

export default function RelesHistory() {
    return (
        <div className="w-full space-y-4">
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Release-Historie
            </h2>

            {/* Release History List */}
            <div className="space-y-3">
                <Accordion type="single" collapsible className="w-full space-y-3">
                    {releaseHistory.map((release, index) => (
                        <AccordionItem
                            key={index}
                            value={`version-${release.version}`}
                            className="border-0"
                        >
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between w-full">
                                        {/* Left: Version and Date */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <div>
                                                <h3 className="text-base md:text-lg font-bold text-gray-800 text-left">
                                                    Version {release.version}
                                                </h3>
                                                <p className="text-sm text-gray-500 text-left mt-0.5">
                                                    {release.date}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Right: Chevron Icon - default from AccordionTrigger will appear here */}
                                    </div>
                                </AccordionTrigger>

                                {/* Accordion Content */}
                                {release.details && (
                                    <AccordionContent className="px-4 pb-4 pt-0">
                                        <div className="pt-4 border-t border-gray-200 space-y-4">
                                            {release.details.newFeatures && release.details.newFeatures.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                        Neue Funktionen
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {release.details.newFeatures.map((feature, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="text-sm text-gray-600 flex items-start gap-2"
                                                            >
                                                                <span className="text-gray-400 mt-1.5 shrink-0">•</span>
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {release.details.improvements && release.details.improvements.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                        Verbesserungen
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {release.details.improvements.map((improvement, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="text-sm text-gray-600 flex items-start gap-2"
                                                            >
                                                                <span className="text-gray-400 mt-1.5 shrink-0">•</span>
                                                                <span>{improvement}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {release.details.bugfixes && release.details.bugfixes.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                        Bugfixes
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {release.details.bugfixes.map((bugfix, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="text-sm text-gray-600 flex items-start gap-2"
                                                            >
                                                                <span className="text-gray-400 mt-1.5 shrink-0">•</span>
                                                                <span>{bugfix}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                )}
                            </div>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    )
}
