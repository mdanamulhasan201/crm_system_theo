'use client'

import { PAGE4_NAV_TABS, type Page4NavTab } from '../data/page-4-data'

type Page4NavProps = {
  active: Page4NavTab
  onSelect: (tab: Page4NavTab) => void
}

export default function Page4Nav ({ active, onSelect }: Page4NavProps) {
  return (
    <nav
      className='flex flex-wrap gap-1 mt-6 p-1.5 rounded-lg bg-gray-100 justify-center'
      aria-label='Bereiche'
    >
      {PAGE4_NAV_TABS.map(tab => (
        <button
          key={tab}
          type='button'
          onClick={() => onSelect(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            active === tab
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}
