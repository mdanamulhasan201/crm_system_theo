'use client'
import React, { useState, useEffect } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion'
import VersionPage from './Version'
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

export default function RelesHistory() {
    const [releaseHistory, setReleaseHistory] = useState<SoftwareVersion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReleaseHistory = async () => {
            try {
                setLoading(true)
                const response = await getAllSoftwareManagement(1, 100)
                if (response.success && response.data) {
                    // Sort by releaseDate descending (newest first)
                    const sorted = [...response.data].sort((a, b) => {
                        const dateA = new Date(a.releaseDate).getTime()
                        const dateB = new Date(b.releaseDate).getTime()
                        return dateB - dateA
                    })
                    setReleaseHistory(sorted)
                }
            } catch (error) {
                console.error('Error fetching release history:', error)
                toast.error('Fehler beim Laden der Release-Historie')
            } finally {
                setLoading(false)
            }
        }

        fetchReleaseHistory()
    }, [])

    const getDescriptionByTitle = (description: DescriptionItem[], title: string): string[] => {
        const item = description.find(d => d.title === title)
        return item?.desc || []
    }

    return (
        <div className="w-full space-y-4">
            <VersionPage />
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Release-Historie
            </h2>

            {/* Release History List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Lade Release-Historie...</p>
                    </div>
                </div>
            ) : releaseHistory.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-600">Keine Release-Historie verfügbar</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {releaseHistory.map((release) => {
                            const newFeatures = getDescriptionByTitle(release.description, 'Neue Funktionen')
                            const improvements = getDescriptionByTitle(release.description, 'Verbesserungen')
                            const bugfixes = getDescriptionByTitle(release.description, 'Bugfixes')

                            return (
                                <AccordionItem
                                    key={release.id}
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
                                                            {formatDate(release.releaseDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Right: Chevron Icon - default from AccordionTrigger will appear here */}
                                            </div>
                                        </AccordionTrigger>

                                        {/* Accordion Content */}
                                        {(newFeatures.length > 0 || improvements.length > 0 || bugfixes.length > 0) && (
                                            <AccordionContent className="px-4 pb-4 pt-0">
                                                <div className="pt-4 border-t border-gray-200 space-y-4">
                                                    {newFeatures.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                                Neue Funktionen
                                                            </h4>
                                                            <ul className="space-y-1">
                                                                {newFeatures.map((feature, idx) => (
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

                                                    {improvements.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                                Verbesserungen
                                                            </h4>
                                                            <ul className="space-y-1">
                                                                {improvements.map((improvement, idx) => (
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

                                                    {bugfixes.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                                Bugfixes
                                                            </h4>
                                                            <ul className="space-y-1">
                                                                {bugfixes.map((bugfix, idx) => (
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
                            )
                        })}
                    </Accordion>
                </div>
            )}
        </div>
    )
}
