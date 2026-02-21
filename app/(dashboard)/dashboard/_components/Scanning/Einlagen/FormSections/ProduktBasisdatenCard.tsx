import React, { useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';

interface ProduktBasisdatenCardProps {
    einlagentyp: string;
    selectedEinlage: EinlageType | string;
    einlageOptions: Array<{ id?: string; name: string; price?: number }>;
    showEinlageDropdown: boolean;
    onEinlageToggle: () => void;
    onEinlageSelect: (value: string) => void;
    onEinlageClear?: () => void;
    onCloseEinlageDropdown?: () => void;
    einlagentypError?: string;
    überzug: string;
    uberzugOptions: string[];
    showUberzugDropdown: boolean;
    onUberzugToggle: () => void;
    onUberzugSelect: (value: string) => void;
    onUberzugClear?: () => void;
    onCloseUberzugDropdown?: () => void;
    überzugError?: string;
    menge: string;
    mengeOptions: string[];
    showMengeDropdown: boolean;
    onMengeToggle: () => void;
    onMengeSelect: (value: string) => void;
    onMengeClear?: () => void;
    onCloseMengeDropdown?: () => void;
    mengeError?: string;
    schuhmodell_wählen: string;
    onSchuhmodellChange: (value: string) => void;
}

export default function ProduktBasisdatenCard({
    einlagentyp,
    selectedEinlage,
    einlageOptions,
    showEinlageDropdown,
    onEinlageToggle,
    onEinlageSelect,
    onEinlageClear,
    onCloseEinlageDropdown,
    einlagentypError,
    überzug,
    uberzugOptions,
    showUberzugDropdown,
    onUberzugToggle,
    onUberzugSelect,
    onUberzugClear,
    onCloseUberzugDropdown,
    überzugError,
    menge,
    mengeOptions,
    showMengeDropdown,
    onMengeToggle,
    onMengeSelect,
    onMengeClear,
    onCloseMengeDropdown,
    mengeError,
    schuhmodell_wählen,
    onSchuhmodellChange,
}: ProduktBasisdatenCardProps) {
    const einlageRef = useRef<HTMLDivElement>(null);
    const uberzugRef = useRef<HTMLDivElement>(null);
    const mengeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (onCloseEinlageDropdown && einlageRef.current && !einlageRef.current.contains(target)) {
                onCloseEinlageDropdown();
            }
            if (onCloseUberzugDropdown && uberzugRef.current && !uberzugRef.current.contains(target)) {
                onCloseUberzugDropdown();
            }
            if (onCloseMengeDropdown && mengeRef.current && !mengeRef.current.contains(target)) {
                onCloseMengeDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onCloseEinlageDropdown, onCloseUberzugDropdown, onCloseMengeDropdown]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">PRODUKT & BASISDATEN</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Einlagetyp */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Einlagetyp
                    </label>
                    <div className="relative" ref={einlageRef}>
                        <button
                            type="button"
                            onClick={onEinlageToggle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent cursor-pointer flex items-center justify-between gap-2"
                        >
                            <span className={`truncate flex-1 ${einlagentyp ? 'text-gray-900' : 'text-gray-400'}`}>
                                {einlagentyp || 'Auswählen...'}
                            </span>
                            <div className="flex items-center shrink-0">
                                {einlagentyp && onEinlageClear ? (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onEinlageClear();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onEinlageClear();
                                            }
                                        }}
                                        className="rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                ) : (
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                )}
                            </div>
                        </button>
                        {showEinlageDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {einlageOptions.map((option) => (
                                    <div
                                        key={option.name}
                                        onClick={() => {
                                            onEinlageSelect(option.name);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-gray-900">{option.name}</span>
                                            {option.price !== undefined && (
                                                <span className="text-green-600 font-semibold whitespace-nowrap">
                                                    € {option.price.toFixed(2).replace('.', ',')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {einlagentypError && (
                        <p className="text-red-500 text-xs mt-1">{einlagentypError}</p>
                    )}
                </div>

                {/* Überzug */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Überzug
                    </label>
                    <div className="relative" ref={uberzugRef}>
                        <button
                            type="button"
                            onClick={onUberzugToggle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent cursor-pointer flex items-center justify-between gap-2"
                        >
                            <span className={`truncate flex-1 ${überzug ? 'text-gray-900' : 'text-gray-400'}`}>
                                {überzug || 'Auswählen...'}
                            </span>
                            <div className="flex items-center shrink-0">
                                {überzug && onUberzugClear ? (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onUberzugClear();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onUberzugClear();
                                            }
                                        }}
                                        className="rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                ) : (
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                )}
                            </div>
                        </button>
                        {showUberzugDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {uberzugOptions.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            onUberzugSelect(option);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {überzugError && (
                        <p className="text-red-500 text-xs mt-1">{überzugError}</p>
                    )}
                </div>

                {/* Menge */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Menge
                    </label>
                    <div className="relative" ref={mengeRef}>
                        <button
                            type="button"
                            onClick={onMengeToggle}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent cursor-pointer flex items-center justify-between gap-2"
                        >
                            <span className={`truncate flex-1 ${menge ? 'text-gray-900' : 'text-gray-400'}`}>
                                {menge || 'Auswählen...'}
                            </span>
                            <div className="flex items-center shrink-0">
                                {menge && onMengeClear ? (
                                    <span
                                        role="button"
                                        tabIndex={-1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onMengeClear();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onMengeClear();
                                            }
                                        }}
                                        className="rounded p-0.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="Auswahl löschen"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>
                                ) : (
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                )}
                            </div>
                        </button>
                        {showMengeDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {mengeOptions.map((option) => (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            onMengeSelect(option);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {mengeError && (
                        <p className="text-red-500 text-xs mt-1">{mengeError}</p>
                    )}
                </div>

                {/* Schuhmodell */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Schuhmodell
                    </label>
                    <input
                        type="text"
                        value={schuhmodell_wählen}
                        onChange={(e) => onSchuhmodellChange(e.target.value)}
                        placeholder="Marke, Modell, Größe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );
}

