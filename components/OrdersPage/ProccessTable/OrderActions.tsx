import { Button } from "@/components/ui/button";
import { Trash2, ClipboardEdit, AlertTriangle, QrCode } from "lucide-react";
import { OrderData } from "@/contexts/OrdersContext";

interface OrderActionsProps {
    order: OrderData;
    deleteLoading: boolean;
    onDelete: (orderId: string) => void;
    onInvoiceDownload: (orderId: string) => void;
    onPriorityClick: (order: OrderData) => void;
    onBarcodeStickerClick?: (orderId: string, orderNumber: string) => void;
}

export default function OrderActions({
    order,
    deleteLoading,
    onDelete,
    onInvoiceDownload,
    onPriorityClick,
    onBarcodeStickerClick,
}: OrderActionsProps) {
    // Check if order status is "Abholbereit/Versandt" or "Ausgeführt" - show barcode for both
    const normalizedStatus = order.displayStatus?.replace(/_/g, ' ') || '';
    const isAbholbereit = normalizedStatus === 'Abholbereit/Versandt';
    const isAusgefuehrt = normalizedStatus === 'Ausgeführt';
    const showBarcodeButton = (isAbholbereit || isAusgefuehrt) && onBarcodeStickerClick;

    return (
        <div className="flex gap-1 sm:gap-2 justify-center">
            <Button
                variant="ghost"
                size="sm"
                className={`h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-50 ${order.priority === 'Dringend' ? 'text-red-600' : 'text-gray-500'}`}
                title="Priorität ändern"
                onClick={(e) => {
                    e.stopPropagation();
                    onPriorityClick(order);
                }}
            >
                <AlertTriangle className="h-3 w-3" />
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
            {showBarcodeButton && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-green-100"
                    title={isAbholbereit ? "Barcode-Sticker generieren" : "Barcode-Sticker anzeigen"}
                    onClick={(e) => {
                        e.stopPropagation();
                        onBarcodeStickerClick(order.id, order.bestellnummer);
                    }}
                >
                    <QrCode className="h-3 w-3 text-green-600" />
                </Button>
            )}
        </div>
    );
}

