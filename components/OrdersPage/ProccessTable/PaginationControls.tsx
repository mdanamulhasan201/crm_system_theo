import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    pagination: any;
    currentPage: number;
    ordersCount: number;
    selectedStatus: string | null;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({
    pagination,
    currentPage,
    ordersCount,
    selectedStatus,
    onPageChange,
}: PaginationControlsProps) {
    if (!pagination) return null;

    return (
        <div className="flex justify-between items-center mt-6 px-4">
            <div className="text-sm text-gray-600">
                {ordersCount === 0 ? (
                    <span>
                        Keine Aufträge gefunden
                        {selectedStatus && (
                            <span className="ml-2 text-blue-600 font-medium">
                                • Gefiltert nach: {selectedStatus}
                            </span>
                        )}
                    </span>
                ) : (
                    <span>
                        {pagination.totalItems != null
                            ? `Zeige ${((currentPage - 1) * pagination.itemsPerPage) + 1} bis ${Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} von ${pagination.totalItems} Aufträgen`
                            : `Zeige ${ordersCount} Aufträge auf dieser Seite`}
                    </span>
                )}
            </div>
            {ordersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="flex items-center gap-1 cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Zurück
                    </Button>

                    <span className="text-sm text-gray-600 px-3">
                        Seite {currentPage}{pagination.totalPages != null ? ` von ${pagination.totalPages}` : ''}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="flex items-center gap-1 cursor-pointer"
                    >
                        Weiter
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
