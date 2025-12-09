import { useState, useEffect } from 'react';
import { getMassschuheOrderById } from '@/apis/MassschuheManagemantApis';
import { MassschuheOrderData } from './useGetAllMassschuheOrder';

export interface SingleMassschuheOrderResponse {
    success: boolean;
    message: string;
    data: MassschuheOrderData;
}

export const useGetSingleMassschuheOrder = (id: string | null) => {
    const [order, setOrder] = useState<MassschuheOrderData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = async (orderId: string): Promise<MassschuheOrderData | null> => {
        try {
            setLoading(true);
            setError(null);
            const response: SingleMassschuheOrderResponse = await getMassschuheOrderById(orderId);
            
            if (response.success) {
                setOrder(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch massschuhe order');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching massschuhe order');
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchOrder(id);
        } else {
            setOrder(null);
        }
    }, [id]);

    const refetch = async (): Promise<MassschuheOrderData | null> => {
        if (id) {
            return await fetchOrder(id);
        }
        return null;
    };

    return {
        order,
        loading,
        error,
        refetch
    };
};

