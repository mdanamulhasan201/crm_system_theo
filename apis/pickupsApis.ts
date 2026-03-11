import axiosClient from "@/lib/axiosClient";

export type PickupProductType = 'shoes' | 'insole' | 'all';

export interface PickupOrder {
    id: string;
    orderNumber: number;
    createdAt: string;
    fertigstellungBis: string;
    bezahlt: string;
    orderStatus: string;
    totalPrice: number;
    customer: {
        id: string;
        vorname: string;
        nachname: string;
        customerNumber: number;
    };
    type: string;
}

export interface PickupOrderDetail {
    orderId: string;
    orderNumber: number;
    customerName: string;
    product: {
        name: string;
        description: string;
    };
    pickupDate: string;
    paymentType: string;
    paymentMethod: string;
    paymentOutstanding: boolean;
    paymentOutstandingMessage: string;
    payment: {
        total: number;
        insurance: number;
        coPayment: number;
        paid: number;
        remaining: number;
    };
    status: string;
    orderStatus: string;
    timeline: Array<{
        statusFrom: string | null;
        statusTo: string;
        changedAt: string;
        durationMs: number;
    }>;
    notes: string;
    canPay: boolean;
    canMarkAsPickedUp: boolean;
    canSendReminder: boolean;
    type: string;
}

export interface PickupsListResponse {
    success: boolean;
    message: string;
    data: PickupOrder[];
    pagination: {
        limit: number;
        hasNextPage: boolean;
        nextCursor: string | null;
    };
}

export interface PickupDetailResponse {
    success: boolean;
    message: string;
    data: PickupOrderDetail;
}

export const getAllPickups = async (productType: PickupProductType, cursor?: string): Promise<PickupsListResponse> => {
    try {
        const params = new URLSearchParams({ productType });
        if (cursor) params.set('cursor', cursor);
        const response = await axiosClient.get(`/v2/pickups/get-all-pickup?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPickupDetails = async (id: string, type: string): Promise<PickupDetailResponse> => {
    try {
        const response = await axiosClient.get(`/v2/pickups/get-details/${id}?type=${type}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export type FeedbackReact = 'Like' | 'Dislike';

export const submitOrderFeedback = async (
    orderId: string,
    type: 'insole' | 'shoes',
    react: FeedbackReact,
    note?: string,
) => {
    try {
        const payload: { FeedbackReact: FeedbackReact; note?: string } = { FeedbackReact: react };
        if (note) payload.note = note;
        const response = await axiosClient.post(`/v2/order-feedback/manage/${orderId}?type=${type}`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ===================== Receipts =====================

export interface PosReceipt {
    id: string;
    orderId: string;
    orderType: string;
    paymentMethod: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
    subtotal: number;
    // Fiskaly SIGN IT fields (Italian fiscal compliance)
    fiskalyRecordId: string | null;
    fiskalyIntentionId: string | null;
    fiskalySignature: string | null;
    fiscalizedAt: string | null;
    fiskalyMetadata: any;
    // Stornierung (cancellation) fields
    storniert: boolean;
    storniertAt: string | null;
    storniertRecordId: string | null;
    storniertIntentionId: string | null;
    // Legacy TSE fields (German KassenSichV — kept for old receipts)
    fiskalyTxId: string | null;
    fiskalyTxNumber: number | null;
    fiskalyTssSerialNumber: string | null;
    fiskalyClientSerialNumber: string | null;
    fiskalyTimeStart: string | null;
    fiskalyTimeEnd: string | null;
    fiskalySignatureValue: string | null;
    fiskalySignatureAlgorithm: string | null;
    fiskalySignatureCounter: number | null;
    fiskalySignaturePublicKey: string | null;
    fiskalyQrCodeData: string | null;
    receiptData: {
        company: {
            companyName: string;
            address: string;
            phone: string;
            vatNumber: string;
        };
        transaction: {
            order: string;
            customer: string;
        };
        product: {
            description: string;
            quantity: number;
            unitPrice: number;
            itemTotal: number;
        };
        financial: {
            subtotal: number;
            vatRate: number;
            vatAmount: number;
            total: number;
        };
        servedBy: string;
    } | null;
    partnerId: string | null;
    employeeId: string | null;
    createdAt: string;
    updatedAt: string;
}

export const processPayment = async (
    orderId: string,
    type: 'insole' | 'shoes',
    pickup: boolean = true,
) => {
    try {
        const response = await axiosClient.post(
            `/v2/pickups/handcash-payment/${orderId}?type=${type}&pickup=${pickup}`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createSignedReceipt = async (
    orderId: string,
    type: 'insole' | 'shoes',
    paymentMethod: 'CASH' | 'NON_CASH',
): Promise<{ success: boolean; data: PosReceipt }> => {
    try {
        const response = await axiosClient.post(
            `/v2/receipts/create/${orderId}?type=${type}&paymentMethod=${paymentMethod}`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getReceiptByOrder = async (
    orderId: string,
    type: 'insole' | 'shoes',
): Promise<{ success: boolean; data: PosReceipt }> => {
    try {
        const response = await axiosClient.get(
            `/v2/receipts/by-order/${orderId}?type=${type}`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const emailReceipt = async (
    receiptId: string,
    email: string,
) => {
    try {
        const response = await axiosClient.post(
            `/v2/receipts/email/${receiptId}`,
            { email },
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const cancelReceipt = async (
    receiptId: string,
): Promise<{ success: boolean; data: PosReceipt }> => {
    try {
        const response = await axiosClient.post(
            `/v2/receipts/cancel/${receiptId}`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const listReceipts = async (
    page = 1,
    limit = 50,
): Promise<{ success: boolean; data: PosReceipt[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    try {
        const response = await axiosClient.get(`/v2/receipts/list?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
