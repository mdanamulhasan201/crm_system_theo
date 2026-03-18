import axiosClient from "@/lib/axiosClient";

/** Request body for creating a prescription (v2/insurance/prescription/create) */
export interface CreateRecipeBody {
    image: File;
    customerId: string;
    insurance_provider: string;
    insurance_number: string;
    prescription_date: string; // ISO e.g. "2026-03-01T00:00:00.000Z"
    prescription_number: string;
    proved_number: string;
    referencen_number: string;
    doctor_location: string;
    doctor_name: string;
    establishment_number: string;
    medical_diagnosis: string;
    type_of_deposit: string;
    validity_weeks: number;
    cost_bearer_id: string;
    status_number: string;
    aid_code: string;
    is_work_accident: boolean;
}

// create recipe v2/insurance/prescription/create form data 
export const createRecipe = async (formData: FormData) => {
    try {
        const response = await axiosClient.post('/v2/insurance/prescription/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/** Single prescription from get-all or get-details */
export interface Prescription {
    id: string;
    customerId?: string;
    image?: string;
    insurance_provider?: string;
    insurance_number?: string;
    prescription_date?: string;
    prescription_number?: string;
    proved_number?: string;
    referencen_number?: string;
    doctor_location?: string;
    doctor_name?: string;
    establishment_number?: string;
    medical_diagnosis?: string;
    type_of_deposit?: string;
    validity_weeks?: number;
    cost_bearer_id?: string;
    status_number?: string;
    aid_code?: string;
    is_work_accident?: boolean;
    createdAt?: string;
    [key: string]: unknown;
}

/** Backend response for get-all (v2/insurance/prescription/get-all) */
export interface GetRecipeResponse {
    success?: boolean;
    message?: string;
    data: Prescription[];
    hasMore?: boolean;
    nextCursor?: string;
}

// get all prescriptions — v2/insurance/prescription/get-all?customerId=...&cursor=...&limit=...
export const getRecipe = async (
    customerId: string,
    cursor?: string | null,
    limit?: number
): Promise<GetRecipeResponse> => {
    const params = new URLSearchParams({ customerId });
    if (cursor != null && cursor !== '') params.set('cursor', cursor);
    if (limit != null) params.set('limit', String(limit));
    const response = await axiosClient.get<GetRecipeResponse>(
        `/v2/insurance/prescription/get-all?${params.toString()}`
    );
    return response.data;
}






// update recipe v2/insurance/prescription/update/:recipeId
export const updateRecipe = async (recipeId: string, formData: FormData) => {
    try {
        const response = await axiosClient.patch(`/v2/insurance/prescription/update/${recipeId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// delete recipe v2/insurance/prescription/delete/:recipeId
export const deleteRecipe = async (recipeId: string) => {
    try {
        const response = await axiosClient.delete(`/v2/insurance/prescription/delete/${recipeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}




/** Backend response for get-details (v2/insurance/prescription/get-details/:id) */
export interface GetSingleRecipeResponse {
    success?: boolean;
    message?: string;
    data: Prescription;
}

// get single prescription details v2/insurance/prescription/get-details/:recipeId
export const getSingleRecipe = async (recipeId: string): Promise<GetSingleRecipeResponse> => {
    try {
        const response = await axiosClient.get<GetSingleRecipeResponse>(`/v2/insurance/prescription/get-details/${recipeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

