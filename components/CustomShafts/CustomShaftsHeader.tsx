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
                <h1 className="text-xl md:text-2xl font-bold mb-1">Individuelle Maßschäfte</h1>
                <div className="text-xs md:text-sm text-gray-700 leading-snug mb-1">
                    3D-basiert oder physisch umgesetzt. Schnell gefertigt. Klar kalkulierbar.<br />
                    <span
                        className="font-bold cursor-pointer underline hover:text-green-600 transition-colors"
                        onClick={onCustomOrderClick}
                    >
                        Jetzt neu: Eigenes Modell konfigurieren
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 pb-4 border-b border-gray-200">
                {/* Left Side - Gender & Category */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Gender Buttons */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className={`rounded-sm cursor-pointer border px-6 py-2 text-sm font-normal h-9 transition-all ${
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
                            className={`rounded-sm cursor-pointer border px-6 py-2 text-sm font-normal h-9 transition-all ${
                                gender === 'Damen'
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => onGenderChange('Damen')}
                        >
                            Damen
                        </Button>
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative category-dropdown flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Kategorie</span>
                        <button
                            className="flex cursor-pointer items-center gap-2 text-sm font-normal text-black bg-white border border-gray-300 rounded-sm px-4 py-2 h-9 hover:border-gray-400 transition-all min-w-[180px] justify-between"
                            onClick={() => setCategoryOpen((v) => !v)}
                            type="button"
                        >
                            <span>{categories.find((c) => c.value === category)?.label || 'Alle Kategorien'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {categoryOpen && (
                            <div className="absolute z-10 top-full mt-1 w-[200px] bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
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
                </div>

                {/* Right Side - Search & Sort */}
                <div className="flex items-center gap-4">
                    {/* Search Field */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-[200px] pl-9 pr-4 h-9 text-sm rounded-sm border border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative sort-dropdown flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Sortieren</span>
                        <button
                            className="flex cursor-pointer items-center gap-2 text-sm font-normal text-black bg-white border border-gray-300 rounded-sm px-4 py-2 h-9 hover:border-gray-400 transition-all min-w-[180px] justify-between"
                            onClick={() => setSortOpen((v) => !v)}
                            type="button"
                        >
                            <span>{sortOptions.find((s) => s.value === sortOption)?.label || 'Preis: Niedrig bis Hoch'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {sortOpen && (
                            <div className="absolute z-10 top-full mt-1 right-0 w-[220px] bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
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

