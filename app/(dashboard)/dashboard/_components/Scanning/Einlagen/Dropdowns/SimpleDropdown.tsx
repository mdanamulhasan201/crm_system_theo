import React from 'react';

interface SimpleDropdownProps {
    label: string;
    value: string;
    placeholder: string;
    options: readonly string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
    error?: string;
}

export default function SimpleDropdown({
    label,
    value,
    placeholder,
    options,
    isOpen,
    onToggle,
    onSelect,
    error,
}: SimpleDropdownProps) {
    return (
        <div className="relative">
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
                    <span className={`text-sm sm:text-base truncate pr-2 ${value ? '' : 'text-gray-400'}`}>
                        {value || placeholder}
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 flex-shrink-0"
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
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                        {options.map((option) => (
                            <div
                                key={option}
                                className="p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                    onSelect(option);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

