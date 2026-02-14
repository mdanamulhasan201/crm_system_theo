'use client';

import { useState, useEffect } from 'react';
import { getPicture2324 } from '@/apis/productsOrder';

export interface InsoleStock {
    produktname: string;
    hersteller: string;
    size: string;
}

export interface Picture2324Data {
    customerName: string;
    versorgungName: string;
    diagnosisStatus: string[] | null;
    material: string | null;
    picture_23: string | null;
    picture_24: string | null;
    fertigstellungBis?: string;
    insoleStock?: InsoleStock;
    versorgung?: string;
    versorgung_note?: string;
    uberzug?: string;
    createdAt?: string;
    ausführliche_diagnose?: string;
}

export interface Picture2324Response {
    success: boolean;
    data: Picture2324Data;
}

export const usePicture2324 = (orderId: string | null) => {
    const [data, setData] = useState<Picture2324Data | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setData(null);
            setError(null);
            return;
        }

        const fetchPictures = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: Picture2324Response = await getPicture2324(orderId);
                if (response.success) {
                    setData(response.data);
                } else {
                    setError('Failed to fetch picture 23-24');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch picture 23-24');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPictures();
    }, [orderId]);

    return { data, loading, error };
};

