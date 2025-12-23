'use client'
import React, { useState, useEffect } from 'react'
import { Sparkles, Wrench, Bug } from 'lucide-react'
import { getAllSoftwareManagement } from '@/apis/SoftwareManagementApis'
import toast from 'react-hot-toast'

interface DescriptionItem {
    title: string
    desc: string[]
}

interface SoftwareVersion {
    id: string
    version: string
    releaseDate: string
    title: string
    description: DescriptionItem[]
    isNewest: boolean
    createdAt: string
    updatedAt: string
}

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        const months = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ]
        const day = String(date.getDate()).padStart(2, '0')
        const month = months[date.getMonth()]
        const year = date.getFullYear()
        return `${day}. ${month} ${year}`
    } catch {
        return dateString
    }
}

export default function VersionPage() {
    const [newestVersion, setNewestVersion] = useState<SoftwareVersion | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNewestVersion = async () => {
            try {
                setLoading(true)
                const response = await getAllSoftwareManagement(1, 100)
                if (response.success && response.data) {
                    // Find the version with isNewest: true
                    const newest = response.data.find((version: SoftwareVersion) => version.isNewest === true)
                    if (newest) {
                        setNewestVersion(newest)
                    }
                }
            } catch (error) {
                console.error('Error fetching newest version:', error)
                toast.error('Fehler beim Laden der Version')
            } finally {
                setLoading(false)
            }
        }

        fetchNewestVersion()
    }, [])

    if (loading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Lade Version...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!newestVersion) {
        return (
            <div className="w-full space-y-6">
                <div className="text-center py-10">
                    <p className="text-gray-600">Keine Version verfügbar</p>
                </div>
            </div>
        )
    }

    // Extract description items by title
    const getDescriptionByTitle = (title: string): string[] => {
        const item = newestVersion.description.find(d => d.title === title)
        return item?.desc || []
    }

    const newFeatures = getDescriptionByTitle('Neue Funktionen')
    const improvements = getDescriptionByTitle('Verbesserungen')
    const bugfixes = getDescriptionByTitle('Bugfixes')

    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    NEUSTE VERSION: {newestVersion.title.toUpperCase()}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    Immer auf dem neusten Stand - alle Verbesserungen im Überblick.
                </p>
            </div>

            {/* Version Cards */}
            <div className="space-y-6">
                <div className="bg-gray-100 rounded-lg p-4 md:p-6 lg:p-8 w-full">
                    {/* Version Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                                Version {newestVersion.version}
                            </h2>
                            <p className="text-sm md:text-base text-gray-600">
                                {formatDate(newestVersion.releaseDate)}
                            </p>
                        </div>
                        {newestVersion.isNewest && (
                            <span className="inline-flex items-center justify-center bg-green-500 text-white text-xs md:text-sm font-medium px-3 py-1 rounded-full w-fit">
                                Aktuell
                            </span>
                        )}
                    </div>

                    {/* Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-6">
                        {/* New Features */}
                        {newFeatures.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-green-500 shrink-0" />
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                                        Neue Funktionen
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {newFeatures.map((feature, idx) => (
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
                        )}

                        {/* Improvements */}
                        {improvements.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wrench className="w-5 h-5 text-blue-500 shrink-0" />
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                                        Verbesserungen
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {improvements.map((improvement, idx) => (
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
                        )}

                        {/* Bugfixes */}
                        {bugfixes.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Bug className="w-5 h-5 text-green-500 shrink-0" />
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                                        Bugfixes
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {bugfixes.map((bugfix, idx) => (
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
                        )}
                    </div>

                    {/* Full Release Notes Link */}
                    <div className="text-center pt-4 border-t border-gray-300">
                        <button className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                            Vollständige Release Notes anzeigen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
