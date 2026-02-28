'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = [
  'Alle',
  'Rechnungen',
  'Kostenvoranschläge',
  'Lieferscheine'
] as const

export type DokumentFilterTab = (typeof TABS)[number]

interface FilterTabButtonProps {
  defaultValue?: DokumentFilterTab
  value?: DokumentFilterTab
  onTabChange?: (tab: DokumentFilterTab) => void
  className?: string
}

export default function FilterTabButton({
  defaultValue = 'Alle',
  value: controlledValue,
  onTabChange,
  className,
}: FilterTabButtonProps) {
  const [internalValue, setInternalValue] = useState<DokumentFilterTab>(defaultValue)
  const isControlled = controlledValue !== undefined
  const activeTab = isControlled ? controlledValue : internalValue

  const handleClick = (tab: DokumentFilterTab) => {
    if (!isControlled) setInternalValue(tab)
    onTabChange?.(tab)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-6 border-b border-gray-200 bg-white',
        className
      )}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => handleClick(tab)}
            className={cn(
              'relative cursor-pointer whitespace-nowrap pb-3 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#62A17C] focus-visible:ring-offset-2',
              isActive
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {tab}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                aria-hidden
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
