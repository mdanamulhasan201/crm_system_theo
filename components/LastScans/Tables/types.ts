export interface LatestOrder {
    id: string;
    orderStatus: string;
    createdAt: string | null;
    totalPrice?: number | null;
}

export interface LatestScreener {
    id: string;
    createdAt: string | null;
    picture_10?: string | null;
    picture_23?: string | null;
}

export interface LatestMassschuheOrder {
    id: string;
    createdAt: string;
}

export interface LastScanRow {
    id: string;
    vorname: string;
    nachname: string;
    createdAt: string;
    wohnort?: string | null;
    customerNumber: number | string;
    krankenkasse?: string | null;
    kostenträger?: string | null;
    kundentyp?: string | null;
    billingType?: string | null;
    totalOrders?: number;
    completedOrders?: number;
    latestOrder?: LatestOrder | null;
    latestScreener?: LatestScreener | null;
    latestMassschuheOrder?: LatestMassschuheOrder | null;
    screenerFile?: Array<{ id: string; createdAt: string | null; updatedAt?: string | null }> | null;
}

export type DateRangeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'thisYear';
export type OrderStatusFilter = 'all' | 'completed' | 'no-order' | 'oneAllOrders' | 'oneOrdersInProduction';

