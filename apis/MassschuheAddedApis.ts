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



// without order id post massschuhe custom_shafts/create?custom_models=
export const createMassschuheWithoutOrderId = async (massschuheData: any) => {
    try {
        const response = await axiosClient.post('/custom_shafts/create?custom_models=true', massschuheData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// without order id post massschuhe custom_shafts/create?custom_models=
export const createMassschuheWithoutOrderIdWithoutCustomModels = async (massschuheData: any) => {
    try {
        const response = await axiosClient.post('/custom_shafts/create?custom_models=false', massschuheData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}