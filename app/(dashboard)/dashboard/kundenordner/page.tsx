'use client'
import React, { useState } from 'react'
import { Search, Upload, Download, Eye, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type DocumentType = 'all' | 'rezept' | 'kostenvoranschlag' | 'genehmigung' | 'konformität' | 'rechnung' | 'zahlungsbeleg'

interface Document {
    id: string
    title: string
    size: string
    date: string
    type: DocumentType
    iconColor: string
    tagColor: string
}

const demoDocuments: Document[] = [
    {
        id: '1',
        title: 'Rezept_MaxMustermann_2025-10-0...',
        size: '245 KB',
        date: '1.10.2025',
        type: 'rezept',
        iconColor: 'text-blue-600',
        tagColor: 'bg-blue-100 text-blue-700'
    },
    {
        id: '2',
        title: 'KV-2025-001_Kostvoranschlag.pdf',
        size: '189 KB',
        date: '8.10.2025',
        type: 'kostenvoranschlag',
        iconColor: 'text-purple-600',
        tagColor: 'bg-purple-100 text-purple-700'
    },
    {
        id: '3',
        title: 'Genehmigung',
        size: '156 KB',
        date: '9.10.20',
        type: 'genehmigung',
        iconColor: 'text-green-600',
        tagColor: 'bg-green-100 text-green-700'
    },
    {
        id: '4',
        title: 'Konformitaetserklaeung_Einlagen.pdf',
        size: '98 KB',
        date: '8.10.2025',
        type: 'konformität',
        iconColor: 'text-cyan-600',
        tagColor: 'bg-cyan-100 text-cyan-700'
    },
    {
        id: '5',
        title: 'Rechnung_2025-001.pdf',
        size: '134 KB',
        date: '10.10.2025',
        type: 'rechnung',
        iconColor: 'text-orange-600',
        tagColor: 'bg-orange-100 text-orange-700'
    }
]

const documentTypeLabels: Record<DocumentType, string> = {
    all: 'Alle',
    rezept: 'Rezept',
    kostenvoranschlag: 'Kostenvoranschlag',
    genehmigung: 'Genehmigung',
    konformität: 'Konformität',
    rechnung: 'Rechnung',
    zahlungsbeleg: 'Zahlungsbeleg'
}

export default function KundenordnerPage() {
    const [activeFilter, setActiveFilter] = useState<DocumentType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const getDocumentCount = (type: DocumentType) => {
        if (type === 'all') return demoDocuments.length
        return demoDocuments.filter(doc => doc.type === type).length
    }

    const filteredDocuments = activeFilter === 'all'
        ? demoDocuments.filter(doc => 
            searchQuery === '' || doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : demoDocuments.filter(doc => 
            doc.type === activeFilter && 
            (searchQuery === '' || doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
        )

    const totalSize = 822 // Total size in KB as shown in design

    return (
        <div className='mb-20 p-4 space-y-6'>
            {/* Top Navigation */}
            <div className='flex items-center gap-6 border-b pb-4'>
                <button className='text-lg font-medium border-b-2 border-blue-600 pb-2 px-2'>
                    Übersicht
                </button>
                <button className='text-lg font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                    Rezept scannen
                </button>
                <button className='text-lg font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                    KV erstellen
                </button>
                <button className='text-lg font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                    Versenden
                </button>
                <div className='flex-1' />
                <button className='text-lg font-medium border-b-2 border-blue-600 pb-2 px-2'>
                    Dokumente
                </button>
            </div>

            {/* Search and Action Bar */}
            <div className='flex items-center gap-4'>
                <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                        type='text'
                        placeholder='Dokumente suchen...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10 w-full'
                    />
                </div>
                <div className='w-48 h-9 bg-gray-200 rounded-md' />
                <Button variant='outline' className='flex items-center gap-2'>
                    <Upload className='w-4 h-4' />
                    Hochladen
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                    <Download className='w-4 h-4' />
                    Alle exportieren
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className='flex items-center gap-2 overflow-x-auto pb-2'>
                {(['all', 'rezept', 'kostenvoranschlag', 'genehmigung', 'konformität', 'rechnung', 'zahlungsbeleg'] as DocumentType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                            activeFilter === type
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {documentTypeLabels[type]} ({getDocumentCount(type)})
                    </button>
                ))}
            </div>

            {/* Document Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredDocuments.map((doc) => (
                    <div
                        key={doc.id}
                        className='border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition-shadow'
                    >
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
                                <button className='p-1.5 hover:bg-gray-100 rounded transition-colors' title='Ansehen'>
                                    <Eye className='w-4 h-4 text-gray-600' />
                                </button>
                                <button className='p-1.5 hover:bg-gray-100 rounded transition-colors' title='Download'>
                                    <Download className='w-4 h-4 text-gray-600' />
                                </button>
                                <button className='p-1.5 hover:bg-gray-100 rounded transition-colors' title='Löschen'>
                                    <Trash2 className='w-4 h-4 text-gray-600' />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Summary */}
            <div className='flex items-center justify-between pt-4 border-t'>
                <p className='text-sm text-gray-600'>
                    {demoDocuments.length} Dokumente Gesamt: {totalSize} KB
                </p>
            </div>
        </div>
    )
}