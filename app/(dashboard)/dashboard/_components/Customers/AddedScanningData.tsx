"use client"
import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Upload, FileImage, File, FileText, Crop } from 'lucide-react'
import { useCustomerScanningFile } from '@/hooks/customer/useCustomerScanningFile'
import Image from 'next/image'
import ImageCropModal from '@/components/ImageCropModal/ImageCropModal'

/** Fields that require the crop step before upload */
const CROP_FIELDS = ['picture_23', 'picture_24']

interface AddedScanningDataProps {
    customerId: string
    isOpen: boolean
    onClose: () => void
    onSubmit?: () => void
}

interface CropTarget {
    fieldName: string
    imageSrc: string
    fileName: string
    fileType: string
}

export default function AddedScanningData({ customerId, isOpen, onClose, onSubmit }: AddedScanningDataProps) {
    const {
        filePreviews,
        isSubmitting,
        handleFileUpload,
        setFileDirectly,
        removeFile,
        submitScanningFile,
        resetForm,
        getFileIcon,
        getFileLabel,
        getFileAccept,
        getFileFields,
        getThreeDModelFields
    } = useCustomerScanningFile()

    const [cropTarget, setCropTarget] = useState<CropTarget | null>(null)
    // Keep refs so we can reset the file input after opening crop
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    React.useEffect(() => {
        if (!isOpen) {
            resetForm()
        }
    }, [isOpen, resetForm])

    const handleSubmit = async () => {
        const success = await submitScanningFile(customerId, {})
        if (success) {
            if (onSubmit) onSubmit()
            onClose()
        }
    }

    /** For crop fields: read the file and open the crop modal instead of uploading directly */
    const handleCropFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            const src = evt.target?.result as string
            setCropTarget({
                fieldName,
                imageSrc: src,
                fileName: file.name,
                fileType: file.type || 'image/jpeg',
            })
        }
        reader.readAsDataURL(file)

        // Reset input so the same file can be re-selected after cancel
        if (fileInputRefs.current[fieldName]) {
            fileInputRefs.current[fieldName]!.value = ''
        }
    }

    const handleCropConfirm = (croppedFile: File) => {
        if (!cropTarget) return
        setFileDirectly(cropTarget.fieldName, croppedFile)
        setCropTarget(null)
    }

    // German translation for file labels
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
            case 'image':
                return <FileImage className="w-4 h-4" />
            case '3d':
                return <File className="w-4 h-4" />
            case 'csv':
                return <FileText className="w-4 h-4" />
            default:
                return <File className="w-4 h-4" />
        }
    }

    const fileFields = getFileFields()
    const threeDModelFields = getThreeDModelFields()

    const renderImageField = (fieldName: string) => {
        const preview = filePreviews.find(p => p.fieldName === fieldName)
        const isCropField = CROP_FIELDS.includes(fieldName)

        return (
            <div key={fieldName} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                    {getGermanFileLabel(fieldName)}
                    {isCropField && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-[#62A07C]/10 text-[#62A07C] px-1.5 py-0.5 rounded-full">
                            <Crop className="w-2.5 h-2.5" />
                            Zuschnitt
                        </span>
                    )}
                </Label>

                {!preview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#62A07C] transition-colors">
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
                        <label htmlFor={`file-${fieldName}`} className="cursor-pointer block">
                            {isCropField ? (
                                <Crop className="mx-auto h-8 w-8 text-[#62A07C] mb-2" />
                            ) : (
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            )}
                            <p className="text-xs text-gray-600">{getGermanFileLabel(fieldName)} hochladen</p>
                            {isCropField && (
                                <p className="text-[10px] text-[#62A07C] mt-1">Bild wird nach Upload zugeschnitten</p>
                            )}
                        </label>
                    </div>
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
                                <p className="text-xs font-medium truncate">
                                    {preview.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
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

    return (
        <div className="space-y-6">
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

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Scan-Dateien hochladen</h3>

                {/* 3D model fields */}
                <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {threeDModelFields.map((fieldName) => {
                            const preview = filePreviews.find(p => p.fieldName === fieldName)

                            return (
                                <div key={fieldName} className="space-y-2">
                                    <Label className="text-sm font-medium">{getGermanFileLabel(fieldName)}</Label>

                                    {!preview ? (
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
                                                    <p className="text-xs font-medium truncate">
                                                        {preview.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Image fields */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Bilddateien</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fileFields.filter(field => field !== 'csvFile').map((fieldName) =>
                            renderImageField(fieldName)
                        )}
                    </div>
                </div>

                {/* CSV field */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">CSV-Datei</Label>
                    <div className="w-full md:w-1/2">
                        {(() => {
                            const csvPreview = filePreviews.find(p => p.fieldName === 'csvFile')

                            return !csvPreview ? (
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
                                            <p className="text-xs font-medium truncate">
                                                {csvPreview.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(csvPreview.file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                    type="button"
                    className='cursor-pointer'
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Abbrechen
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || filePreviews.length === 0}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            Wird hochgeladen...
                        </>
                    ) : (
                        'Scan-Dateien hochladen'
                    )}
                </Button>
            </div>
        </div>
    )
}
