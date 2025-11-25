'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { X, Upload, FileImage, File, FileText } from 'lucide-react'
import { useAddCustomer } from '@/hooks/customer/useAddCustomer'
import Image from 'next/image'

interface CustomerFormData {
    vorname: string
    nachname: string
    email: string
    telefon?: string
    wohnort?: string
    // Specific file fields
    picture_10?: File
    picture_23?: File
    threed_model_left?: File
    picture_17?: File
    picture_11?: File
    picture_24?: File
    threed_model_right?: File
    picture_16?: File
    csvFile?: File
}

interface AddCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit?: (data: CustomerFormData) => void
}

export default function AddCustomerModal({ isOpen, onClose, onSubmit }: AddCustomerModalProps) {
    const {
        filePreviews,
        isSubmitting,
        handleFileUpload,
        removeFile,
        submitCustomer,
        resetForm,
        getFileIcon,
        getFileLabel,
        getFileAccept,
        getFileFields,
        getThreeDModelFields
    } = useAddCustomer()

    const form = useForm<CustomerFormData>({
        defaultValues: {
            vorname: '',
            nachname: '',
            email: '',
            telefon: '',
            wohnort: '',
        },
    })

    // Reset form and file previews when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            // Clear form and file previews when modal closes
            form.reset({
                vorname: '',
                nachname: '',
                email: '',
                telefon: '',
                wohnort: '',
            })
            // Reset file previews separately to avoid dependency loop
            resetForm()
        }
    }, [isOpen, form]) // Removed resetForm from dependencies

    const handleFileUploadWithForm = (fieldName: keyof CustomerFormData, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = handleFileUpload(fieldName, event)
        if (file) {
            form.setValue(fieldName, file)
        }
    }

    const handleRemoveFile = (fieldName: keyof CustomerFormData) => {
        removeFile(fieldName)
        form.setValue(fieldName, undefined)
    }

    const handleSubmit = async (data: CustomerFormData) => {
        const success = await submitCustomer(data)
        if (success) {
            // Call the parent onSubmit for any additional handling
            if (onSubmit) {
                await onSubmit(data)
            }
            form.reset()
            onClose()
        }
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                        Kunde hinzufügen    
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="vorname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Vorname *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Vorname eingeben"
                                                className="border border-gray-300 rounded-md"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nachname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Nachname *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nachname eingeben"
                                                className="border border-gray-300 rounded-md"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">E-Mail-Adresse *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="email@example.com"
                                                className="border border-gray-300 rounded-md"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Telefonnummer</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="+49 123 456789"
                                                className="border border-gray-300 rounded-md"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="wohnort"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="text-sm font-medium">Wohnort</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Stadt, PLZ"
                                                className="border border-gray-300 rounded-md"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Scan-Dateien hochladen</h3>

                            {/* 3D Model Files - Side by Side */}
                            <div className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {threeDModelFields.map((fieldName) => {
                                        const preview = filePreviews.find(p => p.fieldName === fieldName)
                                        const fieldValue = form.watch(fieldName) as File | undefined

                                        return (
                                            <div key={fieldName} className="space-y-2">
                                                <Label className="text-sm font-medium">{getFileLabel(fieldName)}</Label>

                                                {!fieldValue ? (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept={getFileAccept(fieldName)}
                                                            onChange={(e) => handleFileUploadWithForm(fieldName, e)}
                                                            className="hidden"
                                                            id={`file-${fieldName}`}
                                                        />
                                                        <label htmlFor={`file-${fieldName}`} className="cursor-pointer">
                                                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                            <p className="text-xs text-gray-600">{getFileLabel(fieldName)} hochladen</p>
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="border border-gray-200 rounded-lg p-3 relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(fieldName)}
                                                            className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>

                                                        <div className="flex items-center space-x-2">
                                                            {renderFileIcon(fieldName)}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">
                                                                    {fieldValue.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(fieldValue.size / 1024 / 1024).toFixed(2)} MB
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

                            {/* Other Files */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Bilddateien & CSV</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {fileFields.map((fieldName) => {
                                        const preview = filePreviews.find(p => p.fieldName === fieldName)
                                        const fieldValue = form.watch(fieldName) as File | undefined

                                        return (
                                            <div key={fieldName} className="space-y-2">
                                                <Label className="text-sm font-medium">{getFileLabel(fieldName)}</Label>

                                                {!fieldValue ? (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept={getFileAccept(fieldName)}
                                                            onChange={(e) => handleFileUploadWithForm(fieldName, e)}
                                                            className="hidden"
                                                            id={`file-${fieldName}`}
                                                        />
                                                        <label htmlFor={`file-${fieldName}`} className="cursor-pointer">
                                                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                            <p className="text-xs text-gray-600">{getFileLabel(fieldName)} hochladen</p>
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="border border-gray-200 rounded-lg p-3 relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(fieldName)}
                                                            className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>

                                                        <div className="flex items-center space-x-2">
                                                            {renderFileIcon(fieldName)}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">
                                                                    {fieldValue.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(fieldValue.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Image Preview */}
                                                        {preview?.preview && (
                                                            <div className="mt-2">
                                                                <Image
                                                                    width={100}
                                                                    height={100}
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
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
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
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Speichern...
                                    </>
                                ) : (
                                    'Kunde hinzufügen'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 