import axiosClient from "@/lib/axiosClient";

// create versorgung
export const createVersorgung = async (versorgungData: any) => {
    try {
        const response = await axiosClient.post('/versorgungen', versorgungData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get all versorgungen  versorgungen?status=&page=&limit=
export const getAllVersorgungen = async (status: string, page: number, limit: number,) => {
    try {
        const response = await axiosClient.get(`/versorgungen?status=${status}&page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get all versorgungen by supplyStatus.name (using status parameter)
export const getVersorgungenBySupplyStatusId = async (supplyStatusName: string, page: number , limit: number ) => {
    try {
        const response = await axiosClient.get(`/versorgungen?status=${supplyStatusName}&page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// update versorgung 
export const updateVersorgung = async (versorgungData: any) => {
    try {
        const response = await axiosClient.patch(`/versorgungen/${versorgungData.id}`, versorgungData);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// delete versorgung
export const deleteVersorgung = async (id: string) => {
    try {
        const response = await axiosClient.delete(`/versorgungen/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get single versorgung by id
export const getSingleStorageById = async (storageId: string) => {
    try {
        const response = await axiosClient.get(`/versorgungen/single/${storageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};




// /customers/supply-status/f51f6946-39a9-4541-8ce1-6ca52e676643?page=1&limit=1
export const getCustomersBySupplyStatusId = async (customerId: string, page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/customers/supply-status/${customerId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customers by supply status');
    }
}
