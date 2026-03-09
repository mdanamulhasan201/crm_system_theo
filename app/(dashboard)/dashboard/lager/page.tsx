'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductsManagement from '../_components/Product/ProductsManagement'
import MillingBlocks from '../_components/Product/MillingBlocks/MillingBlocks'
import SonstigesData from '../_components/Product/SonstigesData/SonstigesData'
import BestellubersichtTable from '../_components/Product/Bestellubersicht/BestellubersichtTable'
import StatisticDeadStock from '../_components/Product/Bestellubersicht/StatisticDeadStock'
import VerfugbareProdukte from '../_components/Product/Bestellubersicht/VerfugbareProdukte'

type UIType = 'Einlagenrohlinge' | 'Fräsblock' | 'Sonstiges'
type APIType = 'rady_insole' | 'milling_block'

export default function Lager() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const typeFromQuery = searchParams.get('type') as UIType | null

    const [selectedProductType, setSelectedProductType] = useState<UIType>(
        typeFromQuery && (typeFromQuery === 'Einlagenrohlinge' || typeFromQuery === 'Fräsblock' || typeFromQuery === 'Sonstiges')
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
        if (typeFromQuery && (typeFromQuery === 'Einlagenrohlinge' || typeFromQuery === 'Fräsblock' || typeFromQuery === 'Sonstiges')) {
            setSelectedProductType(typeFromQuery)
        }
    }, [typeFromQuery])

    return (
        <div className="w-full max-w-[100vw] px-3 sm:px-4 md:px-5 overflow-x-hidden">
            {/* Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                    onClick={() => handleTabChange('Einlagenrohlinge')}
                    className={`px-6 cursor-pointer py-2 rounded-full font-medium transition-colors ${selectedProductType === 'Einlagenrohlinge'
                        ? 'bg-[#61A178] text-white'
                        : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                        }`}
                >
                    Einlagenrohlinge
                </button>
                <button
                    onClick={() => handleTabChange('Fräsblock')}
                    className={`px-6 cursor-pointer py-2 rounded-full font-medium transition-colors ${selectedProductType === 'Fräsblock'
                        ? 'bg-[#61A178] text-white'
                        : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                        }`}
                >
                    Fräsblock
                </button>
                <button
                    onClick={() => handleTabChange('Sonstiges')}
                    className={`px-6 cursor-pointer py-2 rounded-full font-medium transition-colors ${selectedProductType === 'Sonstiges'
                        ? 'bg-[#61A178] text-white'
                        : 'bg-[#E8F5E9] text-gray-700 hover:bg-[#C8E6C9]'
                        }`}
                >
                    Sonstiges
                </button>
            </div>

            {/* Conditionally render components based on selected type */}
            {selectedProductType === 'Einlagenrohlinge' ? (
                <ProductsManagement type={apiType} />
            ) : selectedProductType === 'Fräsblock' ? (
                <MillingBlocks type={apiType} />
            ) : selectedProductType === 'Sonstiges' ? (
                <SonstigesData />
            ) : null}




            <div className="w-full border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
                    Bestellübersicht
                </h2>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                    Alle Einlagenbestellungen von der Erstellung bis zur Lieferung zentral verfolgen und verwalten.
                </p>

                {/* Bestellübersicht + Statistic Dead Stock + Verfügbare Produkte — responsive, equal height on lg+ */}
                <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-3 lg:items-stretch">
                    <div className="lg:col-span-2 min-h-0 flex flex-col w-full min-w-0">
                        <BestellubersichtTable />
                    </div>
                    <div className="flex flex-col gap-4 min-h-0 w-full min-w-0">
                        <div className="flex-1 min-h-0 min-w-0">
                            <StatisticDeadStock />
                        </div>
                        <div className="flex-1 min-h-0 min-w-0">
                            <VerfugbareProdukte />
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
