import React, { useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TiArrowSortedDown } from 'react-icons/ti';
import ZusatzeSection from './ZusatzeSection';
import EinmaligeVersorgungContent from './EinmaligeVersorgungContent';

interface VersorgungItem {
    id: string;
    name: string;
    rohlingHersteller: string;
    artikelHersteller: string;
    versorgung: string;
    material: string | string[];
    diagnosis_status?: string[];
}

interface VersorgungKonfigurierenCardProps {
    // Versorgung dropdown
    versorgungData: VersorgungItem[];
    loadingVersorgung: boolean;
    hasDataLoaded: boolean;
    selectedVersorgungId: string | null;
    supply: string;
    onVersorgungCardSelect: (item: VersorgungItem) => void;
    versorgungError?: string;
    showSupplyDropdown: boolean;
    onSupplyDropdownToggle: () => void;
    selectedDiagnosis: string;
    selectedEinlage: string;
}

interface CustomField {
    id: string;
    name: string;
    linksValue: number;
    rechtsValue: number;
}

export default function VersorgungKonfigurierenCard({
    versorgungData,
    loadingVersorgung,
    hasDataLoaded,
    selectedVersorgungId,
    supply,
    onVersorgungCardSelect,
    versorgungError,
    showSupplyDropdown,
    onSupplyDropdownToggle,
    selectedDiagnosis,
    selectedEinlage,
}: VersorgungKonfigurierenCardProps) {
    const [activeTab, setActiveTab] = useState<'standard' | 'einmalig' | 'springer' | 'manuell'>('standard');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [showCustomFields, setShowCustomFields] = useState(false);

    const handleAddCustomField = () => {
        if (newFieldName.trim()) {
            const newField: CustomField = {
                id: Date.now().toString(),
                name: newFieldName.trim(),
                linksValue: 0.0,
                rechtsValue: 0.0,
            };
            setCustomFields([...customFields, newField]);
            setNewFieldName('');
            setShowAddModal(false);
            setShowCustomFields(true); // Auto-expand to show the new field
        }
    };

    const handleDeleteCustomField = (id: string) => {
        setCustomFields(customFields.filter(field => field.id !== id));
    };

    const handleCustomFieldChange = (id: string, side: 'links' | 'rechts', value: number) => {
        setCustomFields(customFields.map(field => 
            field.id === id 
                ? { ...field, [side === 'links' ? 'linksValue' : 'rechtsValue']: value }
                : field
        ));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            {/* Header with Tabs on same line */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Versorgung konfigurieren</h2>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('standard')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === 'standard'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        📄 Standard-Vorlage
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('einmalig')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === 'einmalig'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        ⚙️ Einmalige Versorgung
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('springer')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === 'springer'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        🛒 Springer
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('manuell')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === 'manuell'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        ✏️ Manuell
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'standard' && (
                <>
                    {/* Versorgung Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-700">Standardversorgung</h3>
                            <button
                                type="button"
                                onClick={onSupplyDropdownToggle}
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                            >
                                <TiArrowSortedDown
                                    className={`text-gray-900 text-2xl transition-transform ${showSupplyDropdown ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Versorgung Dropdown */}
                        <div className="relative">
                            {showSupplyDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto mb-2">
                                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700">
                                            {selectedDiagnosis
                                                ? `${selectedDiagnosis} - ${selectedEinlage}`
                                                : `${selectedEinlage} Optionen`}{' '}
                                            {hasDataLoaded && `(${versorgungData.length} gefunden)`}
                                        </div>
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
                                                    className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${isSelected
                                                        ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => onVersorgungCardSelect(item)}
                                                >
                                                    <div
                                                        className={`font-semibold mb-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'
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
                                                        className={`text-sm mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'
                                                            }`}
                                                    >
                                                        <span className="font-medium">Versorgung:</span> {item.versorgung}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">Material:</span>{' '}
                                                        {Array.isArray(item.material)
                                                            ? item.material.join(', ')
                                                            : item.material}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <div className="text-sm">Keine Daten gefunden</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selected Versorgung Display */}
                            <div className={`p-3 border rounded-md min-h-[100px] bg-gray-50 ${versorgungError ? 'border-red-500' : 'border-gray-300'
                                }`}>
                                {selectedVersorgungId && versorgungData.length > 0 ? (
                                    (() => {
                                        const selectedItem = versorgungData.find(
                                            (item) => item.id === selectedVersorgungId
                                        );
                                        if (selectedItem) {
                                            return (
                                                <div className="space-y-2">
                                                    <p className='font-bold text-sm'>
                                                        Versorgung: <span className='font-normal text-sm'>{selectedItem.versorgung}</span>
                                                    </p>
                                                    <div className='flex flex-col gap-2'>
                                                        <p className='font-bold text-sm'>
                                                            Materialien:
                                                            <span className='font-normal ml-2 text-sm'>
                                                                {Array.isArray(selectedItem.material)
                                                                    ? selectedItem.material.join(', ')
                                                                    : selectedItem.material}
                                                            </span>
                                                        </p>
                                                        <h2 className='text-sm font-bold'>{selectedItem.name}</h2>
                                                        <p className='text-xs font-medium text-gray-600'>
                                                            Einlage: <span className='font-normal text-xs'>{selectedEinlage}</span>
                                                        </p>
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

                    {/* Zusätze Section */}
                    <ZusatzeSection
                        customFields={customFields}
                        showCustomFields={showCustomFields}
                        onToggleCustomFields={() => setShowCustomFields(!showCustomFields)}
                        onAddField={() => setShowAddModal(true)}
                        onDeleteField={handleDeleteCustomField}
                        onFieldChange={handleCustomFieldChange}
                    />
                </>
            )}

            {/* Einmalige Versorgung Tab */}
            {activeTab === 'einmalig' && (
                <>
                    <EinmaligeVersorgungContent />
                    
                    {/* Zusätze Section */}
                    <ZusatzeSection
                        customFields={customFields}
                        showCustomFields={showCustomFields}
                        onToggleCustomFields={() => setShowCustomFields(!showCustomFields)}
                        onAddField={() => setShowAddModal(true)}
                        onDeleteField={handleDeleteCustomField}
                        onFieldChange={handleCustomFieldChange}
                    />
                </>
            )}

            {/* Other tabs content - placeholder for now */}
            {(activeTab === 'springer' || activeTab === 'manuell') && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">{activeTab} - Kommt bald...</p>
                </div>
            )}

            {/* Add Custom Field Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Neuen Zusatz hinzufügen</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bezeichnung
                            </label>
                            <input
                                type="text"
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddCustomField();
                                    }
                                }}
                                placeholder="z.B. Fersensporn, Metatarsalgie..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewFieldName('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCustomField}
                                disabled={!newFieldName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#61A178] hover:bg-[#4A8A5F] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

