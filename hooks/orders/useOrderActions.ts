import { useState } from 'react';
import { useOrders } from '@/contexts/OrdersContext';
import toast from 'react-hot-toast';
import { useDeleteSingleOrder } from '@/hooks/orders/useDeleteSingleOrder';

export type PendingActionType = 'delete';

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
        deleteOrder
    } = useOrders();

    const { deleteSingleOrder, loading: deleteLoading } = useDeleteSingleOrder();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

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
        handleDeleteOrder,
        executeDeleteOrder,
        handleInvoiceDownload,
    };
}

