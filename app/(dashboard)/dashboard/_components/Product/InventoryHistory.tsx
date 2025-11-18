import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getProductHistory } from '@/apis/productsManagementApis';
import toast from 'react-hot-toast';
import { IoPerson, IoCart, IoDocumentText, IoTime, IoArrowForward, IoArrowDown, IoArrowUp } from 'react-icons/io5';

interface SizeData {
  length: number;
  quantity: number;
}

interface Product {
  id: string;
  Produktname: string;
  Produktkürzel: string;
  Hersteller: string;
  Lagerort: string;
  minStockLevel: number;
  sizeQuantities: { [key: string]: number | SizeData };
}

interface HistoryEntry {
  id: string;
  date: string;
  type: 'delivery' | 'sale' | 'correction' | 'transfer';
  quantity: number;
  size: string;
  previousStock: number;
  newStock: number;
  user: string;
  notes: string;
  customer?: {
    id: string;
    customerNumber: number;
    vorname: string;
    nachname: string;
    email: string;
    telefonnummer?: string;
    wohnort?: string;
  } | null;
  order?: {
    id: string;
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
    product?: {
      id: string;
      name: string;
      rohlingHersteller: string;
      artikelHersteller: string;
    };
  } | null;
}

interface ApiHistoryEntry {
  id: string;
  storeId: string;
  changeType: string;
  quantity: number;
  newStock: number;
  reason: string;
  text: string | null;
  createdAt: string;
  customerId: string | null;
  orderId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    busnessName?: string;
  };
  customer: {
    id: string;
    customerNumber: number;
    vorname: string;
    nachname: string;
    email: string;
    telefonnummer?: string;
    wohnort?: string;
  } | null;
  order: {
    id: string;
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
    product?: {
      id: string;
      name: string;
      rohlingHersteller: string;
      artikelHersteller: string;
    };
  } | null;
}

interface InventoryHistoryProps {
  productsData: Product[];
}

export interface InventoryHistoryRef {
  showHistory: (product: Product) => void;
}

const InventoryHistory = forwardRef<InventoryHistoryRef, InventoryHistoryProps>(
  (_, ref) => {
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [pagination, setPagination] = useState<any>(null);

    // Helper function to map API entry to HistoryEntry
    const mapApiEntryToHistoryEntry = (entry: ApiHistoryEntry): HistoryEntry => {
      // Extract size from reason (e.g., "Order size 43" -> "43")
      const sizeMatch = entry.reason?.match(/size\s+(\d+)/i) || entry.reason?.match(/(\d+)/);
      const size = sizeMatch ? sizeMatch[1] : 'N/A';

      // Map changeType to our type
      let type: 'delivery' | 'sale' | 'correction' | 'transfer' = 'correction';
      if (entry.changeType === 'sales') {
        type = 'sale';
      } else if (entry.changeType === 'delivery') {
        type = 'delivery';
      } else if (entry.changeType === 'transfer') {
        type = 'transfer';
      } else if (entry.changeType === 'correction') {
        type = 'correction';
      }

      // Calculate previous stock
      let previousStock = entry.newStock;
      const absQuantity = Math.abs(entry.quantity);
      if (type === 'sale') {
        previousStock = entry.newStock + absQuantity;
      } else {
        previousStock = entry.newStock - absQuantity;
      }

      return {
        id: entry.id,
        date: entry.createdAt,
        type,
        quantity: entry.quantity,
        size,
        previousStock: Math.max(0, previousStock),
        newStock: entry.newStock,
        user: entry.user?.name || entry.user?.email || 'Unknown',
        notes: entry.text || entry.reason || '',
        customer: entry.customer,
        order: entry.order
      };
    };

    // Function to show inventory history for a product
    const showHistory = async (product: Product) => {
      setSelectedProduct(product);
      setShowHistoryDialog(true);
      setIsLoadingHistory(true);
      setCurrentPage(1);
      setHistoryEntries([]);

      try {
        const response = await getProductHistory(product.id, 1, 10);
        if (response.success && response.data) {
          const mappedHistory: HistoryEntry[] = response.data.map(mapApiEntryToHistoryEntry);
          setHistoryEntries(mappedHistory);
          setPagination(response.pagination);
          setHasNextPage(response.pagination?.hasNextPage || false);
        } else {
          setHistoryEntries([]);
          setHasNextPage(false);
          toast.error('Keine Historie gefunden');
        }
      } catch (error: any) {
        console.error('Failed to fetch history:', error);
        setHistoryEntries([]);
        setHasNextPage(false);
        toast.error(error?.response?.data?.message || 'Fehler beim Laden der Historie');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    // Function to load more history entries
    const loadMoreHistory = async () => {
      if (!selectedProduct || isLoadingMore || !hasNextPage) return;

      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      try {
        const response = await getProductHistory(selectedProduct.id, nextPage, 10);
        if (response.success && response.data) {
          const mappedHistory: HistoryEntry[] = response.data.map(mapApiEntryToHistoryEntry);
          setHistoryEntries(prev => [...prev, ...mappedHistory]);
          setCurrentPage(nextPage);
          setPagination(response.pagination);
          setHasNextPage(response.pagination?.hasNextPage || false);
        } else {
          setHasNextPage(false);
        }
      } catch (error: any) {
        console.error('Failed to load more history:', error);
        toast.error(error?.response?.data?.message || 'Fehler beim Laden weiterer Einträge');
      } finally {
        setIsLoadingMore(false);
      }
    };

    // Expose the showHistory function to parent component
    useImperativeHandle(ref, () => ({
      showHistory
    }));

    // Reset history when dialog closes
    useEffect(() => {
      if (!showHistoryDialog) {
        setHistoryEntries([]);
        setSelectedProduct(null);
        setCurrentPage(1);
        setHasNextPage(false);
        setPagination(null);
      }
    }, [showHistoryDialog]);

    // Function to get the type label in German
    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'delivery':
          return 'Lieferung';
        case 'sale':
          return 'Verkauf';
        case 'correction':
          return 'Korrektur';
        case 'transfer':
          return 'Transfer';
        default:
          return type;
      }
    };

    // Function to get the type styling
    const getTypeStyling = (type: string) => {
      switch (type) {
        case 'delivery':
          return 'bg-gray-100 text-gray-700 border border-gray-300';
        case 'sale':
          return 'bg-gray-100 text-gray-700 border border-gray-300';
        case 'correction':
          return 'bg-gray-100 text-gray-700 border border-gray-300';
        case 'transfer':
          return 'bg-gray-100 text-gray-700 border border-gray-300';
        default:
          return 'bg-gray-100 text-gray-700 border border-gray-300';
      }
    };

    return (
      <>
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold">
                Lagerhistorie
              </DialogTitle>
              {selectedProduct && (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Produkt</span>
                    <span className="font-semibold text-gray-900">{selectedProduct.Produktname}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Artikelnummer</span>
                    <span className="font-semibold text-gray-900">{selectedProduct.Produktkürzel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Hersteller</span>
                    <span className="font-semibold text-gray-900">{selectedProduct.Hersteller}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Lagerort</span>
                    <span className="font-semibold text-gray-900">{selectedProduct.Lagerort}</span>
                  </div>
                </div>
              )}
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto mt-4">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-500">Lade Historie...</p>
                </div>
              ) : historyEntries.length > 0 ? (
                <>
                  <div className="space-y-4 pr-2">
                    {historyEntries
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry, index) => (
                      <div 
                        key={entry.id} 
                        className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        {/* Timeline line */}
                        {index !== historyEntries.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex gap-4">
                            {/* Icon and Type Badge */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                                {entry.type === 'sale' ? (
                                  <IoArrowDown className="w-6 h-6 text-gray-600" />
                                ) : entry.type === 'delivery' ? (
                                  <IoArrowUp className="w-6 h-6 text-gray-600" />
                                ) : (
                                  <IoDocumentText className="w-6 h-6 text-gray-600" />
                                )}
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              {/* Header Row */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyling(entry.type)}`}>
                                    {getTypeLabel(entry.type)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                      Größe {entry.size}
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">
                                      {entry.type === 'sale' ? '-' : '+'}{Math.abs(entry.quantity)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                                      {entry.previousStock}
                                    </span>
                                    <IoArrowForward className="w-3 h-3" />
                                    <span className="px-2 py-0.5 bg-gray-100 rounded font-semibold">
                                      {entry.newStock}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Date and User */}
                                <div className="text-right flex-shrink-0 ml-4">
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                    <IoTime className="w-3 h-3" />
                                    <span>{new Date(entry.date).toLocaleDateString('de-DE')}</span>
                                    <span>{new Date(entry.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    von {entry.user}
                                  </div>
                                </div>
                              </div>

                              {/* Customer Card */}
                              {entry.customer && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <IoPerson className="w-4 h-4 text-gray-600" />
                                    <span className="text-xs font-semibold text-gray-700">Kundeninformationen</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-xs text-gray-500">Kundennummer:</span>
                                      <div className="font-semibold text-gray-900">#{entry.customer.customerNumber}</div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500">Name:</span>
                                      <div className="font-semibold text-gray-900">{entry.customer.vorname} {entry.customer.nachname}</div>
                                    </div>
                                    {entry.customer.email && (
                                      <div className="md:col-span-2">
                                        <span className="text-xs text-gray-500">Email:</span>
                                        <div className="font-medium text-gray-900 break-all">{entry.customer.email}</div>
                                      </div>
                                    )}
                                    {entry.customer.telefonnummer && (
                                      <div>
                                        <span className="text-xs text-gray-500">Telefon:</span>
                                        <div className="font-medium text-gray-900">{entry.customer.telefonnummer}</div>
                                      </div>
                                    )}
                                    {entry.customer.wohnort && (
                                      <div>
                                        <span className="text-xs text-gray-500">Wohnort:</span>
                                        <div className="font-medium text-gray-900">{entry.customer.wohnort}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order Card */}
                              {entry.order && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <IoCart className="w-4 h-4 text-gray-600" />
                                    <span className="text-xs font-semibold text-gray-700">Bestellinformationen</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <span className="text-xs text-gray-500">Bestellnummer:</span>
                                      <div className="font-mono text-xs font-semibold text-gray-900 mt-0.5 break-all">
                                        {entry.order.id.slice(0, 8)}...
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500">Status:</span>
                                      <div className="font-semibold text-gray-900 mt-0.5">{entry.order.orderStatus}</div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500">Gesamtpreis:</span>
                                      <div className="font-bold text-gray-900 mt-0.5">
                                        {entry.order.totalPrice.toLocaleString('de-DE')} €
                                      </div>
                                    </div>
                                    {entry.order.product && (
                                      <div className="col-span-2 md:col-span-4 mt-2 pt-2 border-t border-gray-300">
                                        <div className="text-xs font-semibold text-gray-700 mb-1">Produktdetails:</div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                          <div>
                                            <span className="text-xs text-gray-500">Name:</span>
                                            <div className="font-semibold text-gray-900 break-words">{entry.order.product.name}</div>
                                          </div>
                                          <div>
                                            <span className="text-xs text-gray-500">Hersteller:</span>
                                            <div className="font-semibold text-gray-900">{entry.order.product.rohlingHersteller}</div>
                                          </div>
                                          <div>
                                            <span className="text-xs text-gray-500">Artikelnummer:</span>
                                            <div className="font-semibold text-gray-900">{entry.order.product.artikelHersteller}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Show More Button */}
                  {hasNextPage && (
                    <div className="flex justify-center mt-6 pb-4">
                      <Button
                        onClick={loadMoreHistory}
                        disabled={isLoadingMore}
                        variant="outline"
                        className="min-w-[150px]"
                      >
                        {isLoadingMore ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            Lade...
                          </span>
                        ) : (
                          'Mehr anzeigen'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <IoDocumentText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Keine Bewegungen vorhanden</h3>
                  <p className="text-sm text-gray-500">Es wurden noch keine Transaktionen für dieses Produkt erfasst.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  });

InventoryHistory.displayName = 'InventoryHistory';

export default InventoryHistory;
