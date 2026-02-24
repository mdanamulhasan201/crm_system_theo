import axiosClient from "@/lib/axiosClient";


// create massschuhe added
export const createMassschuheAdded = async (massschuheAddedData: any) => {
    try {
        const response = await axiosClient.post('/massschuhe-order/create', massschuheAddedData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};



// without order id post massschuhe /custom_shafts/create?custom_models=true&isCourierContact=yes/no
export const createMassschuheWithoutOrderId = async (massschuheData: any, isCourierContact: 'yes' | 'no' = 'yes') => {
    try {
        const response = await axiosClient.post(`/custom_shafts/create?custom_models=true&isCourierContact=${isCourierContact}`, massschuheData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// without order id post massschuhe /custom_shafts/create?custom_models=false&isCourierContact=yes/no
export const createMassschuheWithoutOrderIdWithoutCustomModels = async (massschuheData: any, isCourierContact: 'yes' | 'no' = 'yes') => {
    try {
        const response = await axiosClient.post(`/custom_shafts/create?custom_models=&isCourierContact=${isCourierContact}`, massschuheData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}



// =================== Massschuhe Added APIs  Update v2 ======================

// massschuhe order create v2/shoe-orders/create
export const createMassschuheOrderV2 = async (massschuheOrderData: any) => {
    try {
        const response = await axiosClient.post('/v2/shoe-orders/create', massschuheOrderData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// massschuhe all order get – cursor pagination: v2/shoe-orders/get-all?limit=2&status=Auftragserstellung&cursor=&search=
// cursor: empty for first page, then use last item id or response.pagination.nextCursor for next page
export const getAllMassschuheOrders = async (limit: number = 10, status: string = 'Auftragserstellung', cursor: string = '', search: string = '') => {
    try {
        const cursorParam = cursor ? encodeURIComponent(cursor) : '';
        const response = await axiosClient.get(`/v2/shoe-orders/get-all?limit=${limit}&status=${status}&cursor=${cursorParam}&search=${encodeURIComponent(search || '')}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// get single massschuhe order by id v2/shoe-orders/:id
export const getMassschuheOrderById = async (id: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}