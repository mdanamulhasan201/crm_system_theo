import React from "react"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"

interface SoleDetailModalProps {
    isOpen: boolean
    onClose: () => void
    sole: SoleType | null
}

export default function SoleDetailModal({ isOpen, onClose, sole }: SoleDetailModalProps) {
    if (!isOpen || !sole) return null

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl w-full max-w-md" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{sole.name}</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">{sole.description}</p>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                        onClick={onClose}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    )
}

