'use client'
import React from 'react'
import { Phone, CheckCircle2 } from 'lucide-react'

export default function Hotline() {
    const handleEmergencyCall = () => {
        // Open WhatsApp with the phone number
        window.open('https://wa.me/393665087742', '_blank')
    }

    return (
        <div className="w-full space-y-4">
            {/* Hotline and System Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Hotline */}
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 shrink-0" />
                        <div>
                            <span className="text-sm font-medium">Hotline</span>
                            <div className="text-base font-semibold">+39 366 508 7742</div>
                        </div>
                    </div>

                    {/* Right: System Status */}
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="text-sm font-medium">System läuft stabil</span>
                    </div>
                </div>
            </div>

            {/* Opening Hours Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                    Öffnungszeiten
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-gray-700">Montag - Freitag:</span>
                        <span className="text-sm md:text-base font-medium text-gray-800">08:00 - 18:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-gray-700">Samstag:</span>
                        <span className="text-sm md:text-base font-medium text-gray-800">09:00 - 14:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-gray-700">Sonntag:</span>
                        <span className="text-sm md:text-base font-medium text-gray-800">Geschlossen</span>
                    </div>
                </div>
            </div>

            {/* Emergency Support Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                    Notfall-Support
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                    Bei kritischen Systemausfällen außerhalb der Geschäftszeiten.
                </p>
                <button
                    onClick={handleEmergencyCall}
                    className="w-full px-6 py-3 border border-gray-300 cursor-pointer text-gray-800 font-medium rounded-lg transition-colors text-sm md:text-base"
                >
                    Notfall-Hotline anrufen
                </button>
            </div>
        </div>
    )
}
