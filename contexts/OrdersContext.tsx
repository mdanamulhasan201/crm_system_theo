'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGetAllOrders, ApiOrderData } from '@/hooks/orders/useGetAllOrders';
import { updateOrderStatus as updateOrderStatusApi, deleteOrder as deleteOrderApi, getSingleOrder, getAllOrders } from '@/apis/productsOrder';
import { useUpdateOrderStatus } from '@/hooks/orders/useUpdateOrderStatus';

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
    isPrioritized: boolean;
    currentStep: number;
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
    togglePriority: (orderId: string) => Promise<void>;
    moveToNextStep: (orderId: string) => void;
    moveToPreviousStep: (orderId: string) => void;
    updateOrderStatus: (orderId: string, newStatus: string, newStep: number) => Promise<void>;
    refetch: () => void;
    deleteOrder: (orderId: string) => void;
    deleteOrderByUser: (orderId: string) => void;
    refreshOrderData: (orderId: string) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const steps = [
    "Einlage vorbereiten",
    "Einlage in Fertigung",
    "Einlage verpacken",
    "Einlage Abholbereit",
    "Einlage versandt",
    "Ausgeführte Einlagen"
];

// Map German status names to API status values
const germanStatusToApiStatus: Record<string, string> = {
    "Einlage vorbereiten": "Einlage_vorbereiten",
    "Einlage in Fertigung": "Einlage_in_Fertigung",
    "Einlage verpacken": "Einlage_verpacken",
    "Einlage Abholbereit": "Einlage_Abholbereit",
    "Einlage versandt": "Einlage_versandt",
    "Ausgeführte Einlagen": "Ausgeführte_Einlagen"
};

// Map API status values to German status names
const apiStatusToGermanStatus: Record<string, string> = {
    "Started": "Einlage vorbereiten",
    "Sarted": "Einlage vorbereiten",
    "In Progress": "Einlage in Fertigung",
    "Packaging": "Einlage verpacken",
    "Ready for Pickup": "Einlage Abholbereit",
    "Shipped": "Einlage versandt",
    "Completed": "Ausgeführte Einlagen",
    "Delivered": "Ausgeführte Einlagen",
    // New API status mappings
    "Einlage_vorbereiten": "Einlage vorbereiten",
    "Einlage_in_Fertigung": "Einlage in Fertigung",
    "Einlage_verpacken": "Einlage verpacken",
    "Einlage_Abholbereit": "Einlage Abholbereit",
    "Einlage_versandt": "Einlage versandt",
    "Ausgeführte_Einlagen": "Ausgeführte Einlagen"
};

const shouldBePrioritized = (orderStatus: string): boolean => {
    const prioritizedStatuses = [
        'Einlage_vorbereiten',
        'Einlage_in_Fertigung',
        'Einlage_verpacken',
        'Einlage_Abholbereit',
        'Einlage_versandt'
    ];
    return prioritizedStatuses.includes(orderStatus);
};

// Helper function to map API data to OrderData
const mapApiDataToOrderData = (apiOrder: ApiOrderData): OrderData => {
    // Map orderStatus to step index (you can customize this mapping)
    const statusToStepMap: Record<string, number> = {
        'Sarted': 0,
        'Started': 0,
        'In Progress': 1,
        'Packaging': 2,
        'Ready for Pickup': 3,
        'Shipped': 4,
        'Completed': 5,
        'Delivered': 5,
        // New API status mappings
        'Einlage_vorbereiten': 0,
        'Einlage_in_Fertigung': 1,
        'Einlage_verpacken': 2,
        'Einlage_Abholbereit': 3,
        'Einlage_versandt': 4,
        'Ausgeführte_Einlagen': 5
    };

    const currentStep = statusToStepMap[apiOrder.orderStatus] || 0;
    const germanStatus = apiStatusToGermanStatus[apiOrder.orderStatus] || apiOrder.orderStatus;
    const isPrioritized = shouldBePrioritized(apiOrder.orderStatus);
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('de-DE');
    };

    const werkstattzettel = apiOrder.werkstattzettel;

    return {
        id: apiOrder.id,
        bestellnummer: apiOrder.customer.customerNumber.toString(),
        kundenname: `${apiOrder.customer.vorname} ${apiOrder.customer.nachname}`,
        status: apiOrder.orderStatus,
        displayStatus: germanStatus,
        preis: `${(apiOrder.fußanalyse + apiOrder.einlagenversorgung).toFixed(2)} €`,
        zahlung: werkstattzettel?.bezahlt ? 'Bezahlt' : 'Offen',
        beschreibung: werkstattzettel?.versorgung || apiOrder.product.versorgung || apiOrder.product.status,
        abholort: "Abholung Innsbruck oder Wird mit Post versandt",
        fertigstellung: new Date(apiOrder.statusUpdate || apiOrder.createdAt).toLocaleDateString('de-DE'),
        erstelltAm: formatDate(werkstattzettel?.auftragsDatum || apiOrder.createdAt),
        fertiggestelltAm: formatDate(werkstattzettel?.fertigstellungBis || apiOrder.statusUpdate || apiOrder.updatedAt),
        productName: apiOrder.product.status || apiOrder.product.name,
        deliveryDate: new Date(apiOrder.updatedAt).toLocaleDateString('de-DE'),
        invoice: apiOrder.invoice, // Include invoice URL
        isPrioritized: isPrioritized,
        currentStep: currentStep,
    };
};

export function OrdersProvider({ children }: { children: ReactNode }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDays, setSelectedDays] = useState(30); // Default to 30 days
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [prioritizedOrders, setPrioritizedOrders] = useState<OrderData[]>([]);

    const { orders: apiOrders, loading, error, pagination, refetch } = useGetAllOrders(currentPage, 10, selectedDays, selectedStatus || undefined);
    const { updateStatus: updateOrderStatusHook } = useUpdateOrderStatus();

    useEffect(() => {
        const loadPrioritizedOrders = async () => {
            try {
                const allPrioritizedOrders: OrderData[] = [];
                for (let page = 1; page <= 3; page++) {
                    const response = await getAllOrders(page, 10, selectedDays, selectedStatus || undefined);
                    if (response.success && response.data.length > 0) {
                        const mappedOrders = response.data.map(mapApiDataToOrderData);
                        const prioritizedFromPage = mappedOrders.filter((order: OrderData) => order.isPrioritized);
                        allPrioritizedOrders.push(...prioritizedFromPage);
                    }

                    if (response.pagination && !response.pagination.hasNextPage) break;
                }

                setPrioritizedOrders(allPrioritizedOrders);
            } catch (error) {
                console.error('Failed to load prioritized orders:', error);
            }
        };

        loadPrioritizedOrders();
    }, [selectedDays, selectedStatus]);

    useEffect(() => {
        // Always update orders, even if empty array
        // console.log('OrdersContext: Updating orders with apiOrders:', apiOrders.length, 'items');
        // console.log('OrdersContext: Current selectedStatus:', selectedStatus);
        const mappedOrders = apiOrders.map(mapApiDataToOrderData);
        setOrders(mappedOrders);
        
        // Update prioritized orders
        setPrioritizedOrders(prevPrioritized => {
            const existingPrioritized = prevPrioritized.filter(order =>
                !mappedOrders.some(newOrder => newOrder.id === order.id)
            );
            const newPrioritized = mappedOrders.filter(order => order.isPrioritized);
            return [...existingPrioritized, ...newPrioritized];
        });
    }, [apiOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDays, selectedStatus]);


    const togglePriority = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const isPrioritizing = !order.isPrioritized;

        if (isPrioritizing) {
            try {
                await updateOrderStatusHook(orderId, "Einlage_vorbereiten");

                setOrders(prevOrders =>
                    prevOrders.map(o =>
                        o.id === orderId
                            ? {
                                ...o,
                                isPrioritized: true,
                                currentStep: 0,
                                status: "Einlage_vorbereiten",
                                displayStatus: "Einlage vorbereiten"
                            }
                            : o
                    )
                );

                setPrioritizedOrders(prevPrioritized => {
                    const updatedOrder = {
                        ...order,
                        isPrioritized: true,
                        currentStep: 0,
                        status: "Einlage_vorbereiten",
                        displayStatus: "Einlage vorbereiten"
                    };
                    const existingIndex = prevPrioritized.findIndex(o => o.id === orderId);
                    if (existingIndex >= 0) {
                        return prevPrioritized.map(o => o.id === orderId ? updatedOrder : o);
                    } else {
                        return [...prevPrioritized, updatedOrder];
                    }
                });
            } catch (error) {
                console.error('Failed to update order status:', error);
            }
        } else {
            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === orderId
                        ? { ...o, isPrioritized: false }
                        : o
                )
            );
            setPrioritizedOrders(prevPrioritized =>
                prevPrioritized.filter(o => o.id !== orderId)
            );
        }
    };

    const moveToNextStep = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.currentStep >= steps.length - 1) return;

        const nextStep = order.currentStep + 1;
        const nextGermanStatus = steps[nextStep];
        const nextApiStatus = germanStatusToApiStatus[nextGermanStatus];

        if (!nextApiStatus) {
            console.error('Invalid next status:', nextGermanStatus);
            return;
        }

        try {
            await updateOrderStatusHook(orderId, nextApiStatus);
            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === orderId
                        ? {
                            ...o,
                            currentStep: nextStep,
                            status: nextApiStatus,
                            displayStatus: nextGermanStatus
                        }
                        : o
                )
            );

            setPrioritizedOrders(prevPrioritized =>
                prevPrioritized.map(o =>
                    o.id === orderId
                        ? {
                            ...o,
                            currentStep: nextStep,
                            status: nextApiStatus,
                            displayStatus: nextGermanStatus
                        }
                        : o
                )
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const moveToPreviousStep = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.currentStep <= 0) return;

        const previousStep = order.currentStep - 1;
        const previousGermanStatus = steps[previousStep];
        const previousApiStatus = germanStatusToApiStatus[previousGermanStatus];

        if (!previousApiStatus) {
            console.error('Invalid previous status:', previousGermanStatus);
            return;
        }

        try {
            await updateOrderStatusHook(orderId, previousApiStatus);
            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === orderId
                        ? {
                            ...o,
                            currentStep: previousStep,
                            status: previousApiStatus,
                            displayStatus: previousGermanStatus
                        }
                        : o
                )
            );

            setPrioritizedOrders(prevPrioritized =>
                prevPrioritized.map(o =>
                    o.id === orderId
                        ? {
                            ...o,
                            currentStep: previousStep,
                            status: previousApiStatus,
                            displayStatus: previousGermanStatus
                        }
                        : o
                )
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const updateOrderStatus = async (orderId: string, newGermanStatus: string, newStep: number) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const newApiStatus = germanStatusToApiStatus[newGermanStatus];
        if (!newApiStatus) {
            console.error('Invalid German status:', newGermanStatus);
            return;
        }

        try {
            // Update status via API
            await updateOrderStatusHook(orderId, newApiStatus);

            // Update local state
            setOrders(prevOrders =>
                prevOrders.map(o =>
                    o.id === orderId
                        ? {
                            ...o,
                            status: newApiStatus,
                            currentStep: newStep,
                            displayStatus: newGermanStatus
                        }
                        : o
                )
            );

            // Also update prioritized orders if this order is prioritized
            setPrioritizedOrders(prevPrioritized =>
                prevPrioritized.map(o =>
                    o.id === orderId
                        ? {
                            ...o,
                            status: newApiStatus,
                            currentStep: newStep,
                            displayStatus: newGermanStatus
                        }
                        : o
                )
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

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


    const refreshOrderData = async (orderId: string) => {
        try {
            const response = await getSingleOrder(orderId);
            if (response.success) {
                const updatedOrder = mapApiDataToOrderData(response.data);
                setOrders(prevOrders =>
                    prevOrders.map(o => o.id === orderId ? updatedOrder : o)
                );
                setPrioritizedOrders(prevPrioritized => {
                    const existingIndex = prevPrioritized.findIndex(o => o.id === orderId);
                    if (updatedOrder.isPrioritized) {
                        if (existingIndex >= 0) {
                            return prevPrioritized.map(o => o.id === orderId ? updatedOrder : o);
                        } else {

                            return [...prevPrioritized, updatedOrder];
                        }
                    } else {

                        return prevPrioritized.filter(o => o.id !== orderId);
                    }
                });
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
            togglePriority,
            moveToNextStep,
            moveToPreviousStep,
            updateOrderStatus,
            refetch,
            deleteOrder,
            deleteOrderByUser,
            refreshOrderData,
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

export { steps };
