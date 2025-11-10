'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Search, Upload, Download, Eye, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useParams } from 'next/navigation'
import { getKundenordnerData, deleteKundenordnerData, uploadKundenordnerData } from '@/apis/kundenordnerDataApis'
import Loading from '@/components/Shared/Loading'

type DocumentType = 'all' | 'rezept' | 'kostenvoranschlag' | 'genehmigung' | 'konformität' | 'rechnung' | 'zahlungsbeleg' | 'image' | 'stl' | 'csv' | 'pdf' | 'jpg' | 'webp'

interface Document {
    id: string
    url: string
    title: string
    size: string
    date: string
    type: DocumentType
    iconColor: string
    tagColor: string
    fullUrl: string
    fileType: string
    table: string
    fieldName: string
}

interface ApiFile {
    fieldName: string
    table: string
    url: string
    id: string
    fileType: string
    createdAt: string
    fullUrl: string
}

interface ApiResponse {
    success: boolean
    message: string
    data: ApiFile[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

const documentTypeLabels: Record<DocumentType, string> = {
    all: 'Alle',
    rezept: 'Rezept',
    kostenvoranschlag: 'Kostenvoranschlag',
    genehmigung: 'Genehmigung',
    konformität: 'Konformität',
    rechnung: 'Rechnung',
    zahlungsbeleg: 'Zahlungsbeleg',
    image: 'Bild',
    stl: '3D Modell',
    csv: 'CSV',
    pdf: 'PDF',
    jpg: 'JPG',
    webp: 'WebP'
}

// Map file types to document types
const mapFileTypeToDocumentType = (fileType: string, table: string, fieldName: string): DocumentType => {
    // Check table and fieldName for specific document types
    if (table === 'customer_files') {
        // You can add logic here to determine document type based on fieldName or other criteria
        // For now, we'll map by file extension
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return 'pdf'
            case 'jpg':
            case 'jpeg':
                return 'jpg'
            case 'webp':
                return 'webp'
            default:
                return 'image'
        }
    }

    // Map by file extension
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return 'pdf'
        case 'stl':
            return 'stl'
        case 'csv':
            return 'csv'
        case 'jpg':
        case 'jpeg':
            return 'jpg'
        case 'webp':
            return 'webp'
        default:
            return 'image'
    }
}

// Get color classes based on document type
const getDocumentColors = (type: DocumentType): { iconColor: string; tagColor: string } => {
    const colorMap: Record<DocumentType, { iconColor: string; tagColor: string }> = {
        all: { iconColor: 'text-gray-600', tagColor: 'bg-gray-100 text-gray-700' },
        rezept: { iconColor: 'text-blue-600', tagColor: 'bg-blue-100 text-blue-700' },
        kostenvoranschlag: { iconColor: 'text-purple-600', tagColor: 'bg-purple-100 text-purple-700' },
        genehmigung: { iconColor: 'text-green-600', tagColor: 'bg-green-100 text-green-700' },
        konformität: { iconColor: 'text-cyan-600', tagColor: 'bg-cyan-100 text-cyan-700' },
        rechnung: { iconColor: 'text-orange-600', tagColor: 'bg-orange-100 text-orange-700' },
        zahlungsbeleg: { iconColor: 'text-yellow-600', tagColor: 'bg-yellow-100 text-yellow-700' },
        image: { iconColor: 'text-pink-600', tagColor: 'bg-pink-100 text-pink-700' },
        stl: { iconColor: 'text-indigo-600', tagColor: 'bg-indigo-100 text-indigo-700' },
        csv: { iconColor: 'text-teal-600', tagColor: 'bg-teal-100 text-teal-700' },
        pdf: { iconColor: 'text-red-600', tagColor: 'bg-red-100 text-red-700' },
        jpg: { iconColor: 'text-pink-600', tagColor: 'bg-pink-100 text-pink-700' },
        webp: { iconColor: 'text-pink-600', tagColor: 'bg-pink-100 text-pink-700' }
    }
    return colorMap[type] || colorMap.image
}

// Format file size (mock - API doesn't provide size)
const formatFileSize = (url: string): string => {
    // Since API doesn't provide size, we'll return a placeholder
    // In production, you might want to fetch file headers or store size in DB
    return 'N/A'
}

// Format date
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
        return dateString
    }
}

// Get file title from URL
const getFileTitle = (url: string, fieldName: string, table: string): string => {
    const fileName = url.split('/').pop() || url
    // Remove UUID prefix if present
    const cleanName = fileName.replace(/^[a-f0-9-]+-/, '')
    // If still too long, truncate
    if (cleanName.length > 30) {
        return cleanName.substring(0, 27) + '...'
    }
    return cleanName || `${fieldName}_${table}`
}

export default function KundenordnerPage() {
    const params = useParams()
    const customerId = String(params.id)
    const [activeFilter, setActiveFilter] = useState<DocumentType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState<ApiResponse['pagination'] | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const limit = 20
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploadLoading(true)
            await uploadKundenordnerData(customerId, file)
            await fetchDocuments()
        } catch (err) {
            console.error('Error uploading document:', err)
            alert('Upload fehlgeschlagen. Bitte erneut versuchen.')
        } finally {
            setUploadLoading(false)
            if (event.target) {
                event.target.value = ''
            }
        }
    }


    useEffect(() => {
        fetchDocuments()
    }, [customerId, page])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            setError(null)
            const response: ApiResponse = await getKundenordnerData(customerId, page, limit)

            if (response.success && response.data) {
                const mappedDocuments: Document[] = response.data.map((file: ApiFile) => {
                    const docType = mapFileTypeToDocumentType(file.fileType, file.table, file.fieldName)
                    const colors = getDocumentColors(docType)
                    return {
                        id: file.id,
                        url: file.url,
                        title: getFileTitle(file.url, file.fieldName, file.table),
                        size: formatFileSize(file.url),
                        date: formatDate(file.createdAt),
                        type: docType,
                        iconColor: colors.iconColor,
                        tagColor: colors.tagColor,
                        fullUrl: file.fullUrl,
                        fileType: file.fileType,
                        table: file.table,
                        fieldName: file.fieldName
                    }
                })
                setDocuments(mappedDocuments)
                setPagination(response.pagination)
            } else {
                setError('Failed to fetch documents')
            }
        } catch (err) {
            console.error('Error fetching documents:', err)
            setError('Error loading documents. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getDocumentCount = (type: DocumentType) => {
        if (type === 'all') return pagination?.total || documents.length
        return documents.filter(doc => doc.type === type).length
    }

    const filteredDocuments = activeFilter === 'all'
        ? documents.filter(doc =>
            searchQuery === '' || doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : documents.filter(doc =>
            doc.type === activeFilter &&
            (searchQuery === '' || doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
        )

    const handleView = (doc: Document) => {
        window.open(doc.fullUrl, '_blank')
    }

    const handleDownload = (doc: Document) => {
        const link = document.createElement('a')
        link.href = doc.fullUrl
        link.download = doc.title
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDelete = (doc: Document) => {
        setDocumentToDelete(doc)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!documentToDelete) return
        try {
            setDeleteLoading(true)
            await deleteKundenordnerData({
                fieldName: documentToDelete.fieldName,
                table: documentToDelete.table,
                url: documentToDelete.url,
                id: documentToDelete.id,
            })
            setDeleteDialogOpen(false)
            setDocumentToDelete(null)
            await fetchDocuments()
        } catch (err) {
            console.error('Error deleting document:', err)
            alert('Löschen fehlgeschlagen. Bitte erneut versuchen.')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading && documents.length === 0) {
        return <Loading isFullPage={true} message="Loading documents..." />
    }

    if (error && documents.length === 0) {
        return (
            <div className='mb-20 p-4'>
                <div className='text-red-600 text-center py-8'>
                    {error}
                </div>
                <Button onClick={fetchDocuments} className='mx-auto block'>
                    Retry
                </Button>
            </div>
        )
    }

    // Get all unique document types from the data
    const availableTypes: DocumentType[] = ['all', ...Array.from(new Set(documents.map(d => d.type)))] as DocumentType[]

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
                <Button
                    variant='outline'
                    className='flex items-center gap-2'
                    onClick={handleUploadClick}
                    disabled={uploadLoading || loading}
                >
                    {uploadLoading ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                        <Upload className='w-4 h-4' />
                    )}
                    {uploadLoading ? 'Hochladen...' : 'Hochladen'}
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                    <Download className='w-4 h-4' />
                    Alle exportieren
                </Button>
            </div>

            <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
                className='hidden'
            />

            {/* Filter Tabs */}
            <div className='flex items-center gap-2 overflow-x-auto pb-2'>
                {availableTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === type
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {documentTypeLabels[type]} ({getDocumentCount(type)})
                    </button>
                ))}
            </div>

            {/* Loading indicator for pagination */}
            {loading && documents.length > 0 && (
                <div className='flex justify-center py-4'>
                    <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
                </div>
            )}

            {/* Document Grid */}
            {filteredDocuments.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredDocuments.map((doc) => (
                        <div
                            key={`${doc.id}-${doc.fieldName}`}
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
                                    <button
                                        onClick={() => handleView(doc)}
                                        className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                                        title='Ansehen'
                                    >
                                        <Eye className='w-4 h-4 text-gray-600' />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                                        title='Download'
                                    >
                                        <Download className='w-4 h-4 text-gray-600' />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc)}
                                        className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                                        title='Löschen'
                                    >
                                        <Trash2 className='w-4 h-4 text-gray-600' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='text-center py-12 text-gray-500'>
                    {searchQuery ? 'No documents found matching your search.' : 'No documents available.'}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className='flex items-center justify-center gap-2 pt-4'>
                    <Button
                        variant='outline'
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!pagination.hasPrev || loading}
                    >
                        Previous
                    </Button>
                    <span className='text-sm text-gray-600'>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant='outline'
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.hasNext || loading}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Footer Summary */}
            <div className='flex items-center justify-between pt-4 border-t'>
                <p className='text-sm text-gray-600'>
                    {pagination?.total || documents.length} Dokumente Gesamt
                </p>
            </div>

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open)
                    if (!open) {
                        setDocumentToDelete(null)
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dokument löschen?</DialogTitle>
                        <DialogDescription>
                            {documentToDelete
                                ? `Möchten Sie "${documentToDelete.title}" endgültig löschen?`
                                : 'Möchten Sie dieses Dokument endgültig löschen?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setDeleteDialogOpen(false)
                                setDocumentToDelete(null)
                            }}
                            disabled={deleteLoading}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <span className='flex items-center gap-2'>
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                    Löschen...
                                </span>
                            ) : (
                                'Löschen'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

