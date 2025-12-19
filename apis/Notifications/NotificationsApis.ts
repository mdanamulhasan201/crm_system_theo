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


// /v2/notifications/unread-count

export const getUnreadCount = async () => {
    try {
        const response = await axiosClient.get('/v2/notifications/unread-count');
        return response.data;
    } catch (error) {
        throw error;
    }
}


//v2/notifications/mark-as-read

export const markAsRead = async () => {
    try {
        const response = await axiosClient.patch(`/v2/notifications/mark-as-read/`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

