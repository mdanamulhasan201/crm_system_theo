import axiosClient from "@/lib/axiosClient";

//  create location
export const createLocation = async (location: any) => {
    try {
        const response = await axiosClient.post('/customer-settings/store-locations', location);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get all locations customer-settings/store-locations?page=1&limit=2
export const getAllLocations = async (page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/customer-settings/store-locations?page=${page}&limit=${limit}`);
        const data = response.data;
        
        // Check if the response indicates an error
        if (data?.success === false) {
            const error = new Error(data?.message || data?.error || 'Failed to fetch locations');
            (error as any).response = { data };
            throw error;
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// delete location customer-settings/store-locations/6af7a47c-e0d9-4e63-b791-0325a5c2c5e8
export const deleteLocation = async (id: string) => {
    try {
        const response = await axiosClient.delete(`/customer-settings/store-locations/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
// customer-settings/store-locations/fdefe5a1-e60a-4b56-9ff0-1ac703e32a5c
// {
//     "isPrimary": true
// }
export const updateLocation = async (id: string, location: any) => {
    try {
        const response = await axiosClient.patch(`/customer-settings/store-locations/${id}`, location);
        return response.data;
    } catch (error) {
        throw error;
    }
}