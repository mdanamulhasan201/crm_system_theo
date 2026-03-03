'use client'

import React, { useCallback, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXCEL_ACCEPT = [
    '.xlsx',
    '.xls',
    '.xlsm',
    '.xlsb',
    '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
].join(',')

const EXCEL_EXTENSIONS = /\.(xlsx|xls|xlsm|xlsb|xls)$/i

function isExcelFile(file: File): boolean {
    return EXCEL_EXTENSIONS.test(file.name) || file.type.includes('spreadsheet') || file.type.includes('excel')
}

interface FileUploadModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const setSelectedFile = useCallback((newFiles: FileList | File[] | null) => {
        if (!newFiles?.length) return
        const first = Array.from(newFiles).find(isExcelFile)
        if (!first) {
            console.warn('Nur Excel-Dateien erlaubt.')
            return
        }
        setFile(first)
    }, [])

    const clearFile = useCallback(() => setFile(null), [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(e.target.files)
        e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        setSelectedFile(e.dataTransfer.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => setDragActive(false)

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        try {
            // TODO: Replace with your Krankenkasse Excel upload API
            // await uploadKrankenkasseExcel(file)
            await new Promise((r) => setTimeout(r, 800))
            setFile(null)
            onClose()
        } finally {
            setUploading(false)
        }
    }

    const resetOnClose = () => {
        setFile(null)
        setDragActive(false)
        setUploading(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetOnClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Excel-Datei hochladen
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-500 -mt-2">
                    Nur eine Excel-Datei (.xlsx, .xls, .xlsm, .xlsb, .xls).
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept={EXCEL_ACCEPT}
                    className="hidden"
                    onChange={handleInputChange}
                />
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                        dragActive
                            ? 'border-[#61A175] bg-[#61A175]/5'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                    )}
                >
                    <FileSpreadsheet className="mx-auto size-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                        Datei hier ablegen oder klicken zum Auswählen
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        .xlsx, .xls, .xlsm, .xlsb, .xls
                    </p>
                </div>
                {file && (
                    <div className="flex items-center justify-between gap-2 text-sm py-2 px-3 rounded border border-gray-200 bg-gray-50/50 min-w-0">
                        <span className="flex-1 min-w-0 truncate text-gray-700" title={file.name}>
                            {file.name}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                clearFile()
                            }}
                            className="shrink-0 p-1 cursor-pointer rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Datei entfernen"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={resetOnClose} className="cursor-pointer">
                        Abbrechen
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="cursor-pointer bg-[#61A175] hover:bg-[#61A175]/90 text-white disabled:opacity-60"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Wird hochgeladen...
                            </>
                        ) : (
                            'Hochladen'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
