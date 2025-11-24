import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, ClipboardEdit, ArrowLeft } from "lucide-react";
import { steps } from "@/contexts/OrdersContext";
import { OrderData } from "@/contexts/OrdersContext";

interface OrderActionsProps {
    order: OrderData;
    deleteLoading: boolean;
    onNextStep: (orderId: string) => void;
    onPriorityToggle: (orderId: string) => void;
    onDelete: (orderId: string) => void;
    onInvoiceDownload: (orderId: string) => void;
}

export default function OrderActions({
    order,
    deleteLoading,
    onNextStep,
    onPriorityToggle,
    onDelete,
    onInvoiceDownload,
}: OrderActionsProps) {
    return (
        <div className="flex gap-1 sm:gap-2 justify-center">
            <Button
                variant="ghost"
                size="sm"
                className={`h-6 cursor-pointer sm:h-8 px-1 sm:px-2 text-xs hover:bg-gray-200 flex items-center gap-1 min-w-fit ${order.currentStep >= steps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    onNextStep(order.id);
                }}
                disabled={order.currentStep >= steps.length - 1}
                title={order.currentStep >= steps.length - 1 ? "Bereits im letzten Schritt" : "Nächster Schritt"}
            >
                <ArrowLeft className="h-3 w-3 text-gray-700" />
                <span className="hidden sm:inline text-gray-700">Nächster</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className={`h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-100 ${order.isPrioritized ? 'bg-red-100' : ''}`}
                title="Auftrag priorisieren"
                onClick={(e) => {
                    e.stopPropagation();
                    onPriorityToggle(order.id);
                }}
            >
                <AlertTriangle className={`h-3 w-3 ${order.isPrioritized ? 'text-red-600 fill-current' : 'text-red-500'}`} />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-200"
                title="Löschen"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(order.id);
                }}
                disabled={deleteLoading}
            >
                <Trash2 className="h-3 w-3 text-gray-700" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-blue-100 ${!order.invoice ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                title={order.invoice ? "Rechnung herunterladen" : "Keine Rechnung verfügbar"}
                onClick={(e) => {
                    e.stopPropagation();
                    if (order.invoice) {
                        onInvoiceDownload(order.id);
                    }
                }}
                disabled={!order.invoice}
            >
                <ClipboardEdit className={`h-3 w-3 ${order.invoice ? 'text-blue-600' : 'text-gray-400'}`} />
            </Button>
        </div>
    );
}

