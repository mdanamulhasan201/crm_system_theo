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

// massschuhe order create v2/shoe-orders/create / update order status 
export const createMassschuheOrderV2 = async (massschuheOrderData: any) => {
    try {
        const response = await axiosClient.post('/v2/shoe-orders/create', massschuheOrderData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// v2/shoe-orders/order-step/massschafterstellung/cmmfxmk4o0001kuovio6a7z8z
export const updateMassschuheOrderStepMassschafterstellung = async (orderId: string, data: any) => {
    try {
        const response = await axiosClient.post(`/v2/shoe-orders/order-step/massschafterstellung/${orderId}`, data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// get data v2/shoe-orders/order-step/massschafterstellung/cmmfxmk4o0001kuovio6a7z8z?status=Schaft_fertigen
export const getMassschuheOrderStepMassschafterstellung = async (orderId: string, status: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/order-step/massschafterstellung/${orderId}?status=${status}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}




// v2/shoe-orders/track/active-button/cmmfxmk4o0001kuovio6a7z8z

// schafttyp v2/shoe-orders/track/active-button/cmmfxmk4o0001kuovio6a7z8z?schafttyp=intern | extern
export const getMassschuheOrderTrackActiveButtonSchafttyp = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/track/active-button/${orderId}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// Schafttyp  and Bodenkonstruktion  v2/shoe-orders/track/active-button/cmmfxmk4o0001kuovio6a7z8z?bodenkonstruktion=extern | extern?bodenkonstruktion= extern | extern
// v2/shoe-orders/track/active-button/cmmfxmk4o0001kuovio6a7z8z
export const getMassschuheOrderTrackActiveButtonSchafttyp2 = async (orderId: string, schafttyp: 'intern') => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/track/active-button/${orderId}?schafttyp=${schafttyp}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}
export const getMassschuheOrderTrackActiveButtonBodenkonstruktion = async (orderId: string, bodenkonstruktion: 'intern') => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/track/active-button/${orderId}?bodenkonstruktion=${bodenkonstruktion}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}










// v2/shoe-orders/order-step/bodenkonstruktion/cmmfxmk4o0001kuovio6a7z8z
export const updateMassschuheOrderStepBodenkonstruktion = async (orderId: string, data: any) => {
    try {
        const response = await axiosClient.post(`/v2/shoe-orders/order-step/bodenkonstruktion/${orderId}`, data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// v2/shoe-orders/order-step/bodenkonstruktion/cmmfxmk4o0001kuovio6a7z8z?status=Bodenerstellen
export const getMassschuheOrderStepBodenkonstruktion = async (orderId: string, status: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/order-step/bodenkonstruktion/${orderId}?status=${status}`);
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

// shoe-orders/manage-step4and5/{{orderId}}
export const manageMassschuheOrderStep4and5 = async (orderId: string, data: any) => {
    try {
        const response = await axiosClient.post(`/v2/shoe-orders/manage-step4and5/${orderId}`, data);
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

// v2/shoe-orders/track/kva-data/:orderId
export const getKvaData = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/track/kva-data/${orderId}`);
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



// make level pdf v2/shoe-orders/track/barcode-label/{{order if}}
export const makeLevelPdf = async (orderId: string) => {
    try {
        const response = await axiosClient.get(`/v2/shoe-orders/track/barcode-label/${orderId}`);
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