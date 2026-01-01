import axiosClient from "@/lib/axiosClient";


// get all massschuhe order  massschuhe-order?page=1&limit=3&search=&

// date of brith
// ?geburtsdatum=
// ?customerNumber=
 
// name
// ?vorname=
// ?nachname=

export const getAllMassschuheOrder = async (
    page: number, 
    limit: number, 
    status?: string,
    geburtsdatum?: string,
    customerNumber?: string | number,
    vorname?: string,
    nachname?: string,
    customerId?: string
) => {
    try {
        let url = `/massschuhe-order?page=${page}&limit=${limit}`;
        
        const statusParam = status && status !== "Versorgungs Start" ? `&status=${status}` : "";
        url += statusParam;
        
        if (geburtsdatum) {
            url += `&geburtsdatum=${encodeURIComponent(geburtsdatum)}`;
        }
        
        if (customerNumber) {
            url += `&customerNumber=${encodeURIComponent(customerNumber)}`;
        }
        
        if (vorname) {
            url += `&vorname=${encodeURIComponent(vorname)}`;
        }
        
        if (nachname) {
            url += `&nachname=${encodeURIComponent(nachname)}`;
        }
        
        if (customerId) {
            url += `&customerId=${encodeURIComponent(customerId)}`;
        }
        
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get massschuhe order by id /massschuhe-order/get/41976a2d-b3fb-4980-a96b-89cee49ab6cb
export const getMassschuheOrderById = async (id: string) => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// update massschuhe order status /massschuhe-order/update-status
export const updateMassschuheOrderStatus = async (orderIds: string[], status: string) => {
    try {
        const response = await axiosClient.patch(`/massschuhe-order/update-status`, { orderIds, status });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message || 'Failed to update massschuhe order status');
        throw error;
    }
}

// get massschuhe order status data /massschuhe-order/stats
export const getMassschuheOrderData = async () => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/stats`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get chart data /massschuhe-order/stats/chart
export const getMassschuheOrderChartData = async () => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/stats/revenue`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get bottom card data /massschuhe-order/stats/bottom-card
export const getBottomCardData = async () => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/stats/footer-analysis`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// chart data /massschuhe-order/stats/production-timeline?year=2025 
export const getProductionTimelineData = async (year: number) => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/stats/production-timeline?year=${year}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /massschuhe-order/stats/production-summary
export const getProductionSummaryData = async () => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/stats/production-summary`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// changes express/standard flag of massschuhe order
// PATCH /massschuhe-order/update-order/:id  with body { express: boolean }
export const updateMassschuheOrderChangesStatus = async (orderId: string, express: boolean) => {
    try {
        const response = await axiosClient.patch(`/massschuhe-order/update-order/${orderId}`, { express });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// balance massschuhe order /custom_shafts/total-price-resio
export const balanceMassschuheOrder = async () => {
    try {
        const response = await axiosClient.get(`/custom_shafts/total-price-resio`);
        return response.data;
    } catch (error) {
        throw error;
    }
}