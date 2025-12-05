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


