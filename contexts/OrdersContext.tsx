'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useGetAllOrders, ApiOrderData } from '@/hooks/orders/useGetAllOrders';
import { deleteOrder as deleteOrderApi, deleteGroupOrder, getSingleOrder, getAllOrders, groupOrderStatusUpdate, updateOrderPriority as updateOrderPriorityApi } from '@/apis/productsOrder';
import { getLabelFromApiStatus } from '@/lib/orderStatusMappings';
import { formatPaymentStatus } from '@/lib/paymentStatusUtils';

export interface OrderData {
    id: string;
    customerId: string;
    bestellnummer: string;
    kundenname: string;
    status: string;
    displayStatus: string;
    preis: string;
    zahlung: string;
    bezahlt?: string | boolean | null; // Raw payment status value
    beschreibung: string;
    abholort: string;
    fertigstellung: string;
    erstelltAm: string;
    fertiggestelltAm: string;
    productName: string;
    deliveryDate: string;
    invoice: string | null;
    priority: 'Dringend' | 'Normal';
    isPrioritized: boolean;
    KrankenkasseStatus?: string | null;
    geschaeftsstandort?: string | null;
    employee?: {
        accountName: string;
        employeeName: string;
        email: string;
    } | null;
}

interface OrdersContextType {
    orders: OrderData[];
    prioritizedOrders: OrderData[];
    loading: boolean;
    error: string | null;
    pagination: any;
    currentPage: number;
    selectedDays: number;
    selectedStatus: string | null;
    searchParams: {
        customerNumber: string;
        orderNumber: string;
        customerName: string;
    };
    orderIdFromSearch: string; // Add this to expose orderId from URL
    setCurrentPage: (page: number) => void;
    setSelectedDays: (days: number) => void;
    setSelectedStatus: (status: string | null) => void;
    setSearchParams: (params: { customerNumber?: string; orderNumber?: string; customerName?: string }) => void;
    clearSearchParams: () => void;
    refetch: () => void;
    statsRefreshKey: number;
    triggerStatsRefresh: () => void;
    deleteOrder: (orderId: string) => void;
    deleteOrderByUser: (orderId: string) => void;
    deleteBulkOrders: (orderIds: string[]) => Promise<void>;
    refreshOrderData: (orderId: string) => Promise<void>;
    bulkUpdateOrderStatus: (orderIds: string[], newStatus: string) => Promise<void>;
    updateOrderPriority: (orderId: string, priority: 'Dringend' | 'Normal') => Promise<void>;
    updateBulkKrankenkasseStatus: (orderIds: string[], krankenkasseStatus: string) => void;
    updateBulkPaymentStatus: (orderIds: string[], paymentStatus: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Helper function to map API data to OrderData
const mapApiDataToOrderData = (apiOrder: ApiOrderData): OrderData => {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('de-DE');
    };

    const werkstattzettel = apiOrder.werkstattzettel;

    const priority = (apiOrder.priority as 'Dringend' | 'Normal') || 'Normal';
    return {
        id: apiOrder.id,
        customerId: apiOrder.customer.id,
        bestellnummer: apiOrder.orderNumber.toString(),
        kundenname: `${apiOrder.customer.vorname} ${apiOrder.customer.nachname}`,
        status: apiOrder.orderStatus,
        displayStatus: getLabelFromApiStatus(apiOrder.orderStatus),
        preis: apiOrder.totalPrice
            ? `${apiOrder.totalPrice.toFixed(2)} €`
            : (apiOrder.fußanalyse !== null && apiOrder.einlagenversorgung !== null)
                ? `${((apiOrder.fußanalyse || 0) + (apiOrder.einlagenversorgung || 0)).toFixed(2)} €`
                : '—',
        zahlung: formatPaymentStatus(apiOrder.bezahlt),
        bezahlt: apiOrder.bezahlt || werkstattzettel?.bezahlt || null, // Store raw payment status
        beschreibung: werkstattzettel?.versorgung || apiOrder.product.versorgung || apiOrder.product.status,
        abholort: "Abholung Innsbruck oder Wird mit Post versandt",
        fertigstellung: new Date(apiOrder.statusUpdate || apiOrder.createdAt).toLocaleDateString('de-DE'),
        erstelltAm: formatDate(werkstattzettel?.auftragsDatum || apiOrder.createdAt),
        fertiggestelltAm: formatDate(apiOrder.fertigstellungBis || werkstattzettel?.fertigstellungBis || apiOrder.statusUpdate || apiOrder.updatedAt),
        productName: apiOrder.product.status || apiOrder.product.name,
        deliveryDate: new Date(apiOrder.updatedAt).toLocaleDateString('de-DE'),
        invoice: apiOrder.invoice,
        priority,
        isPrioritized: priority === 'Dringend',
        KrankenkasseStatus: apiOrder.KrankenkasseStatus || null,
        geschaeftsstandort: apiOrder.geschaeftsstandort || null,
        employee: apiOrder.employee || null,
    };
};

export function OrdersProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsFromUrl = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDays, setSelectedDays] = useState(30);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [searchParams, setSearchParamsState] = useState({
        customerNumber: '',
        orderNumber: '',
        customerName: '',
    });
    const [orderIdFromSearch, setOrderIdFromSearch] = useState<string>('');
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [prioritizedOrders, setPrioritizedOrders] = useState<OrderData[]>([]);
    const [statsRefreshKey, setStatsRefreshKey] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const orderIdFetchedRef = React.useRef<string>(''); // Track which orderId we've already fetched
    const ordersRef = React.useRef<OrderData[]>([]); // Track orders without causing re-renders

    const triggerStatsRefresh = useCallback(() => {
        setStatsRefreshKey(prev => prev + 1);
    }, []);

    const { orders: apiOrders, loading, error, pagination, refetch } = useGetAllOrders(
        currentPage,
        10,
        selectedDays,
        selectedStatus || undefined,
        searchParams.customerNumber || undefined,
        searchParams.orderNumber || undefined,
        searchParams.customerName || undefined
    );


    useEffect(() => {
        // Always update orders, even if empty array
        const mappedOrders = apiOrders.map(mapApiDataToOrderData);

        // Update ref
        ordersRef.current = mappedOrders;

        // Read current orderIdFromSearch value
        const currentOrderId = orderIdFromSearch;

        // If orderId is in URL, filter to show only that specific order
        if (currentOrderId) {
            const filteredOrders = mappedOrders.filter(order => order.id === currentOrderId);
            if (filteredOrders.length > 0) {
                // Show only the order with matching ID
                setOrders(filteredOrders);
                setPrioritizedOrders(filteredOrders.filter(order => order.priority === 'Dringend'));

                const foundOrder = apiOrders.find(apiOrder => apiOrder.id === currentOrderId);
                if (foundOrder) {
                    const orderNumber = foundOrder.orderNumber?.toString() || '';

                    // Set only orderNumber in search params, not customer data
                    if (orderNumber && !searchParams.orderNumber) {
                        setSearchParamsState({
                            customerNumber: '',
                            orderNumber: orderNumber,
                            customerName: '',
                        });
                    }
                }

                return;
            }
            // If not found in search results, show all orders (will be handled by fetch useEffect)
            setOrders(mappedOrders);
            setPrioritizedOrders(mappedOrders.filter(order => order.priority === 'Dringend'));
        } else {
            // Normal behavior - show all orders
            setOrders(mappedOrders);
            setPrioritizedOrders(mappedOrders.filter(order => order.priority === 'Dringend'));
        }

        // If we searched and got results, extract the order ID from the first order
        // Only do this if orderIdFromSearch is not already set (to avoid loops)
        const urlOrderId = searchParamsFromUrl.get('orderId');
        if (mappedOrders.length > 0 && (searchParams.orderNumber || searchParams.customerNumber || searchParams.customerName) && !currentOrderId && !urlOrderId) {
            const firstOrder = mappedOrders[0];
            if (firstOrder.id) {
                setOrderIdFromSearch(firstOrder.id);
            }
        } else if (!searchParams.orderNumber && !searchParams.customerNumber && !searchParams.customerName && !currentOrderId && !urlOrderId) {
            // Only clear if not set from URL
            setOrderIdFromSearch('');
        }
    }, [apiOrders, searchParams.orderNumber, searchParams.customerNumber, searchParams.customerName, orderIdFromSearch, searchParamsFromUrl]);

    // When orderId is in URL but not in search results, fetch it directly and show ONLY that order
    useEffect(() => {
        if (!orderIdFromSearch || !isInitialized) return;

        // Skip if we've already processed this orderId
        if (orderIdFetchedRef.current === orderIdFromSearch) return;

        // Check current orders using ref (doesn't cause re-render)
        const currentOrdersSnapshot = ordersRef.current;
        const orderExists = currentOrdersSnapshot.some(order => order.id === orderIdFromSearch);

        if (orderExists && currentOrdersSnapshot.length > 1) {
            // If order exists and we have multiple orders, show only that order
            const filteredOrder = currentOrdersSnapshot.find(order => order.id === orderIdFromSearch);
            if (filteredOrder) {
                orderIdFetchedRef.current = orderIdFromSearch;
                setOrders([filteredOrder]);
                setPrioritizedOrders(filteredOrder.priority === 'Dringend' ? [filteredOrder] : []);
                return;
            }
        }

        // If order is not in list, fetch it and show ONLY that order
        if (!orderExists) {
            const fetchOrderById = async () => {
                try {
                    const response = await getSingleOrder(orderIdFromSearch);
                    if (response && response.success && response.data) {
                        const order = response.data;
                        const mappedOrder = mapApiDataToOrderData(order);

                        // Extract only orderNumber (Bestellnummer) for AuftragssuchePage
                        const orderNumber = order.orderNumber?.toString() || '';

                        // Set only orderNumber in search params, not customer data
                        if (orderNumber && !searchParams.orderNumber) {
                            setSearchParamsState({
                                customerNumber: '',
                                orderNumber: orderNumber,
                                customerName: '',
                            });
                        }

                        // Mark as fetched
                        orderIdFetchedRef.current = orderIdFromSearch;
                        // Update ref
                        ordersRef.current = [mappedOrder];
                        // Show ONLY this order in the table
                        setOrders([mappedOrder]);
                        setPrioritizedOrders(mappedOrder.priority === 'Dringend' ? [mappedOrder] : []);
                    }
                } catch (error) {
                    console.error('Failed to fetch order by ID:', error);
                }
            };

            fetchOrderById();
        }
    }, [orderIdFromSearch, isInitialized]);

    // Initialize search params from URL on mount
    useEffect(() => {
        if (!isInitialized) {
            const urlCustomerNumber = searchParamsFromUrl.get('customerNumber') || '';
            const urlOrderNumber = searchParamsFromUrl.get('orderNumber') || '';
            const urlCustomerName = searchParamsFromUrl.get('customerName') || '';
            const urlOrderId = searchParamsFromUrl.get('orderId') || '';

            if (urlOrderId) {
                // If orderId is in URL, just set it - don't trigger search
                // The order will be fetched and shown directly
                setOrderIdFromSearch(urlOrderId);
                // Don't set search params to avoid triggering unnecessary search
            } else if (urlCustomerNumber || urlOrderNumber || urlCustomerName) {
                setSearchParamsState({
                    customerNumber: urlCustomerNumber,
                    orderNumber: urlOrderNumber,
                    customerName: urlCustomerName,
                });
            }
            setIsInitialized(true);
        }
    }, [searchParamsFromUrl, isInitialized]);

    // Update URL when search params change - only show orderId
    useEffect(() => {
        if (!isInitialized) return;

        const params = new URLSearchParams();

        // Only keep orderId in URL, remove all other search params
        // Show orderId in URL if available (this is what we want to show)
        if (orderIdFromSearch) {
            params.set('orderId', orderIdFromSearch);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(newUrl, { scroll: false });
    }, [orderIdFromSearch, isInitialized, router, pathname]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDays, selectedStatus, searchParams]);

    const setSearchParams = useCallback((params: { customerNumber?: string; orderNumber?: string; customerName?: string }) => {
        setSearchParamsState(prev => {
            const newParams = {
                customerNumber: params.customerNumber ?? prev.customerNumber,
                orderNumber: params.orderNumber ?? prev.orderNumber,
                customerName: params.customerName ?? prev.customerName,
            };

            // Only update if values actually changed
            if (
                newParams.customerNumber === prev.customerNumber &&
                newParams.orderNumber === prev.orderNumber &&
                newParams.customerName === prev.customerName
            ) {
                return prev;
            }

            return newParams;
        });
    }, []);

    const clearSearchParams = useCallback(() => {
        setSearchParamsState({
            customerNumber: '',
            orderNumber: '',
            customerName: '',
        });
        setOrderIdFromSearch('');
        orderIdFetchedRef.current = ''; // Reset the fetched ref so it can fetch again if needed
        // URL will be updated by the useEffect above
    }, []);

    const deleteOrder = async (orderId: string) => {
        await deleteOrderApi(orderId);

        setOrders(prevOrders => {
            const newOrders = prevOrders.filter(o => o.id !== orderId);

            if (prevOrders.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else if (newOrders.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            return newOrders;
        });

        setPrioritizedOrders(prevPrioritized => prevPrioritized.filter(o => o.id !== orderId));
        triggerStatsRefresh();
    };

    const deleteOrderByUser = async (orderId: string) => {
        await deleteOrderApi(orderId);

        setOrders(prevOrders => {
            const newOrders = prevOrders.filter(o => o.id !== orderId);
            if (prevOrders.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else if (newOrders.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            return newOrders;
        });

        setPrioritizedOrders(prevPrioritized => prevPrioritized.filter(o => o.id !== orderId));
        triggerStatsRefresh();
    };

    const deleteBulkOrders = async (orderIds: string[]) => {
        await deleteGroupOrder(orderIds);

        setOrders(prevOrders => {
            const newOrders = prevOrders.filter(o => !orderIds.includes(o.id));

            // Adjust page if needed
            if (newOrders.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            return newOrders;
        });

        setPrioritizedOrders(prevPrioritized => prevPrioritized.filter(o => !orderIds.includes(o.id)));
        triggerStatsRefresh();
    };


    const bulkUpdateOrderStatus = async (orderIds: string[], newStatus: string) => {
        if (orderIds.length === 0) return;
        await groupOrderStatusUpdate(orderIds, newStatus);

        setOrders(prevOrders =>
            prevOrders.map(order =>
                orderIds.includes(order.id)
                    ? {
                        ...order,
                        status: newStatus,
                        displayStatus: getLabelFromApiStatus(newStatus)
                    }
                    : order
            )
        );
        triggerStatsRefresh();
    };

    const updateOrderPriority = async (orderId: string, priority: 'Dringend' | 'Normal') => {
        await updateOrderPriorityApi(orderId, priority);
        setOrders(prev => {
            const updatedOrders = prev.map(order =>
                order.id === orderId
                    ? { ...order, priority, isPrioritized: priority === 'Dringend' }
                    : order
            );
            setPrioritizedOrders(updatedOrders.filter(order => order.priority === 'Dringend'));
            return updatedOrders;
        });
        triggerStatsRefresh();
    };

    // Optimistically update KrankenkasseStatus for multiple orders
    const updateBulkKrankenkasseStatus = (orderIds: string[], krankenkasseStatus: string) => {
        setOrders(prev => {
            return prev.map(order =>
                orderIds.includes(order.id)
                    ? { ...order, KrankenkasseStatus: krankenkasseStatus }
                    : order
            );
        });
    };

    // Optimistically update payment status (bezahlt) for multiple orders
    const updateBulkPaymentStatus = (orderIds: string[], paymentStatus: string) => {
        setOrders(prev => {
            return prev.map(order =>
                orderIds.includes(order.id)
                    ? { 
                        ...order, 
                        bezahlt: paymentStatus,
                        zahlung: formatPaymentStatus(paymentStatus)
                    }
                    : order
            );
        });
    };

    const refreshOrderData = async (orderId: string) => {
        try {
            const response = await getSingleOrder(orderId);
            if (response.success) {
                const updatedOrder = mapApiDataToOrderData(response.data);
                setOrders(prevOrders =>
                    prevOrders.map(o => o.id === orderId ? updatedOrder : o)
                );
                triggerStatsRefresh();
            }
        } catch (error) {
            console.error('Failed to refresh order data:', error);
        }
    };

    return (
        <OrdersContext.Provider value={{
            orders,
            prioritizedOrders,
            loading,
            error,
            pagination,
            currentPage,
            selectedDays,
            selectedStatus,
            searchParams,
            setCurrentPage,
            setSelectedDays,
            setSelectedStatus,
            setSearchParams,
            clearSearchParams,
            refetch,
            statsRefreshKey,
            triggerStatsRefresh,
            deleteOrder,
            deleteOrderByUser,
            deleteBulkOrders,
            refreshOrderData,
            bulkUpdateOrderStatus,
            updateOrderPriority,
            updateBulkKrankenkasseStatus,
            updateBulkPaymentStatus,
            orderIdFromSearch, // Expose orderId from URL
        }}>
            {children}
        </OrdersContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrdersContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
}

