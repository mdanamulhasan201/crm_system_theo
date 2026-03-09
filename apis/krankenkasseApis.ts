//  get all krankenkasse data v2/insurance/get-insurance-list

import axiosClient from "@/lib/axiosClient";

export interface KrankenkassePrescription {
    id: string;
    insurance_provider: string;
    prescription_number: string | null;
    proved_number: string | null;
    referencen_number: string | null;
    doctor_name: string;
    doctor_location: string;
    prescription_date: string;
    validity_weeks: number;
    establishment_number: string;
    aid_code: string;
}

export interface KrankenkasseCustomer {
    id: string;
    vorname: string;
    nachname: string;
    telefon: string | null;
}

export interface KrankenkasseOrderItem {
    id: string;
    orderNumber: number;
    paymnentType: string;
    totalPrice: number;
    insuranceTotalPrice: number;
    private_payed: boolean;
    insurance_status: string;
    createdAt: string;
    prescription: KrankenkassePrescription;
    customer: KrankenkasseCustomer;
    insuranceType: string;
}

export interface GetAllKrankenkasseResponse {
    success: boolean;
    type: string;
    data: KrankenkasseOrderItem[];
    /** Optional next cursor for cursor-based pagination (if not provided, use last item's createdAt) */
    nextCursor?: string;
}

export interface GetAllKrankenkasseParams {
    /** type: shoes | insole | empty for all */
    type?: string;
    /** Search query (KV-Nummer, Rezept-Nummer, etc.) */
    search?: string;
    /** insurance_status: pending | rejected | approved | sent | all (default) */
    insurance_status?: string;
    limit?: number;
    /** Cursor for next page (e.g. last item's createdAt) */
    cursor?: string;
}

// get-insurance-list?type=all&search=...&insurance_status=pending|rejected|approved|all&limit=20&cursor=...
export const getAllKrankenkasseData = async (
    params: GetAllKrankenkasseParams = {}
): Promise<GetAllKrankenkasseResponse> => {
    const {
        type = '',
        search = '',
        insurance_status = '',
        limit = 20,
        cursor = '',
    } = params;
    const searchParams = new URLSearchParams({
        type: String(type),
        search: String(search),
        insurance_status: String(insurance_status),
        limit: String(limit),
        cursor: String(cursor),
    });
    const response = await axiosClient.get<GetAllKrankenkasseResponse>(
        `/v2/insurance/get-insurance-list?${searchParams.toString()}`
    );
    return response.data;
}






/** Single prescription item from get-all (id-based, for linking to order) */
export interface KrankenkassePrescriptionListItem {
    id: string;
    insurance_provider: string;
    insurance_number: string;
    medical_diagnosis: string;
    prescription_date: string;
    proved_number: string | null;
    referencen_number: string | null;
    validity_weeks: number;
    createdAt: string;
}

export interface GetAllKrankenkassePrescriptionResponse {
    success: boolean;
    message: string;
    data: KrankenkassePrescriptionListItem[];
    hasMore: boolean;
    prescription_date_3week: string;
}

// v2/insurance/prescription/get-all?customerId=...&prescriptionDate3Week=yes|no&limit=5&cursor=...
export const getAllKrankenkassePrescription = async (
    customerId: string,
    prescriptionDate3Week: boolean,
    limit: number,
    cursor: string
): Promise<GetAllKrankenkassePrescriptionResponse> => {
    const params = new URLSearchParams({
        customerId,
        prescriptionDate3Week: prescriptionDate3Week ? 'yes' : 'no',
        limit: String(limit),
        ...(cursor ? { cursor } : {}),
    });
    const response = await axiosClient.get<GetAllKrankenkassePrescriptionResponse>(
        `/v2/insurance/prescription/get-all?${params.toString()}`
    );
    return response.data;
}


// v2/insurance/manage-prescription

// body:
// {
//     "type": "insole",
//     "orderId": "6a0aede9-bcac-46db-b8f0-19a4eeb00a0e",
//     "prescriptionId": "cmmafu55v0001kuq74qk210na"
// }
export const manageKrankenkassePrescription = async (type: string, orderId: string, prescriptionId: string) => {
    try {
        const response = await axiosClient.post(`/v2/insurance/manage-prescription`, { type, orderId, prescriptionId });
        return response.data;
    } catch (error) {
        throw error;
    }
}


/** Rejected item from validate-insurance-changelog */
export interface ValidateChangelogRejectedItem {
    rowIndex: number;
    orderNumber: number;
    type: string | null;
    reason: string;
    message: string;
    excelData?: { orderNumber: number; betrag?: number | null };
    excelPrice?: number;
    dbPrice?: number;
    order?: KrankenkasseOrderItem;
}

export interface ValidateChangelogResponse {
    success: boolean;
    message: string;
    approved: KrankenkasseOrderItem[];
    rejected: ValidateChangelogRejectedItem[];
    summary: { total: number; approved: number; rejected: number };
}

// file upload v2/insurance/validate-insurance-changelog (multipart/form-data)
export const validateInsuranceChangelog = async (file: File): Promise<ValidateChangelogResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<ValidateChangelogResponse>(
        '/v2/insurance/validate-insurance-changelog',
        formData
    );
    return response.data;
}