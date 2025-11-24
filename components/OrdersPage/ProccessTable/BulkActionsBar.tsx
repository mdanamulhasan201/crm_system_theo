import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/orderStatusMappings";

interface BulkActionsBarProps {
    selectedOrderIds: string[];
    onClearSelection: () => void;
    onBulkDelete: (orderIds: string[]) => void;
    onBulkStatusChange: (orderIds: string[], status: string) => void;
    statusValue: string;
    onStatusValueChange: (value: string) => void;
}

export default function BulkActionsBar({
    selectedOrderIds,
    onClearSelection,
    onBulkDelete,
    onBulkStatusChange,
    statusValue,
    onStatusValueChange,
}: BulkActionsBarProps) {
    const handleBulkDelete = () => {
        onBulkDelete(selectedOrderIds);
    };

    const handleBulkStatusChange = (value: string) => {
        if (!value) return;
        onStatusValueChange(value);
        onBulkStatusChange(selectedOrderIds, value);
    };

    if (selectedOrderIds.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                    {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} ausgewählt
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                    className="text-xs"
                >
                    Auswahl aufheben
                </Button>
            </div>
            <div className="flex gap-2">
                <Select value={statusValue || undefined} onValueChange={handleBulkStatusChange}>
                    <SelectTrigger className="w-[220px] text-xs h-8 cursor-pointer bg-white">
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
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-xs"
                >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Ausgewählte löschen
                </Button>
            </div>
        </div>
    );
}

