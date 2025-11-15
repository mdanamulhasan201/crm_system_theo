import React from 'react'
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';

export default function Einlagenauftraege() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#E9F5EF] mb-6 shadow-sm">
                <HiOutlineClipboardDocumentList className="w-12 h-12 text-[#61A175]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Einlagenaufträge – Coming Soon!</h1>
            <p className="text-gray-600 mb-6 max-w-md">
                Wir arbeiten gerade daran, die Einlagenaufträge für euch bereitzustellen.<br />
                Schon bald könnt ihr hier Einlagenaufträge verwalten und bearbeiten!
            </p>
            <span className="inline-block px-4 py-1 text-sm bg-[#e0e8df] text-[#61A175] rounded-full font-semibold">
                In Entwicklung
            </span>
        </div>
    );
}
