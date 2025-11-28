import React from 'react';
import { IoTime, IoArrowForward, IoArrowDown, IoArrowUp, IoDocumentText, IoRefresh } from 'react-icons/io5';
import { HistoryEntry } from './types';
import { getTypeLabel, getTypeStyling } from './utils';
import StockUpdateDetails from './StockUpdateDetails';
import CustomerCard from './CustomerCard';
import OrderCard from './OrderCard';

interface HistoryEntryCardProps {
  entry: HistoryEntry;
  isLast: boolean;
}

const HistoryEntryCard: React.FC<HistoryEntryCardProps> = ({ entry, isLast }) => {
  const isStockUpdate = entry.status === 'STOCK_UPDATE' || entry.type === 'stockUpdate';
  const isSellOut = entry.status === 'SELL_OUT' || entry.type === 'sale';

  const getIconBackgroundColor = () => {
    if (isStockUpdate) return 'bg-blue-100';
    if (isSellOut) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const getTimelineColor = () => {
    if (isStockUpdate) return 'bg-blue-200';
    if (isSellOut) return 'bg-red-200';
    return 'bg-gray-200';
  };

  const getIcon = () => {
    if (isStockUpdate) {
      return <IoRefresh className="w-6 h-6 text-blue-600" />;
    }
    if (entry.type === 'sale') {
      return <IoArrowDown className="w-6 h-6 text-red-600" />;
    }
    if (entry.type === 'delivery') {
      return <IoArrowUp className="w-6 h-6 text-green-600" />;
    }
    return <IoDocumentText className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-6 top-16 bottom-0 w-0.5 ${getTimelineColor()}`}></div>
      )}
      
      <div className="p-5">
        <div className="flex gap-4">
          {/* Icon and Type Badge */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBackgroundColor()}`}>
              {getIcon()}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyling(entry.type, entry.status)}`}>
                  {getTypeLabel(entry.type, entry.status)}
                </span>
                {isStockUpdate ? (
                  <span className="text-sm font-semibold text-gray-900">
                    Bestand aktualisiert
                  </span>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Größe {entry.size}
                      </span>
                      {entry.quantity !== null && (
                        <span className="text-sm font-bold text-gray-700">
                          {entry.type === 'sale' ? '-' : '+'}{Math.abs(entry.quantity)}
                        </span>
                      )}
                    </div>
                    {entry.previousStock !== null && entry.newStock !== null && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {entry.previousStock}
                        </span>
                        <IoArrowForward className="w-3 h-3" />
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-semibold">
                          {entry.newStock}
                        </span>
                      </div>
                    )}
                  </>
                )}
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

            {/* Stock Update Details */}
            {isStockUpdate && entry.changeDetails && entry.changeDetails.length > 0 && (
              <StockUpdateDetails changeDetails={entry.changeDetails} />
            )}

            {/* Customer Card */}
            {entry.customer && <CustomerCard customer={entry.customer} />}

            {/* Order Card */}
            {entry.order && <OrderCard order={entry.order} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryEntryCard;

