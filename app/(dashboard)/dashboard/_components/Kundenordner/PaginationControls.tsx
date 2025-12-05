'use client'

import { Button } from '@/components/ui/button'
import { ApiResponse } from '../../../../../types/types'

interface PaginationControlsProps {
    pagination: ApiResponse['pagination'] | null
    currentPage: number
    onPageChange: (page: number) => void
    loading: boolean
}

export default function PaginationControls({
    pagination,
    currentPage,
    onPageChange,
    loading
}: PaginationControlsProps) {
    if (!pagination || pagination.totalPages <= 1) {
        return null
    }

    return (
        <div className='flex items-center justify-center gap-2 pt-4'>
            <Button
                variant='outline'
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
            >
                Previous
            </Button>
            <span className='text-sm text-gray-600'>
                Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
                variant='outline'
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!pagination.hasNext || loading}
            >
                Next
            </Button>
        </div>
    )
}
