"use client"

import { CloseIcon } from './Icons';
import { useState, useEffect } from 'react';
import { balanceMassschuheOrder } from '@/apis/MassschuheManagemantApis';
import { getDeliveryDates } from '@/apis/deliveryDateCalculation';
import type { ShaftConfiguration } from '@/components/CustomShafts/shaftOrderConfiguration';

interface CompletionPopUpProps {
  onClose: () => void;
  /** Called when user confirms; receives calculated deliveryDate (DD.MM.YYYY) when deliveryCategory is set and API returned a date */
  onConfirm: (deliveryDate?: string | null) => void;
  productName: string;
  customerName?: string;
  value: string;
  isLoading?: boolean;
  shaftConfiguration?: ShaftConfiguration;
  /** e.g. "Bodenkonstruktion", "Halbprobenerstellung", "Massschafterstellung", "Komplettfertigung" – used to show category-wise delivery date */
  deliveryCategory?: string;
  /** When true, hide price row and balance paragraph (e.g. customer-order page) */
  hidePrice?: boolean;
}

const CompletionPopUp = ({ onClose, onConfirm, productName, customerName, value, isLoading, shaftConfiguration, deliveryCategory, hidePrice = false }: CompletionPopUpProps) => {
  const value2 = value || null;
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [deliveryDateText, setDeliveryDateText] = useState<string | null>(null);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);

  // Store the value in localStorage under a unique key for each productName
  if (productName && value2 !== null) {
    localStorage.setItem(`completionValue_${productName}`, value2);
  }

  // Fetch available balance from API
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoadingBalance(true);
        const response = await balanceMassschuheOrder() as { success: boolean; data: { totalPrice: number } };
        if (response?.success && response?.data?.totalPrice) {
          setAvailableBalance(response.data.totalPrice);
        } else {
          setAvailableBalance(0);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setAvailableBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  // Fetch category-wise delivery date (today + days from API)
  useEffect(() => {
    if (!deliveryCategory?.trim()) return;
    const fetchDeliveryDate = async () => {
      try {
        setIsLoadingDelivery(true);
        const response = await getDeliveryDates() as { success?: boolean; data?: Array<{ id: string; day: number; category: string }> };
        const list = response?.data;
        if (Array.isArray(list)) {
          const match = list.find((d) => (d.category || '').trim() === deliveryCategory.trim());
          if (match != null && typeof match.day === 'number' && match.day >= 0) {
            const today = new Date();
            const delivery = new Date(today);
            delivery.setDate(today.getDate() + match.day);
            setDeliveryDateText(
              delivery.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
            );
          } else {
            setDeliveryDateText(null);
          }
        } else {
          setDeliveryDateText(null);
        }
      } catch (err) {
        console.error('Error fetching delivery dates:', err);
        setDeliveryDateText(null);
      } finally {
        setIsLoadingDelivery(false);
      }
    };
    fetchDeliveryDate();
  }, [deliveryCategory]);

  const formatBalance = (balance: string | number | null) => {
    if (balance === null || balance === undefined) return "0,00 €";
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(num)) return "0,00 €";
    return num.toFixed(2).replace('.', ',') + ' €';
  };

  const calculateRemainingBalance = (available: number | null, cost: string | null) => {
    if (available === null || available === undefined) return "0,00 €";
    if (!cost) return formatBalance(available);
    const costNum = parseFloat(cost);
    if (isNaN(costNum)) return formatBalance(available);
    const remaining = available + costNum;
    return formatBalance(remaining);
  };

  const displayAvailableBalance = isLoadingBalance 
    ? "Lädt..." 
    : formatBalance(availableBalance);
  
  const displayRemainingBalance = isLoadingBalance 
    ? "Lädt..." 
    : calculateRemainingBalance(availableBalance, value2);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-xl w-[90%] max-w-[550px] shadow-2xl animate-[slideIn_0.3s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900 m-0 mb-2">Bestellung prüfen & bestätigen</h1>
            <p className="text-sm text-slate-500 m-0">
              Sie bestellen verbindlich die folgende Konfiguration:
            </p>
          </div>
          <div 
            className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-slate-100"
            onClick={onClose}
          >
            <CloseIcon />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Produkt:</span>
              <span className="text-sm text-slate-900 font-semibold">{productName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Kunde:</span>
              <span className="text-sm text-slate-900 font-semibold">{customerName || 'N/A'}</span>
            </div>
            {!hidePrice && (
              <>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Preis:</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-900 font-semibold">{formatBalance(value2)}</span>
                    <span className="text-xs text-slate-400 mt-0.5">excl. Zustellungsversand</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-slate-600 leading-relaxed m-0">
                    Wird von Ihrer FeetFirst Balance abgerechnet.<br />
                    Verfügbares Guthaben: <strong className="text-slate-900">{displayAvailableBalance}</strong> – Restguthaben nach Kauf: <strong className="text-slate-900">{displayRemainingBalance}</strong>
                  </p>
                </div>
              </>
            )}
            
            {(deliveryCategory && (deliveryDateText || isLoadingDelivery)) && (
              <div className="text-xs text-slate-500 mt-2">
                {isLoadingDelivery ? (
                  <span>Lieferzeit wird geladen…</span>
                ) : deliveryDateText ? (
                  <span>Die voraussichtliche Lieferzeit beträgt ca. <strong className="text-slate-700">{deliveryDateText}</strong></span>
                ) : null}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-sm text-amber-700 font-medium m-0">
                Individuelle Anfertigung – vom Widerruf ausgeschlossen.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]" 
            onClick={onClose}
          >
            Abbrechen
          </button>
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-[#36A866] text-white hover:bg-[#2d8a55] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
            onClick={() => onConfirm(deliveryDateText)}
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Verbindlich bestellen
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPopUp;