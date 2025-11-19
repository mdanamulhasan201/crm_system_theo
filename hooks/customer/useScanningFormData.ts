"use client";

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllVersorgungen } from '@/apis/versorgungApis';
import { addCustomerVersorgung, getSingleCustomer, updateSingleCustomer } from '@/apis/customerApis';

export type EinlageType = 'Alltagseinlage' | 'Sporteinlage' | 'Businesseinlage';

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

    // Editable fields
    const [diagnosis, setDiagnosis] = useState('');
    const [editingDiagnosis, setEditingDiagnosis] = useState(false);
    const [supply, setSupply] = useState('');
    const [editingSupply, setEditingSupply] = useState(false);

    // Buttons
    const [selectedEinlage, setSelectedEinlage] = useState<EinlageType>('Alltagseinlage');

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

    const statusMap = useMemo(
        () => ({
            Alltagseinlage: 'Alltagseinlagen',
            Sporteinlage: 'Sporteinlagen',
            Businesseinlage: 'Businesseinlagen',
        }),
        [],
    );

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

    // Initial fetch by status
    useEffect(() => {
        void fetchVersorgungData(statusMap[selectedEinlage]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync diagnosis from customer
    useEffect(() => {
        if (customer?.ausfuhrliche_diagnose) {
            setDiagnosis(customer.ausfuhrliche_diagnose);
        }
    }, [customer?.ausfuhrliche_diagnose]);

    // Helper to find matching versorgung
    const findMatchingVersorgung = (
        buttonType: EinlageType,
        diagnosisStatus?: string,
    ) => {
        if (!customer?.versorgungen) return null;
        const targetStatus = statusMap[buttonType];
        return customer.versorgungen.find((versorgung: any) => {
            const statusMatches = versorgung.status === targetStatus;
            if (diagnosisStatus) {
                return statusMatches && versorgung.diagnosis_status === diagnosisStatus;
            }
            return statusMatches && versorgung.diagnosis_status === null;
        });
    };

    // Update supply when inputs change
    useEffect(() => {
        if (customer?.versorgungen) {
            const currentDiagnosisStatus = selectedDiagnosis ? diagnosisMapping[selectedDiagnosis] : undefined;
            const matchingVersorgung = findMatchingVersorgung(selectedEinlage, currentDiagnosisStatus);
            if (matchingVersorgung) {
                setSupply(matchingVersorgung.versorgung);
                setSelectedVersorgungId(matchingVersorgung.id);
            } else {
                if (!selectedDiagnosis) {
                    const fallbackVersorgung = customer.versorgungen.find(
                        (v: any) => v.status === statusMap[selectedEinlage],
                    );
                    if (fallbackVersorgung) {
                        setSupply(fallbackVersorgung.versorgung);
                        setSelectedVersorgungId(fallbackVersorgung.id);
                    } else {
                        setSupply('');
                        setSelectedVersorgungId(null);
                    }
                } else {
                    setSupply('');
                    setSelectedVersorgungId(null);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer?.versorgungen, selectedEinlage, selectedDiagnosis]);

    // API calls
    const fetchVersorgungData = async (status: string) => {
        setLoadingVersorgung(true);
        try {
            const response = await getAllVersorgungen(status, 1, 10, '');
            setVersorgungData(response.data || []);
            setHasDataLoaded(true);
        } catch (error) {
            setVersorgungData([]);
        } finally {
            setLoadingVersorgung(false);
        }
    };

    const fetchVersorgungDataByDiagnosis = async (
        diagnosisStatus: string,
        status: string = '',
    ) => {
        setLoadingVersorgung(true);
        try {
            const response = await getAllVersorgungen(status, 1, 10, diagnosisStatus);
            setVersorgungData(response.data || []);
            setHasDataLoaded(true);
        } catch (error) {
            setVersorgungData([]);
        } finally {
            setLoadingVersorgung(false);
        }
    };

    // Handlers
    const handleDiagnosisSelect = (value: string) => {
        setSelectedDiagnosis(value);
        setShowDiagnosisDropdown(false);

        if (customer?.versorgungen) {
            const diagnosisStatus = diagnosisMapping[value];
            const matchingVersorgung = findMatchingVersorgung(selectedEinlage, diagnosisStatus);
            if (matchingVersorgung) {
                setSupply(matchingVersorgung.versorgung);
                setSelectedVersorgungId(matchingVersorgung.id);
            } else {
                setSupply('');
                setSelectedVersorgungId(null);
            }
        }

        if (value && diagnosisMapping[value]) {
            void fetchVersorgungDataByDiagnosis(
                diagnosisMapping[value],
                statusMap[selectedEinlage],
            );
        }
    };

    const handleVersorgungCardSelect = async (item: any) => {
        setSupply(item.versorgung);
        setSelectedVersorgungId(item.id);
        setShowSupplyDropdown(false);
        if (customer?.id && item.id) {
            try {
                await addCustomerVersorgung(customer.id, item.id);
                toast.success(`Versorgung zu ${customer.vorname || 'Kunde'} hinzugefügt`);
                await refreshCustomerData();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error assigning versorgung to customer:', error);
                toast.error('Fehler beim Zuweisen der Versorgung');
            }
        }
    };

    const handleEinlageButtonClick = (einlageType: EinlageType) => {
        setSelectedEinlage(einlageType);
        if (customer?.versorgungen) {
            const currentDiagnosisStatus = selectedDiagnosis ? diagnosisMapping[selectedDiagnosis] : undefined;
            const matchingVersorgung = findMatchingVersorgung(einlageType, currentDiagnosisStatus);
            if (matchingVersorgung) {
                setSupply(matchingVersorgung.versorgung);
                setSelectedVersorgungId(matchingVersorgung.id);
            } else {
                if (!selectedDiagnosis) {
                    const fallbackVersorgung = customer.versorgungen.find(
                        (v: any) => v.status === statusMap[einlageType],
                    );
                    if (fallbackVersorgung) {
                        setSupply(fallbackVersorgung.versorgung);
                        setSelectedVersorgungId(fallbackVersorgung.id);
                    } else {
                        setSupply('');
                        setSelectedVersorgungId(null);
                    }
                } else {
                    setSupply('');
                    setSelectedVersorgungId(null);
                }
            }
        } else {
            setSelectedVersorgungId(null);
        }

        if (selectedDiagnosis && diagnosisMapping[selectedDiagnosis]) {
            void fetchVersorgungDataByDiagnosis(
                diagnosisMapping[selectedDiagnosis],
                statusMap[einlageType],
            );
        } else {
            void fetchVersorgungData(statusMap[einlageType]);
        }
    };

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
        const preferredStatus = statusMap[selectedEinlage];
        const derivedFromCustomerPreferred = customerList.find((v: any) => normalize(v?.versorgung) === normalizedSupply && v?.status === preferredStatus);
        const derivedFromCustomerAny = customerList.find((v: any) => normalize(v?.versorgung) === normalizedSupply);
        return derivedFromApi?.id || derivedFromCustomerPreferred?.id || derivedFromCustomerAny?.id || selectedVersorgungId || null;
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

    const clearDiagnosisAndReloadOptions = () => {
        setSelectedDiagnosis('');
        setVersorgungData([]);
        setHasDataLoaded(false);
        void fetchVersorgungData(statusMap[selectedEinlage]);
    };

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


