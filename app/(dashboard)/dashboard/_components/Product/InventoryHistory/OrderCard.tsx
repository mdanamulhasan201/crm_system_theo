import React from 'react';
import { IoCart } from 'react-icons/io5';
import { HistoryEntry } from './types';

interface OrderCardProps {
  order: NonNullable<HistoryEntry['order']>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <IoCart className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-semibold text-gray-700">Bestellinformationen</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500 mb-1">Bestellnummer:</span>
          <div className="font-mono text-xs font-semibold text-gray-900 break-all">
            {order.id.slice(0, 8)}...
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500 mb-1">Status:</span>
          <div className="font-semibold text-gray-900 break-words">
            {order.orderStatus}
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500 mb-1">Gesamtpreis:</span>
          <div className="font-bold text-gray-900 whitespace-nowrap">
            {order.totalPrice.toLocaleString('de-DE')} €
          </div>
        </div>
        {order.product && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2 pt-2 border-t border-gray-300">
            <div className="text-xs font-semibold text-gray-700 mb-1">Produktdetails:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500">Name:</span>
                <div className="font-semibold text-gray-900 break-words">{order.product.name}</div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500">Hersteller:</span>
                <div className="font-semibold text-gray-900 break-words">{order.product.rohlingHersteller}</div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-500">Artikelnummer:</span>
                <div className="font-semibold text-gray-900 break-words">{order.product.artikelHersteller}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;

