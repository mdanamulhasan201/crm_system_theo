import axiosClient from "@/lib/axiosClient";


// create auftragszettel v2/order_settings/manage
export const createAuftragszettel = async (orderSettingsData: any) => {
    try {
        const response = await axiosClient.patch('/v2/order_settings/manage', orderSettingsData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
}


// get auftragszettel v2/order_settings/manage
export const getAuftragszettel = async () => {
    try {
        const response = await axiosClient.get('/v2/order_settings/manage');
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


export type EmployeeForLocationEmployee = {
    id: string;
    employeeName: string;
    email?: string;
    image?: string | null;
};

export type EmployeeForLocationItem = {
    id: string;
    isPrimary?: boolean;
    address: string;
    description?: string;
    employees: EmployeeForLocationEmployee | null;
};

export type EmployeeForLocationResponse = {
    success?: boolean;
    message?: string;
    data?: EmployeeForLocationItem[];
};

/** GET /v2/order_settings/employee-for-location */
export const getEmployeeForLocation = async (): Promise<EmployeeForLocationResponse> => {
    try {
        const response = await axiosClient.get<EmployeeForLocationResponse>(
            "/v2/order_settings/employee-for-location"
        );
        return response.data;
    } catch (error: any) {
        throw error;
    }
};


export type SetEmployeeForLocationBody = {
    locationId: string;
    employeeId: string;
};

export type SetEmployeeForLocationResponse = {
    success?: boolean;
    message?: string;
};

/** POST /v2/order_settings/set-employee-for-location */
export const setEmployeeForLocation = async (
    body: SetEmployeeForLocationBody
): Promise<SetEmployeeForLocationResponse> => {
    try {
        const response = await axiosClient.post<SetEmployeeForLocationResponse>(
            "/v2/order_settings/set-employee-for-location",
            body
        );
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

