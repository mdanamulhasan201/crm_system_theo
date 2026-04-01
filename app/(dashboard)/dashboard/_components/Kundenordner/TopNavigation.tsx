'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import { useMemo } from 'react'

type Tab = 'übersicht' | 'rezepte' | 'dokumente'

function tabFromPathname(pathname: string | null): Tab {
    if (!pathname) return 'übersicht'
    if (pathname.includes('/rezepte')) return 'rezepte'
    if (pathname.includes('/dokumente')) return 'dokumente'
    return 'übersicht'
}

interface TopNavigationProps {
    /** Optional override; normally derived from the URL */
    activeTab?: Tab
}

export default function TopNavigation({ activeTab: activeTabProp }: TopNavigationProps) {
    const router = useRouter()
    const params = useParams()
    const pathname = usePathname()
    const customerId = params?.id as string

    const activeTab = useMemo(() => {
        return activeTabProp ?? tabFromPathname(pathname)
    }, [activeTabProp, pathname])

    const handleUbersichtClick = () => {
        if (customerId) {
            router.push(`/dashboard/kundenordner/${customerId}`)
        }
    }

    const handleRezepteClick = () => {
        if (customerId) {
            router.push(`/dashboard/kundenordner/${customerId}/rezepte`)
        }
    }

    const handleDokumenteClick = () => {
        if (customerId) {
            router.push(`/dashboard/kundenordner/${customerId}/dokumente`)
        }
    }

    const tabClass = (isActive: boolean) =>
        `text-lg font-medium pb-2 cursor-pointer px-2 ${
            isActive
                ? 'border-b-2 border-[#61A07B] text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
        }`

    return (
        <div className="flex w-full flex-wrap items-center justify-start gap-6 border-b pb-4">
            <button type="button" onClick={handleUbersichtClick} className={tabClass(activeTab === 'übersicht')}>
                Übersicht
            </button>
            <button type="button" onClick={handleRezepteClick} className={tabClass(activeTab === 'rezepte')}>
                Rezepte
            </button>
            <button type="button" onClick={handleDokumenteClick} className={tabClass(activeTab === 'dokumente')}>
                Dokumente
            </button>
        </div>
    )
}
