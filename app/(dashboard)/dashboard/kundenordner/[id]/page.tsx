'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileText, FolderOpen } from 'lucide-react'

import TopNavigation from '../../_components/Kundenordner/TopNavigation'

/**
 * Übersicht — base Kundenordner route.
 * Dokumente live under `/dashboard/kundenordner/[id]/dokumente`.
 */
export default function KundenordnerUebersichtPage() {
    const params = useParams()
    const router = useRouter()
    const customerId = String(params.id)

    return (
        <div className="mb-20 w-full max-w-full space-y-8 p-4">
            <TopNavigation />

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Übersicht</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Schnellzugriff auf Bereiche dieses Kundenordners.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => router.push(`/dashboard/kundenordner/${customerId}/dokumente`)}
                    className="flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-[#61A07B]/50 hover:shadow-md"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#61A07B]/10 text-[#61A07B]">
                        <FileText className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                        <span className="text-lg font-semibold text-gray-900">Dokumente</span>
                        <p className="mt-1 text-sm text-gray-500">
                            Dateien anzeigen, hochladen und verwalten.
                        </p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => router.push(`/dashboard/kundenordner/${customerId}/rezepte`)}
                    className="flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-[#61A07B]/50 hover:shadow-md"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#61A07B]/10 text-[#61A07B]">
                        <FolderOpen className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                        <span className="text-lg font-semibold text-gray-900">Rezepte</span>
                        <p className="mt-1 text-sm text-gray-500">
                            Rezepte einsehen und bearbeiten.
                        </p>
                    </div>
                </button>
            </div>
        </div>
    )
}
