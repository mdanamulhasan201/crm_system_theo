'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { getKundenordnerData, deleteKundenordnerData, uploadKundenordnerData } from '@/apis/kundenordnerDataApis'
import { Document, DocumentType, TableFilter, ApiFile, ApiResponse } from '@/types/types'
import { mapFileTypeToDocumentType, getDocumentColors, formatFileSize, formatDate, getFileTitle } from '@/types/utils'
import TopNavigation from '../../../_components/Kundenordner/TopNavigation'
import SearchActionBar from '../../../_components/Kundenordner/SearchActionBar'
import FilterTabs from '../../../_components/Kundenordner/FilterTabs'
import DocumentGrid from '../../../_components/Kundenordner/DocumentGrid'
import PaginationControls from '../../../_components/Kundenordner/PaginationControls'
import DeleteDialog from '../../../_components/Kundenordner/DeleteDialog'
import { DokumenteListSkeleton, ShimmerBar } from '../../../_components/Kundenordner/KundenordnerSkeletons'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { downloadUrlAsFile, openFilePreview } from '@/lib/fileDownload'

export default function KundenordnerDokumentePage() {
    const params = useParams()
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
        openFilePreview(doc.fullUrl)
    }

    const handleDownload = async (doc: Document) => {
        const ok = await downloadUrlAsFile(doc.fullUrl, doc.title)
        if (!ok) {
            toast.error(
                'Direkter Download nicht möglich. Bitte „Ansehen“ nutzen und die Datei im Browser speichern.'
            )
        }
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
            // console.error('Error deleting document:', err)
            toast.error('Löschen fehlgeschlagen. Bitte erneut versuchen.')
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

            const response: ApiResponse = await getKundenordnerData(customerId, 1, limit)

            if (!response.success || !response.exclInfo) {
                alert('Keine Kundendaten zum Exportieren verfügbar.')
                return
            }

            const exclInfo = response.exclInfo

            const workbook = XLSX.utils.book_new()

            const exclInfoData = [
                { 'Feld': 'Name', 'Wert': exclInfo.name || '' },
                { 'Feld': 'Auftragsnummer', 'Wert': exclInfo.orderNumber || '' },
                { 'Feld': 'Fertigstellung bis', 'Wert': exclInfo.fertigstellungBis ? formatDate(exclInfo.fertigstellungBis) : '' }
            ]
            const exclInfoSheet = XLSX.utils.json_to_sheet(exclInfoData)
            XLSX.utils.book_append_sheet(workbook, exclInfoSheet, 'Kundeninformationen')

            const fileName = `Kundenordner_Export_${new Date().toISOString().split('T')[0]}.xlsx`
            XLSX.writeFile(workbook, fileName)

            toast.success('Kundendaten erfolgreich exportiert')
        } catch (err) {
            console.error('Error exporting data:', err)
            toast.error('Export fehlgeschlagen. Bitte erneut versuchen.')
        } finally {
            setExportLoading(false)
        }
    }

    const availableTypes: DocumentType[] = ['all', ...Array.from(new Set(documents.map(d => d.type)))] as DocumentType[]

    return (
        <>
            <div className="mb-20 w-full max-w-full space-y-6 p-4">
                <TopNavigation />

                {error && !loading && documents.length === 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p>{error}</p>
                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void fetchDocuments()}>
                            Erneut versuchen
                        </Button>
                    </div>
                )}

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

                {loading && documents.length > 0 && <ShimmerBar />}

                {loading && documents.length === 0 && <DokumenteListSkeleton />}

                {!loading && (
                    <DocumentGrid
                        documents={filteredDocuments}
                        onView={handleView}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        searchQuery={searchQuery}
                        totalLabelCount={pagination?.total ?? filteredDocuments.length}
                    />
                )}

                <PaginationControls
                    pagination={pagination}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    loading={loading}
                />

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
