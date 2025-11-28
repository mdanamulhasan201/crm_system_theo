import React from 'react';

interface DiagnosisDropdownProps {
    label: string;
    selectedValue: string;
    placeholder: string;
    options: readonly string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
    onClear: () => void;
}

export default function DiagnosisDropdown({
    label,
    selectedValue,
    placeholder,
    options,
    isOpen,
    onToggle,
    onSelect,
    onClear,
}: DiagnosisDropdownProps) {
    return (
        <div className="relative">
            <div className="mb-2">
                <h3 className="text-sm font-semibold">{label}</h3>
            </div>
            <div className="relative">
                <div
                    className="p-3 sm:p-2 border border-gray-300 rounded cursor-pointer flex justify-between items-center min-h-[44px]"
                    onClick={onToggle}
                >
                    <span className={`text-sm sm:text-base truncate pr-2 ${selectedValue ? '' : 'text-gray-400'}`}>
                        {selectedValue || placeholder}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {selectedValue && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                className="text-gray-400 hover:text-gray-600 text-sm p-1 hover:bg-gray-100 rounded"
                                title="Diagnose löschen"
                            >
                                ✕
                            </button>
                        )}
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
                </div>
                {isOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="p-3 sm:p-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                                onClick={() => onSelect(option)}
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

