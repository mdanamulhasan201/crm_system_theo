import React, { useState, useEffect } from 'react';
import { useScanningFormData } from '@/hooks/customer/useScanningFormData';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';
import { useCreateOrder } from '@/hooks/orders/useCreateOrder';
import InvoiceGeneratePdfModal from '../PdfModal/InvoiceGeneratePdf/InvoiceGeneratePdfModal';
import InvoicePage from '../PdfModal/InvoiceGeneratePdf/InvoicePage';
import { Button } from '@/components/ui/button';
import { ScanData } from '@/types/scan';
import OrderConfirmationModal from './OrderConfirmationModal';
import { useEinlagenForm } from '../../../../../hooks/einlagen/useEinlagenForm';
import { createOrderData, collectFormData } from './utils/orderDataUtils';
import TextAreaSection from './Einlagen/FormSections/TextAreaSection';
import DiagnosisSection from './Einlagen/FormSections/DiagnosisSection';
import ProductSelectionSection from './Einlagen/FormSections/ProductSelectionSection';
import SupplySection from './Einlagen/FormSections/SupplySection';
import AdditionalFieldsSection from './Einlagen/FormSections/AdditionalFieldsSection';
import WerkstattzettelModal from './WerkstattzettelModal';

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

// Constants
const EINLAGE_OPTIONS: EinlageType[] = ['Alltagseinlage', 'Sporteinlage', 'Businesseinlage'];
const UBERZUG_OPTIONS = ['Leder', 'Microfaser Schwarz', 'Microfaser Beige'];
const MENGE_OPTIONS = ['1 paar', '2 paar', '3 paar', '4 paar', '5 paar'];

export default function Einlagen({ customer, onCustomerUpdate, onDataRefresh }: ScanningFormProps) {
    // Scanning form data hook
    const {
        diagnosisOptions,
        showDiagnosisDropdown,
        setShowDiagnosisDropdown,
        selectedDiagnosis,
        showSupplyDropdown,
        handleSupplyDropdownToggle,
        versorgungData,
        loadingVersorgung,
        hasDataLoaded,
        selectedVersorgungId,
        diagnosis,
        supply,
        selectedEinlage,
        handleDiagnosisSelect,
        handleVersorgungCardSelect,
        handleEinlageButtonClick,
        clearDiagnosisAndReloadOptions,
        resolveVersorgungIdFromText,
    } = useScanningFormData(customer, onCustomerUpdate);

    // Custom form hook
    const formHook = useEinlagenForm({ selectedEinlage });

    // Order creation hook
    const { createOrderAndGeneratePdf, isCreating } = useCreateOrder();

    // Modal states
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [autoSendToCustomer, setAutoSendToCustomer] = useState(false);
    const [realOrderData, setRealOrderData] = useState<any>(null);
    const [showUserInfoUpdateModal, setShowUserInfoUpdateModal] = useState(false);
    const [formDataForOrder, setFormDataForOrder] = useState<any>(null);

    // Sync einlagentyp when selectedEinlage changes
    useEffect(() => {
        if (selectedEinlage && !formHook.einlagentyp) {
            formHook.setEinlagentyp(selectedEinlage as string);
        }
    }, [selectedEinlage, formHook.einlagentyp]);

    // Listen for order data updates
    useEffect(() => {
        const handleOrderDataUpdate = (event: any) => {
            setRealOrderData(event.detail.orderData);
        };

        window.addEventListener('orderDataUpdated', handleOrderDataUpdate);
        return () => {
            window.removeEventListener('orderDataUpdated', handleOrderDataUpdate);
        };
    }, []);

    // Handlers
    const handleClosePdfModal = () => {
        setShowPdfModal(false);
        setCurrentOrderId(undefined);
        setRealOrderData(null);
    };

    const handleConfirmOrder = async () => {
        const resolvedId = resolveVersorgungIdFromText();
        const werkstattzettelId =
            typeof window !== 'undefined' ? localStorage.getItem('werkstattzettelId') || undefined : undefined;

        if (customer?.id && resolvedId && formDataForOrder) {
            try {
                const orderPayload = {
                    customerId: customer.id,
                    versorgungId: resolvedId,
                    werkstattzettelId: werkstattzettelId,
                    ...formDataForOrder,
                };

                const result = await createOrderAndGeneratePdf(
                    customer.id,
                    resolvedId,
                    autoSendToCustomer,
                    orderPayload
                );
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

    const handleSpeichernClick = () => {
        const formData = collectFormData({
            ausführliche_diagnose: formHook.ausführliche_diagnose,
            versorgung_laut_arzt: formHook.versorgung_laut_arzt,
            einlagentyp: formHook.einlagentyp,
            selectedEinlage: selectedEinlage as string,
            überzug: formHook.überzug,
            menge: formHook.menge,
            supply,
            versorgung_note: formHook.versorgung_note,
            schuhmodell_wählen: formHook.schuhmodell_wählen,
            kostenvoranschlag: formHook.kostenvoranschlag,
            selectedEmployee: formHook.selectedEmployee,
            selectedEmployeeId: formHook.selectedEmployeeId,
            versorgungData,
            selectedVersorgungId,
        });
        setFormDataForOrder(formData);
        setShowUserInfoUpdateModal(true);
    };

    const handleEinlageSelect = (value: EinlageType) => {
        handleEinlageButtonClick(value);
        formHook.setEinlagentyp(value);
        formHook.setShowEinlageDropdown(false);
    };

    // Create order data for PDF
    const orderData = createOrderData({
        customer,
        realOrderData,
        einlagentyp: formHook.einlagentyp,
        selectedEinlage,
        supply,
        ausführliche_diagnose: formHook.ausführliche_diagnose,
        diagnosis,
    });

    return (
        <div>
            <div className="mt-10">
                {/* Text Area Section */}
                <TextAreaSection
                    leftLabel="Ärztliche Diagnose/ Ausführliche Diagnose"
                    leftValue={formHook.ausführliche_diagnose}
                    leftPlaceholder="Geben Sie hier die ausführliche Diagnose ein..."
                    leftOnChange={formHook.setAusführliche_diagnose}
                    rightLabel="Versorgung laut Arzt"
                    rightValue={formHook.versorgung_laut_arzt}
                    rightPlaceholder="Versorgung laut Arzt eingeben..."
                    rightOnChange={formHook.setVersorgung_laut_arzt}
                />

                {/* Diagnosis Section */}
                <DiagnosisSection
                    diagnosisOptions={diagnosisOptions}
                    showDiagnosisDropdown={showDiagnosisDropdown}
                    setShowDiagnosisDropdown={setShowDiagnosisDropdown}
                    selectedDiagnosis={selectedDiagnosis}
                    onDiagnosisSelect={handleDiagnosisSelect}
                    onDiagnosisClear={clearDiagnosisAndReloadOptions}
                    selectedEmployee={formHook.selectedEmployee}
                    isEmployeeDropdownOpen={formHook.isEmployeeDropdownOpen}
                    employeeSearchText={formHook.employeeSearchText}
                    employeeSuggestions={formHook.employeeSuggestions}
                    employeeLoading={formHook.employeeLoading}
                    onEmployeeDropdownChange={formHook.handleEmployeeDropdownChange}
                    onEmployeeSearchChange={formHook.handleEmployeeSearchChange}
                    onEmployeeSelect={formHook.handleEmployeeSelect}
                />

                {/* Product Selection Section */}
                <ProductSelectionSection
                    einlagentyp={formHook.einlagentyp}
                    selectedEinlage={selectedEinlage}
                    einlageOptions={EINLAGE_OPTIONS}
                    showEinlageDropdown={formHook.showEinlageDropdown}
                    onEinlageToggle={() => formHook.setShowEinlageDropdown(!formHook.showEinlageDropdown)}
                    onEinlageSelect={handleEinlageSelect}
                    überzug={formHook.überzug}
                    uberzugOptions={UBERZUG_OPTIONS}
                    showUberzugDropdown={formHook.showUberzugDropdown}
                    onUberzugToggle={() => formHook.setShowUberzugDropdown(!formHook.showUberzugDropdown)}
                    onUberzugSelect={(value) => {
                        formHook.setÜberzug(value);
                        formHook.setShowUberzugDropdown(false);
                    }}
                    menge={formHook.menge}
                    mengeOptions={MENGE_OPTIONS}
                    showMengeDropdown={formHook.showMengeDropdown}
                    onMengeToggle={() => formHook.setShowMengeDropdown(!formHook.showMengeDropdown)}
                    onMengeSelect={(value) => {
                        formHook.setMenge(value);
                        formHook.setShowMengeDropdown(false);
                    }}
                />

                {/* Supply Section */}
                <SupplySection
                    versorgungNote={formHook.versorgung_note}
                    onVersorgungNoteChange={formHook.setVersorgung_note}
                    showSupplyDropdown={showSupplyDropdown}
                    onSupplyDropdownToggle={handleSupplyDropdownToggle}
                    selectedDiagnosis={selectedDiagnosis}
                    selectedEinlage={selectedEinlage as string}
                    versorgungData={versorgungData}
                    loadingVersorgung={loadingVersorgung}
                    hasDataLoaded={hasDataLoaded}
                    selectedVersorgungId={selectedVersorgungId}
                    supply={supply}
                    onVersorgungCardSelect={handleVersorgungCardSelect}
                />

                {/* Additional Fields Section */}
                <AdditionalFieldsSection
                    schuhmodell_wählen={formHook.schuhmodell_wählen}
                    onSchuhmodellChange={formHook.setSchuhmodell_wählen}
                    kostenvoranschlag={formHook.kostenvoranschlag}
                    onKostenvoranschlagChange={formHook.setKostenvoranschlag}
                />

                {/* Save Button */}
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

            {/* Modals */}
            <WerkstattzettelModal
                isOpen={showUserInfoUpdateModal}
                onOpenChange={setShowUserInfoUpdateModal}
                scanData={customer as ScanData}
                formData={formDataForOrder}
                onInfoUpdate={() => {
                    onDataRefresh?.();
                }}
                onShowOrderConfirmation={(formData) => {
                    setFormDataForOrder(formData || formDataForOrder);
                    setShowConfirmModal(true);
                }}
            />

            <OrderConfirmationModal
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
                handleConfirmOrder={handleConfirmOrder}
                isCreating={isCreating}
                formData={formDataForOrder}
                customerId={customer?.id}
                versorgungId={resolveVersorgungIdFromText()}
            />

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
