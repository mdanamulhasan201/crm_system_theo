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
// create custom Versorgung privet-supply/shadow
export const createCustomVersorgung = async (payload: Record<string, any>) => {
    try {
        const response = await axiosClient.post('/privet-supply/shadow', payload);
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
        const response = await axiosClient.post(`/customer-orders/manage/upload-invoice-only/${orderId}`, formData, {
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
        const response = await axiosClient.post(`/customer-orders/manage/send-invoice/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
// ?bezahlt={{Info}}    
// ------
//   "Privat_Bezahlt",
//    "Privat_offen",
//   "Krankenkasse_Ungenehmigt",
//   "Krankenkasse_Genehmigt"
// get all orders – cursor pagination: customer-orders?cursor=&limit=&days=&type=&bezahlt=&search=
export const getAllOrders = async (
    limit: number,
    days: number,
    orderStatus?: string,
    bezahlt?: string,
    search?: string,
    cursor?: string,
    customerNumber?: string,
    orderNumber?: string,
    customerName?: string,
    type?: string
) => {
    try {
        let url = `/customer-orders?limit=${limit}&days=${days}`;
        if (type) {
            url += `&type=${type}`;
        }
        if (orderStatus) {
            url += `&orderStatus=${orderStatus}`;
        }
        if (bezahlt) {
            url += `&bezahlt=${encodeURIComponent(bezahlt)}`;
        }
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
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
        const response = await axiosClient.patch(`/customer-orders/manage/status/${orderId}`, { orderStatus });
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
        const response = await axiosClient.get(`/customer-orders/track/stats/retio?year=${year}&month=${month}`);
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
        const response = await axiosClient.patch('/customer-orders/manage/status/multiple/update', { orderIds, orderStatus });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const updateOrderPriority = async (orderId: string, priority: string) => {
    try {
        const response = await axiosClient.patch(`/customer-orders/manage/update/priority/${orderId}`, { priority });
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
        const response = await axiosClient.get(`/customer-orders/track/order-history/${orderId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message || 'Failed to fetch customer order history');
    }
}

//  get supply info  /customer-orders/track/supply-infoo/89ca7ae3-c37d-4e39-b152-ae68d91f464b

export const getSupplyInfo = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/track/supply-info/${orderId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message || 'Failed to fetch supply info');
    }
}


// get picture 23-24 of order /customer-orders/track/picture-23-24/id
export const getPicture2324 = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/track/picture-23-24/${orderId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message || 'Failed to fetch picture 23-24');
    }
}

// //customer-orders/payment-status


export const getPaymentStatus = async (orderIds: string[], paymentStatus: string, bezahlt?: string) => {
    try {
        const payload: any = { orderIds, paymentStatus };
        if (bezahlt) {
            payload.bezahlt = bezahlt;
        }
        const response = await axiosClient.patch('/customer-orders/manage/payment-status', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Alias for Krankenkasse status updates (for backward compatibility)
export const getKrankenKasseStatus = async (orderIds: string[], krankenkasseStatus: string) => {
    try {
        const response = await axiosClient.patch('/customer-orders/manage/payment-status', {
            orderIds,
            paymentStatus: krankenkasseStatus,
            bezahlt: krankenkasseStatus
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}



// }customer-orders/previous-orders/get-latest/f95ea2fe-adf3-47d3-b177-504fb678cf16?productType=insole
// // Quary:
// productType=insole
// productType=shoes
// productType=sonstiges
// last order
export const getPreviousOrders = async (
    customerId: string,
    limit: number,
    cursor?: number,
    productType?: 'insole' | 'shoes' | 'sonstiges'
) => {
    try {
        let url = `/customer-orders/previous-orders/get-latest/${customerId}?limit=${limit}`;
        if (productType) {
            url += `&productType=${productType}`;
        }
        if (cursor !== undefined && cursor !== null) {
            url += `&cursor=${cursor}`;
        }
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}




// customer-orders/previous-orders/get-all/f95ea2fe-adf3-47d3-b177-504fb678cf16?limit=10&cursor=&productType=insole

// Quary:
// productType=insole
// productType=shoes
// productType=sonstiges


// customer-orders/previous-orders/get-all/f95ea2fe-adf3-47d3-b177-504fb678cf16?

export const getPreviousOrdersByProductType = async (
    customerId: string,
    limit: number,
    cursor: number | undefined,
    productType: 'insole' | 'shoes' | 'sonstiges'
) => {
    try {
        let url = `/customer-orders/previous-orders/get-all/${customerId}?limit=${limit}&productType=${productType}`;
        if (cursor !== undefined && cursor !== null) {
            url += `&cursor=${cursor}`;
        }
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}




// GET Single
//customer-orders/previous-orders/get-single/{{COSTOMER ID}}/{{Order Id}}
// customer-orders/previous-orders/get-single/f95ea2fe-adf3-47d3-b177-504fb678cf16/e712dda9-e6c1-435c-8fbc-3241526a745d

// {{TD_BASEURL}}customer-orders/previous-orders/get-single/{{COSTOMER ID}}/{{Order Id}}

export const getPreviousOrderSingle = async (
    customerId: string,
    orderId: string,
    productType?: 'insole' | 'shoes' | 'sonstiges'
) => {
    try {
        let url = `/customer-orders/previous-orders/get-single/${customerId}/${orderId}`;
        if (productType) {
            url += `?productType=${productType}`;
        }
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}




// show the note data }}customer-orders/track/status-note/id
export const getStatusNote = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/track/status-note/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
