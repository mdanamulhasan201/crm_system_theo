'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface WohnortInputProps {
  value: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
  placeholder?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
    municipality?: string;
    postcode?: string;
    country_code?: string;
    country?: string;
    road?: string;
    house_number?: string;
  };
}

export default function WohnortInput({ value, onChange, hideLabel = false, placeholder = "Ex. Musterstraße 123, Berlin, DE" }: WohnortInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load German, Italian & Austrian place suggestions for Wohnort (OpenStreetMap Nominatim, free & policy-compliant)
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

        // Improved query for better Austrian address results
        // Using namedetails=1 and extratags=1 for better address parsing
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&extratags=1&limit=10&countrycodes=de,it,at&q=${encodeURIComponent(
          query,
        )}`;

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MyAppName/1.0 (myemail@example.com)', // policy-compliant
          },
        });

        if (!res.ok) throw new Error('Failed to load locations');

        const data = (await res.json()) as NominatimResult[];
        setSuggestions(Array.isArray(data) ? data : []);
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
              suggestions.map((s) => {
                // Use full display_name which includes street, city, country
                const fullAddress = s.display_name || '';
                const address = s.address || {};
                const countryCode = (address.country_code || '').toUpperCase();

                // Extract city/town/village for display (prioritize city)
                const cityLabel =
                  address.city ||
                  address.town ||
                  address.village ||
                  address.municipality ||
                  '';

                // Extract state/province (important for Austria - Bundesländer)
                const stateLabel = address.state || address.county || '';

                // Build a more informative display label
                const displayParts = [];
                if (cityLabel) displayParts.push(cityLabel);
                if (stateLabel) displayParts.push(stateLabel);
                if (countryCode) displayParts.push(countryCode);
                const displayLabel = displayParts.join(', ');

                return (
                  <button
                    key={s.place_id}
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-gray-50"
                    onClick={() => {
                      // Set the full address (includes street, city, state, country)
                      onChange(fullAddress);
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-medium text-gray-800">
                      {fullAddress}
                    </span>
                    {displayLabel && (
                      <span className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                        {displayLabel}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

