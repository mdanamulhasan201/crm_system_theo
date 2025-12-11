'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import CardStatistik from '../_components/Massschuhauftraeges/CardS'
import MassschuhaufträgeChart from '../_components/Massschuhauftraeges/MassschuhaufträgeChart'
import CustomerSearch from '../_components/Massschuhauftraeges/CustomerSearch'
import ChangesOrderProgress from '../_components/Massschuhauftraeges/ChangesOrderProgress';

import ProductionView from '../_components/Massschuhauftraeges/ProductionView';
import WelcomePopup from '../_components/Massschuhauftraeges/WelcomePopup';
import { useRouter } from 'next/navigation';
import CardDeatilsPage from '../_components/Massschuhauftraeges/CardDeatilsPage';
import { getAllMassschuheOrder } from '@/apis/MassschuheManagemantApis';
import { MassschuheOrderData } from '@/hooks/massschuhe/useGetAllMassschuheOrder';

export default function MassschuhauftraegePage() {
    const [showPopup, setShowPopup] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);
    const [tabClicked, setTabClicked] = useState<number>(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const refetchProductionViewRef = useRef<(() => void) | null>(null);
    const refetchCardStatistikRef = useRef<(() => void) | null>(null);
    const refetchChartRef = useRef<(() => void) | null>(null);
    const updateOrderRef = useRef<((orderId: string, updatedData: any) => void) | null>(null);
    const router = useRouter()
    
    // Stable callback to set refetch function for ProductionView
    const handleRefetchReady = useCallback((refetch: () => void) => {
        refetchProductionViewRef.current = refetch;
    }, []);
    
    // Stable callback to call refetch for ProductionView
    const handleRefetchProductionView = useCallback(() => {
        refetchProductionViewRef.current?.();
    }, []);

    // Stable callback to set refetch function for CardStatistik
    const handleCardStatistikRefetchReady = useCallback((refetch: () => void) => {
        refetchCardStatistikRef.current = refetch;
    }, []);

    // Stable callback to call refetch for CardStatistik
    const handleRefetchCardStatistik = useCallback(() => {
        refetchCardStatistikRef.current?.();
    }, []);

    // Stable callback to set refetch function for Chart
    const handleChartRefetchReady = useCallback((refetch: () => void) => {
        refetchChartRef.current = refetch;
    }, []);

    // Stable callback to call refetch for Chart
    const handleRefetchChart = useCallback(() => {
        refetchChartRef.current?.();
    }, []);

    // Stable callback to set update function for ProductionView
    const handleUpdateOrderReady = useCallback((updateFn: (orderId: string, updatedData: any) => void) => {
        updateOrderRef.current = updateFn;
    }, []);

    // Stable callback to update single order in ProductionView (without full reload)
    const handleUpdateOrder = useCallback((orderId: string, updatedData: any) => {
        updateOrderRef.current?.(orderId, updatedData);
    }, []);
    const handleStart = () => {
        // Pass order ID as query parameter
        const url = selectedOrderId 
            ? `/dashboard/massschuhauftraege-deatils/1?orderId=${selectedOrderId}`
            : '/dashboard/massschuhauftraege-deatils/1';
        router.push(url);
    };
    const handleStart2 = () => {
        // Pass order ID as query parameter
        const url = selectedOrderId 
            ? `/dashboard/massschuhauftraege-deatils/2?orderId=${selectedOrderId}`
            : '/dashboard/massschuhauftraege-deatils/2';
        router.push(url);
    };

    // Helper function to check if an order is running (not completed)
    const isOrderRunning = (order: MassschuheOrderData): boolean => {
        // If status is "Geliefert", it's completed
        if (order.status === "Geliefert") {
            return false;
        }
        
        // Check statusHistory - if any status has started but not finished, it's running
        if (order.statusHistory && order.statusHistory.length > 0) {
            const hasRunningStatus = order.statusHistory.some(history => {
                const hasStarted = history.startedAt || history.started;
                const isFinished = history.finishedAt || history.finished;
                return hasStarted && !isFinished;
            });
            return hasRunningStatus;
        }
        
        // If no statusHistory but status exists and is not "Geliefert", consider it running
        return order.status !== "Geliefert";
    };

    // Fetch customer orders and find running order
    useEffect(() => {
        const fetchCustomerRunningOrder = async () => {
            if (!selectedCustomerId) {
                setSelectedOrderId(null);
                return;
            }

            try {
                // Fetch orders and filter by customerId on client side
                // Fetch multiple pages to find customer orders
                let allCustomerOrders: MassschuheOrderData[] = [];
                let page = 1;
                let hasMore = true;
                let foundRunningOrder: MassschuheOrderData | null = null;
                const limit = 50; // Fetch more per page to reduce API calls

                // Fetch pages until we find a running order or exhaust all pages
                while (hasMore && page <= 5 && !foundRunningOrder) {
                    const response = await getAllMassschuheOrder(page, limit);
                    
                    if (response.success && response.data) {
                        // Filter orders by customerId
                        const customerOrders = response.data.filter(
                            (order: MassschuheOrderData) => order.customerId === selectedCustomerId
                        );
                        
                        allCustomerOrders = [...allCustomerOrders, ...customerOrders];
                        
                        // Check if we found a running order in this batch
                        foundRunningOrder = customerOrders.find((order: MassschuheOrderData) => isOrderRunning(order)) || null;
                        
                        // Check if there are more pages
                        hasMore = response.pagination?.hasNextPage || false;
                        page++;
                    } else {
                        hasMore = false;
                    }
                }

                // If we found a running order, use it
                if (foundRunningOrder) {
                    setSelectedOrderId(foundRunningOrder.id);
                    // Set the tab based on order status
                    const statusToTab: Record<string, number> = {
                        "Leistenerstellung": 1,
                        "Bettungsherstellung": 2,
                        "Halbprobenerstellung": 3,
                        "Schafterstellung": 4,
                        "Bodenerstellung": 5,
                        "Geliefert": 6,
                    };
                    const tabIndex = statusToTab[foundRunningOrder.status] || 0;
                    setTabClicked(tabIndex);
                } else if (allCustomerOrders.length > 0) {
                    // No running order found, select the most recent order
                    const mostRecentOrder = allCustomerOrders.sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];
                    setSelectedOrderId(mostRecentOrder.id);
                    const statusToTab: Record<string, number> = {
                        "Leistenerstellung": 1,
                        "Bettungsherstellung": 2,
                        "Halbprobenerstellung": 3,
                        "Schafterstellung": 4,
                        "Bodenerstellung": 5,
                        "Geliefert": 6,
                    };
                    const tabIndex = statusToTab[mostRecentOrder.status] || 0;
                    setTabClicked(tabIndex);
                } else {
                    // No orders found for this customer
                    setSelectedOrderId(null);
                }
            } catch (error) {
                console.error('Failed to fetch customer orders:', error);
                setSelectedOrderId(null);
            }
        };

        fetchCustomerRunningOrder();
    }, [selectedCustomerId]);

    // Handle customer ID selection
    const handleCustomerIdSelect = useCallback((customerId: string | null) => {
        setSelectedCustomerId(customerId);
        // Clear selected order when customer is cleared
        if (!customerId) {
            setSelectedOrderId(null);
        }
    }, []);
    return (
        <div>
            {showPopup && (
                <WelcomePopup
                    onClose={() => setShowPopup(false)}
                    onStart={handleStart}
                    title="Willkommen zur"
                    details="Halbprobenerstellung mit FeetF1rst"
                    buttonText="JETZT STARTEN"
                    description="In den nächsten Schritten erfassen wir die wichtigsten informationen, um die Fußversorgung Ihres Kunden optimal auf ihre Anforderungen abzustimmen."
                    infoText="Alle Angaben können am Ende nochmals überprüft werden."
                />
            )}

            {showPopup2 && (
                <WelcomePopup
                    onClose={() => setShowPopup2(false)}
                    onStart={handleStart2}
                    title="Willkommen zur Bodenerstellung "
                    details="mit FeetF1rst"
                    buttonText="JETZT STARTEN"
                    description="In den nächsten Schritten erfassen wir die wichtigsten Informationen, damit die Bodenkonstruktion perfekt auf Ihre Anforderungen abgestimmt wird."
                    infoText="Alle Angaben können am Ende nochmals überprüft werden."
                />
            )}
            <CardStatistik onRefetchReady={handleCardStatistikRefetchReady} />
            <MassschuhaufträgeChart onRefetchReady={handleChartRefetchReady} />
            <CustomerSearch 
                onCustomerSelect={setSelectedCustomer} 
                onCustomerIdSelect={handleCustomerIdSelect}
            />

            {selectedCustomer && (
                <ChangesOrderProgress
                onClick2={() => {
                    setShowPopup2(true)
                }}
                onClick={() => {
                    setShowPopup(true)
                }}
                setTabClicked={setTabClicked} 
                tabClicked={tabClicked}
                selectedOrderId={selectedOrderId}
                onTabChange={setTabClicked}
                onRefetchProductionView={handleRefetchProductionView}
                onRefetchCardStatistik={handleRefetchCardStatistik}
                onRefetchChart={handleRefetchChart}
                onUpdateOrder={handleUpdateOrder}
                />
            )}
            <ProductionView 
                tabClicked={tabClicked} 
                onOrderSelect={setSelectedOrderId}
                selectedOrderId={selectedOrderId}
                onTabChange={setTabClicked}
                onRefetchReady={handleRefetchReady}
                onUpdateOrderReady={handleUpdateOrderReady}
            />

            <CardDeatilsPage />
        </div>
    );
}
