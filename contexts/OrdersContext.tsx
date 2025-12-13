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
        beschreibung: werkstattzettel?.versorgung || apiOrder.product.versorgung || apiOrder.product.status,
        abholort: "Abholung Innsbruck oder Wird mit Post versandt",
        fertigstellung: new Date(apiOrder.statusUpdate || apiOrder.createdAt).toLocaleDateString('de-DE'),
        erstelltAm: formatDate(werkstattzettel?.auftragsDatum || apiOrder.createdAt),
        fertiggestelltAm: formatDate(werkstattzettel?.fertigstellungBis || apiOrder.statusUpdate || apiOrder.updatedAt),
        productName: apiOrder.product.status || apiOrder.product.name,
        deliveryDate: new Date(apiOrder.updatedAt).toLocaleDateString('de-DE'),
        invoice: apiOrder.invoice,
        priority,
        isPrioritized: priority === 'Dringend',
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
        // console.log('OrdersContext: Updating orders with apiOrders:', apiOrders.length, 'items');
        // console.log('OrdersContext: Current selectedStatus:', selectedStatus);
        const mappedOrders = apiOrders.map(mapApiDataToOrderData);
        setOrders(mappedOrders);
        setPrioritizedOrders(mappedOrders.filter(order => order.priority === 'Dringend'));

        // If we searched and got results, extract the order ID from the first order
        if (mappedOrders.length > 0 && (searchParams.orderNumber || searchParams.customerNumber || searchParams.customerName)) {
            const firstOrder = mappedOrders[0];
            if (firstOrder.id && firstOrder.id !== orderIdFromSearch) {
                setOrderIdFromSearch(firstOrder.id);
            }
        } else if (!searchParams.orderNumber && !searchParams.customerNumber && !searchParams.customerName) {
            setOrderIdFromSearch('');
        }
    }, [apiOrders, searchParams.orderNumber, searchParams.customerNumber, searchParams.customerName, orderIdFromSearch]);

    // Initialize search params from URL on mount
    useEffect(() => {
        if (!isInitialized) {
            const urlCustomerNumber = searchParamsFromUrl.get('customerNumber') || '';
            const urlOrderNumber = searchParamsFromUrl.get('orderNumber') || '';
            const urlCustomerName = searchParamsFromUrl.get('customerName') || '';
            const urlOrderId = searchParamsFromUrl.get('orderId') || '';

            if (urlCustomerNumber || urlOrderNumber || urlCustomerName || urlOrderId) {
                setSearchParamsState({
                    customerNumber: urlCustomerNumber,
                    orderNumber: urlOrderNumber,
                    customerName: urlCustomerName,
                });
                if (urlOrderId) {
                    setOrderIdFromSearch(urlOrderId);
                }
            }
            setIsInitialized(true);
        }
    }, [searchParamsFromUrl, isInitialized]);

    // Update URL when search params change
    useEffect(() => {
        if (!isInitialized) return;

        const params = new URLSearchParams();

        // Add all existing search params except our search params
        searchParamsFromUrl.forEach((value, key) => {
            if (!['customerNumber', 'orderNumber', 'customerName', 'orderId'].includes(key)) {
                params.set(key, value);
            }
        });

        // Add our search params if they have values
        if (searchParams.customerNumber) {
            params.set('customerNumber', searchParams.customerNumber);
        }


        if (searchParams.customerName) {
            params.set('customerName', searchParams.customerName);
        }

        // Show orderId in URL if available (this is what we want to show)
        if (orderIdFromSearch) {
            params.set('orderId', orderIdFromSearch);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(newUrl, { scroll: false });
    }, [searchParams, orderIdFromSearch, isInitialized, router, pathname, searchParamsFromUrl]);

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

