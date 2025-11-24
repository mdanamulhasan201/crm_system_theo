import { TableRow, TableCell } from "@/components/ui/table";
import { OrderData } from "@/contexts/OrdersContext";
import OrderActions from "./OrderActions";

interface OrderTableRowProps {
    order: OrderData;
    isSelected: boolean;
    isRowSelected: boolean;
    deleteLoading: boolean;
    onRowClick: (orderId: string) => void;
    onCheckboxChange: (orderId: string, e: React.MouseEvent) => void;
    onNextStep: (orderId: string) => void;
    onPriorityToggle: (orderId: string) => void;
    onDelete: (orderId: string) => void;
    onInvoiceDownload: (orderId: string) => void;
}

export default function OrderTableRow({
    order,
    isSelected,
    isRowSelected,
    deleteLoading,
    onRowClick,
    onCheckboxChange,
    onNextStep,
    onPriorityToggle,
    onDelete,
    onInvoiceDownload,
}: OrderTableRowProps) {
    const getStatusBadgeColor = (step: number) => {
        switch (step) {
            case 0:
                return 'bg-red-100 text-red-800';
            case 1:
                return 'bg-orange-100 text-orange-800';
            case 2:
                return 'bg-green-100 text-green-800';
            case 3:
                return 'bg-emerald-100 text-emerald-800';
            case 4:
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-purple-100 text-purple-800';
        }
    };

    return (
        <TableRow
            className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' :
                isRowSelected ? 'bg-gray-50' : ''
                }`}
            onClick={() => onRowClick(order.id)}
        >
            <TableCell className="p-2 w-[50px] min-w-[50px] max-w-[50px] text-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onCheckboxChange(order.id, e as any)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 cursor-pointer"
                />
            </TableCell>
            <TableCell className="p-2 w-[200px] min-w-[200px] max-w-[200px] text-center">
                <OrderActions
                    order={order}
                    deleteLoading={deleteLoading}
                    onNextStep={onNextStep}
                    onPriorityToggle={onPriorityToggle}
                    onDelete={onDelete}
                    onInvoiceDownload={onInvoiceDownload}
                />
            </TableCell>

            <TableCell className="font-medium text-center text-xs sm:text-sm w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words overflow-hidden">
                {order.bestellnummer}
            </TableCell>

            <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden">
                {order.kundenname}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words overflow-hidden">
                <span className={`px-1 sm:px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(order.currentStep)}`}>
                    {order.status}
                </span>
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words overflow-hidden">
                {order.preis}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden hidden md:table-cell">
                {order.zahlung}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden hidden lg:table-cell">
                {order.erstelltAm}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words overflow-hidden hidden lg:table-cell">
                {order.fertiggestelltAm}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[180px] min-w-[180px] max-w-[180px] whitespace-normal break-words overflow-hidden hidden xl:table-cell">
                {order.beschreibung}
            </TableCell>
            <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden">
                {order.fertigstellung}
            </TableCell>
        </TableRow>
    );
}

