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

// get all versorgungen  versorgungen?status=Businesseinlagen&page=1&limit=5&diagnosis_status=HOHLFUSS
export const getAllVersorgungen = async (status: string, page: number, limit: number, diagnosis_status: string) => {
    try {
        const response = await axiosClient.get(`/versorgungen?status=${status}&page=${page}&limit=${limit}&diagnosis_status=${diagnosis_status}`);
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


