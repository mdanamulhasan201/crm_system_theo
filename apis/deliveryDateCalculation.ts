import axiosClient from "@/lib/axiosClient";
// custom_shafts/delivery-dates/get

export const getDeliveryDates = async () => {
    try {
        const response = await axiosClient.get('/custom_shafts/delivery-dates/get')
        return response.data;
    } catch (error) {
        console.error('Error fetching delivery dates:', error);
        throw error;
    }
}
