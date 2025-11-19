import React, { useState, useEffect } from 'react';
import { BiSolidEdit } from 'react-icons/bi';
import { ImSpinner2 } from 'react-icons/im';
import { TiArrowSortedDown } from "react-icons/ti";
import ManualEntryModal from './ManualEntryModal';
import FeetFirstInventoryModal from './FeetFirstInventoryModal';
import { useScanningFormData } from '@/hooks/customer/useScanningFormData';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';
import Image from 'next/image';
import { useCreateOrder } from '@/hooks/orders/useCreateOrder';
import InvoiceGeneratePdfModal from '../PdfModal/InvoiceGeneratePdf/InvoiceGeneratePdfModal';
import InvoicePage from '../PdfModal/InvoiceGeneratePdf/InvoicePage';
import { Button } from "@/components/ui/button";
import UserInfoUpdateModal from './UserInfoUpdateModal';
import { ScanData } from '@/types/scan';
import OrderConfirmationModal from './OrderConfirmationModal';
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee'


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
        // checkboxes
        manualEntry,
        fromFeetFirst,
        // manual entry modal
        showManualEntryModal,
        openManualEntryModal,
        handleManualEntryModalClose,
        handleManualEntryModalSave,
        manualEntryData,
        // feetfirst modal
        showFeetFirstModal,
        openFeetFirstModal,
        handleFeetFirstModalClose,
        handleFeetFirstModalSave,
        feetFirstData,
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
        handleManualEntryCheckboxChange,
        handleFeetFirstCheckboxChange,
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
                name: selectedEinlage || 'Einlage',
                rohlingHersteller: 'Standard',
                artikelHersteller: 'Standard',
                versorgung: supply || 'Standard Versorgung',
                material: 'Standard Material',
                langenempfehlung: {},
                status: 'Active',
                diagnosis_status: diagnosis || null,
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
        if (customer?.id && resolvedId) {
            try {
                const result = await createOrderAndGeneratePdf(customer.id, resolvedId, autoSendToCustomer);
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
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                onBlur={handleDiagnosisBlur}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Geben Sie hier die ausführliche Diagnose ein..."
                                autoFocus
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
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                onBlur={handleDiagnosisBlur}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Geben Sie hier die ausführliche Diagnose ein..."
                                autoFocus
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
                                <span className={`text-sm sm:text-base truncate pr-2 ${selectedEinlage ? '' : 'text-gray-400'}`}>
                                    {selectedEinlage || "Einlage auswählen"}
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
                </div>

                {/* Durchgeführt von: dropdown  */}

                <div>
                    {/* Durchgeführt von: dropdown  */}
                </div>

                {/* Diagnosis and Supply Editable Fields */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Versorgung */}
                    <div className="relative">
                        <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold">Ausführliche Diagnose</h3>
                            <button
                                type="button"
                                onClick={handleDiagnosisEdit}
                                className="ml-3 cursor-pointer"
                                disabled={isSavingDiagnosis}
                            >
                                <BiSolidEdit className='text-gray-900 text-xl' />
                            </button>
                            {isSavingDiagnosis && (
                                <div className="ml-2 flex items-center">
                                    <ImSpinner2 className="animate-spin text-blue-500 text-sm" />
                                    <span className="ml-1 text-sm text-blue-600">Speichern...</span>
                                </div>
                            )}
                        </div>
                        {editingDiagnosis ? (
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                onBlur={handleDiagnosisBlur}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Geben Sie hier die ausführliche Diagnose ein..."
                                autoFocus
                            />
                        ) : (
                            <div className="p-2 border border-gray-300 rounded min-h-[100px] cursor-pointer" onClick={handleDiagnosisEdit}>
                                {diagnosis || (
                                    <span className="text-gray-400 italic">
                                        Klicken Sie hier oder auf das Bearbeiten-Symbol, um eine ausführliche Diagnose hinzuzufügen...
                                    </span>
                                )}
                            </div>
                        )}
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
                                {supply}
                            </div>
                        )}
                    </div>
                </div>

                {/* Checkbox Section (Schuhmodell wählen) */}
                <div className="flex flex-col md:flex-row md:items-start md:space-x-8 mb-8 mt-8">
                    <div className="mb-2 md:mb-0 min-w-max font-semibold flex items-center" style={{ fontWeight: 600 }}>
                        Schuhmodell wählen (optional aber empfohlen)
                    </div>
                    <div className="flex flex-col space-y-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5"
                                checked={manualEntry}
                                onChange={(e) => {
                                    handleManualEntryCheckboxChange(e.target.checked)
                                }}
                            />
                            <span>Manuell eintragen (Marke + Modell + Größe)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5"
                                checked={fromFeetFirst}
                                onChange={(e) => {
                                    handleFeetFirstCheckboxChange(e.target.checked)
                                }}
                            />
                            <span>Aus FeetFirst Bestand wählen</span>
                        </label>
                    </div>
                </div>



                {/* Manual Entry Data Display */}
                {manualEntry && (manualEntryData.marke || manualEntryData.modell || manualEntryData.kategorie || manualEntryData.grosse) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-semibold text-blue-900">Manuell eingetragenes Schuhmodell</h4>
                            <button
                                onClick={openManualEntryModal}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Bearbeiten
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Marke:</span>
                                <div className="text-gray-900">{manualEntryData.marke || '-'}</div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Modell:</span>
                                <div className="text-gray-900">{manualEntryData.modell || '-'}</div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Kategorie:</span>
                                <div className="text-gray-900">{manualEntryData.kategorie || '-'}</div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Größe:</span>
                                <div className="text-gray-900">{manualEntryData.grosse || '-'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FeetFirst Inventory Data Display */}
                {fromFeetFirst && (feetFirstData.kategorie || feetFirstData.marke || feetFirstData.modell || feetFirstData.grosse) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-semibold text-green-900">Aus FeetFirst-Bestand ausgewählt</h4>
                            <button
                                onClick={openFeetFirstModal}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                                Bearbeiten
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            {feetFirstData.image && (
                                <Image
                                    width={100}
                                    height={100}
                                    src={feetFirstData.image}
                                    alt={feetFirstData.modell}
                                    className="w-16 h-16 object-cover rounded-md"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/products/shoes.png';
                                    }}
                                />
                            )}
                            <div className="flex-1">
                                <div className="text-lg font-semibold text-gray-900 mb-2">
                                    {feetFirstData.kategorie} – {feetFirstData.marke} – {feetFirstData.modell} – Größe {feetFirstData.grosse}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Kategorie:</span>
                                        <div className="text-gray-900">{feetFirstData.kategorie || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Marke:</span>
                                        <div className="text-gray-900">{feetFirstData.marke || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Modell:</span>
                                        <div className="text-gray-900">{feetFirstData.modell || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Größe:</span>
                                        <div className="text-gray-900">{feetFirstData.grosse || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex justify-center my-10">
                    <Button
                        type="button"
                        className="bg-black cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[160px]"
                        onClick={() => setShowUserInfoUpdateModal(true)}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Speichern...' : 'Speichern'}
                    </Button>
                </div>
            </div>

            {/* Manual Entry Modal */}
            <ManualEntryModal
                isOpen={showManualEntryModal}
                onClose={handleManualEntryModalClose}
                onSave={handleManualEntryModalSave}
                initialData={manualEntryData}
            />

            {/* FeetFirst Inventory Modal */}
            <FeetFirstInventoryModal
                isOpen={showFeetFirstModal}
                onClose={handleFeetFirstModalClose}
                onSave={handleFeetFirstModalSave}
            />

            {/* User Info Update Modal */}
            <UserInfoUpdateModal
                isOpen={showUserInfoUpdateModal}
                onOpenChange={setShowUserInfoUpdateModal}
                scanData={customer as ScanData}
                onInfoUpdate={() => {
                    // Refresh the customer data to show updated prices
                    onDataRefresh?.()
                }}
                onShowOrderConfirmation={() => setShowConfirmModal(true)}
            />

            {/* Order Confirmation Modal */}
            <OrderConfirmationModal showConfirmModal={showConfirmModal} setShowConfirmModal={setShowConfirmModal} handleConfirmOrder={handleConfirmOrder} isCreating={isCreating} />

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

