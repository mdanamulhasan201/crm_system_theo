'use client'

import React from 'react'
import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface DocumentFilterOption {
  value: string
  label: string
}

interface DocumentFilterDropdownProps {
  placeholder: string
  options: DocumentFilterOption[]
  value?: string
  onValueChange?: (value: string) => void
  showFilterIcon?: boolean
  className?: string
}

export default function DocumentFilterDropdown({
  placeholder,
  options,
  value,
  onValueChange,
  showFilterIcon = false,
  className,
}: DocumentFilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          'h-10 w-full min-w-[160px] rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:ring-green-500/30',
          className
        )}
      >
        <span className="flex items-center gap-2">
          {showFilterIcon && (
            <Filter className="size-4 shrink-0 text-gray-400" aria-hidden />
          )}
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
