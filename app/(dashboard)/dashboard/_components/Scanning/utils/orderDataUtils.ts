import type { EinlageType } from '@/hooks/customer/useScanningFormData';

interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
}

interface CreateOrderDataParams {
    customer: Customer | null | undefined;
    realOrderData: any;
    einlagentyp: string;
    selectedEinlage: EinlageType | string;
    supply: string;
    ausführliche_diagnose: string;
    diagnosis: string;
}

export function createOrderData({
    customer,
    realOrderData,
    einlagentyp,
    selectedEinlage,
    supply,
    ausführliche_diagnose,
    diagnosis,
}: CreateOrderDataParams) {
    if (!customer) return null;

    if (realOrderData) {
        return realOrderData;
    }

    return {
        id: 'temp-id',
        customerId: customer.id,
        partnerId: 'temp-partner-id',
        fußanalyse: 50,
        einlagenversorgung: 150,
        totalPrice: 200,
        productId: 'temp-product-id',
        orderStatus: 'Started',
        statusUpdate: new Date().toISOString(),
        invoice: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: {
            id: customer.id,
            customerNumber: parseInt(customer.id) || 0,
            vorname: customer.vorname || '',
            nachname: customer.nachname || '',
            email: customer.email || '',
            telefonnummer: '',
            wohnort: '',
        },
        partner: {
            id: 'temp-partner-id',
            name: 'FeetFirst Partner',
            email: 'partner@feetfirst.com',
            image: '/images/pdfLogo.png',
            role: 'Partner',
        },
        product: {
            id: 'temp-product-id',
            name: einlagentyp || selectedEinlage || 'Einlage',
            rohlingHersteller: 'Standard',
            artikelHersteller: 'Standard',
            versorgung: supply || 'Standard Versorgung',
            material: 'Standard Material',
            langenempfehlung: {},
            status: 'Active',
            diagnosis_status: ausführliche_diagnose || diagnosis || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    };
}

export function collectFormData({
    ausführliche_diagnose,
    versorgung_laut_arzt,
    einlagentyp,
    selectedEinlage,
    überzug,
    menge,
    supply,
    versorgung_note,
    schuhmodell_wählen,
    kostenvoranschlag,
    selectedEmployee,
    selectedEmployeeId,
    versorgungData,
    selectedVersorgungId,
}: {
    ausführliche_diagnose: string;
    versorgung_laut_arzt: string;
    einlagentyp: string;
    selectedEinlage: string;
    überzug: string;
    menge: string;
    supply: string;
    versorgung_note: string;
    schuhmodell_wählen: string;
    kostenvoranschlag: boolean | null;
    selectedEmployee: string;
    selectedEmployeeId: string;
    versorgungData: any[];
    selectedVersorgungId: string | null;
}) {
    const mengeNumber = menge ? parseInt(menge.split(' ')[0]) || 1 : 1;
    const selectedVersorgungItem = versorgungData.find((item: any) => item.id === selectedVersorgungId);

    return {
        ausführliche_diagnose: ausführliche_diagnose || '',
        versorgung_laut_arzt: versorgung_laut_arzt || '',
        einlagentyp: einlagentyp || selectedEinlage || '',
        überzug: überzug || '',
        menge: mengeNumber,
        versorgung: supply || '',
        versorgung_note: versorgung_note || '',
        schuhmodell_wählen: schuhmodell_wählen || '',
        kostenvoranschlag: kostenvoranschlag === true,
        employeeName: selectedEmployee || '',
        employeeId: selectedEmployeeId || '',
        selectedVersorgungData: selectedVersorgungItem || null,
    };
}

