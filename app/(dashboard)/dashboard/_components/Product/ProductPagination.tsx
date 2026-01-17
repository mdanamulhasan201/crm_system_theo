import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationInfo {
    totalItems: number
    totalPages: number
    currentPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

interface ProductPaginationProps {
    pagination: PaginationInfo | null
    currentPage: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (itemsPerPage: number) => void
}

export default function ProductPagination({
    pagination,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: ProductPaginationProps) {
    if (!pagination || pagination.totalItems === 0) {
        return null
    }

    const totalPages = pagination.totalPages || 1

    // Generate page numbers with ellipsis
    const generatePageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(i)
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Show last page
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="mt-6 w-full">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Items per page selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Zeige:</span>
                    <div className="flex items-center gap-2">
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                                const numValue = parseInt(value)
                                onItemsPerPageChange(numValue)
                                onPageChange(1)
                            }}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                            von {pagination.totalItems} Produkten
                        </span>
                    </div>
                </div>

                {/* Page navigation */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => {
                                        if (currentPage > 1) {
                                            onPageChange(currentPage - 1)
                                        }
                                    }}
                                    className={currentPage === 1 || !pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {generatePageNumbers().map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <PaginationItem key={`ellipsis-${index}`}>
                                            <span className="px-2">...</span>
                                        </PaginationItem>
                                    )
                                }
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => onPageChange(page as number)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => {
                                        if (currentPage < totalPages) {
                                            onPageChange(currentPage + 1)
                                        }
                                    }}
                                    className={currentPage === totalPages || !pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    {/* Page info */}
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                        Seite {currentPage} von {totalPages}
                    </div>
                </div>
            </div>
        </div>
    )
}
