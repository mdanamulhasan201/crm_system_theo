'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/contexts/OrdersContext';

const SEARCH_DEBOUNCE_MS = 400;

// 4 Zahlung filter options – sent as bezahlt= to API
const ZAHLUNG_OPTIONS = [
    { value: 'Privat_Bezahlt', label: 'Privat Bezahlt' },
    { value: 'Privat_offen', label: 'Privat offen' },
    { value: 'Krankenkasse_Ungenehmigt', label: 'Krankenkasse Ungenehmigt' },
    { value: 'Krankenkasse_Genehmigt', label: 'Krankenkasse Genehmigt' },
] as const;

export default function SearchBarIWithFilterInsole() {
    const {
        searchQuery,
        setSearchQuery,
        selectedBezahlt,
        setSelectedBezahlt,
    } = useOrders();

    const [inputValue, setInputValue] = useState(searchQuery);
    const isExternalUpdate = useRef(false);

    // Sync local input from context when searchQuery is set elsewhere (e.g. URL, clear). Omit inputValue so we don't overwrite user typing.
    useEffect(() => {
        if (searchQuery !== inputValue && !isExternalUpdate.current) {
            setInputValue(searchQuery);
        }
        isExternalUpdate.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Debounce: update context (triggers API) after user stops typing. Intentionally omit searchQuery/setSearchQuery to avoid resetting timer on context update.
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = inputValue.trim();
            if (trimmed !== searchQuery) {
                isExternalUpdate.current = true;
                setSearchQuery(inputValue);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    const handleBezahltToggle = useCallback((value: string) => {
        setSelectedBezahlt(selectedBezahlt === value ? null : value);
    }, [selectedBezahlt, setSelectedBezahlt]);

    const handleZahlungSelect = useCallback((value: string) => {
        setSelectedBezahlt(value === '__all__' ? null : value);
    }, [setSelectedBezahlt]);

    return (
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full min-w-0">
            {/* Row: Search (flex) + Zahlung filters */}
            <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 w-full min-w-0">
                {/* Search – full width on mobile/tablet, flex-1 on desktop */}
                <div className="relative w-full min-w-0 shrink-0 xl:min-w-[280px] xl:max-w-[480px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none shrink-0" />
                    <Input
                        type="text"
                        placeholder="Suche nach Bestellnummer, Name oder Beschreibung..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full min-w-0 pl-9 h-9 sm:h-10 rounded-lg border-gray-300 bg-gray-50 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        aria-label="Suche nach Bestellnummer, Name oder Beschreibung"
                    />
                </div>

                {/* Zahlung: label + filters */}
                <div className="flex flex-col xl:flex-row xl:flex-wrap items-stretch xl:items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-600 shrink-0 sm:mr-1">Zahlung:</span>

                    {/* Mobile: dropdown to save space and avoid overflow */}
                    <div className="w-full sm:hidden min-w-0">
                        <Select
                            value={selectedBezahlt ?? '__all__'}
                            onValueChange={handleZahlungSelect}
                        >
                            <SelectTrigger className="w-full h-9 rounded-lg border-gray-300 bg-gray-50 text-sm font-medium cursor-pointer">
                                <SelectValue placeholder="Alle Zahlungsstatus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__" className="text-sm cursor-pointer">
                                    Alle
                                </SelectItem>
                                {ZAHLUNG_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tablet/desktop: button group */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2 min-w-0">
                        {ZAHLUNG_OPTIONS.map((opt) => {
                            const isActive = selectedBezahlt === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleBezahltToggle(opt.value)}
                                    className={`
                                        shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer
                                        ${isActive
                                            ? 'bg-white border border-gray-300 text-gray-700 shadow-sm'
                                            : 'bg-gray-100 border border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                        }
                                    `}
                                    aria-pressed={isActive}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
