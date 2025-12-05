'use client'

import { Document } from '../../../../../types/types'
import DocumentCard from './DocumentCard'

interface DocumentGridProps {
    documents: Document[]
    onView: (doc: Document) => void
    onDownload: (doc: Document) => void
    onDelete: (doc: Document) => void
    searchQuery: string
}

export default function DocumentGrid({
    documents,
    onView,
    onDownload,
    onDelete,
    searchQuery
}: DocumentGridProps) {
    if (documents.length > 0) {
        return (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
        )
    }

    return (
        <div className='text-center py-12 text-gray-500'>
            {searchQuery ? 'No documents found matching your search.' : 'No documents available.'}
        </div>
    )
}
