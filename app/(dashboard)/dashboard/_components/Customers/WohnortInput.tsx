'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
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

  return (
    <div className="grid grid-cols-1 text-sm">
      <div className="relative" ref={containerRef}>
        {!hideLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnort
          </label>
        )}
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
              <div className="px-3 py-2 text-xs text-gray-500">
                Keine Orte gefunden.
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
      </div>
    </div>
  );
}

