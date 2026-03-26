import axiosClient from "@/lib/axiosClient";

//  post basic settings customers/customer-requirements
export const postBasicSettings = async (basicSettings: any) => {
    try {
        const response = await axiosClient.post('/customers/customer-requirements', basicSettings);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get basic settings GET: http://localhost:3001/customers/customer-requirements

export const getBasicSettings = async () => {
    try {
        const response = await axiosClient.get('/customers/customer-requirements');
        return response.data;
    } catch (error) {
        throw error;
    }
}


// orders field v2/order-required-fields/get
export const getOrdersFieldSettings = async () => {
    try {
        const response = await axiosClient.get('/v2/order-required-fields/get');
        return response.data;
    } catch (error) {
        throw error;
    }
}

// update v2/order-required-fields/manage
export const updateOrdersFieldSettings = async (ordersFieldSettings: any) => {
    try {
        const response = await axiosClient.patch('/v2/order-required-fields/manage', ordersFieldSettings);
        return response.data;
    } catch (error) {
        throw error;
    }
}