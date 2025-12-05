'use client'

export default function TopNavigation() {
    return (
        <div className='flex items-center gap-6 border-b pb-4'>
            <button className='text-lg font-medium border-b-2 border-blue-600 pb-2 px-2'>
                Übersicht
            </button>
            <button className='text-lg font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                Rezept scannen
            </button>
            <button className='text-lg font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                KV erstellen
            </button>
            <button className='text-lg font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                Versenden
            </button>
            <div className='flex-1' />
            <button className='text-lg font-medium border-b-2 border-blue-600 pb-2 px-2'>
                Dokumente
            </button>
        </div>
    )
}
