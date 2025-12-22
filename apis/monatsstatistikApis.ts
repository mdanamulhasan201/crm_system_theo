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




// Wochenstatistik

// /v2/dashboard-overview/revenue-compare-month-with-year-insoles
export const getRevenueCompareMonthWithYearInsoleData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/revenue-compare-month-with-year-insoles`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// /v2/dashboard-overview/quantity-of-finished-insoles
export const getQuantityOfFinishedInsoleData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/quantity-of-finished-insoles`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// /v2/dashboard-overview/quantity-of-inproduction-insoles
export const getQuantityOfInproductionInsoleData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/quantity-of-inproduction-insoles`);
        return response.data;
    } catch (error) {
        throw error;
    }
}




//////////////////////

// v2/dashboard-overview/revenue-compare-month-with-year-shoes
export const getRevenueCompareMonthWithYearShoesData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/revenue-compare-month-with-year-shoes`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /v2/dashboard-overview/revenue-of-finished-shoes
export const getRevenueOfFinishedShoesData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/revenue-of-finished-shoes`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

///v2/dashboard-overview/quantity-of-inproduction-shoes
export const getQuantityOfInproductionShoesData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/quantity-of-inproduction-shoes`);
        return response.data;
    } catch (error) {
        throw error;
    }
}



// bar chart einlagen /v2/dashboard-overview/insole-quantity-par-status?year=2025&month=12
export const getInsoleQuantityParStatusData = async (year: string, month: string) => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/insole-quantity-par-status?year=${year}&month=${month}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// bar chart massschuhe /v2/dashboard-overview/shoe-quantity-per-status?year=2025&month=12
export const getShoeQuantityPerStatusData = async (year: string, month: string) => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/shoe-quantity-per-status?year=${year}&month=${month}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /v2/dashboard-overview/insurance-payment-comparison
export const getInsurancePaymentComparisonData = async () => {
    try {
        const response = await axiosClient.get(`/v2/dashboard-overview/insurance-payment-comparison`);
        return response.data;
    } catch (error) {
        throw error;
    }
}