import { useState } from 'react';
import { updateMassschuheOrderStatus } from '@/apis/MassschuheManagemantApis';

export const useUpdateMassschuheOrderStatus = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateStatus = async (orderIds: string[], status: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await updateMassschuheOrderStatus(orderIds, status);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update massschuhe order status';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateStatus,
        loading,
        error
    };
};

