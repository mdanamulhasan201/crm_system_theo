'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IoSearch } from 'react-icons/io5'
import ProductsManagement from '../_components/Product/ProductsManagement'
import MillingBlocks from '../_components/Product/MillingBlocks/MillingBlocks'
import SonstigesData from '../_components/Product/SonstigesData/SonstigesData'
import BestellubersichtTable from '../_components/Product/Bestellubersicht/BestellubersichtTable'
import StatisticDeadStock from '../_components/Product/Bestellubersicht/StatisticDeadStock'
import VerfugbareProdukte from '../_components/Product/Bestellubersicht/VerfugbareProdukte'
import LagerChart from '@/components/LagerChart/LagerChart'
import PerformerData from '@/components/LagerChart/PerformerData'

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

    const [productCount, setProductCount] = useState(0)
    const [openAddModalFor, setOpenAddModalFor] = useState<UIType | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const apiType: APIType = useMemo(() => {
        return selectedProductType === 'Einlagenrohlinge' ? 'rady_insole' : 'milling_block'
    }, [selectedProductType])

    const handleTabChange = (type: UIType) => {
        setSelectedProductType(type)
        const params = new URLSearchParams(searchParams.toString())
        params.set('type', type)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    useEffect(() => {
        if (typeFromQuery && (typeFromQuery === 'Einlagenrohlinge' || typeFromQuery === 'Fräsblock' || typeFromQuery === 'Sonstiges')) {
            setSelectedProductType(typeFromQuery)
        }
    }, [typeFromQuery])

    const handleFeetF1rst = () => {
        const type = selectedProductType === 'Einlagenrohlinge' ? 'rady_insole' : 'milling_block'
        router.push(`/dashboard/buy-storage?type=${type}`)
    }

    return (
        <div className="w-full max-w-[100vw] px-3 sm:px-4 md:px-5 overflow-x-hidden">
            {/* Title section – top: title + count (left), search (right) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Produktverwaltung</h1>
                    <p className="text-sm text-gray-500 mt-1">{productCount} Produkte gefunden</p>
                </div>
                <div className="relative w-full sm:w-64 shrink-0">
                    <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                    <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 w-full rounded bg-gray-50/80 text-gray-700 placeholder:text-gray-400 border border-gray-200 pl-11 pr-5 py-2.5 focus-visible:ring-2 focus-visible:ring-gray-300/50 focus-visible:border-gray-300 focus:outline-none"
                    />
                </div>
            </div>

            {/* Row: 3 tabs (left) + 2 buttons (right) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleTabChange('Einlagenrohlinge')}
                        className={`px-4 cursor-pointer py-2 rounded font-medium transition-colors ${selectedProductType === 'Einlagenrohlinge'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-[#C8E6C9]'
                            }`}
                    >
                        Einlagenrohlinge
                    </button>
                    <button
                        onClick={() => handleTabChange('Fräsblock')}
                        className={`px-4 cursor-pointer py-2 rounded font-medium transition-colors ${selectedProductType === 'Fräsblock'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-[#C8E6C9]'
                            }`}
                    >
                        Fräsblock
                    </button>
                    <button
                        onClick={() => handleTabChange('Sonstiges')}
                        className={`px-4 cursor-pointer py-2 rounded font-medium transition-colors ${selectedProductType === 'Sonstiges'
                            ? 'bg-[#61A178] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-[#C8E6C9]'
                            }`}
                    >
                        Sonstiges
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {selectedProductType === 'Sonstiges' ? (
                        <Button
                            onClick={() => setOpenAddModalFor('Sonstiges')}
                            className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                        >
                            Erstellen
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => setOpenAddModalFor(selectedProductType)}
                                className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                            >
                                Manuelles Lager hinzufügen
                            </Button>
                            <Button
                                onClick={handleFeetF1rst}
                                className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer"
                            >
                                FeetF1rst Sortiment
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content: table (with search inside each component) */}
            {selectedProductType === 'Einlagenrohlinge' ? (
                <ProductsManagement
                    type={apiType}
                    setProductCount={setProductCount}
                    openAddModal={openAddModalFor === 'Einlagenrohlinge'}
                    onCloseAddModal={() => setOpenAddModalFor(null)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            ) : selectedProductType === 'Fräsblock' ? (
                <MillingBlocks
                    type={apiType}
                    setProductCount={setProductCount}
                    openAddModal={openAddModalFor === 'Fräsblock'}
                    onCloseAddModal={() => setOpenAddModalFor(null)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            ) : selectedProductType === 'Sonstiges' ? (
                <SonstigesData
                    setProductCount={setProductCount}
                    openAddModal={openAddModalFor === 'Sonstiges'}
                    onCloseAddModal={() => setOpenAddModalFor(null)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            ) : null}


            {/* Chart */}
            <div className='flex flex-col xl:flex-row gap-4 lg:gap-6 items-stretch lg:items-start justify-center mt-14'>
                <div className='w-full lg:flex-1'>
                    <LagerChart />
                </div>
                <div className='w-full lg:flex-1'>
                    <PerformerData />
                </div>
            </div>

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
