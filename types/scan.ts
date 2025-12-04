export interface ScreenerFileItem {
    id: string;
    customerId: string;
    picture_10: string | null;
    picture_23: string | null;
    picture_11: string | null;
    picture_24: string | null;
    threed_model_left: string | null;
    threed_model_right: string | null;
    picture_17: string | null;
    picture_16: string | null;
    csvFile?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ScanData {
    id: string;
    vorname: string;
    nachname: string;
    email: string;
    telefonnummer: string;
    wohnort: string;
    customerNumber?: string;
    // Additional personal information
    geschlecht?: string;
    gender?: string;
    geburtsdatum?: string;
    strasse?: string;
    straße?: string;
    land?: string;
    ort?: string;
    telefon?: string;
    // Workshop slip fields
    mitarbeiter?: string;
    versorgung?: string;
    datumAuftrag?: string;
    geschaeftsstandort?: string;
    fertigstellungBis?: string;
    bezahlt?: string;
    // Measurements
    fusslange1: string;
    fusslange2: string;
    fussbreite1: string;
    fussbreite2: string;
    kugelumfang1: string;
    kugelumfang2: string;
    rist1: string;
    rist2: string;
    zehentyp1: string;
    zehentyp2: string;
    archIndex1: string;
    archIndex2: string;
    // Additional customer information
    kundeSteuernummer?: string;
    diagnose?: string;
    kodexeMassschuhe?: string;
    kodexeEinlagen?: string;
    sonstiges?: string;
    // Pricing information
    fußanalyse?: number | string;
    einlagenversorgung?: number | string;
    createdAt: string;
    updatedAt: string;
    // Billing info
    billingType?: string;
    // Latest screener files
    screenerFile?: ScreenerFileItem[];
    // Optional legacy fields (fallbacks if present on customer)
    picture_10?: string | null;
    picture_23?: string | null;
    picture_11?: string | null;
    picture_24?: string | null;
    picture_17?: string | null;
    picture_16?: string | null;
    threed_model_left?: string | null;
    threed_model_right?: string | null;
}


