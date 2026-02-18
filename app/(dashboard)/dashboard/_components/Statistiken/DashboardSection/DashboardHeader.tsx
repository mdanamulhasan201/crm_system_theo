'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useDashboard, PERIOD_OPTIONS } from '../dashboard-context'

const TABS = [
  'Allgemein',
  'Einlagencontrolling',
  'Mitarbeitercontrolling',
  'Lager-Orthopädie',
  'Kasse & Verkauf'
] as const

const TAB_ROUTES: Record<string, string> = {
  'Allgemein': '/dashboard/statistiken',
  'Einlagencontrolling': '/dashboard/statistiken/einlagencontrolling',
  'Mitarbeitercontrolling': '/dashboard/statistiken/mitarbeitercontrolling',
  'Lager-Orthopädie': '/dashboard/statistiken/lager-orthopadie',
  'Kasse & Verkauf': '/dashboard/statistiken/kasse-verkauf'
}

export default function DashboardHeader () {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<string>(TABS[0])
  const [periodOpen, setPeriodOpen] = useState(false)
  const { periodLabel, dateRangeLabel, setPeriodDays } = useDashboard()

  // Set active tab based on current pathname
  useEffect(() => {
    const currentTab = Object.entries(TAB_ROUTES).find(([_, route]) => 
      pathname === route || pathname?.startsWith(route + '/')
    )?.[0] || TABS[0]
    setActiveTab(currentTab)
  }, [pathname])

  return (
    <div className='my-6'>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-4 border p-4 rounded-lg border-gray-200 shadow-xs'>
        <div className='relative'>
          <button
            type='button'
            onClick={() => setPeriodOpen(!periodOpen)}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50'
          >
            <svg
              className='w-4 h-4 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            {periodLabel}
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {periodOpen && (
            <div className='absolute top-full left-0 mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]'>
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  type='button'
                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  onClick={() => {
                    setPeriodDays(opt.days)
                    setPeriodOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className='text-gray-600 text-sm'>Zeitraum: {dateRangeLabel}</p>
      </div>
      <div className='flex flex-wrap gap-2'>
        {TABS.map(tab => (
          <button
            key={tab}
            type='button'
            onClick={() => {
              const route = TAB_ROUTES[tab]
              if (route) {
                router.push(route)
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-green-900/90'
                : 'bg-green-900/80 hover:bg-green-900/90'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
