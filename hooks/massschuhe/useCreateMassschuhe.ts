import { useState } from 'react';
import { createMassschuheAdded } from '@/apis/MassschuheAddedApis';
import toast from 'react-hot-toast';
import { safeToastMessage } from '@/lib/toastUtils';

interface MassschuheData {
    customerId: string;
    employeeId: string;
    arztliche_diagnose: string;
    usführliche_diagnose: string;
    rezeptnummer: string;
    durchgeführt_von: string;
    note: string;
    halbprobe_geplant: boolean;
    kostenvoranschlag: boolean;
}

export const useCreateMassschuhe = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMassschuhe = async (data: MassschuheData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await createMassschuheAdded(data);

            if (response.success) {
                toast.success(response.message || 'Massschuhe erfolgreich erstellt!');
                return { success: true, data: response.data };
            } else {
                const errorMsg = response.message || 'Fehler beim Erstellen der Massschuhe';
                setError(errorMsg);
                toast.error(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Ein Fehler ist aufgetreten';
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

