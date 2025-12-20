import { useState, useEffect } from 'react';
import { getCustomerOrderHistory } from '@/apis/productsOrder';

export interface StepDuration {
    status: string;
    statusDisplay: string;
    duration: string;
    durationMs?: number;
    startDate?: string;
    endDate?: string;
    assignee: string;
    assigneeId: string;
    assigneeType: string;
}

export interface ChangeLogEntry {
    id: string;
    date: string;
    timestamp?: string;
    user: string;
    action: string;
    description?: string;
    note?: string;
    type: string;
    details: {
        partnerId: string | null;
        employeeId: string | null;
        paymentFrom?: string;
        paymentTo?: string;
    };
}

export interface PaymentStatusHistoryEntry {
    id: string;
    date: string;
    timestamp: string;
    user: string;
    paymentFrom: string;
    paymentTo: string;
    paymentFromDisplay: string;
    paymentToDisplay: string;
    details: {
        partnerId: string | null;
        employeeId: string | null;
    };
}

export interface BarcodeInfo {
    createdAt: string;
    timestamp: string;
    hasBarcode: boolean;
}

export interface OrderHistorySummary {
    currentStatus: string;
    currentPaymentStatus: string;
    totalEvents: number;
    totalPaymentChanges: number;
    hasBarcodeScan: boolean;
}

export interface OrderHistoryData {
    orderNumber: number;
    stepDurations: StepDuration[];
    changeLog: ChangeLogEntry[];
    paymentStatusHistory?: PaymentStatusHistoryEntry[];
    barcodeInfo?: BarcodeInfo;
    summary?: OrderHistorySummary;
    totalEntries?: number;
}

export interface OrderHistoryApiResponse {
    success: boolean;
    data: {
        orderNumber: number;
        stepDurationOverview: StepDuration[];
        changeLog: ChangeLogEntry[];
        paymentStatusHistory?: PaymentStatusHistoryEntry[];
        barcodeInfo?: BarcodeInfo;
        summary?: OrderHistorySummary;
    };
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
                const response: OrderHistoryApiResponse = await getCustomerOrderHistory(orderId);
                if (response.success) {
                    // Map API response to component format
                    const mappedData: OrderHistoryData = {
                        orderNumber: response.data.orderNumber,
                        stepDurations: response.data.stepDurationOverview || [],
                        changeLog: response.data.changeLog || [],
                        paymentStatusHistory: response.data.paymentStatusHistory,
                        barcodeInfo: response.data.barcodeInfo,
                        summary: response.data.summary,
                        totalEntries: response.data.changeLog?.length || 0,
                    };
                    setData(mappedData);
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
