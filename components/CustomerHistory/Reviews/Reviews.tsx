import React from 'react'
import ReuseableCarousel from '../../ReuseableCarousel/ReuseableCarousel'
import Image from 'next/image'
import img1 from "@/public/images/review/shoes1.png"
import img2 from "@/public/images/review/shoes2.png"
import img3 from "@/public/images/review/shoes3.png"
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from 'react-icons/io'
import { Star } from 'lucide-react'
import EmptyState from '@/app/(dashboard)/dashboard/_components/CustomerHistory/EmptyState'

export default function Reviews() {
    const shoeData = [
        {
            id: 1,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: img1,
            start: 4.5,
        },
        {
            id: 2,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: img2,
            start: 3.5,
        },
        {
            id: 3,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: img3,
            start: 5,
        },
        {
            id: 4,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: img1,
            start: 2,
        },
        {
            id: 5,
            name: 'Dynafit',
            modelNr: 'BJFS0R5677B',
            type: 'Laufschuhe - Herren',
            size: 'Größe 45',
            image: img2,
            start: 3,
        },
    ]

    if (shoeData.length === 0) {
        return (
            <EmptyState
                icon={<Star className="w-8 h-8 text-gray-400" strokeWidth={2} />}
                title="Keine Bewertungen vorhanden"
                subtitle="Hier werden zukünftige Bewertungen angezeigt."
            />
        )
    }

    const slides = shoeData.map((shoe) => (
        <div key={shoe.id} className="p-3 flex flex-col gap-2 rounded-md">
            {/* Image */}
            <div className="relative w-full h-40 rounded-md bg-[#D9D9D9] overflow-hidden">
                <Image
                    src={shoe.image}
                    alt={`${shoe.name} ${shoe.modelNr}`}
                    fill
                    className="object-contain"
                />
            </div>

            {/* Text Content */}
            <div className="mt-4 space-y-1">
                <h3 className="text-md font-bold">{shoe.name}</h3>
                <p className="text-sm text-gray-700">{shoe.type}</p>
                <p className="text-sm text-gray-700">Gekauft am 14.02.2025</p>
            </div>

            {/* Star rating + dropdown */}
            <div className="mt-2 flex items-center justify-between">
                {/* Star rating */}
                <div className="flex items-center text-[#62A07C] text-lg">
                    {Array.from({ length: 5 }).map((_, index) => {
                        const full = index < Math.floor(shoe.start);
                        const half = shoe.start % 1 !== 0 && index === Math.floor(shoe.start);
                        return (
                            <span key={index}>
                                {full ? <IoIosStar /> : half ? <IoIosStarHalf /> : <IoIosStarOutline />}
                            </span>
                        );
                    })}
                </div>

                {/* Dropdown button */}
                <div>
                    <button className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300 rounded shadow-sm">
                        Nachricht
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M7 10l5 5 5-5H7z" />
                        </svg>
                    </button>
                </div>
            </div>

        </div>

    ))

    return (
        <div className="flex flex-col gap-4 mt-10">
            <h1 className="text-2xl font-bold"> BEWERTUNGEN</h1>
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
