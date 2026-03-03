import axiosClient from "@/lib/axiosClient";

/** Request body for creating a prescription (v2/insurance/prescription/create) */
export interface CreateRecipeBody {
    customerId: string;
    insurance_provider: string;
    insurance_number: string;
    prescription_date: string; // ISO e.g. "2026-03-01T00:00:00.000Z"
    prescription_number: string;
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

// create recipe v2/insurance/prescription/create
export const createRecipe = async (recipeData: CreateRecipeBody) => {
    try {
        const response = await axiosClient.post('/v2/insurance/prescription/create', recipeData);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// update recipe v2/insurance/prescription/update/cmma3nz6t0001kuxei9p4fm4b
export const updateRecipe = async (recipeId: string, recipeData: any) => {
    try {
        const response = await axiosClient.put(`/v2/insurance/prescription/update/${recipeId}`, recipeData);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// delete recipe v2/insurance/prescription/delete/cmma3nz6t0001kuxei9p4fm4b
export const deleteRecipe = async (recipeId: string) => {
    try {
        const response = await axiosClient.delete(`/v2/insurance/prescription/delete/${recipeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// get single recipe v2/insurance/prescription/get-all?customerId=8316981a-496d-4207-ac7e-925a5473bf05
export const getRecipe = async (customerId: string) => {
    try {
        const response = await axiosClient.get(`/v2/insurance/prescription/get-all?customerId=${customerId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// v2/insurance/prescription/get-details/cmma3vnnf0003kuxeg445hrlp
export const getSingleRecipe = async (recipeId: string) => {
    try {
        const response = await axiosClient.get(`/v2/insurance/prescription/get-details/${recipeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

