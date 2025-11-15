import React from 'react'
import { HiOutlineUserPlus } from 'react-icons/hi2';

export default function Neukundenerstellung() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#E9F5EF] mb-6 shadow-sm">
                <HiOutlineUserPlus className="w-12 h-12 text-[#61A175]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Neukundenerstellung – Coming Soon!</h1>
            <p className="text-gray-600 mb-6 max-w-md">
                Wir arbeiten gerade daran, die Neukundenerstellung für euch bereitzustellen.<br />
                Schon bald könnt ihr hier neue Kunden anlegen und verwalten!
            </p>
            <span className="inline-block px-4 py-1 text-sm bg-[#e0e8df] text-[#61A175] rounded-full font-semibold">
                In Entwicklung
            </span>
        </div>
    );
}
