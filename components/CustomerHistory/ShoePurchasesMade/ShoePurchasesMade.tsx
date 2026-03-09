import React from 'react'
import ReuseableCarousel from '../../ReuseableCarousel/ReuseableCarousel'
import Image from 'next/image'
import shoesImg from "@/public/images/Favorite/shoes.png"
import { ShoppingBag } from 'lucide-react'
import EmptyState from '@/app/(dashboard)/dashboard/_components/CustomerHistory/EmptyState'

export default function ShoePurchasesMade() {
    const shoeData = [
        {
            id: 1,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: shoesImg,
        },
        {
            id: 2,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: shoesImg,
        },
        {
            id: 3,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: shoesImg,
        },
        {
            id: 4,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: shoesImg,
        },
        {
            id: 5,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: shoesImg,
        },
    ]

    if (shoeData.length === 0) {
        return (
            <EmptyState
                icon={<ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={2} />}
                title="Keine Schuhkäufe vorhanden"
                subtitle="Hier werden zukünftige Schuhkäufe angezeigt."
            />
        )
    }

    const slides = shoeData.map((shoe) => (
        <div key={shoe.id} className="p-3 flex flex-col gap-2 rounded-md">
            <div className="relative w-full h-48 bg-[#D9D9D9] rounded-xl overflow-hidden">
                <Image
                    src={shoe.image}
                    alt={`${shoe.name} ${shoe.modelNr}`}
                    fill
                    className="object-contain"
                />
            </div>
            <div>
                <h3 className="text-lg font-bold">{shoe.name}</h3>
                <p className="text-sm text-gray-600">Modell Nr: {shoe.modelNr}</p>
                <p className="text-sm text-gray-600">{shoe.type}</p>
                <p className="text-sm text-gray-600">{shoe.size}</p>
            </div>

        </div>
    ))

    return (
        <div className="flex flex-col gap-4 mt-10">
            <h1 className="text-2xl font-bold">  DURCHGEFÜHRTE SCHUHKÄUFE</h1>
            <ReuseableCarousel
                slides={slides}
                options={{
                    loop: true,
                    align: 'start',
                    slidesToScroll: 1,
                }}
            />

          
        </div>
    )
}
