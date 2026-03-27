"use client";

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { createOrder as createOrderApi, pdfSendToCustomer, customOrderCreate } from '@/apis/productsOrder';

export const useCreateOrder = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    const createOrder = useCallback(async (customerId: string, versorgungId: string, werkstattzettelId?: string) => {
        setIsCreating(true);
        setLastOrderId(null);
        try {
            const response = await createOrderApi(customerId, versorgungId, werkstattzettelId);
            setLastOrderId((response as any)?.data?.id ?? (response as any)?.id ?? response?.orderId);
            try { if (typeof window !== 'undefined') localStorage.removeItem('werkstattzettelId'); } catch { }
            toast.success('Order created successfully');
            return response;
        } catch (error: any) {
            console.error('Failed to create order', error);
            const errData = error?.response?.data;
            const isSuggestFlow = errData?.suggestSupplyAndStock === true;
            const isManualFootLengthFlow = errData?.requiresManualFootLength === true;
            if (!isSuggestFlow && !isManualFootLengthFlow) {
                const apiMessage = errData?.message || error?.message || 'Failed to create order';
                toast.error(apiMessage);
            }
            throw error;
        } finally {
            setIsCreating(false);
        }
    }, []);

    const createOrderAndGeneratePdf = useCallback(async (customerId: string, versorgungId: string, autoSendToCustomer: boolean = false, formData?: Record<string, any>) => {
        setIsCreating(true);
        setLastOrderId(null);
        try {
            const werkstattzettelId = typeof window !== 'undefined' ? localStorage.getItem('werkstattzettelId') || undefined : undefined;
            // Include formData in the API call if provided
            const response = await createOrderApi(customerId, versorgungId, werkstattzettelId, formData);
            const orderId = (response as any)?.data?.id ?? (response as any)?.id ?? response?.orderId;
            if (!orderId) {
                throw new Error('Order ID not received from API');
            }
            setLastOrderId(orderId);
            try { if (typeof window !== 'undefined') localStorage.removeItem('werkstattzettelId'); } catch { }

            // Inform user immediately that the order was created
            toast.success('Order created successfully!');
            // Allow UI (e.g. confirmation modal button) to stop showing loading
            setIsCreating(false);

            return response;
        } catch (error: any) {
            console.error('Failed to create order', error);
            const errData = error?.response?.data;
            const isSuggestFlow = errData?.suggestSupplyAndStock === true;
            const isManualFootLengthFlow = errData?.requiresManualFootLength === true;
            if (!isSuggestFlow && !isManualFootLengthFlow) {
                const apiMessage = errData?.message || error?.message || 'Failed to create order';
                toast.error(apiMessage);
            }
            throw error;
        } finally {
            setIsCreating(false);
        }
    }, []);

    const generatePdfFromInvoicePage = useCallback(async (_orderId: string) => {
        // PDF generation is now handled via InvoiceGeneratePdfModal (Werkstattzettel design)
    }, []);

    const sendPdfToCustomer = useCallback(async (orderId: string) => {
        try {
            await pdfSendToCustomer(orderId, new FormData());
        } catch (error) {
            console.error('Failed to send PDF to customer', error);
            throw error;
        }
    }, []);


    // custom order create
    const customOrderCreates = useCallback(async (customerId: string, payload: Record<string, any>) => {
        try {
            const res = await customOrderCreate(customerId, payload);
            return res;
        } catch (error) {
            console.error('Failed to create custom order', error);
            throw error;
        }
    }, []);

    return {
        createOrder,
        createOrderAndGeneratePdf,
        generatePdfFromInvoicePage,
        sendPdfToCustomer,
        isCreating,
        lastOrderId,
        customOrderCreates
    } as const;
};


