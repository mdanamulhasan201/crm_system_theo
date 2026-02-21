"use client"

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface CalendarNavProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export default function CalendarNav({
  currentDate,
  onDateChange
}: CalendarNavProps) {
  // Show the selected date and the next day
  const day1 = currentDate
  const day2 = addDays(currentDate, 1)

  // Format date range in German
  const formatDateRange = () => {
    const day1Formatted = format(day1, "EEEE dd.MM.", { locale: de })
    const day2Formatted = format(day2, "EEEE dd.MM.", { locale: de })
    return `${day1Formatted.charAt(0).toUpperCase() + day1Formatted.slice(1)} – ${day2Formatted.charAt(0).toUpperCase() + day2Formatted.slice(1)}`
  }

  const handlePrevious = () => {
    // Move back by 1 day
    onDateChange(addDays(currentDate, -1))
  }

  const handleNext = () => {
    // Move forward by 1 day
    onDateChange(addDays(currentDate, 1))
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center w-full px-6 py-3 bg-white border-b border-gray-200">
      {/* Left side - Heute button and arrows */}
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

      {/* Center - Date Range */}
      <div className="flex-1 flex items-center justify-center ml-4">
        <span className="text-base font-medium text-gray-900">
          {formatDateRange()}
        </span>
      </div>
    </div>
  )
}
