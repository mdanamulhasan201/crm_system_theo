import { useState, useEffect } from 'react';
import {
    getQuantityOfFinishedInsoleData,
    getQuantityOfInproductionInsoleData,
    getRevenueOfFinishedShoesData,
    getQuantityOfInproductionShoesData
} from '@/apis/monatsstatistikApis';

interface MetricData {
    count: number;
    percentageChange: number;
    trend: 'up' | 'down';
}

interface FinishedShoesData {
    revenue: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
}

interface MetricApiResponse {
    success: boolean;
    data: MetricData;
}

interface FinishedShoesApiResponse {
    success: boolean;
    data: FinishedShoesData;
}

export function useWochenstatistikData() {
    // State for finished insoles data
    const [finishedData, setFinishedData] = useState<MetricData | null>(null);
    const [finishedLoading, setFinishedLoading] = useState(false);

    // State for in production insoles data
    const [inProductionData, setInProductionData] = useState<MetricData | null>(null);
    const [inProductionLoading, setInProductionLoading] = useState(false);

    // State for finished shoes data
    const [finishedShoesData, setFinishedShoesData] = useState<FinishedShoesData | null>(null);
    const [finishedShoesLoading, setFinishedShoesLoading] = useState(false);

    // State for in production shoes data
    const [inProductionShoesData, setInProductionShoesData] = useState<MetricData | null>(null);
    const [inProductionShoesLoading, setInProductionShoesLoading] = useState(false);

    // Fetch finished insoles data
    useEffect(() => {
        const fetchFinishedData = async () => {
            try {
                setFinishedLoading(true);
                const response: MetricApiResponse = await getQuantityOfFinishedInsoleData();
                if (response.success && response.data) {
                    setFinishedData(response.data);
                }
            } catch (error) {
                console.error('Error fetching finished insoles data:', error);
            } finally {
                setFinishedLoading(false);
            }
        };
        fetchFinishedData();
    }, []);

    // Fetch in production insoles data
    useEffect(() => {
        const fetchInProductionData = async () => {
            try {
                setInProductionLoading(true);
                const response: MetricApiResponse = await getQuantityOfInproductionInsoleData();
                if (response.success && response.data) {
                    setInProductionData(response.data);
                }
            } catch (error) {
                console.error('Error fetching in production insoles data:', error);
            } finally {
                setInProductionLoading(false);
            }
        };
        fetchInProductionData();
    }, []);

    // Fetch finished shoes data
    useEffect(() => {
        const fetchFinishedShoesData = async () => {
            try {
                setFinishedShoesLoading(true);
                const response: FinishedShoesApiResponse = await getRevenueOfFinishedShoesData();
                if (response.success && response.data) {
                    setFinishedShoesData(response.data);
                }
            } catch (error) {
                console.error('Error fetching finished shoes data:', error);
            } finally {
                setFinishedShoesLoading(false);
            }
        };
        fetchFinishedShoesData();
    }, []);

    // Fetch in production shoes data
    useEffect(() => {
        const fetchInProductionShoesData = async () => {
            try {
                setInProductionShoesLoading(true);
                const response: MetricApiResponse = await getQuantityOfInproductionShoesData();
                if (response.success && response.data) {
                    setInProductionShoesData(response.data);
                }
            } catch (error) {
                console.error('Error fetching in production shoes data:', error);
            } finally {
                setInProductionShoesLoading(false);
            }
        };
        fetchInProductionShoesData();
    }, []);

    return {
        // Insoles data
        finishedData,
        finishedLoading,
        inProductionData,
        inProductionLoading,
        // Shoes data
        finishedShoesData,
        finishedShoesLoading,
        inProductionShoesData,
        inProductionShoesLoading,
    };
}

