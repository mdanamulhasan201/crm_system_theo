import axiosClient from "@/lib/axiosClient";

// get all custom shafts all shoes 
export const getAllCustomShafts = async (page: number, limit: number, search: string, gender: string, category: string, sortPrice: string) => {
    try {
        const response = await axiosClient.get(`/custom_shafts/mabschaft_kollektion?page=${page}&limit=${limit}&search=${search}&gender=${gender}&category=${category}&sortPrice=${sortPrice}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// single custom shaft
export const getSingleCustomShaft = async (id: string) => {
    try {
        const url = `/custom_shafts/mabschaft_kollektion/${id}`;
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get search custom shafts
export const getSearchCustom = async (search: string) => {
    try {
        const url = `/customers/search?search=${search}`;
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// create custom shaft /massschuhe-order/admin-order/send-to-admin-2-order/:orderId
export const createCustomShaft = async (orderId: string, formData: FormData) => {
    try {
        const url = `/massschuhe-order/admin-order/send-to-admin-2-order/${orderId}`;
        const response = await axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}