'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductsManagement from '../_components/Product/ProductsManagement'
import MillingBlocks from '../_components/Product/MillingBlocks/MillingBlocks'

type UIType = 'Einlagenrohlinge' | 'Fräsblock'
type APIType = 'rady_insole' | 'milling_block'

export default function Lager() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const typeFromQuery = searchParams.get('type') as UIType | null
    
    const [selectedProductType, setSelectedProductType] = useState<UIType>(
        typeFromQuery && (typeFromQuery === 'Einlagenrohlinge' || typeFromQuery === 'Fräsblock')
            ? typeFromQuery
            : 'Einlagenrohlinge'
    )

    // Convert UI type to API type
    const apiType: APIType = useMemo(() => {
        return selectedProductType === 'Einlagenrohlinge' ? 'rady_insole' : 'milling_block'
    }, [selectedProductType])

    // Update query string when tab changes
    const handleTabChange = (type: UIType) => {
        setSelectedProductType(type)
        const params = new URLSearchParams(searchParams.toString())
        params.set('type', type)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    // Sync state with query parameter on mount and when query changes
    useEffect(() => {
        if (typeFromQuery && (typeFromQuery === 'Einlagenrohlinge' || typeFromQuery === 'Fräsblock')) {
            setSelectedProductType(typeFromQuery)
        }
    }, [typeFromQuery])

    return (
        <div className="w-full px-5">
            {/* Toggle Buttons */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => handleTabChange('Einlagenrohlinge')}
                    className={`px-6 cursor-pointer py-2 rounded-full font-medium transition-colors ${
                        selectedProductType === 'Einlagenrohlinge'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                    }`}
                >
                    Einlagenrohlinge
                </button>
                <button
                    onClick={() => handleTabChange('Fräsblock')}
                    className={`px-6 cursor-pointer py-2 rounded-full font-medium transition-colors ${
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
                <ProductsManagement type={apiType} />
            ) : (
                <MillingBlocks type={apiType} />
            )}
        </div>
    )
}
