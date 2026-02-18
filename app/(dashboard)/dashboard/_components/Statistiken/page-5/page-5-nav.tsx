'use client'

import { PAGE5_NAV_TABS, type Page5NavTab } from '../data/page-5-data'

type Page5NavProps = {
  active: Page5NavTab
  onSelect: (tab: Page5NavTab) => void
}

export default function Page5Nav ({ active, onSelect }: Page5NavProps) {
  return (
    <nav
      className='flex flex-wrap gap-1 mt-6 p-1.5 rounded-lg bg-gray-100 justify-center'
      aria-label='Bereiche'
    >
      {PAGE5_NAV_TABS.map(tab => (
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
