import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { MapPin, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { initializeDeliveryDate, getRequiredDeliveryDate } from './utils/dateUtils';
import { getSettingData } from '@/apis/einlagenApis';
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types';
import { getAllLocations } from '@/apis/setting/locationManagementApis';
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
    half_sample_required?: boolean;
    preparation_date?: string;
    notes?: string;
    fitting_date?: string;
    adjustments?: string;
    customer_reviews?: string;
    has_trim_strips?: boolean;
    step2_material?: string;
    leistentyp?: string;
    step2_notes?: string;
    bedding_required?: boolean;
    step3_material?: string;
    step3_thickness?: string;
    step3_notes?: string;
    supply_note?: string;
    quantity?: number;
    total_price?: number;
    payment_status?: string;
    deposit_provision?: number;
    foot_analysis_price?: number | object;
    pick_up_location?: string;
    store_location?: string;
    order_note?: string;
}

interface MassschuheOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
    formData: {
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
        billingType?: 'Krankenkassa' | 'Privat';
        price?: string;
        tax?: string;
        /** Produktionsworkflow – same names as API payload */
        has_trim_strips?: boolean;
        step2_material?: string;
        leistentyp?: string;
        step2_notes?: string;
        bedding_required?: boolean;
        step3_material?: string;
        step3_thickness?: string;
        step3_notes?: string;
        adjustments?: string;
        customer_reviews?: string;
        /** Halbprobe from Produktionsworkflow – when true, send Step 4 & 5 data */
        halbprobeErforderlich?: boolean | null;
        step4_preparation_date?: string;
        step4_notes?: string;
        step5_fitting_date?: string;
    };
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
    const [locations, setLocations] = useState<Array<{id: string; address: string; description: string; isPrimary: boolean}>>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [showNotizTextarea, setShowNotizTextarea] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { user } = useAuth();

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
    }, [isOpen, user?.hauptstandort, customer, completionDays, formData.billingType, laserPrintPrices]);

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

        if (paymentType === 'privat') {
            const footPrice = getFußanalysePrice(selectedFußanalyse);
            if (!selectedFußanalyse && !selectedEinlagenversorgung) {
                toast.error('Bitte wählen Sie beide Preise aus (Fußanalyse und Einlagenversorgung)');
                return;
            }
            if (!selectedFußanalyse || selectedFußanalyse === '__none__' || footPrice <= 0) {
                toast.error('Bitte wählen Sie einen Preis für Fußanalyse aus');
                return;
            }
            if (!selectedEinlagenversorgung) {
                toast.error('Bitte wählen Sie einen Preis für Einlagenversorgung aus');
                return;
            }
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

        // Build insurances array for v2 (with vat_country), then JSON string
        const vatCountryCode = user?.accountInfo?.vat_country === 'Österreich (AT)' ? 'AT' : user?.accountInfo?.vat_country === 'Italien (IT)' ? 'IT' : 'DE';
        const buildInsurancesForV2 = (): string => {
            if (!formData.selectedPositionsnummer || formData.selectedPositionsnummer.length === 0) {
                return '[]';
            }
            const allData = [...(formData.positionsnummerAustriaData || []), ...(formData.positionsnummerItalyData || [])];
            const arr = formData.selectedPositionsnummer.map(posNum => {
                const option = allData.find(opt => getPositionsnummer(opt) === posNum);
                if (option) {
                    return {
                        price: option.price,
                        description: typeof option.description === 'object' ? option.description : {},
                        vat_country: vatCountryCode,
                    };
                }
                return null;
            }).filter(Boolean);
            return JSON.stringify(arr);
        };

        // Total price (Gesamt): Krankenkassa = positions * qty + VAT; Privat = (foot + insole) * qty
        let totalPrice: number;
        if (paymentType === 'privat') {
            totalPrice = (getFußanalysePrice(selectedFußanalyse) + (parseFloat(selectedEinlagenversorgung) || 0)) * qty;
        } else {
            const allPosData = [...(formData.positionsnummerAustriaData || []), ...(formData.positionsnummerItalyData || [])];
            const getPosNum = (o: any) => o?.positionsnummer || o?.description?.positionsnummer || '';
            const positionsSum = (formData.selectedPositionsnummer || []).reduce((sum, posNum) => {
                const opt = allPosData.find((o: any) => getPosNum(o) === posNum);
                return sum + (typeof opt?.price === 'number' ? opt.price : 0);
            }, 0);
            const vatRate = vatCountryCode === 'IT' ? 4 : vatCountryCode === 'AT' ? 20 : 0;
            totalPrice = positionsSum * qty * (1 + vatRate / 100);
        }

        const branchLocationJson = JSON.stringify({
            title: selectedLoc?.description || filiale,
            description: selectedLoc?.address || '',
        });
        const pickUpLocationJson = JSON.stringify({ title: filiale || selectedLocation });
        const storeLocationJson = JSON.stringify({ title: selectedLoc?.description || filiale, description: selectedLoc?.address || '' });

        const halfSampleRequired = formData.halbprobeErforderlich === true;
        const preparationDateIso = orderDate ? new Date(orderDate + 'T12:00:00.000Z').toISOString() : undefined;
        const fittingDateIso = fertigstellungDate ? new Date(fertigstellungDate + 'T12:00:00.000Z').toISOString() : undefined;

        // When half_sample_required is true: use Step 4 (preparation_date, notes) and Step 5 (fitting_date, adjustments, customer_reviews)
        const preparationDateWhenHalfSample = halfSampleRequired && formData.step4_preparation_date
            ? formData.step4_preparation_date
            : undefined;
        const notesWhenHalfSample = halfSampleRequired ? (formData.step4_notes ?? orderNote ?? undefined) : (orderNote || undefined);
        const fittingDateWhenHalfSample = halfSampleRequired && formData.step5_fitting_date
            ? formData.step5_fitting_date
            : undefined;
        const adjustmentsWhenHalfSample = halfSampleRequired ? (formData.adjustments ?? '') : undefined;
        const customerReviewsWhenHalfSample = halfSampleRequired ? (formData.customer_reviews ?? '') : undefined;

        // Build v2 payload: use null for empty optional strings so keys are always in JSON (same names as API)
        const v2Payload: MassschuheOrderV2Payload = {
            customerId: customer.id,
            medical_diagnosis: formData.arztlicheDiagnose || undefined,
            detailed_diagnosis: formData.ausführlicheDiagnose || undefined,
            price: paymentType === 'privat' ? parseFloat(formData.price || '0') || undefined : undefined,
            vat_rate: paymentType === 'privat' && formData.tax ? parseFloat(formData.tax) || undefined : undefined,
            branch_location: branchLocationJson,
            employeeId: formData.selectedEmployeeId || undefined,
            kva: formData.kostenvoranschlag === true,
            halbprobe: formData.halbprobeGeplant === true,
            insurances: (formData.selectedPositionsnummer?.length && paymentType === 'krankenkasse') ? buildInsurancesForV2() : undefined,
            half_sample_required: halfSampleRequired,
            preparation_date: halfSampleRequired ? (preparationDateWhenHalfSample ?? undefined) : undefined,
            notes: halfSampleRequired ? notesWhenHalfSample : (orderNote || undefined),
            fitting_date: halfSampleRequired ? (fittingDateWhenHalfSample ?? undefined) : undefined,
            adjustments: adjustmentsWhenHalfSample,
            customer_reviews: customerReviewsWhenHalfSample,
            has_trim_strips: formData.has_trim_strips ?? false,
            step2_material: formData.step2_material ?? '',
            leistentyp: formData.leistentyp ?? '',
            step2_notes: formData.step2_notes ?? '',
            bedding_required: formData.bedding_required ?? false,
            step3_material: formData.bedding_required ? (formData.step3_material ?? '') : undefined,
            step3_thickness: formData.bedding_required ? (formData.step3_thickness ?? '') : undefined,
            step3_notes: formData.bedding_required ? (formData.step3_notes ?? '') : undefined,
            supply_note: formData.versorgungNote || undefined,
            quantity: qty,
            total_price: totalPrice,
            payment_status: bezahlt || undefined,
            foot_analysis_price: paymentType === 'privat' && selectedFußanalyse ? getFußanalysePrice(selectedFußanalyse) : undefined,
            pick_up_location: pickUpLocationJson,
            store_location: storeLocationJson,
            order_note: orderNote || undefined,
        };

        await onSubmit(v2Payload);
    };

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

                            <div>
                                <PaymentStatusSection
                                    value={bezahlt}
                                    onChange={setBezahlt}
                                    disabledPaymentType={formData.billingType === 'Krankenkassa' ? 'Krankenkasse' : formData.billingType === 'Privat' ? 'Privat' : undefined}
                                />
                            </div>
                        </div>

                        {/* Standort auswählen + Menge */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    {/* PREISAUSWAHL Section - first (only when Privat) */}
                    {formData.billingType === 'Privat' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 uppercase mb-4">PREISAUSWAHL</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Fußanalyse</label>
                                    <Select
                                        value={selectedFußanalyse || '__none__'}
                                        onValueChange={(value) => setSelectedFußanalyse(value === '__none__' ? '' : value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    pricesLoading
                                                        ? 'Lade Preise...'
                                                        : laserPrintPrices.length > 0
                                                            ? 'Preis auswählen'
                                                            : 'Kein Preis verfügbar'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__" className="cursor-pointer">
                                                {pricesLoading ? 'Lade Preise...' : 'Preis auswählen'}
                                            </SelectItem>
                                            {laserPrintPrices.length > 0 ? (
                                                laserPrintPrices.map((item, index) => (
                                                    <SelectItem
                                                        key={`foot-${item.name}-${item.price}-${index}`}
                                                        value={`${index}__${item.price}`}
                                                        className="cursor-pointer"
                                                    >
                                                        {item.name} - {item.price.toFixed(2).replace(".", ",")}€
                                                    </SelectItem>
                                                ))
                                            ) : null}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Einlagenversorgung</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={selectedEinlagenversorgung}
                                        onChange={(e) => setSelectedEinlagenversorgung(e.target.value)}
                                        placeholder="Standard Einlagen - €180"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preisübersicht - second, below PREISAUSWAHL (always visible) */}
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
                            const positionsSum = (formData.selectedPositionsnummer || []).reduce((sum, posNum) => {
                                const opt = allPosData.find((o: any) => getPosNum(o) === posNum);
                                return sum + (typeof opt?.price === 'number' ? opt.price : 0);
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
                                                    const price = typeof opt?.price === 'number' ? opt.price : 0;
                                                    return (
                                                        <div key={posNum} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">{posNum}</span>
                                                            <span className="font-semibold text-gray-900">{formatPrice(price)}</span>
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
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">+{vatRate}% MwSt.</span>
                                                            <span className="text-sm font-semibold text-gray-700">{formatPrice(vatAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                                            <span className="text-base font-bold text-gray-900">Gesamt</span>
                                                            <span className="text-xl font-bold text-green-600">{formatPrice(total)}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {vatRate === 0 && (
                                                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                                        <span className="text-base font-bold text-gray-900">Gesamt</span>
                                                        <span className="text-xl font-bold text-green-600">{formatPrice(positionsSubtotal)}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-sm text-gray-500">Keine Positionen ausgewählt</div>
                                                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                                    <span className="text-base font-bold text-gray-900">Gesamt</span>
                                                    <span className="text-xl font-bold text-green-600">0,00€</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Privat: Fußanalyse × Menge + Einlagenversorgung × Menge
                        const qty = quantity || 1;
                        const foot = getFußanalysePrice(selectedFußanalyse);
                        const insole = parseFloat(selectedEinlagenversorgung) || 0;
                        const footTotal = foot * qty;
                        const insoleTotal = insole * qty;
                        const privSubtotal = footTotal + insoleTotal;
                        return (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Preisübersicht</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Fußanalyse {qty > 1 ? `(× ${qty})` : ''}</span>
                                        <span className="text-sm font-semibold text-gray-900">{formatPrice(footTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Einlagenversorgung {qty > 1 ? `(× ${qty})` : ''}</span>
                                        <span className="text-sm font-semibold text-gray-900">{formatPrice(insoleTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Menge</span>
                                        <span className="font-semibold text-gray-900">{qty} {qty === 1 ? 'Paar' : 'Paare'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                        <span className="text-sm text-gray-600">Zwischensumme</span>
                                        <span className="text-sm font-semibold text-gray-900">{formatPrice(privSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                                        <span className="text-base font-bold text-gray-900">Gesamt</span>
                                        <span className="text-xl font-bold text-green-600">{formatPrice(privSubtotal)}</span>
                                    </div>
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
                        disabled={isLoading}
                        className="flex-1 bg-[#62A07C] hover:bg-[#4A8A5F] text-white min-w-[140px] flex items-center justify-center gap-2"
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

