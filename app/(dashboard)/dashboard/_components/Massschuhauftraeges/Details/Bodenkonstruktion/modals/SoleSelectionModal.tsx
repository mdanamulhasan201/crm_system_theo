import React from "react"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"

interface SoleSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    soleOptions: SoleType[]
    selectedSole: SoleType | null
    onSelectSole: (sole: SoleType) => void
    onShowDetail: (sole: SoleType) => void
}

export default function SoleSelectionModal({
    isOpen,
    onClose,
    soleOptions,
    selectedSole,
    onSelectSole,
    onShowDetail,
}: SoleSelectionModalProps) {
    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Sohlen-Konfigurator</h2>
                        <p className="text-sm text-gray-600 mt-1">Wählen Sie die perfekte Sohle für Ihre Schuhe</p>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {soleOptions.map((sole) => (
                            <div
                                key={sole.id}
                                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedSole?.id === sole.id
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                    onSelectSole(sole)
                                    onClose()
                                }}
                            >
                                <div className="absolute top-2 right-2">
                                    <button
                                        className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-orange-600"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onShowDetail(sole)
                                        }}
                                    >
                                        ?
                                    </button>
                                </div>
                                <div className="flex flex-col items-center">
                                    <img
                                        src={sole.image}
                                        alt={sole.name}
                                        className="w-32 h-32 object-contain mb-3"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={selectedSole?.id === sole.id}
                                            onChange={(e) => {
                                                e.stopPropagation()
                                                onSelectSole(sole)
                                                onClose()
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 text-green-500 cursor-pointer"
                                        />
                                        <label 
                                            className="text-sm font-medium text-gray-700 cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {sole.name}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

