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


// get mybuy stores /store/my/get?page=&limit=
export const getMyBuyStores = async (page: number, limit: number, search: string) => {
    try {
        const response = await axiosClient.get(`/store/my/get?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}



// get all stores store/admin-store/get-all?psge=1&limit=1&search=d
export const getAllStores = async (page: number, limit: number, search: string) => {
    try {
        const response = await axiosClient.get(`/store/admin-store/get-all?page=${page}&limit=${limit}&search=${search}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

