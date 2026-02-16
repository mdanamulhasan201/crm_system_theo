'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocation } from '@/apis/locationsApis';

interface WohnortInputProps {
  value: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
  placeholder?: string;
}

interface LocationResponse {
  success: boolean;
  message: string;
  data: string[];
}

export default function WohnortInput({ value, onChange, hideLabel = false, placeholder = "Ex. Musterstraße 123, Berlin, DE" }: WohnortInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCountry, setManualCountry] = useState('Deutschland');
  const [manualPostalCode, setManualPostalCode] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualStreet, setManualStreet] = useState('');
  const [manualNumber, setManualNumber] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Load German, Italian & Austrian place suggestions for Wohnort using backend API
  // Enhanced to show all Austrian states (Bundesländer) and addresses
  useEffect(() => {
    const query = value.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use backend API for location search
        const response = await getLocation(query);
        
        // Handle the response structure: { success, message, data: string[] }
        if (response.success && Array.isArray(response.data)) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.warn('Wohnort-Suche fehlgeschlagen', err);
        setSuggestions([]);
        setError('Orte konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Combine manual input fields into address string
  const handleManualInputChange = useCallback(() => {
    const parts: string[] = [];
    
    if (manualStreet.trim() || manualNumber.trim()) {
      const streetPart = [manualStreet.trim(), manualNumber.trim()].filter(Boolean).join(' ');
      if (streetPart) parts.push(streetPart);
    }
    
    if (manualPostalCode.trim() || manualCity.trim()) {
      const cityPart = [manualPostalCode.trim(), manualCity.trim()].filter(Boolean).join(' ');
      if (cityPart) parts.push(cityPart);
    }
    
    if (manualCountry.trim()) {
      parts.push(manualCountry.trim());
    }
    
    const combinedAddress = parts.join(', ');
    onChange(combinedAddress);
  }, [manualCountry, manualPostalCode, manualCity, manualStreet, manualNumber, onChange]);

  // Update address when manual fields change
  useEffect(() => {
    if (showManualInput) {
      handleManualInputChange();
    }
  }, [showManualInput, handleManualInputChange]);

  const handleAddClick = () => {
    setShowManualInput(true);
    setShowSuggestions(false);
  };

  return (
    <div className="grid grid-cols-1 text-sm">
      <div className="relative" ref={containerRef}>
        {!hideLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnort
          </label>
        )}
        
        {!showManualInput ? (
          <>
            <Input
              type="text"
              className="w-full"
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />

            {isLoading && (
              <span className={`absolute right-3 ${hideLabel ? 'top-2' : 'top-9'} h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500`} />
            )}

            {showSuggestions && (
              <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                {isLoading ? (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Orte werden geladen...
                  </div>
                ) : error ? (
                  <div className="px-3 py-2 text-xs text-red-500">{error}</div>
                ) : suggestions.length === 0 && value.trim().length >= 2 ? (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Keine Orte gefunden.</span>
                    <button
                      type="button"
                      onClick={handleAddClick}
                      className="px-3 py-1 text-xs font-medium text-white bg-[#61A175] rounded-md hover:bg-[#4f8360] transition-colors"
                    >
                      Hinzufügen
                    </button>
                  </div>
                ) : (
                  suggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      className="flex w-full items-start px-3 py-2 text-left text-xs hover:bg-gray-50"
                      onClick={() => {
                        onChange(location);
                        setShowSuggestions(false);
                        setShowManualInput(false);
                      }}
                    >
                      <span className="font-medium text-gray-800">
                        {location}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-white">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Land
              </label>
              <Select value={manualCountry} onValueChange={setManualCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deutschland">Deutschland</SelectItem>
                  <SelectItem value="Österreich">Österreich</SelectItem>
                  <SelectItem value="Schweiz">Schweiz</SelectItem>
                  <SelectItem value="Italien">Italien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Postal Code | City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ
                </label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="PLZ"
                  value={manualPostalCode}
                  onChange={(e) => setManualPostalCode(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stadt
                </label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Stadt"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                />
              </div>
            </div>

            {/* Street | Number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Straße
                </label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Straße"
                  value={manualStreet}
                  onChange={(e) => setManualStreet(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nr.
                </label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Nr."
                  value={manualNumber}
                  onChange={(e) => setManualNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Close manual input button */}
            <button
              type="button"
              onClick={() => {
                setShowManualInput(false);
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Zurück zur Suche
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

