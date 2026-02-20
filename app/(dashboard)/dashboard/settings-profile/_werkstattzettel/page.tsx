"use client";
import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWerkstattzettel } from "@/hooks/settings/useWerkstattzettel";

export default function WerkstattzettelPage() {
  const {
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
  } = useWerkstattzettel();

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSuggestions]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 font-sans">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Lade Einstellungen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-10 font-sans">
      <h1 className="text-4xl font-bold mb-2">Werkstattzettel</h1>
      <p className="mb-8">
        Konfigurieren Sie hier die Optionen für Ihren Werkstattzettel.
      </p>

      {/* Mitarbeiter */}
      <div className="mb-6 relative">
        <label className="font-semibold block mb-2">Mitarbeiter</label>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Mitarbeitername eingeben..."
            value={employeeSearch}
            onChange={e => handleEmployeeSearchChange(e.target.value)}
            onFocus={() => {
              if (employees.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className="border border-gray-600"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            </div>
          )}
        </div>

        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {isSearching ? (
              <div className="px-4 py-3 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>Suche Mitarbeiter...</span>
                </div>
              </div>
            ) : employees.length > 0 ? (
              employees.map((employee) => (
                <div
                  key={employee.id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleEmployeeSelect(employee);
                  }}
                >
                  <div className="font-medium text-gray-900">{employee.employeeName}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </div>
              ))
            ) : hasSearched ? (
              <div className="px-4 py-3 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709" />
                  </svg>
                  <span>Keine Mitarbeiter gefunden</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {settings.mitarbeiter && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-600">Ausgewählter Mitarbeiter: </span>
            <span className="font-medium">{settings.mitarbeiter}</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="font-semibold block mb-2">
          Standardberechnung des Fertigstellungsdatums
        </label>
        <div className="flex gap-4 items-center">
          <Input
            type="number"
            min="1"
            placeholder="Anzahl eingeben"
            value={settings.werktage?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value === "" ? undefined : parseInt(e.target.value);
              updateSetting('werktage', value || undefined);
            }}
            className="border border-gray-600 w-32"
          />
          <Select
            value={settings.werktageUnit || "tag"}
            onValueChange={(value) => updateSetting('werktageUnit', value as "tag" | "monat")}
          >
            <SelectTrigger className="w-40 border-gray-600">
              <SelectValue placeholder="Einheit auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tag">Tag</SelectItem>
              {/* <SelectItem value="monat">Monat</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8">
        <label className="font-semibold block mb-2">Abholstandorte</label>
        <div className="flex gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.abholstandort === "geschaeft"}
              onChange={() => {
                updateSetting('abholstandort', "geschaeft");
                updateSetting('pickupLocation', "");
              }}
              className="w-6 h-6 accent-black"
            />
            Dieselben wie Geschäftsstandorte
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.abholstandort === "eigen"}
              onChange={() => {
                updateSetting('abholstandort', "eigen");
                updateSetting('pickupLocation', "");
              }}
              className="w-6 h-6 accent-black"
            />
            Eigene definieren
          </label>
        </div>
      </div>

      <div className="mb-8">
        <div className="font-semibold mb-2">
          Soll das Firmenlogo auf dem Werkstattzettel angezeigt werden (empfohlen)?
        </div>
        <div className="flex gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.firmenlogo === "ja"}
              onChange={() => updateSetting('firmenlogo', "ja")}
              className="w-6 h-6 accent-black"
            />
            Ja
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.firmenlogo === "nein"}
              onChange={() => updateSetting('firmenlogo', "nein")}
              className="w-6 h-6 accent-black"
            />
            Nein
          </label>
        </div>
      </div>

      <div className="mb-8">
        <div className="font-semibold mb-2">
          Nach dem Drucken wird der Auftrag sofort in der Auftragsübersicht angezeigt (empfohlen).
        </div>
        <div className="flex gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.auftragSofort === "ja"}
              onChange={() => updateSetting('auftragSofort', "ja")}
              className="w-6 h-6 accent-black"
            />
            Ja
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.auftragSofort === "manuell"}
              onChange={() => updateSetting('auftragSofort', "manuell")}
              className="w-6 h-6 accent-black"
            />
            Nein, manuell bestätigen
          </label>
        </div>
      </div>

      {/* Versorgungsart automatisch übernehmen */}
      <div className="mb-8">
        <div className="font-semibold mb-2">
          Versorgungsart automatisch übernehmen?
        </div>
        <div className="flex gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.versorgungsart === "ja"}
              onChange={() => updateSetting('versorgungsart', "ja")}
              className="w-6 h-6 accent-black"
            />
            Ja
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={settings.versorgungsart === "nein"}
              onChange={() => updateSetting('versorgungsart', "nein")}
              className="w-6 h-6 accent-black"
            />
            Nein
          </label>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={saveWerkstattzettel}
          disabled={isSaving}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer capitalize transform hover:scale-105 flex items-center justify-center gap-2 ${isSaving
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-[#62A07C] text-white hover:bg-[#4A8A6A]'
            }`}
        >
          {isSaving && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          )}
          {isSaving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}
