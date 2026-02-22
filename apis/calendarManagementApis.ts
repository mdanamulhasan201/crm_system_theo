import axiosClient from "@/lib/axiosClient";

// /v2/appointment/by-date
// With employee: filter by id1,id2. Without employee (or empty): all appointments for date range.
// &limit=30 &startDate=YYYY-MM-DD &endDate=YYYY-MM-DD &cursor= &employee= (optional)

export interface AppointmentByDateAssignedTo {
    employeId: string;
    assignedTo: string;
}

export interface AppointmentByDateItem {
    id: string;
    customer_name: string;
    time: string;
    date: string;
    reason: string;
    assignedTo: AppointmentByDateAssignedTo[];
    duration: number;
    details?: string;
    isClient?: boolean;
    userId?: string;
    reminder?: number;
    reminderSent?: boolean;
    customerId?: string;
    createdAt?: string;
}

export interface GetAppointmentsByDateResponse {
    success: boolean;
    data: AppointmentByDateItem[];
    pagination: { limit: number; hasMore: boolean; cursor?: string };
}

export const getAppointmentsByDate = async (
    limit: number,
    startDate: string,
    endDate: string,
    cursor: string,
    employee?: string
): Promise<GetAppointmentsByDateResponse> => {
    const params = new URLSearchParams({
        limit: String(limit),
        startDate,
        endDate,
        cursor: cursor || ''
    });
    if (employee && employee.trim()) {
        params.set('employee', employee.trim());
    }
    const response = await axiosClient.get<GetAppointmentsByDateResponse>(
        `/v2/appointment/by-date?${params.toString()}`
    );
    return response.data;
};


// Get dates that have appointments (for mini calendar dots)
// v2/appointment/all-appointments-date
// With employee: only that employee's dates. Without: all dates with data.
export interface GetDotInMyCalendarResponse {
    success: boolean;
    dates: string[];
}

export const getDotInMyCalendar = async (
    year: number,
    month: number,
    employee?: string
): Promise<GetDotInMyCalendarResponse> => {
    const params = new URLSearchParams({
        year: String(year),
        month: String(month)
    });
    if (employee && employee.trim()) {
        params.set('employee', employee.trim());
    }
    const response = await axiosClient.get<GetDotInMyCalendarResponse>(
        `/v2/appointment/all-appointments-date?${params.toString()}`
    );
    return response.data;
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
