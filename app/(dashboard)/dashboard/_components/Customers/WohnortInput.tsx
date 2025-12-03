'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface WohnortInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country_code?: string;
  };
}

export default function WohnortInput({ value, onChange }: WohnortInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load German & Italian place suggestions for Wohnort (OpenStreetMap Nominatim, free & policy-compliant)
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

        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=de,it&q=${encodeURIComponent(
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

  return (
    <div className="grid grid-cols-1 text-sm">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wohnort
        </label>
        <Input
          type="text"
          className="w-full"
          placeholder="Ex. Berlin"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
        />

        {isLoading && (
          <span className="absolute right-3 top-9 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500" />
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
                const address = s.address || {};
                const label =
                  address.city ||
                  address.town ||
                  address.village ||
                  s.display_name ||
                  '';
                const countryCode = (address.country_code || '').toUpperCase();

                return (
                  <button
                    key={s.place_id}
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-gray-50"
                    onClick={() => {
                      onChange(
                        countryCode ? `${label}, ${countryCode}` : label,
                      );
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-medium text-gray-800">{label}</span>
                    {s.display_name && (
                      <span className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                        {s.display_name}
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

