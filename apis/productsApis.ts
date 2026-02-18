import axiosClient from "@/lib/axiosClient";

// Product interface matching backend response
export interface ProductColor {
    id: string;
    colorName: string;
    colorCode: string;
    images: Array<{ id: string; url: string }>;
}

export interface ProductSize {
    size: string;
    quantity: number;
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    Category: string;
    Sub_Category: string;
    typeOfShoes: string;
    productDesc: string;
    price: number;
    availability: boolean;
    offer: string;
    size: ProductSize[];
    gender: string;
    colors: ProductColor[];
    characteristics?: any[];
    question?: string;
    allColors?: Array<{ name: string; code: string; mainImage: string }>;
    technicalData?: string;
    feetFirstFit?: string;
    footLength?: string;
    Company?: string;
}

export interface ProductsResponse {
    products: Product[];
    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

// Get all products with pagination and filters
export const getAllProducts = async (
    params?: {
        search?: string;
        page?: number;
        limit?: number;
    }
): Promise<ProductsResponse> => {
    try {
        const queryParams = new URLSearchParams({
            search: params?.search || "",
            page: (params?.page || 1).toString(),
            limit: (params?.limit || 12).toString(),
        });
        const response = await axiosClient.get(`/products/query?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get single product by ID
export const getProductById = async (id: string): Promise<{ success: boolean; product: Product }> => {
    try {
        const response = await axiosClient.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};



