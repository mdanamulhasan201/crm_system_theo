import React from 'react';
import { IoPerson } from 'react-icons/io5';
import { HistoryEntry } from './types';

interface CustomerCardProps {
  customer: NonNullable<HistoryEntry['customer']>;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  return (
    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <IoPerson className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-semibold text-gray-700">Kundeninformationen</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-xs text-gray-500">Kundennummer:</span>
          <div className="font-semibold text-gray-900">#{customer.customerNumber}</div>
        </div>
        <div>
          <span className="text-xs text-gray-500">Name:</span>
          <div className="font-semibold text-gray-900">{customer.vorname} {customer.nachname}</div>
        </div>
        {customer.email && (
          <div className="md:col-span-2">
            <span className="text-xs text-gray-500">Email:</span>
            <div className="font-medium text-gray-900 break-all">{customer.email}</div>
          </div>
        )}
        {customer.telefonnummer && (
          <div>
            <span className="text-xs text-gray-500">Telefon:</span>
            <div className="font-medium text-gray-900">{customer.telefonnummer}</div>
          </div>
        )}
        {customer.wohnort && (
          <div>
            <span className="text-xs text-gray-500">Wohnort:</span>
            <div className="font-medium text-gray-900">{customer.wohnort}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCard;

