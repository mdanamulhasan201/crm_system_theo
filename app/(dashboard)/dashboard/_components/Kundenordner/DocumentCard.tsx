'use client'

import { Eye, Download, Trash2, FileText } from 'lucide-react'
import { Document, documentTypeLabels } from '../../../../../types/types'

interface DocumentCardProps {
    doc: Document
    onView: (doc: Document) => void
    onDownload: (doc: Document) => void
    onDelete: (doc: Document) => void
}

export default function DocumentCard({ doc, onView, onDownload, onDelete }: DocumentCardProps) {
    return (
        <div className='border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition-shadow'>
            <div className='flex items-start gap-3 mb-3'>
                <FileText className={`w-8 h-8 ${doc.iconColor}`} />
                <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-sm truncate'>{doc.title}</h3>
                    <p className='text-xs text-gray-500 mt-1'>{doc.size} • {doc.date}</p>
                </div>
            </div>
            <div className='flex items-center justify-between mt-4'>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.tagColor}`}>
                    {documentTypeLabels[doc.type]}
                </span>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => onView(doc)}
                        className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                        title='Ansehen'
                    >
                        <Eye className='w-4 h-4 text-gray-600' />
                    </button>
                    <button
                        onClick={() => onDownload(doc)}
                        className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                        title='Download'
                    >
                        <Download className='w-4 h-4 text-gray-600' />
                    </button>
                    <button
                        onClick={() => onDelete(doc)}
                        className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                        title='Löschen'
                    >
                        <Trash2 className='w-4 h-4 text-gray-600' />
                    </button>
                </div>
            </div>
        </div>
    )
}
