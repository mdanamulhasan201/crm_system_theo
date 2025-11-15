import axiosClient from "@/lib/axiosClient";


// get kundenordner data /customer-files/get/cccb741b-74e2-4584-ac1f-2fd95deaa03d?page=&limit=&table=custom_shafts

export const getKundenordnerData = async (customerId: string, page: number, limit: number, table?: string) => {
    try {
        const params: any = {
            id: customerId,
            page,
            limit,
        };
        
        if (table) {
            params.table = table;
        }

        const response = await axiosClient.get('/customer-files/get', {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}



// delete kundenordner data
export const deleteKundenordnerData = async (payload: {
    fieldName: string
    table: string
    url: string
    id: string
}) => {
    try {
        const response = await axiosClient.delete('/customer-files/delete', {
            data: payload,
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}


//  upload kundenordner data /customer-files/create/cccb741b-74e2-4584-ac1f-2fd95deaa03d 
export const uploadKundenordnerData = async (customerId: string, file: File) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axiosClient.post(`/customer-files/create/${customerId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}