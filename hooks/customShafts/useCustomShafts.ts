import { useState, useEffect } from 'react';
import { getAllCustomShafts } from '@/apis/customShaftsApis';

export interface CustomShaft {
  id: string;
  ide: string;
  name: string;
  image: string;
  price: number;
  catagoary: string;
  gender: string;
  description: string;
  verschlussart?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomShaftsResponse {
  success: boolean;
  message: string;
  data: CustomShaft[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const useCustomShafts = (page: number, limit: number, search: string, gender: 'Herren' | 'Damen', category: string) => {
  const [data, setData] = useState<CustomShaftsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllCustomShafts(page, limit, search, gender, category);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit, search, gender, category]);

  return { data, loading, error };
};
