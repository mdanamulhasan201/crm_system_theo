import axiosClient from "@/lib/axiosClient";

/** Optional employee assigned to the store for pickup / appointments (from API). */
export type StoreLocationEmployee = {
    id: string;
    employeeName: string;
    email?: string;
    accountName?: string;
    image?: string | null;
};

export type StoreLocation = {
    id: string;
    address: string;
    description?: string;
    isPrimary?: boolean;
    shop_open?: string;
    shop_close?: string;
    createdAt?: string;
    employees?: StoreLocationEmployee | null;
};

export type StoreLocationsListResponse = {
    success?: boolean;
    message?: string;
    /** Some error payloads use this instead of message */
    error?: string;
    data?: StoreLocation[];
    pagination?: {
        totalItems?: number;
        totalPages?: number;
        currentPage?: number;
        itemsPerPage?: number;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
    };
};

//  create location
export const createLocation = async (location: any) => {
    try {
        const response = await axiosClient.post('/customer-settings/store-locations', location);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get all locations customer-settings/store-locations?page=1&limit=2
export const getAllLocations = async (
    page: number,
    limit: number
): Promise<StoreLocationsListResponse> => {
    try {
        const response = await axiosClient.get<StoreLocationsListResponse>(
            `/customer-settings/store-locations?page=${page}&limit=${limit}`
        );
        const data = response.data;

        if (data?.success === false) {
            const error = new Error(
                data?.message || data?.error || "Failed to fetch locations"
            );
            (error as Error & { response?: { data: unknown } }).response = { data };
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
};

const LOCATIONS_PAGE_SIZE = 50;

/** Loads every page until `hasNextPage` is false (for dropdowns). */
export async function fetchAllStoreLocations(): Promise<StoreLocation[]> {
    const all: StoreLocation[] = [];
    let page = 1;
    for (;;) {
        const res = await getAllLocations(page, LOCATIONS_PAGE_SIZE);
        const batch = res?.data;
        if (Array.isArray(batch)) all.push(...batch);
        if (!res?.pagination?.hasNextPage) break;
        page += 1;
        if (page > 500) break;
    }
    return all;
}

// delete location customer-settings/store-locations/6af7a47c-e0d9-4e63-b791-0325a5c2c5e8
export const deleteLocation = async (id: string) => {
    try {
        const response = await axiosClient.delete(`/customer-settings/store-locations/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
// customer-settings/store-locations/fdefe5a1-e60a-4b56-9ff0-1ac703e32a5c
// {
//     "isPrimary": true
// }
export const updateLocation = async (id: string, location: any) => {
    try {
        const response = await axiosClient.patch(`/customer-settings/store-locations/${id}`, location);
        return response.data;
    } catch (error) {
        throw error;
    }
}