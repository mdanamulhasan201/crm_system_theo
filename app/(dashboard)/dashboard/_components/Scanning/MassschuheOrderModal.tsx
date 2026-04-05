import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { initializeDeliveryDate, getRequiredDeliveryDate } from './utils/dateUtils';
import { getSettingData } from '@/apis/einlagenApis';
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types';
import { getAllLocations, type StoreLocation } from '@/apis/setting/locationManagementApis';
import PaymentStatusSection from './Werkstattzettel/FormSections/PaymentStatusSection';

interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    telefonnummer?: string;
    wohnort?: string;
    datumAuftrag?: string;
    fertigstellungBis?: string;
    workshopNote?: {
        completionDays?: string | number;
    };
    partner?: {
        hauptstandort?: string[];
        workshopNote?: {
            completionDays?: string | number;
        };
    };
}

type Step2MaterialPayload = {
    left?: string;
    right?: string;
};

/** Payload for v2 API POST /v2/shoe-orders/create */
export interface MassschuheOrderV2Payload {
    customerId: string;
    medical_diagnosis?: string;
    detailed_diagnosis?: string;
    price?: number;
    vat_rate?: number;
    branch_location?: string;
    employeeId?: string;
    kva?: boolean;
    halbprobe?: boolean;
    insurances?: string;
    insurance_price?: number;
    half_sample_required?: boolean;
    preparation_date?: string;
    notes?: string;
    fitting_date?: string;
    adjustments?: string;
    customer_reviews?: string;
    has_trim_strips?: boolean;
    step2_material?: string | Step2MaterialPayload;
    /** Required when has_trim_strips is false (snake_case) */
    step2_leistentyp?: string;
    /** Required when has_trim_strips is false (camelCase – API expects this name) */
    step2Leistentyp?: string;
    leistentyp?: string;
    leistengroesse?: string;
    /** Payload key when Leisten = Nein (Leistengröße optional field) */
    leistengröße?: string;
    step2_notes?: string;
    bedding_required?: boolean;
    bettung_type?: 'on_last' | 'built_up' | null;
    bettung_notes?: string;
    /** Payload key for "Zusätzliche Notizen zur Bettung" (Step 3, on_last) */
    zusätzliche_notizen?: string;
    /** Built-up Bettung: thickness per side (Links/Rechts) */
    thickness_heel_l?: string;
    thickness_heel_r?: string;
    thickness_ball_l?: string;
    thickness_ball_r?: string;
    thickness_toe_l?: string;
    thickness_toe_r?: string;
    /** Payload keys when Bettung wird brutto aufgebaut (per side) */
    dicke_ferse_l?: string;
    dicke_ferse_r?: string;
    dicke_ballen_l?: string;
    dicke_ballen_r?: string;
    dicke_spitze_l?: string;
    dicke_spitze_r?: string;
    /** Notes when Bettung wird brutto aufgebaut */
    bettung_built_up_notes?: string;
    /** Built-up: Einlage aus Fräsblock / Einlagenrohling */
    einlage_rohling_type?: 'frasblock' | 'einlagenrohling' | null;
    einlagenrohling_frasblock?: string;
    /** Erweiterte Daten (on_last) */
    schicht1_material?: string;
    schicht1_starke?: string;
    schicht2_material?: string;
    schicht2_starke?: string;
    decksohle_material?: string;
    decksohle_starke?: string;
    versteifung?: boolean | null;
    versteifung_material?: string;
    versteifung_zone?: string;
    pelotte?: boolean | null;
    pelotte_hoehe_l?: string;
    pelotte_hoehe_r?: string;
    step3_material?: string;
    step3_thickness?: string;
    step3_notes?: string;
    supply_note?: string;
    quantity?: number;
    total_price?: number;
    privatePrice?: number;
    payment_status?: string;
    deposit_provision?: number;
    foot_analysis_price?: number | object;
    addonPrices?: number;
    pick_up_location?: string;
    store_location?: string;
    order_note?: string;
    step3_json?: {
        step2?: {
            material?: string | Step2MaterialPayload;
            leistentyp?: string;
            leistengroesse?: string;
            notes?: string;
        };
        step3?: {
            material?: string;
            thickness?: string;
            notes?: string;
            bettung_type?: 'on_last' | 'built_up' | null;
            zusätzliche_notizen?: string;
            schicht1_material?: string;
            schicht1_starke?: string;
            schicht2_material?: string;
            schicht2_starke?: string;
            decksohle_material?: string;
            decksohle_starke?: string;
            versteifung?: boolean | null;
            versteifung_material?: string;
            versteifung_zone?: string;
            pelotte?: boolean | null;
            pelotte_hoehe_l?: string;
            pelotte_hoehe_r?: string;
            thickness_heel_l?: string;
            thickness_heel_r?: string;
            thickness_ball_l?: string;
            thickness_ball_r?: string;
            thickness_toe_l?: string;
            thickness_toe_r?: string;
            bettung_built_up_notes?: string;
            einlage_rohling_type?: 'frasblock' | 'einlagenrohling' | null;
            einlagenrohling_frasblock?: string;
        };
        step4?: {
            preparation_date?: string;
            notes?: string;
        };
        step5?: {
            fitting_date?: string;
            adjustments?: string;
            customer_reviews?: string;
        };
    };
}

/** Form data passed into the order modal (from MassschuheFormNew) */
export interface MassschuheOrderModalFormData {
    arztlicheDiagnose: string;
    ausführlicheDiagnose: string;
    rezeptnummer?: string;
    versorgungNote: string;
    halbprobeGeplant: boolean | null;
    kostenvoranschlag: boolean | null;
    selectedEmployee: string;
    selectedEmployeeId: string;
    selectedPositionsnummer?: string[];
    positionsnummerAustriaData?: any[];
    positionsnummerItalyData?: any[];
    itemSides?: Record<string, 'L' | 'R' | 'BDS'>;
    billingType?: 'Krankenkassa' | 'Privat';
    price?: string;
    brutto?: string;
    tax?: string;
    rabatt?: string;
    nettoPreis?: string;
    priceCalculations?: { basisPreis?: number; discountPercent?: number; discountAmount?: number; netto: number; mwst: number; brutto: number };
    has_trim_strips?: boolean;
    step2_material?: string | Step2MaterialPayload;
    /** Schritt 2 Leistentyp – sent in payload as step2_leistentyp when Leisten = Nein */
    step2_leistentyp?: string;
    leistentyp?: string;
    leistengroesse?: string;
    step2_notes?: string;
    bedding_required?: boolean;
    bettung_type?: 'on_last' | 'built_up' | null;
    bettung_notes?: string;
    thickness_heel_l?: string;
    thickness_heel_r?: string;
    thickness_ball_l?: string;
    thickness_ball_r?: string;
    thickness_toe_l?: string;
    thickness_toe_r?: string;
    bettung_built_up_notes?: string;
    einlage_rohling_type?: 'frasblock' | 'einlagenrohling' | null;
    einlagenrohling_frasblock?: string;
    schicht1_material?: string;
    schicht1_starke?: string;
    schicht2_material?: string;
    schicht2_starke?: string;
    decksohle_material?: string;
    decksohle_starke?: string;
    versteifung?: boolean | null;
    versteifung_material?: string;
    versteifung_zone?: string;
    pelotte?: boolean | null;
    pelotte_hoehe_l?: string;
    pelotte_hoehe_r?: string;
    step3_material?: string;
    step3_thickness?: string;
    step3_notes?: string;
    adjustments?: string;
    customer_reviews?: string;
    halbprobeErforderlich?: boolean | null;
    printWerkstattzettel?: boolean;
    step4_preparation_date?: string;
    step4_notes?: string;
    step5_fitting_date?: string;
    step3_json?: {
        step2?: {
            material?: string | Step2MaterialPayload;
            leistentyp?: string;
            leistengroesse?: string;
            notes?: string;
        };
        step3?: {
            material?: string;
            thickness?: string;
            notes?: string;
            bettung_type?: 'on_last' | 'built_up' | null;
            zusätzliche_notizen?: string;
            schicht1_material?: string;
            schicht1_starke?: string;
            schicht2_material?: string;
            schicht2_starke?: string;
            decksohle_material?: string;
            decksohle_starke?: string;
            versteifung?: boolean | null;
            versteifung_material?: string;
            versteifung_zone?: string;
            pelotte?: boolean | null;
            pelotte_hoehe_l?: string;
            pelotte_hoehe_r?: string;
            thickness_heel_l?: string;
            thickness_heel_r?: string;
            thickness_ball_l?: string;
            thickness_ball_r?: string;
            thickness_toe_l?: string;
            thickness_toe_r?: string;
            bettung_built_up_notes?: string;
            einlage_rohling_type?: 'frasblock' | 'einlagenrohling' | null;
            einlagenrohling_frasblock?: string;
        };
        step4?: {
            preparation_date?: string;
            notes?: string;
        };
        step5?: {
            fitting_date?: string;
            adjustments?: string;
            customer_reviews?: string;
        };
    };
}

interface MassschuheOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
    formData: MassschuheOrderModalFormData;
    onSubmit: (orderData: MassschuheOrderV2Payload) => Promise<void>;
    isLoading?: boolean;
}

export default function MassschuheOrderModal({
    isOpen,
    onClose,
    customer,
    formData,
    onSubmit,
    isLoading = false
}: MassschuheOrderModalProps) {
    const AUSTRIA_PRIVATE_SHARE = 46.2;

    // Order modal form state
    const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [fertigstellungDate, setFertigstellungDate] = useState<string>('');
    const [filiale, setFiliale] = useState<string>('');
    const [paymentType, setPaymentType] = useState<'krankenkasse' | 'privat' | null>(null);
    const [selectedFußanalyse, setSelectedFußanalyse] = useState<string>('');
    const [selectedEinlagenversorgung, setSelectedEinlagenversorgung] = useState<string>('');
    const [orderNote, setOrderNote] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [bezahlt, setBezahlt] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([]);
    const [pricesLoading, setPricesLoading] = useState(false);
    const [locations, setLocations] = useState<StoreLocation[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [showNotizTextarea, setShowNotizTextarea] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [shouldPrintWerkstattzettel, setShouldPrintWerkstattzettel] = useState(true);
    const [addonPrices, setAddonPrices] = useState<string>('');

    const { user } = useAuth();
    const addonPricesTotal = React.useMemo(() => {
        const raw = addonPrices;
        if (!raw || typeof raw !== 'string') return 0;
        const parts = raw.split(/[,\s]+/).filter(Boolean);
        return parts.reduce((sum, part) => sum + (parseFloat(part.replace(',', '.')) || 0), 0);
    }, [addonPrices]);

    const allowDualPaymentSelection =
        formData.billingType === 'Krankenkassa' &&
        ((parseFloat(formData.nettoPreis || '0') || 0) > 0 || addonPricesTotal > 0 || user?.accountInfo?.vat_country === 'Österreich (AT)');
    const disabledPaymentOptions: Array<'Privat' | 'Krankenkasse'> =
        formData.billingType === 'Privat'
            ? ['Krankenkasse']
            : [];

    // Parse Fußanalyse selected value: stored as "index__price" for unique Select values (avoids duplicate-price = "all select" bug)
    const getFußanalysePrice = (value: string): number => {
        if (!value || value === '__none__') return 0;
        if (value.includes('__')) {
            const pricePart = value.split('__')[1];
            const n = parseFloat(pricePart);
            return Number.isFinite(n) ? n : 0;
        }
        return parseFloat(value) || 0;
    };

    const completionDays =
        (customer as any)?.workshopNote?.completionDays ??
        (customer as any)?.partner?.workshopNote?.completionDays;

    // Fetch laser print prices from settings when modal opens
    useEffect(() => {
        const fetchSettings = async () => {
            if (!isOpen) return;
            setPricesLoading(true);
            try {
                const response = await getSettingData();
                if (response?.data?.laser_print_prices && Array.isArray(response.data.laser_print_prices)) {
                    // Handle both old format (numbers) and new format (objects with name and price)
                    const formattedPrices: PriceItem[] = response.data.laser_print_prices
                        .map((item: any) => {
                            // Handle old format (just numbers)
                            if (typeof item === 'number') {
                                return { name: `Preis ${item}`, price: item };
                            }
                            // Handle new format (objects with name and price)
                            if (item && typeof item === 'object' && item.name && item.price !== undefined) {
                                return { name: item.name, price: item.price };
                            }
                            return null;
                        })
                        .filter((item: PriceItem | null): item is PriceItem => item !== null);
                    setLaserPrintPrices(formattedPrices);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                toast.error('Fehler beim Laden der Preise');
            } finally {
                setPricesLoading(false);
            }
        };
        fetchSettings();
    }, [isOpen]);

    // Fetch locations from API when modal opens
    useEffect(() => {
        const fetchLocations = async () => {
            if (!isOpen) return;
            setLocationsLoading(true);
            try {
                const response = await getAllLocations(1, 100);
                if (response?.success && response?.data && Array.isArray(response.data)) {
                    setLocations(response.data);
                } else if (Array.isArray(response?.data)) {
                    setLocations(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch locations:', error);
                // Don't show error toast, just use empty array as fallback
                setLocations([]);
            } finally {
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, [isOpen]);

    // Set primary location immediately when locations are loaded
    useEffect(() => {
        if (locations.length > 0 && isOpen && !locationsLoading) {
            const primaryLocation = locations.find(loc => loc.isPrimary);
            const locationValue = primaryLocation
                ? (primaryLocation.description || primaryLocation.address)
                : (locations[0].description || locations[0].address);

            // Always set both filiale and selectedLocation to primary (or first if no primary)
            setFiliale(locationValue);
            setSelectedLocation(locationValue);
        }
    }, [locations, isOpen, locationsLoading]);

    // Fallback to customer location only if API locations are not available
    useEffect(() => {
        if (!isOpen) return;
        if (locationsLoading) return; // Wait for API to finish
        if (locations.length > 0) return; // Don't use fallback if API locations exist

        // Only use fallback if no API locations available
        if (customer?.wohnort) {
            setFiliale(customer.wohnort);
            setSelectedLocation(customer.wohnort);
        } else {
            const hauptstandort = customer?.partner?.hauptstandort;
            if (hauptstandort && Array.isArray(hauptstandort) && hauptstandort.length > 0) {
                setFiliale(hauptstandort[0]);
                setSelectedLocation(hauptstandort[0]);
            }
        }
    }, [locations, isOpen, customer, locationsLoading]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().slice(0, 10);
            const initialOrder = customer?.datumAuftrag || today;
            setOrderDate(initialOrder);

            const deliveryFromApi = customer ? initializeDeliveryDate(customer as any) : '';
            const fallbackDelivery = initialOrder ? getRequiredDeliveryDate(initialOrder, completionDays) : today;
            setFertigstellungDate(deliveryFromApi || fallbackDelivery);

            // Set paymentType based on billingType from formData
            if (formData.billingType === 'Krankenkassa') {
                setPaymentType('krankenkasse');
            } else if (formData.billingType === 'Privat') {
                setPaymentType('privat');
                // Do not auto-select Fußanalyse; let user choose or leave empty
                setSelectedFußanalyse('');
            } else {
                setPaymentType(null);
            }

            // Reset price selections only if not Privat
            if (formData.billingType !== 'Privat') {
                setSelectedFußanalyse('');
                setSelectedEinlagenversorgung('');
            }
            setOrderNote('');
            setAddonPrices('');
            setShouldPrintWerkstattzettel(formData.printWerkstattzettel ?? true);
            // Set default bezahlt based on billingType (same as WerkstattzettelModal)
            if (formData.billingType === 'Krankenkassa') {
                setBezahlt('Krankenkasse_Genehmigt');
            } else if (formData.billingType === 'Privat') {
                setBezahlt('Privat_Bezahlt');
            } else {
                setBezahlt('');
            }
            // Don't reset selectedLocation here - it will be set by the locations useEffect
        }
    }, [isOpen, user?.hauptstandort, customer, completionDays, formData.billingType, laserPrintPrices, formData.printWerkstattzettel]);

    useEffect(() => {
        if (allowDualPaymentSelection) return;

        if (bezahlt.startsWith('Privat')) {
            setPaymentType('privat');
            return;
        }

        if (bezahlt.startsWith('Krankenkasse')) {
            setPaymentType('krankenkasse');
        }
    }, [bezahlt, allowDualPaymentSelection]);

    const handleSubmit = async () => {
        if (!customer?.id) {
            toast.error('Kunde-ID fehlt');
            return;
        }

        // PaymentType should already be set from billingType, but check just in case
        if (!paymentType) {
            toast.error('Zahlungsart fehlt');
            return;
        }

        // Prepare data for API
        const customerName = `${customer.vorname || ''} ${customer.nachname || ''}`.trim();
        const customerPhone = customer.telefonnummer || customer.telefon || '';
        const customerEmail = customer.email || '';

        const qty = quantity || 1;

        // Find the selected location object to get both address and description
        const selectedLoc = locations.find(loc =>
            (loc.description || loc.address) === selectedLocation ||
            loc.description === selectedLocation ||
            loc.address === selectedLocation ||
            (loc.description || loc.address) === filiale
        );

        // Construct filiale object with address and description
        const filialeObject = selectedLoc ? {
            address: selectedLoc.address || '',
            description: selectedLoc.description || ''
        } : {
            address: filiale || customer?.wohnort || '',
            description: filiale || customer?.wohnort || ''
        };

        // Helper function to get positionsnummer from option
        const getPositionsnummer = (option: any): string => {
            if (option.positionsnummer) {
                return option.positionsnummer;
            }
            if (typeof option.description === 'object' && option.description?.positionsnummer) {
                return option.description.positionsnummer;
            }
            return '';
        };

        // Build insurances array for v2 (with vat_country), then JSON string. BDS = price × 2.
        const vatCountryCode = user?.accountInfo?.vat_country === 'Österreich (AT)' ? 'AT' : user?.accountInfo?.vat_country === 'Italien (IT)' ? 'IT' : 'DE';
        const itemSides = formData.itemSides || {};
        const buildInsurancesForV2 = (): string => {
            if (!formData.selectedPositionsnummer || formData.selectedPositionsnummer.length === 0) {
                return '[]';
            }
            const allData = [...(formData.positionsnummerAustriaData || []), ...(formData.positionsnummerItalyData || [])];
            const arr = formData.selectedPositionsnummer.map(posNum => {
                const option = allData.find(opt => getPositionsnummer(opt) === posNum);
                if (option) {
                    const basePrice = typeof option.price === 'number' ? option.price : 0;
                    const side = itemSides[posNum] || 'R';
                    const finalPrice = side === 'BDS' ? basePrice * 2 : basePrice;
                    return {
                        price: finalPrice,
                        description: typeof option.description === 'object' ? option.description : {},
                        vat_country: vatCountryCode,
                    };
                }
                return null;
            }).filter(Boolean);
            return JSON.stringify(arr);
        };

        // VAT rate for payload: Krankenkassa = country-wise (AT 20, IT 4, else 0); Privat = formData.tax (steuersatz)
        const payloadVatRate = paymentType === 'krankenkasse'
            ? (vatCountryCode === 'IT' ? 4 : vatCountryCode === 'AT' ? 20 : 0)
            : (formData.tax ? parseFloat(formData.tax) : undefined);

        // Total price (Gesamt): Krankenkassa = positions (with BDS ×2) * qty + VAT; Privat = brutto * qty
        // insurance_price: Krankenkassa only = positions subtotal with VAT
        let totalPrice: number;
        let insurancePrice: number | undefined;
        if (paymentType === 'privat') {
            const formBrutto = formData.brutto ? parseFloat(formData.brutto) : 0;
            totalPrice = formBrutto > 0
                ? (formBrutto * qty) + addonPricesTotal
                : ((getFußanalysePrice(selectedFußanalyse) + (parseFloat(selectedEinlagenversorgung) || 0)) * qty) + addonPricesTotal;
        } else {
            const allPosData = [...(formData.positionsnummerAustriaData || []), ...(formData.positionsnummerItalyData || [])];
            const getPosNum = (o: any) => o?.positionsnummer || o?.description?.positionsnummer || '';
            // BDS = price × 2 per position
            const positionsSum = (formData.selectedPositionsnummer || []).reduce((sum, posNum) => {
                const opt = allPosData.find((o: any) => getPosNum(o) === posNum);
                const basePrice = typeof opt?.price === 'number' ? opt.price : 0;
                const side = itemSides[posNum] || 'R';
                return sum + (side === 'BDS' ? basePrice * 2 : basePrice);
            }, 0);
            const vatRate = vatCountryCode === 'IT' ? 4 : vatCountryCode === 'AT' ? 20 : 0;
            const positionsSubtotal = positionsSum * qty;
            const subtotalWithVat = positionsSubtotal * (1 + vatRate / 100);
            // AT: insurance_price = with +20% VAT; total_price = that + fixed private share
            insurancePrice = subtotalWithVat;
            totalPrice = vatCountryCode === 'AT'
                ? subtotalWithVat + AUSTRIA_PRIVATE_SHARE + addonPricesTotal
                : subtotalWithVat + addonPricesTotal;
        }

        const branchLocationJson = JSON.stringify({
            title: selectedLoc?.description || filiale,
            description: selectedLoc?.address || '',
        });
        const pickUpLocationJson = JSON.stringify({ title: filiale || selectedLocation });
        const storeLocationJson = JSON.stringify({ title: selectedLoc?.description || filiale, description: selectedLoc?.address || '' });

        const halfSampleRequired = formData.halbprobeErforderlich === true;
        const hasTrimStrips = formData.has_trim_strips ?? false;
        const beddingRequired = formData.bedding_required ?? false;
        const bettungType = formData.bettung_type ?? formData.step3_json?.step3?.bettung_type;

        // Build step3_json: only bedding (Schritt 3) section data inside step3; Zusätzliche Notizen also at root as zusätzliche_notizen
        const buildStep3JsonForBedding = (
            fd: MassschuheOrderModalFormData,
            type: 'on_last' | 'built_up'
        ): NonNullable<MassschuheOrderV2Payload['step3_json']> => {
            const step3 = fd.step3_json?.step3 ?? {};
            const tr = (s: string | undefined) => (s ?? '')?.trim() || undefined;
            const zusatz = type === 'on_last'
                ? (fd.bettung_notes ?? step3.zusätzliche_notizen)?.trim()
                : (fd.bettung_built_up_notes ?? step3.bettung_built_up_notes)?.trim();
            return {
                step3: {
                    material: fd.step3_material ?? step3.material ?? '',
                    thickness: fd.step3_thickness ?? step3.thickness ?? '',
                    notes: fd.step3_notes ?? step3.notes ?? '',
                    bettung_type: type,
                    zusätzliche_notizen: zusatz ?? '',
                    // Bettung auf dem Leisten (on_last) – Erweiterte Daten
                    schicht1_material: tr(fd.schicht1_material ?? step3.schicht1_material),
                    schicht1_starke: tr(fd.schicht1_starke ?? step3.schicht1_starke),
                    schicht2_material: tr(fd.schicht2_material ?? step3.schicht2_material),
                    schicht2_starke: tr(fd.schicht2_starke ?? step3.schicht2_starke),
                    decksohle_material: tr(fd.decksohle_material ?? step3.decksohle_material),
                    decksohle_starke: tr(fd.decksohle_starke ?? step3.decksohle_starke),
                    versteifung: fd.versteifung ?? step3.versteifung ?? undefined,
                    versteifung_material: tr(fd.versteifung_material ?? step3.versteifung_material),
                    versteifung_zone: tr(fd.versteifung_zone ?? step3.versteifung_zone),
                    pelotte: fd.pelotte ?? step3.pelotte ?? undefined,
                    pelotte_hoehe_l: tr(fd.pelotte_hoehe_l ?? step3.pelotte_hoehe_l),
                    pelotte_hoehe_r: tr(fd.pelotte_hoehe_r ?? step3.pelotte_hoehe_r),
                    // Bettung brutto aufgebaut (built_up)
                    thickness_heel_l: tr(fd.thickness_heel_l ?? step3.thickness_heel_l),
                    thickness_heel_r: tr(fd.thickness_heel_r ?? step3.thickness_heel_r),
                    thickness_ball_l: tr(fd.thickness_ball_l ?? step3.thickness_ball_l),
                    thickness_ball_r: tr(fd.thickness_ball_r ?? step3.thickness_ball_r),
                    thickness_toe_l: tr(fd.thickness_toe_l ?? step3.thickness_toe_l),
                    thickness_toe_r: tr(fd.thickness_toe_r ?? step3.thickness_toe_r),
                    bettung_built_up_notes: tr(fd.bettung_built_up_notes ?? step3.bettung_built_up_notes),
                    einlage_rohling_type: fd.einlage_rohling_type ?? step3.einlage_rohling_type ?? undefined,
                    einlagenrohling_frasblock: tr(fd.einlagenrohling_frasblock ?? step3.einlagenrohling_frasblock),
                },
            };
        };

        // Derive Step 4 & 5 from step3_json when not passed flat (Halbprobe: only Anprobedatum + Notizen)
        const step4Notes = formData.step4_notes ?? formData.step3_json?.step4?.notes ?? '';
        const step5FittingDate = formData.step5_fitting_date ?? formData.step3_json?.step5?.fitting_date;
        const step2MaterialRaw = formData.step2_material ?? formData.step3_json?.step2?.material;
        const step2Material: Step2MaterialPayload = (() => {
            if (typeof step2MaterialRaw === 'object' && step2MaterialRaw !== null) {
                return {
                    left: String(step2MaterialRaw.left ?? '').trim(),
                    right: String(step2MaterialRaw.right ?? '').trim(),
                };
            }
            const shared = String(step2MaterialRaw ?? '').trim();
            return { left: shared, right: shared };
        })();
        const step2LeistentypVal = formData.step2_leistentyp ?? formData.leistentyp ?? formData.step3_json?.step2?.leistentyp ?? '';
        const step2Notes = formData.step2_notes ?? formData.step3_json?.step2?.notes ?? '';
        const leistengroesseVal = formData.leistengroesse?.trim() || formData.step3_json?.step2?.leistengroesse?.trim() || undefined;

        // Base payload (always sent)
        const v2Payload: MassschuheOrderV2Payload = {
            customerId: customer.id,
            medical_diagnosis: formData.arztlicheDiagnose || undefined,
            detailed_diagnosis: formData.ausführlicheDiagnose || undefined,
            vat_rate: payloadVatRate,
            branch_location: branchLocationJson,
            employeeId: formData.selectedEmployeeId || undefined,
            kva: formData.kostenvoranschlag === true,
            halbprobe: formData.halbprobeGeplant === true,
            insurances: (formData.selectedPositionsnummer?.length && paymentType === 'krankenkasse') ? buildInsurancesForV2() : undefined,
            insurance_price: paymentType === 'krankenkasse' ? insurancePrice : undefined,
            supply_note: formData.versorgungNote || undefined,
            quantity: qty,
            total_price: totalPrice,
            privatePrice: paymentType === 'privat'
                ? totalPrice
                : (paymentType === 'krankenkasse' && vatCountryCode === 'AT' ? AUSTRIA_PRIVATE_SHARE + addonPricesTotal : undefined),
            payment_status: bezahlt || undefined,
            foot_analysis_price: paymentType === 'privat' && selectedFußanalyse ? getFußanalysePrice(selectedFußanalyse) : undefined,
            addonPrices: addonPricesTotal > 0 ? addonPricesTotal : undefined,
            pick_up_location: pickUpLocationJson,
            store_location: storeLocationJson,
            order_note: orderNote || undefined,
        };

        // Halbprobe Ja: Step 4 (Anprobedatum + Notizen), no bedding. When has_trim_strips is false, API still requires step2_material, step2_leistentyp, step2_notes.
        if (halfSampleRequired) {
            v2Payload.half_sample_required = true;
            v2Payload.notes = (step4Notes?.trim() || orderNote?.trim()) || undefined;
            v2Payload.fitting_date = step5FittingDate || undefined;
            v2Payload.has_trim_strips = false;
            // API requires these whenever has_trim_strips is false (use form values or empty string)
            const mat = step2Material;
            const typ = step2LeistentypVal?.trim() ?? '';
            const notes = step2Notes?.trim() ?? '';
            v2Payload.step2_material = mat;
            v2Payload.step2_leistentyp = typ;
            v2Payload.step2Leistentyp = typ;
            v2Payload.leistentyp = typ;
            v2Payload.step2_notes = notes;
            // Bettung erforderlich? Ja/Nein from form – use form value, do not force false
            v2Payload.bedding_required = beddingRequired;
            if (beddingRequired && bettungType) {
                v2Payload.bettung_type = bettungType;
                const zusatzNotes =
                    bettungType === 'on_last'
                        ? (formData.bettung_notes ?? formData.step3_json?.step3?.zusätzliche_notizen)?.trim()
                        : (formData.bettung_built_up_notes ?? formData.step3_json?.step3?.bettung_built_up_notes)?.trim();
                v2Payload.zusätzliche_notizen = zusatzNotes || undefined;
                v2Payload.step3_json = buildStep3JsonForBedding(formData, bettungType);
            } else {
                v2Payload.step3_json = undefined;
            }
        } else {
            v2Payload.half_sample_required = false;
            v2Payload.notes = orderNote || undefined;
            v2Payload.fitting_date = undefined;
            v2Payload.has_trim_strips = hasTrimStrips;
            // Leisten Nein (has_trim_strips false): API requires step2_material, step2Leistentyp, step2_notes (exact names)
            if (!hasTrimStrips) {
                const mat = step2Material;
                const typ = step2LeistentypVal?.trim() ?? '';
                const notes = step2Notes?.trim() ?? '';

                v2Payload.step2_material = mat;
                v2Payload.step2_leistentyp = typ;
                v2Payload.step2Leistentyp = typ; // API expects camelCase
                v2Payload.leistentyp = typ;
                v2Payload.step2_notes = notes;
            } else {
                v2Payload.step2_material = step2Material;
                v2Payload.leistentyp = step2LeistentypVal || '';
                v2Payload.leistengroesse = leistengroesseVal;
                v2Payload.step2_notes = step2Notes || '';
            }
            // Bettung: Ja → bedding_required true, Nein → false (from form choice). Step3 data only when Ja + type selected.
            v2Payload.bedding_required = beddingRequired;
            if (beddingRequired && bettungType) {
                v2Payload.bettung_type = bettungType;
                // Zusätzliche Notizen (optional) → root key zusätzliche_notizen (on_last: bettung_notes, built_up: bettung_built_up_notes)
                const zusatzNotes =
                    bettungType === 'on_last'
                        ? (formData.bettung_notes ?? formData.step3_json?.step3?.zusätzliche_notizen)?.trim()
                        : (formData.bettung_built_up_notes ?? formData.step3_json?.step3?.bettung_built_up_notes)?.trim();
                v2Payload.zusätzliche_notizen = zusatzNotes || undefined;
                // All bedding section data (Erweiterte Daten, thickness, etc.) only inside step3_json.step3
                v2Payload.step3_json = buildStep3JsonForBedding(formData, bettungType);
            } else {
                v2Payload.step3_json = undefined;
            }
        }

        await onSubmit(v2Payload);
    };

    const isBettungValid = (): boolean => {
        if (!formData.bedding_required) return true;
        
        // Check step3_json structure first (new format)
        if (formData.step3_json?.step3) {
            const step3 = formData.step3_json.step3;
            const type = step3.bettung_type;
            if (type == null) return false;
            
            if (type === 'on_last') {
                // For on_last: only type is required, Zusätzliche Notizen is optional
                return true;
            }
            if (type === 'built_up') {
                // For built_up: only thickness fields are required, notes are optional
                const parse = (s: string | undefined) => {
                    if (s == null || s.trim() === '') return NaN;
                    return parseFloat(String(s).replace(',', '.'));
                };
                const hl = parse(step3.thickness_heel_l);
                const hr = parse(step3.thickness_heel_r);
                const bl = parse(step3.thickness_ball_l);
                const br = parse(step3.thickness_ball_r);
                const tl = parse(step3.thickness_toe_l);
                const tr = parse(step3.thickness_toe_r);
                return Number.isFinite(hl) && hl > 0 && Number.isFinite(hr) && hr > 0
                    && Number.isFinite(bl) && bl > 0 && Number.isFinite(br) && br > 0
                    && Number.isFinite(tl) && tl > 0 && Number.isFinite(tr) && tr > 0;
            }
            return false;
        }
        
        // Fallback to old format for backward compatibility
        const type = formData.bettung_type;
        if (type == null) return false;
        
        if (type === 'on_last') {
            // For on_last: only type is required, Zusätzliche Notizen is optional
            return true;
        }
        if (type === 'built_up') {
            // For built_up: only thickness fields are required, notes are optional
            const parse = (s: string | undefined) => {
                if (s == null || s.trim() === '') return NaN;
                return parseFloat(String(s).replace(',', '.'));
            };
            const hl = parse(formData.thickness_heel_l);
            const hr = parse(formData.thickness_heel_r);
            const bl = parse(formData.thickness_ball_l);
            const br = parse(formData.thickness_ball_r);
            const tl = parse(formData.thickness_toe_l);
            const tr = parse(formData.thickness_toe_r);
            return Number.isFinite(hl) && hl > 0 && Number.isFinite(hr) && hr > 0
                && Number.isFinite(bl) && bl > 0 && Number.isFinite(br) && br > 0
                && Number.isFinite(tl) && tl > 0 && Number.isFinite(tr) && tr > 0;
        }
        return false;
    };

    const weiterDisabled = isLoading || (formData.bedding_required === true && !isBettungValid());

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Neuer Auftrag erstellen</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* AUFTRAGSÜBERSICHT Section */}
                        <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6 space-y-4">
                            <h3 className="text-sm font-semibold tracking-wide text-[#7583a0] uppercase mb-2">
                                AUFTRAGSÜBERSICHT
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kunde</label>
                                    <p className="text-gray-900 font-semibold text-sm">
                                        {customer?.vorname || ''} {customer?.nachname || ''}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon</label>
                                    <p className="text-gray-900 font-semibold text-sm">
                                        {customer?.telefonnummer || customer?.telefon || '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">E-Mail</label>
                                    <p className="text-gray-900 text-sm">{customer?.email || '-'}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Wohnort</label>
                                    <p className="text-gray-900 text-sm">{customer?.wohnort || '-'}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Datum des Auftrags</label>
                                    <p className="text-gray-900 text-sm">
                                        {orderDate ? new Date(orderDate).toLocaleDateString('de-DE') : '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Fertigstellung bis</label>
                                    <p className="text-gray-900 text-sm">
                                        {fertigstellungDate ? new Date(fertigstellungDate).toLocaleDateString('de-DE') : '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Filiale</label>
                                    {(() => {
                                        const currentLocation = locations.find(loc =>
                                            (loc.description || loc.address) === filiale ||
                                            loc.description === filiale ||
                                            loc.address === filiale
                                        );
                                        if (currentLocation) {
                                            return (
                                                <div className="flex flex-col">
                                                    <p className="text-gray-900 text-sm font-semibold">{currentLocation.description || currentLocation.address}</p>
                                                    {currentLocation.description && currentLocation.address && currentLocation.description !== currentLocation.address && (
                                                        <p className="text-gray-600 text-xs mt-0.5">{currentLocation.address}</p>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return <p className="text-gray-900 text-sm">{filiale || customer?.wohnort || '-'}</p>;
                                    })()}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Versorgung</label>
                                    <p className="text-gray-900 text-sm">
                                        {formData.arztlicheDiagnose ? formData.arztlicheDiagnose.slice(0, 40) + (formData.arztlicheDiagnose.length > 40 ? '…' : '') : '-'}
                                    </p>
                                </div>
                                {/* Standort auswählen + Menge */}
                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(locations.length > 0 || (user?.hauptstandort && user.hauptstandort.length > 0)) && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 mb-1 block">Standort auswählen</label>
                                            <Select
                                                value={selectedLocation}
                                                onValueChange={(value) => {
                                                    setSelectedLocation(value);
                                                    // Also update filiale when location changes
                                                    const selectedLoc = locations.find(loc =>
                                                        (loc.description || loc.address) === value
                                                    );
                                                    if (selectedLoc) {
                                                        setFiliale(selectedLoc.description || selectedLoc.address);
                                                    } else {
                                                        setFiliale(value);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={locationsLoading ? "Lade Standorte..." : "Standort wählen"}>
                                                        {selectedLocation && locations.length > 0 ? (() => {
                                                            const selectedLoc = locations.find(loc =>
                                                                (loc.description || loc.address) === selectedLocation
                                                            );
                                                            if (selectedLoc) {
                                                                return selectedLoc.description || selectedLoc.address;
                                                            }
                                                            return selectedLocation;
                                                        })() : selectedLocation}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.length > 0 ? (
                                                        locations.map((location) => (
                                                            <SelectItem
                                                                key={location.id}
                                                                value={location.description || location.address}
                                                            >
                                                                <div className="flex flex-col items-start w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{location.description || location.address}</span>
                                                                        {location.isPrimary && (
                                                                            <span className="px-1.5 py-0.5 text-xs text-blue-600 bg-blue-50 rounded">Primary</span>
                                                                        )}
                                                                    </div>
                                                                    {location.description && location.address && (
                                                                        <span className="text-xs text-gray-500 mt-0.5">{location.address}</span>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    ) : user?.hauptstandort && user.hauptstandort.length > 0 ? (
                                                        user.hauptstandort.map((location) => (
                                                            <SelectItem key={location} value={location}>
                                                                {location}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="no-location" disabled>
                                                            Kein Standort verfügbar
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-1 block">Menge</label>
                                        <Select
                                            value={quantity.toString()}
                                            onValueChange={(value) => setQuantity(parseInt(value, 10))}
                                        >
                                            <SelectTrigger className="w-full rounded-2xl border border-[#dde3ee] bg-white h-11 px-4">
                                                <SelectValue placeholder="Menge wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Paar</SelectItem>
                                                <SelectItem value="2">2 Paare</SelectItem>
                                                <SelectItem value="3">3 Paare</SelectItem>
                                                <SelectItem value="4">4 Paare</SelectItem>
                                                <SelectItem value="5">5 Paare</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <PaymentStatusSection
                                        value={bezahlt}
                                        onChange={setBezahlt}
                                        disabledOptions={disabledPaymentOptions}
                                        allowDualSelection={allowDualPaymentSelection}
                                        layout="compactRow"
                                    />
                                </div>
                            </div>


                        </div>

                        <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Wirtschaftlicher Aufpreis (Add-on)</label>
                            <Input
                                type="text"
                                value={addonPrices}
                                onChange={(e) => setAddonPrices(e.target.value)}
                                placeholder="Preis eingeben, z.B. 25 oder 10,5"
                                className="h-11"
                            />
                        </div>

                        {/* Preisübersicht */}
                        {(() => {
                            const vatCountry = user?.accountInfo?.vat_country;
                            const getVatRate = () => {
                                if (vatCountry === 'Italien (IT)') return 4;
                                if (vatCountry === 'Österreich (AT)') return 20;
                                return 0;
                            };
                            const formatPrice = (n: number) => n.toFixed(2).replace('.', ',') + '€';

                            if (formData.billingType === 'Krankenkassa') {
                                const allPosData = [...(formData.positionsnummerAustriaData || []), ...(formData.positionsnummerItalyData || [])];
                                const getPosNum = (o: any) => o?.positionsnummer || o?.description?.positionsnummer || '';
                                const itemSides = formData.itemSides || {};
                                // BDS = price × 2 per position
                                const positionsSum = (formData.selectedPositionsnummer || []).reduce((sum, posNum) => {
                                    const opt = allPosData.find((o: any) => getPosNum(o) === posNum);
                                    const basePrice = typeof opt?.price === 'number' ? opt.price : 0;
                                    const side = itemSides[posNum] || 'R';
                                    return sum + (side === 'BDS' ? basePrice * 2 : basePrice);
                                }, 0);
                                const qty = quantity || 1;
                                const positionsSubtotal = positionsSum * qty;
                                const vatRate = getVatRate();
                                const vatAmount = (positionsSubtotal * vatRate) / 100;
                                const total = positionsSubtotal + vatAmount;
                                return (
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Preisübersicht</h3>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3">
                                            {(formData.selectedPositionsnummer || []).length > 0 ? (
                                                <>
                                                    {(formData.selectedPositionsnummer || []).map((posNum) => {
                                                        const opt = allPosData.find((o: any) => getPosNum(o) === posNum);
                                                        const basePrice = typeof opt?.price === 'number' ? opt.price : 0;
                                                        const side = itemSides[posNum] || 'R';
                                                        const linePrice = side === 'BDS' ? basePrice * 2 : basePrice;
                                                        const sideLabel = side === 'BDS' ? 'Beide (BDS)' : side === 'L' ? 'Links (L)' : 'Rechts (R)';
                                                        return (
                                                            <div key={posNum} className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-600">
                                                                    {posNum}
                                                                    {side !== 'R' && (
                                                                        <span className="ml-1.5 text-xs text-gray-500">Seite: {sideLabel}</span>
                                                                    )}
                                                                </span>
                                                                <span className="font-semibold text-gray-900">{formatPrice(linePrice)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Menge</span>
                                                        <span className="font-semibold text-gray-900">× {qty}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                                        <span className="text-sm text-gray-600">Zwischensumme</span>
                                                        <span className="text-sm font-semibold text-gray-900">{formatPrice(positionsSubtotal)}</span>
                                                    </div>
                                                    {vatRate > 0 && (
                                                        <>
                                                            {addonPricesTotal > 0 && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-600">Wirtschaftlicher Aufpreis</span>
                                                                    <span className="text-sm font-semibold text-gray-700">{formatPrice(addonPricesTotal)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">+{vatRate}% MwSt.</span>
                                                                <span className="text-sm font-semibold text-gray-700">{formatPrice(vatAmount)}</span>
                                                            </div>
                                                            {vatCountry === 'Österreich (AT)' && (
                                                                <div className="flex justify-between items-center pt-1.5">
                                                                    <span className="text-xs text-gray-500">Enthält Eigenanteil (AT):</span>
                                                                    <span className="text-xs text-gray-600">46,20€</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                                                <span className="text-base font-bold text-gray-900">Gesamt</span>
                                                                <span className="text-xl font-bold text-green-600">{formatPrice(vatCountry === 'Österreich (AT)' ? total + AUSTRIA_PRIVATE_SHARE + addonPricesTotal : total + addonPricesTotal)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {vatRate === 0 && (
                                                        <>
                                                            {addonPricesTotal > 0 && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-600">Wirtschaftlicher Aufpreis</span>
                                                                    <span className="text-sm font-semibold text-gray-700">{formatPrice(addonPricesTotal)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                                                <span className="text-base font-bold text-gray-900">Gesamt</span>
                                                                <span className="text-xl font-bold text-green-600">{formatPrice(positionsSubtotal + addonPricesTotal)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-sm text-gray-500">Keine Positionen ausgewählt</div>
                                                    {addonPricesTotal > 0 && (
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Wirtschaftlicher Aufpreis</span>
                                                            <span className="font-semibold text-gray-900">{formatPrice(addonPricesTotal)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                                        <span className="text-base font-bold text-gray-900">Gesamt</span>
                                                        <span className="text-xl font-bold text-green-600">{formatPrice(addonPricesTotal)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            // Privat: Basispreis (Add-on) → Rabatt (%) → Brutto nach Rabatt → Menge → Gesamt
                            const qty = quantity || 1;
                            const pc = formData.priceCalculations;
                            const basisPreis = pc?.basisPreis ?? (formData.nettoPreis ? parseFloat(formData.nettoPreis) : 0);
                            const rabattPercent = formData.rabatt ? parseFloat(formData.rabatt) : 0;
                            const discountAmount = pc?.discountAmount ?? (rabattPercent > 0 ? (basisPreis * rabattPercent) / 100 : 0);
                            const bruttoUnit = formData.brutto ? parseFloat(formData.brutto) : (basisPreis - discountAmount);
                            const bruttoTotal = bruttoUnit * qty;
                            const vatPercent = formData.tax ? parseFloat(formData.tax) : 0;
                            const gesamtPrivat = bruttoTotal;
                            return (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Preisübersicht</h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3">
                                        {basisPreis > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Basispreis (Brutto)</span>
                                                <span className="font-semibold text-gray-900">{formatPrice(basisPreis)}</span>
                                            </div>
                                        )}
                                        {rabattPercent > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Rabatt ({rabattPercent.toFixed(0)}%)</span>
                                                <span className="font-semibold text-red-600">-{formatPrice(discountAmount)}</span>
                                            </div>
                                        )}
                                        {bruttoUnit > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Brutto nach Rabatt</span>
                                                <span className="font-semibold text-gray-900">{formatPrice(bruttoUnit)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Menge</span>
                                            <span className="font-semibold text-gray-900">{qty} {qty === 1 ? 'Paar' : 'Paare'}{qty > 1 ? ` × ${formatPrice(bruttoUnit)}` : ''}</span>
                                        </div>
                                        {addonPricesTotal > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Wirtschaftlicher Aufpreis</span>
                                                <span className="font-semibold text-gray-900">{formatPrice(addonPricesTotal)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                            <span className="text-base font-bold text-gray-900">Gesamt</span>
                                            <span className="text-xl font-bold text-green-600">{formatPrice(gesamtPrivat + addonPricesTotal)}</span>
                                        </div>
                                        {bruttoUnit > 0 && vatPercent > 0 && (
                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-xs text-gray-500">MwSt. ({vatPercent}%)</span>
                                                <span className="text-xs text-gray-500">enthalten</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* KONTROLLE & AKTIONEN Section */}
                        <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6 space-y-4">
                            <h3 className="text-sm font-semibold tracking-wide text-[#7583a0] uppercase">
                                KONTROLLE & AKTIONEN
                            </h3>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f6ff] text-[#1E76FF]">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500">Abholung</span>
                                        {(() => {
                                            const currentLocation = locations.find(loc =>
                                                (loc.description || loc.address) === filiale ||
                                                loc.description === filiale ||
                                                loc.address === filiale ||
                                                (loc.description || loc.address) === selectedLocation
                                            );
                                            if (currentLocation) {
                                                return (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {currentLocation.description || currentLocation.address}
                                                        </span>
                                                        {currentLocation.description && currentLocation.address && currentLocation.description !== currentLocation.address && (
                                                            <span className="text-xs text-gray-500 mt-0.5">
                                                                {currentLocation.address}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {filiale || customer?.wohnort || selectedLocation || '-'}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full px-5 py-2 text-sm font-medium border-[#dde3ee] bg-white flex items-center gap-2 shadow-none cursor-pointer"
                                        onClick={() => setShowNotizTextarea(!showNotizTextarea)}
                                    >
                                        <StickyNote className="w-4 h-4 text-gray-700" />
                                        <span>Notiz hinzufügen</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6 space-y-4">
                            <h3 className="text-sm font-semibold tracking-wide text-[#7583a0] uppercase">
                                Werkstattzettel
                            </h3>
                            <p className="text-sm text-gray-500">
                                Soll der Werkstattzettel mit ausgedruckt werden?
                            </p>
                            <div className="grid grid-cols-2 gap-3 max-w-xs">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={shouldPrintWerkstattzettel
                                        ? 'border-[#61A178] bg-[#61A178] text-white hover:bg-[#4A8A5F] hover:text-white'
                                        : 'border-[#dde3ee] bg-white text-gray-700 hover:bg-gray-50'}
                                    onClick={() => setShouldPrintWerkstattzettel(true)}
                                >
                                    Ja
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={!shouldPrintWerkstattzettel
                                        ? 'border-[#61A178] bg-[#61A178] text-white hover:bg-[#4A8A5F] hover:text-white'
                                        : 'border-[#dde3ee] bg-white text-gray-700 hover:bg-gray-50'}
                                    onClick={() => setShouldPrintWerkstattzettel(false)}
                                >
                                    Nein
                                </Button>
                            </div>
                        </div>

                        {/* Notiz textarea - shown when "Notiz hinzufügen" is clicked (same as WerkstattzettelModal) */}
                        {showNotizTextarea && (
                            <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notiz</label>
                                <textarea
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder="Notiz eingeben..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                />
                            </div>
                        )}

                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={weiterDisabled}
                            className="flex-1 bg-[#62A07C] hover:bg-[#4A8A5F] text-white min-w-[140px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Wird gespeichert...</span>
                                </>
                            ) : (
                                'Weiter'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation modal: show before submitting order */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Auftrag bestätigen</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 py-2">
                        Möchten Sie den Auftrag wirklich erstellen?
                    </p>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowConfirmModal(false)}
                            disabled={isLoading}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            onClick={async () => {
                                setShowConfirmModal(false);
                                await handleSubmit();
                            }}
                            disabled={isLoading}
                            className="bg-[#62A07C] hover:bg-[#4A8A5F] text-white"
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

