import React, { useState, useEffect, useMemo } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/contexts/OrdersContext";
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import StatusFilterBar from "./StatusFilterBar";
import BulkActionsBar from "./BulkActionsBar";
import OrderTableHeader from "./OrderTableHeader";
import OrderTableRow from "./OrderTableRow";
import PaginationControls from "./PaginationControls";
import { useOrderActions } from "@/hooks/orders/useOrderActions";

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
    } = useOrders();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    const {
        showConfirmModal,
        setShowConfirmModal,
        isDeleting,
        pendingAction,
        deleteLoading,
        handleNextStep,
        executeNextStep,
        handlePriorityToggle,
        executePriorityToggle,
        handleDeleteOrder,
        executeDeleteOrder,
        handleInvoiceDownload,
    } = useOrderActions();

    // Get the selected order's current step to show as active in the progress bar
    const activeStep = useMemo(() => {
        if (!selectedOrderId) return -1;
        const selectedOrder = orders.find(order => order.id === selectedOrderId);
        return selectedOrder ? selectedOrder.currentStep : -1;
    }, [selectedOrderId, orders]);

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

    // Clear selection when orders change
    useEffect(() => {
        if (orders.length > 0 && selectedOrderId) {
            const orderExists = orders.some(order => order.id === selectedOrderId);
            if (!orderExists) {
                setSelectedOrderId(null);
            }
        }
        // Clean up multiselect for orders that no longer exist
        if (selectedOrderIds.length > 0) {
            const validIds = selectedOrderIds.filter(id =>
                orders.some(order => order.id === id)
            );
            if (validIds.length !== selectedOrderIds.length) {
                setSelectedOrderIds(validIds);
            }
        }
    }, [orders, selectedOrderId, selectedOrderIds]);

    // Handle confirm modal actions
    const handleConfirm = async () => {
        if (pendingAction?.type === 'nextStep') {
            await executeNextStep((id: string) => setSelectedOrderId(id));
        } else if (pendingAction?.type === 'priority') {
            await executePriorityToggle((id: string) => setSelectedOrderId(id));
        } else if (pendingAction?.type === 'delete') {
            await executeDeleteOrder((id: string | null) => setSelectedOrderId(id));
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
            <StatusFilterBar
                selectedDays={selectedDays}
                selectedStatus={selectedStatus}
                activeStep={activeStep}
                onDaysChange={setSelectedDays}
                onStatusFilter={handleStatusFilter}
                onClearFilter={() => setSelectedStatus(null)}
            />

            <BulkActionsBar
                selectedOrderIds={selectedOrderIds}
                orders={orders}
                onClearSelection={() => setSelectedOrderIds([])}
            />

            <Table className="table-fixed w-full">
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
                                onNextStep={(id) => handleNextStep(id, (id: string) => setSelectedOrderId(id))}
                                onPriorityToggle={(id) => handlePriorityToggle(id, (id: string) => setSelectedOrderId(id))}
                                onDelete={(id) => handleDeleteOrder(id, (id: string | null) => setSelectedOrderId(id))}
                                onInvoiceDownload={handleInvoiceDownload}
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
                title={pendingAction?.type === 'delete' ? "Auftrag löschen bestätigen" : "Status ändern bestätigen"}
                description={pendingAction?.type === 'delete' ? "Sind Sie sicher, dass Sie den Auftrag" : "Sind Sie sicher, dass Sie den Status für den Auftrag"}
                orderName={pendingAction?.orderName}
                currentStatus={pendingAction?.currentStatus || ''}
                newStatus={pendingAction?.newStatus || ''}
                onConfirm={handleConfirm}
                confirmText={pendingAction?.type === 'delete' ? "Ja, löschen" : "Ja, Status ändern"}
                isDeleteAction={pendingAction?.type === 'delete'}
                isLoading={isDeleting}
            />
        </div>
    );
}
