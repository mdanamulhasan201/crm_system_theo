import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
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
import { getSettingData } from '@/apis/einlagenApis';

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

interface PrefillOrderData {
    id: string;
    versorgungId?: string | null;
    versorgung?: string | null;
    ausführliche_diagnose?: string | null;
    versorgung_laut_arzt?: string | null;
    einlagentyp?: string | null;
    überzug?: string | null;
    menge?: number | string | null;
    versorgung_note?: string | null;
    schuhmodell_wählen?: string | null;
    kostenvoranschlag?: boolean | null;
    werkstattzettel?: {
        versorgung?: string | null;
        mitarbeiter?: string | null;
        employeeId?: string | null;
    };
    product?: {
        versorgung?: string | null;
        diagnosis_status?: string | null;
    };
}

interface ScanningFormProps {
    customer?: Customer;
    prefillOrderData?: PrefillOrderData | null;
    onCustomerUpdate?: (updatedCustomer: Customer) => void;
    onDataRefresh?: () => void;
}

// Constants
const MENGE_OPTIONS = ['1 paar', '2 paar', '3 paar', '4 paar', '5 paar'];
const DIAGNOSIS_CODE_TO_LABEL: Record<string, string> = {
    PLANTARFASZIITIS: 'Plantarfasziitis',
    FERSENSPORN: 'Fersensporn',
    SPREIZFUSS: 'Spreizfuß',
    SENKFUSS: 'Senkfuß',
    PLATTFUSS: 'Plattfuß',
    HOHLFUSS: 'Hohlfuß',
    KNICKFUSS: 'Knickfuß',
    KNICK_SENKFUSS: 'Knick-Senkfuß',
    HALLUX_VALGUS: 'Hallux valgus',
    HALLUX_RIGIDUS: 'Hallux rigidus',
    HAMMERZEHEN_KRALLENZEHEN: 'Hammerzehen / Krallenzehen',
    MORTON_NEUROM: 'Morton-Neurom',
    FUSSARTHROSE: 'Fußarthrose',
    STRESSFRAKTUREN_IM_FUSS: 'Stressfrakturen im Fußbereich',
    DIABETISCHES_FUSSSYNDROM: 'Diabetisches Fußsyndrom',
};

// Validation Schema
const einlagenFormSchema = z.object({
    ausführliche_diagnose: z.string().min(1, 'Ausführliche Diagnose ist erforderlich'),
    versorgung_laut_arzt: z.string().optional(),
    einlagentyp: z.string().min(1, 'Einlagentyp ist erforderlich'),
    überzug: z.string().min(1, 'Überzug ist erforderlich'),
    menge: z.string().min(1, 'Menge ist erforderlich'),
    versorgung: z.string().min(1, 'Versorgung ist erforderlich'),
    versorgung_note: z.string().optional(),
    schuhmodell_wählen: z.string().optional(),
    kostenvoranschlag: z.boolean().nullable().optional(),
});

type EinlagenFormData = z.infer<typeof einlagenFormSchema>;

const formatMengeValue = (value?: number | string | null) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return `${value} paar`;
    }
    if (typeof value === 'string' && value.trim()) {
        return value;
    }
    return '';
};

const parseBooleanValue = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === '1';
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    return false;
};

const mapEinlageType = (value?: string | null, options: string[] = []) => {
    if (!value) return undefined;
    return options.find((option: string) => option === value) as EinlageType | undefined;
};

export default function Einlagen({ customer, prefillOrderData, onCustomerUpdate, onDataRefresh }: ScanningFormProps) {
    // React Hook Form setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger,
    } = useForm<EinlagenFormData>({
        resolver: zodResolver(einlagenFormSchema),
        mode: 'onChange',
        defaultValues: {
            ausführliche_diagnose: '',
            versorgung_laut_arzt: '',
            einlagentyp: '',
            überzug: '',
            menge: '',
            versorgung: '',
            versorgung_note: '',
            schuhmodell_wählen: '',
            kostenvoranschlag: null,
        },
    });

    // Scanning form data hook
    const {
        diagnosisOptions,
        showDiagnosisDropdown,
        setShowDiagnosisDropdown,
        selectedDiagnosis,
        setSelectedDiagnosis,
        showSupplyDropdown,
        handleSupplyDropdownToggle,
        versorgungData,
        loadingVersorgung,
        hasDataLoaded,
        selectedVersorgungId,
        setSelectedVersorgungId,
        diagnosis,
        supply,
        setSupply,
        selectedEinlage,
        einlageOptions,
        handleDiagnosisSelect,
        handleVersorgungCardSelect,
        handleEinlageButtonClick,
        clearDiagnosisAndReloadOptions,
        resolveVersorgungIdFromText,
    } = useScanningFormData(customer, onCustomerUpdate);

    // Custom form hook
    const formHook = useEinlagenForm({ selectedEinlage });
    const prefillHandledRef = useRef<string | null>(null);
    const {
        ausführliche_diagnose,
        versorgung_laut_arzt,
        einlagentyp,
        überzug,
        menge,
        versorgung_note,
        schuhmodell_wählen,
        kostenvoranschlag,
        showEinlageDropdown,
        setShowEinlageDropdown,
        showUberzugDropdown,
        setShowUberzugDropdown,
        showMengeDropdown,
        setShowMengeDropdown,
        selectedEmployee,
        selectedEmployeeId,
        isEmployeeDropdownOpen,
        employeeSearchText,
        employeeSuggestions,
        employeeLoading,
        handleEmployeeDropdownChange,
        handleEmployeeSearchChange,
        handleEmployeeSelect,
        setAusführliche_diagnose,
        setVersorgung_laut_arzt,
        setEinlagentyp,
        setÜberzug,
        setMenge,
        setVersorgung_note,
        setSchuhmodell_wählen,
        setKostenvoranschlag,
    } = formHook;

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
    const [orderPrices, setOrderPrices] = useState<{ fussanalysePreis: number; einlagenversorgungPreis: number } | null>(null);
    
    // Settings data state
    const [coverTypes, setCoverTypes] = useState<string[]>([]);
    const [loadingSettings, setLoadingSettings] = useState(false);

    // Fetch settings data on mount
    useEffect(() => {
        const fetchSettings = async () => {
            setLoadingSettings(true);
            try {
                const response = await getSettingData();
                if (response?.data?.cover_types && Array.isArray(response.data.cover_types)) {
                    setCoverTypes(response.data.cover_types);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    // Sync form values with React Hook Form
    useEffect(() => {
        if (ausführliche_diagnose !== undefined) {
            setValue('ausführliche_diagnose', ausführliche_diagnose);
        }
        if (versorgung_laut_arzt !== undefined) {
            setValue('versorgung_laut_arzt', versorgung_laut_arzt);
        }
        if (einlagentyp) {
            setValue('einlagentyp', einlagentyp);
        }
        if (überzug) {
            setValue('überzug', überzug);
        }
        if (menge) {
            setValue('menge', menge);
        }
        if (supply) {
            setValue('versorgung', supply);
        }
        if (versorgung_note !== undefined) {
            setValue('versorgung_note', versorgung_note);
        }
        if (schuhmodell_wählen !== undefined) {
            setValue('schuhmodell_wählen', schuhmodell_wählen);
        }
        if (kostenvoranschlag !== undefined) {
            setValue('kostenvoranschlag', kostenvoranschlag);
        }
    }, [
        ausführliche_diagnose,
        versorgung_laut_arzt,
        einlagentyp,
        überzug,
        menge,
        supply,
        versorgung_note,
        schuhmodell_wählen,
        kostenvoranschlag,
        setValue,
    ]);

    // Sync einlagentyp when selectedEinlage changes
    useEffect(() => {
        if (selectedEinlage && !einlagentyp) {
            setEinlagentyp(selectedEinlage as string);
            setValue('einlagentyp', selectedEinlage as string);
        }
    }, [selectedEinlage, einlagentyp, setEinlagentyp, setValue]);

    // Reset prefill tracker when order changes back to null
    useEffect(() => {
        if (!prefillOrderData) {
            prefillHandledRef.current = null;
        }
    }, [prefillOrderData]);

    // Prefill form fields when an order is provided
    useEffect(() => {
        if (!prefillOrderData) return;
        if (prefillHandledRef.current === prefillOrderData.id) return;
        prefillHandledRef.current = prefillOrderData.id;

        if (typeof prefillOrderData.ausführliche_diagnose !== 'undefined') {
            setAusführliche_diagnose(prefillOrderData.ausführliche_diagnose ?? '');
        }
        if (typeof prefillOrderData.versorgung_laut_arzt !== 'undefined') {
            setVersorgung_laut_arzt(prefillOrderData.versorgung_laut_arzt ?? '');
        }
        // Only map einlagentyp if einlageOptions are available
        if (einlageOptions && einlageOptions.length > 0) {
            const derivedEinlage = mapEinlageType(prefillOrderData.einlagentyp, einlageOptions);
            if (derivedEinlage) {
                handleEinlageButtonClick(derivedEinlage);
                setEinlagentyp(derivedEinlage);
            }
        }
        if (typeof prefillOrderData.überzug !== 'undefined') {
            setÜberzug(prefillOrderData.überzug ?? '');
        }
        const mengeOption = formatMengeValue(prefillOrderData.menge);
        if (mengeOption) {
            setMenge(mengeOption);
        }
        if (typeof prefillOrderData.versorgung_note !== 'undefined') {
            setVersorgung_note(prefillOrderData.versorgung_note ?? '');
        }
        if (typeof prefillOrderData.schuhmodell_wählen !== 'undefined') {
            setSchuhmodell_wählen(prefillOrderData.schuhmodell_wählen ?? '');
        }
        if (typeof prefillOrderData.kostenvoranschlag !== 'undefined') {
            setKostenvoranschlag(parseBooleanValue(prefillOrderData.kostenvoranschlag));
        }
        const diagnosisLabel = DIAGNOSIS_CODE_TO_LABEL[prefillOrderData.product?.diagnosis_status ?? ''];
        if (diagnosisLabel) {
            setSelectedDiagnosis(diagnosisLabel);
        }
        const supplyValue =
            prefillOrderData.werkstattzettel?.versorgung ||
            prefillOrderData.product?.versorgung ||
            prefillOrderData.versorgung ||
            '';
        if (supplyValue) {
            setSupply(supplyValue);
        }
        if (prefillOrderData.versorgungId) {
            setSelectedVersorgungId(prefillOrderData.versorgungId);
        }
        if (prefillOrderData.werkstattzettel?.mitarbeiter) {
            handleEmployeeSelect({
                employeeName: prefillOrderData.werkstattzettel.mitarbeiter,
                id: prefillOrderData.werkstattzettel.employeeId || '',
            });
        }
    }, [
        prefillOrderData,
        prefillHandledRef,
        handleEinlageButtonClick,
        handleEmployeeSelect,
        setAusführliche_diagnose,
        setVersorgung_laut_arzt,
        setEinlagentyp,
        setÜberzug,
        setMenge,
        setVersorgung_note,
        setSchuhmodell_wählen,
        setKostenvoranschlag,
        setSelectedDiagnosis,
        setSupply,
        setSelectedVersorgungId,
        einlageOptions,
    ]);

    // Listen for order data updates
    useEffect(() => {
        const handleOrderDataUpdate = (event: any) => {
            const orderData = event.detail.orderData;
            // Ensure prices are never null/undefined - use form prices as fallback
            if (orderData) {
                // If API returns null prices, use the prices from formDataForOrder
                orderData.fußanalyse = orderData.fußanalyse ?? orderPrices?.fussanalysePreis ?? 0;
                orderData.einlagenversorgung = orderData.einlagenversorgung ?? orderPrices?.einlagenversorgungPreis ?? 0;
                orderData.totalPrice = orderData.totalPrice ?? (orderData.fußanalyse + orderData.einlagenversorgung);
            }
            setRealOrderData(orderData);
        };

        window.addEventListener('orderDataUpdated', handleOrderDataUpdate);
        return () => {
            window.removeEventListener('orderDataUpdated', handleOrderDataUpdate);
        };
    }, [orderPrices]);

    // Handlers
    const handleClosePdfModal = () => {
        setShowPdfModal(false);
        setCurrentOrderId(undefined);
        setRealOrderData(null);
        setOrderPrices(null);
    };

    const handleConfirmOrder = async () => {
        const resolvedId = resolveVersorgungIdFromText();

        if (customer?.id && resolvedId && formDataForOrder) {
            try {
                // Combine all form data (Einlagen + Werkstattzettel) into one payload
                // All fields are sent inline to /customer-orders/create
                // Store prices for fallback if API returns null
                const fussanalysePreis = Number(formDataForOrder.fussanalysePreis) || 0;
                const einlagenversorgungPreis = Number(formDataForOrder.einlagenversorgungPreis) || 0;
                setOrderPrices({ fussanalysePreis, einlagenversorgungPreis });

                const orderPayload = {
                    customerId: customer.id,
                    versorgungId: resolvedId,
                    // Einlagen fields
                    einlagentyp: formDataForOrder.einlagentyp || '',
                    überzug: formDataForOrder.überzug || '',
                    menge: formDataForOrder.menge || 1,
                    versorgung_note: formDataForOrder.versorgung_note || '',
                    schuhmodell_wählen: formDataForOrder.schuhmodell_wählen || '',
                    kostenvoranschlag: formDataForOrder.kostenvoranschlag || false,
                    ausführliche_diagnose: formDataForOrder.ausführliche_diagnose || '',
                    versorgung_laut_arzt: formDataForOrder.versorgung_laut_arzt || '',
                    // Werkstattzettel fields (inline)
                    kundenName: formDataForOrder.kundenName || '',
                    auftragsDatum: formDataForOrder.auftragsDatum || '',
                    wohnort: formDataForOrder.wohnort || '',
                    telefon: formDataForOrder.telefon || '',
                    email: formDataForOrder.email || '',
                    geschaeftsstandort: formDataForOrder.geschaeftsstandort || '',
                    mitarbeiter: formDataForOrder.mitarbeiter || '',
                    fertigstellungBis: formDataForOrder.fertigstellungBis || '',
                    versorgung: formDataForOrder.versorgung || '',
                    bezahlt: formDataForOrder.bezahlt || '',
                    // Prices - send both field name formats to ensure API receives them
                    fussanalysePreis: fussanalysePreis,
                    einlagenversorgungPreis: einlagenversorgungPreis,
                    fußanalyse: fussanalysePreis, // Also send as fußanalyse in case API expects this
                    einlagenversorgung: einlagenversorgungPreis, // Also send as einlagenversorgung in case API expects this
                    werkstattEmployeeId: formDataForOrder.employeeId || formDataForOrder.werkstattEmployeeId || '',
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

    const handleSpeichernClick = async () => {
        // Trigger validation for all fields
        const isValid = await trigger();
        
        if (!isValid) {
            // Show error toast with first error message
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
                toast.error(firstError.message as string);
            } else {
                toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            }
            return;
        }

        const formData = collectFormData({
            ausführliche_diagnose,
            versorgung_laut_arzt,
            einlagentyp,
            selectedEinlage: selectedEinlage as string,
            überzug,
            menge,
            supply,
            versorgung_note,
            schuhmodell_wählen,
            kostenvoranschlag,
            selectedEmployee,
            selectedEmployeeId,
            versorgungData,
            selectedVersorgungId,
        });
        setFormDataForOrder(formData);
        setShowUserInfoUpdateModal(true);
    };

    const handleEinlageSelect = (value: EinlageType) => {
        handleEinlageButtonClick(value);
        setEinlagentyp(value);
        setShowEinlageDropdown(false);
    };

    // Create order data for PDF - ensure we always have a valid object
    const orderData = createOrderData({
        customer,
        realOrderData,
        einlagentyp,
        selectedEinlage,
        supply,
        ausführliche_diagnose,
        diagnosis,
    }) || (customer ? {
        id: 'temp-id',
        customerId: customer.id,
        partnerId: 'temp-partner-id',
        fußanalyse: 0,
        einlagenversorgung: 0,
        totalPrice: 0,
        productId: 'temp-product-id',
        orderStatus: 'Started',
        statusUpdate: new Date().toISOString(),
        invoice: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: {
            id: customer.id,
            customerNumber: 0,
            vorname: customer.vorname || '',
            nachname: customer.nachname || '',
            email: customer.email || '',
            telefonnummer: '',
            wohnort: '',
        },
        partner: {
            id: 'temp-partner-id',
            name: 'FeetFirst Partner',
            email: 'partner@feetfirst.com',
            image: '/images/pdfLogo.png',
            role: 'Partner',
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
            updatedAt: new Date().toISOString(),
        },
    } : null);

    return (
        <div>
            <div className="mt-10">
                {/* Text Area Section */}
                <TextAreaSection
                    leftLabel="Ärztliche Diagnose/ Ausführliche Diagnose"
                    leftValue={ausführliche_diagnose}
                    leftPlaceholder="Geben Sie hier die ausführliche Diagnose ein..."
                    leftOnChange={setAusführliche_diagnose}
                    rightLabel="Versorgung laut Arzt"
                    rightValue={versorgung_laut_arzt}
                    rightPlaceholder="Versorgung laut Arzt eingeben..."
                    rightOnChange={setVersorgung_laut_arzt}
                    leftError={errors.ausführliche_diagnose?.message}
                />

                {/* Diagnosis Section */}
                <DiagnosisSection
                    diagnosisOptions={diagnosisOptions}
                    showDiagnosisDropdown={showDiagnosisDropdown}
                    setShowDiagnosisDropdown={setShowDiagnosisDropdown}
                    selectedDiagnosis={selectedDiagnosis}
                    onDiagnosisSelect={handleDiagnosisSelect}
                    onDiagnosisClear={clearDiagnosisAndReloadOptions}
                    selectedEmployee={selectedEmployee}
                    isEmployeeDropdownOpen={isEmployeeDropdownOpen}
                    employeeSearchText={employeeSearchText}
                    employeeSuggestions={employeeSuggestions}
                    employeeLoading={employeeLoading}
                    onEmployeeDropdownChange={handleEmployeeDropdownChange}
                    onEmployeeSearchChange={handleEmployeeSearchChange}
                    onEmployeeSelect={handleEmployeeSelect}
                />

                {/* Product Selection Section */}
                <ProductSelectionSection
                    einlagentyp={einlagentyp}
                    selectedEinlage={selectedEinlage}
                    einlageOptions={einlageOptions}
                    showEinlageDropdown={showEinlageDropdown}
                    onEinlageToggle={() => setShowEinlageDropdown(!showEinlageDropdown)}
                    onEinlageSelect={(value) => {
                        handleEinlageSelect(value);
                        setValue('einlagentyp', value);
                    }}
                    einlagentypError={errors.einlagentyp?.message}
                    überzug={überzug}
                    uberzugOptions={coverTypes}
                    showUberzugDropdown={showUberzugDropdown}
                    onUberzugToggle={() => setShowUberzugDropdown(!showUberzugDropdown)}
                    onUberzugSelect={(value) => {
                        setÜberzug(value);
                        setShowUberzugDropdown(false);
                        setValue('überzug', value);
                    }}
                    überzugError={errors.überzug?.message}
                    menge={menge}
                    mengeOptions={MENGE_OPTIONS}
                    showMengeDropdown={showMengeDropdown}
                    onMengeToggle={() => setShowMengeDropdown(!showMengeDropdown)}
                    onMengeSelect={(value) => {
                        setMenge(value);
                        setShowMengeDropdown(false);
                        setValue('menge', value);
                    }}
                    mengeError={errors.menge?.message}
                />

                {/* Supply Section */}
                <SupplySection
                    versorgungNote={versorgung_note}
                    onVersorgungNoteChange={setVersorgung_note}
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
                    versorgungError={errors.versorgung?.message}
                />

                {/* Additional Fields Section */}
                <AdditionalFieldsSection
                    schuhmodell_wählen={schuhmodell_wählen}
                    onSchuhmodellChange={setSchuhmodell_wählen}
                    kostenvoranschlag={kostenvoranschlag}
                    onKostenvoranschlagChange={setKostenvoranschlag}
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

            {/* Hidden InvoicePage component for PDF generation - Always render to ensure element exists */}
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
