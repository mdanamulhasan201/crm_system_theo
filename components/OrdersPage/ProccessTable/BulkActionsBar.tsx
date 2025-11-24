import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { steps } from "@/contexts/OrdersContext";
import { OrderData } from "@/contexts/OrdersContext";
import { getApiStatusFromStep, getGermanStatusFromApi } from "@/lib/orderStatusMappings";
import toast from 'react-hot-toast';

interface BulkActionsBarProps {
    selectedOrderIds: string[];
    orders: OrderData[];
    onClearSelection: () => void;
    onBulkStatusChange?: (orderIds: string[], status: string) => void;
}

export default function BulkActionsBar({
    selectedOrderIds,
    orders,
    onClearSelection,
    onBulkStatusChange,
}: BulkActionsBarProps) {
    const handleStatusChange = (value: string) => {
        // Static demo - show which status was selected for which orders
        const germanStatus = getGermanStatusFromApi(value);
        
        const selectedOrders = orders.filter(order =>
            selectedOrderIds.includes(order.id)
        );
        const orderCount = selectedOrderIds.length;
        const orderNames = selectedOrders.slice(0, 3).map(o => o.kundenname).join(', ');
        const moreOrders = orderCount > 3 ? ` und ${orderCount - 3} weitere` : '';
        
        toast.success(
            `Status ändern zu "${germanStatus}" für ${orderCount} ${orderCount === 1 ? 'Auftrag' : 'Aufträge'}: ${orderNames}${moreOrders}`,
            { duration: 4000 }
        );

        // Call the callback if provided
        if (onBulkStatusChange) {
            onBulkStatusChange(selectedOrderIds, value);
        }
    };

    const handleBulkDelete = () => {
        // Handle bulk delete
        toast('Bulk-Löschfunktion wird bald verfügbar sein', {
            icon: 'ℹ️',
        });
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
                <Select onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[220px] text-xs h-8 cursor-pointer">
                        <SelectValue placeholder="Status ändern" />
                    </SelectTrigger>
                    <SelectContent>
                        {steps.map((step, idx) => {
                            const apiStatus = getApiStatusFromStep(step);
                            return (
                                <SelectItem key={idx} value={apiStatus || step}>
                                    {step}
                                </SelectItem>
                            );
                        })}
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

