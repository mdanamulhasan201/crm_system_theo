import React, { useState, useEffect, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrders, OrderData } from "@/contexts/OrdersContext";
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import StatusFilterBar from "./StatusFilterBar";
import BulkActionsBar from "./BulkActionsBar";
import OrderTableHeader from "./OrderTableHeader";
import OrderTableRow from "./OrderTableRow";
import PaginationControls from "./PaginationControls";
import HistorySidebar from "./HistorySidebar";
import VersorgungModal from "./VersorgungModal";
import ScanPictureModal from "./ScanPictureModal";
import BarcodeStickerModal from "./BarcodeSticker/BarcodeStickerModal";
import { useOrderActions } from "@/hooks/orders/useOrderActions";
import { getLabelFromApiStatus } from "@/lib/orderStatusMappings";
import { getBarCodeData } from '@/apis/barCodeGenerateApis';
import { getKrankenKasseStatus, getPaymentStatus } from '@/apis/productsOrder';

import toast from 'react-hot-toast';

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
        refetch,
        deleteBulkOrders,
        bulkUpdateOrderStatus,
        updateOrderPriority,
        updateBulkKrankenkasseStatus,
        updateBulkPaymentStatus,
        orderIdFromSearch, // Get orderId from URL
    } = useOrders();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // When orderId is in URL, select that order in the table
    useEffect(() => {
        if (orderIdFromSearch && orders.some(order => order.id === orderIdFromSearch)) {
            setSelectedOrderId(orderIdFromSearch);
        }
    }, [orderIdFromSearch, orders]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkStatusSelectValue, setBulkStatusSelectValue] = useState<string>("");
    const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
    const [isBulkStatusUpdating, setIsBulkStatusUpdating] = useState(false);
    const [pendingBulkStatus, setPendingBulkStatus] = useState<{
        orderIds: string[];
        newStatus: string;
    } | null>(null);
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [priorityModalOrder, setPriorityModalOrder] = useState<OrderData | null>(null);
    const [prioritySelection, setPrioritySelection] = useState<'Dringend' | 'Normal'>('Normal');
    const [isPriorityUpdating, setIsPriorityUpdating] = useState(false);
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);
    const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);
    const [historyOrderNumber, setHistoryOrderNumber] = useState<string | null>(null);
    const [showVersorgungModal, setShowVersorgungModal] = useState(false);
    const [versorgungOrderId, setVersorgungOrderId] = useState<string | null>(null);
    const [versorgungOrderNumber, setVersorgungOrderNumber] = useState<string | null>(null);
    const [versorgungCustomerName, setVersorgungCustomerName] = useState<string | null>(null);
    const [showScanModal, setShowScanModal] = useState(false);
    const [scanOrderId, setScanOrderId] = useState<string | null>(null);
    const [scanOrderNumber, setScanOrderNumber] = useState<string | null>(null);
    const [scanCustomerName, setScanCustomerName] = useState<string | null>(null);
    const [showBarcodeStickerModal, setShowBarcodeStickerModal] = useState(false);
    const [barcodeStickerOrderId, setBarcodeStickerOrderId] = useState<string | null>(null);
    const [barcodeStickerOrderNumber, setBarcodeStickerOrderNumber] = useState<string | null>(null);
    const [autoGenerateBarcode, setAutoGenerateBarcode] = useState(false);
    const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
    const [isUpdatingKrankenkasseStatus, setIsUpdatingKrankenkasseStatus] = useState(false);
    const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

    // Direct generate and send PDF when status is clicked
    const handleStatusClickGenerateAndSend = async (orderId: string, orderNumber: string) => {
        if (isGeneratingBarcode) return;

        setIsGeneratingBarcode(true);
        try {
            // Fetch barcode data
            const response = await getBarCodeData(orderId);
            if (!response.success || !response.data) {
                toast.error('Fehler beim Laden der Barcode-Daten');
                setIsGeneratingBarcode(false);
                return;
            }

            const barcodeData = response.data;

            // Open modal with auto-generate to handle PDF generation
            setBarcodeStickerOrderId(orderId);
            setBarcodeStickerOrderNumber(orderNumber);
            setAutoGenerateBarcode(true);
            setShowBarcodeStickerModal(true);

            // The modal will handle generation and sending
        } catch (error) {
            console.error('Failed to start PDF generation:', error);
            toast.error('Fehler beim Starten der PDF-Generierung');
            setIsGeneratingBarcode(false);
        }
    };

    const {
        showConfirmModal,
        setShowConfirmModal,
        isDeleting,
        pendingAction,
        deleteLoading,
        handleDeleteOrder,
        executeDeleteOrder,
        handleInvoiceDownload,
    } = useOrderActions();


    // Memoized orders
    const memoizedOrders = useMemo(() => orders, [orders]);

    // Handle status filter
    const handleStatusFilter = (status: string) => {
        if (selectedStatus === status) {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(status);
        }
        setSelectedOrderId(null);
        setSelectedOrderIds([]);
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        setSelectedOrderId(null);
        setSelectedOrderIds([]);
    };

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectedOrderIds.length === memoizedOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(memoizedOrders.map(order => order.id));
        }
    };

    // Handle individual checkbox
    const handleSelectOrder = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedOrderIds(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    // Check if all visible orders are selected
    const isAllSelected = memoizedOrders.length > 0 && selectedOrderIds.length === memoizedOrders.length;
    const isSomeSelected = selectedOrderIds.length > 0 && selectedOrderIds.length < memoizedOrders.length;

    // Clear selection when orders change (but preserve selection if orders still exist)
    useEffect(() => {
        if (orders.length > 0 && selectedOrderId) {
            const orderExists = orders.some(order => order.id === selectedOrderId);
            if (!orderExists) {
                setSelectedOrderId(null);
            }
        }

        // Clean up multiselect for orders that no longer exist
        // But preserve selection if orders still exist (to prevent unchecking during updates)
        if (selectedOrderIds.length > 0) {
            const validIds = selectedOrderIds.filter(id =>
                orders.some(order => order.id === id)
            );
            // Only update if some orders were actually removed (not just a data refresh)
            // This prevents clearing selection when orders are refetched with same IDs
            if (validIds.length < selectedOrderIds.length && validIds.length >= 0) {
                setSelectedOrderIds(validIds.length > 0 ? validIds : []);
            }
        }
    }, [orders, selectedOrderId, selectedOrderIds]);

    // Handle confirm modal actions
    const handleConfirm = async () => {
        if (pendingAction?.type === 'delete') {
            await executeDeleteOrder((id: string | null) => setSelectedOrderId(id));
        }
    };

    // Handle bulk delete
    const handleBulkDelete = (orderIds: string[]) => {
        setShowBulkDeleteModal(true);
    };

    const handleBulkStatusChange = (orderIds: string[], newStatus: string) => {
        if (orderIds.length === 0) return;
        setPendingBulkStatus({ orderIds, newStatus });
        setShowBulkStatusModal(true);
    };

    const executeBulkStatusChange = async () => {
        if (!pendingBulkStatus) return;
        setIsBulkStatusUpdating(true);
        try {
            await bulkUpdateOrderStatus(pendingBulkStatus.orderIds, pendingBulkStatus.newStatus);
            toast.success('Status erfolgreich aktualisiert');
            setShowBulkStatusModal(false);
            setPendingBulkStatus(null);
            setSelectedOrderIds([]);
            setBulkStatusSelectValue("");
        } catch (error) {
            console.error('Failed to update statuses:', error);
            toast.error('Fehler beim Aktualisieren des Status');
        } finally {
            setIsBulkStatusUpdating(false);
        }
    };

    // Handle bulk Krankenkasse status update
    const handleBulkKrankenkasseStatus = async (orderIds: string[], krankenkasseStatus: string) => {
        if (orderIds.length === 0) return;
        setIsUpdatingKrankenkasseStatus(true);
        try {
            // Optimistically update the UI immediately (no table reload needed)
            updateBulkKrankenkasseStatus(orderIds, krankenkasseStatus);

            // Then update on the server
            await getKrankenKasseStatus(orderIds, krankenkasseStatus);
            toast.success(`Krankenkasse-Status erfolgreich aktualisiert`);

            // Don't refetch - optimistic update already shows the change
            // This prevents table reload and preserves selection
            // The data is already updated in the UI via optimistic update

        } catch (error) {
            console.error('Failed to update Krankenkasse status:', error);
            toast.error('Fehler beim Aktualisieren des Krankenkasse-Status');
            // Only refetch on error to revert the optimistic update
            refetch();
        } finally {
            setIsUpdatingKrankenkasseStatus(false);
        }
    };

    // Handle bulk payment status update with optimistic update
    const handleBulkPaymentStatus = async (orderIds: string[], paymentStatus: string) => {
        if (orderIds.length === 0) return;
        setIsUpdatingPaymentStatus(true);
        try {
            // Optimistically update the UI immediately (no table reload needed)
            updateBulkPaymentStatus(orderIds, paymentStatus);

            // Then update on the server
            await getPaymentStatus(orderIds, paymentStatus, paymentStatus);
            toast.success(`${orderIds.length} ${orderIds.length === 1 ? 'Auftrag' : 'Aufträge'} Zahlungsstatus erfolgreich aktualisiert`);

            // Don't refetch - optimistic update already shows the change
            // This prevents table reload and preserves selection
            setSelectedOrderIds([]);
        } catch (error) {
            console.error('Failed to update payment status:', error);
            toast.error('Fehler beim Aktualisieren des Zahlungsstatus');
            // Only refetch on error to revert the optimistic update
            refetch();
        } finally {
            setIsUpdatingPaymentStatus(false);
        }
    };

    useEffect(() => {
        if (selectedOrderIds.length === 0) {
            setBulkStatusSelectValue("");
        }
    }, [selectedOrderIds.length]);

    const executeBulkDelete = async () => {
        if (selectedOrderIds.length === 0) return;

        setIsBulkDeleting(true);
        try {
            await deleteBulkOrders(selectedOrderIds);
            toast.success(`${selectedOrderIds.length} ${selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} erfolgreich gelöscht`);
            setSelectedOrderIds([]);
            setSelectedOrderId(null);
        } catch (error) {
            console.error('Failed to delete orders:', error);
            toast.error('Fehler beim Löschen der Aufträge');
        } finally {
            setIsBulkDeleting(false);
            setShowBulkDeleteModal(false);
        }
    };

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

    return (
        <div className="mt-6 sm:mt-10 max-w-full overflow-x-auto">
            {selectedOrderIds.length === 0 ? (
                <StatusFilterBar
                    selectedDays={selectedDays}
                    selectedStatus={selectedStatus}
                    activeStep={-1}
                    onDaysChange={setSelectedDays}
                    onStatusFilter={handleStatusFilter}
                    onClearFilter={() => setSelectedStatus(null)}
                />
            ) : (
                <BulkActionsBar
                    selectedOrderIds={selectedOrderIds}
                    selectedOrders={memoizedOrders.filter(order => selectedOrderIds.includes(order.id))}
                    onClearSelection={() => setSelectedOrderIds([])}
                    onBulkDelete={handleBulkDelete}
                    onBulkStatusChange={handleBulkStatusChange}
                    statusValue={bulkStatusSelectValue}
                    onStatusValueChange={setBulkStatusSelectValue}
                    onBulkKrankenkasseStatus={handleBulkKrankenkasseStatus}
                    isUpdatingKrankenkasseStatus={isUpdatingKrankenkasseStatus}
                    onBulkPaymentStatus={handleBulkPaymentStatus}
                    isUpdatingPaymentStatus={isUpdatingPaymentStatus}
                />
            )}

            <Table className="w-full min-w-[1600px]">
                <TableHeader>
                    <OrderTableHeader
                        isAllSelected={isAllSelected}
                        isSomeSelected={isSomeSelected}
                        onSelectAll={handleSelectAll}
                    />
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={12} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Aufträge werden geladen...</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : memoizedOrders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={12} className="text-center py-20">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-gray-600 mb-4 text-lg">Keine Aufträge gefunden</p>
                                    <Button onClick={refetch} variant="outline">
                                        Aktualisieren
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        memoizedOrders.map((order) => (
                            <OrderTableRow
                                key={order.id}
                                order={order}
                                isSelected={selectedOrderIds.includes(order.id)}
                                isRowSelected={selectedOrderId === order.id}
                                deleteLoading={deleteLoading}
                                onRowClick={setSelectedOrderId}
                                onCheckboxChange={handleSelectOrder}
                                onDelete={(id) => handleDeleteOrder(id, (id: string | null) => setSelectedOrderId(id))}
                                onInvoiceDownload={handleInvoiceDownload}
                                onBarcodeStickerClick={(orderId, orderNumber, autoGenerate) => {
                                    setBarcodeStickerOrderId(orderId);
                                    setBarcodeStickerOrderNumber(orderNumber);
                                    setAutoGenerateBarcode(autoGenerate || false);
                                    setShowBarcodeStickerModal(true);
                                }}
                                onStatusClickGenerateAndSend={handleStatusClickGenerateAndSend}
                                onPriorityClick={(orderData) => {
                                    setPriorityModalOrder(orderData);
                                    setPrioritySelection(orderData.priority || 'Normal');
                                    setShowPriorityModal(true);
                                }}
                                onHistoryClick={(orderId, orderNumber) => {
                                    setHistoryOrderId(orderId);
                                    setHistoryOrderNumber(orderNumber);
                                    setShowHistorySidebar(true);
                                }}
                                onScanClick={(orderId, orderNumber, customerName) => {
                                    setScanOrderId(orderId);
                                    setScanOrderNumber(orderNumber);
                                    setScanCustomerName(customerName);
                                    setShowScanModal(true);
                                }}
                                onVersorgungClick={(orderId, orderNumber, customerName) => {
                                    setVersorgungOrderId(orderId);
                                    setVersorgungOrderNumber(orderNumber);
                                    setVersorgungCustomerName(customerName);
                                    setShowVersorgungModal(true);
                                }}
                            />
                        ))
                    )}
                </TableBody>
            </Table>

            <PaginationControls
                pagination={pagination}
                currentPage={currentPage}
                ordersCount={memoizedOrders.length}
                selectedStatus={selectedStatus}
                onPageChange={handlePageChange}
            />

            <ConfirmModal
                open={showConfirmModal}
                onOpenChange={setShowConfirmModal}
                title="Auftrag löschen bestätigen"
                description="Sind Sie sicher, dass Sie den Auftrag"
                orderName={pendingAction?.orderName}
                currentStatus={pendingAction?.currentStatus || ''}
                newStatus={pendingAction?.newStatus || ''}
                onConfirm={handleConfirm}
                confirmText="Ja, löschen"
                isDeleteAction={true}
                isLoading={isDeleting}
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmModal
                open={showBulkDeleteModal}
                onOpenChange={setShowBulkDeleteModal}
                title="Mehrere Aufträge löschen bestätigen"
                description={`Sind Sie sicher, dass Sie ${selectedOrderIds.length} ${selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} löschen möchten?`}
                orderName={`${selectedOrderIds.length} ${selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'}`}
                currentStatus=""
                newStatus=""
                onConfirm={executeBulkDelete}
                confirmText="Ja, alle löschen"
                isDeleteAction={true}
                isLoading={isBulkDeleting}
            />

            <ConfirmModal
                open={showBulkStatusModal}
                onOpenChange={(open) => {
                    setShowBulkStatusModal(open);
                    if (!open) {
                        setIsBulkStatusUpdating(false);
                        setPendingBulkStatus(null);
                    }
                }}
                title="Status ändern bestätigen"
                description={`Sind Sie sicher, dass Sie den Status für ${pendingBulkStatus?.orderIds.length || 0} ${pendingBulkStatus && pendingBulkStatus.orderIds.length === 1 ? 'Auftrag' : 'Aufträge'}`}
                orderName={`${pendingBulkStatus?.orderIds.length || 0} ${pendingBulkStatus && pendingBulkStatus.orderIds.length === 1 ? 'Auftrag' : 'Aufträge'}`}
                currentStatus="Mehrere Statuswerte"
                newStatus={pendingBulkStatus ? getLabelFromApiStatus(pendingBulkStatus.newStatus) : ''}
                onConfirm={executeBulkStatusChange}
                confirmText="Bestätigen"
                isLoading={isBulkStatusUpdating}
            />

            <Dialog open={showPriorityModal} onOpenChange={(open) => {
                setShowPriorityModal(open);
                if (!open) {
                    setPriorityModalOrder(null);
                    setIsPriorityUpdating(false);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Priorität ändern</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Wähle die gewünschte Priorität für <strong>{priorityModalOrder?.kundenname}</strong>
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {(['Dringend', 'Normal'] as ('Dringend' | 'Normal')[]).map(option => (
                                <button
                                    key={option}
                                    className={`w-full border rounded-lg py-2 px-3 text-sm font-medium cursor-pointer transition ${prioritySelection === option
                                        ? option === 'Dringend'
                                            ? 'border-red-500 bg-red-50 text-red-600'
                                            : 'border-gray-400 bg-gray-100 text-gray-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                    onClick={() => setPrioritySelection(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setShowPriorityModal(false)} disabled={isPriorityUpdating}>
                            Abbrechen
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={async () => {
                                if (!priorityModalOrder) return;
                                setIsPriorityUpdating(true);
                                try {
                                    await updateOrderPriority(priorityModalOrder.id, prioritySelection);
                                    toast.success('Priorität aktualisiert');
                                    setShowPriorityModal(false);
                                } catch (error) {
                                    console.error('Failed to update priority:', error);
                                    toast.error('Fehler beim Aktualisieren der Priorität');
                                } finally {
                                    setIsPriorityUpdating(false);
                                }
                            }}
                            disabled={isPriorityUpdating}
                        >
                            {isPriorityUpdating ? 'Aktualisiere...' : 'Speichern'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Sidebar */}
            <HistorySidebar
                isOpen={showHistorySidebar}
                onClose={() => {
                    setShowHistorySidebar(false);
                    setHistoryOrderId(null);
                    setHistoryOrderNumber(null);
                }}
                orderId={historyOrderId}
                orderNumber={historyOrderNumber || undefined}
            />

            {/* Versorgung Modal */}
            <VersorgungModal
                isOpen={showVersorgungModal}
                onClose={() => {
                    setShowVersorgungModal(false);
                    setVersorgungOrderId(null);
                    setVersorgungOrderNumber(null);
                    setVersorgungCustomerName(null);
                }}
                orderId={versorgungOrderId}
                orderNumber={versorgungOrderNumber || undefined}
                customerName={versorgungCustomerName || undefined}
            />

            {/* Scan Picture Modal */}
            <ScanPictureModal
                isOpen={showScanModal}
                onClose={() => {
                    setShowScanModal(false);
                    setScanOrderId(null);
                    setScanOrderNumber(null);
                    setScanCustomerName(null);
                }}
                orderId={scanOrderId}
                orderNumber={scanOrderNumber || undefined}
                customerName={scanCustomerName || undefined}
            />

            {/* Barcode Sticker Modal */}
            <BarcodeStickerModal
                isOpen={showBarcodeStickerModal}
                onClose={() => {
                    setShowBarcodeStickerModal(false);
                    setBarcodeStickerOrderId(null);
                    setBarcodeStickerOrderNumber(null);
                    setAutoGenerateBarcode(false);
                }}
                orderId={barcodeStickerOrderId || ''}
                orderNumber={barcodeStickerOrderNumber || undefined}
                autoGenerate={autoGenerateBarcode}
            />
        </div>
    );
}
