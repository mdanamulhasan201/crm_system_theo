
import axiosClient from "@/lib/axiosClient";

// partner/set-password/823941a6-9338-44bf-9e13-fc7ae18a733b
// body te password jabe { password: string }
export const setPassword = async (id: string, password: { password: string }) => {
    try {
        const response = await axiosClient.patch(`/partner/set-password/${id}`, password);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response.data.message);
    }
}