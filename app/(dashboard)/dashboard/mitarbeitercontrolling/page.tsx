import React from 'react'
import { TbUsers } from 'react-icons/tb'

export default function Mitarbeitercontrolling() {
    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#E9F5EF] mb-6 shadow-sm">
                    <TbUsers className="w-12 h-12 text-[#61A175]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Mitarbeitercontrolling – Coming Soon!</h1>
                <p className="text-gray-600 mb-6 max-w-md">
                    Wir arbeiten gerade daran, das Mitarbeitercontrolling für euch bereitzustellen.<br />
                    Schon bald könnt ihr hier Mitarbeitercontrolling verwalten und bearbeiten!
                </p>
            </div>
        </div>
    )
}
