'use client'
import React from 'react'
import { Sparkles, Wrench, Bug } from 'lucide-react'

interface ReleaseNote {
    version: string
    date: string
    isCurrent: boolean
    newFeatures: string[]
    improvements: string[]
    bugfixes: string[]
}

const releaseNotes: ReleaseNote[] = [
    {
        version: '1.3',
        date: '15. März 2024',
        isCurrent: true,
        newFeatures: [
            'Neuer AI-gestützter Shoe Finder mit verbesserter Passform-Analyse',
            'Erweiterte 3D-Visualisierung für Einlagen'
        ],
        improvements: [
            '50% schnellere Ladezeiten bei großen Kundenkarteien',
            'Verbesserte Benutzeroberfläche für mobile Geräte'
        ],
        bugfixes: [
            'Behoben: Absturz beim Import großer CSV-Dateien',
            'Behoben: Falsche Berechnungen bei speziellen Einlagen-Materialien'
        ]
    }
]

export default function VersionPage() {
    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    NEUSTE VERSION: FEETF1RST SOFTWARE 1.3
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    Immer auf dem neusten Stand - alle Verbesserungen im Überblick.
                </p>
            </div>

            {/* Version Cards */}
            <div className="space-y-6">
                {releaseNotes.map((release, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 rounded-lg p-4 md:p-6 lg:p-8 w-full"
                    >
                        {/* Version Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                                    Version {release.version}
                                </h2>
                                <p className="text-sm md:text-base text-gray-600">
                                    {release.date}
                                </p>
                            </div>
                            {release.isCurrent && (
                                <span className="inline-flex items-center justify-center bg-green-500 text-white text-xs md:text-sm font-medium px-3 py-1 rounded-full w-fit">
                                    Aktuell
                                </span>
                            )}
                        </div>

                        {/* Three Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-6">
                            {/* New Features */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-green-500 shrink-0" />
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                                        Neue Funktionen
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {release.newFeatures.map((feature, idx) => (
                                        <li
                                            key={idx}
                                            className="text-xs md:text-sm text-gray-700 flex items-start gap-2"
                                        >
                                            <span className="text-gray-500 mt-1.5 shrink-0">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wrench className="w-5 h-5 text-blue-500 shrink-0" />
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                                        Verbesserungen
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {release.improvements.map((improvement, idx) => (
                                        <li
                                            key={idx}
                                            className="text-xs md:text-sm text-gray-700 flex items-start gap-2"
                                        >
                                            <span className="text-gray-500 mt-1.5 shrink-0">•</span>
                                            <span>{improvement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bugfixes */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Bug className="w-5 h-5 text-green-500 shrink-0" />
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                                        Bugfixes
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {release.bugfixes.map((bugfix, idx) => (
                                        <li
                                            key={idx}
                                            className="text-xs md:text-sm text-gray-700 flex items-start gap-2"
                                        >
                                            <span className="text-gray-500 mt-1.5 shrink-0">•</span>
                                            <span>{bugfix}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Full Release Notes Link */}
                        <div className="text-center pt-4 border-t border-gray-300">
                            <button className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                                Vollständige Release Notes anzeigen
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Section */}
            {/* <div className="mt-8">
                
                <p className="text-sm md:text-base text-gray-600">
                    Weitere Versionen und Release Notes werden hier angezeigt.
                </p>
            </div> */}
        </div>
    )
}
