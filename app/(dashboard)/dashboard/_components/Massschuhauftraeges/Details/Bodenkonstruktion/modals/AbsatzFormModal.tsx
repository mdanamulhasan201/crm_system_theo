import React from "react"
import Image from "next/image"

// images\massschuhauftraege
import Absatzkeil from "@/public/images/massschuhauftraege/absatzkeil.png"
import keilabsatz from "@/public/images/massschuhauftraege/keilabsatz.png"
import stegkeil from "@/public/images/massschuhauftraege/stegkeil.png"

interface AbsatzFormModalProps {
    isOpen: boolean
    onClose: () => void
    selectedForm: string | null
}

const FORM_TITLES: Record<string, string> = {
    Keilabsatz: "Keilabsatz",
    Stegkeil: "Stegkeil",
    Absatzkeil: "Absatzkeil",
}

const FORM_IMAGES: Record<string, any> = {
    Keilabsatz: keilabsatz,
    Stegkeil: stegkeil,
    Absatzkeil: Absatzkeil,
}

export default function AbsatzFormModal({ isOpen, onClose, selectedForm }: AbsatzFormModalProps) {
    if (!isOpen || !selectedForm) return null

    const selectedImage = FORM_IMAGES[selectedForm]

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1002] p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {FORM_TITLES[selectedForm] || selectedForm}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Absatz Form Darstellung</p>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center justify-center">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt={selectedForm}
                                className="w-full max-w-md h-auto object-contain"
                                width={800}
                                height={600}
                            />
                        ) : (
                            <Image
                                src="/shoe.png"
                                alt={selectedForm}
                                className="w-full max-w-md h-auto object-contain"
                                width={800}
                                height={600}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

