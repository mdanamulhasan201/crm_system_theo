import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { MapPin, FileText, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { initializeDeliveryDate, getRequiredDeliveryDate } from './utils/dateUtils';
import { getSettingData } from '@/apis/einlagenApis';
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types';
import { getAllLocations } from '@/apis/setting/locationManagementApis';

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

interface OrderFormData {
    customerId: string;
    employeeId: string;
    arztliche_diagnose: string;
    usführliche_diagnose: string;
    rezeptnummer: string;
    durchgeführt_von: string;
    note: string;
    halbprobe_geplant: boolean;
    kostenvoranschlag: boolean;
    statusBezahlt?: boolean;
    datumAuftrag: string;
    fertigstellungBis?: string;
    filiale: {
        address: string;
        description: string;
    };
    paymentType: 'krankenkasse' | 'privat';
    fußanalyse?: number;
    einlagenversorgung?: number;
    quantity?: number;
    orderNote?: string;
    location?: string;
    insurances?: Array<{
        price: number;
        description: any;
    }>;
    // Additional fields for API
    delivery_date?: string;
    telefon?: string;
    kunde?: string;
    email?: string;
    button_text?: string;
    customer_note?: string;
}

interface MassschuheOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
    formData: {
        arztlicheDiagnose: string;
        ausführlicheDiagnose: string;
        rezeptnummer: string;
        versorgungNote: string;
        halbprobeGeplant: boolean | null;
        kostenvoranschlag: boolean | null;
        selectedEmployee: string;
        selectedEmployeeId: string;
        selectedPositionsnummer?: string[];
        positionsnummerAustriaData?: any[];
        positionsnummerItalyData?: any[];
        billingType?: 'Krankenkassa' | 'Privat';
    };
    onSubmit: (orderData: OrderFormData) => Promise<void>;
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
    const [isPaid, setIsPaid] = useState<boolean>(true);
    const [quantity, setQuantity] = useState<number>(1);
    const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([]);
    const [pricesLoading, setPricesLoading] = useState(false);
    const [locations, setLocations] = useState<Array<{id: string; address: string; description: string; isPrimary: boolean}>>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);

    const { user } = useAuth();

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
                // When Privat is selected, preselect first available laser print price if available
                if (laserPrintPrices.length > 0) {
                    setSelectedFußanalyse(String(laserPrintPrices[0].price));
                }
            } else {
                setPaymentType(null);
            }
            
            // Reset price selections only if not Privat
            if (formData.billingType !== 'Privat') {
                setSelectedFußanalyse('');
                setSelectedEinlagenversorgung('');
            }
            setOrderNote('');
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
            if (!selectedFußanalyse && !selectedEinlagenversorgung) {
                toast.error('Bitte wählen Sie beide Preise aus (Fußanalyse und Einlagenversorgung)');
                return;
            }
            if (!selectedFußanalyse) {
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

        // Build insurances array from selected positionsnummer
        const buildInsurancesArray = () => {
            if (!formData.selectedPositionsnummer || formData.selectedPositionsnummer.length === 0) {
                return [];
            }
            
            const allData = [...(formData.positionsnummerAustriaData || []), ...(formData.positionsnummerItalyData || [])];
            
            return formData.selectedPositionsnummer.map(posNum => {
                // Find the option in both Austrian and Italian data
                const option = allData.find(opt => getPositionsnummer(opt) === posNum);
                
                if (option) {
                    return {
                        price: option.price,
                        description: typeof option.description === 'object' ? option.description : {}
                    };
                }
                
                return null;
            }).filter(item => item !== null) as Array<{ price: number; description: any }>;
        };

        const orderData: OrderFormData = {
            customerId: customer.id,
            employeeId: formData.selectedEmployeeId,
            arztliche_diagnose: formData.arztlicheDiagnose,
            usführliche_diagnose: formData.ausführlicheDiagnose,
            rezeptnummer: formData.rezeptnummer,
            durchgeführt_von: formData.selectedEmployee,
            note: formData.versorgungNote,
            halbprobe_geplant: formData.halbprobeGeplant === true,
            kostenvoranschlag: formData.kostenvoranschlag === true,
            datumAuftrag: orderDate,
            fertigstellungBis: fertigstellungDate || undefined,
            filiale: filialeObject,
            paymentType: paymentType,
            statusBezahlt: isPaid,
            fußanalyse: paymentType === 'privat' ? parseFloat(selectedFußanalyse) * qty : undefined,
            einlagenversorgung: paymentType === 'privat' ? parseFloat(selectedEinlagenversorgung) * qty : undefined,
            quantity: paymentType === 'privat' ? qty : undefined,
            orderNote: orderNote,
            location: selectedLocation || undefined,
            insurances: buildInsurancesArray(),
            // Additional fields
            delivery_date: fertigstellungDate || undefined,
            telefon: customerPhone,
            kunde: customerName,
            email: customerEmail,
            button_text: 'Bestellung speichern',
            customer_note: orderNote,
        };

        await onSubmit(orderData);
    };

    return (
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
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-gray-900 font-semibold text-sm">Bezahlt</span>
                                    {/* Ja checkbox */}
                                    <button
                                        type="button"
                                        onClick={() => setIsPaid(true)}
                                        className="flex items-center gap-2 text-xs text-gray-700"
                                    >
                                        <span
                                            className={cn(
                                                "w-4 h-4 rounded-[4px] border transition-colors",
                                                isPaid
                                                    ? "border-[#1E76FF] bg-[#1E76FF]"
                                                    : "border-[#d0d7e6] bg-white"
                                            )}
                                        />
                                        <span>Ja</span>
                                    </button>
                                    {/* Nein checkbox */}
                                    <button
                                        type="button"
                                        onClick={() => setIsPaid(false)}
                                        className="flex items-center gap-2 text-xs text-gray-700"
                                    >
                                        <span
                                            className={cn(
                                                "w-4 h-4 rounded-[4px] border transition-colors",
                                                !isPaid
                                                    ? "border-[#1E76FF] bg-[#1E76FF]"
                                                    : "border-[#d0d7e6] bg-white"
                                            )}
                                        />
                                        <span>Nein</span>
                                    </button>
                                </div>
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

                    {/* PREISAUSWAHL Section - shown only when Privat is selected from main form */}
                    {formData.billingType === 'Privat' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 uppercase mb-4">PREISAUSWAHL</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Fußanalyse</label>
                                    <Select
                                        value={selectedFußanalyse}
                                        onValueChange={(value) => setSelectedFußanalyse(value)}
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
                                            {laserPrintPrices.length > 0 ? (
                                                laserPrintPrices.map((item, index) => (
                                                    <SelectItem
                                                        key={`foot-${item.name}-${item.price}-${index}`}
                                                        value={String(item.price)}
                                                        className="cursor-pointer"
                                                    >
                                                        {item.name} - {item.price.toFixed(2).replace(".", ",")}€
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-price" disabled>
                                                    Kein Preis verfügbar
                                                </SelectItem>
                                            )}
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
                                    className="rounded-full px-5 py-2 text-sm font-medium border-[#dde3ee] bg-white flex items-center gap-2 shadow-none"
                                >
                                    <FileText className="w-4 h-4 text-gray-700" />
                                    <span>PDF anzeigen</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full px-5 py-2 text-sm font-medium border-[#dde3ee] bg-white flex items-center gap-2 shadow-none"
                                >
                                    <StickyNote className="w-4 h-4 text-gray-700" />
                                    <span>Notiz hinzufügen</span>
                                </Button>
                            </div>
                        </div>
                    </div>

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
                        onClick={handleSubmit}
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
    );
}

