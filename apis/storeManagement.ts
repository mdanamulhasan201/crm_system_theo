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


// ======Manufacturer Management===============/store/admin-store/search-brand-store?page=1&limit=10&search=&
// type=milling_block or rady_insole

// get all manufacturers
export const getAllManufacturers = async (page: number, limit: number, search: string, type: string) => {
    try {
        const response = await axiosClient.get(`/store/admin-store/search-brand-store?page=${page}&limit=${limit}&search=${search}&type=${type}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// get single manufacturer /store/admin-store/get-brand-store/42d5eb66-8d60-4934-ad6a-b772e32c44
export const getSingleManufacturer = async (id: string) => {
    try {
        const response = await axiosClient.get(`/store/admin-store/get-brand-store/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// ==================================
// Sonstiges (Stock Material)
// ==================================

export interface SonstigesCreateBody {
    manufacturer: string
    delivery_business: string
    article: string
    ein: string
    quantity: number
    value: number
}

export interface SonstigesItem {
    id: string
    partnerId: string
    manufacturer: string
    delivery_business: string
    article: string
    ein: string
    quantity: number
    value: number
    createdAt: string
    updatedAt: string
}

// create sonstiges POST /stock-material/create
export const createSonstiges = async (body: SonstigesCreateBody) => {
    try {
        const response = await axiosClient.post(`/v2/stock-material/create`, body);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// get all sonstiges GET /stock-material/get-all?limit=&cursor=&search=
export const getAllSonstiges = async (limit: number, cursor: string, search: string) => {
    try {
        const response = await axiosClient.get(`/v2/stock-material/get-all?limit=${limit}&cursor=${cursor}&search=${search}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


// get single sonstiges v2/stock-material/get-details/18708ea2-1a0a-4474-975f-4d2562e8fcd1
export const getSingleSonstiges = async (id: string) => {
    try {
        const response = await axiosClient.get(`/v2/stock-material/get-details/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// update sonstiges }v2/stock-material/update/18708ea2-1a0a-4474-975f-4d2562e8fcd1
export const updateSonstiges = async (id: string, body: SonstigesCreateBody) => {
    try {
        const response = await axiosClient.patch(`/v2/stock-material/update/${id}`, body);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

// delete sonstiges v2/stock-material/delete
// -req.body: {
//     "ids": ["18708ea2-1a0a-4474-975f-4d2562e8fcd1", "321d7655-9ce9-4b2c-a514-19db5f46589c"]
// }
export const deleteSonstiges = async (body: { ids: string[] }) => {
    try {
        const response = await axiosClient.delete('/v2/stock-material/delete/', { data: body });
        return response.data;
    } catch (error: any) {
        throw error;
    }
}