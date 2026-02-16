
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ReuseableCarousel from '../../ReuseableCarousel/ReuseableCarousel'
import Image from 'next/image'
import { getCustomersBySupplyStatusId } from '@/apis/versorgungApis'
import { useRouter } from 'next/navigation'

type TreatmentsCarriedOutProps = {
    customerId?: string
}

type SupplyStatusData = {
    supplyStatus: {
        id: string
        name: string
        price: number
        image: string
        description: string
    }
    order: {
        id: string
        orderNumber: number
        createdAt: string
        filiale: string | { address: string; description?: string }
        invoice?: string | null
    }
}

export default function TreatmentsCarriedOut({ customerId }: TreatmentsCarriedOutProps) {
    const [supplyStatusData, setSupplyStatusData] = useState<SupplyStatusData[]>([])
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRepeatTreatment = (orderId?: string) => {
        if (!customerId) return
        const path = orderId
            ? `/dashboard/scanning-data/${customerId}?orderId=${orderId}`
            : `/dashboard/scanning-data/${customerId}`
        router.push(path)
    }

    useEffect(() => {
        if (!customerId) return

        const fetchSupplyStatuses = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await getCustomersBySupplyStatusId(customerId, 1, 10)
                // Normalize the data to ensure filiale is always handled correctly
                const normalizedData = (response?.data ?? []).map((item: any) => ({
                    ...item,
                    order: {
                        ...item.order,
                        // Keep filiale as-is for now, we'll handle it in useMemo
                        filiale: item.order?.filiale
                    }
                }))
                setSupplyStatusData(normalizedData)
            } catch (err) {
                setError('Fehler beim Laden der Versorgungen')
                setSupplyStatusData([])
            } finally {
                setLoading(false)
            }
        }

        fetchSupplyStatuses()
    }, [customerId])

    const cardData = useMemo(() => {
        if (!supplyStatusData.length) return []

        return supplyStatusData.map((item) => {
            const formattedDate = item.order?.createdAt
                ? new Date(item.order.createdAt).toLocaleDateString('de-DE')
                : '-'
            const filiale = item.order?.filiale
            let storeLabel: string = '–'
            if (typeof filiale === 'string') {
                storeLabel = filiale
            } else if (filiale && typeof filiale === 'object' && filiale !== null) {
                storeLabel = String(filiale.address || filiale.description || '–')
            }

            return {
                order: {
                    ...item.order,
                    // Remove filiale object to prevent rendering issues
                    filiale: undefined
                },
                supplyStatus: item.supplyStatus,
                title: item.supplyStatus?.name || 'Versorgung',
                storeLabel,
                formattedDate,
            }
        })
    }, [supplyStatusData])

    const renderCard = (item: (typeof cardData)[number], keyPrefix: string) => (
        <div
            key={`${keyPrefix}-${item.order.id}`}
            className="w-full h-full p-4 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
            <div className="relative w-full h-48 bg-[#f5f5f5] rounded-xl overflow-hidden">
                {item.supplyStatus?.image ? (
                    <Image
                        src={item.supplyStatus.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 300px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">Kein Bild verfügbar</span>
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900 break-words">{item.title}</h3>
                <p className="text-sm text-gray-600">Erstellt am {item.formattedDate}</p>
                <p className="text-sm text-gray-600">Bestellnummer: {item.order.orderNumber ?? '–'}</p>
                <p className="text-sm text-gray-600">Filiale: {item.storeLabel}</p>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
                {item.order.invoice ? (
                    <a
                        href={item.order.invoice}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#5C6AC4] underline font-medium cursor-pointer"
                    >
                        Auftragszettel
                    </a>
                ) : (
                    <span className="text-sm text-gray-400">Kein Auftragszettel verfügbar</span>
                )}
                <button
                    onClick={() => handleRepeatTreatment(item.order.id)}
                    type="button"
                    className="py-2 px-4 rounded-full bg-[#61A07B] text-white text-sm font-semibold hover:bg-[#528c68] transition-colors cursor-pointer"
                >
                    Versorgung wiederholen
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col gap-4 mt-10">
            <h1 className="text-2xl font-bold">DURCHGEFÜHRTE VERSORGUNGEN</h1>

            {loading && <div className="text-sm text-gray-500">Versorgungen werden geladen...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}

            {!loading && !supplyStatusData.length && !error && (
                <div className="text-sm text-gray-500">Keine Versorgungen gefunden.</div>
            )}

            {cardData.length > 0 && (
                <>
                    {/* Mobile stacked layout */}
                    <div className="flex flex-col gap-4 sm:hidden">
                        {cardData.map((item) => renderCard(item, 'mobile'))}
                    </div>

                    {/* Carousel for >=640px */}
                    <div className="hidden sm:block">
                        <ReuseableCarousel
                            slides={cardData.map((item) => renderCard(item, 'desktop'))}
                            options={{
                                loop: true,
                                align: 'start',
                                slidesToScroll: 1,
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
