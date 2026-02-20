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
// import TextAreaSection from './Einlagen/FormSections/TextAreaSection';
// import DiagnosisSection from './Einlagen/FormSections/DiagnosisSection';
// import ProductSelectionSection from './Einlagen/FormSections/ProductSelectionSection';
import SupplySection from './Einlagen/FormSections/SupplySection';
import VersorgungKonfigurierenCard from './Einlagen/FormSections/VersorgungKonfigurierenCard';
// import AdditionalFieldsSection from './Einlagen/FormSections/AdditionalFieldsSection';
import RezeptAbrechnungCard from './Einlagen/FormSections/RezeptAbrechnungCard';
import ProduktBasisdatenCard from './Einlagen/FormSections/ProduktBasisdatenCard';
import VersorgungsnotizCard from './Einlagen/FormSections/VersorgungsnotizCard';
import WerkstattzettelModal from './WerkstattzettelModal';
import SpringerDialog from './SpringerDialog';
import { getSettingData } from '@/apis/einlagenApis';
// import PositionsnummerDropdown from './Einlagen/Dropdowns/PositionsnummerDropdown';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

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
    // Fields that can come directly from previous order APIs
    mitarbeiter?: string | null;
    employeeId?: string | null;
    bezahlt?: string | null;
    insoleStandards?: Array<{
        name: string;
        left: number;
        right: number;
        isFavorite?: boolean;
    }>;
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
    screenerId?: string | null;
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
    versorgung: z.string().optional(), // Made optional, will validate conditionally
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

const mapEinlageType = (value?: string | null, options: string[] | Array<{name: string, price?: number}> = []) => {
    if (!value) return undefined;
    // Handle both string array and object array formats
    if (options.length > 0 && typeof options[0] === 'object') {
        const objOptions = options as Array<{name: string, price?: number}>;
        const found = objOptions.find((option) => option.name === value);
        return found ? (found.name as EinlageType) : undefined;
    }
    const stringOptions = options as string[];
    return stringOptions.find((option: string) => option === value) as EinlageType | undefined;
};

export default function Einlagen({ customer, prefillOrderData, screenerId, onCustomerUpdate, onDataRefresh }: ScanningFormProps) {
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
        handleEmployeeClear,
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
    const [showSpringerDialog, setShowSpringerDialog] = useState(false);
    
    // Settings data state
    const [coverTypes, setCoverTypes] = useState<string[]>([]);
    const [loadingSettings, setLoadingSettings] = useState(false);
    
    // Billing type state (Krankenkassa/Privat)
    const [billingType, setBillingType] = useState<'Krankenkassa' | 'Privat'>('Krankenkassa');
    const [selectedPositionsnummer, setSelectedPositionsnummer] = useState<string[]>([]);
    const [showPositionsnummerDropdown, setShowPositionsnummerDropdown] = useState(false);
    const [lieferschein, setLieferschein] = useState<boolean | null>(null);
    const [itemSides, setItemSides] = useState<Record<string, 'L' | 'R' | 'BDS'>>({});
    
    // Insole Standards state (Zusätze/Custom Fields) - Initialize with default fields
    const [insoleStandards, setInsoleStandards] = useState<Array<{ name: string; left: number; right: number; isFavorite?: boolean }>>([
        { name: 'Verkürzungsausgleich', left: 0, right: 0, isFavorite: true },
        { name: 'Supination', left: 0, right: 0, isFavorite: true },
        { name: 'Pronation', left: 0, right: 0, isFavorite: true },
    ]);
    
    // Custom Versorgung ID and name for Einmalige Versorgung
    const [customVersorgungId, setCustomVersorgungId] = useState<string | null>(null);
    const [customVersorgungsname, setCustomVersorgungsname] = useState<string | null>(null);

    // Track active tab to determine which versorgung to use
    const [activeVersorgungTab, setActiveVersorgungTab] = useState<'standard' | 'einmalig' | 'springer' | 'manuell'>('standard');
    
    // Check localStorage for custom versorgung ID on mount
    useEffect(() => {
        const storedId = localStorage.getItem('key');
        if (storedId) {
            setCustomVersorgungId(storedId);
        }
    }, []);
    
    // Clear selectedPositionsnummer and itemSides when billingType changes
    useEffect(() => {
        setSelectedPositionsnummer([]);
        setItemSides({});
    }, [billingType]);
    
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
    
    const positionsnummerError = getPositionsnummerError();

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

    // Sync einlagentyp only when selectedEinlage changes (e.g. user clicks an Einlage button).
    // Do not re-sync when user clears the dropdown.
    const prevSelectedEinlageSyncRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (selectedEinlage && selectedEinlage !== prevSelectedEinlageSyncRef.current) {
            prevSelectedEinlageSyncRef.current = selectedEinlage as string;
            setEinlagentyp(selectedEinlage as string);
            setValue('einlagentyp', selectedEinlage as string);
        }
    }, [selectedEinlage, setEinlagentyp, setValue]);

    // TEMPORARY: Set a dummy einlagentyp for testing the SPRINGER logo
    useEffect(() => {
        if (!einlagentyp && !selectedEinlage && einlageOptions.length === 0) {
            // Set a dummy value to show the logo
            setEinlagentyp('Test Einlage');
            setValue('einlagentyp', 'Test Einlage');
        }
    }, []);

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
        // Prefill employee (supports both werkstattzettel.* and root fields from previous orders APIs)
        if (prefillOrderData.werkstattzettel?.mitarbeiter) {
            handleEmployeeSelect({
                employeeName: prefillOrderData.werkstattzettel.mitarbeiter,
                id: prefillOrderData.werkstattzettel.employeeId || '',
            });
        } else if (prefillOrderData.mitarbeiter || prefillOrderData.employeeId) {
            handleEmployeeSelect({
                employeeName: prefillOrderData.mitarbeiter || '',
                id: prefillOrderData.employeeId || '',
            });
        }

        // Prefill insole standards (Zusätze)
        if (Array.isArray(prefillOrderData.insoleStandards)) {
            setInsoleStandards(
                prefillOrderData.insoleStandards.map((s: any) => ({
                    name: s?.name ?? '',
                    left: Number(s?.left ?? 0),
                    right: Number(s?.right ?? 0),
                    isFavorite: typeof s?.isFavorite === 'boolean' ? s.isFavorite : undefined,
                })).filter((s: any) => s.name)
            );
        }

        // Prefill billing type from bezahlt (optional)
        if (typeof prefillOrderData.bezahlt === 'string') {
            const bz = prefillOrderData.bezahlt.toLowerCase();
            if (bz.startsWith('privat')) setBillingType('Privat');
            if (bz.startsWith('krankenkasse')) setBillingType('Krankenkassa');
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
        setInsoleStandards,
        setBillingType,
        einlageOptions,
    ]);

    // Listen for order data updates
    useEffect(() => {
        const handleOrderDataUpdate = (event: any) => {
            const orderData = event.detail.orderData;
            if (orderData) {
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
        // Use custom versorgung ID if on einmalig tab and it exists, otherwise use resolved ID
        let versorgungIdToUse: string | null = null;
        
        if (activeVersorgungTab === 'einmalig' && customVersorgungId) {
            versorgungIdToUse = customVersorgungId;
        } else if (activeVersorgungTab === 'standard') {
            versorgungIdToUse = resolveVersorgungIdFromText();
        } else {
            versorgungIdToUse = resolveVersorgungIdFromText();
        }

        if (customer?.id && versorgungIdToUse && formDataForOrder) {
            try {
                const fussanalysePreis = Number(formDataForOrder.fussanalysePreis) || 0;
                const einlagenversorgungPreis = Number(formDataForOrder.einlagenversorgungPreis) || 0;
                setOrderPrices({ fussanalysePreis, einlagenversorgungPreis });

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

                // Get VAT rate based on country
                const getVatRate = (): number => {
                    const vatCountry = user?.accountInfo?.vat_country;
                    if (vatCountry === 'Italien (IT)') {
                        return 4; // 4% VAT for Italy
                    }
                    if (vatCountry === 'Österreich (AT)') {
                        return 20; // 20% VAT for Austria
                    }
                    return 0; // No VAT for other countries
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
                            // Get the side for this specific item, default to 'R'
                            const side = itemSides[posNum] || 'R';
                            // Double the price if BDS (Both Sides) is selected
                            const finalPrice = side === 'BDS' ? option.price * 2 : option.price;
                            
                            // Build description object
                            const description: any = {};
                            
                            // Always include positionsnummer
                            description.positionsnummer = posNum;
                            
                            if (typeof option.description === 'object') {
                                // Copy existing description properties
                                if (option.description.title) {
                                    description.title = option.description.title;
                                }
                                if (option.description.subtitle) {
                                    description.subtitle = option.description.subtitle;
                                }
                            } else if (typeof option.description === 'string') {
                                // If description is a string, use it as title
                                description.title = option.description;
                            }
                            
                            // Add Seite (side) to description
                            description.Seite = side;
                            
                            return {
                                price: finalPrice,
                                description: description
                            };
                        }
                        
                        return null;
                    }).filter(item => item !== null);
                };

                // Calculate insurance total price with VAT
                const calculateInsuranceTotalPrice = (insurances: Array<{ price: number }>): number => {
                    const totalWithoutVat = insurances.reduce((sum, item) => sum + item.price, 0);
                    const vatRate = getVatRate();
                    const vatAmount = (totalWithoutVat * vatRate) / 100;
                    return totalWithoutVat + vatAmount;
                };

                // Get bezahlt value - use paymentStatus if bezahlt is not available (for backward compatibility)
                const bezahltValue = formDataForOrder.bezahlt || formDataForOrder.paymentStatus || '';
                const paymentStatusValue = formDataForOrder.paymentStatus || formDataForOrder.bezahlt || undefined;

                // Build base payload
                const orderPayload: any = {
                    customerId: customer.id,
                    einlagentyp: formDataForOrder.einlagentyp || '',
                    überzug: formDataForOrder.überzug || '',
                    quantity: formDataForOrder.quantity || formDataForOrder.menge || 1,
                    versorgung_note: formDataForOrder.versorgung_note || '',
                    schuhmodell_wählen: formDataForOrder.schuhmodell_wählen || '',
                    kostenvoranschlag: formDataForOrder.kostenvoranschlag || false,
                    ausführliche_diagnose: formDataForOrder.ausführliche_diagnose || '',
                    versorgung_laut_arzt: formDataForOrder.versorgung_laut_arzt || '',
                    kundenName: formDataForOrder.kundenName || '',
                    auftragsDatum: formDataForOrder.auftragsDatum || '',
                    wohnort: formDataForOrder.wohnort || '',
                    telefon: formDataForOrder.telefon || '',
                    email: formDataForOrder.email || '',
                    geschaeftsstandort: formDataForOrder.geschaeftsstandort || '',
                    mitarbeiter: formDataForOrder.mitarbeiter || '',
                    fertigstellungBis: formDataForOrder.fertigstellungBis || '',
                    versorgung: formDataForOrder.versorgung || '',
                    bezahlt: bezahltValue, // Required by API
                    fussanalysePreis: fussanalysePreis,
                    einlagenversorgungPreis: einlagenversorgungPreis,
                    fußanalyse: fussanalysePreis, 
                    einlagenversorgung: einlagenversorgungPreis,
                    werkstattEmployeeId: formDataForOrder.employeeId || formDataForOrder.werkstattEmployeeId || '',
                    screenerId: formDataForOrder.screenerId || null,
                    discount: formDataForOrder.discount !== undefined && formDataForOrder.discount !== null 
                        ? (typeof formDataForOrder.discount === 'number' ? formDataForOrder.discount : Number(formDataForOrder.discount))
                        : undefined,
                    discountType: formDataForOrder.discountType || undefined,
                    insurances: buildInsurancesArray(),
                    insuranceTotalPrice: calculateInsuranceTotalPrice(buildInsurancesArray()),
                    insoleStandards: formDataForOrder.insoleStandards || [],
                };

                // Add versorgungId OR key based on active tab
                if (activeVersorgungTab === 'einmalig' && customVersorgungId) {
                    // For Einmalige Versorgung, use "key" field instead of "versorgungId"
                    orderPayload.key = customVersorgungId;
                } else {
                    // For Standard-Vorlage and others, use "versorgungId"
                    orderPayload.versorgungId = versorgungIdToUse;
                }

                // Add paymentStatus if it has a value
                if (paymentStatusValue) {
                    orderPayload.paymentStatus = paymentStatusValue;
                }

                // For createOrderAndGeneratePdf, we still pass versorgungIdToUse
                // The actual field (versorgungId or key) is already set in orderPayload
                const result = await createOrderAndGeneratePdf(
                    customer.id,
                    versorgungIdToUse || customVersorgungId || '', // Fallback to customVersorgungId if needed
                    autoSendToCustomer,
                    orderPayload
                );
                const orderId = (result as any)?.data?.id ?? (result as any)?.id ?? result?.orderId;
                if (orderId) {
                    setCurrentOrderId(orderId);
                    setShowPdfModal(true);
                    // Close Werkstattzettel modal only after successful order creation
                    setShowUserInfoUpdateModal(false);
                    
                    // Clear customVersorgungId from localStorage after successful order
                    if (activeVersorgungTab === 'einmalig' && customVersorgungId) {
                        localStorage.removeItem('key');
                        setCustomVersorgungId(null);
                    }
                }
            } catch (error) {
                console.error('Error while creating order:', error);
                toast.error('Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es erneut.');
            }
        }
        setShowConfirmModal(false);
    };

    const handleSpeichernClick = async () => {
        // Check if on einmalig tab and no custom versorgung created
        if (activeVersorgungTab === 'einmalig' && !customVersorgungId) {
            toast.error('Bitte erstellen Sie zuerst eine einmalige Versorgung, indem Sie auf "Add" klicken');
            return;
        }
        
        // Validate standard fields
        const isValid = await trigger();
        
        if (!isValid) {
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
                toast.error(firstError.message as string);
            } else {
                toast.error('Bitte füllen Sie alle erforderlichen Felder aus');
            }
            return;
        }

        // Additional validation for standard tab: versorgung is required
        if (activeVersorgungTab === 'standard' && !supply) {
            toast.error('Versorgung ist erforderlich');
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
            screenerId,
            billingType,
            insoleStandards,
            versorgungsname: activeVersorgungTab === 'einmalig' ? (customVersorgungsname ?? undefined) : undefined,
        });
        
        // Add flag to indicate if using custom versorgung (Einmalige Versorgung)
        const formDataWithFlag = {
            ...formData,
            isCustomVersorgung: activeVersorgungTab === 'einmalig',
        };
        
        setFormDataForOrder(formDataWithFlag);
        setShowUserInfoUpdateModal(true);
    };

    const handleEinlageSelect = (value: EinlageType) => {
        handleEinlageButtonClick(value);
        setEinlagentyp(value);
        setShowEinlageDropdown(false);
    };

    const handleCustomVersorgungCreated = (versorgungId: string, versorgungsname?: string) => {
        setCustomVersorgungId(versorgungId);
        setCustomVersorgungsname(versorgungsname ?? null);
        // Toast is already shown in EinmaligeVersorgungContent component
    };

    const handleActiveTabChange = (tab: 'standard' | 'einmalig' | 'springer' | 'manuell') => {
        setActiveVersorgungTab(tab);

        // Clear custom versorgung ID and name when switching away from einmalig tab
        if (tab !== 'einmalig') {
            setCustomVersorgungId(null);
            setCustomVersorgungsname(null);
            localStorage.removeItem('key');
        }
    };

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
            {/* Abrechnung Section - Outside Cards */}
            <div className="mb-8">
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

            {/* CARD 1: REZEPT & ABRECHNUNG */}
            <RezeptAbrechnungCard
                ausführliche_diagnose={ausführliche_diagnose}
                onAusführlicheDiagnoseChange={setAusführliche_diagnose}
                ausführlicheDiagnoseError={errors.ausführliche_diagnose?.message}
                versorgung_laut_arzt={versorgung_laut_arzt}
                onVersorgungLautArztChange={setVersorgung_laut_arzt}
                billingType={billingType}
                selectedPositionsnummer={selectedPositionsnummer}
                positionsnummerOptions={filteredPositionsnummerData}
                positionsnummerError={positionsnummerError}
                showPositionsnummerDropdown={showPositionsnummerDropdown}
                onPositionsnummerToggle={() => setShowPositionsnummerDropdown(!showPositionsnummerDropdown)}
                onPositionsnummerSelect={setSelectedPositionsnummer}
                itemSides={itemSides}
                onItemSideChange={(posNum, side) => {
                    setItemSides(prev => ({
                        ...prev,
                        [posNum]: side
                    }));
                }}
                vatCountry={user?.accountInfo?.vat_country || undefined}
                selectedDiagnosis={selectedDiagnosis}
                diagnosisOptions={diagnosisOptions}
                showDiagnosisDropdown={showDiagnosisDropdown}
                onDiagnosisToggle={() => setShowDiagnosisDropdown(!showDiagnosisDropdown)}
                onDiagnosisSelect={(value) => {
                    handleDiagnosisSelect(value);
                    setShowDiagnosisDropdown(false);
                }}
                selectedEmployee={selectedEmployee}
                employeeSearchText={employeeSearchText}
                isEmployeeDropdownOpen={isEmployeeDropdownOpen}
                employeeSuggestions={employeeSuggestions}
                employeeLoading={employeeLoading}
                onEmployeeSearchChange={handleEmployeeSearchChange}
                onEmployeeDropdownChange={handleEmployeeDropdownChange}
                onEmployeeSelect={handleEmployeeSelect}
                onEmployeeClear={handleEmployeeClear}
                kostenvoranschlag={kostenvoranschlag}
                onKostenvoranschlagChange={setKostenvoranschlag}
                lieferschein={lieferschein}
                onLieferscheinChange={setLieferschein}
            />

            {/* CARD 2: PRODUKT & BASISDATEN */}
            <ProduktBasisdatenCard
                einlagentyp={einlagentyp}
                selectedEinlage={selectedEinlage as string}
                einlageOptions={einlageOptions}
                showEinlageDropdown={showEinlageDropdown}
                onEinlageToggle={() => setShowEinlageDropdown(!showEinlageDropdown)}
                onEinlageSelect={(value) => {
                    handleEinlageSelect(value);
                    setValue('einlagentyp', value);
                    setShowEinlageDropdown(false);
                }}
                onEinlageClear={() => {
                    setEinlagentyp('');
                    setValue('einlagentyp', '');
                }}
                onCloseEinlageDropdown={() => setShowEinlageDropdown(false)}
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
                onUberzugClear={() => {
                    setÜberzug('');
                    setValue('überzug', '');
                }}
                onCloseUberzugDropdown={() => setShowUberzugDropdown(false)}
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
                onMengeClear={() => {
                    setMenge('');
                    setValue('menge', '');
                }}
                onCloseMengeDropdown={() => setShowMengeDropdown(false)}
                mengeError={errors.menge?.message}
                schuhmodell_wählen={schuhmodell_wählen}
                onSchuhmodellChange={setSchuhmodell_wählen}
            />

            {/* Versorgung Konfigurieren Card */}
            <VersorgungKonfigurierenCard
                versorgungData={versorgungData}
                loadingVersorgung={loadingVersorgung}
                hasDataLoaded={hasDataLoaded}
                selectedVersorgungId={selectedVersorgungId}
                supply={supply}
                onVersorgungCardSelect={handleVersorgungCardSelect}
                versorgungError={activeVersorgungTab === 'standard' ? errors.versorgung?.message : undefined}
                showSupplyDropdown={showSupplyDropdown}
                onSupplyDropdownToggle={handleSupplyDropdownToggle}
                selectedDiagnosis={selectedDiagnosis}
                selectedEinlage={selectedEinlage as string}
                insoleStandards={insoleStandards}
                onInsoleStandardsChange={setInsoleStandards}
                menge={menge}
                customerId={customer?.id}
                selectedEinlageId={(einlageOptions.find(opt => opt.name === selectedEinlage) as { id?: string; name: string; price?: number } | undefined)?.id}
                onCustomVersorgungCreated={handleCustomVersorgungCreated}
                onActiveTabChange={handleActiveTabChange}
                onSpringerClick={() => setShowSpringerDialog(true)}
            />

            {/* CARD 3: VERSORGUNGSNOTIZ */}
            <VersorgungsnotizCard
                versorgung_note={versorgung_note}
                onVersorgungNoteChange={setVersorgung_note}
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

            {/* Modals */}
            <SpringerDialog
                isOpen={showSpringerDialog}
                onClose={() => setShowSpringerDialog(false)}
                customerSize="EU 42"
            />

            <WerkstattzettelModal
                isOpen={showUserInfoUpdateModal}
                onOpenChange={setShowUserInfoUpdateModal}
                scanData={customer as ScanData}
                formData={formDataForOrder}
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
