'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DocumentSearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
  inputClassName?: string
}

export default function DocumentSearchBar({
  placeholder = 'Suche nach Nr., Kunde, Referenz...',
  value,
  onChange,
  onSearch,
  className,
  inputClassName,
}: DocumentSearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = (e.target as HTMLInputElement).value
      onSearch?.(v)
    }
  }

  return (
    <div className={cn('relative min-w-0 w-full', className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus-visible:ring-green-500/30',
          inputClassName
        )}
      />
    </div>
  )
}
