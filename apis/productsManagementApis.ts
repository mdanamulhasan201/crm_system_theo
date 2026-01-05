import axiosClient from "@/lib/axiosClient";

// create product
export const createProduct = async (productData: any) => {
    try {
        const response = await axiosClient.post('/store/create', productData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// get all storages /store/my/get?page=1&limit=10&search
export const getAllStorages = async (page: number, limit: number, search: string) => {
    try {
        const response = await axiosClient.get(`/store/my/get?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};





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

// update storage /store/update/9082a642-7a88-4b5c-a34c-9ad08c062c82

export const updateStorage = async (storageId: string, storageData: any) => {
    try {
        const response = await axiosClient.patch(`/store/update/${storageId}`, storageData);
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



// chart data 
export const getChartData = async () => {
    try {
        const response = await axiosClient.get('/store/chart-data');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// /store/performer quary?type=low and ?type=top
export const getPerformanceData = async (type: 'low' | 'top') => {
    try {
        const response = await axiosClient.get(`/store/performer?type=${type}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


