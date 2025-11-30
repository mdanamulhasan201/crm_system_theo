import axiosClient from "@/lib/axiosClient";

export interface Werkstattzettel {
    employeeId: string;
    completionDays: string;
    pickupLocation?: string;
    sameAsBusiness: boolean;
    showCompanyLogo: boolean;
    autoShowAfterPrint: boolean;
    autoApplySupply: boolean;
}


export const searchEmployee = async (page: number, limit: number, search: string) => {
    try {
        const response = await axiosClient.get(`/employees/search?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createWerkstattzettel = async (werkstattzettel: Werkstattzettel) => {
    try {
        const response = await axiosClient.post(`/workshop-note/set`, werkstattzettel);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getWerkstattzettel = async () => {
    try {
        const response = await axiosClient.get(`/workshop-note/get`);
        return response.data;
    } catch (error) {
        throw error;
    }
}