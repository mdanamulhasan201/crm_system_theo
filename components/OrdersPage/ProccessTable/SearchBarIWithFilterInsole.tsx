'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/contexts/OrdersContext';

const SEARCH_DEBOUNCE_MS = 400;

const DAYS_OPTIONS = [
    { value: '7', label: 'Letzte 7 Tage' },
    { value: '30', label: 'Letzte 30 Tage' },
    { value: '40', label: 'Letzte 40 Tage' },
];

// 4 Zahlung filter buttons – payload sent as bezahlt= to API
const ZAHLUNG_OPTIONS = [
    { value: 'Privat_Bezahlt', label: 'Privat Bezahlt' },
    { value: 'Privat_offen', label: 'Privat offen' },
    { value: 'Krankenkasse_Ungenehmigt', label: 'Krankenkasse Ungenehmigt' },
    { value: 'Krankenkasse_Genehmigt', label: 'Krankenkasse Genehmigt' },
] as const;

export default function SearchBarIWithFilterInsole() {
    const {
        selectedDays,
        setSelectedDays,
        searchQuery,
        setSearchQuery,
        selectedBezahlt,
        setSelectedBezahlt,
    } = useOrders();

    const [inputValue, setInputValue] = useState(searchQuery);

    // Sync local input from context when searchQuery is cleared/set elsewhere
    useEffect(() => {
        setInputValue(searchQuery);
    }, [searchQuery]);

    // Debounce: update context (and trigger API) after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [inputValue, setSearchQuery]);

    const handleBezahltToggle = (value: string) => {
        setSelectedBezahlt(selectedBezahlt === value ? null : value);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            {/* Search + Days row */}
            <div className="flex flex-col sm:flex-row gap-3 w-full  ">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Suche nach Bestellnummer, Name oder Beschreibung..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="pl-9 h-9 sm:h-10 rounded-lg border-gray-300 bg-gray-50 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>

                {/* Zahlung filter row */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-1/2">
                    <span className="text-sm font-medium text-gray-600">Zahlung:</span>
                    {ZAHLUNG_OPTIONS.map((opt) => {
                        const isActive = selectedBezahlt === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleBezahltToggle(opt.value)}
                                className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                ${isActive
                                        ? 'bg-white border border-gray-300 text-gray-700 shadow-sm'
                                        : 'bg-gray-100 border border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                    }
                            `}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
                {/* <div className="shrink-0 w-full sm:w-auto">
                    <Select
                        value={selectedDays.toString()}
                        onValueChange={(v) => setSelectedDays(parseInt(v, 10))}
                    >
                        <SelectTrigger className="h-9 sm:h-10 w-full sm:w-[180px] rounded-lg border-gray-300 bg-gray-50 text-sm font-medium cursor-pointer">
                            <SelectValue placeholder="Zeitraum" />
                        </SelectTrigger>
                        <SelectContent>
                            {DAYS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div> */}
            </div>


        </div>
    );
}
