import axiosClient from "@/lib/axiosClient";


// create auftragszettel v2/order_settings/manage
export const createAuftragszettel = async (orderSettingsData: any) => {
    try {
        const response = await axiosClient.patch('/v2/order_settings/manage', orderSettingsData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
}


// get auftragszettel v2/order_settings/manage
export const getAuftragszettel = async () => {
    try {
        const response = await axiosClient.get('/v2/order_settings/manage');
        return response.data;
    } catch (error: any) {
        throw error;
    }
}