import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TiArrowSortedDown } from 'react-icons/ti';

interface VersorgungItem {
    id: string;
    name: string;
    rohlingHersteller: string;
    artikelHersteller: string;
    versorgung: string;
    material: string;
}

interface SupplySectionProps {
    versorgungNote: string;
    onVersorgungNoteChange: (value: string) => void;
    showSupplyDropdown: boolean;
    onSupplyDropdownToggle: () => void;
    selectedDiagnosis: string;
    selectedEinlage: string;
    versorgungData: VersorgungItem[];
    loadingVersorgung: boolean;
    hasDataLoaded: boolean;
    selectedVersorgungId: string | null;
    supply: string;
    onVersorgungCardSelect: (item: VersorgungItem) => void;
    versorgungError?: string;
}

export default function SupplySection({
    versorgungNote,
    onVersorgungNoteChange,
    showSupplyDropdown,
    onSupplyDropdownToggle,
    selectedDiagnosis,
    selectedEinlage,
    versorgungData,
    loadingVersorgung,
    hasDataLoaded,
    selectedVersorgungId,
    supply,
    onVersorgungCardSelect,
    versorgungError,
}: SupplySectionProps) {
    return (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Versorgung note */}
            <div className="relative">
                <div className="mb-2">
                    <h3 className="text-lg font-semibold">Versorgung Note</h3>
                </div>
                <textarea
                    value={versorgungNote}
                    onChange={(e) => onVersorgungNoteChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Hast du sonstige Anmerkungen oder Notizen zur Versorgung..."
                />
            </div>

            {/* Versorgung */}
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Versorgung</h3>
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={onSupplyDropdownToggle}
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                            <TiArrowSortedDown
                                className={`text-gray-900 text-3xl transition-transform ${
                                    showSupplyDropdown ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Supply Dropdown */}
                {showSupplyDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto mb-2">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <div className="text-sm font-semibold text-gray-700">
                                {selectedDiagnosis
                                    ? `${selectedDiagnosis} - ${selectedEinlage}`
                                    : `${selectedEinlage} Optionen`}{' '}
                                {hasDataLoaded && `(${versorgungData.length} gefunden)`}
                            </div>
                            {selectedDiagnosis && (
                                <div className="text-xs text-blue-600 mt-1">
                                    Diagnosebasierte Auswahl für {selectedEinlage}
                                </div>
                            )}
                        </div>

                        {loadingVersorgung ? (
                            <div className="p-8 text-center">
                                <ImSpinner2 className="animate-spin text-2xl text-gray-500 mx-auto mb-2" />
                                <div className="text-sm text-gray-500">Lade Daten...</div>
                            </div>
                        ) : hasDataLoaded && versorgungData.length > 0 ? (
                            versorgungData.map((item, index) => {
                                const isSelected = selectedVersorgungId === item.id;
                                return (
                                    <div
                                        key={item.id || index}
                                        className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => onVersorgungCardSelect(item)}
                                    >
                                        <div
                                            className={`font-semibold mb-2 ${
                                                isSelected ? 'text-blue-900' : 'text-gray-900'
                                            }`}
                                        >
                                            {item.name}
                                            {isSelected && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Ausgewählt
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                            <div>
                                                <span className="font-medium">Rohling:</span>{' '}
                                                {item.rohlingHersteller}
                                            </div>
                                            <div>
                                                <span className="font-medium">Artikel:</span>{' '}
                                                {item.artikelHersteller}
                                            </div>
                                        </div>
                                        <div
                                            className={`text-sm mb-1 ${
                                                isSelected ? 'text-blue-700' : 'text-gray-700'
                                            }`}
                                        >
                                            <span className="font-medium">Versorgung:</span> {item.versorgung}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Material:</span> {item.material}
                                        </div>
                                    </div>
                                );
                            })
                        ) : hasDataLoaded && versorgungData.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-sm">Keine Daten für {selectedEinlage} gefunden</div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-sm">Bitte wählen Sie eine Einlage-Kategorie aus</div>
                            </div>
                        )}
                    </div>
                )}

                <div className={`p-2 border rounded min-h-[100px] bg-gray-50 ${
                    versorgungError ? 'border-red-500' : 'border-gray-300'
                }`}>
                    {selectedVersorgungId && versorgungData.length > 0 ? (
                        (() => {
                            const selectedItem = versorgungData.find(
                                (item) => item.id === selectedVersorgungId
                            );
                            if (selectedItem) {
                                return (
                                    <div className="space-y-2">
                                        <div className="font-semibold text-gray-900">{selectedItem.name}</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <div>
                                                <span className="font-medium">Rohling:</span>{' '}
                                                {selectedItem.rohlingHersteller}
                                            </div>
                                            <div>
                                                <span className="font-medium">Artikel:</span>{' '}
                                                {selectedItem.artikelHersteller}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <span className="font-medium">Versorgung:</span>{' '}
                                            {selectedItem.versorgung}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Material:</span> {selectedItem.material}
                                        </div>
                                    </div>
                                );
                            }
                            return supply || (
                                <span className="text-gray-400 italic">Keine Versorgung ausgewählt</span>
                            );
                        })()
                    ) : (
                        supply || <span className="text-gray-400 italic">Keine Versorgung ausgewählt</span>
                    )}
                </div>
                {versorgungError && (
                    <p className="text-red-500 text-sm mt-1">{versorgungError}</p>
                )}
            </div>
        </div>
    );
}

