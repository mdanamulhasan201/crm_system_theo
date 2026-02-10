'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import legs from '@/public/Kunden/leg.png'
import { useRouter } from 'next/navigation'

export default function LeistenDigitalGenerieren() {
    const router = useRouter()
    const handleGenerate = () => {
        router.push('/dashboard/leistenkonfigurator')
    }

    return (
        <div className="w-full bg-white p-6 md:p-8 lg:p-10 border-t border-gray-200 mt-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
                {/* Left Side - Text Content */}
                <div className="flex-1 space-y-2 ">
                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-gray-800 ">
                        Leistenerstellung von morgen
                    </h2>

                    {/* Description Paragraph 1 */}
                    <p className="text-base  text-gray-600 ">
                        Der Leisten entsteht direkt aus deinem 3D-Scan.
                    </p>
                    <p className="text-base  text-gray-600 ">
                        Vollständig digital. Präzise. Reproduzierbar.
                    </p>

                    {/* Description Paragraph 2 */}
                    <p className="text-sm md:text-base text-gray-400 ">
                        Verfügbar ausschließlich für freigeschaltete Kunden mit aktivem FeetFirst 3D-Scanner.
                    </p>

                    {/* Status and Button Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <span className="text-sm md:text-base text-gray-700 font-normal">
                                Digitale Leistenerstellung aktiv
                            </span>
                        </div>

                        {/* Action Button - Light Gray */}
                        <Button
                            onClick={handleGenerate}
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 font-normal px-5 py-2 rounded-md transition-colors cursor-pointer"
                        >
                            Leisten digital generieren
                        </Button>
                    </div>
                </div>

                {/* Right Side - Foot Graphic */}
                <div className="flex-shrink-0  w-full lg:w-auto lg:max-w-md">
                <div className=" w-full h-auto">
                                <div className=" z-10">
                                    <Image
                                        src={legs}
                                        alt="3D Scan Foot"
                                        className="w-full h-auto object-contain"
                                        priority
                                    />
                                </div>
                             
                            </div>
                </div>
            </div>
        </div>
    )
}
