export interface SizeData {
  length: number;
  quantity: number;
}

export interface Product {
  id: string;
  Produktname: string;
  Produktkürzel: string;
  Hersteller: string;
  Lagerort: string;
  minStockLevel: number;
  sizeQuantities: { [key: string]: number | SizeData };
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'delivery' | 'sale' | 'correction' | 'transfer' | 'stockUpdate';
  quantity: number | null;
  size: string;
  previousStock: number | null;
  newStock: number | null;
  user: string;
  notes: string;
  status: string | null;
  changeDetails?: Array<{field: string, oldValue: string, newValue: string}>;
  customer?: {
    id: string;
    customerNumber: number;
    vorname: string;
    nachname: string;
    email: string;
    telefonnummer?: string;
    wohnort?: string;
  } | null;
  order?: {
    id: string;
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
    product?: {
      id: string;
      name: string;
      rohlingHersteller: string;
      artikelHersteller: string;
    };
  } | null;
}

export interface ApiHistoryEntry {
  id: string;
  storeId: string;
  changeType: string;
  quantity: number | null;
  newStock: number | null;
  reason: string;
  text: string | null;
  status: string | null;
  createdAt: string;
  customerId: string | null;
  orderId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    busnessName?: string;
  };
  customer: {
    id: string;
    customerNumber: number;
    vorname: string;
    nachname: string;
    email: string;
    telefonnummer?: string;
    wohnort?: string;
  } | null;
  order: {
    id: string;
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
    product?: {
      id: string;
      name: string;
      rohlingHersteller: string;
      artikelHersteller: string;
    };
  } | null;
}

export interface InventoryHistoryProps {
  productsData: Product[];
}

export interface InventoryHistoryRef {
  showHistory: (product: Product) => void;
}

