import React, { useState, useEffect } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Trash2, ClipboardEdit, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders, steps } from "@/contexts/OrdersContext";
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { useDeleteSingleOrder } from '@/hooks/orders/useDeleteSingleOrder';

export default function ProcessTable() {
    const {
        orders,
        loading,
        error,
        pagination,
        currentPage,
        selectedDays,
        selectedStatus,
        setCurrentPage,
        setSelectedDays,
        setSelectedStatus,
        togglePriority,
        moveToNextStep,
        refetch,
        refreshOrderData,
        deleteOrder
    } = useOrders();

    const { deleteSingleOrder, loading: deleteLoading } = useDeleteSingleOrder();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        type: 'nextStep' | 'priority' | 'delete';
        orderId: string;
        orderName: string;
        currentStatus: string;
        newStatus: string;
    } | null>(null);

    // Get the selected order's current step to show as active in the progress bar
    const getActiveStep = () => {
        if (!selectedOrderId) return -1; // No order selected

        const selectedOrder = orders.find(order => order.id === selectedOrderId);
        return selectedOrder ? selectedOrder.currentStep : -1;
    };

    const activeStep = getActiveStep();

    // Handle next step button click
    const handleNextStep = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const nextStep = order.currentStep + 1;
        if (nextStep >= steps.length) return;

        const nextGermanStatus = steps[nextStep];

        setPendingAction({
            type: 'nextStep',
            orderId: orderId,
            orderName: order.kundenname,
            currentStatus: order.displayStatus,
            newStatus: nextGermanStatus
        });
        setShowConfirmModal(true);
    };

    // Execute next step after confirmation
    const executeNextStep = async () => {
        if (!pendingAction) return;

        try {
            await moveToNextStep(pendingAction.orderId);
            setSelectedOrderId(pendingAction.orderId);

            toast.success(`Status erfolgreich geändert: ${pendingAction.currentStatus} → ${pendingAction.newStatus}`);

            // Refresh the order data to get the latest status
            setTimeout(() => {
                refreshOrderData(pendingAction.orderId);
            }, 500);
        } catch (error) {
            console.error('Failed to move to next step:', error);
            toast.error('Fehler beim Ändern des Status');
        } finally {
            setShowConfirmModal(false);
            setPendingAction(null);
        }
    };

    // Handle priority toggle and select order
    const handlePriorityToggle = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const isPrioritizing = !order.isPrioritized;
        const newStatus = isPrioritizing ? "Einlage vorbereiten" : "Zurück zu ursprünglichem Status";

        setPendingAction({
            type: 'priority',
            orderId: orderId,
            orderName: order.kundenname,
            currentStatus: order.displayStatus,
            newStatus: newStatus
        });
        setShowConfirmModal(true);
    };

    // Execute priority toggle after confirmation
    const executePriorityToggle = async () => {
        if (!pendingAction) return;

        try {
            await togglePriority(pendingAction.orderId);
            setSelectedOrderId(pendingAction.orderId);

            const order = orders.find(o => o.id === pendingAction.orderId);
            if (order) {
                const isPrioritizing = !order.isPrioritized;
                if (isPrioritizing) {
                    toast.success(`Auftrag erfolgreich priorisiert: ${pendingAction.orderName}`);
                } else {
                    toast.success(`Priorität erfolgreich entfernt: ${pendingAction.orderName}`);
                }
            }

            // Refresh the order data to get the latest status
            setTimeout(() => {
                refreshOrderData(pendingAction.orderId);
            }, 500);
        } catch (error) {
            console.error('Failed to toggle priority:', error);
            toast.error('Fehler beim Ändern der Priorität');
        } finally {
            setShowConfirmModal(false);
            setPendingAction(null);
        }
    };

    // Handle delete order
    const handleDeleteOrder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        setPendingAction({
            type: 'delete',
            orderId: orderId,
            orderName: order.kundenname,
            currentStatus: order.displayStatus,
            newStatus: 'Gelöscht'
        });
        setShowConfirmModal(true);
    };

    // Execute delete order after confirmation
    const executeDeleteOrder = async () => {
        if (!pendingAction) return;

        setIsDeleting(true);
        try {
            // Use context's deleteOrder which handles local state updates
            await deleteOrder(pendingAction.orderId);
            toast.success(`Auftrag erfolgreich gelöscht: ${pendingAction.orderName}`);

            // Clear selection if the deleted order was selected
            if (selectedOrderId === pendingAction.orderId) {
                setSelectedOrderId(null);
            }
        } catch (error) {
            console.error('Failed to delete order:', error);
            toast.error('Fehler beim Löschen des Auftrags');
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setPendingAction(null);
        }
    };

    // Handle invoice download
    const handleInvoiceDownload = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.invoice) {
            toast.error('Keine Rechnung verfügbar für diesen Auftrag');
            return;
        }

        try {
            // Create a temporary anchor element to trigger download
            const link = document.createElement('a');
            link.href = order.invoice;
            link.download = `Rechnung_${order.bestellnummer}_${order.kundenname.replace(/\s+/g, '_')}.pdf`;
            link.target = '_blank';

            // Append to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Rechnung wird heruntergeladen...');
        } catch (error) {
            console.error('Failed to download invoice:', error);
            toast.error('Fehler beim Herunterladen der Rechnung');
        }
    };

    // Handle status filter
    const handleStatusFilter = (status: string) => {
        // console.log('Filtering by status:', status);
        if (selectedStatus === status) {
            // If clicking the same status, clear the filter
            // console.log('Clearing status filter');
            setSelectedStatus(null);
        } else {
            // Set the new status filter
            // console.log('Setting status filter to:', status);
            setSelectedStatus(status);
        }
        setSelectedOrderId(null); // Reset selection when changing filters
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        setSelectedOrderId(null); // Reset selection when changing pages
    };

    // Clear selection when orders change
    useEffect(() => {
        if (orders.length > 0 && selectedOrderId) {
            const orderExists = orders.some(order => order.id === selectedOrderId);
            if (!orderExists) {
                setSelectedOrderId(null);
            }
        }
    }, [orders, selectedOrderId]);

    const memoizedOrders = React.useMemo(() => orders, [orders]);

    // Get status color for each step
    const getStepColor = (stepIndex: number, isActive: boolean) => {
        const colors = [
            'bg-[#FF0000]',
            'bg-[#FFA617]',
            'bg-[#96F30080]',
            'bg-[#4CAF50]',
            'bg-[#2196F3]',
            'bg-[#9C27B0]',
        ];

        if (isActive) {
            return `font-bold ${colors[stepIndex] || 'text-black'}`;
        }
        return 'text-gray-400 font-normal';
    };

    // Remove the early return for loading - we'll handle it in the table body

    if (error) {
        return (
            <div className="mt-6 sm:mt-10 max-w-full flex justify-center items-center py-20">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Fehler: {error}</p>
                    <Button onClick={refetch} variant="outline">
                        Erneut versuchen
                    </Button>
                </div>
            </div>
        );
    }

    // Remove the early return for empty orders - we'll handle it in the table body

    return (
        <div className="mt-6 sm:mt-10 max-w-full overflow-x-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4 border-b-2 border-gray-400 pb-4">

                {/* status bar */}
                <div className="flex items-center w-full overflow-x-auto">
                    {steps.map((step, idx) => {
                        // Map German step names to API status values
                        const stepToApiStatus: Record<string, string> = {
                            "Einlage vorbereiten": "Einlage_vorbereiten",
                            "Einlage in Fertigung": "Einlage_in_Fertigung",
                            "Einlage verpacken": "Einlage_verpacken",
                            "Einlage Abholbereit": "Einlage_Abholbereit",
                            "Einlage versandt": "Einlage_versandt",
                            "Ausgeführte Einlagen": "Ausgeführte_Einlagen"
                        };

                        const apiStatus = stepToApiStatus[step];
                        const isFilterActive = selectedStatus === apiStatus;
                        const isStepActive = idx === activeStep;

                        return (
                            <React.Fragment key={step}>
                                <div
                                    className={`flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px] xl:min-w-[160px] flex-shrink-0 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors ${isFilterActive ? 'bg-blue-100 border-2 border-blue-500' : ''
                                        }`}
                                    onClick={() => handleStatusFilter(apiStatus)}
                                    title={`Click to filter by ${step}${isFilterActive ? ' (click again to clear)' : ''}`}
                                >
                                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mb-1 sm:mb-2 ${isStepActive ? 'bg-blue-600' :
                                            isFilterActive ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}></div>
                                    <span className={`text-xs sm:text-sm text-center px-1 leading-tight ${isStepActive ? getStepColor(idx, true) :
                                            isFilterActive ? 'text-blue-700 font-semibold' :
                                                'text-gray-600'
                                        }`}>
                                        {step}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-px mx-1 sm:mx-2 ${idx < activeStep ? 'bg-blue-600' :
                                            isFilterActive ? 'bg-blue-300' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Zeitraum:</span>
                        <Select value={selectedDays.toString()} onValueChange={(value) => setSelectedDays(parseInt(value))}>
                            <SelectTrigger className="w-32 text-xs sm:text-sm cursor-pointer">
                                <SelectValue placeholder="Tage wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Tage</SelectItem>
                                <SelectItem value="30">30 Tage</SelectItem>
                                <SelectItem value="40">40 Tage</SelectItem>
                            </SelectContent>
                        </Select>

                        {selectedStatus && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStatus(null)}
                                className="text-xs h-8 px-2 cursor-pointer"
                            >
                                Filter löschen
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Table className="table-fixed w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px] min-w-[200px] max-w-[200px] text-center"></TableHead>
                        <TableHead className="w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words text-xs sm:text-sm text-center">Bestellnummer</TableHead>
                        <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm text-center">Kundenname</TableHead>
                        <TableHead className="w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words text-xs sm:text-sm text-center">Status</TableHead>
                        <TableHead className="w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words text-xs sm:text-sm text-center">Preis</TableHead>
                        <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm hidden md:table-cell text-center">Zahlung</TableHead>
                        <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm hidden lg:table-cell text-center">Erstellt am</TableHead>
                        <TableHead className="w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words text-xs sm:text-sm hidden lg:table-cell text-center">Fertiggestellt am</TableHead>
                        <TableHead className="w-[180px] min-w-[180px] max-w-[180px] whitespace-normal break-words text-xs sm:text-sm hidden xl:table-cell text-center">Beschreibung</TableHead>
                        {/* <TableHead className="w-[200px] min-w-[200px] max-w-[200px] whitespace-normal break-words text-xs sm:text-sm hidden xl:table-cell text-center">Abholort / Versand</TableHead> */}
                        <TableHead className="w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words text-xs sm:text-sm text-center">Status aktualisieren</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={11} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Aufträge werden geladen...</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : memoizedOrders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-gray-600 mb-4 text-lg">Keine Aufträge gefunden</p>
                                    <Button onClick={refetch} variant="outline">
                                        Aktualisieren
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        memoizedOrders.map((row, idx) => (
                            <TableRow
                                key={row.id}
                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedOrderId === row.id ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedOrderId(row.id)}
                            >
                                <TableCell className="p-2 w-[200px] min-w-[200px] max-w-[200px] text-center">
                                    <div className="flex gap-1 sm:gap-2 justify-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-6 cursor-pointer sm:h-8 px-1 sm:px-2 text-xs hover:bg-gray-200 flex items-center gap-1 min-w-fit ${row.currentStep >= steps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNextStep(row.id);
                                            }}
                                            disabled={row.currentStep >= steps.length - 1}
                                            title={row.currentStep >= steps.length - 1 ? "Bereits im letzten Schritt" : "Nächster Schritt"}
                                        >
                                            <ArrowLeft className="h-3 w-3 text-gray-700" />
                                            <span className="hidden sm:inline text-gray-700">Nächster</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-red-100 ${row.isPrioritized ? 'bg-red-100' : ''}`}
                                            title="Auftrag priorisieren"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePriorityToggle(row.id);
                                            }}
                                        >
                                            <AlertTriangle className={`h-3 w-3 ${row.isPrioritized ? 'text-red-600 fill-current' : 'text-red-500'}`} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-200"
                                            title="Löschen"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteOrder(row.id);
                                            }}
                                            disabled={deleteLoading}
                                        >
                                            <Trash2 className="h-3 w-3 text-gray-700" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-6 cursor-pointer w-6 sm:h-8 sm:w-8 p-0 hover:bg-blue-100 ${!row.invoice ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            title={row.invoice ? "Rechnung herunterladen" : "Keine Rechnung verfügbar"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (row.invoice) {
                                                    handleInvoiceDownload(row.id);
                                                }
                                            }}
                                            disabled={!row.invoice}
                                        >
                                            <ClipboardEdit className={`h-3 w-3 ${row.invoice ? 'text-blue-600' : 'text-gray-400'}`} />
                                        </Button>
                                    </div>
                                </TableCell>

                                <TableCell className="font-medium text-center text-xs sm:text-sm w-[120px] min-w-[120px] max-w-[120px] whitespace-normal break-words overflow-hidden">{row.bestellnummer}</TableCell>

                                <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden">{row.kundenname}</TableCell>
                                <TableCell className="text-center text-xs sm:text-sm w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words overflow-hidden">
                                    <span className={`px-1 sm:px-2 py-1 rounded text-xs font-medium ${row.currentStep === 0 ? 'bg-red-100 text-red-800' :
                                        row.currentStep === 1 ? 'bg-orange-100 text-orange-800' :
                                            row.currentStep === 2 ? 'bg-green-100 text-green-800' :
                                                row.currentStep === 3 ? 'bg-emerald-100 text-emerald-800' :
                                                    row.currentStep === 4 ? 'bg-blue-100 text-blue-800' :
                                                        'bg-purple-100 text-purple-800'
                                        }`}>
                                        {row.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center text-xs sm:text-sm w-[100px] min-w-[100px] max-w-[100px] whitespace-normal break-words overflow-hidden">{row.preis}</TableCell>
                                <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden hidden md:table-cell">{row.zahlung}</TableCell>
                                <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden hidden lg:table-cell">{row.erstelltAm}</TableCell>
                                <TableCell className="text-center text-xs sm:text-sm w-[160px] min-w-[160px] max-w-[160px] whitespace-normal break-words overflow-hidden hidden lg:table-cell">{row.fertiggestelltAm}</TableCell>
                                <TableCell className="text-center text-xs sm:text-sm w-[180px] min-w-[180px] max-w-[180px] whitespace-normal break-words overflow-hidden hidden xl:table-cell">{row.beschreibung}</TableCell>
                                {/* <TableCell className="text-center text-xs sm:text-sm w-[200px] min-w-[200px] max-w-[200px] whitespace-normal break-words overflow-hidden hidden xl:table-cell">{row.abholort}</TableCell> */}
                                <TableCell className="text-center text-xs sm:text-sm w-[140px] min-w-[140px] max-w-[140px] whitespace-normal break-words overflow-hidden">{row.fertigstellung}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            {pagination && !loading && (
                <div className="flex justify-between items-center mt-6 px-4">
                    <div className="text-sm text-gray-600">
                        {memoizedOrders.length === 0 ? (
                            <span>
                                Keine Aufträge gefunden
                                {selectedStatus && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • Gefiltert nach: {steps.find((_, idx) => {
                                            const stepToApiStatus: Record<string, string> = {
                                                "Einlage vorbereiten": "Einlage_vorbereiten",
                                                "Einlage in Fertigung": "Einlage_in_Fertigung",
                                                "Einlage verpacken": "Einlage_verpacken",
                                                "Einlage Abholbereit": "Einlage_Abholbereit",
                                                "Einlage versandt": "Einlage_versandt",
                                                "Ausgeführte Einlagen": "Ausgeführte_Einlagen"
                                            };
                                            return stepToApiStatus[steps[idx]] === selectedStatus;
                                        })}
                                    </span>
                                )}
                            </span>
                        ) : (
                            <span>
                                Zeige {((currentPage - 1) * pagination.itemsPerPage) + 1} bis {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} von {pagination.totalItems} Aufträgen ({memoizedOrders.length} auf dieser Seite)
                                {/* {selectedStatus && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        • Filtered by: {steps.find((_, idx) => {
                                            const stepToApiStatus: Record<string, string> = {
                                                "Einlage vorbereiten": "Einlage_vorbereiten",
                                                "Einlage in Fertigung": "Einlage_in_Fertigung", 
                                                "Einlage verpacken": "Einlage_verpacken",
                                                "Einlage Abholbereit": "Einlage_Abholbereit",
                                                "Einlage versandt": "Einlage_versandt",
                                                "Ausgeführte Einlagen": "Ausgeführte_Einlagen"
                                            };
                                            return stepToApiStatus[steps[idx]] === selectedStatus;
                                        })}
                                    </span>
                                )} */}
                            </span>
                        )}
                    </div>
                    {memoizedOrders.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Zurück
                            </Button>

                            <span className="text-sm text-gray-600 px-3">
                                Seite {currentPage} von {pagination.totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="flex items-center gap-1"
                            >
                                Weiter
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                open={showConfirmModal}
                onOpenChange={setShowConfirmModal}
                title={pendingAction?.type === 'delete' ? "Auftrag löschen bestätigen" : "Status ändern bestätigen"}
                description={pendingAction?.type === 'delete' ? "Sind Sie sicher, dass Sie den Auftrag" : "Sind Sie sicher, dass Sie den Status für den Auftrag"}
                orderName={pendingAction?.orderName}
                currentStatus={pendingAction?.currentStatus || ''}
                newStatus={pendingAction?.newStatus || ''}
                onConfirm={() => {
                    if (pendingAction?.type === 'nextStep') {
                        executeNextStep();
                    } else if (pendingAction?.type === 'priority') {
                        executePriorityToggle();
                    } else if (pendingAction?.type === 'delete') {
                        executeDeleteOrder();
                    }
                }}
                confirmText={pendingAction?.type === 'delete' ? "Ja, löschen" : "Ja, Status ändern"}
                isDeleteAction={pendingAction?.type === 'delete'}
                isLoading={isDeleting}
            />
        </div>
    );
}
