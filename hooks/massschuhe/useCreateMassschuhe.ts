import { useState } from 'react';
import { createMassschuheOrderV2 } from '@/apis/MassschuheAddedApis';
import toast from 'react-hot-toast';
import type { MassschuheOrderV2Payload } from '@/app/(dashboard)/dashboard/_components/Scanning/MassschuheOrderModal';

// Normalize backend error messages for better UX
const normalizeErrorMessage = (message: string): string => {
    if (!message) return message;
    if (message.includes('usführliche_diagnose is required!')) {
        return message.replace('usführliche_diagnose', 'ausführliche_diagnose');
    }
    return message;
};

export const useCreateMassschuhe = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMassschuhe = async (data: MassschuheOrderV2Payload, options?: { externOrIntern?: boolean }) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await createMassschuheOrderV2(data, options);

            if (response.success) {
                toast.success(response.message || 'Massschuhe erfolgreich erstellt!');
                return { success: true, data: response.data };
            } else {
                const rawMsg = response.message || 'Fehler beim Erstellen der Massschuhe';
                const errorMsg = normalizeErrorMessage(rawMsg);
                setError(errorMsg);
                toast.error(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (err: any) {
            const rawErrorMessage = err.response?.data?.message || err.message || 'Ein Fehler ist aufgetreten';
            const errorMessage = normalizeErrorMessage(rawErrorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createMassschuhe,
        isLoading,
        error,
    };
};

