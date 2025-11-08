import axiosClient from "@/lib/axiosClient";


// get kundenordner data /customer-files/get/cccb741b-74e2-4584-ac1f-2fd95deaa03d?page=&limit=

export const getKundenordnerData = async (customerId: string, page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/customer-files/get/${customerId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
