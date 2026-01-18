"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { getAllVersorgungen } from '@/apis/versorgungApis';
import { getAllEinlagen } from '@/apis/einlagenApis';
import { addCustomerVersorgung, getSingleCustomer, updateSingleCustomer } from '@/apis/customerApis';

export type EinlageType = string; // Now dynamic from API

const diagnosisOptions = [
    'Plantarfasziitis',
    'Fersensporn',
    'Spreizfuß',
    'Senkfuß',
    'Plattfuß',
    'Hohlfuß',
    'Knickfuß',
    'Knick-Senkfuß',
    'Hallux valgus',
    'Hallux rigidus',
    'Hammerzehen / Krallenzehen',
    'Morton-Neurom',
    'Fußarthrose',
    'Stressfrakturen im Fußbereich',
    'Diabetisches Fußsyndrom',
] as const;

const diagnosisMapping: { [key: string]: string } = {
    Plantarfasziitis: 'PLANTARFASZIITIS',
    Fersensporn: 'FERSENSPORN',
    Spreizfuß: 'SPREIZFUSS',
    Senkfuß: 'SENKFUSS',
    Plattfuß: 'PLATTFUSS',
    Hohlfuß: 'HOHLFUSS',
    Knickfuß: 'KNICKFUSS',
    'Knick-Senkfuß': 'KNICK_SENKFUSS',
    'Hallux valgus': 'HALLUX_VALGUS',
    'Hallux rigidus': 'HALLUX_RIGIDUS',
    'Hammerzehen / Krallenzehen': 'HAMMERZEHEN_KRALLENZEHEN',
    'Morton-Neurom': 'MORTON_NEUROM',
    Fußarthrose: 'FUSSARTHROSE',
    'Stressfrakturen im Fußbereich': 'STRESSFRAKTUREN_IM_FUSS',
    'Diabetisches Fußsyndrom': 'DIABETISCHES_FUSSSYNDROM',
};

export interface ManualEntryData {
    marke: string;
    modell: string;
    kategorie: string;
    grosse: string;
}

export interface FeetFirstInventoryData {
    kategorie: string;
    marke: string;
    modell: string;
    grosse: string;
    image?: string;
}

export const useScanningFormData = (
    customer?: any,
    onCustomerUpdate?: (updatedCustomer: any) => void,
) => {
    // Dropdowns
    const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
    const [showSupplyDropdown, setShowSupplyDropdown] = useState(false);

    // API State
    const [versorgungData, setVersorgungData] = useState<any[]>([]);
    const [loadingVersorgung, setLoadingVersorgung] = useState(false);
    const [hasDataLoaded, setHasDataLoaded] = useState(false);
    const [selectedVersorgungId, setSelectedVersorgungId] = useState<string | null>(null);
    const [einlageOptions, setEinlageOptions] = useState<Array<{name: string, price?: number}>>([]); // Dynamic Einlagentyp options from API with prices

    // Editable fields
    const [diagnosis, setDiagnosis] = useState('');
    const [editingDiagnosis, setEditingDiagnosis] = useState(false);
    const [supply, setSupply] = useState('');
    const [editingSupply, setEditingSupply] = useState(false);

    // Buttons
    const [selectedEinlage, setSelectedEinlage] = useState<EinlageType>('');

    // Checkboxes
    const [manualEntry, setManualEntry] = useState(false);
    const [fromFeetFirst, setFromFeetFirst] = useState(false);

    // Manual Entry Modal
    const [showManualEntryModal, setShowManualEntryModal] = useState(false);
    const [manualEntryData, setManualEntryData] = useState<ManualEntryData>({
        marke: '',
        modell: '',
        kategorie: '',
        grosse: '',
    });

    // FeetFirst Inventory Modal
    const [showFeetFirstModal, setShowFeetFirstModal] = useState(false);
    const [feetFirstData, setFeetFirstData] = useState<FeetFirstInventoryData>({
        kategorie: '',
        marke: '',
        modell: '',
        grosse: '',
        image: '',
    });

    // Loading state
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);

    // Refs to prevent duplicate API calls
    const hasFetchedSupplyStatuses = useRef(false);
    const isFetchingVersorgungen = useRef(false);
    const lastFetchedStatus = useRef<string | null>(null);
    const lastFetchedDiagnosis = useRef<string | null | undefined>(null);

    // Refresh customer
    const refreshCustomerData = async () => {
        if (customer?.id) {
            try {
                const response = await getSingleCustomer(customer.id);
                const payload = Array.isArray((response as any)?.data)
                    ? (response as any).data[0]
                    : Array.isArray(response)
                        ? (response as any)[0]
                        : (response as any)?.data ?? response;
                if (payload && onCustomerUpdate) {
                    onCustomerUpdate(payload);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error refreshing customer data:', error);
            }
        }
    };

    // Fetch versorgungen by status name (memoized to prevent duplicate calls)
    const fetchVersorgungenByStatus = useCallback(async (statusName: string, diagnosisStatus?: string | null) => {
        // Prevent duplicate calls with same parameters
        const cacheKey = `${statusName}_${diagnosisStatus || 'null'}`;
        if (
            isFetchingVersorgungen.current ||
            (lastFetchedStatus.current === statusName && lastFetchedDiagnosis.current === diagnosisStatus)
        ) {
            return;
        }

        isFetchingVersorgungen.current = true;
        lastFetchedStatus.current = statusName;
        lastFetchedDiagnosis.current = diagnosisStatus;
        setLoadingVersorgung(true);
        
        try {
            const response = await getAllVersorgungen(statusName, 1, 1000);
            const allData = response.data || [];
            
            // Filter by diagnosis_status if provided
            let filtered = allData;
            if (diagnosisStatus !== undefined && diagnosisStatus !== null && diagnosisStatus !== '') {
                // Case 2: Both Einlagentyp + Diagnose selected
                // Show only items with matching diagnosis_status
                // Handle both array (new format) and string (old format) for backward compatibility
                filtered = filtered.filter((item: any) => {
                    const itemDiagnosis = item.diagnosis_status;
                    if (Array.isArray(itemDiagnosis)) {
                        // New format: check if array includes the diagnosis code
                        return itemDiagnosis.includes(diagnosisStatus);
                    } else if (typeof itemDiagnosis === 'string') {
                        // Old format: direct string comparison
                        return itemDiagnosis === diagnosisStatus;
                    }
                    return false;
                });
            } else {
                // Case 1: Only Einlagentyp selected (no diagnosis)
                // Show ALL items of that Einlagentyp (both with and without diagnosis)
                // No filtering by diagnosis_status - show everything
                filtered = allData;
            }
            
            setVersorgungData(filtered);
            setHasDataLoaded(true);
        } catch (error) {
            console.error('Error fetching versorgungen:', error);
            setVersorgungData([]);
        } finally {
            setLoadingVersorgung(false);
            isFetchingVersorgungen.current = false;
        }
    }, []);

    // Fetch supply statuses from the supply-status API (memoized)
    const fetchSupplyStatuses = useCallback(async () => {
        if (hasFetchedSupplyStatuses.current) {
            return;
        }
        hasFetchedSupplyStatuses.current = true;

        try {
            const response = await getAllEinlagen(1, 1000);
            // Get status names from response.status
            const statusNames = response.status || [];
            // Get full data with prices from response.data
            const dataItems = response.data || [];
            
            // Map status names to objects with prices
            const optionsWithPrices = statusNames.map((statusName: string) => {
                // Find matching data item by name
                const dataItem = dataItems.find((item: any) => item.name === statusName);
                return {
                    name: statusName,
                    price: dataItem?.price !== undefined ? dataItem.price : undefined
                };
            });
            
            setEinlageOptions(optionsWithPrices);
            
            // Set first option as default if available
            if (statusNames.length > 0 && !selectedEinlage) {
                setSelectedEinlage(statusNames[0]);
                // Fetch versorgungen for the first status
                await fetchVersorgungenByStatus(statusNames[0]);
            }
        } catch (error) {
            console.error('Error fetching supply statuses:', error);
            setEinlageOptions([]);
            hasFetchedSupplyStatuses.current = false; // Reset on error so it can retry
        }
    }, [selectedEinlage, fetchVersorgungenByStatus]);

    // Initial fetch supply statuses for Einlagentyp dropdown (only once on mount)
    useEffect(() => {
        void fetchSupplyStatuses();
    }, [fetchSupplyStatuses]);

    // Sync diagnosis from customer
    useEffect(() => {
        if (customer?.ausfuhrliche_diagnose) {
            setDiagnosis(customer.ausfuhrliche_diagnose);
        }
    }, [customer?.ausfuhrliche_diagnose]);

    // Helper to find matching versorgung (now based on supplyStatus.name, memoized)
    const findMatchingVersorgung = useCallback((
        supplyStatusName: EinlageType,
        diagnosisStatus?: string,
    ) => {
        if (!customer?.versorgungen) return null;
        // Try to match by supplyStatus name or versorgung name
        return customer.versorgungen.find((versorgung: any) => {
            // Check if versorgung has supplyStatus that matches
            const statusMatches = versorgung.supplyStatus?.name === supplyStatusName || 
                                  versorgung.name === supplyStatusName ||
                                  versorgung.status === supplyStatusName;
            
            if (!statusMatches) return false;
            
            if (diagnosisStatus && diagnosisStatus.trim() !== '') {
                // Case 2: Both Einlagentyp + Diagnose selected
                // Match only items with matching diagnosis_status
                // Handle both array (new format) and string (old format)
                const itemDiagnosis = versorgung.diagnosis_status;
                if (Array.isArray(itemDiagnosis)) {
                    return itemDiagnosis.includes(diagnosisStatus);
                } else if (typeof itemDiagnosis === 'string') {
                    return itemDiagnosis === diagnosisStatus;
                }
                return false;
            }
            
            // Case 1: Only Einlagentyp selected (no diagnosis)
            // Match items regardless of diagnosis_status (with or without diagnosis)
            return true;
        });
    }, [customer?.versorgungen]);

    // Update supply when inputs change
    useEffect(() => {
        if (customer?.versorgungen && selectedEinlage) {
            const currentDiagnosisStatus = selectedDiagnosis ? diagnosisMapping[selectedDiagnosis] : undefined;
            const matchingVersorgung = findMatchingVersorgung(selectedEinlage, currentDiagnosisStatus);
            if (matchingVersorgung) {
                setSupply(matchingVersorgung.versorgung || matchingVersorgung.name || '');
                setSelectedVersorgungId(matchingVersorgung.id);
            } else {
                setSupply('');
                setSelectedVersorgungId(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer?.versorgungen, selectedEinlage, selectedDiagnosis]);


    // API calls (kept for backward compatibility, memoized)
    const fetchVersorgungData = useCallback(async (status: string) => {
        if (status) {
            await fetchVersorgungenByStatus(status);
        }
    }, [fetchVersorgungenByStatus]);

    const fetchVersorgungDataByDiagnosis = useCallback(async (
        diagnosisStatus: string,
        status: string = '',
    ) => {
        const statusToUse = status || selectedEinlage;
        if (statusToUse) {
            await fetchVersorgungenByStatus(statusToUse, diagnosisStatus);
        }
    }, [selectedEinlage, fetchVersorgungenByStatus]);

    // Handlers (memoized to prevent re-renders)
    const handleDiagnosisSelect = useCallback(async (value: string) => {
        setSelectedDiagnosis(value);
        setShowDiagnosisDropdown(false);

        if (customer?.versorgungen) {
            const diagnosisStatus = diagnosisMapping[value];
            const matchingVersorgung = findMatchingVersorgung(selectedEinlage, diagnosisStatus);
            if (matchingVersorgung) {
                setSupply(matchingVersorgung.versorgung || matchingVersorgung.name || '');
                setSelectedVersorgungId(matchingVersorgung.id);
            } else {
                setSupply('');
                setSelectedVersorgungId(null);
            }
        }

        if (value && diagnosisMapping[value] && selectedEinlage) {
            await fetchVersorgungenByStatus(selectedEinlage, diagnosisMapping[value]);
        }
    }, [customer?.versorgungen, selectedEinlage, findMatchingVersorgung, fetchVersorgungenByStatus]);

    const handleVersorgungCardSelect = (item: any) => {
        setSupply(item.versorgung);
        setSelectedVersorgungId(item.id);
        setShowSupplyDropdown(false);
    };

    const handleEinlageButtonClick = useCallback(async (einlageType: EinlageType) => {
        setSelectedEinlage(einlageType);
        
        // Fetch versorgungen for the selected status
        const diagnosisStatus = selectedDiagnosis ? diagnosisMapping[selectedDiagnosis] : null;
        await fetchVersorgungenByStatus(einlageType, diagnosisStatus);
        
        if (customer?.versorgungen) {
            const currentDiagnosisStatus = selectedDiagnosis ? diagnosisMapping[selectedDiagnosis] : undefined;
            const matchingVersorgung = findMatchingVersorgung(einlageType, currentDiagnosisStatus);
            if (matchingVersorgung) {
                setSupply(matchingVersorgung.versorgung || matchingVersorgung.name || '');
                setSelectedVersorgungId(matchingVersorgung.id);
            } else {
                setSupply('');
                setSelectedVersorgungId(null);
            }
        } else {
            setSelectedVersorgungId(null);
        }
    }, [selectedDiagnosis, customer?.versorgungen, findMatchingVersorgung, fetchVersorgungenByStatus]);

    const handleDiagnosisEdit = () => setEditingDiagnosis(true);

    const handleDiagnosisBlur = async () => {
        setEditingDiagnosis(false);
        if (customer?.id && diagnosis.trim()) {
            setIsSavingDiagnosis(true);
            try {
                await updateSingleCustomer(customer.id, { ausfuhrliche_diagnose: diagnosis } as any);
                toast.success('Diagnose erfolgreich gespeichert');
                await refreshCustomerData();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error saving diagnosis:', error);
                toast.error('Fehler beim Speichern der Diagnose');
            } finally {
                setIsSavingDiagnosis(false);
            }
        }
    };

    const handleSupplyEdit = () => setEditingSupply(true);
    const handleSupplyBlur = () => setEditingSupply(false);
    const handleSupplyDropdownToggle = () => setShowSupplyDropdown((p) => !p);

    // Manual Entry
    const openManualEntryModal = () => {
        setShowManualEntryModal(true);
        setManualEntry(true);
    };
    const handleManualEntryModalClose = () => {
        setShowManualEntryModal(false);
        if (!manualEntryData.marke && !manualEntryData.modell && !manualEntryData.kategorie && !manualEntryData.grosse) {
            setManualEntry(false);
        }
    };
    const handleManualEntryModalSave = (data: ManualEntryData) => {
        setManualEntryData(data);
        setManualEntry(true);
        toast.success('Schuhmodell manuell eingetragen');
    };
    const handleManualEntryCheckboxChange = (checked: boolean) => {
        if (checked) {
            openManualEntryModal();
        } else {
            setManualEntry(false);
            setManualEntryData({ marke: '', modell: '', kategorie: '', grosse: '' });
        }
    };

    // FeetFirst
    const openFeetFirstModal = () => {
        setShowFeetFirstModal(true);
        setFromFeetFirst(true);
    };
    const handleFeetFirstModalClose = () => {
        setShowFeetFirstModal(false);
        if (!feetFirstData.kategorie && !feetFirstData.marke && !feetFirstData.modell && !feetFirstData.grosse) {
            setFromFeetFirst(false);
        }
    };
    const handleFeetFirstModalSave = (data: FeetFirstInventoryData) => {
        setFeetFirstData(data);
        setFromFeetFirst(true);
        toast.success('Schuhmodell aus FeetFirst-Bestand ausgewählt');
    };
    const handleFeetFirstCheckboxChange = (checked: boolean) => {
        if (checked) {
            openFeetFirstModal();
        } else {
            setFromFeetFirst(false);
            setFeetFirstData({ kategorie: '', marke: '', modell: '', grosse: '', image: '' });
        }
    };

    // order create 
    const resolveVersorgungIdFromText = () => {
        const normalize = (t?: string) => (t ?? '').trim();
        const normalizedSupply = normalize(supply);
        const derivedFromApi = versorgungData.find((v: any) => normalize(v?.versorgung) === normalizedSupply);
        const customerList: any[] = Array.isArray(customer?.versorgungen) ? customer!.versorgungen : [];
        const derivedFromCustomerAny = customerList.find((v: any) => normalize(v?.versorgung) === normalizedSupply);
        return derivedFromApi?.id || derivedFromCustomerAny?.id || selectedVersorgungId || null;
    };

    // order create
    const handleFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const resolvedVersorgungId = resolveVersorgungIdFromText();

        setIsSaving(true);
        // simulate save
        await new Promise((res) => setTimeout(res, 1500));
        setIsSaving(false);
    };

    const clearDiagnosisAndReloadOptions = useCallback(async () => {
        setSelectedDiagnosis('');
        if (selectedEinlage) {
            // Reset cache to allow refetch
            lastFetchedStatus.current = null;
            lastFetchedDiagnosis.current = null;
            await fetchVersorgungenByStatus(selectedEinlage, null);
        }
    }, [selectedEinlage, fetchVersorgungenByStatus]);

    return {
        diagnosisOptions,
        // dropdowns
        showDiagnosisDropdown,
        setShowDiagnosisDropdown,
        selectedDiagnosis,
        setSelectedDiagnosis,
        showSupplyDropdown,
        handleSupplyDropdownToggle,
        // api state
        versorgungData,
        setVersorgungData,
        loadingVersorgung,
        hasDataLoaded,
        setHasDataLoaded,
        selectedVersorgungId,
        setSelectedVersorgungId,
        // editable fields
        diagnosis,
        setDiagnosis,
        editingDiagnosis,
        supply,
        setSupply,
        editingSupply,
        // buttons
        selectedEinlage,
        // dynamic einlage options from API
        einlageOptions,
        // checkboxes
        manualEntry,
        setManualEntry,
        fromFeetFirst,
        setFromFeetFirst,
        // manual entry modal
        showManualEntryModal,
        openManualEntryModal,
        handleManualEntryModalClose,
        handleManualEntryModalSave,
        manualEntryData,
        setManualEntryData,
        // feetfirst modal
        showFeetFirstModal,
        openFeetFirstModal,
        handleFeetFirstModalClose,
        handleFeetFirstModalSave,
        feetFirstData,
        setFeetFirstData,
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
    } as const;
};


