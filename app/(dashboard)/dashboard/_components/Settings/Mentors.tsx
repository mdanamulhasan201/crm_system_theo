'use client'

import { Mail, Phone } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getMyMentor } from '@/apis/mentorsApis'

interface Mentor {
    id: string
    name: string
    image: string | null
    position: string
    email: string
    timeline: string
    phone: string
}

export default function Mentors() {
    const [mentor, setMentor] = useState<Mentor | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        getMyMentor()
            .then((res: any) => {
                if (cancelled) return
                const data = res?.data?.mentor ?? res?.mentor
                if (data) {
                    setMentor({
                        id: data.id ?? '',
                        name: data.name ?? '',
                        image: data.image ?? null,
                        position: data.position ?? '',
                        email: data.email ?? '',
                        timeline: data.timeline ?? '',
                        phone: data.phone ?? '',
                    })
                } else {
                    setMentor(null)
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.message ?? 'Mentor konnte nicht geladen werden.')
                    setMentor(null)
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [])

    const initials = mentor?.name
        ? mentor.name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
        : '?'

    if (loading) {
        return (
            <div className="block mb-8 w-full">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-36 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !mentor) {
        return (
            <div className="block mb-8 w-full">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <p className="text-sm text-gray-500">
                        {error ?? 'Kein Ansprechpartner hinterlegt.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="block mb-8 w-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                {/* Header Section */}
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        Ihr Ansprechpartner
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Ihr direkter Kontakt für alle Fragen rund um FeetF1rst
                    </p>
                </div>

                {/* Main Content Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    {/* Left Section - Contact Person */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        {/* Mentor Avatar - image or initials */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex-shrink-0 border-2 border-[#61A07B] overflow-hidden ">
                            {mentor.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={mentor.image}
                                    alt={mentor.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center text-lg sm:text-xl font-semibold text-[#61A07B]">
                                    {initials}
                                </span>
                            )}
                        </div>

                        {/* Mentor Information */}
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                                {mentor.name}
                            </h4>
                            {mentor.position && (
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {mentor.position}
                                </p>
                            )}
                            {mentor.timeline && (
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {mentor.timeline}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Contact Details */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:ml-6 flex-shrink-0">
                        {mentor.phone && (
                            <a
                                href={`tel:${mentor.phone.replace(/\s/g, '')}`}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                            >
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold truncate">{mentor.phone}</span>
                            </a>
                        )}
                        {mentor.email && (
                            <a
                                href={`mailto:${mentor.email}`}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border border-[#61A07B] text-[#61A07B] rounded-lg hover:bg-green-50 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                            >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">{mentor.email}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}