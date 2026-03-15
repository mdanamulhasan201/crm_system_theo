import axiosClient from "@/lib/axiosClient";

export type InventoryType = "Invoices" | "Orders";
export type InventoryStatus = "Ordered" | "Delivered" | "Partially";
export type PaymentStatus = "Open" | "Paid";

export interface CreateInventoryPayload {
  inventory_type: InventoryType;
  supplier: string;
  date: string; // YYYY-MM-DD
  amount: number;
  status: InventoryStatus;
  payment_status: PaymentStatus;
  payment_date: string; // YYYY-MM-DD
  we_linked: boolean;
}

/** POST /v2/inventory-management/create-inventory */
export const createInventory = async (
  inventoryData: CreateInventoryPayload
) => {
  const response = await axiosClient.post<unknown>(
    "/v2/inventory-management/create-inventory",
    inventoryData
  );
  return response.data;
};

export interface InventoryItem {
  id: string;
  number: string;
  inventory_type: InventoryType;
  supplier: string;
  date: string;
  amount: number;
  status: InventoryStatus;
  payment_status: PaymentStatus;
  payment_date: string;
  we_linked: boolean;
  partnerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllInventoriesResponse {
  success: boolean;
  message: string;
  data: InventoryItem[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * GET /v2/inventory-management/get-all-inventory
 * Optional status & payment_status – omit for no filter (all data), only pagination + inventory_type.
 */
export const getAllInventories = async (
  limit: number,
  cursor: string,
  inventoryType: InventoryType,
  status?: InventoryStatus,
  paymentStatus?: PaymentStatus
): Promise<GetAllInventoriesResponse> => {
  const params = new URLSearchParams({
    limit: String(limit),
    cursor: cursor || "",
    inventory_type: inventoryType,
  });
  if (status) params.set("status", status);
  if (paymentStatus) params.set("payment_status", paymentStatus);
  const response = await axiosClient.get<GetAllInventoriesResponse>(
    `/v2/inventory-management/get-all-inventory?${params.toString()}`
  );
  return response.data;
};


export interface GetSingleInventoryResponse {
  success: boolean;
  data: InventoryItem;
}

/** GET /v2/inventory-management/get-single-inventory/:id */
export const getSingleInventory = async (id: string): Promise<GetSingleInventoryResponse> => {
  const response = await axiosClient.get<GetSingleInventoryResponse>(
    `/v2/inventory-management/get-single-inventory/${id}`
  );
  return response.data;
};

/** PATCH /v2/inventory-management/update-inventory/:id */
export const updateInventory = async (
  id: string,
  inventoryData: CreateInventoryPayload
): Promise<{ success: boolean; data: InventoryItem }> => {
  const response = await axiosClient.patch<{ success: boolean; data: InventoryItem }>(
    `/v2/inventory-management/update-inventory/${id}`,
    inventoryData
  );
  return response.data;
};

/** DELETE /v2/inventory-management/delete-inventory/:id */
export const deleteInventory = async (id: string): Promise<{ success: boolean }> => {
  const response = await axiosClient.delete<{ success: boolean }>(
    `/v2/inventory-management/delete-inventory/${id}`
  );
  return response.data;
};


// ============================ inventory-management Dokumente & Forderungen============================//

// create apis v2/inventory-management/documents-claims/create
export const createDocumentsClaims = async (documentsClaimsData: any) => {
  try {
    const response = await axiosClient.post(`/v2/inventory-management/documents-claims/create`, documentsClaimsData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// get card data  v2/inventory-management/documents-claims/calculation
export const getCardDataCalculation = async () => {
  try {
    const response = await axiosClient.get(`/v2/inventory-management/documents-claims/calculation`);
    return response.data;
  } catch (error) {
    throw error;
  }
}