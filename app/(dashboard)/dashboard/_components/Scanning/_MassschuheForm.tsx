import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { useCreateMassschuhe } from '@/hooks/massschuhe/useCreateMassschuhe';
import { ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import MassschuheOrderModal from './MassschuheOrderModal';
import PositionsnummerDropdown from './Einlagen/Dropdowns/PositionsnummerDropdown';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';


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

interface MassschuheFormProps {
    customer?: Customer;
    onCustomerUpdate?: (updatedCustomer: Customer) => void;
    onDataRefresh?: () => void;
    prefillOrderData?: any;
}

export default function MassschuheForm({ customer, onCustomerUpdate, onDataRefresh, prefillOrderData }: MassschuheFormProps) {
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
    
    // Billing type state (Krankenkassa/Privat)
    const [billingType, setBillingType] = useState<'Krankenkassa' | 'Privat'>('Krankenkassa');
    const [selectedPositionsnummer, setSelectedPositionsnummer] = useState<string[]>([]);
    const [showPositionsnummerDropdown, setShowPositionsnummerDropdown] = useState(false);
    
    // Clear selectedPositionsnummer when billingType changes
    useEffect(() => {
        setSelectedPositionsnummer([]);
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
                {/* Two text areas for diagnosis */}
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Ärztliche Diagnose */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Ärztliche Diagnose</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={ärztlicheDiagnose}
                                onChange={(e) => setÄrztlicheDiagnose(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Textfeld..."
                            />
                        </div>
                    </div>

                    {/* Ausführliche Diagnose */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Ausführliche Diagnose</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={ausführlicheDiagnose}
                                onChange={(e) => setAusführlicheDiagnose(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Textfeld..."
                            />
                        </div>
                    </div>
                </div>

                {/* Positionsnummer Field - Only show when Krankenkassa is selected */}
                {billingType === 'Krankenkassa' && (
                    <div className="mt-6 mb-6">
                        <PositionsnummerDropdown
                            label="Positionsnummer *"
                            value={selectedPositionsnummer}
                            placeholder="Positionsnummer oder Text suchen..."
                            options={filteredPositionsnummerData}
                            error={positionsnummerError}
                            isOpen={showPositionsnummerDropdown}
                            onToggle={() => setShowPositionsnummerDropdown(!showPositionsnummerDropdown)}
                            onSelect={(values) => {
                                setSelectedPositionsnummer(values);
                            }}
                        />
                    </div>
                )}

                {/* Rezeptnummer and Durchgeführt von */}
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Rezeptnummer */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Rezeptnummer</h3>
                        </div>
                        <Input
                            type="text"
                            placeholder="Rezeptnummer eingeben"
                            value={rezeptnummer}
                            onChange={(e) => setRezeptnummer(e.target.value)}
                        />
                    </div>

                    {/* Durchgeführt von */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Durchgeführt von:</h3>
                        </div>
                        <div className="relative">
                            <Popover open={isEmployeeDropdownOpen} onOpenChange={handleEmployeeDropdownChange}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isEmployeeDropdownOpen}
                                        className="w-full justify-between font-normal min-h-[44px]"
                                    >
                                        <span className={`truncate ${selectedEmployee ? '' : 'text-gray-400'}`}>
                                            {selectedEmployee || "Auswählen"}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <div className="p-2">
                                        <Input
                                            placeholder="Mitarbeiter suchen..."
                                            value={searchText}
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
                                                        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${selectedEmployee === employee.employeeName
                                                            ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                                            : 'hover:bg-gray-100'
                                                            }`}
                                                        onClick={() => handleEmployeeSelect({ employeeName: employee.employeeName, id: employee.id })}
                                                    >
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className={`text-sm font-medium truncate ${selectedEmployee === employee.employeeName
                                                                ? 'text-blue-900'
                                                                : 'text-gray-900'
                                                                }`}>
                                                                {employee.employeeName}
                                                            </span>
                                                            {employee.email && (
                                                                <span className={`text-xs truncate ${selectedEmployee === employee.employeeName
                                                                    ? 'text-blue-600'
                                                                    : 'text-gray-500'
                                                                    }`}>
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
                    </div>
                </div>

                {/* Versorgung Note */}
                <div className="mb-10 w-full">
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold">Notizen zur Versorgung</h3>
                    </div>
                    <textarea
                        value={versorgungNote}
                        onChange={(e) => setVersorgungNote(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Hast du sonstige Anmerkungen oder Notizen zur Versorgung..."
                    />
                </div>

                {/* Radio Button Sections */}
                <div className="flex flex-col  gap-6 mb-10 w-full">
                    {/* Halbprobe Geplant */}
                    <div className="w-full">
                        <div className="flex items-center gap-10 pb-2 border-b border-gray-300">
                            <h3 className="text-lg font-semibold">Halbprobe Geplant?</h3>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="halbprobeGeplant"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={halbprobeGeplant === true}
                                        onChange={() => setHalbprobeGeplant(true)}
                                    />
                                    <span className="text-sm">Ja</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="halbprobeGeplant"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={halbprobeGeplant === false}
                                        onChange={() => setHalbprobeGeplant(false)}
                                    />
                                    <span className="text-sm">Nein</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Kostenvoranschlag */}
                    <div className="w-full mt-5">
                        <div className="flex items-center gap-10 pb-2 border-b border-gray-300">
                            <h3 className="text-lg font-semibold">Kostenvoranschlag</h3>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="kostenvoranschlag"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={kostenvoranschlag === true}
                                        onChange={() => setKostenvoranschlag(true)}
                                    />
                                    <span className="text-sm">Ja</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="kostenvoranschlag"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={kostenvoranschlag === false}
                                        onChange={() => setKostenvoranschlag(false)}
                                    />
                                    <span className="text-sm">Nein</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

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
                }}
                onSubmit={handleOrderSubmit}
                isLoading={isLoading}
            />

        </div>
    );
}

