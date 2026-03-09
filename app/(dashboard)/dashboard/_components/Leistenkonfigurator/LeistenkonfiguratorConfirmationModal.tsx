'use client';

import React from 'react';

interface LeistenkonfiguratorConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderPrice: number;
  customerName?: string;
}

export default function LeistenkonfiguratorConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderPrice,
  customerName,
}: LeistenkonfiguratorConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-[999] p-4">
      <div className="relative bg-white rounded-2xl w-[90%] max-w-[650px] shadow-xl max-h-[90vh] flex flex-col">
        <button
          type="button"
          className="absolute top-2.5 right-4 bg-transparent border-none text-xl sm:text-2xl text-slate-500 cursor-pointer hover:text-slate-600 z-10"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 md:p-10 text-center">
          <img src="/clouds.png" alt="Clouds" className="w-full max-w-[330px] h-auto mx-auto mb-0" />
          <br />
          <img src="/snekars.png" alt="Shoe" className="w-[200px] h-auto mx-auto -mt-[100px]" />

          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-[#1b4332] leading-tight mb-4 mt-4">
            Bestellung abschließen
          </h2>

          {customerName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <h4 className="font-medium text-blue-900 mb-1 text-sm">Auftraggeber / Patient:</h4>
              <p className="text-blue-800 font-semibold">{customerName}</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <h4 className="font-medium text-gray-900 mb-1 text-sm">Produkt:</h4>
            <p className="text-gray-800 font-semibold">Halbprobenerstellung</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-green-900 mb-1 text-sm">Gesamtpreis:</h4>
            <p className="text-2xl font-bold text-green-800">
              {orderPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight italic">excl. Lieferung</p>
          </div>

          <p className="text-sm sm:text-base text-slate-500 mb-6 leading-relaxed">
            Möchtest du die Bestellung zur Halbprobenerstellung abschließen? Im nächsten Schritt wird die Rechnung (PDF) erstellt.
          </p>
        </div>

        <div className="flex gap-3 justify-center items-center p-5 border-t border-slate-200 bg-white rounded-b-2xl">
          <button
            type="button"
            className="py-3 px-6 sm:px-8 rounded-full text-sm sm:text-base font-semibold cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="bg-[#28a745] border-none text-white py-3 px-6 sm:px-8 rounded-full text-sm sm:text-base font-semibold cursor-pointer shadow-lg hover:bg-[#218838] uppercase"
            onClick={onConfirm}
          >
            Weiter zur Bestätigung
          </button>
        </div>
      </div>
    </div>
  );
}
