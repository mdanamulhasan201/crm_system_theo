//  get all krankenkasse data v2/insurance/get-insurance-list

import axiosClient from "@/lib/axiosClient";

export interface KrankenkassePrescription {
    id: string;
    customerId?: string;
    insurance_provider: string;
    insurance_number?: string | null;
    prescription_number: string | null;
    proved_number: string | null;
    referencen_number: string | null;
    doctor_name: string;
    doctor_location: string;
    prescription_date: string;
    validity_weeks: number;
    establishment_number: string;
    practice_number?: string | null;
    aid_code: string;
    medical_diagnosis?: string | null;
    type_of_deposit?: string | null;
    cost_bearer_id?: string | null;
    status_number?: string | null;
    is_work_accident?: boolean;
    createdAt?: string;
    image?: string | null;
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
    /** Null when no prescription linked yet */
    prescription: KrankenkassePrescription | null;
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
    /** Arzt / Verordner name (when returned by API) */
    doctor_name?: string | null;
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


/** Rejected item (legacy Excel validation shape; kept for reference) */
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

/** Order row returned from validate-insurance-changelog?response=simple */
export interface InsuranceChangelogMatchOrder extends KrankenkasseOrderItem {
    vatRate?: number;
}

export interface InsuranceChangelogPartialOrder extends InsuranceChangelogMatchOrder {
    problemFields: string[];
}

/** Response from POST /v2/insurance/validate-insurance-changelog?response=simple (multipart field: excl) */
export interface ValidateChangelogResponse {
    success: boolean;
    matched: InsuranceChangelogMatchOrder[];
    matchCount: number;
    partialMatched: InsuranceChangelogPartialOrder[];
    partialMatchCount: number;
}

// body: excl upload v2/insurance/validate-insurance-changelog?response=simple (multipart/form-data)
export const validateInsuranceChangelog = async (file: File): Promise<ValidateChangelogResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<ValidateChangelogResponse>(
        '/v2/insurance/validate-insurance-changelog?response=simple',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
}

// approved /v2/insurance/approved-data
// body: JSON.stringify({
//     approvedIds: [{ id: orderId, type: "insole" }],
//     rejectedIds: [{ id: otherOrderId, type: "shoe" }],
//   }),
export const approvedKrankenkasseData = async (approvedIds: { id: string, type: string }[], rejectedIds: { id: string, type: string }[]) => {
    const response = await axiosClient.post(`/v2/insurance/approved-data`, {
        approvedIds,
        rejectedIds,
    });
    return response.data;
}


// get card daya v2/insurance/get-calculation-extra

export const getCalculationExtraData = async () => {
    try {
        const response = await axiosClient.get(`/v2/insurance/get-calculation-extra`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /v2/insurance/get-calculation
export const getCalculationData = async () => {
    try {
        const response = await axiosClient.get(`/v2/insurance/get-calculation`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// /v2/insurance/bulk-insurance-status

// body: {
//   "ids": ["cmnk6a3ql000080kurrp1xp48", "cmnk62kn60000qvkusxifd206"],
//   "status": "pending" | "approved" | "rejected"
// }

export const bulkInsuranceStatus = async (ids: string[], status: string) => {
    try {
    const response = await axiosClient.patch(`/v2/insurance/bulk-insurance-status`, {
            ids,
            status,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}



/** GET /v2/insurance/doctor-info?type=shoe|insole&id={orderId} */
export interface DoctorInfoData {
    arzt: string;
    ortArzt: string;
    arztnummer: string;
    betriebsstaettennummer: string | null;
}

export interface DoctorInfoResponse {
    success: boolean;
    data: DoctorInfoData;
}

export const getDoctorInfo = async (
    type: string,
    id: string
): Promise<DoctorInfoResponse> => {
    const params = new URLSearchParams({
        type: String(type),
        id: String(id),
    });
    const response = await axiosClient.get<DoctorInfoResponse>(
        `/v2/insurance/doctor-info?${params.toString()}`
    );
    return response.data;
};

/** Maps list `insuranceType` (e.g. shoes / insole) to API `type` query value */
export function mapInsuranceTypeToDoctorInfoApiType(insuranceType: string): 'shoe' | 'insole' {
    const t = (insuranceType || '').toLowerCase();
    if (t === 'shoes' || t === 'shoe') return 'shoe';
    return 'insole';
}