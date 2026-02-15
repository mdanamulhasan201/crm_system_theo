export interface PriceItem {
    name: string;
    price: number;
    basePrice?: number;
    commissionPercentage?: number;
    commissionAmount?: number;
    netBeforeVat?: number;
    vatPercentage?: number;
    vatAmount?: number;
}

