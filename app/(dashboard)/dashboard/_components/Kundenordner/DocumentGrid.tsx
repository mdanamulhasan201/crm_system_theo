'use client'

import { Document } from '@/types/types'
import DocumentCard from './DocumentCard'

interface DocumentGridProps {
    documents: Document[]
    onView: (doc: Document) => void
    onDownload: (doc: Document) => void
    onDelete: (doc: Document) => void
    searchQuery: string
    /** Total for header, e.g. "11 Dokumente" */
    totalLabelCount?: number
}

export default function DocumentGrid({
    documents,
    onView,
    onDownload,
    onDelete,
    searchQuery,
    totalLabelCount,
}: DocumentGridProps) {
    if (documents.length > 0) {
        const headerCount = totalLabelCount ?? documents.length

        return (
            <div className="flex flex-col gap-4">
                <p className="text-sm font-medium text-gray-500">{headerCount} Dokumente</p>
                <div className="flex flex-col gap-3">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={`${doc.id}-${doc.fieldName}`}
                            doc={doc}
                            onView={onView}
                            onDownload={onDownload}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="py-12 text-center text-gray-500">
            {searchQuery ? 'Keine Dokumente gefunden.' : 'Keine Dokumente vorhanden.'}
        </div>
    )
}
