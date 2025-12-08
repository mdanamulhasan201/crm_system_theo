import { TableRow, TableCell } from "@/components/ui/table";
import { OrderData } from "@/contexts/OrdersContext";
import OrderActions from "./OrderActions";
import Link from "next/link";
import { getPaymentStatusColor } from "@/lib/paymentStatusUtils";
import { History, Scan, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderTableRowProps {
    order: OrderData;
    isSelected: boolean;
    isRowSelected: boolean;
    deleteLoading: boolean;
    onRowClick: (orderId: string) => void;
    onCheckboxChange: (orderId: string, e: React.MouseEvent) => void;
    onDelete: (orderId: string) => void;
    onInvoiceDownload: (orderId: string) => void;
    onPriorityClick: (order: OrderData) => void;
    onHistoryClick?: (orderId: string, orderNumber: string) => void;
    onScanClick?: (orderId: string, orderNumber: string, customerName: string) => void;
    onVersorgungClick?: (orderId: string, orderNumber: string, customerName: string) => void;
    onBarcodeStickerClick?: (orderId: string, orderNumber: string, autoGenerate?: boolean) => void;
    onStatusClickGenerateAndSend?: (orderId: string, orderNumber: string) => void;
}

export default function OrderTableRow({
    order,
    isSelected,
    isRowSelected,
    deleteLoading,
    onRowClick,
    onCheckboxChange,
    onDelete,
    onInvoiceDownload,
    onPriorityClick,
    onHistoryClick,
    onScanClick,
    onVersorgungClick,
    onBarcodeStickerClick,
    onStatusClickGenerateAndSend,
}: OrderTableRowProps) {
    const getStatusBadgeColor = (status: string) => {
        const normalizedStatus = status.replace(/_/g, ' ');
        if (normalizedStatus === 'Warten auf Versorgungsstart') {
            return 'bg-red-100 text-red-800';
        } else if (normalizedStatus === 'In Fertigung') {
            return 'bg-orange-100 text-orange-800';
        } else if (normalizedStatus === 'Verpacken/Qualitätssicherung') {
            return 'bg-green-100 text-green-800';
        } else if (normalizedStatus === 'Abholbereit/Versandt') {
            return 'bg-emerald-100 text-emerald-800';
        } else if (normalizedStatus === 'Ausgeführt') {
            return 'bg-blue-100 text-blue-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    const renderPaymentStatus = () => {
        if (!order.zahlung) {
            return null;
        }

        const colors = getPaymentStatusColor(order.zahlung);
        // Format display text - show shorter version if it contains " - "
        const displayText = order.zahlung.includes(' - ')
            ? order.zahlung.split(' - ').join(' • ') // Replace " - " with " • " for better display
            : order.zahlung;

        return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}>
                {displayText}
            </span>
        );
    };

    const renderPriorityBadge = () => {
        if (order.priority === 'Dringend') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">

                    Dringend
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-300 text-gray-800">
                Normal
            </span>
        );
    };

    return (
        <TableRow
            className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' :
                isRowSelected ? 'bg-gray-50' : ''
                }`}
            onClick={() => onRowClick(order.id)}
        >
            <TableCell className="p-2 w-[36px] min-w-[36px] max-w-[36px] text-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onCheckboxChange(order.id, e as any)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 cursor-pointer"
                />
            </TableCell>
            <TableCell className="text-center w-[120px] min-w-[120px] max-w-[120px] pr-2">
                {renderPriorityBadge()}
            </TableCell>

            <TableCell className="font-medium text-center text-xs sm:text-sm w-[110px] min-w-[110px] max-w-[110px] whitespace-normal break-words overflow-hidden">
                {order.bestellnummer}
            </TableCell>

            <TableCell className="text-center text-xs sm:text-sm w-[130px] min-w-[130px] max-w-[130px] whitespace-normal break-words overflow-hidden">
                {order.customerId ? (
                    <Link
                        href={`/dashboard/customer-history/${order.customerId}`}
                        className="text-[#2F7D5C] hover:underline underline-offset-2 "
                        onClick={(e) => e.stopPropagation()}
                    >
                        {order.kundenname}
                    </Link>
                ) : (
                    order.kundenname
                )}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden">
                <span 
                    className={`px-1 sm:px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(order.displayStatus)} ${
                        order.displayStatus?.replace(/_/g, ' ') === 'Abholbereit/Versandt' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                    }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        const normalizedStatus = order.displayStatus?.replace(/_/g, ' ');
                        if (normalizedStatus === 'Abholbereit/Versandt' && onStatusClickGenerateAndSend) {
                            onStatusClickGenerateAndSend(order.id, order.bestellnummer);
                        }
                    }}
                >
                    {order.displayStatus}
                </span>
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[90px] min-w-[90px] max-w-[90px] whitespace-normal break-words overflow-hidden">
                {order.preis}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words overflow-hidden hidden md:table-cell">
                {renderPaymentStatus()}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words overflow-hidden hidden lg:table-cell">
                {order.erstelltAm}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden hidden lg:table-cell">
                {order.fertiggestelltAm}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[150px] min-w-[150px] max-w-[150px] whitespace-normal break-words overflow-hidden hidden xl:table-cell">
                {order.beschreibung}
            </TableCell>
            <TableCell className="p-2 w-[160px] min-w-[160px] max-w-[160px] text-center">
                <div className="flex gap-2 sm:gap-3 justify-center items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer rounded-md hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
                        title="Historie"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onHistoryClick) {
                                onHistoryClick(order.id, order.bestellnummer);
                            }
                        }}
                    >
                        <History className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer rounded-md hover:bg-green-50 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
                        title="Scan"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onScanClick) {
                                onScanClick(order.id, order.bestellnummer, order.kundenname);
                            }
                        }}
                    >
                        <Scan className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer rounded-md hover:bg-purple-50 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
                        title="Versorgung"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onVersorgungClick) {
                                onVersorgungClick(order.id, order.bestellnummer, order.kundenname);
                            }
                        }}
                    >
                        <Package className="h-4 w-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="p-2 w-[160px] min-w-[160px] max-w-[160px] text-center">
                <OrderActions
                    order={order}
                    deleteLoading={deleteLoading}
                    onDelete={onDelete}
                    onInvoiceDownload={onInvoiceDownload}
                    onPriorityClick={onPriorityClick}
                    onBarcodeStickerClick={onBarcodeStickerClick}
                />
            </TableCell>
        </TableRow>
    );
}

