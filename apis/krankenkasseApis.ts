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