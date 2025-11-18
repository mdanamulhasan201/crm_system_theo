import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IoCamera } from 'react-icons/io5';

interface SizeData {
  length: number;
  quantity: number;
}

interface Product {
  id: number;
  Produktname: string;
  Produktkürzel: string;
  Hersteller: string;
  Lagerort: string;
  minStockLevel: number;
  sizeQuantities: { [key: string]: number | SizeData };
  inventoryHistory: Array<{
    id: string;
    date: string;
    type: 'delivery' | 'sale' | 'correction' | 'transfer';
    quantity: number;
    size: string;
    previousStock: number;
    newStock: number;
    user: string;
    notes: string;
  }>;
}

// Helper function to get quantity from sizeQuantities (handles both old and new format)
const getQuantity = (sizeData: number | SizeData | undefined): number => {
  if (sizeData === undefined) return 0;
  if (typeof sizeData === 'number') return sizeData;
  return sizeData.quantity || 0;
}

interface ScannedData {
  productName: string;
  manufacturer: string;
  articleNumber: string;
  sizeQuantities: { [key: string]: number };
  deliveryDate: string;
  supplier: string;
}

interface DeliveryNoteProps {
  productsData: Product[];
  onDeliveryNoteAdd: (products: Product[]) => void;
  showButton?: boolean;
}

export default function DeliveryNote({ productsData, onDeliveryNoteAdd, showButton = true }: DeliveryNoteProps) {
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate OCR processing
  const processDeliveryNote = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Mock extracted data
      const mockExtractedData: ScannedData = {
        productName: 'New Balance 580',
        manufacturer: 'New Balance',
        articleNumber: 'NB-580-2024',
        sizeQuantities: {
          '40': 15,
          '41': 12,
          '42': 18,
          '43': 20,
          '44': 16,
        },
        deliveryDate: new Date().toISOString(),
        supplier: 'Sportswear GmbH',
      };
      setScannedData(mockExtractedData);
      setIsProcessing(false);
    }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processDeliveryNote();
    }
  };

  // Find matching product
  const findMatchingProduct = (articleNumber: string) => {
    return productsData.find(product =>
      product.Produktkürzel.toLowerCase().includes(articleNumber.toLowerCase()) ||
      product.Produktname.toLowerCase().includes(articleNumber.toLowerCase())
    );
  };

  // Apply scanned data to existing product
  const applyToExistingProduct = (product: Product, scannedData: ScannedData) => {
    const updatedProducts = productsData.map(p => {
      if (p.id === product.id) {
        const updatedSizeQuantities: { [key: string]: number | SizeData } = { ...p.sizeQuantities };
        Object.entries(scannedData.sizeQuantities).forEach(([size, quantity]) => {
          const currentQuantity = getQuantity(updatedSizeQuantities[size]);
          const newQuantity = currentQuantity + (quantity as number);
          // Keep existing length if it exists, otherwise set to 0
          const existingData = updatedSizeQuantities[size];
          const existingLength = typeof existingData === 'object' && 'length' in existingData ? existingData.length : 0;
          updatedSizeQuantities[size] = { length: existingLength, quantity: newQuantity };
        });
        const historyEntry: Product['inventoryHistory'][0] = {
          id: `hist_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'delivery',
          quantity: Object.values(scannedData.sizeQuantities).reduce((sum: number, qty: number) => sum + qty, 0),
          size: 'multiple',
          previousStock: Object.values(p.sizeQuantities).reduce((sum: number, sizeData) => sum + getQuantity(sizeData), 0),
          newStock: Object.values(updatedSizeQuantities).reduce((sum: number, sizeData) => sum + getQuantity(sizeData), 0),
          user: 'admin',
          notes: `Delivery note scan: ${scannedData.supplier}`,
        };
        return {
          ...p,
          sizeQuantities: updatedSizeQuantities,
          inventoryHistory: [...p.inventoryHistory, historyEntry],
        };
      }
      return p;
    });
    onDeliveryNoteAdd(updatedProducts);
  };

  // Create new product from scanned data
  const createNewProduct = (scannedData: ScannedData) => {
    // Convert scanned data sizeQuantities to new format
    const convertedSizeQuantities: { [key: string]: SizeData } = {};
    Object.entries(scannedData.sizeQuantities).forEach(([size, quantity]) => {
      convertedSizeQuantities[size] = { length: 0, quantity: quantity as number };
    });
    
    const newProduct: Product = {
      id: Math.max(0, ...productsData.map(p => p.id)) + 1,
      Produktname: scannedData.productName,
      Produktkürzel: scannedData.articleNumber,
      Hersteller: scannedData.manufacturer,
      Lagerort: 'Neues Lager',
      minStockLevel: 10,
      sizeQuantities: convertedSizeQuantities,
      inventoryHistory: [
        {
          id: `hist_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'delivery',
          quantity: Object.values(scannedData.sizeQuantities).reduce((sum: number, qty: number) => sum + qty, 0),
          size: 'multiple',
          previousStock: 0,
          newStock: Object.values(scannedData.sizeQuantities).reduce((sum: number, qty: number) => sum + qty, 0),
          user: 'admin',
          notes: `Initial delivery from scan: ${scannedData.supplier}`,
        },
      ],
    };
    onDeliveryNoteAdd([...productsData, newProduct]);
  };

  return (
    <>
      {showButton && (
        <Button
          onClick={() => {
            setShowScanDialog(true);
            setScannedData(null);
          }}
          className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
        >
          <IoCamera className="mr-2" /> Lieferschein scannen
        </Button>
      )}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lieferschein scannen</DialogTitle>
          </DialogHeader>

          {!scannedData && !isProcessing && (
            <div className="space-y-4">
              <div className="text-center">
                <IoCamera className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Laden Sie ein Foto des Lieferscheins hoch oder nehmen Sie eines auf
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Foto auswählen
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Was wird extrahiert:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Produktname</li>
                  <li>• Hersteller</li>
                  <li>• Artikelnummer</li>
                  <li>• Größen-spezifische Mengen</li>
                </ul>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Lieferschein wird verarbeitet...</p>
              <p className="text-sm text-gray-500 mt-2">OCR und KI-Analyse läuft</p>
            </div>
          )}

          {scannedData && !isProcessing && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✅ Erfolgreich extrahiert!</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Produkt:</strong> {scannedData.productName}
                  </div>
                  <div>
                    <strong>Hersteller:</strong> {scannedData.manufacturer}
                  </div>
                  <div>
                    <strong>Artikelnummer:</strong> {scannedData.articleNumber}
                  </div>
                  <div>
                    <strong>Lieferant:</strong> {scannedData.supplier}
                  </div>
                </div>
                <div className="mt-3">
                  <strong>Größen und Mengen:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(scannedData.sizeQuantities).map(([size, quantity]) => (
                      <span key={size} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {size}: {quantity} Stück
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {(() => {
                const matchingProduct = findMatchingProduct(scannedData.articleNumber);
                return (
                  <div className="space-y-3">
                    {matchingProduct ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">🔄 Passendes Produkt gefunden!</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          &quot;{matchingProduct.Produktname}&quot; wird mit den neuen Mengen aktualisiert.
                        </p>
                        <Button
                          onClick={() => {
                            applyToExistingProduct(matchingProduct, scannedData);
                            setShowScanDialog(false);
                            setScannedData(null);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Mengen hinzufügen
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2">🆕 Neues Produkt</h4>
                        <p className="text-sm text-yellow-800 mb-3">
                          Kein passendes Produkt gefunden. Möchten Sie ein neues Produkt erstellen?
                        </p>
                        <Button
                          onClick={() => {
                            createNewProduct(scannedData);
                            setShowScanDialog(false);
                            setScannedData(null);
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          Neues Produkt erstellen
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
