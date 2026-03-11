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
        <div className="w-full rounded-lg border border-gray-200 p-3 sm:p-4">
            {/* Search + payment filters */}
            <div className="flex w-full min-w-0 flex-col gap-3 lg:gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                {/* Search – keep full width until very large screens */}
                <div className="relative w-full min-w-0 2xl:max-w-[480px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Suche nach Bestellnummer, Name oder Beschreibung..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="h-9 w-full min-w-0 rounded-lg border-gray-300 bg-gray-50 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:h-10"
                        aria-label="Suche nach Bestellnummer, Name oder Beschreibung"
                    />
                </div>
                {/* Zahlung: label + filters */}
                <div className="flex min-w-0 flex-col gap-2 lg:gap-3 2xl:flex-1 2xl:items-end">
                    <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:gap-4 2xl:justify-end">
                        <span className="shrink-0 pt-1 text-sm font-medium text-gray-600">Zahlung:</span>

                        <div className="min-w-0 flex-1">
                        {/* Mobile only: dropdown to avoid overflow */}
                        <div className="w-full min-w-0 md:hidden">
                            <Select
                                value={selectedBezahlt ?? '__all__'}
                                onValueChange={handleZahlungSelect}
                            >
                                <SelectTrigger className="h-9 w-full rounded-lg border-gray-300 bg-gray-50 text-left text-sm font-medium cursor-pointer">
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

                        {/* Tablet and up: button group */}
                        <div className="hidden min-w-0 flex-wrap items-center gap-2 md:flex md:justify-start 2xl:justify-end">
                            {ZAHLUNG_OPTIONS.map((opt) => {
                                const isActive = selectedBezahlt === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleBezahltToggle(opt.value)}
                                        className={`
                                        rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer xl:px-4 xl:py-2 xl:text-sm
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
            </div>
        </div>
    );
}
