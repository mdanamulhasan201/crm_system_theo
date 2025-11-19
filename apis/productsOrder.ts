import axiosClient from "@/lib/axiosClient";
// create order 
export const createOrder = async (customerId: string, versorgungId: string, werkstattzettelId?: string) => {
    try {
        const response = await axiosClient.post('/customer-orders/create', { customerId, versorgungId, werkstattzettelId });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get single order 
export const getSingleOrder = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// invoice pdf save 
export const saveInvoicePdf = async (orderId: string, formData: FormData) => {
    try {
        const response = await axiosClient.post(`/customer-orders/upload-invoice-only/${orderId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// pdf send to customer  
export const pdfSendToCustomer = async (orderId: string, formData: FormData) => {
    try {
        const response = await axiosClient.post(`/customer-orders/send-invoice/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get all orders 
export const getAllOrders = async (page: number, limit: number, days: number, orderStatus?: string) => {
    try {
        let url = `/customer-orders?page=${page}&limit=${limit}&days=${days}`;
        if (orderStatus) {
            url += `&orderStatus=${orderStatus}`;
        }
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// update order status
export const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
        const response = await axiosClient.patch(`/customer-orders/status/${orderId}`, { orderStatus });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// delete order 
export const deleteOrder = async (orderId: string) => {
    try {
        const response = await axiosClient.delete(`/customer-orders/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// dashabord data for order /customer-orders/stats/retio?year=&month=
export const RevenueOverview = async (year: string, month: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/stats/retio?year=${year}&month=${month}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}




// custom order create (user info custom) customer-orders/werkstattzettel/:custommerId body pass employeeId
export const customOrderCreate = async (customerId: string, payload: Record<string, any>) => {
    try {
        const response = await axiosClient.post(`/customer-orders/werkstattzettel/${customerId}`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get einlagen-in-produktion  /customer-orders/einlagen-in-produktion
export const getEinlagenInProduktion = async () => {
    try {
        const response = await axiosClient.get('/customer-orders/einlagen-in-produktion');
        return response.data;
    } catch (error) {
        throw error;
    }
}
