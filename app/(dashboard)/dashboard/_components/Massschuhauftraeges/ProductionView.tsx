import { useEffect, useState, useMemo } from "react";
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
  4: "Schaftherstellung",
  5: "Bodenherstellung",
  6: "Geliefert",
};

// Reverse map: status to tab index
const statusToTabMap: Record<string, number> = {
  "Versorgungs Start": 0,
  "Leistenerstellung": 1,
  "Bettungsherstellung": 2,
  "Halbprobenerstellung": 3,
  "Schaftherstellung": 4,
  "Bodenherstellung": 5,
  "Geliefert": 6,
};

const ProductionView = ({ tabClicked, onOrderSelect, selectedOrderId, onTabChange }: { 
  tabClicked: number; 
  onOrderSelect?: (orderId: string) => void;
  selectedOrderId?: string | null;
  onTabChange?: (tab: number) => void;
}) => {
  const [activeTab, setActiveTab] = useState(tabClicked);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Get status filter based on active tab
  const statusFilter = statusMap[activeTab];

  // Fetch orders using custom hook with status filter
  const { orders, loading, error, pagination, refetch } = useGetAllMassschuheOrder(
    page, 
    limit, 
    statusFilter === "Versorgungs Start" ? undefined : statusFilter
  );

  // Use orders directly since filtering is done server-side
  const filteredOrders = orders;

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

  // Get finished date from statusHistory
  const getFinishedDate = (order: any) => {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return "-";
    }
    
    // Find the statusHistory entry that matches the current status
    const currentStatusHistory = order.statusHistory.find(
      (history: any) => history.status === order.status
    );
    
    // Return the finished date if it exists, otherwise "-"
    return currentStatusHistory?.finished || "-";
  };

  // Find selected order to get its status
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find(order => order.id === selectedOrderId);
  }, [selectedOrderId, orders]);

  // Handle order selection (without tab switching)
  const handleOrderSelect = (order: MassschuheOrderData) => {
    // Just select the order, don't switch tabs
    onOrderSelect?.(order.id);
  };

  // Auto-select first order when Versorgungs Start tab is active and no order is selected
  useEffect(() => {
    if (activeTab === 0 && !selectedOrderId && filteredOrders.length > 0 && !loading) {
      const firstOrder = filteredOrders[0];
      if (firstOrder && firstOrder.id) {
        onOrderSelect?.(firstOrder.id);
      }
    }
  }, [activeTab, filteredOrders, selectedOrderId, loading, onOrderSelect]);

  useEffect(() => {
    setActiveTab(tabClicked);
  }, [tabClicked]);

  // Reset page whenever active tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

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
            {loading ? (
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
      {pagination && pagination.hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="bg-white border border-emerald-500 text-emerald-500 rounded-lg px-6 py-3 font-medium text-sm sm:text-base cursor-pointer transition-colors hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Laden..." : "Mehr anzeigen"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductionView;
