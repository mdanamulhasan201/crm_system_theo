"use client"

import React from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type CalendarViewMode = 'day' | '2days'

interface CalendarNavProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
}

export default function CalendarNav({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange
}: CalendarNavProps) {
  const day1 = currentDate
  const day2 = addDays(currentDate, 1)

  const formatDateRange = () => {
    const day1Formatted = format(day1, "EEEE dd.MM.", { locale: de })
    const str = day1Formatted.charAt(0).toUpperCase() + day1Formatted.slice(1)
    if (viewMode === 'day') return str
    const day2Formatted = format(day2, "EEEE dd.MM.", { locale: de })
    return `${str} – ${day2Formatted.charAt(0).toUpperCase() + day2Formatted.slice(1)}`
  }

  const handlePrevious = () => {
    const step = viewMode === 'day' ? 1 : 1
    onDateChange(addDays(currentDate, -step))
  }

  const handleNext = () => {
    const step = viewMode === 'day' ? 1 : 1
    onDateChange(addDays(currentDate, step))
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const viewLabel = viewMode === 'day' ? 'Tag' : '2 Tage'

  return (
    <div className="flex items-center w-full px-6 py-3 mb-2">
      {/* Left - Heute + arrows */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="rounded-md px-3 py-1.5 text-sm font-medium bg-gray-50 hover:bg-gray-100"
        >
          Heute
        </Button>
        <button
          onClick={handlePrevious}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleNext}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Center - Date range */}
      <div className="flex-1 flex items-center justify-center ml-4">
        <span className="text-base font-medium text-gray-900">
          {formatDateRange()}
        </span>
      </div>

      {/* Right - View dropdown (Day / 2 Days) */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium bg-white border-gray-200 hover:bg-gray-50"
            >
              <CalendarDays className="w-4 h-4 text-gray-600" />
              <span>{viewLabel}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px] ">
            <DropdownMenuItem
              onClick={() => onViewModeChange('day')}
              className={cn('cursor-pointer', viewMode === 'day' && 'bg-[#62A07C]/10 text-[#62A07C] font-medium')}
            >
              Tag
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewModeChange('2days')}
              className={cn('cursor-pointer', viewMode === '2days' && 'bg-[#62A07C]/10 text-[#62A07C] font-medium')}
            >
              2 Tage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
