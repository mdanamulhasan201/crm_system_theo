'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { getKundenordnerData, deleteKundenordnerData, uploadKundenordnerData } from '@/apis/kundenordnerDataApis'
import Loading from '@/components/Shared/Loading'
import { Document, DocumentType, TableFilter, ApiFile, ApiResponse } from '../../../../../types/types'
import { mapFileTypeToDocumentType, getDocumentColors, formatFileSize, formatDate, getFileTitle } from '../../../../../types/utils'
import TopNavigation from '../../_components/Kundenordner/TopNavigation'
import SearchActionBar from '../../_components/Kundenordner/SearchActionBar'
import FilterTabs from '../../_components/Kundenordner/FilterTabs'
import DocumentGrid from '../../_components/Kundenordner/DocumentGrid'
import PaginationControls from '../../_components/Kundenordner/PaginationControls'
import DeleteDialog from '../../_components/Kundenordner/DeleteDialog'
import * as XLSX from 'xlsx'


export default function KundenordnerPage() {
    const params = useParams()
    const router = useRouter()
    const customerId = String(params.id)
    const [activeFilter, setActiveFilter] = useState<DocumentType>('all')
    const [tableFilter, setTableFilter] = useState<TableFilter>('all')
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
    const [exportLoading, setExportLoading] = useState(false)
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
    }, [customerId, page, tableFilter])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            setError(null)
            const table = tableFilter === 'all' ? undefined : tableFilter
            const response: ApiResponse = await getKundenordnerData(customerId, page, limit, table)

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

    const handleTableFilterChange = (filter: TableFilter) => {
        setTableFilter(filter)
        setPage(1)
    }

    const handleExportAll = async () => {
        try {
            setExportLoading(true)
            
            // Fetch exclInfo from API
            const response: ApiResponse = await getKundenordnerData(customerId, 1, limit)
            
            if (!response.success || !response.exclInfo) {
                alert('Keine Kundendaten zum Exportieren verfügbar.')
                return
            }

            const exclInfo = response.exclInfo

            const workbook = XLSX.utils.book_new()

            // Add exclInfo sheet
            const exclInfoData = [
                { 'Feld': 'Name', 'Wert': exclInfo.name || '' },
                { 'Feld': 'Auftragsnummer', 'Wert': exclInfo.orderNumber || '' },
                { 'Feld': 'Fertigstellung bis', 'Wert': exclInfo.fertigstellungBis ? formatDate(exclInfo.fertigstellungBis) : '' }
            ]
            const exclInfoSheet = XLSX.utils.json_to_sheet(exclInfoData)
            XLSX.utils.book_append_sheet(workbook, exclInfoSheet, 'Kundeninformationen')

            // Generate filename with date
            const fileName = `Kundenordner_Export_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(workbook, fileName)

            alert('Kundendaten erfolgreich exportiert')
        } catch (err) {
            console.error('Error exporting data:', err)
            alert('Export fehlgeschlagen. Bitte erneut versuchen.')
        } finally {
            setExportLoading(false)
        }
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
        <>
            {/* back button */}
            <div className='p-4 space-y-6'>
                <Button onClick={() => router.push(`/dashboard/scanning-data/${customerId}`)} variant='outline' className='flex items-center gap-2 cursor-pointer'>
                    <ArrowLeft className='w-4 h-4' />
                    Back
                </Button>
            </div>
            <div className='mb-20 p-4 space-y-6'>
                <TopNavigation activeTab='dokumente' />

                <SearchActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onUploadClick={handleUploadClick}
                    uploadLoading={uploadLoading}
                    loading={loading}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    onExportClick={handleExportAll}
                    exportLoading={exportLoading}
                />

                <FilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    availableTypes={availableTypes}
                    getDocumentCount={getDocumentCount}
                    tableFilter={tableFilter}
                    onTableFilterChange={handleTableFilterChange}
                />

                {/* Loading indicator for pagination */}
                {loading && documents.length > 0 && (
                    <div className='flex justify-center py-4'>
                        <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
                    </div>
                )}

                {!loading && (
                    <DocumentGrid
                        documents={filteredDocuments}
                        onView={handleView}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        searchQuery={searchQuery}
                    />
                )}

                <PaginationControls
                    pagination={pagination}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    loading={loading}
                />

                {/* Footer Summary */}
                <div className='flex items-center justify-between pt-4 border-t'>
                    <p className='text-sm text-gray-600'>
                        {pagination?.total || documents.length} Dokumente Gesamt
                    </p>
                </div>

                <DeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open)
                        if (!open) {
                            setDocumentToDelete(null)
                        }
                    }}
                    documentToDelete={documentToDelete}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                />
            </div>
        </>
    )
}
