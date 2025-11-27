'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderPrice: number;
  passendenSchnursenkel?: boolean | undefined;
  osenEinsetzen?: boolean | undefined;
  selectedCustomer: Customer | null;
  otherCustomerNumber?: string;
  shaftName?: string;
  isCreatingOrder?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderPrice,
  passendenSchnursenkel,
  osenEinsetzen,
  selectedCustomer,
  otherCustomerNumber,
  shaftName,
  isCreatingOrder = false,
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold">
          Bestellung abschließen
        </DialogTitle>
        <div className="space-y-4">
          {/* Customer Information */}
          {selectedCustomer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-1">Kunde:</h4>
              <p className="text-blue-800">{selectedCustomer.name}</p>
              <p className="text-sm text-blue-700">{selectedCustomer.email}</p>
            </div>
          )}
          {otherCustomerNumber && !selectedCustomer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-1">Kunde:</h4>
              <p className="text-blue-800">{otherCustomerNumber}</p>
            </div>
          )}

          {/* Product Information */}
          {shaftName && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-1">Produkt:</h4>
              <p className="text-gray-800">{shaftName}</p>
            </div>
          )}




          {/* Price Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-900 mb-1">Gesamtpreis:</h4>
            <p className="text-2xl font-bold text-green-800">
              {orderPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>



          {/* Zusatzoptionen */}
          {(passendenSchnursenkel !== undefined || osenEinsetzen !== undefined) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">Zusätzlich ausgewählte</h4>
              <ul className="list-disc pl-5 text-gray-800 space-y-1">
                {passendenSchnursenkel !== undefined && (
                  <li>
                    Schnürsenkel: {passendenSchnursenkel ? 'Ja (+4,49€)' : 'Nein'}
                  </li>
                )}
                {osenEinsetzen !== undefined && (
                  <li>
                    Ösen einsetzen: {osenEinsetzen ? 'Ja (+8,99€)' : 'Nein'}
                  </li>
                )}
              </ul>
            </div>
          )}

          <p className="text-base">
            Möchtest du die Bestellung dieses Maßschaftes abschließen?
          </p>
          <p className="text-xs text-gray-500">
            Nach dem Abschließen kann die Bestellung nicht mehr bearbeitet werden.
          </p>

          {/* Loading State */}
          {isCreatingOrder && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <p className="text-yellow-800 font-medium">Bestellung wird erstellt...</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreatingOrder}
            className="flex-1 cursor-pointer"
          >
            Abbrechen
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isCreatingOrder}
            className={`flex-1 cursor-pointer ${isCreatingOrder ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isCreatingOrder ? 'Wird erstellt...' : 'Ja, abschließen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
