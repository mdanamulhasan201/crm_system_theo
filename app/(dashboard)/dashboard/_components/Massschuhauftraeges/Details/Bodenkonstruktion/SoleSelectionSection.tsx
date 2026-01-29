import React from "react"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import { FaArrowRight } from "react-icons/fa"
import Image from "next/image"

interface SoleSelectionSectionProps {
    selectedSole: SoleType | null
    onOpenModal: () => void
    sole4Thickness?: string | null
    sole4Color?: string | null
    onSole4ThicknessChange?: (value: string | null) => void
    onSole4ColorChange?: (value: string | null) => void
    sole5Thickness?: string | null
    sole5Color?: string | null
    onSole5ThicknessChange?: (value: string | null) => void
    onSole5ColorChange?: (value: string | null) => void
    sole6Thickness?: string | null
    sole6Color?: string | null
    onSole6ThicknessChange?: (value: string | null) => void
    onSole6ColorChange?: (value: string | null) => void
}

export default function SoleSelectionSection({ 
    selectedSole, 
    onOpenModal,
    sole4Thickness,
    sole4Color,
    onSole4ThicknessChange,
    onSole4ColorChange,
    sole5Thickness,
    sole5Color,
    onSole5ThicknessChange,
    onSole5ColorChange,
    sole6Thickness,
    sole6Color,
    onSole6ThicknessChange,
    onSole6ColorChange,
}: SoleSelectionSectionProps) {
    return (
        <div className="bg-white rounded-lg p-4 w-full mb-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Wähle deinen Boden aus</h2>
                    <p className="text-sm text-gray-600">Wähle die passende Sohle für deinen Maßschuh</p>
                </div>
                <button
                    className="px-4 cursor-pointer flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    onClick={onOpenModal}
                >
                    Mehr ansehen
                    <FaArrowRight />
                </button>
            </div>
            <div className="border-t border-orange-400 my-4"></div>
            
            {selectedSole ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Image
                            width={96}
                            height={96}
                            src={selectedSole.image} 
                            alt={selectedSole.name} 
                            className="w-24 h-24 object-contain" 
                        />
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Ausgewählte Sohle:</p>
                            <p className="text-lg font-bold text-gray-800">{selectedSole.name}</p>
                            {selectedSole.des && (
                                <p className="text-sm text-gray-500 mt-1">{selectedSole.des}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Additional fields for sole id "4" */}
                    {selectedSole.id === "4" && (
                        <div className="border-t border-gray-200 pt-4 space-y-4">
                            {/* Sohlenstärke Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Sohlenstärke <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole4-thickness"
                                            value="4mm"
                                            checked={sole4Thickness === "4mm"}
                                            onChange={(e) => onSole4ThicknessChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">4mm</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole4-thickness"
                                            value="6mm"
                                            checked={sole4Thickness === "6mm"}
                                            onChange={(e) => onSole4ThicknessChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">6mm</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Color Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Farbe <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole4-color"
                                            value="Schwarz"
                                            checked={sole4Color === "Schwarz"}
                                            onChange={(e) => onSole4ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Schwarz</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole4-color"
                                            value="Dunkelbraun"
                                            checked={sole4Color === "Dunkelbraun"}
                                            onChange={(e) => onSole4ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Dunkelbraun</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole4-color"
                                            value="Weiss"
                                            checked={sole4Color === "Weiss"}
                                            onChange={(e) => onSole4ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Weiss</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Validation message */}
                            {(!sole4Thickness || !sole4Color) && (
                                <p className="text-sm text-red-600">
                                    Bitte wählen Sie Sohlenstärke und Farbe aus.
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* Additional fields for sole id "5" */}
                    {selectedSole.id === "5" && (
                        <div className="border-t border-gray-200 pt-4 space-y-4">
                            {/* Sohlenstärke Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Sohlenstärke <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole5-thickness"
                                            value="4mm"
                                            checked={sole5Thickness === "4mm"}
                                            onChange={(e) => onSole5ThicknessChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">4mm</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole5-thickness"
                                            value="6mm"
                                            checked={sole5Thickness === "6mm"}
                                            onChange={(e) => onSole5ThicknessChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">6mm</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Color Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Farbe <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole5-color"
                                            value="Schwarz"
                                            checked={sole5Color === "Schwarz"}
                                            onChange={(e) => onSole5ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Schwarz</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole5-color"
                                            value="Dunkelbraun"
                                            checked={sole5Color === "Dunkelbraun"}
                                            onChange={(e) => onSole5ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Dunkelbraun</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole5-color"
                                            value="Weiss"
                                            checked={sole5Color === "Weiss"}
                                            onChange={(e) => onSole5ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Weiss</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Validation message */}
                            {(!sole5Thickness || !sole5Color) && (
                                <p className="text-sm text-red-600">
                                    Bitte wählen Sie Sohlenstärke und Farbe aus.
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* Additional fields for sole id "6" */}
                    {selectedSole.id === "6" && (
                        <div className="border-t border-gray-200 pt-4 space-y-4">
                            {/* Sohlenstärke Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Sohlenstärke <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole6-thickness"
                                            value="4mm"
                                            checked={sole6Thickness === "4mm"}
                                            onChange={(e) => onSole6ThicknessChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">4mm</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole6-thickness"
                                            value="6mm"
                                            checked={sole6Thickness === "6mm"}
                                            onChange={(e) => onSole6ThicknessChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">6mm</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Color Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Farbe <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole6-color"
                                            value="Schwarz"
                                            checked={sole6Color === "Schwarz"}
                                            onChange={(e) => onSole6ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Schwarz</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole6-color"
                                            value="Dunkelbraun"
                                            checked={sole6Color === "Dunkelbraun"}
                                            onChange={(e) => onSole6ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Dunkelbraun</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sole6-color"
                                            value="Weiss"
                                            checked={sole6Color === "Weiss"}
                                            onChange={(e) => onSole6ColorChange?.(e.target.value)}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-base text-gray-700">Weiss</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Validation message */}
                            {(!sole6Thickness || !sole6Color) && (
                                <p className="text-sm text-red-600">
                                    Bitte wählen Sie Sohlenstärke und Farbe aus.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-gray-500 text-sm py-4">
                    Keine Sohle ausgewählt. Klicken Sie auf "Mehr ansehen" um eine Sohle auszuwählen.
                </div>
            )}
        </div>
    )
}

