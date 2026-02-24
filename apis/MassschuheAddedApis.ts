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

// get single massschuhe by id and status /v2/shoe-orders/get-status/:id?status=Auftragserstellung
export const getMassschuheOrderById = async (id: string, status: string) => {
    try {
        const statusParam = encodeURIComponent(status);
        const response = await axiosClient.get(`/v2/shoe-orders/get-status/${id}?status=${statusParam}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// order details v2/shoe-orders/get-order-details/98bd0578-f4fc-4ca3-8d21-027bf807bb21
export const getMassschuheOrderDetails = async (id: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/get-order-details/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// v2/shoe-orders/update-status/:id?status=Auftragserstellung
// body: FormData with "notes" (string) and "files" (multiple files). Only for Auftragserstellung send notes + files.
export const updateMassschuheOrderStatus = async (
    id: string,
    status: string,
    data: FormData
): Promise<boolean> => {
    try {
        const response = await axiosClient.patch(
            `/v2/shoe-orders/update-status/${id}?status=${encodeURIComponent(status)}`,
            data
        );
        return response.data?.success ?? false;
    } catch (error: any) {
        throw error;
    }
};



// get note v2/shoe-orders/get-status-note/:id
export const getMassschuheOrderNote = async (id: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/get-status-note/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// update note v2/shoe-orders/update-order/:id "status_note": "Hello"
export const updateMassschuheOrderNote = async (id: string, status_note: string) => {
    try {
        const response = await axiosClient.patch(`/v2/shoe-orders/update-order/${id}`, { status_note });
        return response.data.success;
    } catch (error: any) {
        throw error;
    }
};

const MassschuheAddedApisDefault = {
    getMassschuheOrderById,
    getMassschuheOrderDetails,
    updateMassschuheOrderStatus,
    getAllMassschuheOrders,
    createMassschuheOrderV2,
};
export default MassschuheAddedApisDefault;