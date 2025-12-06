import axiosClient from "@/lib/axiosClient";


// get all massschuhe order  massschuhe-order?page=1&limit=3&search=
export const getAllMassschuheOrder = async (page: number, limit: number, status?: string) => {
    try {
        const statusParam = status && status !== "Versorgungs Start" ? `&status=${status}` : "";
        const response = await axiosClient.get(`/massschuhe-order?page=${page}&limit=${limit}${statusParam}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get massschuhe order by id /massschuhe-order/get/41976a2d-b3fb-4980-a96b-89cee49ab6cb
export const getMassschuheOrderById = async (id: string) => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// update massschuhe order status /massschuhe-order/update-status
export const updateMassschuheOrderStatus = async (orderIds: string[], status: string) => {
    try {
        const response = await axiosClient.patch(`/massschuhe-order/update-status`, { orderIds, status });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message || 'Failed to update massschuhe order status');
        throw error;
    }
}