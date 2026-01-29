import React from "react"
import type { SoleType } from "@/hooks/massschuhe/useSoleData"
import Image from "next/image"

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
                className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 pr-2">{sole.name}</h2>
                    <button
                        className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl shrink-0"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 min-h-0">
                    <div className="p-4 sm:p-6 flex justify-center">
                        <Image
                            width={200}
                            height={200}
                            src={sole.image}
                            alt={sole.name}
                            className="w-auto h-auto max-w-[200px] object-contain"
                        />
                    </div>
                    <div className="p-4 sm:p-6">
                        <p className="text-gray-700 leading-relaxed">{sole.description}</p>
                    </div>
                </div>
                <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end shrink-0">
                    <button
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 font-medium"
                        onClick={onClose}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    )
}

