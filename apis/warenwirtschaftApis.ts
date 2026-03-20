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



// card data v2/inventory-management/dashboard-kpis
export const getCardDataDashboardKpis = async () => {
  try {
    const response = await axiosClient.get(`/v2/inventory-management/dashboard-kpis`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


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

// get card data  v2/inventory-management/documents-claims/calculations
export const getCardDataCalculation = async () => {
  try {
    const response = await axiosClient.get(`/v2/inventory-management/documents-claims/calculations`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// get all v2/inventory-management/documents-claims/get-all?limit=10&cursor=&recipient=&search=&type=invoices
export const getAllDocumentsClaims = async (limit: number, cursor: string, recipient: string, search: string, type: string) => {
  try {
    const response = await axiosClient.get(`/v2/inventory-management/documents-claims/get-all?limit=${limit}&cursor=${cursor}&recipient=${recipient}&search=${search}&type=${type}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// get all fiter data v2/inventory-management/documents-claims/get-recipient-name

export const getRecipientName = async () => {
  try {
    const response = await axiosClient.get(`/v2/inventory-management/documents-claims/get-recipient-name`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// get dingle data v2/inventory-management/documents-claims/get-details/cmmrtnqkl0000z7ku11hhh43v
export const getSingleDocumentsClaims = async (id: string) => {
  try {
    const response = await axiosClient.get(`/v2/inventory-management/documents-claims/get-details/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// delete v2/inventory-management/documents-claims/delete/cmmrtnqkl0000z7ku11hhh43v 
export const deleteDocumentsClaims = async (id: string) => {
  try {
    const response = await axiosClient.delete(`/v2/inventory-management/documents-claims/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// update v2/inventory-management/documents-claims/update/cmmrtkh2q0001lqkus89oa7ny
export const updateDocumentsClaims = async (id: string, documentsClaimsData: any) => {
  try {
    const response = await axiosClient.patch(`/v2/inventory-management/documents-claims/update/${id}`, documentsClaimsData);
    return response.data;
  } catch (error) {
    throw error;
  }
}




// ==================================New goods receipt ==================

// create v2/inventory-supplier/create
export const createInventorySupplier = async (inventorySupplierData: any) => {
  try {
    const response = await axiosClient.post(`/v2/inventory-supplier/create`, inventorySupplierData);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// get onkly the name v2/inventory-supplier/get-only-name-and-id
export const getOnlyNamedata = async (limit: number, cursor: string) => {
  try {
    const response = await axiosClient.get(`/v2/inventory-supplier/get-only-name-and-id?limit=${limit}&cursor=${cursor}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// get single v2/inventory-supplier/details/cmmym4jza00004fkugcenwjnw
export const getSingleInventorySupplier = async (id: string) => {
  try {
    const response = await axiosClient.get(`/v2/inventory-supplier/details/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// delete v2/inventory-supplier/delete/{{id}}
export const deleteInventorySupplier = async (id: string) => {
  try {
    const response = await axiosClient.delete(`/v2/inventory-supplier/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// update v2/inventory-supplier/update/{{id}}
export const updateInventorySupplier = async (id: string, inventorySupplierData: any) => {
  try {
    const response = await axiosClient.patch(`/v2/inventory-supplier/update/${id}`, inventorySupplierData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

