'use client'

import { Eye, Download, Trash2, FileText } from 'lucide-react'
import { Document, DocumentType, documentTypeLabels } from '@/types/types'
import { cn } from '@/lib/utils'

function badgeStyle(type: DocumentType, fallbackTagClass: string): string {
    switch (type) {
        case 'pdf':
            return 'bg-red-50 text-red-700 ring-1 ring-red-100/80'
        case 'jpg':
        case 'webp':
        case 'image':
            return 'bg-orange-50 text-orange-700 ring-1 ring-orange-100/80'
        case 'stl':
            return 'bg-purple-50 text-purple-700 ring-1 ring-purple-100/80'
        default:
            return fallbackTagClass
    }
}

interface DocumentCardProps {
    doc: Document
    onView: (doc: Document) => void
    onDownload: (doc: Document) => void
    onDelete: (doc: Document) => void
}

export default function DocumentCard({ doc, onView, onDownload, onDelete }: DocumentCardProps) {
    const badgeClass = badgeStyle(doc.type, doc.tagColor)

    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
                'transition-shadow hover:shadow-sm'
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-6 w-6 text-gray-400" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{doc.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {doc.size} · {doc.date}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-1 border-t border-gray-100 pt-2 sm:border-t-0 sm:pt-0 sm:justify-end sm:gap-2">
                <button
                    type="button"
                    onClick={() => onView(doc)}
                    className="rounded-md cursor-pointer p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                    title="Ansehen"
                >
                    <Eye className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onDownload(doc)}
                    className="rounded-md cursor-pointer p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                    title="Download"
                >
                    <Download className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(doc)}
                    className="rounded-md cursor-pointer p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-600"
                    title="Löschen"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
                <span
                    className={cn(
                        'ml-1 inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                        badgeClass
                    )}
                >
                    {documentTypeLabels[doc.type]}
                </span>
            </div>
        </div>
    )
}
