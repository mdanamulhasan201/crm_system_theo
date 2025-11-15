import { useState, useEffect } from 'react';
import { getAllOrders } from '@/apis/productsOrder';

export interface ApiOrderData {
    id: string;
    fußanalyse: number;
    einlagenversorgung: number;
    totalPrice?: number;
    orderStatus: string;
    statusUpdate: string;
    invoice: string | null;
    createdAt: string;
    updatedAt: string;
    customer: {
        id: string;
        vorname: string;
        nachname: string;
        email: string;
        telefonnummer: string;
        wohnort: string;
        customerNumber: number;
    };
    product: {
        id: string;
        name: string;
        rohlingHersteller: string;
        artikelHersteller: string;
        versorgung: string;
        material: string;
        langenempfehlung: Record<string, number>;
        status: string;
        diagnosis_status: string | null;
        createdAt: string;
        updatedAt: string;
    };
    werkstattzettel?: {
        id: string;
        auftragsDatum: string | null;
        fertigstellungBis: string | null;
        versorgung: string | null;
        bezahlt: boolean | null;
    } | null;
}

export interface PaginationData {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: ApiOrderData[];
    pagination: PaginationData;
}

export const useGetAllOrders = (page: number = 1, limit: number = 10, days: number = 30, orderStatus?: string) => {
    const [orders, setOrders] = useState<ApiOrderData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async (pageNum: number, limitNum: number, daysNum: number, status?: string) => {
        try {
            setLoading(true);
            setError(null);
            // console.log('useGetAllOrders: Fetching orders with params:', { pageNum, limitNum, daysNum, status });
            const response: OrdersResponse = await getAllOrders(pageNum, limitNum, daysNum, status);
            // console.log('useGetAllOrders: API response:', response);
            
            if (response.success) {
                setOrders(response.data);
                setPagination(response.pagination);
            } else {
                setError(response.message || 'Failed to fetch orders');
            }
        } catch (err) {
            // console.error('useGetAllOrders: Error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while fetching orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page, limit, days, orderStatus);
    }, [page, limit, days, orderStatus]);

    const refetch = () => {
        fetchOrders(page, limit, days, orderStatus);
    };

    return {
        orders,
        pagination,
        loading,
        error,
        refetch
    };
};
