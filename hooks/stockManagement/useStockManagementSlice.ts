import { useState } from 'react';
import { createProduct, getAllStorages, updateStorage } from '@/apis/productsManagementApis';
import { getSingleStorage } from '@/apis/storeManagement';

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
    image?: string;
    imageFile?: File;
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
    image?: string;
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

    const formatProductData = (formData: ProductFormData, type: string = 'rady_insole'): CreateProductPayload => {
        const minStockLevel = formData.minStockLevel || 0;
        const stockStatus = determineStockStatus(formData.sizeQuantities, minStockLevel);

        // Transform sizeQuantities based on type
        const transformedGroessenMengen: { [key: string]: any } = {};
        
        if (type === 'milling_block') {
            // For milling_block: {"1": {"quantity": 5, "mindestmenge": 3}, "2": {...}, "3": {...}}
            Object.keys(formData.sizeQuantities).forEach(size => {
                const sizeData = formData.sizeQuantities[size];
                // Extract numeric part from "Size 1", "Size 2", etc. or use as-is if already "1", "2", "3"
                const sizeKey = size.replace(/^Size\s+/i, '');
                transformedGroessenMengen[sizeKey] = {
                    quantity: sizeData.quantity,
                    ...(sizeData.mindestmenge !== undefined && { mindestmenge: sizeData.mindestmenge }),
                    // Always include auto_order_limit and auto_order_quantity, even if undefined
                    auto_order_limit: sizeData.autoOrderLimit !== undefined ? sizeData.autoOrderLimit : null,
                    auto_order_quantity: sizeData.orderQuantity !== undefined ? sizeData.orderQuantity : null
                };
            });
        } else {
            // For rady_insole: include length field
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
        }

        const payload: CreateProductPayload = {
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

        // Add image if provided (base64 string - only if no imageFile)
        if (!formData.imageFile && formData.image && formData.image.trim() !== '') {
            payload.image = formData.image;
        }

        return payload;
    };

    const createNewProduct = async (productData: ProductFormData, type: string = 'rady_insole') => {
        setIsLoading(true);
        setError(null);

        try {
            // If imageFile exists, use FormData, otherwise use JSON
            if (productData.imageFile) {
                const formData = new FormData();
                const formattedData = formatProductData(productData, type);
                
                // Append all fields to FormData
                Object.keys(formattedData).forEach(key => {
                    if (key !== 'image' && formattedData[key as keyof typeof formattedData] !== undefined) {
                        const value = formattedData[key as keyof typeof formattedData];
                        if (typeof value === 'object' && value !== null) {
                            formData.append(key, JSON.stringify(value));
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });
                
                // Append image file
                formData.append('image', productData.imageFile);
                
                const response = await createProduct(formData, type);
                return {
                    success: response.success,
                    message: response.message || 'Product created successfully',
                    data: response.data
                };
            } else {
                const formattedData = formatProductData(productData, type);
                const response = await createProduct(formattedData, type);
                return {
                    success: response.success,
                    message: response.message || 'Product created successfully',
                    data: response.data
                };
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create product';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllProducts = async (page: number = 1, limit: number = 10, search: string = '', type?: string) => {
        setIsLoadingProducts(true);
        setError(null);

        try {
            const response = await getAllStorages(page, limit, search, type);
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

    const refreshProducts = async (page: number = 1, limit: number = 10, search: string = '', type?: string) => {
        return await getAllProducts(page, limit, search, type);
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
