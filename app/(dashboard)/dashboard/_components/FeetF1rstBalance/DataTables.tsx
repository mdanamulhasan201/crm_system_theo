'use client'

import React, { useState, useEffect } from 'react'
import ReusableBalanceTable, { BalanceTableColumn, TableAction } from '@/components/Shared/ReusableBalanceTable'
import { getAllOrderData, cancelOrder } from '@/apis/MassschuheManagemantApis'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/OrdersPage/ConfirmModal/ConfirmModal'


export interface TransactionData {
    id: string;
    // ID of the custom shaft order (used for cancel)
    custom_shafts_id?: string | null;
    // Order status of the custom shaft ("active" | "canceled" | ...)
    custom_shafts_order_status?: string | null;
    datum: string;
    transaktionsnummer: string;
    kundenname: string;
    beschreibung: string | null;
    einnahmesumme: number;
    status: string | null;
    custom_shafts_status?: string | null;
}

interface ApiOrderData {
    id: string;
    orderNumber: string;
    status: string;
    price: number;
    note: string | null;
    custom_shafts_catagoary: string | null;
    custom_shafts: {
        id?: string;
        invoice?: string;
        status?: string;
        order_status?: string;
        invoice2?: string;
        other_customer_name?: string | null;
        orderNumber?: string;
    };
    customer: {
        vorname: string;
        nachname: string;
    } | null;
    createdAt: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: ApiOrderData[];
    hasMore: boolean;
}

export type TabType = 'einnahmen' | 'ausgaben';

interface DataTablesProps {
    einnahmenData?: TransactionData[];
    isLoading?: boolean;
    onShowMore?: (tab: TabType) => void;

    // Optional action handlers - use optional chaining
    onView?: (row: TransactionData) => void;
    onEdit?: (row: TransactionData) => void;
    onDelete?: (row: TransactionData) => void;
    onDownload?: (row: TransactionData) => void;

    // Custom actions (for different pages)
    customActions?: TableAction<TransactionData>[];

    // Custom render for actions (full control)
    renderActions?: (row: TransactionData, rowIndex: number) => React.ReactNode;
}

export default function DataTables({
    einnahmenData,
    isLoading: externalLoading = false,
    onShowMore,
    onView,
    onEdit,
    onDelete,
    onDownload,
    customActions,
    renderActions,
}: DataTablesProps) {
    const [data, setData] = useState<TransactionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string>('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TransactionData | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Helper function to format date
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (error) {
            return '-';
        }
    };

    // Helper function to map API data to TransactionData
    const mapApiDataToTransactionData = (apiData: ApiOrderData[]): TransactionData[] => {
        if (!Array.isArray(apiData)) {
            return [];
        }

        return apiData.map((item, index) => {
            try {
                return {
                    // Keep transition ID for table row key
                    id: item.id || `fallback-${index}`,
                    // Use custom shafts ID for actions like cancel
                    custom_shafts_id: item.custom_shafts?.id || null,
                    custom_shafts_order_status: item.custom_shafts?.order_status || null,
                    datum: formatDate(item.createdAt),
                    transaktionsnummer: item.custom_shafts?.orderNumber || item.orderNumber || '-',
                    kundenname: item.customer
                        ? `${item.customer.vorname || ''} ${item.customer.nachname || ''}`.trim() || '--'
                        : (item.custom_shafts?.other_customer_name || '--'),
                    beschreibung: item.custom_shafts_catagoary || item.note || null,
                    einnahmesumme: item.price || 0,
                    status: item.status || null,
                    custom_shafts_status: item.custom_shafts?.status || null,
                };
            } catch (error) {
                return {
                    id: `error-${index}`,
                    custom_shafts_id: null,
                    custom_shafts_order_status: null,
                    datum: '-',
                    transaktionsnummer: '-',
                    kundenname: '--',
                    beschreibung: 'Mapping Error',
                    einnahmesumme: 0,
                    status: null,
                    custom_shafts_status: null,
                };
            }
        });
    };

    // Fetch initial data
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getAllOrderData(5, '') as ApiResponse;

            if (response && response.success && Array.isArray(response.data)) {
                const mappedData = mapApiDataToTransactionData(response.data);
                setData(mappedData);
                setHasMore(response.hasMore || false);

                // Set cursor to the last item's ID for next fetch
                if (response.data.length > 0) {
                    const lastId = response.data[response.data.length - 1].id;
                    setCursor(lastId);
                }
            } else {
                setData([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch order data:', error);
            setData([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Load more data with cursor pagination
    const loadMoreData = async () => {
        if (!hasMore || loadingMore) return;

        try {
            setLoadingMore(true);
            const response = await getAllOrderData(5, cursor) as ApiResponse;

            if (response.success && Array.isArray(response.data)) {
                const mappedData = mapApiDataToTransactionData(response.data);
                setData(prevData => [...prevData, ...mappedData]);
                setHasMore(response.hasMore);

                // Update cursor to the last item's ID
                if (response.data.length > 0) {
                    setCursor(response.data[response.data.length - 1].id);
                }
            }
        } catch (error) {
            console.error('Failed to load more data:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Handle cancel order button click - open modal
    const handleCancelOrder = (row: TransactionData) => {
        setSelectedOrder(row);
        setShowCancelModal(true);
    };

    // Confirm and execute cancel order
    const confirmCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setIsCancelling(true);
            // Use custom shaft ID for cancel if available, fallback to main id
            const cancelId = selectedOrder.custom_shafts_id || selectedOrder.id;
            const response = await cancelOrder(cancelId);
            if (response.success) {
                toast.success('Bestellung erfolgreich storniert');
                setShowCancelModal(false);
                setSelectedOrder(null);
                // Refresh data
                fetchData();
            } else {
                toast.error(response.message || 'Fehler beim Stornieren der Bestellung');
            }
        } catch (error: any) {
            console.error('Failed to cancel order:', error);
            toast.error(error?.response?.data?.message || 'Fehler beim Stornieren der Bestellung');
        } finally {
            setIsCancelling(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        // Only fetch if no external data is provided
        if (!einnahmenData) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) {
            return '-';
        }
        return value.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // Get status badge color
    const getStatusColor = (status: string | null) => {
        if (!status) return 'text-gray-600';

        const statusLower = status.toLowerCase();

        if (statusLower === 'pending' || statusLower === 'panding') {
            return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        }
        if (statusLower === 'completed' || statusLower === 'abgeschlossen') {
            return 'bg-green-100 text-green-700 border border-green-200';
        }
        if (statusLower === 'cancelled' || statusLower === 'storniert') {
            return 'bg-red-100 text-red-700 border border-red-200';
        }
        if (statusLower === 'neu') {
            return 'bg-purple-100 text-purple-700 border border-purple-200';
        }

        return 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    // Build actions array based on provided handlers (optional chaining)
    const buildActions = (): TableAction<TransactionData>[] | undefined => {
        // If custom actions provided, use them
        if (customActions?.length) {
            return customActions;
        }

        // Build actions from individual handlers
        const actions: TableAction<TransactionData>[] = [];

        if (onView) {
            actions.push({
                type: 'view',
                label: 'Ansehen',
                onClick: (row) => onView(row),
            });
        }

        if (onEdit) {
            actions.push({
                type: 'edit',
                label: 'Bearbeiten',
                onClick: (row) => onEdit(row),
            });
        }

        if (onDelete) {
            actions.push({
                type: 'delete',
                label: 'Löschen',
                onClick: (row) => onDelete(row),
            });
        }

        if (onDownload) {
            actions.push({
                type: 'download',
                label: 'Herunterladen',
                onClick: (row) => onDownload(row),
            });
        }

        return actions.length > 0 ? actions : undefined;
    };

    const columns: BalanceTableColumn<TransactionData>[] = [
        {
            key: 'datum',
            header: 'Datum',
            className: 'text-gray-600',
        },
        {
            key: 'transaktionsnummer',
            header: 'Transaktionsnummer',
            className: 'text-blue-600 font-medium',
        },
        {
            key: 'kundenname',
            header: 'Kundenname',
            className: 'text-gray-800 font-medium',
        },
        {
            key: 'beschreibung',
            header: 'Beschreibung',
            render: (value) => value || '-',
        },
        {
            key: 'einnahmesumme',
            header: 'Summe',
            render: (value) => (
                <span className="text-emerald-600 font-medium">
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
                    {value || '-'}
                </span>
            ),
        },
    ];

    // Use external data if provided, otherwise use fetched data
    const currentData = einnahmenData || data;
    const isLoadingState = externalLoading || loading;

    const handleShowMore = () => {
        if (onShowMore) {
            onShowMore('einnahmen'); // Default to einnahmen for compatibility
        } else {
            // Use internal pagination if no external handler
            loadMoreData();
        }
    };

    // Build cancel action - only show if status is "Neu" AND order_status is "active"
    // Use a custom action so it does NOT use the delete/trash icon
    const cancelAction: TableAction<TransactionData> = {
        type: 'custom',
        label: 'Bestellung stornieren',
        icon: (
            <span className="text-xs font-semibold">
                Stornieren
            </span>
        ),
        className: 'text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer border border-red-200 rounded-md p-2',
        onClick: (row) => handleCancelOrder(row),
        show: (row) => row.custom_shafts_order_status === 'active' && row.custom_shafts_status === 'Neu',
    };

    // Show a non-clickable "Storniert" badge in the actions column when order is canceled
    const canceledStatusAction: TableAction<TransactionData> = {
        type: 'custom',
        label: 'Storniert',
        icon: (
            <span className="text-xs font-semibold text-gray-600">
                Storniert
            </span>
        ),
        className: 'bg-gray-100 border border-gray-200 rounded-md px-3 py-1 cursor-default',
        onClick: () => { },
        show: (row) => row.custom_shafts_order_status === 'canceled',
    };

    // Combine all actions
    const allActions = (): TableAction<TransactionData>[] | undefined => {
        const baseActions = buildActions();
        const actions = baseActions ? [...baseActions] : [];

        // Add cancel and canceled-status actions (they conditionally show based on status)
        actions.push(cancelAction);
        actions.push(canceledStatusAction);

        return actions.length > 0 ? actions : undefined;
    };

    return (
        <div className="mt-8">

            {/* Header */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Transaktionen</h2>
            {/* Table */}
            <ReusableBalanceTable
                columns={columns}
                data={currentData}
                isLoading={isLoadingState}
                emptyMessage="Keine Transaktionen vorhanden"
                showMoreButton={currentData?.length > 0 && (hasMore || !!onShowMore)}
                onShowMore={handleShowMore}
                showMoreLabel={loadingMore ? "Lädt..." : "Mehr anzeigen"}
                rowKeyField="id"
                // Optional actions - only shown if handlers are provided
                actions={allActions()}
                renderActions={renderActions}
            />

            {/* Cancel Order Confirmation Modal */}
            <ConfirmModal
                open={showCancelModal}
                onOpenChange={setShowCancelModal}
                title="Bestellung stornieren"
                description="Sind Sie sicher, dass Sie die Bestellung"
                orderName={selectedOrder?.transaktionsnummer || ''}
                currentStatus={selectedOrder?.status || ''}
                newStatus="Storniert"
                onConfirm={confirmCancelOrder}
                confirmText="Ja, stornieren"
                cancelText="Abbrechen"
                isDeleteAction={true}
                isLoading={isCancelling}
            />
        </div>
    );
}
