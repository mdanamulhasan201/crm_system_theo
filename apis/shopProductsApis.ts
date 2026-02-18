import axiosClient from "@/lib/axiosClient";

// Shop Product interface matching backend response
export interface ShopProduct {
    id: string;
    title: string;
    category: string;
    price: number;
    quantity: number;
    delivery_time: string;
    description: string;
    system_description?: string;
    image: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ShopProductsResponse {
    products: ShopProduct[];
    nextCursor: string | null;
    hasMore: boolean;
    total: number;
}

// Get all shop products with cursor-based pagination
export const getAllShopProducts = async (
    params?: {
        search?: string;
        cursor?: string;
        limit?: number;
    }
): Promise<ShopProductsResponse> => {
    try {
        const queryParams = new URLSearchParams();

        if (params?.search?.trim()) {
            queryParams.append("search", params.search.trim());
        }
        if (params?.cursor) {
            queryParams.append("cursor", params.cursor);
        }
        queryParams.append("limit", (params?.limit || 12).toString());

        const response = await axiosClient.get(
            `/v2/feetf1rst-shop/get-all?${queryParams}`
        );

        // Handle response structure
        let products: ShopProduct[] = [];
        let nextCursor: string | null = null;
        let hasMore = false;
        let total = 0;

        // API returns: { success, message, data: [...], hasMore }
        if (response.data && typeof response.data === "object") {
            products = response.data.data || response.data.products || [];
            hasMore = response.data.hasMore || false;
            nextCursor = response.data.nextCursor || null;
            total = response.data.total || products.length;
        } else if (Array.isArray(response.data)) {
            products = response.data;
            total = products.length;
        }

        return {
            products,
            nextCursor,
            hasMore,
            total,
        };
    } catch (error: any) {
        console.error("Shop Products API Error:", error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch shop products"
        );
    }
};

// Get single shop product by ID
export const getShopProductById = async (id: string): Promise<ShopProduct> => {
    try {
        console.log("Fetching product by ID:", id);
        const response = await axiosClient.get(`/v2/feetf1rst-shop/get-details/${id}`);
        console.log("Get details response:", response.data);

        // Handle response structure
        if (response.data.success && response.data.data) {
            return response.data.data;
        } else if (response.data.data) {
            return response.data.data;
        } else {
            return response.data;
        }
    } catch (error: any) {
        console.error("Get product by ID error:", error);
        console.error("Error response:", error.response?.data);

        // Fallback: Try to get from list and filter by ID
        console.log("Attempting fallback: fetching from list");
        try {
            const listResponse = await getAllShopProducts({ limit: 100 });
            const product = listResponse.products.find(p => p.id === id);
            if (product) {
                console.log("Found product in list:", product);
                return product;
            }
        } catch (listError) {
            console.error("Fallback also failed:", listError);
        }

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch shop product"
        );
    }
};

// Add shop interest - for customers to express interest or ask questions
export const addShopInterest = async (
    shop_id: string,
    question: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.post("/v2/feetf1rst-shop/add-interests", {
            shop_id,
            question,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to submit interest"
        );
    }
};
