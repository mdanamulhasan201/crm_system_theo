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

// update isByPartner_2 flag of massschuhe order
// PATCH /massschuhe-order/update-order/:id  with body { isByPartner_2: boolean }
export const updateMassschuheOrderPartner2 = async (orderId: string, isByPartner_2: boolean) => {
    try {
        const response = await axiosClient.patch(`/massschuhe-order/update-order/${orderId}`, { isByPartner_2 });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// balance massschuhe order - Get total price from admin order transitions
// GET /v2/admin-order-transitions/total-price
// Returns: { success: boolean, message: string, data: { totalPrice: number } }
export const balanceMassschuheOrder = async () => {
    try {
        const response = await axiosClient.get(`/v2/admin-order-transitions/total-price`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Get total price ratio with daily data for balance chart
// GET /v2/admin-order-transitions/total-price-ratio
// Returns: { success: boolean, message: string, data: { partnerId: string, month: number, year: number, dailyData: Array<{ date: string, value: number, count: number }> } }
export const totalRadioMassschuheOrder = async () => {
    try {
        const response = await axiosClient.get(`/v2/admin-order-transitions/total-price-ratio`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Get all order transitions with cursor-based pagination
// GET /v2/admin-order-transitions/get-all-transitions?limit=10&cursor=
// Returns: { success: boolean, message: string, data: Array<OrderData>, hasMore: boolean }
// cursor: pass empty string '' for first page, then pass the last item's ID for next page
export const getAllOrderData = async (limit: number, cursor: string) => {
    try {
        const response = await axiosClient.get(`/v2/admin-order-transitions/get-all-transitions?limit=${limit}&cursor=${cursor}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// calcel order 
// POST /v2/admin-order-transitions/cancel-order
// body: { orderId: string }
// Returns: { success: boolean, message: string }
export const cancelOrder = async (orderId: string) => {
    try {
        const response = await axiosClient.post(`/v2/admin-order-transitions/cancel-order`, { orderId });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// card data visble v2/admin-order-transitions/least-one-month-payment
export const getLeastOneMonthPaymentData = async () => {
    try {
        const response = await axiosClient.get(`/v2/admin-order-transitions/least-one-month-payment`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// send massschuhe order to admin 1 /massschuhe-order/admin-order/send-to-admin-1/:orderId
// body pass threed_model_right and threed_model_left and invoice  

export const sendMassschuheOrderToAdmin1 = async (orderId: string, formData: FormData | any) => {
    try {
        const response = await axiosClient.post(`/massschuhe-order/admin-order/send-to-admin-1/${orderId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /massschuhe-order/admin-order/send-to-admin-2-order/c76be3b8-f7e9-4428-a3cd-3d4b1e1b425c
export const sendMassschuheOrderToAdmin2 = async (orderId: string, formData: FormData | any) => {
    try {
        const response = await axiosClient.post(`/massschuhe-order/admin-order/send-to-admin-2-order/${orderId}/?custom_models=false`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Custom shaft order (with uploaded image) - send to admin 2
// /massschuhe-order/admin-order/send-to-admin-2-order/d4fd8996-8862-45bb-9cdd-7d46332c7cfe?custom_models=true
export const sendMassschuheCustomShaftOrderToAdmin2 = async (orderId: string, formData: FormData | any) => {
    try {
        const response = await axiosClient.post(`/massschuhe-order/admin-order/send-to-admin-2-order/${orderId}?custom_models=true`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /1/massschuhe-order/admin-order/send-to-admin-3-order/orderId
export const sendMassschuheOrderToAdmin3 = async (orderId: string, formData: FormData | any) => {
    try {
        const response = await axiosClient.post(`/massschuhe-order/admin-order/send-to-admin-3-order/${orderId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// create business address /massschuhe-order/admin-order/courier-contact/create
export const createBusinessAddress = async (businessAddressData: any) => {
    try {
        const response = await axiosClient.post(`/massschuhe-order/admin-order/courier-contact/create`, businessAddressData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get business address list for a customer
// GET /massschuhe-order/admin-order/courier-contact/customer-list-order-contact/:customerId
export const getBusinessAddress = async (customerId: string) => {
    try {
        const response = await axiosClient.get(
            `/massschuhe-order/admin-order/courier-contact/customer-list-order-contact/${customerId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}