import { useState, useEffect } from 'react';
import { searchEmployee, createWerkstattzettel, getWerkstattzettel, Werkstattzettel } from '@/apis/werkstattzettelApis';
import useDebounce from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  employeeName: string;
  email: string;
  accountName: string;
  financialAccess: boolean;
  partnerId: string;
  createdAt: string;
  updatedAt: string;
}

interface WerkstattzettelSettings {
  mitarbeiter: string;
  mitarbeiterId: string;
  werktage: number | undefined;
  werktageUnit: "tag" | "monat";
  abholstandort: "geschaeft" | "eigen";
  pickupLocation: string;
  firmenlogo: "ja" | "nein";
  auftragSofort: "ja" | "manuell";
  versorgungsart: "ja" | "nein";
}

export const useWerkstattzettel = () => {
  const [settings, setSettings] = useState<WerkstattzettelSettings>({
    mitarbeiter: "",
    mitarbeiterId: "",
    werktage: undefined,
    werktageUnit: "tag",
    abholstandort: "geschaeft",
    pickupLocation: "",
    firmenlogo: "ja",
    auftragSofort: "ja",
    versorgungsart: "ja",
  });

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(employeeSearch, 300);

  useEffect(() => {
    const searchEmployees = async () => {
      if (debouncedSearch.length < 2) {
        setEmployees([]);
        setShowSuggestions(false);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      try {
        const response = await searchEmployee(1, 10, debouncedSearch);
        setEmployees(response.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching employees:', error);
        setEmployees([]);
        setShowSuggestions(true);
      } finally {
        setIsSearching(false);
      }
    };

    searchEmployees();
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchWerkstattzettel = async () => {
      try {
        setIsLoading(true);
        const response = await getWerkstattzettel();
        const data = response?.data;

        if (data && Object.keys(data).length > 0) {
          const isGeschaeft = data.sameAsBusiness;
          const completionDays = data.completionDays ? parseInt(data.completionDays) : undefined;
          // If completionDays is divisible by 30 and >= 30, assume it was stored as months
          const isMonth = completionDays && completionDays >= 30 && completionDays % 30 === 0;
          const werktageValue = isMonth ? completionDays / 30 : completionDays;
          const werktageUnit = isMonth ? "monat" : "tag";
          
          setSettings(prev => ({
            ...prev,
            mitarbeiterId: data.employeeId || "",
            mitarbeiter: data.employeeName || "",
            werktage: werktageValue,
            werktageUnit: werktageUnit,
            pickupLocation: data.pickupLocation || "",
            abholstandort: isGeschaeft ? "geschaeft" : "eigen",
            firmenlogo: data.showCompanyLogo !== undefined ? (data.showCompanyLogo ? "ja" : "nein") : "ja",
            auftragSofort: data.autoShowAfterPrint !== undefined ? (data.autoShowAfterPrint ? "ja" : "manuell") : "ja",
            versorgungsart: data.autoApplySupply !== undefined ? (data.autoApplySupply ? "ja" : "nein") : "ja",
          }));

          if (data.employeeName) {
            setEmployeeSearch(data.employeeName);
          }
        }
      } catch (error) {
        console.error('Error fetching werkstattzettel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWerkstattzettel();
  }, []);

  const handleEmployeeSelect = (employee: Employee) => {
    setSettings(prev => ({
      ...prev,
      mitarbeiter: employee.employeeName,
      mitarbeiterId: employee.id,
    }));
    setEmployeeSearch(employee.employeeName);
    setShowSuggestions(false);
    setEmployees([]);
    setHasSearched(false);
  };

  const handleEmployeeSearchChange = (value: string) => {
    setEmployeeSearch(value);
    if (value !== settings.mitarbeiter) {
      setSettings(prev => ({
        ...prev,
        mitarbeiter: "",
        mitarbeiterId: "",
      }));
    }
  };

  const updateSetting = <K extends keyof WerkstattzettelSettings>(
    key: K,
    value: WerkstattzettelSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveWerkstattzettel = async () => {
    if (!settings.werktage || settings.werktage <= 0) {
      toast.error('Bitte geben Sie eine gültige Anzahl ein.');
      return;
    }

    setIsSaving(true);

    try {
      const pickupLocation = typeof settings.pickupLocation === 'string'
        ? settings.pickupLocation.trim()
        : '';

      // Convert to days: if unit is month, multiply by 30
      const completionDaysInDays = settings.werktageUnit === "monat" 
        ? settings.werktage * 30 
        : settings.werktage;

      const werkstattzettelData: Werkstattzettel = {
        employeeId: settings.mitarbeiterId || "",
        completionDays: completionDaysInDays.toString(),
        sameAsBusiness: settings.abholstandort === "geschaeft",
        showCompanyLogo: settings.firmenlogo === "ja",
        autoShowAfterPrint: settings.auftragSofort === "ja",
        autoApplySupply: settings.versorgungsart === "ja",
        ...(pickupLocation && { pickupLocation })
      };

      await createWerkstattzettel(werkstattzettelData);

      toast.success('Werkstattzettel-Einstellungen erfolgreich gespeichert!');

      try {
        const response = await getWerkstattzettel();
        const updatedData = response?.data;
        if (updatedData && Object.keys(updatedData).length > 0) {
          const isGeschaeft = updatedData.sameAsBusiness;
          const completionDays = updatedData.completionDays ? parseInt(updatedData.completionDays) : undefined;
          // If completionDays is divisible by 30 and >= 30, assume it was stored as months
          const isMonth = completionDays && completionDays >= 30 && completionDays % 30 === 0;
          const werktageValue = isMonth ? completionDays / 30 : completionDays;
          const werktageUnit = isMonth ? "monat" : "tag";
          
          setSettings(prev => ({
            ...prev,
            mitarbeiterId: updatedData.employeeId || "",
            mitarbeiter: updatedData.employeeName || "",
            werktage: werktageValue,
            werktageUnit: werktageUnit,
            pickupLocation: updatedData.pickupLocation || "",
            abholstandort: isGeschaeft ? "geschaeft" : "eigen",
            firmenlogo: updatedData.showCompanyLogo !== undefined ? (updatedData.showCompanyLogo ? "ja" : "nein") : "ja",
            auftragSofort: updatedData.autoShowAfterPrint !== undefined ? (updatedData.autoShowAfterPrint ? "ja" : "manuell") : "ja",
            versorgungsart: updatedData.autoApplySupply !== undefined ? (updatedData.autoApplySupply ? "ja" : "nein") : "ja",
          }));

          if (updatedData.employeeName) {
            setEmployeeSearch(updatedData.employeeName);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching updated data:', fetchError);
      }
    } catch (error: any) {
      console.error('Error saving werkstattzettel:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Fehler beim Speichern. Bitte versuchen Sie es erneut.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    employeeSearch,
    employees,
    isSearching,
    showSuggestions,
    hasSearched,
    isSaving,
    isLoading,
    handleEmployeeSelect,
    handleEmployeeSearchChange,
    updateSetting,
    setShowSuggestions,
    saveWerkstattzettel,
  };
};
