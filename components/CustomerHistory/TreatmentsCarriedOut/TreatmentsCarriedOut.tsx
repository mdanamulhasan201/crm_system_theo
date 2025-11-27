
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ReuseableCarousel from '../../ReuseableCarousel/ReuseableCarousel'
import Image from 'next/image'
import img1 from "@/public/images/customerHistory/1.png"
import img2 from "@/public/images/customerHistory/2.png"
import img3 from "@/public/images/customerHistory/3.png"
import img4 from "@/public/images/customerHistory/4.png"
import { getCustomerOrdersByCustomerId } from '@/apis/productsOrder'
import { useRouter } from 'next/navigation'

type TreatmentsCarriedOutProps = {
    customerId?: string
}

type CustomerOrder = {
    id: string
    orderNumber?: number
    createdAt?: string
    store?: { name?: string }
    storeId?: string
    invoice?: string | null
    einlagentyp?: string | null
    product?: { name?: string | null }
    werkstattzettel?: { geschaeftsstandort?: string | null }
}

const staticImages = [img1, img2, img3, img4]

export default function TreatmentsCarriedOut({ customerId }: TreatmentsCarriedOutProps) {
    const [orders, setOrders] = useState<CustomerOrder[]>([])
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRepeatTreatment = () => {
        router.push(`/dashboard/scanning-data/${customerId}`)
    }

    useEffect(() => {
        if (!customerId) return

        const fetchOrders = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await getCustomerOrdersByCustomerId(customerId, 1, 10)
                setOrders(response?.data ?? [])
            } catch (err) {
                setError('Fehler beim Laden der Versorgungen')
                setOrders([])
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [customerId])

    const cardData = useMemo(() => {
        if (!orders.length) return []

        return orders.map((order, index) => {
            const image = staticImages[index % staticImages.length]
            const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('de-DE')
                : '-'
            const storeLabel =
                order.werkstattzettel?.geschaeftsstandort ||
                order.store?.name ||
                '–'

            return {
                order,
                title: order.einlagentyp || order.product?.name || 'Versorgung',
                storeLabel,
                formattedDate,
                image,
            }
        })
    }, [orders])

    const renderCard = (item: (typeof cardData)[number], keyPrefix: string) => (
        <div
            key={`${keyPrefix}-${item.order.id}`}
            className="w-full h-full p-4 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
            <div className="relative w-full h-48 bg-[#f5f5f5] rounded-xl overflow-hidden">
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 640px) 100vw, 300px"
                />
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
                    onClick={handleRepeatTreatment}
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

            {!loading && !orders.length && !error && (
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
