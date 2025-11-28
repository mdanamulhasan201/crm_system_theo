import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LastScanPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    displayRowsCount: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export function LastScanPagination({
    page,
    totalPages,
    totalItems,
    displayRowsCount,
    limit,
    onPageChange,
}: LastScanPaginationProps) {
    const currentRangeStart = displayRowsCount === 0 ? 0 : (page - 1) * limit + 1;
    const currentRangeEnd = displayRowsCount === 0
        ? 0
        : Math.min(currentRangeStart + displayRowsCount - 1, totalItems || displayRowsCount);
    const totalCount = totalItems || displayRowsCount || 0;

    const handlePrev = () => onPageChange(Math.max(1, page - 1));
    const handleNext = () => onPageChange(totalPages ? Math.min(totalPages, page + 1) : page + 1);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <div>
                Zeige {currentRangeStart}-{currentRangeEnd} von {totalCount}
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink
                            onClick={handlePrev}
                            href="#"
                            size="default"
                            className="gap-1 px-2.5 sm:pl-2.5 cursor-pointer"
                            aria-label="Zur vorherigen Seite"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:block">Zurück</span>
                        </PaginationLink>
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    href="#"
                                    isActive={pageNum === page}
                                    onClick={() => onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <PaginationLink
                            onClick={handleNext}
                            href="#"
                            size="default"
                            className="gap-1 px-2.5 sm:pr-2.5 cursor-pointer"
                            aria-label="Zur nächsten Seite"
                        >
                            <span className="hidden sm:block">Weiter</span>
                            <ChevronRight className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

