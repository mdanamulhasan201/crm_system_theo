'use client'

import React, { useState, useEffect } from 'react'
import ReusableBalanceTable, { BalanceTableColumn, TableAction } from '@/components/Shared/ReusableBalanceTable'
import { getAllOrderData, cancelOrder } from '@/apis/MassschuheManagemantApis'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/OrdersPage/ConfirmModal/ConfirmModal'

export interface TransactionData {
    id: string;
    datum: string;
    transaktionsnummer: string;
    kundenname: string;
    beschreibung: string | null;
    einnahmesumme: number;
    feetfirstGebuehren: number | null;
    andere: number | null;
    entgueltigeEinnahmen: string;
    status: string | null;
    custom_shafts_status?: string | null;
}

interface ApiOrderData {
    id: string;
    orderNumber: string;
    status: string;
    orderFor: string;
    price: number;
    note: string | null;
    custom_shafts_catagoary: string | null;
    custom_shafts: {
        invoice?: string;
        status?: string;
        isCompleted?: boolean;
        invoice2?: string;
    };
    customer: {
        vorname: string;
        nachname: string;
    };
    createdAt: string;
    customerId: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: ApiOrderData[];
    hasMore: boolean;
}

export type TabType = 'einnahmen' | 'ausgaben';


const sampleAusgabenData: TransactionData[] = [];

interface DataTablesProps {
    einnahmenData?: TransactionData[];
    ausgabenData?: TransactionData[];
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
    ausgabenData,
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
                    id: item.id || `fallback-${index}`,
                    datum: formatDate(item.createdAt),
                    transaktionsnummer: item.orderNumber ? `FE${item.orderNumber}` : '-',
                    kundenname: `${item.customer?.vorname || ''} ${item.customer?.nachname || ''}`.trim() || '--',
                    beschreibung: item.note || item.custom_shafts_catagoary || null,
                    einnahmesumme: item.price || 0,
                    feetfirstGebuehren: null,
                    andere: null,
                    entgueltigeEinnahmen: formatDate(item.createdAt),
                    status: item.status || null,
                    custom_shafts_status: item.custom_shafts?.status || null,
                };
            } catch (error) {
                return {
                    id: `error-${index}`,
                    datum: '-',
                    transaktionsnummer: '-',
                    kundenname: '--',
                    beschreibung: 'Mapping Error',
                    einnahmesumme: 0,
                    feetfirstGebuehren: null,
                    andere: null,
                    entgueltigeEinnahmen: '-',
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
            const response = await getAllOrderData(10, '') as ApiResponse;
            
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
            const response = await getAllOrderData(10, cursor) as ApiResponse;
            
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
            const response = await cancelOrder(selectedOrder.id);
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
        if (!einnahmenData && !ausgabenData) {
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
            header: 'Beschreib...',
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

    // Build cancel action - only show if status is "Neu"
    const cancelAction: TableAction<TransactionData> = {
        type: 'delete',
        label: 'Bestellung stornieren',
        onClick: (row) => handleCancelOrder(row),
        show: (row) => row.custom_shafts_status === 'Neu',
    };

    // Combine all actions
    const allActions = (): TableAction<TransactionData>[] | undefined => {
        const baseActions = buildActions();
        const actions = baseActions ? [...baseActions] : [];
        
        // Always add cancel action (it will conditionally show based on status)
        actions.push(cancelAction);
        
        return actions.length > 0 ? actions : undefined;
    };

    return (
        <div className="mt-8">
            {/* Header */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transaktionen</h2>

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
