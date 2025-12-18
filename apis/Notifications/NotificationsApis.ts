// /v2/notifications/get-all?page=1&limit=2


import axiosClient from "@/lib/axiosClient";

export const getAllNotifications = async (page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/v2/notifications/get-all?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}