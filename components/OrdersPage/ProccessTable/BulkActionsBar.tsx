import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/orderStatusMappings";
import { OrderData } from "@/contexts/OrdersContext";
import { normalizePaymentStatus } from "@/lib/paymentStatusUtils";

interface BulkActionsBarProps {
    selectedOrderIds: string[];
    selectedOrders: OrderData[];
    onClearSelection: () => void;
    onBulkDelete: (orderIds: string[]) => void;
    onBulkStatusChange: (orderIds: string[], status: string) => void;
    statusValue: string;
    onStatusValueChange: (value: string) => void;
    onBulkKrankenkasseStatus: (orderIds: string[], krankenkasseStatus: string) => void;
    isUpdatingKrankenkasseStatus: boolean;
    onBulkPaymentStatus?: (orderIds: string[], paymentStatus: string) => void;
    isUpdatingPaymentStatus?: boolean;
}

export default function BulkActionsBar({
    selectedOrderIds,
    selectedOrders,
    onClearSelection,
    onBulkDelete,
    onBulkStatusChange,
    statusValue,
    onStatusValueChange,
    onBulkKrankenkasseStatus,
    isUpdatingKrankenkasseStatus,
    onBulkPaymentStatus,
    isUpdatingPaymentStatus = false,
}: BulkActionsBarProps) {
    const handleBulkDelete = () => {
        onBulkDelete(selectedOrderIds);
    };

    const handleBulkStatusChange = (value: string) => {
        if (!value) return;
        onStatusValueChange(value);
        onBulkStatusChange(selectedOrderIds, value);
    };

    // Determine current KrankenkasseStatus from selected orders
    const getCurrentKrankenkasseStatus = (): string => {
        if (selectedOrders.length === 0) return 'Krankenkasse_Ungenehmigt';
        
        // Get all unique statuses from selected orders
        const statuses = selectedOrders
            .map(order => order.KrankenkasseStatus)
            .filter((status): status is string => status !== null && status !== undefined);
        
        if (statuses.length === 0) return 'Krankenkasse_Ungenehmigt';
        
        // If all orders have the same status, return that status
        const uniqueStatuses = [...new Set(statuses)];
        if (uniqueStatuses.length === 1) {
            return uniqueStatuses[0];
        }
        
        // If mixed statuses, return the most common one, or default to Ungenehmigt
        const statusCounts = statuses.reduce((acc, status) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const mostCommonStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        return mostCommonStatus || 'Krankenkasse_Ungenehmigt';
    };

    const currentKrankenkasseStatus = getCurrentKrankenkasseStatus();
    const isGenehmigt = currentKrankenkasseStatus === 'Krankenkasse_Genehmigt';
    
    const handleKrankenkasseToggle = () => {
        const newStatus = isGenehmigt ? 'Krankenkasse_Ungenehmigt' : 'Krankenkasse_Genehmigt';
        onBulkKrankenkasseStatus(selectedOrderIds, newStatus);
    };

    // Determine current payment status from selected orders
    // Returns: { status: string | null, isMixed: boolean }
    const getCurrentPaymentStatus = (): { status: string | null; isMixed: boolean } => {
        if (selectedOrders.length === 0) return { status: null, isMixed: false };
        
        // Get all normalized payment statuses from selected orders
        const statuses = selectedOrders
            .map(order => normalizePaymentStatus(order.bezahlt))
            .filter((status): status is string => status !== null);
        
        if (statuses.length === 0) return { status: null, isMixed: false };
        
        // If all orders have the same status, return that status
        const uniqueStatuses = [...new Set(statuses)];
        if (uniqueStatuses.length === 1) {
            return { status: uniqueStatuses[0], isMixed: false };
        }
        
        // If mixed statuses, return null with isMixed flag
        return { status: null, isMixed: true };
    };

    const { status: currentPaymentStatus, isMixed: hasMixedPaymentStatus } = getCurrentPaymentStatus();
    
    // Determine which payment status buttons to show
    const getPaymentStatusButtons = () => {
        if (!currentPaymentStatus || !onBulkPaymentStatus) return null;

        const buttons: React.ReactElement[] = [];

        // If Privat_Bezahlt - show button to change back to Privat_offen
        if (currentPaymentStatus === 'Privat_Bezahlt') {
            buttons.push(
                <Button
                    key="privat-offen"
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkPaymentStatus(selectedOrderIds, 'Privat_offen')}
                    disabled={isUpdatingPaymentStatus}
                    className="text-xs py-2 sm:py-3 lg:py-4 cursor-pointer whitespace-nowrap flex-shrink-0 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                    <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    Privat Offen
                </Button>
            );
            return buttons;
        }

        // If Privat_offen - show Privat_Bezahlt button
        if (currentPaymentStatus === 'Privat_offen') {
            buttons.push(
                <Button
                    key="privat-bezahlt"
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkPaymentStatus(selectedOrderIds, 'Privat_Bezahlt')}
                    disabled={isUpdatingPaymentStatus}
                    className="text-xs py-2 sm:py-3 lg:py-4 cursor-pointer whitespace-nowrap flex-shrink-0 bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                >
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    Privat Bezahlt
                </Button>
            );
            return buttons;
        }

        // If Krankenkasse_Ungenehmigt - show Krankenkasse_Genehmigt button
        if (currentPaymentStatus === 'Krankenkasse_Ungenehmigt') {
            buttons.push(
                <Button
                    key="krankenkasse-genehmigt"
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkPaymentStatus(selectedOrderIds, 'Krankenkasse_Genehmigt')}
                    disabled={isUpdatingPaymentStatus}
                    className="text-xs py-2 sm:py-3 lg:py-4 cursor-pointer whitespace-nowrap flex-shrink-0 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                >
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Krankenkasse </span>Genehmigt
                </Button>
            );
            return buttons;
        }

        // If Krankenkasse_Genehmigt - show button to change back to Krankenkasse_Ungenehmigt
        if (currentPaymentStatus === 'Krankenkasse_Genehmigt') {
            buttons.push(
                <Button
                    key="krankenkasse-ungenehmigt"
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkPaymentStatus(selectedOrderIds, 'Krankenkasse_Ungenehmigt')}
                    disabled={isUpdatingPaymentStatus}
                    className="text-xs py-2 sm:py-3 lg:py-4 cursor-pointer whitespace-nowrap flex-shrink-0 bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                >
                    <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Krankenkasse </span>Ungenehmigt
                </Button>
            );
            return buttons;
        }

        return null;
    };

    if (selectedOrderIds.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4 w-full">
                {/* Left Side - Selection Info and Clear Button */}
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap justify-center lg:justify-start w-full lg:w-auto">
                    <span className="text-xs sm:text-sm font-medium text-blue-900 whitespace-nowrap">
                        {selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} ausgewählt
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearSelection}
                        className="text-xs whitespace-nowrap bg-white"
                    >
                        Auswahl aufheben
                    </Button>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center lg:justify-end w-full lg:w-auto">
                    {/* Status Select */}
                    <Select value={statusValue || undefined} onValueChange={handleBulkStatusChange}>
                        <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[220px] text-xs cursor-pointer bg-white border-none py-2 sm:py-3 lg:py-4 flex-shrink-0">
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Payment Status Buttons */}
                        {getPaymentStatusButtons() && (
                            <div className="flex items-center gap-2">
                                {getPaymentStatusButtons()}
                            </div>
                        )}
                        {/* Only show Krankenkasse toggle if payment status is null (no payment status) but NOT when mixed */}
                        {/* Hide toggle when we have specific payment status buttons or mixed payment statuses */}
                        {currentPaymentStatus === null && !hasMixedPaymentStatus && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleKrankenkasseToggle}
                                disabled={isUpdatingKrankenkasseStatus}
                                className={`text-xs py-2 sm:py-3 lg:py-4 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                                    isGenehmigt 
                                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' 
                                        : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                                }`}
                            >
                                {isGenehmigt ? (
                                    <>
                                        <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                                        <span className="hidden sm:inline">Krankenkasse-</span>Genehmigt
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                                        <span className="hidden sm:inline">Krankenkasse-</span>Ungenehmigt
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="text-xs py-2 sm:py-3 lg:py-4 cursor-pointer whitespace-nowrap flex-shrink-0"
                        >
                            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Ausgewählte </span>löschen
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

