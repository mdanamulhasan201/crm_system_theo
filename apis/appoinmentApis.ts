import axiosClient from "@/lib/axiosClient";

// create appoinment
export const createAppoinment = async (appointmentData: {
    customer_name: string;
    time: string;
    date: string;
    reason: string;
    assignedTo: Array<{
        employeId: string;
        assignedTo: string;
    }>;
    details: string;
    isClient: boolean;
    userId?: string;
    customerId?: string;
    duration?: number;
}) => {
    try {
        const response = await axiosClient.post('/v2/appointment', appointmentData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

// get my appointments
export const getMyAppointments = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    try {
        const queryParams = new URLSearchParams({
            page: (params?.page || 1).toString(),
            limit: (params?.limit || 10).toString(),
            search: params?.search || ''
        });

        const response = await axiosClient.get(`/v2/appointment/my?${queryParams}`);

        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// delete appointment
export const deleteAppointment = async (appointmentId: string) => {
    try {
        const response = await axiosClient.delete(`/appointment/${appointmentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// get single appointment
export const getSingleAppointment = async (appointmentId: string) => {
    try {
        const response = await axiosClient.get(`/appointment/${appointmentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// update appointment
export const updateAppointment = async (appointmentId: string, appointmentData: {
    customer_name: string;
    time: string;
    date: string;
    reason: string;
    assignedTo: Array<{
        employeId: string;
        assignedTo: string;
    }>;
    details: string;
    isClient: boolean;
    customerId?: string;
    duration?: number;
}) => {
    try {
        const response = await axiosClient.put(`/appointment/${appointmentId}`, appointmentData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

