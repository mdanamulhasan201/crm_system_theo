import React from "react"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import { FaArrowRight } from "react-icons/fa"

interface SoleSelectionSectionProps {
    selectedSole: SoleType | null
    onOpenModal: () => void
}

export default function SoleSelectionSection({ selectedSole, onOpenModal }: SoleSelectionSectionProps) {
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
                <div className="flex items-center gap-4">
                    <img 
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
            ) : (
                <div className="text-gray-500 text-sm py-4">
                    Keine Sohle ausgewählt. Klicken Sie auf "Mehr ansehen" um eine Sohle auszuwählen.
                </div>
            )}
        </div>
    )
}

