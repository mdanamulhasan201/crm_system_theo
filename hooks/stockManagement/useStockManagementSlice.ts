import { useState } from 'react';
import { createProduct, getAllStorages, getSingleStorage, updateStorage } from '@/apis/productsManagementApis';

interface SizeData {
    length: number;
    quantity: number;
    // Optional per-size minimum quantity, sent to backend as `mindestmenge`
    mindestmenge?: number;
    autoOrderLimit?: number;
    orderQuantity?: number;
    warningStatus?: string;
}

interface ProductFormData {
    Produktname: string;
    Hersteller: string;
    Produktkürzel: string;
    Lagerort?: string;
    minStockLevel?: number;
    purchase_price: number;
    selling_price: number;
    sizeQuantities: { [key: string]: SizeData };
}

interface CreateProductPayload {
    produktname: string;
    hersteller: string;
    artikelnummer: string;
    lagerort: string;
    mindestbestand: number;
    historie: string;
    groessenMengen: { [key: string]: SizeData };
    purchase_price: number;
    selling_price: number;
    Status: string;
}

interface ApiProduct {
    id: string;
    produktname: string;
    hersteller: string;
    artikelnummer: string;
    lagerort: string;
    mindestbestand: number;
    groessenMengen: { [key: string]: SizeData | number };
    groessenLaengen?: { [key: string]: string };
    purchase_price: number;
    selling_price: number;
    Status: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    image?: string;
}


interface PaginationInfo {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: ApiProduct[];
    pagination: PaginationInfo;
}

export const useStockManagementSlice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const determineStockStatus = (sizeQuantities: { [key: string]: SizeData }, minStockLevel: number): string => {
        const quantities = Object.values(sizeQuantities).map(data => data.quantity);
        const totalStock = quantities.reduce((sum, qty) => sum + qty, 0);
        const lowStockSizes = quantities.some(qty => qty <= minStockLevel && qty > 0);

        if (totalStock === 0) return "Out of Stock";
        if (totalStock <= minStockLevel) return "Critical Low Stock";
        if (lowStockSizes) return "Low Stock Warning";
        return "In Stock";
    };

    const formatProductData = (formData: ProductFormData): CreateProductPayload => {
        const minStockLevel = formData.minStockLevel || 0;
        const stockStatus = determineStockStatus(formData.sizeQuantities, minStockLevel);

        // Transform sizeQuantities to convert camelCase to snake_case for backend
        const transformedGroessenMengen: { [key: string]: any } = {};
        Object.keys(formData.sizeQuantities).forEach(size => {
            const sizeData = formData.sizeQuantities[size];
            transformedGroessenMengen[size] = {
                length: sizeData.length,
                quantity: sizeData.quantity,
                ...(sizeData.mindestmenge !== undefined && { mindestmenge: sizeData.mindestmenge }),
                // Always include auto_order_limit and auto_order_quantity, even if undefined
                auto_order_limit: sizeData.autoOrderLimit !== undefined ? sizeData.autoOrderLimit : null,
                auto_order_quantity: sizeData.orderQuantity !== undefined ? sizeData.orderQuantity : null
            };
        });

        return {
            produktname: formData.Produktname,
            hersteller: formData.Hersteller,
            artikelnummer: formData.Produktkürzel,
            lagerort: formData.Lagerort || '',
            mindestbestand: minStockLevel,
            historie: `Product created on ${new Date().toISOString().split('T')[0]}`,
            groessenMengen: transformedGroessenMengen,
            purchase_price: formData.purchase_price,
            selling_price: formData.selling_price,
            Status: stockStatus
        };
    };

    const createNewProduct = async (productData: ProductFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const formattedData = formatProductData(productData);
            // console.log('Creating product with data:', formattedData);

            const response = await createProduct(formattedData);
            // console.log('Product created successfully:', response);

            // Return the complete response including success status and data
            return {
                success: response.success,
                message: response.message || 'Product created successfully',
                data: response.data
            };
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create product';
            setError(errorMessage);
            // console.error('Error creating product:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllProducts = async (page: number = 1, limit: number = 10, search: string = '') => {
        setIsLoadingProducts(true);
        setError(null);

        try {
            const response = await getAllStorages(page, limit, search);
            // console.log('Fetched storages:', response);

            if (response.success && response.data) {
                // The API response already has the correct format, use it directly
                const products: ApiProduct[] = response.data.map((item: any) => ({
                    id: item.id,
                    produktname: item.produktname,
                    hersteller: item.hersteller,
                    artikelnummer: item.artikelnummer,
                    lagerort: item.lagerort || "Alle Lagerorte",
                    mindestbestand: item.mindestbestand || 0,
                    groessenMengen: item.groessenMengen || {},
                    purchase_price: item.purchase_price || 0,
                    selling_price: item.selling_price || 0,
                    Status: item.Status || "In Stock",
                    userId: item.userId || "",
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    image: item.image || undefined
                }));
                
                setProducts(products);
                setPagination(response.pagination);
                return products;
            } else {
                throw new Error(response.message || 'Failed to fetch products');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
            setError(errorMessage);
            // console.error('Error fetching products:', err);
            throw err;
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const getProductById = async (productId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getSingleStorage(productId);
            if (response.success && response.data) {
                return response.data as ApiProduct;
            }
            throw new Error(response.message || 'Failed to fetch product');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch product';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateExistingProduct = async (productId: string, updates: Partial<CreateProductPayload>) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await updateStorage(productId, updates);
            return response;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update product';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProducts = async (page: number = 1, limit: number = 10, search: string = '') => {
        return await getAllProducts(page, limit, search);
    };

    return {
        createNewProduct,
        getAllProducts,
        getProductById,
        updateExistingProduct,
        refreshProducts,
        products,
        pagination,
        isLoading,
        isLoadingProducts,
        error,
        clearError: () => setError(null)
    };
};
