import axiosClient from "@/lib/axiosClient";

// customer-orders/sonstiges/create

export const createSonstiges = async (payload: Record<string, any>) => {
    try {
        const response = await axiosClient.post('/customer-orders/sonstiges/create', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}