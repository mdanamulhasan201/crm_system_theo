'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

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
  onSendToAdmin2: () => void | Promise<void>;
  onBodenKonfigurieren?: () => void | Promise<void>;
  orderPrice: number;
  passendenSchnursenkel?: boolean | undefined;
  osenEinsetzen?: boolean | undefined;
  zipperExtra?: boolean | undefined;
  selectedCustomer: Customer | null;
  otherCustomerNumber?: string;
  shaftName?: string;
  isCreatingOrder?: boolean;
  isCreatingWithoutBoden?: boolean;
  isLoadingBodenKonfigurieren?: boolean;
  orderId?: string | null;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onSendToAdmin2,
  onBodenKonfigurieren,
  orderPrice,
  passendenSchnursenkel,
  osenEinsetzen,
  zipperExtra,
  selectedCustomer,
  otherCustomerNumber,
  shaftName,
  isCreatingOrder = false,
  isCreatingWithoutBoden = false,
  isLoadingBodenKonfigurieren = false,
  orderId,
}: ConfirmationModalProps) {
  const router = useRouter();
  
  // Use specific loading state for "NEIN, WEITER OHNE BODEN" button
  const isLoadingWithoutBoden = isCreatingWithoutBoden || isCreatingOrder;
  
  // Disable all buttons if any operation is in progress
  const isAnyLoading = isLoadingWithoutBoden || isLoadingBodenKonfigurieren;

  const handleBodenKonfigurieren = async () => {
    if (onBodenKonfigurieren) {
      await onBodenKonfigurieren();
    } else {
      onClose();
    }
  };

  const handleWeiterOhneBoden = async () => {
    // This should call onConfirm (which creates order without Bodenkonstruktion)
    await onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-999 p-4">
      <div className="relative bg-linear-to-b from-white to-slate-50 rounded-2xl w-[90%] max-w-[650px] shadow-xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          className="absolute top-2.5 right-4 bg-transparent border-none text-xl sm:text-2xl text-slate-500 cursor-pointer transition-colors hover:text-slate-600 z-10" 
          onClick={onClose}
          disabled={isLoadingWithoutBoden}
        >
          ✕
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 md:p-10 text-center">
          {/* Shoe Image */}
          <img 
            src="/clouds.png" 
            alt="Clouds" 
            className="w-full max-w-[330px] h-auto mx-auto mb-0" 
          />
          <br />
          <img 
            src="/snekars.png" 
            alt="Shoe" 
            className="w-[200px] h-auto mx-auto -mt-[100px]" 
          />

          {/* Title */}
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-[#1b4332] leading-tight mb-4 mt-4">
            Bestellung abschließen
          </h2>

          {/* Customer Information */}
          <div className="mb-4">
            {selectedCustomer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <h4 className="font-medium text-blue-900 mb-1 text-sm">Kunde:</h4>
                <p className="text-blue-800 font-semibold">{selectedCustomer.name}</p>
                {selectedCustomer.email && (
                  <p className="text-xs text-blue-700 mt-1">{selectedCustomer.email}</p>
                )}
              </div>
            )}
            {otherCustomerNumber && !selectedCustomer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <h4 className="font-medium text-blue-900 mb-1 text-sm">Kunde:</h4>
                <p className="text-blue-800 font-semibold">{otherCustomerNumber}</p>
              </div>
            )}
          </div>

          {/* Product Information */}
          {shaftName && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <h4 className="font-medium text-gray-900 mb-1 text-sm">Produkt:</h4>
              <p className="text-gray-800 font-semibold">{shaftName}</p>
            </div>
          )}

          {/* Price Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <h4 className="font-medium text-green-900 mb-1 text-sm">Gesamtpreis:</h4>
            <p className="text-2xl font-bold text-green-800">
              {orderPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>

          {/* Zusatzoptionen */}
          {(passendenSchnursenkel !== undefined || osenEinsetzen !== undefined || zipperExtra !== undefined) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Zusätzlich ausgewählte Optionen:</h4>
              <ul className="list-disc pl-5 text-gray-800 space-y-1 text-sm text-left">
                {passendenSchnursenkel !== undefined && (
                  <li>
                    Schnürsenkel: {passendenSchnursenkel ? <span className="font-semibold text-green-700">Ja (+4,49€)</span> : 'Nein'}
                  </li>
                )}
                {osenEinsetzen !== undefined && (
                  <li>
                    Ösen einsetzen: {osenEinsetzen ? <span className="font-semibold text-green-700">Ja (+8,99€)</span> : 'Nein'}
                  </li>
                )}
                {zipperExtra !== undefined && (
                  <li>
                    Zusätzlicher Reißverschluss: {zipperExtra ? <span className="font-semibold text-green-700">Ja (+9,99€)</span> : 'Nein'}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-500 mb-6 leading-relaxed">
            Möchtest du die Bestellung dieses Maßschaftes abschließen?
          </p>

          {/* Loading State */}
          {isLoadingWithoutBoden && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <p className="text-yellow-800 font-medium text-sm">Bestellung wird erstellt...</p>
              </div>
            </div>
          )}
          
          {isLoadingBodenKonfigurieren && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-blue-800 font-medium text-sm">PDF wird generiert...</p>
              </div>
            </div>
          )}

          {/* Info Text */}
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Nach dem Abschließen kann die Bestellung nicht mehr bearbeitet werden.
          </p>
        </div>

        {/* Fixed Buttons at Bottom */}
        <div className="flex gap-3 justify-center items-center p-5 border-t border-slate-200 bg-linear-to-b from-white to-slate-50 rounded-b-2xl">
          <button 
            className="bg-red-600 border-none text-white py-3 px-6 sm:px-8 rounded-full text-sm sm:text-base font-semibold cursor-pointer shadow-lg shadow-red-600/40 transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-2"
            onClick={handleWeiterOhneBoden}
            disabled={isAnyLoading}
          >
            {isLoadingWithoutBoden && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoadingWithoutBoden ? 'Wird erstellt...' : 'NEIN, WEITER OHNE BODEN'}
          </button>
          <button 
            className="bg-[#28a745] border-none text-white py-3 px-6 sm:px-8 rounded-full text-sm sm:text-base font-semibold cursor-pointer shadow-lg shadow-[#28a745]/40 transition-all duration-300 hover:bg-[#218838] hover:shadow-xl hover:shadow-[#28a745]/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-2"
            onClick={handleBodenKonfigurieren}
            disabled={isAnyLoading}
          >
            {isLoadingBodenKonfigurieren && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoadingBodenKonfigurieren ? 'PDF wird generiert...' : 'JA, BODEN KONFIGURIEREN'}
          </button>
        </div>
      </div>
    </div>
  );
}
