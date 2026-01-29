'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CustomShaftsHeaderProps {
    gender: 'Herren' | 'Damen';
    category: string;
    searchQuery: string;
    sortOption: string;
    onGenderChange: (gender: 'Herren' | 'Damen') => void;
    onCategoryChange: (category: string) => void;
    onSearchChange: (query: string) => void;
    onSortChange: (sort: string) => void;
    onCustomOrderClick: () => void;
}

const categories = [
    { label: 'Alle Kategorien', value: 'alle' },
    { label: 'Halbschuhe', value: 'Halbschuhe' },
    { label: 'Stiefel', value: 'Stiefel' },
    { label: 'Knöchelhoch', value: 'Knöchelhoch' },
    { label: 'Sandalen', value: 'Sandalen' },
    { label: 'Bergschuhe', value: 'Bergschuhe' },
    { label: 'Business-Schuhe', value: 'Business-Schuhe' },
];

const sortOptions = [
    { label: 'Preis: Niedrig bis Hoch', value: 'price_asc' },
    { label: 'Preis: Hoch bis Niedrig', value: 'price_desc' },
    { label: 'Beliebteste Produkte', value: 'favorites' },
];

export default function CustomShaftsHeader({
    gender,
    category,
    searchQuery,
    sortOption,
    onGenderChange,
    onCategoryChange,
    onSearchChange,
    onSortChange,
    onCustomOrderClick,
}: CustomShaftsHeaderProps) {
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (categoryOpen && !target.closest('.category-dropdown')) {
                setCategoryOpen(false);
            }
            if (sortOpen && !target.closest('.sort-dropdown')) {
                setSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [categoryOpen, sortOpen]);

    return (
        <div>
            {/* Header & Description */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Individuelle Maßschäfte</h1>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                    3D-basiert oder physisch umgesetzt. Schnell gefertigt. Klar kalkulierbar.
                </p>
                <Button
                    onClick={onCustomOrderClick}
                    className="rounded-xl bg-[#61A175] text-white hover:bg-[#61A175]/50 px-6 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer border-0"
                >
                    Eigenes Modell konfigurieren
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="my-8">
                {/* First Row - Gender Buttons and Search */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    {/* Gender Buttons */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className={`rounded-lg cursor-pointer border px-8 py-2.5 text-sm font-medium h-10 transition-all ${
                                gender === 'Herren'
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => onGenderChange('Herren')}
                        >
                            Herren
                        </Button>
                        <Button
                            variant="outline"
                            className={`rounded-lg cursor-pointer border px-8 py-2.5 text-sm font-medium h-10 transition-all ${
                                gender === 'Damen'
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => onGenderChange('Damen')}
                        >
                            Damen
                        </Button>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full lg:w-[300px] pl-9 pr-4 h-10 text-sm rounded-lg border border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Second Row - Category and Sort */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gray-200">
                    {/* Category Dropdown */}
                    <div className="relative category-dropdown flex items-center gap-3">
                        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Kategorie</span>
                        <button
                            className="flex cursor-pointer items-center gap-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2.5 h-10 hover:border-gray-400 transition-all min-w-[200px] justify-between"
                            onClick={() => setCategoryOpen((v) => !v)}
                            type="button"
                        >
                            <span>{categories.find((c) => c.value === category)?.label || 'Alle Kategorien'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {categoryOpen && (
                            <div className="absolute z-10 top-full mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.value}
                                        className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                                            category === cat.value
                                                ? 'bg-gray-100 text-black font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                            onCategoryChange(cat.value);
                                            setCategoryOpen(false);
                                        }}
                                    >
                                        {cat.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative sort-dropdown flex items-center gap-3">
                        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Sortieren</span>
                        <button
                            className="flex cursor-pointer items-center gap-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2.5 h-10 hover:border-gray-400 transition-all min-w-[200px] justify-between"
                            onClick={() => setSortOpen((v) => !v)}
                            type="button"
                        >
                            <span>{sortOptions.find((s) => s.value === sortOption)?.label || 'Preis: Niedrig bis Hoch'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {sortOpen && (
                            <div className="absolute z-10 top-full mt-1 right-0 w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {sortOptions.map((sort) => (
                                    <div
                                        key={sort.value}
                                        className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                                            sortOption === sort.value
                                                ? 'bg-gray-100 text-black font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                            onSortChange(sort.value);
                                            setSortOpen(false);
                                        }}
                                    >
                                        {sort.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

