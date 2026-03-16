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
    reminder?: number | null;
    appomnentRoom?: string;
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
        const response = await axiosClient.delete(`/v2/appointment/${appointmentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// get single appointment
export const getSingleAppointment = async (appointmentId: string) => {
    try {
        const response = await axiosClient.get(`/v2/appointment/${appointmentId}`);
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
    reminder?: number | null;
    appomnentRoom?: string;
}) => {
    try {
        const response = await axiosClient.put(`/v2/appointment/${appointmentId}`, appointmentData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};


// v2/employee-availability/combined-available-slots
// {
//     "date": "2026-03-16",
//     "employeeIds": ["3931f18d-834d-4c58-bdfd-687121a65dec", "0d6ecfed-b9a7-454b-a4a3-ece4c2ffc57a"],
//     "intervalMinutes": 15
//   }

export const getAllActiveAppointmentRooms = async () => {
    try {
        const response = await axiosClient.get(`/v2/appointment/appomnent-room/get-all-active`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCombinedAvailableSlots = async (date: string, employeeIds: string[], intervalMinutes: number) => {
    try {
        const response = await axiosClient.post(`/v2/employee-availability/combined-available-slots`, { date, employeeIds, intervalMinutes });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// v2/appointment/by-date-next-four-days?date=2026-03-16
export const getAppointmentsByDate = async (date: string) => {
    try {
        const response = await axiosClient.get(`/v2/appointment/by-date-next-four-days?date=${date}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// v2/appointment/employee-free-slots
export const getEmployeeFreeSlots = async (date: string, employeeId: string) => {
    try {
        const response = await axiosClient.post(`/v2/appointment/employee-free-slots`, {
            date,
            employeeIds: [employeeId],
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};