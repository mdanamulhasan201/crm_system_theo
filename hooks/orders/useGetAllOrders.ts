import { useState, useEffect } from 'react';
import { getAllOrders } from '@/apis/productsOrder';

export interface ApiOrderData {
    id: string;
    orderNumber: number;
    fußanalyse: number;
    einlagenversorgung: number;
    totalPrice?: number;
    bezahlt?: string | boolean | null;
    orderStatus: string;
    statusUpdate: string;
    invoice: string | null;
    createdAt: string;
    updatedAt: string;
    priority?: string | null;
    KrankenkasseStatus?: string | null;
    fertigstellungBis?: string | null;
    auftragsDatum?: string | null;
    geschaeftsstandort?: string | null;
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
        bezahlt: string | boolean | null;
    } | null;
    employee?: {
        accountName: string;
        employeeName: string;
        email: string;
    } | null;
}

export interface PaginationData {
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor?: string | null;
    previousCursor?: string | null;
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: ApiOrderData[];
    pagination: PaginationData;
}

export const useGetAllOrders = (
    limit: number = 10,
    days: number = 30,
    orderStatus?: string,
    bezahlt?: string,
    search?: string,
    cursor?: string,
    customerNumber?: string,
    orderNumber?: string,
    customerName?: string,
    type?: string
) => {
    const [orders, setOrders] = useState<ApiOrderData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async (
        limitNum: number,
        daysNum: number,
        status?: string,
        bezahltVal?: string,
        searchVal?: string,
        cursorVal?: string,
        custNumber?: string,
        ordNumber?: string,
        custName?: string,
        orderType?: string
    ) => {
        try {
            setLoading(true);
            setError(null);
            const response: OrdersResponse = await getAllOrders(
                limitNum,
                daysNum,
                status,
                bezahltVal,
                searchVal,
                cursorVal,
                custNumber,
                ordNumber,
                custName,
                orderType
            );

            if (response.success) {
                setOrders(response.data);
                setPagination(response.pagination);
            } else {
                setError(response.message || 'Failed to fetch orders');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(limit, days, orderStatus, bezahlt, search, cursor, customerNumber, orderNumber, customerName, type);
    }, [limit, days, orderStatus, bezahlt, search, cursor, customerNumber, orderNumber, customerName, type]);

    const refetch = () => {
        fetchOrders(limit, days, orderStatus, bezahlt, search, cursor, customerNumber, orderNumber, customerName, type);
    };

    return {
        orders,
        pagination,
        loading,
        error,
        refetch
    };
};
