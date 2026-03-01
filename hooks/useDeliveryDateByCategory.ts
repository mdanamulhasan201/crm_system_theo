import { useState, useEffect, useMemo } from 'react';
import { getDeliveryDates } from '@/apis/deliveryDateCalculation';

export interface DeliveryDateEntry {
  id: string;
  day: number;
  category: string;
}

export interface UseDeliveryDateByCategoryResult {
  /** Formatted date string (DD.MM.YYYY) or null while loading / no match */
  deliveryDate: string | null;
  /** Number of days from today, or 0 if no match */
  days: number;
  /** True while fetching */
  loading: boolean;
}

const DEFAULT_DAYS = 14;

/**
 * Reusable hook: fetch delivery-dates API and compute delivery date for a given category.
 * Use for: Bodenkonstruktion, Massschafterstellung, Komplettfertigung, etc.
 */
export function useDeliveryDateByCategory(category: string | null): UseDeliveryDateByCategoryResult {
  const [days, setDays] = useState<number>(DEFAULT_DAYS);
  const [loading, setLoading] = useState<boolean>(!!category);

  useEffect(() => {
    if (!category?.trim()) {
      setLoading(false);
      setDays(DEFAULT_DAYS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getDeliveryDates()
      .then((response: { success?: boolean; data?: DeliveryDateEntry[] }) => {
        if (cancelled) return;
        const list = response?.data ?? [];
        const match = Array.isArray(list)
          ? list.find((item) => (item?.category || '').trim() === category.trim())
          : null;
        const d = match && typeof match.day === 'number' && match.day >= 0 ? match.day : DEFAULT_DAYS;
        setDays(d);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error fetching delivery dates by category:', err);
          setDays(DEFAULT_DAYS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const deliveryDate = useMemo(() => {
    if (!category?.trim()) return null;
    const today = new Date();
    const delivery = new Date(today);
    delivery.setDate(today.getDate() + days);
    return delivery.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [category, days]);

  return {
    deliveryDate: category ? deliveryDate : null,
    days,
    loading,
  };
}
