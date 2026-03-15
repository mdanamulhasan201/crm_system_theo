import axiosClient from "@/lib/axiosClient";


// craete employee
export const createEmployee = async (employeeData: any) => {
    try {
        const response = await axiosClient.post('/employees', employeeData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get all 
export const getAllEmployees = async (page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/employees?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get single employee
export const getEmployeeById = async (id: string) => {
    try {
        const response = await axiosClient.get(`/employees/get-single/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// update employee 
export const updateEmployee = async (id: string, employeeData: any) => {
    try {
        const response = await axiosClient.patch(`/employees/${id}`, employeeData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// delete employee 
export const deleteEmployee = async (id: string) => {
    try {
        const response = await axiosClient.delete(`/employees/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


//  search employee
export const searchEmployee = async (page: number, limit: number, search: string) => {
    try {
        const response = await axiosClient.get(`/employees/search?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}



// set feature access for employee
export const setFeatureAccess = async (employeeId: string, permissions: Record<string, boolean>) => {
    try {
        const response = await axiosClient.post(`/employees/feature-access/${employeeId}`, permissions);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get feature access for employee employees/feature-access/a5157e8f-af79-4dab-aef5-349caed8755f
export const getFeatureAccess = async (employeeId: string) => {
    try {
        const response = await axiosClient.get(`/employees/feature-access/${employeeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}










// ============================= `employeeAvailabilityApis` =============================//

// create employee availability /v2/employee-availability/create/0d6ecfed-b9a7-454b-a4a3-ece4c2ffc57a

export const createEmployeeAvailability = async (employeeId: string, employeeAvailabilityData: any) => {
    try {
        const response = await axiosClient.post(`/v2/employee-availability/create/${employeeId}`, employeeAvailabilityData);
        return response.data;
    } catch (error) {
        throw error;
    }
}



// get all /v2/employee-availability/availability-list/0d6ecfed-b9a7-454b-a4a3-ece4c2ffc57a

export const getAllEmployeeAvailability = async (employeeId: string) => {
    try {
        const response = await axiosClient.get(`/v2/employee-availability/availability-list/${employeeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// POST /v2/employee-availability/toggle-activity/{employeeId}
// body: { "eavailability_id": "..." }

export const toggleEmployeeAvailabilityActivity = async (employeeId: string, eavailabilityId: string) => {
    try {
        const response = await axiosClient.patch(
            `/v2/employee-availability/toggle-activity/${employeeId}`,
            { eavailability_id: eavailabilityId }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}





