import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function FilterCard() {
    // State for each question
    const [halbprobeErforderlich, setHalbprobeErforderlich] = useState<boolean | null>(null);
    const [leistenVorhanden, setLeistenVorhanden] = useState<boolean | null>(null);
    const [bettungErforderlich, setBettungErforderlich] = useState<boolean | null>(null);

    // State for conditional input fields
    const [lastData, setLastData] = useState({
        material: '',
        size: '',
        notes: '',
    });

    const [footbedData, setFootbedData] = useState({
        material: '',
        thickness: '',
        notes: '',
    });

    const [internalPrepData, setInternalPrepData] = useState({
        notes: '',
        preparationDate: undefined as Date | undefined,
    });

    const [customerFittingData, setCustomerFittingData] = useState({
        fittingDate: undefined as Date | undefined,
        adjustments: '',
        customerNotes: '',
    });

  return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6">PRODUKTIONSWORKFLOW</h2>

            {/* 1. Halbprobe erforderlich? */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Halbprobe erforderlich?</h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setHalbprobeErforderlich(true)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            halbprobeErforderlich === true
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Ja – Halbprobe einplanen
                    </button>
                    <button
                        type="button"
                        onClick={() => setHalbprobeErforderlich(false)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            halbprobeErforderlich === false
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Nein – direkt zur Fertigung
                    </button>
                </div>

                {/* Step 4: Internal Preparation - Only show if Halbprobe = Yes */}
                {halbprobeErforderlich === true && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Step 4: Interne Vorbereitung</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Vorbereitungsdatum
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal text-sm h-10"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {internalPrepData.preparationDate ? (
                                                format(internalPrepData.preparationDate, 'dd.MM.yyyy')
                                            ) : (
                                                <span className="text-gray-400">Datum auswählen</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={internalPrepData.preparationDate}
                                            onSelect={(date) => setInternalPrepData({ ...internalPrepData, preparationDate: date })}
                                            initialFocus
                                            captionLayout="dropdown"
                                            fromYear={new Date().getFullYear()}
                                            toYear={new Date().getFullYear() + 5}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Notizen
                                </label>
                                <textarea
                                    value={internalPrepData.notes}
                                    onChange={(e) => setInternalPrepData({ ...internalPrepData, notes: e.target.value })}
                                    placeholder="Interne Vorbereitungsnotizen..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Customer Fitting - Only show if Halbprobe = Yes */}
                {halbprobeErforderlich === true && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Step 5: Kundenanprobe</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Anprobedatum
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal text-sm h-10"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {customerFittingData.fittingDate ? (
                                                format(customerFittingData.fittingDate, 'dd.MM.yyyy')
                                            ) : (
                                                <span className="text-gray-400">Datum auswählen</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={customerFittingData.fittingDate}
                                            onSelect={(date) => setCustomerFittingData({ ...customerFittingData, fittingDate: date })}
                                            initialFocus
                                            captionLayout="dropdown"
                                            fromYear={new Date().getFullYear()}
                                            toYear={new Date().getFullYear() + 5}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Anpassungen
                                    </label>
                                    <textarea
                                        value={customerFittingData.adjustments}
                                        onChange={(e) => setCustomerFittingData({ ...customerFittingData, adjustments: e.target.value })}
                                        placeholder="Anpassungen während der Anprobe..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Kundennotizen
                                    </label>
                                    <textarea
                                        value={customerFittingData.customerNotes}
                                        onChange={(e) => setCustomerFittingData({ ...customerFittingData, customerNotes: e.target.value })}
                                        placeholder="Kundenwünsche und Notizen..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Leisten vorhanden? */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Leisten vorhanden?</h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setLeistenVorhanden(true)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            leistenVorhanden === true
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Ja – vorhandenen Leisten verwenden
                    </button>
                    <button
                        type="button"
                        onClick={() => setLeistenVorhanden(false)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            leistenVorhanden === false
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Nein – Leisten muss erstellt werden
                    </button>
                </div>

                {/* Step 2: Last Data Input - Only show if Leisten = No */}
                {leistenVorhanden === false && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Step 2: Leisten-Daten</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Material
                                    </label>
                                    <input
                                        type="text"
                                        value={lastData.material}
                                        onChange={(e) => setLastData({ ...lastData, material: e.target.value })}
                                        placeholder="Leisten-Material..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Größe
                                    </label>
                                    <input
                                        type="text"
                                        value={lastData.size}
                                        onChange={(e) => setLastData({ ...lastData, size: e.target.value })}
                                        placeholder="Leisten-Größe..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Notizen
                                </label>
                                <textarea
                                    value={lastData.notes}
                                    onChange={(e) => setLastData({ ...lastData, notes: e.target.value })}
                                    placeholder="Leisten-Notizen..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Bettung erforderlich? */}
            <div className="mb-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Bettung erforderlich?</h3>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setBettungErforderlich(true)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            bettungErforderlich === true
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Ja
                    </button>
                    <button
                        type="button"
                        onClick={() => setBettungErforderlich(false)}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer border-2 ${
                            bettungErforderlich === false
                                ? 'bg-green-50 text-[#61A178] border-2 border-green-400'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        Nein
                    </button>
                </div>

                {/* Step 3: Footbed Data Input - Only show if Bettung = No */}
                {bettungErforderlich === false && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Step 3: Bettungs-Daten</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Material
                                    </label>
                                    <input
                                        type="text"
                                        value={footbedData.material}
                                        onChange={(e) => setFootbedData({ ...footbedData, material: e.target.value })}
                                        placeholder="Bettungs-Material..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Dicke
                                    </label>
                                    <input
                                        type="text"
                                        value={footbedData.thickness}
                                        onChange={(e) => setFootbedData({ ...footbedData, thickness: e.target.value })}
                                        placeholder="Bettungs-Dicke..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Notizen
                                </label>
                                <textarea
                                    value={footbedData.notes}
                                    onChange={(e) => setFootbedData({ ...footbedData, notes: e.target.value })}
                                    placeholder="Bettungs-Notizen..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#61A178] focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
