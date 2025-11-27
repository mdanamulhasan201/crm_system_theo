import { TableRow, TableCell } from "@/components/ui/table";
import { OrderData } from "@/contexts/OrdersContext";
import OrderActions from "./OrderActions";
import Link from "next/link";

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
        if (order.zahlung === 'Bezahlt') {
            return (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Bezahlt
                </span>
            );
        }

        return (
            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                {order.zahlung}
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
                <span className={`px-1 sm:px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(order.displayStatus)}`}>
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
                <OrderActions
                    order={order}
                    deleteLoading={deleteLoading}
                    onDelete={onDelete}
                    onInvoiceDownload={onInvoiceDownload}
                    onPriorityClick={onPriorityClick}
                />
            </TableCell>
        </TableRow>
    );
}

