import { useState, useEffect } from 'react';
import { getSupplyInfo } from '@/apis/productsOrder';

export interface SupplyProduct {
    id: string;
    name: string;
    material: string;
    langenempfehlung: Record<string, number> | null;
    rohlingHersteller: string;
    artikelHersteller: string;
    versorgung: string;
    status: string;
    diagnosis_status: string | null;
}

export interface SupplyInfoData {
    orderNumber: number;
    productId: string;
    product: SupplyProduct;
}

export interface SupplyInfoResponse {
    success: boolean;
    data: SupplyInfoData;
}

export const useSupplyInfo = (orderId: string | null) => {
    const [data, setData] = useState<SupplyInfoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setData(null);
            setError(null);
            return;
        }

        const fetchSupplyInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: SupplyInfoResponse = await getSupplyInfo(orderId);
                if (response.success) {
                    setData(response.data);
                } else {
                    setError('Failed to fetch supply info');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch supply info');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSupplyInfo();
    }, [orderId]);

    return { data, loading, error };
};
