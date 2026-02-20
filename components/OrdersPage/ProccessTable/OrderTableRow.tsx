import { TableRow, TableCell } from "@/components/ui/table";
import { OrderData, useOrders } from "@/contexts/OrdersContext";
import OrderActions from "./OrderActions";
import Link from "next/link";
import { getPaymentStatusColor } from "@/lib/paymentStatusUtils";
import { History, Scan, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Custom Checkbox Component with emerald/green border
function CustomCheckbox({
    checked,
    onChange,
    id,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
}) {
    return (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div
                className={`
                    w-4 h-4 rounded border-2 cursor-pointer transition-all
                    flex items-center justify-center
                    ${checked
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-emerald-300 hover:border-emerald-400'
                    }
                `}
                onClick={() => onChange(!checked)}
            >
                {checked && (
                    <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
}

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
    onNoteClick?: (orderId: string) => void;
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
    onNoteClick,
}: OrderTableRowProps) {
    const { selectedType } = useOrders();
    // Helper function to safely get string value
    const getSafeString = (value: any): string => {
        if (value == null) return '';
        if (typeof value === 'string') return value;
        // Handle object with title/description properties (e.g., geschaeftsstandort)
        if (typeof value === 'object' && value !== null) {
            if (value.title && typeof value.title === 'string') {
                return value.title.trim() || (value.description && typeof value.description === 'string' ? value.description.trim() : '');
            }
            if (value.description && typeof value.description === 'string') {
                return value.description.trim();
            }
        }
        try {
            return String(value);
        } catch {
            return '';
        }
    };

    // Get safe geschaeftsstandort string
    const geschaeftsstandortStr = getSafeString(order.geschaeftsstandort);
    // Ensure it's a string before calling substring
    const safeGeschaeftsstandortStr = typeof geschaeftsstandortStr === 'string' ? geschaeftsstandortStr : '';
    const geschaeftsstandortInitials = safeGeschaeftsstandortStr.length >= 2 
        ? safeGeschaeftsstandortStr.substring(0, 2).toUpperCase() 
        : safeGeschaeftsstandortStr.toUpperCase();

    const getStatusBadgeColor = (status: string, type?: string | null) => {
        const normalizedStatus = status.replace(/_/g, ' ');
        
        // Status colors for both types
        if (normalizedStatus === 'Warten auf Versorgungsstart') {
            return 'bg-red-100 text-red-800';
        } else if (normalizedStatus === 'In Fertigung') {
            return 'bg-orange-100 text-orange-800';
        } else if (normalizedStatus === 'In Modellierung') {
            return 'bg-purple-100 text-purple-800';
        } else if (normalizedStatus === 'Warten auf Fräsvorgang') {
            return 'bg-yellow-100 text-yellow-800';
        } else if (normalizedStatus === 'Fräsvorgang') {
            return 'bg-indigo-100 text-indigo-800';
        } else if (normalizedStatus === 'Feinschliff') {
            return 'bg-cyan-100 text-cyan-800';
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
        // Format display text - replace underscores with spaces for better readability
        let displayText = order.zahlung.includes(' - ')
            ? order.zahlung.split(' - ').join(' • ') // Replace " - " with " • " for better display
            : order.zahlung;
        
        // Replace underscores with spaces for better display
        displayText = displayText.replace(/_/g, ' ');

        return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text} break-words`} style={{ wordBreak: 'break-word' }}>
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

    const getEmployeeInitials = (employeeName: string): string => {
        const names = employeeName.trim().split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }
        return employeeName.charAt(0).toUpperCase();
    };


    const handleRowClick = (e: React.MouseEvent) => {
        // Don't trigger row click if clicking on checkbox, note button, or action buttons
        if ((e.target as HTMLElement).closest('[type="checkbox"]') ||
            (e.target as HTMLElement).closest('.checkbox-container') ||
            (e.target as HTMLElement).closest('button[title="Notizen anzeigen"]') ||
            (e.target as HTMLElement).closest('button[title="Historie"]') ||
            (e.target as HTMLElement).closest('button[title="Scan"]') ||
            (e.target as HTMLElement).closest('.order-actions')) {
            return;
        }
        onRowClick(order.id);
    };

    return (
        <TableRow
            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${isRowSelected ? 'bg-gray-50' : ''}`}
            onClick={handleRowClick}
        >
            <TableCell className="py-4 px-4">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="checkbox-container">
                        <CustomCheckbox
                            checked={isSelected}
                            onChange={(checked) => {
                                // Create a synthetic event for the handler
                                const syntheticEvent = {
                                    stopPropagation: () => {},
                                    preventDefault: () => {},
                                } as unknown as React.MouseEvent;
                                onCheckboxChange(order.id, syntheticEvent);
                            }}
                            id={`checkbox-${order.id}`}
                        />
                    </div>
                    {onNoteClick && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onNoteClick(order.id);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                            title="Notizen anzeigen"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </TableCell>
            <TableCell className="py-4 px-6 text-center">
                {renderPriorityBadge()}
            </TableCell>

            <TableCell className="py-4 px-6 font-medium text-sm whitespace-nowrap">
                {order.bestellnummer}
            </TableCell>

            <TableCell className="py-4 px-6 text-sm">
                {order.customerId ? (
                    <Link
                        href={`/dashboard/customer-history/${order.customerId}`}
                        className="text-[#2F7D5C] hover:underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {order.kundenname}
                    </Link>
                ) : (
                    <span className="text-gray-900">{order.kundenname}</span>
                )}
            </TableCell>
            <TableCell className="py-4 px-6">
                <div className="flex flex-row items-center justify-center gap-2 flex-wrap">
                    <span 
                        className={`px-1 sm:px-2 py-1 rounded text-xs font-medium whitespace-normal break-words ${getStatusBadgeColor(order.displayStatus, selectedType)} ${
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
                    {order.employee?.employeeName && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div 
                                        className="flex items-center justify-center cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#61A175] text-white flex items-center justify-center text-xs font-semibold hover:bg-[#61A175]/80 transition-colors">
                                            {order.employee.employeeName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-semibold text-sm">{order.employee.employeeName}</div>
                                        <div className="text-xs text-gray-300">{order.employee.email}</div>
                                        {order.employee.accountName && (
                                            <div className="text-xs text-gray-400 mt-1">Account: {order.employee.accountName}</div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>
            <TableCell className="py-4 px-6 text-sm whitespace-nowrap">
                {order.preis}
            </TableCell>
            <TableCell className="py-4 px-6">
                <div className="flex flex-col items-center gap-1.5 py-1 px-1">
                    {renderPaymentStatus()}
                </div>
            </TableCell>
            <TableCell className="py-4 px-6 text-sm whitespace-nowrap">
                {order.erstelltAm}
            </TableCell>
            <TableCell className="py-4 px-6">
                <div className="flex flex-row items-center justify-center gap-2">
                    <span className="text-sm">{order.fertiggestelltAm}</span>
                    {safeGeschaeftsstandortStr && safeGeschaeftsstandortStr.trim() !== '' && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div 
                                        className="flex items-center justify-center cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#61A175] text-white flex items-center justify-center text-xs font-semibold hover:bg-[#61A175]/80 transition-colors">
                                            {geschaeftsstandortInitials}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-semibold text-sm">Abholort: {safeGeschaeftsstandortStr}</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>
            <TableCell className="py-4 px-6 text-sm whitespace-nowrap">
                {order.beschreibung}
            </TableCell>
            <TableCell className="py-4 px-6">
                <div className="flex gap-2 sm:gap-3 justify-center items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                        title="Historie"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onHistoryClick) {
                                onHistoryClick(order.id, order.bestellnummer);
                            }
                        }}
                    >
                        <History className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                        title="Scan"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onScanClick) {
                                onScanClick(order.id, order.bestellnummer, order.kundenname);
                            }
                        }}
                    >
                        <Scan className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="py-4 px-6 order-actions">
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

