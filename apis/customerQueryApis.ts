import axiosClient from "@/lib/axiosClient";

export interface CustomerQuery {
    productId?: string;
    productName?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    query: string;
    queryType?: 'product_inquiry' | 'general' | 'support';
}

// Submit a customer query (this will create a notification in the dashboard)
export const submitCustomerQuery = async (queryData: CustomerQuery) => {
    try {
        const response = await axiosClient.post('/customer-queries', queryData);
        return response.data;
    } catch (error: any) {
        console.error('Error submitting query:', error);
        throw new Error(error.response?.data?.message || 'Failed to submit query');
    }
}

// Get all customer queries (for dashboard)
export const getAllCustomerQueries = async ({
    page = 1,
    limit = 10,
    status = 'all'
}: {
    page?: number;
    limit?: number;
    status?: 'all' | 'pending' | 'resolved';
} = {}) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (status !== 'all') queryParams.append('status', status);

        const response = await axiosClient.get(`/customer-queries?${queryParams}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching queries:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch queries');
    }
}
