import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/orderStatusMappings";

interface BulkActionsBarProps {
    selectedOrderIds: string[];
    onClearSelection: () => void;
    onBulkDelete: (orderIds: string[]) => void;
    onBulkStatusChange: (orderIds: string[], status: string) => void;
    statusValue: string;
    onStatusValueChange: (value: string) => void;
    onBulkKrankenkasseStatus: (orderIds: string[], krankenkasseStatus: string) => void;
    isUpdatingKrankenkasseStatus: boolean;
}

export default function BulkActionsBar({
    selectedOrderIds,
    onClearSelection,
    onBulkDelete,
    onBulkStatusChange,
    statusValue,
    onStatusValueChange,
    onBulkKrankenkasseStatus,
    isUpdatingKrankenkasseStatus,
}: BulkActionsBarProps) {
    const handleBulkDelete = () => {
        onBulkDelete(selectedOrderIds);
    };

    const handleBulkStatusChange = (value: string) => {
        if (!value) return;
        onStatusValueChange(value);
        onBulkStatusChange(selectedOrderIds, value);
    };

    const handleKrankenkasseUngenehmigt = () => {
        onBulkKrankenkasseStatus(selectedOrderIds, 'Krankenkasse_Ungenehmigt');
    };

    const handleKrankenkasseGenehmigt = () => {
        onBulkKrankenkasseStatus(selectedOrderIds, 'Krankenkasse_Genehmigt');
    };

    if (selectedOrderIds.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {/* Top Section - Selection Info and Clear Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className="text-xs sm:text-sm font-medium text-blue-900 whitespace-nowrap">
                        {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} ausgewählt
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearSelection}
                        className="text-xs whitespace-nowrap"
                    >
                        Auswahl aufheben
                    </Button>
                </div>
            </div>

            {/* Bottom Section - Actions with Horizontal Scroll */}
            <div className="overflow-x-auto overflow-y-hidden -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
                <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:justify-end">
                    {/* Status Select */}
                    <Select value={statusValue || undefined} onValueChange={handleBulkStatusChange}>
                        <SelectTrigger className="w-[160px] sm:w-[220px] text-xs cursor-pointer bg-white border-none py-2 sm:py-4 flex-shrink-0">
                            <SelectValue placeholder="Status ändern" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value} className="cursor-pointer">
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleKrankenkasseUngenehmigt}
                            disabled={isUpdatingKrankenkasseStatus}
                            className="text-xs py-2 sm:py-4 cursor-pointer whitespace-nowrap"
                        >
                            <XCircle className="h-3 w-3 mr-1 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Krankenkasse-</span>Ungenehmigt
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleKrankenkasseGenehmigt}
                            disabled={isUpdatingKrankenkasseStatus}
                            className="text-xs py-2 sm:py-4 cursor-pointer whitespace-nowrap"
                        >
                            <CheckCircle2 className="h-3 w-3 mr-1 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Krankenkasse-</span>Genehmigt
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="text-xs py-2 sm:py-4 cursor-pointer whitespace-nowrap"
                        >
                            <Trash2 className="h-3 w-3 mr-1 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Ausgewählte </span>löschen
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

