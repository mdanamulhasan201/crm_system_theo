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
    const [loadingMore, setLoadingMore] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const itemsPerPage = 3

    useEffect(() => {
        const fetchReleaseHistory = async () => {
            try {
                setLoading(true)
                const response = await getAllSoftwareManagement(1, itemsPerPage)
                if (response.success && response.data) {
                    // Sort by releaseDate descending (newest first)
                    const sorted = [...response.data].sort((a, b) => {
                        const dateA = new Date(a.releaseDate).getTime()
                        const dateB = new Date(b.releaseDate).getTime()
                        return dateB - dateA
                    })
                    setReleaseHistory(sorted)
                    // Check if there's more data
                    setHasMore(response.data.length === itemsPerPage)
                    setCurrentPage(1)
                }
            } catch (error) {
                console.error('Error fetching release history:', error)
                // toast.error('Fehler beim Laden der Release-Historie')
            } finally {
                setLoading(false)
            }
        }

        fetchReleaseHistory()
    }, [])

    const loadMoreReleases = async () => {
        if (loadingMore || !hasMore) return

        try {
            setLoadingMore(true)
            const nextPage = currentPage + 1
            const response = await getAllSoftwareManagement(nextPage, itemsPerPage)
            
            if (response.success && response.data) {
                // Sort by releaseDate descending (newest first)
                const sorted = [...response.data].sort((a, b) => {
                    const dateA = new Date(a.releaseDate).getTime()
                    const dateB = new Date(b.releaseDate).getTime()
                    return dateB - dateA
                })
                
                // Append new data to existing data
                setReleaseHistory(prev => {
                    // Combine and remove duplicates based on id
                    const combined = [...prev, ...sorted]
                    const unique = combined.filter((item, index, self) => 
                        index === self.findIndex(t => t.id === item.id)
                    )
                    return unique.sort((a, b) => {
                        const dateA = new Date(a.releaseDate).getTime()
                        const dateB = new Date(b.releaseDate).getTime()
                        return dateB - dateA
                    })
                })
                
                // Check if there's more data
                setHasMore(response.data.length === itemsPerPage)
                setCurrentPage(nextPage)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error loading more releases:', error)
            // toast.error('Fehler beim Laden weiterer Releases')
        } finally {
            setLoadingMore(false)
        }
    }

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
                                                            <div className="text-sm text-gray-600 space-y-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1 [&_p]:mb-2">
                                                                {newFeatures.map((feature, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1 [&_p]:mb-2"
                                                                        dangerouslySetInnerHTML={{ __html: feature }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {improvements.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                                Verbesserungen
                                                            </h4>
                                                            <div className="text-sm text-gray-600 space-y-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1 [&_p]:mb-2">
                                                                {improvements.map((improvement, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1 [&_p]:mb-2"
                                                                        dangerouslySetInnerHTML={{ __html: improvement }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {bugfixes.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-gray-800 mb-2">
                                                                Bugfixes
                                                            </h4>
                                                            <div className="text-sm text-gray-600 space-y-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1 [&_p]:mb-2">
                                                                {bugfixes.map((bugfix, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1 [&_p]:mb-2"
                                                                        dangerouslySetInnerHTML={{ __html: bugfix }}
                                                                    />
                                                                ))}
                                                            </div>
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
                    
                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center pt-6">
                            <button
                                onClick={loadMoreReleases}
                                disabled={loadingMore}
                                className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Lade...
                                    </span>
                                ) : (
                                    'Vollständige Release Notes anzeigen'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
