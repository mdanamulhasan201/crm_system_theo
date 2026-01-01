import { useState, useEffect } from 'react';
import { getSearchCustom } from '@/apis/customShaftsApis';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
}

interface UseCustomerSearchReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  searchCustomers: (searchTerm: string) => Promise<void>;
  clearCustomers: () => void;
}

export const useCustomerSearch = (): UseCustomerSearchReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getSearchCustom(searchTerm);
      if (response.success) {
        // The response structure is: { success: true, data: { customers: [...], ... } }
        const customersArray = response.data?.customers || [];
        setCustomers(customersArray);
      } else {
        setError('Failed to search customers');
        setCustomers([]);
      }
    } catch (err) {
      setError('Error searching customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const clearCustomers = () => {
    setCustomers([]);
    setError(null);
  };

  return {
    customers,
    loading,
    error,
    searchCustomers,
    clearCustomers,
  };
};
