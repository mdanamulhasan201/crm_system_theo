import axiosClient from "@/lib/axiosClient";

export const getAllNotifications = async (limit: number, cursor: string) => {
    try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (cursor) params.set("cursor", cursor);
        const response = await axiosClient.get(
            `/v2/notifications/get-all?${params.toString()}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};


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

// deep read v2/notifications/mark-as-deep-read
// body: {
//     "notificationIds": ["cmn5ygdcn00004akunka5fbs3"]
// }
export const markAsDeepRead = async (notificationIds: string[]) => {
    try {
        const response = await axiosClient.patch(`/v2/notifications/mark-as-deep-read`, { notificationIds });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to mark as deep read');
    }
}


// /v2/notifications/delete
// body: {
//     "notificationIds": ["4862d8df-ae2f-40ba-a25d-75f3bced80c8"]
// }
export const deleteNotification = async (notificationIds: string[]) => {
    try {
        const response = await axiosClient.delete(`/v2/notifications/delete`, { data: { notificationIds }    } as any);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
}