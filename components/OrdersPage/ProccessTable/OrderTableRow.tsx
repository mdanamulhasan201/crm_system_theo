import { TableRow, TableCell } from "@/components/ui/table";
import { OrderData, useOrders } from "@/contexts/OrdersContext";
import Link from "next/link";
import { getPaymentStatusColor } from "@/lib/paymentStatusUtils";
import {
    AlertTriangle,
    ClipboardEdit,
    FileText,
    History,
    MoreVertical,
    QrCode,
    Scan,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    onPriceClick?: (orderId: string, customerName: string, orderNumber: string) => void;
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
    onPriceClick,
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

    const handleRowClick = (e: React.MouseEvent) => {
        // Don't trigger row click if clicking on checkbox, note button, or action buttons
        if ((e.target as HTMLElement).closest('[type="checkbox"]') ||
            (e.target as HTMLElement).closest('.checkbox-container') ||
            (e.target as HTMLElement).closest('button[title="Notizen anzeigen"]') ||
            (e.target as HTMLElement).closest('.order-actions')) {
            return;
        }
        onRowClick(order.id);
    };

    const normalizedStatus = order.displayStatus?.replace(/_/g, " ") || "";
    const isAbholbereit = normalizedStatus === "Abholbereit/Versandt";
    const isAusgefuehrt = normalizedStatus === "Ausgeführt";
    const showBarcodeAction = (isAbholbereit || isAusgefuehrt) && !!onBarcodeStickerClick;
    const hasInvoice = !!order.invoice;

    const parseGermanDateString = (dateStr?: string | null): Date | null => {
        if (!dateStr || dateStr === '—') return null;
        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;
        const [dayStr, monthStr, yearStr] = parts.map(p => p.trim());
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const getDueStatusLabel = (plannedDate: Date | null): string | null => {
        if (!plannedDate) return null;
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfPlanned = new Date(plannedDate.getFullYear(), plannedDate.getMonth(), plannedDate.getDate());
        const diffMs = startOfPlanned.getTime() - startOfToday.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Heute fällig';
        if (diffDays === 1) return 'Morgen fällig';
        if (diffDays > 1) return `In ${diffDays} Tagen fällig`;

        const overdueDays = Math.abs(diffDays);
        return `${overdueDays}d überfällig`;
    };

    const plannedDate = parseGermanDateString(order.fertiggestelltAm);
    const createdDate = parseGermanDateString(order.erstelltAm);
    const dueLabel = getDueStatusLabel(plannedDate);
    const createdLabel = createdDate
        ? `Erstellt ${createdDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
        })}`
        : order.erstelltAm && order.erstelltAm !== '—'
            ? `Erstellt ${order.erstelltAm}`
            : null;

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
            <TableCell className="py-4 px-6">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        {order.priority === "Dringend" && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[11px] font-semibold border border-red-200 shrink-0">
                                Dringend
                            </span>
                        )}
                        {order.customerId ? (
                            <Link
                                href={`/dashboard/customer-history/${order.customerId}`}
                                className="text-gray-900 hover:underline underline-offset-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {order.kundenname}
                            </Link>
                        ) : (
                            <span className="font-semibold text-gray-900 text-sm">
                                {order.kundenname}
                            </span>
                        )}
                    </div>
                    <span className="text-gray-500 text-xs">#{order.bestellnummer}</span>
                    <span className="text-gray-400 text-xs">{order.productName}</span>
                    {order.beschreibung && (
                        <span className="text-gray-400 text-xs">{order.beschreibung}</span>
                    )}
                </div>
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
            <TableCell className="py-4 px-6 text-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {onPriceClick ? (
                    <button
                        type="button"
                        onClick={() => onPriceClick(order.id, order.kundenname, order.bestellnummer)}
                        className="text-left font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                        {order.preis}
                    </button>
                ) : (
                    order.preis
                )}
            </TableCell>
            <TableCell className="py-4 px-6">
                <div className="flex flex-col items-center gap-1.5 py-1 px-1">
                    {renderPaymentStatus()}
                </div>
            </TableCell>
            <TableCell className="py-4 px-6">
                <div className="flex flex-row items-center justify-center gap-3">
                    <div className="flex flex-col items-start">
                        {dueLabel && (
                            <span
                                className={`text-sm font-medium ${
                                    dueLabel.includes('überfällig') || dueLabel === 'Heute fällig'
                                        ? dueLabel.includes('überfällig')
                                            ? 'text-red-600'
                                            : 'text-orange-500'
                                        : 'text-gray-700'
                                }`}
                            >
                                {dueLabel}
                            </span>
                        )}
                        {createdLabel && (
                            <span className="text-xs text-gray-500">
                                {createdLabel}
                            </span>
                        )}
                    </div>
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
            <TableCell className="py-4 px-6 order-actions">
                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {onScanClick && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 p-0 cursor-pointer rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onScanClick(order.id, order.bestellnummer, order.kundenname);
                                        }}
                                        aria-label="Scan-Daten"
                                    >
                                        <Scan className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Scan-Daten</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {showBarcodeAction && onBarcodeStickerClick && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 p-0 cursor-pointer rounded-full hover:bg-gray-100 text-gray-600 hover:text-green-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onBarcodeStickerClick(order.id, order.bestellnummer);
                                        }}
                                        aria-label="Barcode-Sticker"
                                    >
                                        <QrCode className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Barcode-Sticker</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 cursor-pointer rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                                aria-label="Weitere Aktionen"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-52"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {onHistoryClick && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onHistoryClick(order.id, order.bestellnummer);
                                    }}
                                >
                                    <History className="h-4 w-4" />
                                    <span>Historie</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                            className={`cursor-pointer ${!hasInvoice ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!hasInvoice}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasInvoice) {
                                    onInvoiceDownload(order.id);
                                }
                            }}
                        >
                            <ClipboardEdit className={`h-4 w-4 ${hasInvoice ? "text-blue-600" : "text-gray-400"}`} />
                            <span>Dokumente</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPriorityClick(order);
                            }}
                        >
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span>Priorität ändern</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(order.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Löschen</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
}

