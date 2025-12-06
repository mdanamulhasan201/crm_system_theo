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

    const fetchOrder = async (orderId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response: SingleMassschuheOrderResponse = await getMassschuheOrderById(orderId);
            
            if (response.success) {
                setOrder(response.data);
            } else {
                setError(response.message || 'Failed to fetch massschuhe order');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching massschuhe order');
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

    const refetch = () => {
        if (id) {
            fetchOrder(id);
        }
    };

    return {
        order,
        loading,
        error,
        refetch
    };
};

