'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Loader2, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { validateInsuranceChangelog } from '@/apis/krankenkasseApis'
import type { ValidateChangelogResponse } from '@/apis/krankenkasseApis'
import FileUploadResultModal from './FileUploadResultModal'

const EXCEL_ACCEPT = [
    '.xlsx',
    '.xls',
    '.xlsm',
    '.xlsb',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
].join(',')

const EXCEL_EXTENSIONS = /\.(xlsx|xls|xlsm|xlsb|xls)$/i

function isExcelFile(file: File): boolean {
    return EXCEL_EXTENSIONS.test(file.name) || file.type.includes('spreadsheet') || file.type.includes('excel')
}

const AI_LOADING_STEPS = [
    'Excel wird sicher übertragen …',
    'Tabellen und Zellen werden gelesen …',
    'KI extrahiert Versicherungsdaten …',
    'Abgleich mit Ihren Aufträgen …',
] as const

interface FileUploadModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [aiStepIndex, setAiStepIndex] = useState(0)
    const [resultData, setResultData] = useState<ValidateChangelogResponse | null>(null)
    const [resultModalOpen, setResultModalOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!uploading) {
            setAiStepIndex(0)
            return
        }
        const id = window.setInterval(() => {
            setAiStepIndex((i) => (i + 1) % AI_LOADING_STEPS.length)
        }, 2000)
        return () => window.clearInterval(id)
    }, [uploading])

    const setSelectedFile = useCallback((newFiles: FileList | File[] | null) => {
        if (!newFiles?.length) return
        const first = Array.from(newFiles).find(isExcelFile)
        if (!first) {
            toast.error('Nur Excel-Dateien (.xlsx, .xls, …) erlaubt — kein PDF.')
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
            const data = await validateInsuranceChangelog(file)
            setFile(null)
            onClose()
            setResultData(data)
            setResultModalOpen(true)
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Upload fehlgeschlagen.'
            toast.error(msg)
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

    const closeResultModal = () => {
        setResultModalOpen(false)
        setResultData(null)
    }

    return (
    <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && !uploading && resetOnClose()}>
            <DialogContent
                className={cn(
                    'sm:max-w-md  overflow-hidden',
                    uploading && '[&>button]:pointer-events-none [&>button]:opacity-0'
                )}
                onPointerDownOutside={(e) => uploading && e.preventDefault()}
                onEscapeKeyDown={(e) => uploading && e.preventDefault()}
            >
                <div
                    className={cn(
                        'relative flex flex-col gap-4',
                        uploading && 'pointer-events-none select-none'
                    )}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            Excel-Datei hochladen
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 -mt-2">
                        Nur Excel. Auf dem Server werden Daten per KI aus der Datei extrahiert und mit Aufträgen
                        abgeglichen.
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
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50',
                            uploading && 'opacity-40'
                        )}
                    >
                        <FileSpreadsheet className="mx-auto size-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                            Datei hier ablegen oder klicken zum Auswählen
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            .xlsx, .xls, .xlsm, .xlsb
                        </p>
                    </div>
                    {file && (
                        <div
                            className={cn(
                                'flex items-center justify-between gap-2 text-sm py-2 px-3 rounded border border-gray-200 bg-gray-50/50 min-w-0',
                                uploading && 'opacity-40'
                            )}
                        >
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
                    <div className={cn('flex justify-end gap-2 pt-2', uploading && 'opacity-40')}>
                        <Button variant="outline" size="sm" onClick={resetOnClose} disabled={uploading} className="cursor-pointer">
                            Abbrechen
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="cursor-pointer bg-[#61A175] hover:bg-[#61A175]/90 text-white disabled:opacity-60"
                        >
                            Hochladen
                        </Button>
                    </div>

                    {uploading && (
                        <div
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 py-10 rounded-lg bg-white/92 backdrop-blur-md"
                            role="status"
                            aria-live="polite"
                            aria-busy="true"
                        >
                            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                                <div className="absolute -top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-200/25 via-transparent to-emerald-200/20 blur-3xl animate-pulse" />
                            </div>
                            <div className="relative flex flex-col items-center text-center max-w-[280px]">
                                <div className="relative mb-6 flex size-20 items-center justify-center">
                                    <span className="absolute inset-0 rounded-full border-2 border-[#61A175]/20" />
                                    <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#61A175] border-r-violet-400/60 animate-spin [animation-duration:1.15s]" />
                                    <Sparkles className="relative size-9 text-violet-600 drop-shadow-sm" />
                                </div>
                                <p className="text-base font-semibold tracking-tight text-gray-900">
                                    KI-Verarbeitung
                                </p>
                                <p
                                    key={aiStepIndex}
                                    className="mt-2 text-sm text-violet-900/85 animate-in fade-in slide-in-from-bottom-1 duration-300"
                                >
                                    {AI_LOADING_STEPS[aiStepIndex]}
                                </p>
                                <div className="mt-6 flex gap-2" aria-hidden>
                                    {AI_LOADING_STEPS.map((_, i) => (
                                        <span
                                            key={i}
                                            className={cn(
                                                'h-1.5 rounded-full transition-all duration-500',
                                                i === aiStepIndex
                                                    ? 'w-6 bg-[#61A175]'
                                                    : i < aiStepIndex
                                                      ? 'w-1.5 bg-[#61A175]/45'
                                                      : 'w-1.5 bg-gray-200'
                                            )}
                                        />
                                    ))}
                                </div>
                                {/* <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                                    <Loader2 className="size-3.5 animate-spin text-[#61A175]" />
                                    Bitte warten …
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
        <FileUploadResultModal
            open={resultModalOpen}
            onClose={closeResultModal}
            data={resultData}
        />
    </>
    )
}
