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


// v2/appointment/employee-free-percentage
// body
// {
//     "dates": ["2026-03-16", "2026-03-27"]
//   }
export const getEmployeeFreePercentage = async (dates: string[]) => {
    try {
        const response = await axiosClient.post(`/v2/appointment/employee-free-percentage`, { dates });
        return response.data;
    } catch (error) {
        throw error;
    }
};


// v2/appointment/room-occupancy-percentage
// Body: { "dates": ["2026-03-27", ...] } (ISO yyyy-MM-dd strings)
// Response: { success, dates?: string[], data: [{ roomId, roomName, isActive, occupancy }] }
// occupancy is used as percentage (0–100) for UI

export type RoomOccupancyRow = {
    roomId: string;
    roomName: string;
    isActive: boolean;
    occupancy: number;
};

export type RoomOccupancyPercentageResponse = {
    success?: boolean;
    dates?: string[];
    data?: RoomOccupancyRow[];
};

export const getRoomOccupancyPercentage = async (dates: string[]) => {
    try {
        const response = await axiosClient.post<RoomOccupancyPercentageResponse>(
            `/v2/appointment/room-occupancy-percentage`,
            { dates }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export type BookingRulesData = {
    id?: string;
    partnerId?: string;
    minNoticeHours?: number;
    cancellationHours?: number;
    /** Upper limit for appointment length (minutes). Dauer options must not exceed this. */
    defaultSlotMinutes?: number;
    /** If provided, Dauer options must be at least this many minutes. */
    minDurationMinutes?: number;
    createdAt?: string;
    updatedAt?: string;
};

export type BookingRulesResponse = {
    success?: boolean;
    data?: BookingRulesData;
    message?: string;
};

/** GET /v2/appointment/booking-rules/get */
export const getAllBookingRules = async (): Promise<BookingRulesResponse> => {
    try {
        const response = await axiosClient.get<BookingRulesResponse>(
            `/v2/appointment/booking-rules/get`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};



// //v2/appointment?allowOverlap=true

export const getAppointmentsWithOverlap = async (allowOverlap: boolean) => {
    try {
        const response = await axiosClient.post(`/v2/appointment?allowOverlap=${allowOverlap}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
}

export const createAppointmentWithOverlap = async (
    appointmentData: {
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
    },
    allowOverlap: boolean
) => {
    try {
        const response = await axiosClient.post(
            `/v2/appointment?allowOverlap=${allowOverlap}`,
            appointmentData
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
}