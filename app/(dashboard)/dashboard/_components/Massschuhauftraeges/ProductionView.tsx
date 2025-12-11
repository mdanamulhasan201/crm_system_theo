import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useGetAllMassschuheOrder, MassschuheOrderData } from "@/hooks/massschuhe/useGetAllMassschuheOrder";

const tabs = [
  "Versorgungs Start",
  "Leisten Erstellung",
  "Bettungs Erstellung",
  "Halbproben Erstellung",
  "Schaft Erstellung",
  "Boden Erstellung",
  "Geliefert / Abgeschlossen",
];

// Map tab indices to API status values
const statusMap: Record<number, string> = {
  0: "Versorgungs Start",
  1: "Leistenerstellung",
  2: "Bettungsherstellung",
  3: "Halbprobenerstellung",
  4: "Schafterstellung",
  5: "Bodenerstellung",
  6: "Geliefert",
};

// Reverse map: status to tab index
const statusToTabMap: Record<string, number> = {
  "Versorgungs Start": 0,
  "Leistenerstellung": 1,
  "Bettungsherstellung": 2,
  "Halbprobenerstellung": 3,
  "Schafterstellung": 4,
  "Bodenerstellung": 5,
  "Geliefert": 6,
};

const ProductionView = ({ tabClicked, onOrderSelect, selectedOrderId, onTabChange, onRefetchReady, onUpdateOrderReady }: { 
  tabClicked: number; 
  onOrderSelect?: (orderId: string) => void;
  selectedOrderId?: string | null;
  onTabChange?: (tab: number) => void;
  onRefetchReady?: (refetch: () => void) => void;
  onUpdateOrderReady?: (updateFn: (orderId: string, updatedData: Partial<MassschuheOrderData>) => void) => void;
}) => {
  const [activeTab, setActiveTab] = useState(tabClicked);
  const [page, setPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(10); 
  const [allOrders, setAllOrders] = useState<MassschuheOrderData[]>([]); 
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
  const limit = 10;

  // Get status filter based on active tab
  const statusFilter = statusMap[activeTab];

  // Fetch orders using custom hook with status filter
  const { orders, loading, error, pagination, refetch } = useGetAllMassschuheOrder(
    page, 
    limit, 
    statusFilter === "Versorgungs Start" ? undefined : statusFilter
  );

  // Accumulate orders when new data is fetched
  useEffect(() => {
    if (orders.length > 0) {
      if (page === 1) {
        // Reset on first page or tab change
        setAllOrders(orders);
        setDisplayCount(10);
      } else {
        // Append new orders when loading next page
        setAllOrders(prev => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(o => o.id));
          const newOrders = orders.filter(o => !existingIds.has(o.id));
          return [...prev, ...newOrders];
        });
      }
      setIsLoadingMore(false);
    }
  }, [orders, page]);

  // Track if this is initial load or load more
  const isInitialLoad = page === 1 && allOrders.length === 0;

  // Filter and limit orders to display
  const filteredOrders = useMemo(() => {
    return allOrders.slice(0, displayCount);
  }, [allOrders, displayCount]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Offen";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "Offen";
    }
  };

  // Calculate total price - sum of fußanalyse and einlagenversorgung
  const calculatePrice = (fußanalyse: number | null, einlagenversorgung: number | null) => {
    const fußanalysePrice = fußanalyse ?? 0;
    const einlagenPrice = einlagenversorgung ?? 0;
    const total = fußanalysePrice + einlagenPrice;
    return total > 0 ? total.toFixed(2) : "-";
  };

  // Get finished date from statusHistory - only show when "Geliefert" is completed
  const getFinishedDate = (order: any) => {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return "-";
    }
    
    // Only show date when "Geliefert" (final delivery) status is completed
    const geliefertHistory = order.statusHistory.find(
      (history: any) => history.status === "Geliefert"
    );
    
    // If Geliefert status doesn't exist or is not finished, return "-"
    if (!geliefertHistory) return "-";
    
    // Check if Geliefert is finished
    const finished = geliefertHistory.finished;
    const finishedAt = geliefertHistory.finishedAt;
    
    // If finished field exists and has value
    if (finished && finished !== "null" && finished !== "undefined" && finished !== null) {
      return finished;
    }
    
    // If 'finished' is null but 'finishedAt' exists, format it
    if (finishedAt) {
      try {
        const date = new Date(finishedAt);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return date.toLocaleString("de-DE", { 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        }
      } catch {
        // Fall through to return "-"
      }
    }
    
    return "-";
  };

  // Find selected order to get its status
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return allOrders.find(order => order.id === selectedOrderId);
  }, [selectedOrderId, allOrders]);

  // Handle order selection (without tab switching)
  const handleOrderSelect = (order: MassschuheOrderData) => {
    // Just select the order, don't switch tabs
    onOrderSelect?.(order.id);
  };

  // Removed auto-select - orders will only be selected when clicked or when customer is searched

  useEffect(() => {
    setActiveTab(tabClicked);
  }, [tabClicked]);

  // Reset page and accumulated orders whenever active tab changes
  useEffect(() => {
    setPage(1);
    setAllOrders([]);
    setDisplayCount(10);
  }, [activeTab]);

  // Handle "Mehr anzeigen" button click
  const handleLoadMore = () => {
    const newDisplayCount = displayCount + 10;
    setDisplayCount(newDisplayCount);
    
    // If we need more data than we have, fetch next page
    if (newDisplayCount > allOrders.length && pagination?.hasNextPage && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  // Custom refetch that resets accumulated orders
  const customRefetch = useCallback(() => {
    setPage(1);
    setAllOrders([]);
    setDisplayCount(10);
    refetch();
  }, [refetch]);

  // Update a single order without full reload
  const updateSingleOrder = useCallback((orderId: string, updatedData: Partial<MassschuheOrderData>) => {
    setAllOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, ...updatedData }
        : order
    ));
  }, []);

  // Expose refetch function to parent component (only once or when refetch changes)
  const refetchRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (customRefetch && customRefetch !== refetchRef.current) {
      refetchRef.current = customRefetch;
      onRefetchReady?.(customRefetch);
    }
  }, [customRefetch, onRefetchReady]);

  // Expose update single order function to parent component
  const updateOrderRef = useRef<((orderId: string, updatedData: Partial<MassschuheOrderData>) => void) | null>(null);
  useEffect(() => {
    if (updateSingleOrder && updateSingleOrder !== updateOrderRef.current) {
      updateOrderRef.current = updateSingleOrder;
      onUpdateOrderReady?.(updateSingleOrder);
    }
  }, [updateSingleOrder, onUpdateOrderReady]);

  return (
    <div className="w-full mt-6">
      {/* Tabs */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 sm:gap-7 md:gap-8 border-b border-slate-200 mb-5">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`bg-transparent border-none py-2.5 px-1 font-medium text-sm sm:text-base cursor-pointer transition-all duration-300 whitespace-nowrap relative mb-[-1px] ${activeTab === index
                ? "text-emerald-500 font-semibold border-b-2 border-emerald-500"
                : "text-slate-500 border-b-2 border-transparent hover:text-emerald-500"
              }`}
            onClick={() => {
              setActiveTab(index);
              onTabChange?.(index);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
        <table className="w-full border-collapse text-sm min-w-full">
          <thead>
            <tr className="bg-slate-50 uppercase text-xs font-medium text-slate-500 leading-[18px]">
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Bestellnummer</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Kundenname</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Status</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Preis (€)</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Zahlung</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Beschreibung</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Abholort/Versand</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Fertigstellung</th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoad && loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  Laden...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  Keine Daten gefunden
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`border-b border-slate-100 transition-colors cursor-pointer ${
                    selectedOrderId === order.id 
                      ? "bg-emerald-50 hover:bg-emerald-100" 
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => handleOrderSelect(order)}
                >
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {order.orderNumber ? `#${order.orderNumber}` : `#${order.id.slice(0, 8)}`}
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {order.kunde}
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {order.status}
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {calculatePrice(order.fußanalyse, order.einlagenversorgung) === "-" ? "-" : `${calculatePrice(order.fußanalyse, order.einlagenversorgung)} €`}
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {order.kostenvoranschlag ? "Bezahlt" : "Offen"}
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    -
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {order.filiale || "-"}
                  </td>
                  <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">
                    {getFinishedDate(order)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {(pagination?.hasNextPage || displayCount < allOrders.length) && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore || loading}
            className="bg-white border border-emerald-500 text-emerald-500 rounded-lg px-6 py-3 font-medium text-sm sm:text-base cursor-pointer transition-colors hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore || loading ? "Laden..." : "Mehr anzeigen"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductionView;
