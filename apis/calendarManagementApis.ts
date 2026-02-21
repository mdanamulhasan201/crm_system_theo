import axiosClient from "@/lib/axiosClient";


// 
// /v2/appointment/by-date

// &limit=30 (default 30)
// &employee={{id,id,id}}
// &startDate=2026-02-01
// &endDate=2026-02-28
// &cursor=

export const getAppointmentsByDate = async (limit: number, employee: string, startDate: string, endDate: string, cursor: string) => {
    try {
        const response = await axiosClient.get(`/v2/appointment/by-date?limit=${limit}&employee=${employee}&startDate=${startDate}&endDate=${endDate}&cursor=${cursor}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}