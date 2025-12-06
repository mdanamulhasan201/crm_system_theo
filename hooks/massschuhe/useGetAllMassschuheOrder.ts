import { useState, useEffect } from 'react';
import { getAllMassschuheOrder } from '@/apis/MassschuheManagemantApis';

export interface MassschuheOrderData {
    id: string;
    orderNumber: number | null;
    arztliche_diagnose: string;
    usführliche_diagnose: string;
    rezeptnummer: string;
    durchgeführt_von: string;
    note: string;
    albprobe_geplant: boolean | null;
    kostenvoranschlag: boolean;
    delivery_date: string;
    telefon: string;
    filiale: string;
    kunde: string;
    email: string;
    button_text: string;
    fußanalyse: number | null;
    einlagenversorgung: number | null;
    customer_note: string;
    location: string | null;
    status: string;
    userId: string;
    employeeId: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
    employee?: {
        id: string;
        employeeName: string;
        email: string;
        accountName: string;
    };
    statusHistory: Array<{
        status: string;
        startedAt: string;
        finishedAt: string | null;
        started: string;
        finished: string | null;
    }>;
}

export interface PaginationData {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface MassschuheOrdersResponse {
    success: boolean;
    message: string;
    data: MassschuheOrderData[];
    pagination: PaginationData;
}

export const useGetAllMassschuheOrder = (
    page: number = 1,
    limit: number = 10,
    status?: string
) => {
    const [orders, setOrders] = useState<MassschuheOrderData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async (
        pageNum: number,
        limitNum: number,
        statusFilter?: string
    ) => {
        try {
            setLoading(true);
            setError(null);
            const response: MassschuheOrdersResponse = await getAllMassschuheOrder(pageNum, limitNum, statusFilter);
            
            if (response.success) {
                setOrders(response.data);
                setPagination(response.pagination);
            } else {
                setError(response.message || 'Failed to fetch massschuhe orders');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching massschuhe orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page, limit, status);
    }, [page, limit, status]);

    const refetch = () => {
        fetchOrders(page, limit, status);
    };

    return {
        orders,
        pagination,
        loading,
        error,
        refetch
    };
};

