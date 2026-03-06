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


// massschuhe all order get – cursor pagination
// priority: blank = all, or Dringend | Normal (do not send "Alle" in payload)
// paymentType: blank = all, or insurance | private | broth (do not send "Alle" in payload)
// branchLocationTitle: location title from getAllLocations (description or title)
export const getAllMassschuheOrders = async (
    limit: number = 10,
    status: string = '',
    cursor: string = '',
    search: string = '',
    priority: string = '',
    paymentType: string = '',
    branchLocationTitle: string = ''
) => {
    try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('status', status || '');
        params.set('cursor', cursor ? encodeURIComponent(cursor) : '');
        params.set('search', search || '');
        if (priority) params.set('priority', priority);
        if (paymentType) params.set('paymentType', paymentType);
        if (branchLocationTitle) params.set('branchLocationTitle', encodeURIComponent(branchLocationTitle));
        const response = await axiosClient.get(`/v2/shoe-orders/get-all?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// update priority (toggle): PATCH v2/shoe-orders/update-priority/:id — no body
// response: { success, message, data: { priority, id, status } }
export const updateMassschuheOrderPriority = async (id: string) => {
    try {
        const response = await axiosClient.patch(`/v2/shoe-orders/update-priority/${id}`);
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
// Returns full response so Step 5 can read data.orderId and then call update-step-5.
export interface UpdateMassschuheOrderStatusResponse {
    success: boolean;
    message?: string;
    data?: { orderId?: string; id?: string; [key: string]: any };
}
export const updateMassschuheOrderStatus = async (
    id: string,
    status: string,
    data: FormData
): Promise<UpdateMassschuheOrderStatusResponse> => {
    try {
        const response = await axiosClient.patch(
            `/v2/shoe-orders/update-status/${id}?status=${encodeURIComponent(status)}`,
            data
        );
        const body = response.data ?? {};
        return { success: body.success ?? false, message: body.message, data: body.data };
    } catch (error: any) {
        throw error;
    }
};

// Step 5 only: id = step record id from update-status response (data.id), not orderId
export const updateMassschuheOrderStep5 = async (stepId: string, data: FormData) => {
    try {
        const response = await axiosClient.post(`/v2/shoe-orders/order-step/update-step-5/${stepId}`, data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}



// =================== Massschuhe Added APIs  Notes ======================

//create note apis  v2/order-notes/create?type=shoes

// body:{
//     "orderId": "041fbcf1-d2f3-4522-ace6-5123ff10101a",
//     "note": "test note dgfdgd"
// }
export const createMassschuheOrderNote = async (orderId: string, note: string) => {
    try {
        const response = await axiosClient.post(`/v2/order-notes/create?type=shoes`, { orderId, note });
        return response.data;
    } catch (error: any) {
        throw error;
    }
}



// get note v2/shoe-orders/get-notes/{{order Id}}
export const getMassschuheOrderNote = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/get-notes/${orderId}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// update note v2/shoe-orders/update-order/:id "supply_note": "Hello"
export const updateMassschuheOrderNote = async (orderId: string, supply_note: string) => {
    try {
        const response = await axiosClient.patch(`/v2/shoe-orders/update-order/${orderId}`, { supply_note });
        return response.data.success;
    } catch (error: any) {
        throw error;
    }
};


// delete single image v2/shoe-orders/remove-file/98bd0578-f4fc-4ca3-8d21-027bf807bb21
export const deleteMassschuheOrderImage = async (id: string) => {
    try {
        const response = await axiosClient.delete(`/v2/shoe-orders/remove-file/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

const MassschuheAddedApisDefault = {
    getMassschuheOrderById,
    getMassschuheOrderDetails,
    updateMassschuheOrderStatus,
    getAllMassschuheOrders,
    createMassschuheOrderV2,
};
export default MassschuheAddedApisDefault;