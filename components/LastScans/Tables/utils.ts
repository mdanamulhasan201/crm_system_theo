import { LastScanRow } from './types';

export const formatDate = (date?: string | null, options?: Intl.DateTimeFormatOptions) => {
    if (!date) return '—';
    try {
        return new Date(date).toLocaleString('en-GB', options ?? {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch (error) {
        return '—';
    }
};

export const getOrderStatusLabel = (status?: string | null) => {
    if (!status) return 'No order';
    const normalized = status.toLowerCase();
    if (['completed', 'abgeschlossen', 'done', 'finished'].includes(normalized)) return 'Completed';
    if (['started', 'sarted', 'in_progress', 'processing'].includes(normalized)) return 'In progress';
    if (['cancelled', 'canceled'].includes(normalized)) return 'Cancelled';
    return status;
};

export const getOrderStatusClass = (status?: string | null) => {
    if (!status) return 'text-orange-500';
    const normalized = status.toLowerCase();
    if (['completed', 'abgeschlossen', 'done', 'finished'].includes(normalized)) return 'text-green-600';
    if (['cancelled', 'canceled'].includes(normalized)) return 'text-red-500';
    return 'text-sky-600';
};

export const getKundentypBadges = (row: LastScanRow) => {
    const badges: { label: string; className: string }[] = [];

    // Check if customer has any orders
    const hasOrders = row.latestOrder || row.latestMassschuheOrder;

    if (hasOrders) {
        // If orders exist, show order types (Einlagen/Massschuhe) or Kostenträger
        if (row.latestMassschuheOrder) {
            badges.push({
                label: 'Massschuhe',
                className: 'bg-purple-100 text-purple-700',
            });
        }

        if (row.latestOrder) {
            badges.push({
                label: 'Einlagen',
                className: 'bg-blue-100 text-blue-700',
            });
        }

        // If no order types but has Kostenträger, show it
        if (!row.latestOrder && !row.latestMassschuheOrder && row.kostenträger?.trim()) {
            badges.push({
                label: row.kostenträger.trim(),
                className: 'bg-blue-100 text-blue-700',
            });
        }

        // If no badges added, show dash
        if (badges.length === 0) {
            badges.push({
                label: '—',
                className: 'bg-gray-100 text-gray-600',
            });
        }
    } else {
        // If no orders, show nothing or dash
        badges.push({
            label: '—',
            className: 'bg-gray-100 text-gray-600',
        });
    }

    return badges;
};

export const getOrderEntries = (row: LastScanRow) => {
    const entries: { label: string; date: string | null; className: string }[] = [];
    const latestOrderStatus = row.latestOrder?.orderStatus ?? null;
    const latestOrderDate = row.latestOrder?.createdAt ?? null;
    const latestMassschuheDate = row.latestMassschuheOrder?.createdAt ?? null;

    if (row.latestOrder) {
        entries.push({
            label: latestOrderStatus ? getOrderStatusLabel(latestOrderStatus) : 'Einlagen',
            date: latestOrderDate ?? null,
            className: latestOrderStatus ? getOrderStatusClass(latestOrderStatus) : 'text-blue-700',
        });
    }

    if (row.latestMassschuheOrder) {
        entries.push({
            label: 'Massschuhe',
            date: latestMassschuheDate,
            className: 'text-purple-700',
        });
    }

    return entries;
};

