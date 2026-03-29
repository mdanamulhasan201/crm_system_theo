import axiosClient from "@/lib/axiosClient";

//  post status of PostAutomatischeOrdersStatus

// {
//     "orthotech": true,
//     "opannrit": true
// }
export const getAutomatischeOrders = async (status: {
    orthotech: boolean;
    opannrit: boolean;
}) => {
    try {
        const response = await axiosClient.post('/partner/manage-partner-settings', status);
        return response.data;
    } catch (error) {
        throw error;
    }
}
//  get AutomatischeOrdersStatus
export const getAutomatischeOrdersStatus = async () => {
    try {
        const response = await axiosClient.get('/partner/manage-partner-settings');
        return response.data;
    } catch (error) {
        throw error;
    }
}


// }store/settings/get-all-brand
export const getAllBrand = async () => {
    try {
        const response = await axiosClient.get('/store/settings/get-all-brand');
        return response.data;
    } catch (error) {
        throw error;
    }
}

// POST /store/settings/toggle-brand/
// body: { brand: string; isActive: boolean; isPdf: boolean }
export const toggleBrand = async (body: {
    brand: string;
    isActive: boolean;
    isPdf: boolean;
}) => {
    try {
        const response = await axiosClient.post(`/store/settings/toggle-brand`, body);
        return response.data;
    } catch (error) {
        throw error;
    }
}

