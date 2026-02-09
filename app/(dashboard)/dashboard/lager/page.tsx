'use client'

import { useState } from 'react'
import ProductsManagement from '../_components/Product/ProductsManagement'
import MillingBlocks from '../_components/Product/MillingBlocks/MillingBlocks'

export default function Lager() {
    const [selectedProductType, setSelectedProductType] = useState<'Einlagenrohlinge' | 'Fräsblock'>('Einlagenrohlinge')
    return (
        <div className="w-full px-5">
            {/* Toggle Buttons */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setSelectedProductType('Einlagenrohlinge')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                        selectedProductType === 'Einlagenrohlinge'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                    }`}
                >
                    Einlagenrohlinge
                </button>
                <button
                    onClick={() => setSelectedProductType('Fräsblock')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                        selectedProductType === 'Fräsblock'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                    }`}
                >
                    Fräsblock
                </button>
            </div>

            {/* Conditionally render components based on selected type */}
            {selectedProductType === 'Einlagenrohlinge' ? (
                <ProductsManagement />
            ) : (
                <MillingBlocks />
            )}
        </div>
    )
}
