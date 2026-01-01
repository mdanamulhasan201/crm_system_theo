'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import CardStatistik from '../_components/Massschuhauftraeges/CardS'
import MassschuhaufträgeChart from '../_components/Massschuhauftraeges/MassschuhaufträgeChart'
import CustomerSearch from '../_components/Massschuhauftraeges/CustomerSearch'
import ChangesOrderProgress from '../_components/Massschuhauftraeges/ChangesOrderProgress';

import ProductionView from '../_components/Massschuhauftraeges/ProductionView';
import WelcomePopup from '../_components/Massschuhauftraeges/WelcomePopup';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CardDeatilsPage from '../_components/Massschuhauftraeges/CardDeatilsPage';
import { getAllMassschuheOrder, updateMassschuheOrderChangesStatus, getMassschuheOrderById } from '@/apis/MassschuheManagemantApis';
import { MassschuheOrderData } from '@/hooks/massschuhe/useGetAllMassschuheOrder';
import { useGetSingleMassschuheOrder } from '@/hooks/massschuhe/useGetSingleMassschuheOrder';

export default function MassschuhauftraegePage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsFromUrl = useSearchParams();
    const [showPopup, setShowPopup] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);
    const [tabClicked, setTabClicked] = useState<number>(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSearchingOrders, setIsSearchingOrders] = useState(false);
    const refetchProductionViewRef = useRef<(() => void) | null>(null);
    const refetchCardStatistikRef = useRef<(() => void) | null>(null);
    const refetchChartRef = useRef<(() => void) | null>(null);
    const updateOrderRef = useRef<((orderId: string, updatedData: any) => void) | null>(null);
    
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

    // Fetch currently selected order details
    const { order: selectedOrder, refetch: refetchSelectedOrder } = useGetSingleMassschuheOrder(selectedOrderId);

    // Toggle express / standard for the selected order
    const handleSetExpressStatus = useCallback(async (express: boolean) => {
        if (!selectedOrderId) return;
        try {
            await updateMassschuheOrderChangesStatus(selectedOrderId, express);
            const updated = await refetchSelectedOrder();
            if (updated && updateOrderRef.current) {
                updateOrderRef.current(selectedOrderId, { express: updated.express });
            }
            // Keep other widgets in sync; table is updated locally above
            handleRefetchCardStatistik();
            handleRefetchChart();
        } catch (error) {
            console.error('Failed to update express status:', error);
        }
    }, [selectedOrderId, refetchSelectedOrder, handleRefetchProductionView, handleRefetchCardStatistik, handleRefetchChart]);

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
                setIsSearchingOrders(false);
                return;
            }

            setIsSearchingOrders(true);
            try {
                // Get customer data for search parameters
                const customerNumber = selectedCustomer?.customerNumber;
                const geburtsdatum = selectedCustomer?.geburtsdatum;
                const vorname = selectedCustomer?.vorname;
                const nachname = selectedCustomer?.nachname;
                
                // Fetch orders using API with customer search parameters
                let allCustomerOrders: MassschuheOrderData[] = [];
                let page = 1;
                let hasMore = true;
                let foundRunningOrder: MassschuheOrderData | null = null;
                const limit = 50; // Fetch more per page to reduce API calls

                // Try to fetch with search parameters first
                let foundOrders = false;
                if (customerNumber || geburtsdatum || vorname || nachname) {
                    try {
                        const response = await getAllMassschuheOrder(
                            page, 
                            limit, 
                            undefined, // status
                            geburtsdatum, // geburtsdatum
                            customerNumber, // customerNumber
                            vorname, // vorname
                            nachname, // nachname
                            selectedCustomerId // customerId
                        );
                        
                        if (response.success && response.data) {
                            // Filter by customerId on client side - check both customerId and customer.id
                            const customerOrders = response.data.filter(
                                (order: any) => {
                                    const orderCustomerId = order.customerId || (order.customer?.id);
                                    return orderCustomerId === selectedCustomerId;
                                }
                            );
                            
                            if (customerOrders.length > 0) {
                                allCustomerOrders = [...customerOrders];
                                foundOrders = true;
                                // Check if we found a running order
                                foundRunningOrder = customerOrders.find((order: MassschuheOrderData) => isOrderRunning(order)) || null;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching orders with search params:', error);
                    }
                }

                // If no orders found with search params, fetch all orders and filter by customerId
                if (!foundOrders) {
                    page = 1;
                    hasMore = true;
                    
                    while (hasMore && page <= 5 && !foundRunningOrder) {
                        const response = await getAllMassschuheOrder(page, limit);
                        
                        if (response.success && response.data) {
                            // Filter orders by customerId - check both customerId and customer.id
                            const customerOrders = response.data.filter(
                                (order: any) => {
                                    const orderCustomerId = order.customerId || (order.customer?.id);
                                    return orderCustomerId === selectedCustomerId;
                                }
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
                }

                // If we found a running order, use it
                if (foundRunningOrder) {
                    const orderId = foundRunningOrder.id;
                    // Use the same pattern as table click - call setSelectedOrderId which will trigger URL update
                    setSelectedOrderId(orderId);
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
                    const orderId = mostRecentOrder.id;
                    // Use the same pattern as table click - call setSelectedOrderId which will trigger URL update
                    setSelectedOrderId(orderId);
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
            } finally {
                setIsSearchingOrders(false);
            }
        };

        fetchCustomerRunningOrder();
    }, [selectedCustomerId, selectedCustomer]);

    // Read orderId from URL when page loads and fetch order to get customer info
    useEffect(() => {
        const orderIdFromUrl = searchParamsFromUrl.get('orderId');
        if (orderIdFromUrl && !isInitialized) {
            // Fetch order by ID to get customer information
            const fetchOrderAndSetCustomer = async () => {
                try {
                    const response = await getMassschuheOrderById(orderIdFromUrl);
                    if (response && response.success && response.data) {
                        const order = response.data;
                        // Set the order ID
                        setSelectedOrderId(orderIdFromUrl);
                        // Set customer ID from order so customer search shows the customer
                        if (order.customerId) {
                            setSelectedCustomerId(order.customerId);
                        }
                    } else {
                        // If fetch fails, just set the order ID
                        setSelectedOrderId(orderIdFromUrl);
                    }
                } catch (error) {
                    console.error('Failed to fetch order by ID:', error);
                    // If fetch fails, just set the order ID
                    setSelectedOrderId(orderIdFromUrl);
                }
            };
            fetchOrderAndSetCustomer();
            setIsInitialized(true);
        } else if (!orderIdFromUrl) {
            setIsInitialized(true);
        }
    }, [searchParamsFromUrl, isInitialized]);

    // Update URL when order is selected
    useEffect(() => {
        // Don't wait for isInitialized - update URL immediately when order is selected
        // This ensures customer search works the same way as table click
        if (!selectedOrderId) return;
        
        const params = new URLSearchParams();
        
        // Keep other URL parameters
        searchParamsFromUrl.forEach((value, key) => {
            if (key !== 'orderId') {
                params.set(key, value);
            }
        });
        
        // Add orderId to URL
        params.set('orderId', selectedOrderId);
        
        // Update URL without page reload
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
    }, [selectedOrderId, router, pathname, searchParamsFromUrl]);

    // Handle customer ID selection
    const handleCustomerIdSelect = useCallback((customerId: string | null) => {
        setSelectedCustomerId(customerId);
        // Clear selected order when customer is cleared
        if (!customerId) {
            setSelectedOrderId(null);
            // Clear orderId from URL when customer is cleared
            const params = new URLSearchParams();
            searchParamsFromUrl.forEach((value, key) => {
                if (key !== 'orderId') {
                    params.set(key, value);
                }
            });
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [router, pathname, searchParamsFromUrl]);
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
                selectedOrder={selectedOrder}
                onSetExpressStatus={handleSetExpressStatus}
                initialCustomerId={selectedCustomerId}
            />

            {(selectedCustomerId || selectedOrderId || searchParamsFromUrl.get('orderId')) && (
                <ChangesOrderProgress
                onClick2={() => {
                    setShowPopup2(true)
                }}
                onClick={() => {
                    setShowPopup(true)
                }}
                setTabClicked={setTabClicked} 
                tabClicked={tabClicked}
                selectedOrderId={selectedOrderId || searchParamsFromUrl.get('orderId')}
                onTabChange={setTabClicked}
                onRefetchProductionView={handleRefetchProductionView}
                onRefetchCardStatistik={handleRefetchCardStatistik}
                onRefetchChart={handleRefetchChart}
                onUpdateOrder={handleUpdateOrder}
                isSearchingOrders={isSearchingOrders}
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
