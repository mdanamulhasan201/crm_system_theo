'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllLocations } from '@/apis/setting/locationManagementApis';
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { getSettingData } from '@/apis/einlagenApis';
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types';
import { createSonstiges } from '@/apis/SonstigesApis';

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
    const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([]);
    const [pricesLoading, setPricesLoading] = useState(false);
    
    // Field errors
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
                    {/* AUFTRAGSÜBERSICHT Section */}
                    <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-6">Auftragsübersicht</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name Kunde */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name Kunde
                                </label>
                                <Input
                                    placeholder="Name eingeben..."
                                    value={`${vorname} ${nachname}`.trim()}
                                    onChange={(e) => {
                                        const parts = e.target.value.split(' ');
                                        setVorname(parts[0] || '');
                                        setNachname(parts.slice(1).join(' ') || '');
                                    }}
                                    className={fieldErrors.name ? 'border-red-500' : ''}
                                />
                                {fieldErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Datum des Auftrags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Datum des Auftrags
                                </label>
                                <Input
                                    type="date"
                                    value={datumAuftrag}
                                    onChange={(e) => setDatumAuftrag(e.target.value)}
                                    className={fieldErrors.datumAuftrag ? 'border-red-500' : ''}
                                />
                                {fieldErrors.datumAuftrag && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.datumAuftrag}</p>
                                )}
                            </div>

                            {/* Wohnort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Wohnort
                                </label>
                                <Input
                                    placeholder="Wohnort eingeben..."
                                    value={wohnort}
                                    onChange={(e) => setWohnort(e.target.value)}
                                />
                            </div>

                            {/* Telefon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telefon
                                </label>
                                <Input
                                    placeholder="Telefonnummer eingeben..."
                                    value={telefonnummer}
                                    onChange={(e) => setTelefonnummer(e.target.value)}
                                />
                            </div>

                            {/* E-Mail */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    E-Mail
                                </label>
                                <Input
                                    placeholder="E-Mail eingeben..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Geschäftstandort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Geschäftstandort
                                </label>
                                <Input
                                    placeholder="Geschäftstandort eingeben"
                                    value={geschaeftsstandort ? `${geschaeftsstandort.description || ''}${geschaeftsstandort.description && geschaeftsstandort.address ? ' - ' : ''}${geschaeftsstandort.address || ''}` : ''}
                                    readOnly
                                    className={`cursor-pointer ${fieldErrors.geschaeftsstandort ? 'border-red-500' : ''}`}
                                    onClick={() => setIsLocationDropdownOpen(true)}
                                />
                                {isLocationDropdownOpen && (
                                    <Popover open={isLocationDropdownOpen} onOpenChange={setIsLocationDropdownOpen}>
                                        <PopoverTrigger asChild>
                                            <div />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <div className="max-h-60 overflow-y-auto">
                                                {locationsLoading ? (
                                                    <div className="p-4 text-center text-sm text-gray-500">
                                                        Lade Standorte...
                                                    </div>
                                                ) : locations.length > 0 ? (
                                                    <div className="py-1">
                                                        {locations.map((location) => (
                                                            <div
                                                                key={location.id}
                                                                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                                                                    geschaeftsstandort?.id === location.id
                                                                        ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                                                        : 'hover:bg-gray-100'
                                                                }`}
                                                                onClick={() => {
                                                                    setGeschaeftsstandort(location);
                                                                    setIsLocationDropdownOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex flex-col min-w-0 flex-1">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {location.description || location.address}
                                                                    </span>
                                                                    {location.description && location.address && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {location.address}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {geschaeftsstandort?.id === location.id && (
                                                                    <Check className="h-4 w-4 text-blue-600 ml-2 shrink-0" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-gray-500">
                                                        Keine Standorte verfügbar
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                                {fieldErrors.geschaeftsstandort && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.geschaeftsstandort}</p>
                                )}
                            </div>

                            {/* Mitarbeiter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mitarbeiter
                                </label>
                                <Popover open={isEmployeeDropdownOpen} onOpenChange={handleEmployeeDropdownChange}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full cursor-pointer justify-between font-normal"
                                        >
                                            <span className={`truncate ${selectedEmployee ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {selectedEmployee || 'Mitarbeiter wählen'}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <div className="p-2">
                                            <Input
                                                placeholder="Mitarbeiter suchen..."
                                                value={employeeSearchText}
                                                onChange={(e) => handleEmployeeSearchChange(e.target.value)}
                                                className="w-full"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {employeeLoading ? (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Lade Mitarbeiter...
                                                </div>
                                            ) : employeeSuggestions.length > 0 ? (
                                                <div className="py-1">
                                                    {employeeSuggestions.map((employee) => (
                                                        <div
                                                            key={employee.id}
                                                            className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                                                                selectedEmployee === employee.employeeName
                                                                    ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                                                    : 'hover:bg-gray-100'
                                                            }`}
                                                            onClick={() => handleEmployeeSelect({ 
                                                                employeeName: employee.employeeName, 
                                                                id: employee.id 
                                                            })}
                                                        >
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {employee.employeeName}
                                                                </span>
                                                                {employee.email && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {employee.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {selectedEmployee === employee.employeeName && (
                                                                <Check className="h-4 w-4 text-blue-600 ml-2 shrink-0" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Keine Mitarbeiter gefunden
                                                </div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Versorgung */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Versorgung
                                </label>
                                <Input
                                    placeholder="Versorgung eingeben..."
                                    value={formData?.leistungsname || ''}
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>

                            {/* Menge */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Menge
                                </label>
                                <Select value={menge} onValueChange={setMenge}>
                                    <SelectTrigger className="h-11 border-gray-300">
                                        <SelectValue placeholder="Menge wählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1 paar">1 Paar</SelectItem>
                                        <SelectItem value="2 paar">2 Paare</SelectItem>
                                        <SelectItem value="3 paar">3 Paare</SelectItem>
                                        <SelectItem value="4 paar">4 Paare</SelectItem>
                                        <SelectItem value="5 paar">5 Paare</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Fertigstellung bis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fertigstellung bis
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={fertigstellungBis}
                                        onChange={(e) => setFertigstellungBis(e.target.value)}
                                        className={`flex-1 ${fieldErrors.fertigstellungBis ? 'border-red-500' : ''}`}
                                    />
                                    <Input
                                        type="time"
                                        value={fertigstellungBisTime}
                                        onChange={(e) => setFertigstellungBisTime(e.target.value)}
                                        className="w-32"
                                    />
                                </div>
                                {fieldErrors.fertigstellungBis && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.fertigstellungBis}</p>
                                )}
                            </div>

                            {/* Kostenträger */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kostenträger
                                </label>
                                <div className="flex gap-3">
                                    {/* Payment Type Dropdown */}
                                    <div className="flex-1">
                                        <Select 
                                            value={paymentType} 
                                            onValueChange={handlePaymentTypeChange}
                                        >
                                            <SelectTrigger className={`w-full h-11 border-gray-300 ${fieldErrors.bezahlt ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Privat" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Privat">Privat</SelectItem>
                                                <SelectItem value="Krankenkasse">Krankenkasse</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Dropdown */}
                                    {paymentType && (
                                        <div className="flex-1">
                                            <Select 
                                                key={`status-${paymentType}`}
                                                value={paymentStatus} 
                                                onValueChange={handlePaymentStatusChange}
                                            >
                                                <SelectTrigger className={`w-full h-11 border-gray-300 ${fieldErrors.bezahlt ? 'border-red-500' : ''}`}>
                                                    <SelectValue placeholder="Status auswählen..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentType === 'Privat' ? (
                                                        <>
                                                            <SelectItem value="Bezahlt">Bezahlt</SelectItem>
                                                            <SelectItem value="Offen">Offen</SelectItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <SelectItem value="Genehmigt">Genehmigt</SelectItem>
                                                            <SelectItem value="Ungenehmigt">Ungenehmigt</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.bezahlt && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.bezahlt}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PREISE Section */}
                    <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-6">Preise</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fußanalyse */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fußanalyse
                                </label>
                                <Select value={footAnalysisPrice} onValueChange={setFootAnalysisPrice}>
                                    <SelectTrigger className="h-11 border-gray-300">
                                        <SelectValue
                                            placeholder={pricesLoading ? 'Lade Preise...' : laserPrintPrices.length > 0 ? 'Preis auswählen' : 'Kein Preis verfügbar'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {laserPrintPrices.length > 0 ? (
                                            laserPrintPrices.map((item, index) => (
                                                <SelectItem
                                                    className="cursor-pointer"
                                                    key={`foot-${item.name}-${item.price}-${index}`}
                                                    value={String(item.price)}
                                                >
                                                    {item.name} - {item.price.toFixed(2)}€
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

                            {/* Einlagenversorgung */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Einlagenversorgung
                                </label>
                                <Select value={insoleSupplyPrice} onValueChange={setInsoleSupplyPrice}>
                                    <SelectTrigger className="h-11 border-gray-300">
                                        <SelectValue placeholder="Preis auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData ? (
                                            <SelectItem
                                                className="cursor-pointer"
                                                value={String(formData.bruttoPreis)}
                                            >
                                                {formData.leistungsname} - {formData.bruttoPreis.toFixed(2)}€
                                            </SelectItem>
                                        ) : (
                                            <SelectItem value="no-price" disabled>
                                                Kein Preis verfügbar
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        type="button"
                        className="cursor-pointer px-8"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="button"
                        className="cursor-pointer bg-black hover:bg-gray-800 text-white px-8"
                        onClick={handleSave}
                    >
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
