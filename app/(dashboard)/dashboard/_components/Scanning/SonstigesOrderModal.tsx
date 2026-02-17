'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllLocations } from '@/apis/setting/locationManagementApis';
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { getSettingData } from '@/apis/einlagenApis';
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types';
import { createSonstiges } from '@/apis/SonstigesApis';
import CustomerInfoSection from './Werkstattzettel/FormSections/CustomerInfoSection';
import PriceSection from './Werkstattzettel/FormSections/PriceSection';

interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    telefonnummer?: string;
    wohnort?: string;
}

interface FormData {
    customerId: string;
    leistungsname: string;
    kategorie?: string | null;
    menge: number;
    nettoPreis: number;
    bruttoPreis: number;
    mwst: number;
    rabatt: number;
    steuersatz: number;
    isNetto: boolean;
    leistungsnotiz?: string | null;
    selectedEmployee: string;
    selectedEmployeeId: string;
    kundenName: string;
    email: string;
    telefon: string;
    wohnort: string;
}

interface SonstigesOrderModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer;
    formData?: FormData | null;
    onOrderComplete?: () => void;
}

export default function SonstigesOrderModal({
    isOpen,
    onOpenChange,
    customer,
    formData,
    onOrderComplete,
}: SonstigesOrderModalProps) {
    // Customer information state
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [wohnort, setWohnort] = useState('');
    const [email, setEmail] = useState('');
    const [telefonnummer, setTelefonnummer] = useState('');
    
    // Order details state
    const [datumAuftrag, setDatumAuftrag] = useState('');
    const [geschaeftsstandort, setGeschaeftsstandort] = useState<any>(null);
    const [fertigstellungBis, setFertigstellungBis] = useState('');
    const [fertigstellungBisTime, setFertigstellungBisTime] = useState('--:--');
    const [menge, setMenge] = useState('1 paar');
    
    // Employee dropdown
    const {
        searchText: employeeSearchText,
        suggestions: employeeSuggestions,
        loading: employeeLoading,
        setShowSuggestions,
        handleChange: handleEmployeeSearchChange,
    } = useSearchEmployee();
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    
    // Location dropdown
    const [locations, setLocations] = useState<Array<{id: string; address: string; description: string; isPrimary: boolean}>>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    
    // Payment status
    const [bezahlt, setBezahlt] = useState('Privat_Bezahlt');
    const [paymentType, setPaymentType] = useState<'Privat' | 'Krankenkasse'>('Privat');
    const [paymentStatus, setPaymentStatus] = useState<string>('Bezahlt');
    
    // Price dropdowns state
    const [footAnalysisPrice, setFootAnalysisPrice] = useState<string>('');
    const [insoleSupplyPrice, setInsoleSupplyPrice] = useState<string>('');
    const [customFootPrice, setCustomFootPrice] = useState<string>('');
    const [customInsolePrice, setCustomInsolePrice] = useState<string>('');
    const [discountType, setDiscountType] = useState<string>(''); // default: Kein Rabatt
    const [discountValue, setDiscountValue] = useState<string>('');
    const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([]);
    const [pricesLoading, setPricesLoading] = useState(false);

    // Initialize form with customer data when modal opens
    useEffect(() => {
        if (isOpen && customer && formData) {
            setVorname(customer.vorname || '');
            setNachname(customer.nachname || '');
            setWohnort(customer.wohnort || formData.wohnort || '');
            setEmail(customer.email || formData.email || '');
            setTelefonnummer(customer.telefon || customer.telefonnummer || formData.telefon || '');
            setSelectedEmployee(formData.selectedEmployee || '');
            setSelectedEmployeeId(formData.selectedEmployeeId || '');
            
            // Set Menge from formData
            if (formData?.menge) {
                setMenge(`${formData.menge} paar`);
            }
            
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            setDatumAuftrag(today);
            
            // Calculate delivery date (default 7 days from today)
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 7);
            setFertigstellungBis(deliveryDate.toISOString().split('T')[0]);
            
            // Set Einlagenversorgung price from formData
            if (formData?.bruttoPreis) {
                setInsoleSupplyPrice(String(formData.bruttoPreis));
            }
            
            // Set discount from formData if available
            if (typeof formData?.rabatt === 'number' && formData.rabatt > 0) {
                setDiscountType('percentage');
                setDiscountValue(String(formData.rabatt));
            } else {
                setDiscountType('');
                setDiscountValue('');
            }
            
            // Parse payment status
            if (bezahlt.includes('_')) {
                const [type, status] = bezahlt.split('_');
                setPaymentType(type as 'Privat' | 'Krankenkasse');
                setPaymentStatus(status.charAt(0).toUpperCase() + status.slice(1).toLowerCase());
            }
        }
    }, [isOpen, customer, formData, bezahlt]);

    // Fetch settings data (prices) when modal opens
    useEffect(() => {
        const fetchSettings = async () => {
            if (isOpen) {
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
                        
                        // Ensure "Standard" is always first
                        const standardItem = formattedPrices.find((item) => item.name.toLowerCase() === 'standard');
                        const otherItems = formattedPrices.filter((item) => item.name.toLowerCase() !== 'standard');
                        const sortedOthers = otherItems.sort((a, b) => a.price - b.price);
                        const sortedPrices = standardItem ? [standardItem, ...sortedOthers] : sortedOthers;
                        
                        setLaserPrintPrices(sortedPrices);
                        
                        // Auto-select "Standard" if no price is currently selected
                        if (standardItem && !footAnalysisPrice) {
                            setFootAnalysisPrice(String(standardItem.price));
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch settings:', error);
                } finally {
                    setPricesLoading(false);
                }
            }
        };
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Fetch locations from API when modal opens
    useEffect(() => {
        const fetchLocations = async () => {
            if (isOpen) {
                setLocationsLoading(true);
                try {
                    const response = await getAllLocations(1, 100);
                    if (response?.success && response?.data && Array.isArray(response.data)) {
                        setLocations(response.data);
                        // Set primary location as default
                        const primaryLocation = response.data.find((loc: any) => loc.isPrimary);
                        const locationToUse = primaryLocation || response.data[0];
                        if (locationToUse && !geschaeftsstandort) {
                            setGeschaeftsstandort(locationToUse);
                        }
                    } else if (Array.isArray(response?.data)) {
                        setLocations(response.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch locations:', error);
                    setLocations([]);
                } finally {
                    setLocationsLoading(false);
                }
            }
        };
        fetchLocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Handle employee selection
    const handleEmployeeSelect = (employee: { employeeName: string; id: string }) => {
        setSelectedEmployee(employee.employeeName);
        setSelectedEmployeeId(employee.id);
        setIsEmployeeDropdownOpen(false);
    };

    const handleEmployeeDropdownChange = (open: boolean) => {
        setIsEmployeeDropdownOpen(open);
        setShowSuggestions(open);
    };

    const handleMitarbeiterChange = (employeeName: string) => {
        setSelectedEmployee(employeeName);
        const found = employeeSuggestions.find((e: any) => e.employeeName === employeeName);
        setSelectedEmployeeId(found?.id || '');
    };

    // Handle name change
    const handleNameChange = (newVorname: string, newNachname: string) => {
        setVorname(newVorname);
        setNachname(newNachname);
    };

    // Handle payment type change
    const handlePaymentTypeChange = (newType: 'Privat' | 'Krankenkasse') => {
        setPaymentType(newType);
        
        // Set default status based on type
        if (newType === 'Privat') {
            const newValue = 'Privat_Bezahlt';
            setPaymentStatus('Bezahlt');
            setBezahlt(newValue);
        } else if (newType === 'Krankenkasse') {
            const newValue = 'Krankenkasse_Genehmigt';
            setPaymentStatus('Genehmigt');
            setBezahlt(newValue);
        }
    };

    // Handle payment status change
    const handlePaymentStatusChange = (newStatus: string) => {
        setPaymentStatus(newStatus);
        if (paymentType) {
            // Format: "Privat_Bezahlt" or "Privat_offen" (lowercase for "offen")
            let formattedStatus = newStatus;
            if (newStatus === 'Offen') {
                formattedStatus = 'offen';
            }
            const newValue = `${paymentType}_${formattedStatus}`;
            setBezahlt(newValue);
        }
    };

    // Validation
    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Basic validation - only check if essential fields are present
        if (Object.keys(errors).length > 0) {
            toast.error('Bitte überprüfen Sie Ihre Eingaben.');
            return false;
        }

        return true;
    };


    // Handle save and complete order
    // Handle save and complete order
    const handleSave = async () => {
        if (!customer?.id || !formData) {
            toast.error('Kundendaten fehlen');
            return;
        }

        const isValid = validateForm();
        if (!isValid) {
            return;
        }

        try {
            // Parse quantity from string to number (e.g., "1 paar" -> 1)
            const quantityMatch = menge.match(/^(\d+)\s*paar/i);
            const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
            
            // Prepare API payload according to the required structure
            const apiPayload = {
                service_name: formData.leistungsname,
                sonstiges_category: formData.kategorie || '',
                net_price: formData.nettoPreis,
                vatRate: formData.steuersatz,
                quantity: quantity,
                versorgung_note: formData.leistungsnotiz || '',
                discount: formData.rabatt,
                employeeId: selectedEmployeeId || formData.selectedEmployeeId,
                total_price: formData.bruttoPreis,
                customerId: customer.id,
                wohnort: wohnort,
                auftragsDatum: datumAuftrag,
                geschaeftsstandort: geschaeftsstandort ? {
                    title: geschaeftsstandort.description || geschaeftsstandort.address || '',
                    description: geschaeftsstandort.address || geschaeftsstandort.description || ''
                } : null,
                fertigstellungBis: fertigstellungBis,
                bezahlt: bezahlt,
            };

            // Call API with JSON payload
            const response = await createSonstiges(apiPayload);

            // Show success message from API response
            if (response?.success && response?.message) {
                toast.success(response.message);
            } else {
                toast.success('Sonstige Leistung erfolgreich gespeichert');
            }
            
            // Call onOrderComplete to close modal and refresh data
            onOrderComplete?.();
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Fehler beim Speichern der Bestellung');
        }
    };

  return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="relative">
                    <DialogTitle className="text-2xl font-bold">Werkstattzettel</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* KUNDEN- & AUFTRAGSINFO Section (same as Werkstattzettel) */}
                    <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                        <CustomerInfoSection
                            data={{
                                vorname,
                                nachname,
                                wohnort,
                                email,
                                mitarbeiter: selectedEmployee,
                                versorgung: formData?.leistungsname || '',
                                datumAuftrag,
                                telefonnummer,
                                geschaeftsstandort,
                                fertigstellungBis,
                                fertigstellungBisTime,
                                quantity: menge,
                                onNameChange: (v, n) => {
                                    setVorname(v);
                                    setNachname(n);
                                },
                                onWohnortChange: setWohnort,
                                onEmailChange: setEmail,
                                onMitarbeiterChange: handleMitarbeiterChange,
                                onVersorgungChange: () => {},
                                onDatumAuftragChange: setDatumAuftrag,
                                onTelefonnummerChange: setTelefonnummer,
                                onGeschaeftsstandortChange: setGeschaeftsstandort,
                                onFertigstellungBisChange: setFertigstellungBis,
                                onFertigstellungBisTimeChange: setFertigstellungBisTime,
                                onQuantityChange: setMenge,
                                employeeSearchText,
                                employeeSuggestions,
                                employeeLoading,
                                isEmployeeDropdownOpen,
                                onEmployeeDropdownChange: handleEmployeeDropdownChange,
                                onEmployeeSearchChange: handleEmployeeSearchChange,
                                locations,
                                isLocationDropdownOpen,
                                onLocationDropdownChange: setIsLocationDropdownOpen,
                                completionDays: undefined,
                                sameAsBusiness: true,
                                nameError: undefined,
                                versorgungError: undefined,
                                datumAuftragError: undefined,
                                geschaeftsstandortError: undefined,
                                fertigstellungBisError: undefined,
                            }}
                        />
                    </div>

                    {/* AUFTRAGSDETAILS & PREISE Section (same as Werkstattzettel) */}
                    <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                        <PriceSection
                            versorgung={formData?.leistungsname || ''}
                            onVersorgungChange={() => {}}
                            quantity={menge}
                            onQuantityChange={setMenge}
                            fertigstellungBis={fertigstellungBis}
                            onFertigstellungBisChange={setFertigstellungBis}
                            fertigstellungBisTime={fertigstellungBisTime}
                            onFertigstellungBisTimeChange={setFertigstellungBisTime}
                            versorgungError={undefined}
                            fertigstellungBisError={undefined}
                            footAnalysisPrice={footAnalysisPrice}
                            onFootAnalysisPriceChange={setFootAnalysisPrice}
                            insoleSupplyPrice={insoleSupplyPrice}
                            onInsoleSupplyPriceChange={setInsoleSupplyPrice}
                            customFootPrice={customFootPrice}
                            onCustomFootPriceChange={setCustomFootPrice}
                            customInsolePrice={customInsolePrice}
                            onCustomInsolePriceChange={setCustomInsolePrice}
                            laserPrintPrices={laserPrintPrices}
                            einlagenversorgungPrices={
                                formData
                                    ? [{ name: formData.leistungsname, price: formData.bruttoPreis }]
                                    : []
                            }
                            pricesLoading={pricesLoading}
                            footAnalysisPriceError={undefined}
                            insoleSupplyPriceError={undefined}
                            customFootPriceError={undefined}
                            customInsolePriceError={undefined}
                            discountType={discountType}
                            onDiscountTypeChange={setDiscountType}
                            discountValue={discountValue}
                            onDiscountValueChange={setDiscountValue}
                            bezahlt={bezahlt}
                            onBezahltChange={setBezahlt}
                            paymentError={undefined}
                            disabledPaymentType={undefined}
                            datumAuftrag={datumAuftrag}
                            completionDays={undefined}
                        />
                    </div>

                    {/* KONTROLLE & AKTIONEN Section - match Werkstattzettel design */}
                    <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-sm font-bold text-[#50C878] uppercase tracking-wide">Kontrolle & Aktionen</h3>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f6ff] text-[#50C878]">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-500">Abholung</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {geschaeftsstandort 
                                            ? `${geschaeftsstandort.description || ''}${geschaeftsstandort.description && geschaeftsstandort.address ? ' - ' : ''}${geschaeftsstandort.address || ''}`
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
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

                {/* Action Buttons */}
                <div className="flex justify-between space-x-3 mt-6">
                    <Button
                        type="button"
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="button"
                        className="cursor-pointer"
                        onClick={handleSave}
                    >
                        Weiter
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}