import React, { useState, useRef, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface PositionsnummerItem {
    id: string;
    positionsnummer?: string;
    description: string | {
        positionsnummer?: string;
        title?: string;
        subtitle?: string;
        Quantità?: string;
        "Importo U."?: string;
        IVA?: string;
    };
    price: number;
}

interface PositionsnummerDropdownProps {
    label: string;
    value: string[];
    placeholder: string;
    options: PositionsnummerItem[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (values: string[]) => void;
    error?: string;
}

export default function PositionsnummerDropdown({
    label,
    value,
    placeholder,
    options,
    isOpen,
    onToggle,
    onSelect,
    error,
}: PositionsnummerDropdownProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Helper function to get positionsnummer
    const getPositionsnummer = (option: PositionsnummerItem): string => {
        if (option.positionsnummer) {
            return option.positionsnummer;
        }
        if (typeof option.description === 'object' && option.description.positionsnummer) {
            return option.description.positionsnummer;
        }
        return '';
    };

    // Helper function to get description text for display
    const getDescriptionText = (option: PositionsnummerItem): string => {
        if (typeof option.description === 'string') {
            return option.description;
        }
        // For object description, show title and subtitle
        const title = option.description?.title || '';
        const subtitle = option.description?.subtitle || '';
        if (title && subtitle) {
            return `${title} - ${subtitle}`;
        }
        return title || subtitle || '';
    };

    // Filter options based on search
    const filteredOptions = options.filter(option => {
        const posNum = getPositionsnummer(option);
        const descText = getDescriptionText(option);
        return posNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
            descText.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Handle checkbox toggle
    const handleToggle = (posNum: string) => {
        const currentValues = Array.isArray(value) ? value : [];
        if (currentValues.includes(posNum)) {
            // Remove if already selected
            onSelect(currentValues.filter(v => v !== posNum));
        } else {
            // Add if not selected
            onSelect([...currentValues, posNum]);
        }
    };

    // Get selected options for display
    const selectedOptions = options.filter(opt => {
        const posNum = getPositionsnummer(opt);
        return Array.isArray(value) && value.includes(posNum);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    onToggle();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus search input when dropdown opens
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="mb-2">
                <h3 className="text-sm font-semibold">{label}</h3>
            </div>
            <div className="relative">
                <div
                    className={`p-3 sm:p-2 border rounded cursor-pointer flex justify-between items-center min-h-[44px] ${
                        error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={onToggle}
                >
                    <span className={`text-sm sm:text-base truncate pr-2 ${value.length > 0 ? '' : 'text-gray-400'}`}>
                        {selectedOptions.length > 0 ? (
                            <span className="flex items-center gap-2 flex-wrap">
                                {selectedOptions.length === 1 ? (
                                    <>
                                        <span className="font-medium text-gray-900">{getPositionsnummer(selectedOptions[0])}</span>
                                        <span className="text-gray-600">{getDescriptionText(selectedOptions[0])}</span>
                                        <span className="text-green-600 font-semibold">€ {selectedOptions[0].price.toFixed(2).replace('.', ',')}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-700 font-medium">
                                        {selectedOptions.length} ausgewählt
                                    </span>
                                )}
                            </span>
                        ) : (
                            placeholder
                        )}
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-96 overflow-hidden flex flex-col">
                        {/* Search Bar */}
                        <div className="p-2 border-b border-gray-200">
                            <div className="relative">
                                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Positionsnummer oder Text suchen..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full rounded-md bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        {/* Options List */}
                        <div className="overflow-y-auto max-h-80">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    Keine Ergebnisse gefunden
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const posNum = getPositionsnummer(option);
                                    const descText = getDescriptionText(option);
                                    const isSelected = Array.isArray(value) && value.includes(posNum);
                                    return (
                                        <div
                                            key={option.id}
                                            className={`p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0 flex items-center justify-between gap-2 ${
                                                isSelected ? 'bg-green-50' : ''
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggle(posNum);
                                            }}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleToggle(posNum)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="shrink-0"
                                                />
                                                <span className="font-medium text-gray-900 shrink-0">
                                                    {posNum}
                                                </span>
                                                <span className="text-gray-600 flex-1 truncate">
                                                    {descText}
                                                </span>
                                            </div>
                                            <span className="text-green-600 font-semibold shrink-0">
                                                € {option.price.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
