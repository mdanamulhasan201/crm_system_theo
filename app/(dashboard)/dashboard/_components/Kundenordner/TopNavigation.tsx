'use client'

import { useRouter, useParams } from 'next/navigation'

interface TopNavigationProps {
    activeTab?: 'übersicht' | 'rezepte' | 'kv' | 'versenden' | 'dokumente'
}

export default function TopNavigation({ activeTab = 'dokumente' }: TopNavigationProps) {
    const router = useRouter()
    const params = useParams()
    const customerId = params?.id as string

    const handleRezepteClick = () => {
        if (customerId) {
            router.push(`/dashboard/kundenordner/${customerId}/rezepte`)
        }
    }

    const handleUbersichtClick = () => {
        if (customerId) {
            router.push(`/dashboard/kundenordner/${customerId}`)
        }
    }

    return (
        <div className='flex items-center gap-6 border-b pb-4'>
            <button 
                onClick={handleUbersichtClick}
                className={`text-lg font-medium pb-2 cursor-pointer px-2 ${
                    activeTab === 'übersicht' 
                        ? 'border-b-2 border-blue-600 text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Übersicht
            </button>
            <button 
                onClick={handleRezepteClick}
                className={`text-lg cursor-pointer font-medium pb-2 px-2 ${
                    activeTab === 'rezepte' 
                        ? 'border-b-2 border-blue-600 text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Rezepte
            </button>
            <button className='text-lg cursor-pointer font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                KV erstellen
            </button>
            <button className='text-lg cursor-pointer font-medium text-gray-600 hover:text-gray-900 pb-2 px-2'>
                Versenden
            </button>
            <div className='flex-1' />
            <button className={`text-lg cursor-pointer font-medium pb-2 px-2 ${
                activeTab === 'dokumente' 
                    ? 'border-b-2 border-blue-600 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
            }`}>
                Dokumente
            </button>
        </div>
    )
}
