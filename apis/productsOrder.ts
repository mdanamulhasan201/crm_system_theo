import axiosClient from "@/lib/axiosClient";
// create order 
export const createOrder = async (customerId: string, versorgungId: string, werkstattzettelId?: string, formData?: Record<string, any>) => {
    try {
        const payload: any = { customerId, versorgungId };
        if (werkstattzettelId) {
            payload.werkstattzettelId = werkstattzettelId;
        }
        if (formData) {
            Object.assign(payload, formData);
        }
        const response = await axiosClient.post('/customer-orders/create', payload);
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

// get all orders  &customerNumber=&orderNumber=&customerName
export const getAllOrders = async (
    page: number,
    limit: number,
    days: number,
    orderStatus?: string,
    customerNumber?: string,
    orderNumber?: string,
    customerName?: string
) => {
    try {
        let url = `/customer-orders?page=${page}&limit=${limit}&days=${days}`;
        if (orderStatus) {
            url += `&orderStatus=${orderStatus}`;
        }
        if (customerNumber) {
            url += `&customerNumber=${customerNumber}`;
        }
        if (orderNumber) {
            url += `&orderNumber=${orderNumber}`;
        }
        if (customerName) {
            url += `&customerName=${customerName}`;
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


// delete group order 
export const deleteGroupOrder = async (orderIds: string[]) => {
    try {
        const response = await axiosClient.delete('/customer-orders/multiple/delete', {
            data: { orderIds }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// group order status changes  
export const groupOrderStatusUpdate = async (orderIds: string[], orderStatus: string) => {
    try {
        const response = await axiosClient.patch('/customer-orders/status/multiple/update', { orderIds, orderStatus });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateOrderPriority = async (orderId: string, priority: string) => {
    try {
        const response = await axiosClient.patch(`/customer-orders/update/priority/${orderId}`, { priority });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get customer orders by customer id /customer-orders/get/:id /customer-orders/customer/cbc25f6f-c217-467e-8c64-287c7625265f?page=&limit=
export const getCustomerOrdersByCustomerId = async (customerId: string, page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/customer-orders/customer/${customerId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// customer order history get customer-orders/history/orders/89ca7ae3-c37d-4e39-b152-ae68d91f464b
export const getCustomerOrderHistory = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/history/orders/${orderId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message || 'Failed to fetch customer order history');
    }
}