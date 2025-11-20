import React, { useState, useEffect } from 'react';
import { BiSolidEdit } from 'react-icons/bi';
import { ImSpinner2 } from 'react-icons/im';
import { TiArrowSortedDown } from "react-icons/ti";
import { useScanningFormData } from '@/hooks/customer/useScanningFormData';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';
import { useCreateOrder } from '@/hooks/orders/useCreateOrder';
import InvoiceGeneratePdfModal from '../PdfModal/InvoiceGeneratePdf/InvoiceGeneratePdfModal';
import InvoicePage from '../PdfModal/InvoiceGeneratePdf/InvoicePage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserInfoUpdateModal from './UserInfoUpdateModal';
import { ScanData } from '@/types/scan';
import OrderConfirmationModal from './OrderConfirmationModal';
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { ChevronDown, Check } from 'lucide-react';


interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    ausfuhrliche_diagnose?: any;
    versorgungen?: Array<{
        id: string;
        name: string;
        rohlingHersteller: string;
        artikelHersteller: string;
        versorgung: string;
        material: string;
        status: string;
        diagnosis_status: string | null;
        customerId: string;
        createdAt: string;
        updatedAt: string;
    }>;
}

interface ScanningFormProps {
    customer?: Customer;
    onCustomerUpdate?: (updatedCustomer: Customer) => void;
    onDataRefresh?: () => void;
}

export default function SacnningForm({ customer, onCustomerUpdate, onDataRefresh }: ScanningFormProps) {
    const {
        diagnosisOptions,
        // dropdowns
        showDiagnosisDropdown,
        setShowDiagnosisDropdown,
        selectedDiagnosis,
        showSupplyDropdown,
        handleSupplyDropdownToggle,
        // api state
        versorgungData,
        loadingVersorgung,
        hasDataLoaded,
        selectedVersorgungId,
        // editable fields
        diagnosis,
        setDiagnosis,
        editingDiagnosis,
        supply,
        setSupply,
        editingSupply,
        // buttons
        selectedEinlage,
        // loadings
        isSaving,
        isSavingDiagnosis,
        // handlers
        handleDiagnosisSelect,
        handleVersorgungCardSelect,
        handleEinlageButtonClick,
        handleDiagnosisEdit,
        handleDiagnosisBlur,
        handleSupplyEdit,
        handleSupplyBlur,
        handleFormSubmit,
        clearDiagnosisAndReloadOptions,
        resolveVersorgungIdFromText,
    } = useScanningFormData(customer, onCustomerUpdate);

    const { createOrderAndGeneratePdf, isCreating } = useCreateOrder();
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [autoSendToCustomer, setAutoSendToCustomer] = useState(false);
    const [realOrderData, setRealOrderData] = useState<any>(null);
    const [showUserInfoUpdateModal, setShowUserInfoUpdateModal] = useState(false);
    const [showEinlageDropdown, setShowEinlageDropdown] = useState(false);
    const einlageOptions: EinlageType[] = ['Alltagseinlage', 'Sporteinlage', 'Businesseinlage'];
    const [showUberzugDropdown, setShowUberzugDropdown] = useState(false);
    const uberzugOptions = ['Leder', 'Microfaser Schwarz', 'Microfaser Beige'];
    const [showMengeDropdown, setShowMengeDropdown] = useState(false);
    const mengeOptions = ['1 paar', '2 paar', '3 paar', '4 paar', '5 paar'];

    // Employee search functionality
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
    const [kostenvoranschlag, setKostenvoranschlag] = useState<boolean | null>(null);
    const [formDataForOrder, setFormDataForOrder] = useState<any>(null);
    const [versorgung_note, setVersorgung_note] = useState<string>('');
    const [versorgung_laut_arzt, setVersorgung_laut_arzt] = useState<string>('');
    const [ausführliche_diagnose, setAusführliche_diagnose] = useState<string>('');
    const [einlagentyp, setEinlagentyp] = useState<string>('');
    const [überzug, setÜberzug] = useState<string>('');
    const [menge, setMenge] = useState<string>('');
    const [schuhmodell_wählen, setSchuhmodell_wählen] = useState<string>('');

    // Handle employee selection
    const handleEmployeeSelect = (employee: { employeeName: string; id: string }) => {
        setSelectedEmployee(employee.employeeName);
        setSelectedEmployeeId(employee.id);
        setIsEmployeeDropdownOpen(false);
    };

    // Handle dropdown open/close
    const handleEmployeeDropdownChange = (open: boolean) => {
        setIsEmployeeDropdownOpen(open);
        setShowSuggestions(open);
    };

    // Sync einlagentyp with selectedEinlage from hook
    useEffect(() => {
        if (selectedEinlage && !einlagentyp) {
            setEinlagentyp(selectedEinlage);
        }
    }, [selectedEinlage]);

    // Listen for order data updates from useCreateOrder hook
    useEffect(() => {
        const handleOrderDataUpdate = (event: any) => {
            setRealOrderData(event.detail.orderData);
        };

        window.addEventListener('orderDataUpdated', handleOrderDataUpdate);

        return () => {
            window.removeEventListener('orderDataUpdated', handleOrderDataUpdate);
        };
    }, []);

    // Create order data for InvoicePage component - use real data if available, otherwise mock data
    const createOrderData = () => {
        if (!customer) return null;

        // If we have real order data, use it
        if (realOrderData) {
            return realOrderData;
        }

        // Otherwise, create mock data (fallback)
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
                wohnort: ''
            },
            partner: {
                id: 'temp-partner-id',
                name: 'FeetFirst Partner',
                email: 'partner@feetfirst.com',
                image: '/images/pdfLogo.png',
                role: 'Partner'
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
                updatedAt: new Date().toISOString()
            }
        };
    };

    const handleClosePdfModal = () => {
        setShowPdfModal(false);
        setCurrentOrderId(undefined);
        setRealOrderData(null);
    };

    const handleConfirmOrder = async () => {
        const resolvedId = resolveVersorgungIdFromText();
        const werkstattzettelId = typeof window !== 'undefined' ? localStorage.getItem('werkstattzettelId') || undefined : undefined;
        
        if (customer?.id && resolvedId && formDataForOrder) {
            try {
                // Prepare order data with all form fields
                const orderPayload = {
                    customerId: customer.id,
                    versorgungId: resolvedId,
                    werkstattzettelId: werkstattzettelId,
                    ...formDataForOrder
                };
                
                // Create order with form data
                const result = await createOrderAndGeneratePdf(customer.id, resolvedId, autoSendToCustomer, orderPayload);
                const orderId = (result as any)?.data?.id ?? (result as any)?.id ?? result?.orderId;
                if (orderId) {
                    setCurrentOrderId(orderId);
                    setShowPdfModal(true);
                }
            } catch (error) {
                // Error toast is already handled inside useCreateOrder.createOrderAndGeneratePdf
            }
        }
        setShowConfirmModal(false);
    };

    const orderData = createOrderData();

    // Collect all form data
    const collectFormData = () => {
        // Extract number from menge (e.g., "1 paar" -> 1)
        const mengeNumber = menge ? parseInt(menge.split(' ')[0]) || 1 : 1;
        
        // Find selected versorgung data
        const selectedVersorgungItem = versorgungData.find((item: any) => item.id === selectedVersorgungId);
        
        return {
            ausführliche_diagnose: ausführliche_diagnose || '',
            versorgung_laut_arzt: versorgung_laut_arzt || '',
            einlagentyp: einlagentyp || selectedEinlage || '',
            überzug: überzug || '',
            menge: mengeNumber,
            versorgung: supply || '', // Selected versorgung data (not versorgung_note)
            versorgung_note: versorgung_note || '',
            schuhmodell_wählen: schuhmodell_wählen || '',
            kostenvoranschlag: kostenvoranschlag === true,
            employeeName: selectedEmployee || '',
            employeeId: selectedEmployeeId || '',
            selectedVersorgungData: selectedVersorgungItem || null,
        };
    };

    const handleSpeichernClick = () => {
        const formData = collectFormData();
        setFormDataForOrder(formData);
        setShowUserInfoUpdateModal(true);
    };

    return (
        <div>
            {/*  Scanning Form */}
            <div className='mt-10'>
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Ärztliche Diagnose/ Ausführliche Diagnose text area  */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Ärztliche Diagnose/ Ausführliche Diagnose</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={ausführliche_diagnose}
                                onChange={(e) => setAusführliche_diagnose(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Geben Sie hier die ausführliche Diagnose ein..."
                            />
                        </div>
                    </div>

                    {/* Versorgung laut Arzt tedxt filed just  */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Versorgung laut Arzt</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={versorgung_laut_arzt}
                                onChange={(e) => setVersorgung_laut_arzt(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Versorgung laut Arzt eingeben..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Diagnosis Dropdown */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Diagnose</h3>
                        </div>
                        <div className="relative">
                            <div
                                className="p-3 sm:p-2 border border-gray-300 rounded cursor-pointer flex justify-between items-center min-h-[44px]"
                                onClick={() => setShowDiagnosisDropdown(!showDiagnosisDropdown)}
                            >
                                <span className={`text-sm sm:text-base truncate pr-2 ${selectedDiagnosis ? '' : 'text-gray-400'}`}>
                                    {selectedDiagnosis || "Diagnose auswählen"}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {selectedDiagnosis && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearDiagnosisAndReloadOptions();
                                            }}
                                            className="text-gray-400 hover:text-gray-600 text-sm p-1 hover:bg-gray-100 rounded"
                                            title="Diagnose löschen"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {showDiagnosisDropdown && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                                    {diagnosisOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            className="p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                                            onClick={() => handleDiagnosisSelect(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Durchgeführt von: dropdown  */}
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
                                            {selectedEmployee || "Mitarbeiter auswählen..."}
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
                                                            <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
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


                {/* Einlage Dropdown and Überzug dropdown and Menge dropdown */}
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Einlage Dropdown */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Einlagentyp</h3>
                        </div>
                        <div className="relative">
                            <div
                                className="p-3 sm:p-2 border border-gray-300 rounded cursor-pointer flex justify-between items-center min-h-[44px]"
                                onClick={() => setShowEinlageDropdown(!showEinlageDropdown)}
                            >
                                <span className={`text-sm sm:text-base truncate pr-2 ${einlagentyp || selectedEinlage ? '' : 'text-gray-400'}`}>
                                    {einlagentyp || selectedEinlage || "Einlage auswählen"}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {showEinlageDropdown && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                                    {einlageOptions.map((option) => (
                                        <div
                                            key={option}
                                            className="p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                                            onClick={() => {
                                                handleEinlageButtonClick(option);
                                                setEinlagentyp(option);
                                                setShowEinlageDropdown(false);
                                            }}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Überzug dropdown  */}
                    <div className="w-full xl:w-1/2">
                        <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center  w-full">
                            <div className="w-full xl:w-8/12">
                                <div className="mb-2">
                                    <h3 className="text-sm font-semibold">Überzug</h3>
                                </div>
                                <div className="relative">
                                    <div
                                        className="p-3 sm:p-2 border border-gray-300 rounded cursor-pointer flex justify-between items-center min-h-[44px]"
                                        onClick={() => setShowUberzugDropdown(!showUberzugDropdown)}
                                    >
                                        <span className={`text-sm sm:text-base truncate pr-2 ${überzug ? '' : 'text-gray-400'}`}>
                                            {überzug || "Überzug auswählen"}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    {showUberzugDropdown && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                                            {uberzugOptions.map((option) => (
                                                <div
                                                    key={option}
                                                    className="p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                                                    onClick={() => {
                                                        setÜberzug(option);
                                                        setShowUberzugDropdown(false);
                                                    }}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Menge dropdown */}
                            <div className="w-full xl:w-4/12">
                                <div className="mb-2">
                                    <h3 className="text-sm font-semibold">Menge</h3>
                                </div>
                                <div className="relative">
                                    <div
                                        className="p-3 sm:p-2 border border-gray-300 rounded cursor-pointer flex justify-between items-center min-h-[44px]"
                                        onClick={() => setShowMengeDropdown(!showMengeDropdown)}
                                    >
                                        <span className={`text-sm sm:text-base truncate pr-2 ${menge ? '' : 'text-gray-400'}`}>
                                            {menge || "Menge auswählen"}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    {showMengeDropdown && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                                            {mengeOptions.map((option) => (
                                                <div
                                                    key={option}
                                                    className="p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                                                    onClick={() => {
                                                        setMenge(option);
                                                        setShowMengeDropdown(false);
                                                    }}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnosis and Supply Editable Fields */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Versorgung note */}
                    <div className="relative">
                        <div className="mb-2">
                            <h3 className="text-lg font-semibold">Versorgung Note</h3>
                        </div>
                        <textarea
                            value={versorgung_note}
                            onChange={(e) => setVersorgung_note(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Hast du sonstige Anmerkungen oder Notizen zur Versorgung..."
                        />
                    </div>

                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Versorgung</h3>
                            <div className='flex items-center justify-center'>
                                <button
                                    type="button"
                                    onClick={handleSupplyDropdownToggle}
                                    className='cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors'
                                >
                                    <TiArrowSortedDown className={`text-gray-900 text-3xl transition-transform ${showSupplyDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSupplyEdit}
                                    className="ml-3 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                                >
                                    <BiSolidEdit className='text-gray-900 text-xl' />
                                </button>
                            </div>
                        </div>

                        {/* Supply Dropdown */}
                        {showSupplyDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto mb-2">
                                <div className="p-3 bg-gray-50 border-b border-gray-200">
                                    <div className="text-sm font-semibold text-gray-700">
                                        {selectedDiagnosis ?
                                            `${selectedDiagnosis} - ${selectedEinlage}` :
                                            `${selectedEinlage} Optionen`
                                        } {hasDataLoaded && `(${versorgungData.length} gefunden)`}
                                    </div>
                                    {selectedDiagnosis && (
                                        <div className="text-xs text-blue-600 mt-1">
                                            Diagnosebasierte Auswahl für {selectedEinlage}
                                        </div>
                                    )}
                                </div>

                                {loadingVersorgung ? (
                                    <div className="p-8 text-center">
                                        <ImSpinner2 className="animate-spin text-2xl text-gray-500 mx-auto mb-2" />
                                        <div className="text-sm text-gray-500">Lade Daten...</div>
                                    </div>
                                ) : hasDataLoaded && versorgungData.length > 0 ? (
                                    // Show API Data
                                    versorgungData.map((item, index) => {
                                        const isSelected = selectedVersorgungId === item.id;
                                        return (
                                            <div
                                                key={item.id || index}
                                                className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${isSelected
                                                    ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleVersorgungCardSelect(item)}
                                            >
                                                <div className={`font-semibold mb-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {item.name}
                                                    {isSelected && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Ausgewählt
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                                    <div><span className="font-medium">Rohling:</span> {item.rohlingHersteller}</div>
                                                    <div><span className="font-medium">Artikel:</span> {item.artikelHersteller}</div>
                                                </div>
                                                <div className={`text-sm mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    <span className="font-medium">Versorgung:</span> {item.versorgung}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <span className="font-medium">Material:</span> {item.material}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : hasDataLoaded && versorgungData.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-sm">Keine Daten für {selectedEinlage} gefunden</div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-sm">Bitte wählen Sie eine Einlage-Kategorie aus</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {editingSupply ? (
                            <textarea
                                value={supply}
                                onChange={(e) => setSupply(e.target.value)}
                                onBlur={handleSupplyBlur}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                autoFocus
                            />
                        ) : (
                            <div className="p-2 border border-gray-300 rounded min-h-[100px]">
                                {selectedVersorgungId && versorgungData.length > 0 ? (() => {
                                    const selectedItem = versorgungData.find((item: any) => item.id === selectedVersorgungId);
                                    if (selectedItem) {
                                        return (
                                            <div className="space-y-2">
                                                <div className="font-semibold text-gray-900">{selectedItem.name}</div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <div><span className="font-medium">Rohling:</span> {selectedItem.rohlingHersteller}</div>
                                                    <div><span className="font-medium">Artikel:</span> {selectedItem.artikelHersteller}</div>
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Versorgung:</span> {selectedItem.versorgung}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <span className="font-medium">Material:</span> {selectedItem.material}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return supply || <span className="text-gray-400 italic">Keine Versorgung ausgewählt</span>;
                                })() : supply || <span className="text-gray-400 italic">Keine Versorgung ausgewählt</span>}
                            </div>
                        )}
                    </div>
                </div>


                {/* Schuhmodell wählen input field */}
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center w-full">
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-lg font-semibold">Schuhmodell</h3>
                        </div>
                        <Input 
                            type="text" 
                            placeholder="Manuell eintragen (Marke+Modell+Größe)" 
                            value={schuhmodell_wählen}
                            onChange={(e) => setSchuhmodell_wählen(e.target.value)}
                        />
                    </div>

                    {/* Kostenvoranschlag */}
                    <div className="w-full xl:w-1/2 mt-5">
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

                <div className="flex justify-center my-10">
                    <Button
                        type="button"
                        className="bg-black cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[160px]"
                        onClick={handleSpeichernClick}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Speichern...' : 'Speichern'}
                    </Button>
                </div>
            </div>

            {/* User Info Update Modal */}
            <UserInfoUpdateModal
                isOpen={showUserInfoUpdateModal}
                onOpenChange={setShowUserInfoUpdateModal}
                scanData={customer as ScanData}
                formData={formDataForOrder}
                onInfoUpdate={() => {
                    // Refresh the customer data to show updated prices
                    onDataRefresh?.()
                }}
                onShowOrderConfirmation={(formData) => {
                    setFormDataForOrder(formData || formDataForOrder);
                    setShowConfirmModal(true);
                }}
            />

            {/* Order Confirmation Modal */}
            <OrderConfirmationModal 
                showConfirmModal={showConfirmModal} 
                setShowConfirmModal={setShowConfirmModal} 
                handleConfirmOrder={handleConfirmOrder} 
                isCreating={isCreating}
                formData={formDataForOrder}
                customerId={customer?.id}
                versorgungId={resolveVersorgungIdFromText()}
            />

            {/* PDF Generation Modal */}
            <InvoiceGeneratePdfModal
                isOpen={showPdfModal}
                onClose={handleClosePdfModal}
                orderId={currentOrderId}
            />

            {/* Hidden InvoicePage component for PDF generation */}
            {orderData && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <InvoicePage
                        data={orderData}
                        isGenerating={false}
                        onGenerateStart={() => { }}
                        onGenerateComplete={() => { }}
                    />
                </div>
            )}
        </div>
    );
}

