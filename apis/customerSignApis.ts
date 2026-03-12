import axiosClient from "@/lib/axiosClient";

// Create customer sign (upload signature + pdf)
export const createCustomerSign = async (customerId: string, formData: FormData) => {
    try {
        const response = await axiosClient.post(`/v2/customers-sign/create/${customerId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get customer sign details
export const getCustomerSignDetails = async (customerId: string) => {
    try {
        const response = await axiosClient.get(`/v2/customers-sign/get-details/${customerId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
