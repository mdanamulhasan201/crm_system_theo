'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ReusableBalanceTable, { BalanceTableColumn, TableAction } from '@/components/Shared/ReusableBalanceTable'
import { getAllOrderData, cancelOrder, getDeadlineDate } from '@/apis/MassschuheManagemantApis'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/OrdersPage/ConfirmModal/ConfirmModal'
import HalbprobenerstellungModal from './HalbprobenerstellungModal'


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
    // Invoice URLs
    custom_shafts_invoice?: string | null;
    custom_shafts_invoice2?: string | null;
    // Lieferdatum: formatted date and relative time (e.g. "noch 1 Tag", "heute")
    lieferdatumFormatted?: string;
    lieferdatumRelative?: string;
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
        deliveryDate?: string | null;
        createdAt?: string;
    } | null;
    customer: {
        vorname: string;
        nachname: string;
    } | null;
    createdAt: string;
}

interface DeadlineDateItem {
    id: string;
    day: number;
    category: string;
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
    const router = useRouter()
    const [apiOrderDataRaw, setApiOrderDataRaw] = useState<ApiOrderData[]>([]);
    const [deadlineDates, setDeadlineDates] = useState<DeadlineDateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState<string>('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TransactionData | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [halbprobeModalOpen, setHalbprobeModalOpen] = useState(false);
    const [halbprobeOrderId, setHalbprobeOrderId] = useState<string | null>(null);

    // Format date as "26. Feb. 2026"
    const formatLieferdatumDate = (date: Date): string => {
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Relative time in German: "noch 1 Tag", "heute", "vor X Tagen", etc.
    const getRelativeTimeGerman = (deadline: Date): string => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const d = new Date(deadline);
        d.setHours(0, 0, 0, 0);
        const diffMs = d.getTime() - now.getTime();
        const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

        if (diffDays === 0) return 'heute';
        if (diffDays === 1) return 'noch 1 Tag';
        if (diffDays > 1 && diffDays <= 365) return `noch ${diffDays} Tage`;
        if (diffDays === -1) return 'vor 1 Tag';
        if (diffDays < -1) return `vor ${Math.abs(diffDays)} Tagen`;
        return '';
    };

    // Compute deadline for an order: use deliveryDate if set, else createdAt + category days
    const getDeadlineForOrder = (order: ApiOrderData, deadlines: DeadlineDateItem[]): { formatted: string; relative: string } | null => {
        const deliveryDateStr = order.custom_shafts?.deliveryDate;
        let deadlineDate: Date;

        if (deliveryDateStr) {
            deadlineDate = new Date(deliveryDateStr);
        } else {
            const category = order.custom_shafts_catagoary;
            const item = deadlines.find((d) => d.category === category);
            if (!item) return null;
            const created = new Date(order.createdAt);
            deadlineDate = new Date(created);
            deadlineDate.setDate(deadlineDate.getDate() + item.day);
        }

        if (isNaN(deadlineDate.getTime())) return null;
        return {
            formatted: formatLieferdatumDate(deadlineDate),
            relative: getRelativeTimeGerman(deadlineDate),
        };
    };

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

    // Helper function to map API data to TransactionData (uses deadlineDates for Lieferdatum)
    const mapApiDataToTransactionData = (apiData: ApiOrderData[], deadlines: DeadlineDateItem[]): TransactionData[] => {
        if (!Array.isArray(apiData)) {
            return [];
        }

        return apiData.map((item, index) => {
            try {
                // Determine customer name: use customer if has valid data, otherwise use other_customer_name
                const hasCustomerData = item.customer && (item.customer.vorname || item.customer.nachname);
                const customerName = hasCustomerData
                    ? `${item.customer?.vorname || ''} ${item.customer?.nachname || ''}`.trim()
                    : (item.custom_shafts?.other_customer_name || '--');

                const lieferdatum = getDeadlineForOrder(item, deadlines);

                return {
                    // Keep transition ID for table row key
                    id: item.id || `fallback-${index}`,
                    // Use custom shafts ID for actions like cancel
                    custom_shafts_id: item.custom_shafts?.id || null,
                    custom_shafts_order_status: item.custom_shafts?.order_status || null,
                    datum: formatDate(item.createdAt),
                    transaktionsnummer: item.custom_shafts?.orderNumber || item.orderNumber || '-',
                    kundenname: customerName,
                    beschreibung: item.custom_shafts_catagoary || item.note || null,
                    einnahmesumme: item.price || 0,
                    status: item.status || null,
                    custom_shafts_status: item.custom_shafts?.status || null,
                    custom_shafts_invoice: item.custom_shafts?.invoice || null,
                    custom_shafts_invoice2: item.custom_shafts?.invoice2 || null,
                    lieferdatumFormatted: lieferdatum?.formatted,
                    lieferdatumRelative: lieferdatum?.relative,
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
                    custom_shafts_invoice: null,
                    custom_shafts_invoice2: null,
                    lieferdatumFormatted: undefined,
                    lieferdatumRelative: undefined,
                };
            }
        });
    };

    // Fetch deadline dates on mount (category -> days for Lieferdatum calculation)
    useEffect(() => {
        getDeadlineDate()
            .then((res: { success?: boolean; data?: DeadlineDateItem[] }) => {
                if (res?.data && Array.isArray(res.data)) {
                    setDeadlineDates(res.data);
                }
            })
            .catch((err) => console.error('Failed to fetch deadline dates:', err));
    }, []);

    // Fetch initial data
    const fetchData = async (search: string = '') => {
        try {
            setLoading(true);
            const response = await getAllOrderData(5, '', search) as ApiResponse;

            if (response && response.success && Array.isArray(response.data)) {
                setApiOrderDataRaw(response.data);
                setHasMore(response.hasMore || false);

                // Set cursor to the last item's ID for next fetch
                if (response.data.length > 0) {
                    const lastId = response.data[response.data.length - 1].id;
                    setCursor(lastId);
                }
            } else {
                setApiOrderDataRaw([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch order data:', error);
            setApiOrderDataRaw([]);
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
            const response = await getAllOrderData(5, cursor, searchQuery) as ApiResponse;

            if (response.success && Array.isArray(response.data)) {
                setApiOrderDataRaw((prev) => [...prev, ...response.data]);
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

    // Derive table data from raw API data + deadline dates (so Lieferdatum updates when deadlines load)
    const data = useMemo(
        () => mapApiDataToTransactionData(apiOrderDataRaw, deadlineDates),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only recompute when raw data or deadline config changes
        [apiOrderDataRaw, deadlineDates]
    );

    // Handle cancel order button click - open modal
    const handleCancelOrder = (row: TransactionData) => {
        setSelectedOrder(row);
        setShowCancelModal(true);
    };

    // Download PDF with customer name as filename (for navbar/tab and saved file)
    const handleDownloadInvoice = async (url: string, customerName?: string) => {
        if (!url) return;
        const safeName = (customerName || 'Rechnung').replace(/[^a-zA-Z0-9-_ \u00C0-\u024F]/g, '').trim() || 'Rechnung';
        const filename = `${safeName}-invoice.pdf`;
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (!res.ok) {
                window.open(url, '_blank');
                return;
            }
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, '_blank');
        }
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

    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!einnahmenData) {
                fetchData(searchQuery);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

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
        if (statusLower === 'ausgeführt') {
            return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
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
            header: 'Einlagenbestellung',
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
            key: 'lieferdatumFormatted',
            header: 'Lieferdatum',
            render: (_value, row) => {
                const formatted = row.lieferdatumFormatted;
                const relative = row.lieferdatumRelative;
                if (!formatted && !relative) return <span className="text-gray-400">–</span>;
                return (
                    <div className="flex flex-col">
                        {formatted && <span className="text-gray-900 text-sm">{formatted}</span>}
                        {relative && <span className="text-gray-500 text-xs">{relative}</span>}
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: (value, row) => {
                // If order is canceled, show "Storniert"
                let displayStatus = row.custom_shafts_order_status === 'canceled'
                    ? 'Storniert'
                    : (row.custom_shafts_status || value);

                // Normalize "panding" to "Pending" with capital P
                if (displayStatus && displayStatus.toLowerCase() === 'panding') {
                    displayStatus = 'Pending';
                }

                const isHalbprobeAusgefuehrt =
                    row.custom_shafts_status === 'Ausgeführt' && row.beschreibung === 'Halbprobenerstellung';
                const badgeClass = `inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(displayStatus)}`;

                if (isHalbprobeAusgefuehrt && row.custom_shafts_id) {
                    return (
                        <button
                            type="button"
                            onClick={() => {
                                setHalbprobeOrderId(row.custom_shafts_id!);
                                setHalbprobeModalOpen(true);
                            }}
                            className={`${badgeClass} cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500`}
                        >
                            {displayStatus || '-'}
                        </button>
                    );
                }

                return (
                    <span className={badgeClass}>
                        {displayStatus || '-'}
                    </span>
                );
            },
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

    // Reorder action - navigate to product-order to place the same order again
    const reorderAction: TableAction<TransactionData> = {
        type: 'custom',
        label: 'Nachbestellen',
        icon: (
            <span className="text-xs font-semibold">
                Nachbestellen
            </span>
        ),
        className: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer border border-emerald-200 rounded-md px-2 py-1',
        onClick: (row) => {
            const orderId = row.custom_shafts_id || row.id
            router.push(`/dashboard/custom-shafts/product-order/${orderId}`)
        },
        show: () => true,
    };

    const pdfIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    // Invoice PDF button - show when invoice URL exists; download filename = customer name
    const downloadInvoiceAction: TableAction<TransactionData> = {
        type: 'custom',
        label: 'Rechnung (Schaft)',
        icon: pdfIcon,
        className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer border border-blue-200 rounded-md p-2',
        onClick: (row) => handleDownloadInvoice(row.custom_shafts_invoice!, row.kundenname),
        show: (row) => !!row.custom_shafts_invoice,
    };

    // Invoice2 PDF button - show when invoice2 URL exists; download filename = customer name
    const downloadInvoice2Action: TableAction<TransactionData> = {
        type: 'custom',
        label: 'Rechnung (Boden)',
        icon: pdfIcon,
        className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer border border-blue-200 rounded-md p-2',
        onClick: (row) => handleDownloadInvoice(row.custom_shafts_invoice2!, row.kundenname),
        show: (row) => !!row.custom_shafts_invoice2,
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

        // Reorder button (always show in Aktionen column)
        actions.push(reorderAction);
        // PDF buttons - show when invoice / invoice2 exist
        actions.push(downloadInvoiceAction);
        actions.push(downloadInvoice2Action);

        // Add cancel and canceled-status actions (they conditionally show based on status)
        actions.push(cancelAction);
        actions.push(canceledStatusAction);

        return actions.length > 0 ? actions : undefined;
    };

    return (
        <div className="mt-8">

            {/* Header with Search */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Transaktionen</h2>
                
                {/* Search Input */}
                <div className="relative w-80">
                    <input
                        type="text"
                        placeholder="Suchen nach Transaktionsnummer oder Kundenname..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

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

            {/* Halbprobe Checkliste Modal - when status is Ausgeführt and category is Halbprobenerstellung */}
            <HalbprobenerstellungModal
                isOpen={halbprobeModalOpen}
                onClose={() => {
                    setHalbprobeModalOpen(false);
                    setHalbprobeOrderId(null);
                }}
                orderId={halbprobeOrderId}
                onSuccess={() => fetchData(searchQuery)}
            />
        </div>
    );
}
