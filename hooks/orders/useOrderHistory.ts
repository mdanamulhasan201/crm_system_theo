import { useState, useEffect } from 'react';
import { getCustomerOrderHistory } from '@/apis/productsOrder';

export interface StepDuration {
    status: string;
    statusDisplay: string;
    duration: string;
    assignee: string;
    assigneeId: string;
    assigneeType: string;
}

export interface ChangeLogEntry {
    id: string;
    date: string;
    user: string;
    action: string;
    note: string;
    type: string;
    details: {
        partnerId: string;
        employeeId: string;
    };
}

export interface OrderHistoryData {
    orderNumber: number;
    stepDurations: StepDuration[];
    changeLog: ChangeLogEntry[];
    totalEntries: number;
}

export interface OrderHistoryResponse {
    success: boolean;
    data: OrderHistoryData;
}

export const useOrderHistory = (orderId: string | null) => {
    const [data, setData] = useState<OrderHistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setData(null);
            setError(null);
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: OrderHistoryResponse = await getCustomerOrderHistory(orderId);
                if (response.success) {
                    setData(response.data);
                } else {
                    setError('Failed to fetch order history');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch order history');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [orderId]);

    return { data, loading, error };
};
