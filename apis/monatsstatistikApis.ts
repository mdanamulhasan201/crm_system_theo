import axiosClient from "@/lib/axiosClient";

// insole and shoes revenue data /v2/dashboard-overview/insoles-and-shoes-revenue
export const getInsoleAndShoesRevenueData = async () => {
    try {
        const response = await axiosClient.get('/v2/dashboard-overview/insoles-and-shoes-revenue');
        return response.data;
    } catch (error) {
        throw error;
    }
}


// insole and shoes data /v2/dashboard-overview/sealling-location-revenue
export const getSeallingLocationRevenueData = async () => {
    try {
        const response = await axiosClient.get('/v2/dashboard-overview/sealling-location-revenue');
        return response.data;
    } catch (error) {
        throw error;
    }
}


// revenue chart /v2/dashboard-overview/revenue-chart-data?year=2025&month=4
export const getRevenueChartData = async (year: string, month: string) => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/revenue-chart-data?year=${year}&month=${month}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
