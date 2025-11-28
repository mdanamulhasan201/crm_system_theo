import { useState, useEffect } from 'react';
import { searchEmployee, createWerkstattzettel } from '@/apis/werkstattzettelApis';
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
  werktage: number | undefined; // Changed to number (days)
  abholstandort: "geschaeft" | "eigen";
  firmenlogo: "ja" | "nein";
  auftragSofort: "ja" | "manuell";
  versorgungsart: "ja" | "nein";
}

export const useWerkstattzettel = () => {
  const [settings, setSettings] = useState<WerkstattzettelSettings>({
    mitarbeiter: "",
    mitarbeiterId: "",
    werktage: undefined,
    abholstandort: "geschaeft",
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

  const debouncedSearch = useDebounce(employeeSearch, 300);

  // Search employees when debounced search changes
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
        setShowSuggestions(true); // Still show dropdown to display "not found" message
      } finally {
        setIsSearching(false);
      }
    };

    searchEmployees();
  }, [debouncedSearch]);

  const handleEmployeeSelect = (employee: Employee) => {
    setSettings(prev => ({
      ...prev,
      mitarbeiter: employee.employeeName,
      mitarbeiterId: employee.id,
    }));
    setEmployeeSearch(employee.employeeName);
    setShowSuggestions(false);
    setEmployees([]); // Clear the employees list to close dropdown
    setHasSearched(false); // Reset search state
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
    if (!settings.werktage) {
      toast.error('Bitte wählen Sie die Anzahl der Tage aus.');
      return;
    }

    setIsSaving(true);

    try {
      const werkstattzettelData = {
        employeeId: settings.mitarbeiterId || "",
        completionDays: settings.werktage.toString(), // Send number of days as string
        pickupLocation: settings.abholstandort === "geschaeft" ? "Geschäftsstandort" : "Eigene Definition",
        sameAsBusiness: settings.abholstandort === "geschaeft",
        showCompanyLogo: settings.firmenlogo === "ja",
        autoShowAfterPrint: settings.auftragSofort === "ja",
        autoApplySupply: settings.versorgungsart === "ja"
      };

      await createWerkstattzettel(werkstattzettelData);
      toast.success('Werkstattzettel-Einstellungen erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving werkstattzettel:', error);
      toast.error('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
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
    handleEmployeeSelect,
    handleEmployeeSearchChange,
    updateSetting,
    setShowSuggestions,
    saveWerkstattzettel,
  };
};
