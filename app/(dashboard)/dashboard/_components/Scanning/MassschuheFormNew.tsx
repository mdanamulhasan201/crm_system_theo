import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { useCreateMassschuhe } from '@/hooks/massschuhe/useCreateMassschuhe';
import toast from 'react-hot-toast';
import MassschuheOrderModal from './MassschuheOrderModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import RezeptCard from './Masschuhe/RezeptCard';
import FilterCard, { type Step2Data, type Step3Data, type CustomerFittingData, type InternalPrepData } from './Masschuhe/FilterCard';
import VersorgungsnotizCard from './Masschuhe/VersorgungsnotizCard';
import { getAllLocations } from '@/apis/setting/locationManagementApis';
import { getTaxRatesByCountry } from '@/utils/taxRates';


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
    const [versorgungNote, setVersorgungNote] = useState<string>('');
    const [halbprobeGeplant, setHalbprobeGeplant] = useState<boolean | null>(null);
    const [kostenvoranschlag, setKostenvoranschlag] = useState<boolean | null>(null);

    // Tax rates for Privat (same as SonstigesForm)
    const vatCountry = user?.accountInfo?.vat_country;
    const taxRates = useMemo(() => getTaxRatesByCountry(vatCountry) || [], [vatCountry]);
    const defaultTaxRate = useMemo(
        () => taxRates?.find((r: { isDefault: boolean }) => r.isDefault) || { rate: 22, name: 'Standard', description: 'Standard' },
        [taxRates]
    );

    // Privat billing fields (PREIS & STEUER – same logic as SonstigesForm, Brutto only)
    const [nettoPreis, setNettoPreis] = useState<string>('0.00');
    const [rabatt, setRabatt] = useState<string>('0');
    const [steuersatz, setSteuersatz] = useState<number>(defaultTaxRate.rate);
    const isNetto = false; // Always Brutto (same as SonstigesForm)

    const priceCalculations = useMemo(() => {
        const priceInput = parseFloat(nettoPreis) || 0;
        const discountPercent = parseFloat(rabatt) || 0;
        const taxRate = steuersatz / 100;
        const discountAmountRaw = priceInput * (discountPercent / 100);
        const priceAfterDiscount = priceInput - discountAmountRaw;
        const discountAmount = Math.round(discountAmountRaw * 100) / 100;
        const brutto = priceAfterDiscount;
        const netto = brutto / (1 + taxRate);
        const mwst = brutto - netto;
        return {
            basisPreis: Math.round(priceInput * 100) / 100,
            discountPercent,
            discountAmount,
            netto: Math.round(netto * 100) / 100,
            mwst: Math.round(mwst * 100) / 100,
            brutto: Math.round(brutto * 100) / 100,
        };
    }, [nettoPreis, rabatt, steuersatz]);

    // Billing type state (Krankenkassa/Privat)
    const [billingType, setBillingType] = useState<'Krankenkassa' | 'Privat'>('Krankenkassa');
    const [selectedPositionsnummer, setSelectedPositionsnummer] = useState<string[]>([]);
    const [showPositionsnummerDropdown, setShowPositionsnummerDropdown] = useState(false);
    const [itemSides, setItemSides] = useState<Record<string, 'L' | 'R' | 'BDS'>>({});

    // Clear selectedPositionsnummer and itemSides when billingType changes
    useEffect(() => {
        setSelectedPositionsnummer([]);
        setItemSides({});
        if (billingType === 'Krankenkassa') {
            setNettoPreis('0.00');
            setRabatt('0');
        }
    }, [billingType]);

    useEffect(() => {
        if (defaultTaxRate?.rate != null) setSteuersatz(defaultTaxRate.rate);
    }, [vatCountry, defaultTaxRate]);

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

    // Produktionsworkflow state (FilterCard) – sent in order payload
    const [halbprobeErforderlich, setHalbprobeErforderlich] = useState<boolean | null>(null);
    const [leistenVorhanden, setLeistenVorhanden] = useState<boolean | null>(null);
    const [bettungErforderlich, setBettungErforderlich] = useState<boolean | null>(null);
    const [lastData, setLastData] = useState<Step2Data>({ material: '', leistentyp: '', notes: '' });
    const [footbedData, setFootbedData] = useState<Step3Data>({ material: '', thickness: '', notes: '' });
    const [internalPrepData, setInternalPrepData] = useState<InternalPrepData>({ notes: '', preparationDate: undefined });
    const [customerFittingData, setCustomerFittingData] = useState<CustomerFittingData>({ fittingDate: undefined, adjustments: '', customerNotes: '' });

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
        if (prefillOrderData?.net_price !== undefined && prefillOrderData?.net_price !== null) {
            const np = Number(prefillOrderData.net_price);
            setNettoPreis(Number.isFinite(np) ? np.toFixed(2) : String(prefillOrderData.net_price));
        }
        if (prefillOrderData?.discount !== undefined && prefillOrderData?.discount !== null) {
            setRabatt(String(prefillOrderData.discount));
        }
        if (prefillOrderData?.vatRate !== undefined && prefillOrderData?.vatRate !== null) {
            const vr = Number(prefillOrderData.vatRate);
            if (Number.isFinite(vr)) setSteuersatz(vr);
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

    // Handle order submission from modal (orderData is v2 payload from MassschuheOrderModal)
    const handleOrderSubmit = async (orderData: any) => {
        const result = await createMassschuhe(orderData);

        if (result.success) {
            setShowOrderModal(false);
            setÄrztlicheDiagnose('');
            setAusführlicheDiagnose('');
            setVersorgungNote('');
            setHalbprobeGeplant(null);
            setKostenvoranschlag(null);
            setSelectedEmployee('');
            setSelectedEmployeeId('');
            setSelectedPositionsnummer([]);
            setItemSides({});
            setNettoPreis('0.00');
            setRabatt('0');
            setHalbprobeErforderlich(null);
            setLeistenVorhanden(null);
            setBettungErforderlich(null);
            setLastData({ material: '', leistentyp: '', notes: '' });
            setFootbedData({ material: '', thickness: '', notes: '' });
            setInternalPrepData({ notes: '', preparationDate: undefined });
            setCustomerFittingData({ fittingDate: undefined, adjustments: '', customerNotes: '' });
            if (onDataRefresh) onDataRefresh();
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
                    onPositionsnummerClear={() => { setSelectedPositionsnummer([]); setItemSides({}); }}
                    itemSides={itemSides}
                    onItemSideChange={(posNum: string, side: 'L' | 'R' | 'BDS') => setItemSides(prev => ({ ...prev, [posNum]: side }))}
                    vatCountry={user?.accountInfo?.vat_country || undefined}
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
                    nettoPreis={nettoPreis}
                    onNettoPreisChange={setNettoPreis}
                    rabatt={rabatt}
                    onRabattChange={setRabatt}
                    steuersatz={steuersatz}
                    onSteuersatzChange={setSteuersatz}
                    taxRates={taxRates}
                    defaultTaxRate={defaultTaxRate}
                    priceCalculations={priceCalculations}
                />

                {/* Produktionsworkflow – data passed to order payload */}
                <FilterCard
                    halbprobeErforderlich={halbprobeErforderlich}
                    onHalbprobeErforderlichChange={setHalbprobeErforderlich}
                    leistenVorhanden={leistenVorhanden}
                    onLeistenVorhandenChange={setLeistenVorhanden}
                    bettungErforderlich={bettungErforderlich}
                    onBettungErforderlichChange={setBettungErforderlich}
                    lastData={lastData}
                    onLastDataChange={setLastData}
                    footbedData={footbedData}
                    onFootbedDataChange={setFootbedData}
                    internalPrepData={internalPrepData}
                    onInternalPrepDataChange={setInternalPrepData}
                    customerFittingData={customerFittingData}
                    onCustomerFittingDataChange={setCustomerFittingData}
                />

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
                        className="bg-[#61A178] cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-[#4A8A5F] transition-colors flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    versorgungNote: versorgungNote,
                    halbprobeGeplant: halbprobeGeplant,
                    kostenvoranschlag: kostenvoranschlag,
                    selectedEmployee: selectedEmployee,
                    selectedEmployeeId: selectedEmployeeId,
                    selectedPositionsnummer: selectedPositionsnummer,
                    positionsnummerAustriaData: positionsnummerAustriaData,
                    positionsnummerItalyData: positionsnummerItalyData,
                    itemSides: itemSides,
                    billingType: billingType,
                    price: billingType === 'Privat' ? String(priceCalculations.netto) : '',
                    brutto: billingType === 'Privat' ? String(priceCalculations.brutto) : '',
                    tax: billingType === 'Privat' ? String(steuersatz) : '',
                    rabatt: rabatt,
                    nettoPreis: nettoPreis,
                    priceCalculations: priceCalculations,
                    // Produktionsworkflow – same field names as API payload
                    has_trim_strips: leistenVorhanden === true,
                    step2_material: lastData.material,
                    leistentyp: lastData.leistentyp,
                    step2_notes: lastData.notes,
                    bedding_required: bettungErforderlich === true,
                    step3_material: footbedData.material,
                    step3_thickness: footbedData.thickness,
                    step3_notes: footbedData.notes,
                    adjustments: customerFittingData.adjustments,
                    customer_reviews: customerFittingData.customerNotes,
                    // Halbprobe (half_sample_required): when true, send Step 4 & 5 data
                    halbprobeErforderlich,
                    step4_preparation_date: internalPrepData.preparationDate
                        ? internalPrepData.preparationDate.toISOString()
                        : undefined,
                    step4_notes: internalPrepData.notes,
                    step5_fitting_date: customerFittingData.fittingDate
                        ? customerFittingData.fittingDate.toISOString()
                        : undefined,
                }}
                onSubmit={handleOrderSubmit}
                isLoading={isLoading}
            />

        </div>
    );
}

