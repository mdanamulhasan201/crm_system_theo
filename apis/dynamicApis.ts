import axiosClient from "@/lib/axiosClient";

// get all dynamic routes /v2/feature-access/partner-feature
export const getAllDynamicRoutes = async () => {
    try {
        const response = await axiosClient.get('/v2/feature-access/partner-feature');
        return response.data;
    } catch (error) {
        throw error;
    }
}