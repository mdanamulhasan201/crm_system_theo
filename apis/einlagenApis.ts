import axiosClient from "@/lib/axiosClient";

// create einlage (insole)
export const createEinlage = async (formData: FormData) => {
    try {
        const response = await axiosClient.post('/versorgungen/supply-status', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get all einlagen
export const getAllEinlagen = async (page: number, limit: number) => {
    try {
        const response = await axiosClient.get(`/versorgungen/supply-status?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// get einlage by id
export const getEinlageById = async (id: string) => {
    try {
        const response = await axiosClient.get(`/versorgungen/supply-status/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// update einlage
export const updateEinlage = async (id: string, formData: FormData) => {
    try {
        const response = await axiosClient.patch(`/versorgungen/supply-status/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// delete einlage
export const deleteEinlage = async (id: string) => {
    try {
        const response = await axiosClient.delete(`/versorgungen/supply-status/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
