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