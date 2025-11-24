import { useState } from 'react';
import { useOrders, steps } from '@/contexts/OrdersContext';
import toast from 'react-hot-toast';
import { useDeleteSingleOrder } from '@/hooks/orders/useDeleteSingleOrder';

export type PendingActionType = 'nextStep' | 'priority' | 'delete';

export interface PendingAction {
    type: PendingActionType;
    orderId: string;
    orderName: string;
    currentStatus: string;
    newStatus: string;
}

export function useOrderActions() {
    const {
        orders,
        togglePriority,
        moveToNextStep,
        refreshOrderData,
        deleteOrder
    } = useOrders();

    const { deleteSingleOrder, loading: deleteLoading } = useDeleteSingleOrder();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

    const handleNextStep = (orderId: string, setSelectedOrderId: (id: string) => void) => {
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

    const executeNextStep = async (setSelectedOrderId: (id: string) => void) => {
        if (!pendingAction) return;

        try {
            await moveToNextStep(pendingAction.orderId);
            setSelectedOrderId(pendingAction.orderId);

            toast.success(`Status erfolgreich geändert: ${pendingAction.currentStatus} → ${pendingAction.newStatus}`);

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

    const handlePriorityToggle = (orderId: string, setSelectedOrderId: (id: string) => void) => {
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

    const executePriorityToggle = async (setSelectedOrderId: (id: string) => void) => {
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

    const handleDeleteOrder = (orderId: string, setSelectedOrderId: (id: string | null) => void) => {
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

    const executeDeleteOrder = async (setSelectedOrderId: (id: string | null) => void) => {
        if (!pendingAction) return;

        setIsDeleting(true);
        try {
            await deleteOrder(pendingAction.orderId);
            toast.success(`Auftrag erfolgreich gelöscht: ${pendingAction.orderName}`);

            // Clear selection if the deleted order was selected
            setSelectedOrderId(null);
        } catch (error) {
            console.error('Failed to delete order:', error);
            toast.error('Fehler beim Löschen des Auftrags');
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setPendingAction(null);
        }
    };

    const handleInvoiceDownload = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.invoice) {
            toast.error('Keine Rechnung verfügbar für diesen Auftrag');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = order.invoice;
            link.download = `Rechnung_${order.bestellnummer}_${order.kundenname.replace(/\s+/g, '_')}.pdf`;
            link.target = '_blank';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Rechnung wird heruntergeladen...');
        } catch (error) {
            console.error('Failed to download invoice:', error);
            toast.error('Fehler beim Herunterladen der Rechnung');
        }
    };

    return {
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
    };
}

