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