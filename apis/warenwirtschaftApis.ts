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