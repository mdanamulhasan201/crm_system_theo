'use client'

import React, { useRef } from 'react'
import { Search, Upload, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchActionBarProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    onUploadClick: () => void
    uploadLoading: boolean
    loading: boolean
    fileInputRef: React.RefObject<HTMLInputElement | null>
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function SearchActionBar({
    searchQuery,
    onSearchChange,
    onUploadClick,
    uploadLoading,
    loading,
    fileInputRef,
    onFileChange
}: SearchActionBarProps) {
    return (
        <>
            <div className='flex items-center gap-4'>
                <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                        type='text'
                        placeholder='Dokumente suchen...'
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className='pl-10 w-full'
                    />
                </div>
                <div className='w-48 h-9 bg-gray-200 rounded-md' />
                <Button
                    variant='outline'
                    className='flex items-center gap-2'
                    onClick={onUploadClick}
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
                onChange={onFileChange}
                className='hidden'
            />
        </>
    )
}
