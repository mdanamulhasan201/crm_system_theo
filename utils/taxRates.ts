export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    description: string;
    isDefault: boolean;
}

// Tax rates configuration by country
export const getTaxRatesByCountry = (country: string | null | undefined): TaxRate[] | null => {
    if (!country) return null;

    // Germany (Deutschland)
    if (country.includes('Deutschland') || country.includes('Germany') || country.includes('(DE)')) {
        return [
            {
                id: '1',
                name: 'Standard VAT',
                rate: 19,
                description: 'Standard German VAT rate',
                isDefault: true
            },
            {
                id: '2',
                name: 'Reduced VAT',
                rate: 7,
                description: 'Reduced VAT rate for specific goods',
                isDefault: false
            },
            {
                id: '3',
                name: 'Tax Free',
                rate: 0,
                description: 'No VAT applied',
                isDefault: false
            }
        ];
    }

    // Austria (Österreich)
    if (country.includes('Österreich') || country.includes('Austria') || country.includes('(AT)')) {
        return [
            {
                id: '1',
                name: 'Umsatzsteuer (USt)',
                rate: 20,
                description: 'Normalsteuersatz',
                isDefault: true
            }
        ];
    }

    // Italy (Italien)
    if (country.includes('Italien') || country.includes('Italy') || country.includes('(IT)')) {
        return [
            {
                id: '1',
                name: 'Mehrwertsteuer (IVA)',
                rate: 22,
                description: 'Standard',
                isDefault: true
            },
            {
                id: '2',
                name: 'Ermäßigt',
                rate: 10,
                description: 'Ermäßigt',
                isDefault: false
            },
            {
                id: '3',
                name: 'Stark ermäßigt',
                rate: 4,
                description: 'Stark ermäßigt',
                isDefault: false
            }
        ];
    }

    // Country not configured
    return null;
};

