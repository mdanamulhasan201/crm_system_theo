import axiosClient from "@/lib/axiosClient";

// location?query={{LOCATION}}

export const getLocation = async (location: string) => {
    try {
        const response = await axiosClient.get(`/location?query=${location}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}