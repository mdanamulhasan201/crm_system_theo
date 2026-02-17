import React, { useState, useRef, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';
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

    // Focus search input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            // Clear search when modal closes
            setSearchQuery('');
        }
    }, [isOpen]);

    return (
        <>
            <div className="relative">
                <div className="mb-2">
                    <h3 className="text-sm font-semibold">{label}</h3>
                </div>
                <div className="relative">
                    <div
                        className={`px-3 py-2.5 border rounded-md cursor-pointer flex justify-between items-center ${
                            error ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onClick={onToggle}
                    >
                        <div className={`text-sm flex-1 overflow-hidden ${value.length > 0 ? '' : 'text-gray-400'}`}>
                            {selectedOptions.length > 0 ? (
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {selectedOptions.length === 1 ? (
                                        <>
                                            <span className="font-medium text-gray-900 whitespace-nowrap">{getPositionsnummer(selectedOptions[0])}</span>
                                            <span className="text-gray-600 truncate flex-1">{getDescriptionText(selectedOptions[0])}</span>
                                            <span className="text-green-600 font-semibold whitespace-nowrap ml-auto">€ {selectedOptions[0].price.toFixed(2).replace('.', ',')}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-700 font-medium">
                                            {selectedOptions.length} ausgewählt
                                        </span>
                                    )}
                                </div>
                            ) : (
                                placeholder
                            )}
                        </div>
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
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
                    onClick={(e) => {
                        // Only close if clicking directly on overlay background, not on modal content
                        if (e.target === e.currentTarget) {
                            onToggle();
                        }
                    }}
                    onMouseDown={(e) => {
                        // Prevent mousedown from triggering clicks on child elements
                        if (e.target === e.currentTarget) {
                            e.stopPropagation();
                        }
                    }}
                >
                    <div 
                        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Positionen hinzufügen</h2>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle();
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-md hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div 
                            className="p-4 sm:p-6 border-b border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Positionsnummer oder Text suchen..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 w-full rounded-md bg-white text-gray-700 placeholder:text-gray-500 border-2 border-green-400 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:border-green-400"
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div 
                            className="overflow-y-auto flex-1"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {filteredOptions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    Keine Ergebnisse gefunden
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredOptions.map((option) => {
                                        const posNum = getPositionsnummer(option);
                                        const descText = getDescriptionText(option);
                                        const isSelected = Array.isArray(value) && value.includes(posNum);
                                        return (
                                            <div
                                                key={option.id}
                                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-green-50' : ''
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    handleToggle(posNum);
                                                }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onChange={(checked) => {
                                                                handleToggle(posNum);
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                            }}
                                                            onMouseDown={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            className="shrink-0"
                                                        />
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className="font-bold text-gray-900 text-base">
                                                                {posNum}
                                                            </span>
                                                            <span className="text-gray-600 text-sm mt-0.5">
                                                                {descText}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-green-600 font-semibold text-base shrink-0">
                                                        € {option.price.toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
