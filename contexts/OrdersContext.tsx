'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGetAllOrders, ApiOrderData } from '@/hooks/orders/useGetAllOrders';
import { deleteOrder as deleteOrderApi, deleteGroupOrder, getSingleOrder, getAllOrders, groupOrderStatusUpdate, updateOrderPriority as updateOrderPriorityApi } from '@/apis/productsOrder';
import { getLabelFromApiStatus } from '@/lib/orderStatusMappings';

export interface OrderData {
    id: string;
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
    setCurrentPage: (page: number) => void;
    setSelectedDays: (days: number) => void;
    setSelectedStatus: (status: string | null) => void;
    refetch: () => void;
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
        bestellnummer: apiOrder.customer.customerNumber.toString(),
        kundenname: `${apiOrder.customer.vorname} ${apiOrder.customer.nachname}`,
        status: apiOrder.orderStatus,
        displayStatus: getLabelFromApiStatus(apiOrder.orderStatus),
        preis: `${(apiOrder.fußanalyse + apiOrder.einlagenversorgung).toFixed(2)} €`,
        zahlung: werkstattzettel?.bezahlt ? 'Bezahlt' : 'Offen',
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
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDays, setSelectedDays] = useState(30); // Default to 30 days
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [prioritizedOrders, setPrioritizedOrders] = useState<OrderData[]>([]);

    const { orders: apiOrders, loading, error, pagination, refetch } = useGetAllOrders(currentPage, 10, selectedDays, selectedStatus || undefined);


    useEffect(() => {
        // Always update orders, even if empty array
        // console.log('OrdersContext: Updating orders with apiOrders:', apiOrders.length, 'items');
        // console.log('OrdersContext: Current selectedStatus:', selectedStatus);
        const mappedOrders = apiOrders.map(mapApiDataToOrderData);
        setOrders(mappedOrders);
        setPrioritizedOrders(mappedOrders.filter(order => order.priority === 'Dringend'));
    }, [apiOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDays, selectedStatus]);

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
    };

    const refreshOrderData = async (orderId: string) => {
        try {
            const response = await getSingleOrder(orderId);
            if (response.success) {
                const updatedOrder = mapApiDataToOrderData(response.data);
                setOrders(prevOrders =>
                    prevOrders.map(o => o.id === orderId ? updatedOrder : o)
                );
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
            setCurrentPage,
            setSelectedDays,
            setSelectedStatus,
            refetch,
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

