"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Upload, FileImage, File, FileText, Crop } from 'lucide-react'
import { getSingleCustomer } from '@/apis/customerApis'
import { useCustomerScanningFile } from '@/hooks/customer/useCustomerScanningFile'
import { useUpdateScanningData } from '@/hooks/customer/useUpdateScanningData'
import Image from 'next/image'
import ImageCropModal from '@/components/ImageCropModal/ImageCropModal'

/** Fields that require the crop step before upload */
const CROP_FIELDS = ['picture_23', 'picture_24']

interface ScanningDataUpdateProps {
    customerId: string
    onDataUpdate?: () => void
}

interface CropTarget {
    fieldName: string
    imageSrc: string
    fileName: string
    fileType: string
}

export default function ScanningDataUpdate({ customerId, onDataUpdate }: ScanningDataUpdateProps) {
    const [loading, setLoading] = useState<boolean>(true)
    const [customer, setCustomer] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedScreenerData, setSelectedScreenerData] = useState<any>(null)
    const [cropTarget, setCropTarget] = useState<CropTarget | null>(null)
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const {
        filePreviews,
        isSubmitting,
        handleFileUpload,
        setFileDirectly,
        removeFile,
        resetForm,
        getFileIcon,
        getFileLabel,
        getFileAccept,
        getFileFields,
        getThreeDModelFields
    } = useCustomerScanningFile()

    const {
        isUpdating,
        error: updateError,
        updateScanningData
    } = useUpdateScanningData()

    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await getSingleCustomer(customerId)
                const payload = Array.isArray((response as any)?.data)
                    ? (response as any).data[0]
                    : Array.isArray(response)
                        ? (response as any)[0]
                        : (response as any)?.data ?? response
                if (!mounted) return
                setCustomer(payload)
            } catch (e) {
                // noop
            } finally {
                if (mounted) setLoading(false)
            }
        }
        void fetchData()
        return () => { mounted = false }
    }, [customerId])

    const getGermanFileLabel = (fieldName: string): string => {
        const germanLabels: Record<string, string> = {
            picture_10: 'Bild 10',
            picture_11: 'Bild 11',
            picture_16: 'Bild 16',
            picture_17: 'Bild 17',
            picture_23: 'Bild 23',
            picture_24: 'Bild 24',
            threed_model_left: '3D-Modell Links (.stl)',
            threed_model_right: '3D-Modell Rechts (.stl)',
            csvFile: 'CSV-Datei'
        }
        return germanLabels[fieldName] || getFileLabel(fieldName)
    }

    const renderFileIcon = (fieldName: string) => {
        const iconType = getFileIcon(fieldName)
        switch (iconType) {
            case 'image': return <FileImage className="w-4 h-4" />
            case '3d': return <File className="w-4 h-4" />
            case 'csv': return <FileText className="w-4 h-4" />
            default: return <File className="w-4 h-4" />
        }
    }

    const fileFields = getFileFields()
    const threeDModelFields = getThreeDModelFields()

    const screenerItems = useMemo(() => {
        const items = (customer?.screenerFile || []) as Array<any>
        return items
            .slice()
            .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    }, [customer?.screenerFile])

    useEffect(() => {
        if (screenerItems.length > 0 && !selectedScreenerData) {
            const latestItem = screenerItems[0]
            setSelectedDate(latestItem.id)
            setSelectedScreenerData(latestItem)
        }
    }, [screenerItems, selectedScreenerData])

    /** For crop fields: read file → open crop modal */
    const handleCropFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (evt) => {
            setCropTarget({
                fieldName,
                imageSrc: evt.target?.result as string,
                fileName: file.name,
                fileType: file.type || 'image/jpeg',
            })
        }
        reader.readAsDataURL(file)
        // Reset so same file can be re-selected after cancel
        if (fileInputRefs.current[fieldName]) {
            fileInputRefs.current[fieldName]!.value = ''
        }
    }

    const handleCropConfirm = (croppedFile: File) => {
        if (!cropTarget) return
        setFileDirectly(cropTarget.fieldName, croppedFile)
        setCropTarget(null)
    }

    const handleUpdateScanningData = async () => {
        if (!selectedScreenerData || filePreviews.length === 0) return

        const formData = new FormData()
        filePreviews.forEach(preview => {
            formData.append(preview.fieldName, preview.file)
        })

        const success = await updateScanningData(customerId, selectedScreenerData.id, formData)

        if (success) {
            const response = await getSingleCustomer(customerId)
            const payload = Array.isArray((response as any)?.data)
                ? (response as any).data[0]
                : Array.isArray(response)
                    ? (response as any)[0]
                    : (response as any)?.data ?? response
            setCustomer(payload)
            resetForm()

            const updatedItem = payload.screenerFile.find((item: any) => item.id === selectedScreenerData.id)
            if (updatedItem) setSelectedScreenerData(updatedItem)

            if (onDataUpdate) onDataUpdate()
        }
    }

    /** Renders a single image field with crop support for Bild 23/24 */
    const renderImageField = (fieldName: string) => {
        const preview = filePreviews.find(p => p.fieldName === fieldName)
        const existingFile = selectedScreenerData?.[fieldName]
        const isCropField = CROP_FIELDS.includes(fieldName)

        const cropBadge = isCropField && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-[#62A07C]/10 text-[#62A07C] px-1.5 py-0.5 rounded-full ml-1">
                <Crop className="w-2.5 h-2.5" />
                Zuschnitt
            </span>
        )

        const hiddenInput = (
            <input
                type="file"
                accept={getFileAccept(fieldName)}
                onChange={(e) =>
                    isCropField
                        ? handleCropFieldChange(fieldName, e)
                        : handleFileUpload(fieldName, e)
                }
                className="hidden"
                id={`file-${fieldName}`}
                ref={(el) => { fileInputRefs.current[fieldName] = el }}
            />
        )

        return (
            <div key={fieldName} className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                    {getGermanFileLabel(fieldName)}
                    {cropBadge}
                </Label>

                {!preview ? (
                    existingFile ? (
                        /* Existing file — click to replace */
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#62A07C] transition-colors cursor-pointer bg-gray-50"
                            onClick={() => fileInputRefs.current[fieldName]?.click()}
                        >
                            {hiddenInput}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 justify-center">
                                    {isCropField
                                        ? <Crop className="w-4 h-4 text-[#62A07C]" />
                                        : renderFileIcon(fieldName)
                                    }
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">
                                            Vorhanden {getGermanFileLabel(fieldName)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {isCropField ? 'Klicken zum Ersetzen & Zuschneiden' : 'Klicken Sie, um zu ersetzen'}
                                        </p>
                                    </div>
                                </div>
                                <Image
                                    width={200}
                                    height={80}
                                    src={existingFile}
                                    alt="Vorhanden"
                                    className="w-full h-20 object-cover rounded border"
                                />
                            </div>
                        </div>
                    ) : (
                        /* No existing file — upload area */
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#62A07C] transition-colors">
                            {hiddenInput}
                            <label htmlFor={`file-${fieldName}`} className="cursor-pointer block">
                                {isCropField
                                    ? <Crop className="mx-auto h-8 w-8 text-[#62A07C] mb-2" />
                                    : <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                }
                                <p className="text-xs text-gray-600">{getGermanFileLabel(fieldName)} hochladen</p>
                                {isCropField && (
                                    <p className="text-[10px] text-[#62A07C] mt-1">Bild wird nach Auswahl zugeschnitten</p>
                                )}
                            </label>
                        </div>
                    )
                ) : (
                    /* New file selected (after crop or normal upload) */
                    <div className="border border-gray-200 rounded-lg p-3 relative group">
                        <button
                            type="button"
                            onClick={() => removeFile(fieldName)}
                            className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        <div className="flex items-center space-x-2">
                            {renderFileIcon(fieldName)}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{preview.file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            {/* Re-crop button for crop fields */}
                            {isCropField && (
                                <button
                                    type="button"
                                    title="Erneut zuschneiden"
                                    onClick={() => {
                                        const reader = new FileReader()
                                        reader.onload = (evt) => {
                                            setCropTarget({
                                                fieldName,
                                                imageSrc: evt.target?.result as string,
                                                fileName: preview.file.name,
                                                fileType: preview.file.type || 'image/jpeg',
                                            })
                                        }
                                        reader.readAsDataURL(preview.file)
                                    }}
                                    className="p-1 rounded hover:bg-gray-100 cursor-pointer transition"
                                >
                                    <Crop className="w-3.5 h-3.5 text-[#62A07C]" />
                                </button>
                            )}
                        </div>

                        {preview.preview && (
                            <div className="mt-2">
                                <Image
                                    width={200}
                                    height={80}
                                    src={preview.preview}
                                    alt="Vorschau"
                                    className="w-full h-20 object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return <div className="text-center py-4">Laden...</div>
    }

    return (
        <div className="space-y-6 border-t-2">
            {/* Crop Modal */}
            <ImageCropModal
                isOpen={!!cropTarget}
                onClose={() => setCropTarget(null)}
                imageSrc={cropTarget?.imageSrc ?? ''}
                fileName={cropTarget?.fileName ?? ''}
                fileType={cropTarget?.fileType ?? 'image/jpeg'}
                aspect={undefined}
                label={`${getGermanFileLabel(cropTarget?.fieldName ?? '')} zuschneiden`}
                onCropComplete={handleCropConfirm}
            />

            {/* Screener Files - Date wise */}
            <div className='mt-5'>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Scandaten</h3>
                </div>

                <div className="w-full mb-5">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {screenerItems.map((item) => {
                            const date = new Date(item.updatedAt || item.createdAt)
                            const formattedDate = date.toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                            })
                            const formattedTime = date.toLocaleTimeString('en-GB', {
                                hour: '2-digit', minute: '2-digit', hour12: true
                            })
                            const isSelected = selectedDate === item.id

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedDate(item.id)
                                        setSelectedScreenerData(item)
                                        resetForm()
                                    }}
                                    className={`cursor-pointer px-2 py-1 rounded-md text-white transition-colors ${isSelected
                                        ? 'bg-[#4a7c59] ring-2 ring-[#62A07C]'
                                        : 'bg-[#62A07C] hover:bg-[#62a07c98]'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-sm">{formattedDate}</div>
                                        <div className="text-xs opacity-90">{formattedTime}</div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {selectedScreenerData && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-600">
                            Zuletzt aktualisiert: {new Date(selectedScreenerData.updatedAt).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                        </p>
                    </div>
                )}

                {updateError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{updateError}</p>
                    </div>
                )}

                {!selectedScreenerData ? (
                    <div className="mb-6 p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
                        <p className="text-gray-500">Bitte wählen Sie ein Datum aus, um die Scan-Daten anzuzeigen und zu aktualisieren</p>
                    </div>
                ) : (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        {/* 3D Model Fields */}
                        <div className="space-y-2 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {threeDModelFields.map((fieldName) => {
                                    const preview = filePreviews.find(p => p.fieldName === fieldName)
                                    const existingFile = selectedScreenerData?.[fieldName]

                                    return (
                                        <div key={fieldName} className="space-y-2">
                                            <Label className="text-sm font-medium">{getGermanFileLabel(fieldName)}</Label>

                                            {!preview ? (
                                                existingFile ? (
                                                    <div
                                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
                                                        onClick={() => document.getElementById(`file-${fieldName}`)?.click()}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept={getFileAccept(fieldName)}
                                                            onChange={(e) => handleFileUpload(fieldName, e)}
                                                            className="hidden"
                                                            id={`file-${fieldName}`}
                                                        />
                                                        <div className="flex items-center space-x-2 justify-center">
                                                            {renderFileIcon(fieldName)}
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-700">Vorhanden {getGermanFileLabel(fieldName)}</p>
                                                                <p className="text-xs text-gray-500">Klicken Sie, um zu ersetzen</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept={getFileAccept(fieldName)}
                                                            onChange={(e) => handleFileUpload(fieldName, e)}
                                                            className="hidden"
                                                            id={`file-${fieldName}`}
                                                        />
                                                        <label htmlFor={`file-${fieldName}`} className="cursor-pointer">
                                                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                            <p className="text-xs text-gray-600">{getGermanFileLabel(fieldName)} hochladen</p>
                                                        </label>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="border border-gray-200 rounded-lg p-3 relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(fieldName)}
                                                        className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <div className="flex items-center space-x-2">
                                                        {renderFileIcon(fieldName)}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">{preview.file.name}</p>
                                                            <p className="text-xs text-gray-500">{(preview.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Picture Fields — crop applied to Bild 23 & 24 */}
                        <div className="space-y-2 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fileFields.filter(field => field !== 'csvFile').map((fieldName) =>
                                    renderImageField(fieldName)
                                )}
                            </div>
                        </div>

                        {/* CSV File */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">CSV-Datei</Label>
                            <div className="w-full md:w-1/2">
                                {(() => {
                                    const csvPreview = filePreviews.find(p => p.fieldName === 'csvFile')
                                    const existingFile = selectedScreenerData?.csvFile

                                    return !csvPreview ? (
                                        existingFile ? (
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
                                                onClick={() => document.getElementById('file-csvFile')?.click()}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={(e) => handleFileUpload('csvFile', e)}
                                                    className="hidden"
                                                    id="file-csvFile"
                                                />
                                                <div className="flex items-center space-x-2 justify-center">
                                                    <FileText className="w-4 h-4" />
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-700">Vorhandene CSV-Datei</p>
                                                        <p className="text-xs text-gray-500">Klicken Sie, um zu ersetzen</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={(e) => handleFileUpload('csvFile', e)}
                                                    className="hidden"
                                                    id="file-csvFile"
                                                />
                                                <label htmlFor="file-csvFile" className="cursor-pointer">
                                                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                    <p className="text-xs text-gray-600">CSV-Datei hochladen</p>
                                                </label>
                                            </div>
                                        )
                                    ) : (
                                        <div className="border border-gray-200 rounded-lg p-3 relative group">
                                            <button
                                                type="button"
                                                onClick={() => removeFile('csvFile')}
                                                className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-4 h-4" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{csvPreview.file.name}</p>
                                                    <p className="text-xs text-gray-500">{(csvPreview.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    type="button"
                    className='bg-[#62A07C] hover:bg-[#62a07c98] cursor-pointer'
                    onClick={handleUpdateScanningData}
                    disabled={isUpdating || !selectedScreenerData || filePreviews.length === 0}
                >
                    {isUpdating ? 'Aktualisieren...' : 'Scan-Daten aktualisieren'}
                </Button>
            </div>
        </div>
    )
}
