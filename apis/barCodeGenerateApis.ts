import axiosClient from "@/lib/axiosClient";

//generate bar code data get /customer-orders/barcode-label/id
export const getBarCodeData = async (id: string) => {
    try {
        const response = await axiosClient.get(`/customer-orders/barcode-label/${id}`);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

// send pdf to customer /customer-orders/upload-barcode-label/id
export const sendPdfToCustomer = async (id: string, pdfFile: Blob, fileName: string) => {
    try {
        const formData = new FormData();
        formData.append('image', pdfFile, fileName);

        const response = await axiosClient.post(`/customer-orders/upload-barcode-label/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

