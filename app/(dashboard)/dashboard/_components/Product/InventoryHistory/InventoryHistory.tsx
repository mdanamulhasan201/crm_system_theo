import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getProductHistory } from '@/apis/productsManagementApis';
import toast from 'react-hot-toast';
import { IoDocumentText } from 'react-icons/io5';
import { Product, HistoryEntry, InventoryHistoryProps, InventoryHistoryRef } from './types';
import { mapApiEntryToHistoryEntry } from './utils';
import ProductHeader from './ProductHeader';
import HistoryEntryCard from './HistoryEntryCard';

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

    const sortedEntries = [...historyEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <>
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold">
                Lagerhistorie
              </DialogTitle>
              {selectedProduct && <ProductHeader product={selectedProduct} />}
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
                    {sortedEntries.map((entry, index) => (
                      <HistoryEntryCard
                        key={entry.id}
                        entry={entry}
                        isLast={index === sortedEntries.length - 1}
                      />
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

