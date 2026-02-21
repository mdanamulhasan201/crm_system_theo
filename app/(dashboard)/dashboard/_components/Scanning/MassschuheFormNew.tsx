import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { useCreateMassschuhe } from '@/hooks/massschuhe/useCreateMassschuhe';
import toast from 'react-hot-toast';
import MassschuheOrderModal from './MassschuheOrderModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import RezeptCard from './Masschuhe/RezeptCard';
import FilterCard from './Masschuhe/FilterCard';
import VersorgungsnotizCard from './Masschuhe/VersorgungsnotizCard';
import { getAllLocations } from '@/apis/setting/locationManagementApis';


interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    telefonnummer?: string;
    wohnort?: string;
    partner?: {
        hauptstandort?: string[];
    };
}

interface MassschuheFormNewProps {
    customer?: Customer;
    onCustomerUpdate?: (updatedCustomer: Customer) => void;
    onDataRefresh?: () => void;
    prefillOrderData?: any;
}

export default function MassschuheFormNew({ customer, onCustomerUpdate, onDataRefresh, prefillOrderData }: MassschuheFormNewProps) {
    // Get user data for vat_country check
    const { user } = useAuth();

    // State for positionsnummer data
    const [positionsnummerAustriaData, setPositionsnummerAustriaData] = useState<any[]>([]);
    const [positionsnummerItalyData, setPositionsnummerItalyData] = useState<any[]>([]);
    const [loadingPositionsnummer, setLoadingPositionsnummer] = useState(true);

    // Load positionsnummer data from public folder
    useEffect(() => {
        const loadPositionsnummerData = async () => {
            try {
                const [austriaResponse, italyResponse] = await Promise.all([
                    fetch('/data/positionsnummer-austria.json'),
                    fetch('/data/positionsnummer-italy.json')
                ]);

                if (austriaResponse.ok) {
                    const austriaData = await austriaResponse.json();
                    setPositionsnummerAustriaData(austriaData);
                }

                if (italyResponse.ok) {
                    const italyData = await italyResponse.json();
                    setPositionsnummerItalyData(italyData);
                }
            } catch (error) {
                console.error('Failed to load positionsnummer data:', error);
            } finally {
                setLoadingPositionsnummer(false);
            }
        };

        loadPositionsnummerData();
    }, []);

    // Filter positionsnummer data based on vat_country
    const getFilteredPositionsnummerData = () => {
        const vatCountry = user?.accountInfo?.vat_country;

        // If Österreich (AT), show Austrian data
        if (vatCountry === 'Österreich (AT)') {
            return positionsnummerAustriaData;
        }

        // If Italien (IT), show Italian data
        if (vatCountry === 'Italien (IT)') {
            return positionsnummerItalyData;
        }

        // For all other countries, show empty array
        return [];
    };

    const filteredPositionsnummerData = getFilteredPositionsnummerData();

    // Error message for positionsnummer when not available (only for countries other than AT and IT)
    const getPositionsnummerError = () => {
        if (billingType !== 'Krankenkassa') return undefined;

        const vatCountry = user?.accountInfo?.vat_country;

        // No error for Österreich (AT) - data available
        if (vatCountry === 'Österreich (AT)') {
            return undefined;
        }

        // No error for Italien (IT) - data available
        if (vatCountry === 'Italien (IT)') {
            return undefined;
        }

        // Error for all other countries
        if (vatCountry) {
            return 'Positionsnummer ist für Ihr Land nicht verfügbar';
        }

        return undefined;
    };

    // Form state
    const [ärztlicheDiagnose, setÄrztlicheDiagnose] = useState<string>('');
    const [ausführlicheDiagnose, setAusführlicheDiagnose] = useState<string>('');
    const [rezeptnummer, setRezeptnummer] = useState<string>('');
    const [versorgungNote, setVersorgungNote] = useState<string>('');
    const [halbprobeGeplant, setHalbprobeGeplant] = useState<boolean | null>(null);
    const [kostenvoranschlag, setKostenvoranschlag] = useState<boolean | null>(null);

    // Privat billing fields
    const [price, setPrice] = useState<string>('');
    const [tax, setTax] = useState<string>('');

    // Billing type state (Krankenkassa/Privat)
    const [billingType, setBillingType] = useState<'Krankenkassa' | 'Privat'>('Krankenkassa');
    const [selectedPositionsnummer, setSelectedPositionsnummer] = useState<string[]>([]);
    const [showPositionsnummerDropdown, setShowPositionsnummerDropdown] = useState(false);

    // Clear selectedPositionsnummer when billingType changes
    useEffect(() => {
        setSelectedPositionsnummer([]);
        // Clear price and tax when switching to Krankenkassa
        if (billingType === 'Krankenkassa') {
            setPrice('');
            setTax('');
        }
    }, [billingType]);

    const positionsnummerError = getPositionsnummerError();

    // Employee search
    const {
        searchText,
        suggestions: employeeSuggestions,
        loading: employeeLoading,
        setShowSuggestions,
        handleChange: handleEmployeeSearchChange,
    } = useSearchEmployee();
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    // Location state
    const [locations, setLocations] = useState<any[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

    // Fetch locations on mount
    useEffect(() => {
        const fetchLocations = async () => {
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
                setLocations([]);
            } finally {
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // Set primary location as default when locations are loaded (only on initial load, not when user clears)
    const hasSetInitialLocation = useRef(false);
    useEffect(() => {
        if (locations.length > 0 && !hasSetInitialLocation.current) {
            hasSetInitialLocation.current = true;
            const primaryLocation = locations.find(loc => loc.isPrimary);
            const locationToUse = primaryLocation || locations[0];
            if (locationToUse) {
                setSelectedLocation(locationToUse);
            }
        }
    }, [locations]);

    // Massschuhe hook
    const { createMassschuhe, isLoading } = useCreateMassschuhe();

    // Order creation modal state
    const [showOrderModal, setShowOrderModal] = useState(false);

    const prefillHandledRef = useRef<string | null>(null);

    useEffect(() => {
        if (!prefillOrderData) return;
        const prefillId = String(prefillOrderData?.id ?? '');
        if (prefillId && prefillHandledRef.current === prefillId) return;
        if (prefillId) prefillHandledRef.current = prefillId;

        setÄrztlicheDiagnose(prefillOrderData?.arztliche_diagnose ?? '');
        setAusführlicheDiagnose(
            prefillOrderData?.usführliche_diagnose ??
            prefillOrderData?.ausführliche_diagnose ??
            ''
        );
        setRezeptnummer(prefillOrderData?.rezeptnummer ?? '');
        setVersorgungNote(prefillOrderData?.note ?? prefillOrderData?.customer_note ?? '');

        if (typeof prefillOrderData?.halbprobe_geplant === 'boolean') {
            setHalbprobeGeplant(prefillOrderData.halbprobe_geplant);
        }
        if (typeof prefillOrderData?.kostenvoranschlag === 'boolean') {
            setKostenvoranschlag(prefillOrderData.kostenvoranschlag);
        }
        if (typeof prefillOrderData?.paymentType === 'string') {
            const pt = prefillOrderData.paymentType.toLowerCase();
            setBillingType(pt === 'privat' ? 'Privat' : 'Krankenkassa');
        }
        if (typeof prefillOrderData?.durchgeführt_von === 'string') {
            setSelectedEmployee(prefillOrderData.durchgeführt_von);
        }
        if (typeof prefillOrderData?.employeeId === 'string') {
            setSelectedEmployeeId(prefillOrderData.employeeId);
        }
    }, [prefillOrderData]);





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

    // Handle form submission - Show order creation modal
    const handleSubmit = () => {
        // Validation
        if (!customer?.id) {
            toast.error('Kunde-ID fehlt');
            return;
        }

        if (!selectedEmployeeId) {
            toast.error('Bitte wählen Sie einen Mitarbeiter aus');
            return;
        }

        if (!ärztlicheDiagnose.trim()) {
            toast.error('Bitte geben Sie eine ärztliche Diagnose ein');
            return;
        }

        // Show order creation modal
        setShowOrderModal(true);
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
        if (!selectedPositionsnummer || selectedPositionsnummer.length === 0) {
            return [];
        }

        const allData = [...positionsnummerAustriaData, ...positionsnummerItalyData];

        return selectedPositionsnummer.map(posNum => {
            // Find the option in both Austrian and Italian data
            const option = allData.find(opt => getPositionsnummer(opt) === posNum);

            if (option) {
                return {
                    price: option.price,
                    description: typeof option.description === 'object' ? option.description : {}
                };
            }

            return null;
        }).filter(item => item !== null);
    };

    // Handle order submission from modal
    const handleOrderSubmit = async (orderData: any) => {
        // Add insurances array to orderData
        const insurances = buildInsurancesArray();
        const orderDataWithInsurances = {
            ...orderData,
            insurances: insurances
        };

        // Submit to API
        const result = await createMassschuhe(orderDataWithInsurances);

        if (result.success) {
            // Close modal
            setShowOrderModal(false);

            // Reset form
            setÄrztlicheDiagnose('');
            setAusführlicheDiagnose('');
            setRezeptnummer('');
            setVersorgungNote('');
            setHalbprobeGeplant(null);
            setKostenvoranschlag(null);
            setSelectedEmployee('');
            setSelectedEmployeeId('');
            setPrice('');
            setTax('');

            // Refresh data if callback provided
            if (onDataRefresh) {
                onDataRefresh();
            }
        }
    };


    return (
        <div>
            {/* Abrechnung Section */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Abrechnung:</label>
                <Tabs
                    value={billingType}
                    onValueChange={(value) => setBillingType(value as 'Krankenkassa' | 'Privat')}
                    className="w-fit"
                >
                    <TabsList className="bg-gray-200 rounded-full p-1">
                        <TabsTrigger
                            value="Krankenkassa"
                            className="cursor-pointer data-[state=active]:bg-[#61A178] data-[state=active]:text-white rounded-full px-6 py-2 font-medium transition-all"
                        >
                            Krankenkasse
                        </TabsTrigger>
                        <TabsTrigger
                            value="Privat"
                            className="cursor-pointer data-[state=active]:bg-[#61A178] data-[state=active]:text-white rounded-full px-6 py-2 font-medium transition-all"
                        >
                            Privat
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className='mt-10'>

                {/* Rezept Card */}
                <RezeptCard
                    ärztlicheDiagnose={ärztlicheDiagnose}
                    onÄrztlicheDiagnoseChange={setÄrztlicheDiagnose}
                    ausführlicheDiagnose={ausführlicheDiagnose}
                    onAusführlicheDiagnoseChange={setAusführlicheDiagnose}
                    billingType={billingType}
                    selectedPositionsnummer={selectedPositionsnummer}
                    positionsnummerOptions={filteredPositionsnummerData}
                    positionsnummerError={positionsnummerError}
                    showPositionsnummerDropdown={showPositionsnummerDropdown}
                    onPositionsnummerToggle={() => setShowPositionsnummerDropdown(!showPositionsnummerDropdown)}
                    onPositionsnummerSelect={setSelectedPositionsnummer}
                    onPositionsnummerClear={() => setSelectedPositionsnummer([])}
                    vatCountry={user?.accountInfo?.vat_country || undefined}
                    rezeptnummer={rezeptnummer}
                    onRezeptnummerChange={setRezeptnummer}
                    selectedLocation={selectedLocation}
                    locations={locations}
                    locationsLoading={locationsLoading}
                    isLocationDropdownOpen={isLocationDropdownOpen}
                    onLocationDropdownChange={setIsLocationDropdownOpen}
                    onLocationSelect={(location) => setSelectedLocation(location)}
                    onLocationClear={() => setSelectedLocation(null)}
                    selectedEmployee={selectedEmployee}
                    employeeSearchText={searchText}
                    isEmployeeDropdownOpen={isEmployeeDropdownOpen}
                    employeeSuggestions={employeeSuggestions}
                    employeeLoading={employeeLoading}
                    onEmployeeSearchChange={handleEmployeeSearchChange}
                    onEmployeeDropdownChange={handleEmployeeDropdownChange}
                    onEmployeeSelect={handleEmployeeSelect}
                    onEmployeeClear={() => { setSelectedEmployee(''); setSelectedEmployeeId(''); }}
                    halbprobeGeplant={halbprobeGeplant}
                    onHalbprobeGeplantChange={setHalbprobeGeplant}
                    kostenvoranschlag={kostenvoranschlag}
                    onKostenvoranschlagChange={setKostenvoranschlag}
                    price={price}
                    onPriceChange={setPrice}
                    tax={tax}
                    onTaxChange={setTax}
                />

                {/* new filed  */}
                <FilterCard />

                {/* Versorgungsnotiz Card */}
                <VersorgungsnotizCard
                    versorgungNote={versorgungNote}
                    onVersorgungNoteChange={setVersorgungNote}
                />

                {/* Speichern Button */}
                <div className="flex justify-center my-10">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-black cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Speichern...
                            </>
                        ) : (
                            'Speichern'
                        )}
                    </Button>
                </div>
            </div>

            {/* Order Creation Modal */}
            <MassschuheOrderModal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                customer={customer}
                formData={{
                    arztlicheDiagnose: ärztlicheDiagnose,
                    ausführlicheDiagnose: ausführlicheDiagnose,
                    rezeptnummer: rezeptnummer,
                    versorgungNote: versorgungNote,
                    halbprobeGeplant: halbprobeGeplant,
                    kostenvoranschlag: kostenvoranschlag,
                    selectedEmployee: selectedEmployee,
                    selectedEmployeeId: selectedEmployeeId,
                    selectedPositionsnummer: selectedPositionsnummer,
                    positionsnummerAustriaData: positionsnummerAustriaData,
                    positionsnummerItalyData: positionsnummerItalyData,
                    billingType: billingType,
                    price: price,
                    tax: tax,
                }}
                onSubmit={handleOrderSubmit}
                isLoading={isLoading}
            />

        </div>
    );
}

