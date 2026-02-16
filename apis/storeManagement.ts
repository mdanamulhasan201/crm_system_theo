import axiosClient from "@/lib/axiosClient";



// buy store /store/buy in body {admin_store_id: string}
export const buyStore = async (body: { admin_store_id: string }) => {
    try {
        const response = await axiosClient.post(`/store/buy`, body);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// get mybuy stores /store/my/get?page=&limit=&search=&type=milling_block or rady_insole
export const getMyBuyStores = async (page: number, limit: number, search: string, type: string) => {
    try {
        const response = await axiosClient.get(`/store/my/get?page=${page}&limit=${limit}&search=${search}&type=${type}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}



// get all stores store/admin-store/get-all?psge=1&limit=1&search=d&type=milling_block or rady_insole
export const getAllStores = async (page: number, limit: number, search: string, type: string) => {
    try {
        const response = await axiosClient.get(`/store/admin-store/get-all?page=${page}&limit=${limit}&search=${search}&type=${type}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// /store/admin-store/get/:id
export const getSingleStore = async (id: string) => {
    try {
        const response = await axiosClient.get(`/store/admin-store/get/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// Lager hinzufügen store/add-storage

export const addStorage = async (body: { admin_store_id: string }) => {
    try {
        const response = await axiosClient.post(`/store/add-storage`, body);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}




// get product history 
export const getProductHistory = async (productId: string, page: number = 1, limit: number = 10) => {
    try {
        const response = await axiosClient.get(`/store/history/${productId}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// get single storage
export const getSingleStorage = async (storageId: string) => {
    try {
        const response = await axiosClient.get(`/store/get/${storageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};



// delete storage
export const deleteStorage = async (storageId: string) => {
    try {
        const response = await axiosClient.delete(`/store/delete/${storageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
