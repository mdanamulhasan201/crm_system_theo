"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface RightSidebarCalendarProps {
  currentDate: Date
  onDateSelect: (date: Date) => void
  selectedEmployees: string[]
  onEmployeeToggle: (employee: string) => void
}

const employees = [
  { id: 'max', name: 'Max', initial: 'M' },
  { id: 'daniel', name: 'Daniel', initial: 'D' },
  { id: 'tina', name: 'Tina', initial: 'T' },
  { id: 'sarah', name: 'Sarah', initial: 'S' },
]

export default function RightSidebarCalendar({
  currentDate,
  onDateSelect,
  selectedEmployees,
  onEmployeeToggle
}: RightSidebarCalendarProps) {
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(() => startOfMonth(currentDate))
  const lastSyncedDateRef = useRef<Date>(currentDate)

  // Sync mini calendar month when currentDate changes to a different month
  useEffect(() => {
    const currentMonth = startOfMonth(currentDate)
    const lastSyncedMonth = startOfMonth(lastSyncedDateRef.current)

    if (!isSameMonth(currentMonth, lastSyncedMonth)) {
      setMiniCalendarMonth(currentMonth)
      lastSyncedDateRef.current = currentDate
    }
  }, [currentDate])

  const monthStart = startOfMonth(miniCalendarMonth)
  const monthEnd = endOfMonth(miniCalendarMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  // Main calendar shows 2 dates: currentDate and currentDate + 1 — both should be active in this grid
  const visibleInMainCalendar = [currentDate, addDays(currentDate, 1)]

  const handlePreviousMonth = () => {
    setMiniCalendarMonth(subMonths(miniCalendarMonth, 1))
  }

  const handleNextMonth = () => {
    setMiniCalendarMonth(addMonths(miniCalendarMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  return (
    <div className="w-80 flex flex-col gap-6">
      {/* Mini Calendar */}
      <div className="flex flex-col gap-4 border rounded-lg p-2 bg-white">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <h3 className="text-base font-medium text-gray-900">
            {format(miniCalendarMonth, "MMMM yyyy", { locale: de })}
          </h3>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
            <div
              key={day}
              className="text-xs text-gray-500 text-center font-normal py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, miniCalendarMonth)
            const isInMainView = visibleInMainCalendar.some((d) => isSameDay(day, d))
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "aspect-square flex items-center cursor-pointer justify-center text-sm rounded transition-colors",
                  !isCurrentMonth && "text-gray-300",
                  isCurrentMonth && !isInMainView && !isToday && "text-gray-900 hover:bg-gray-100",
                  isInMainView && "bg-[#62A07C] text-white font-semibold",
                  isToday && !isInMainView && "bg-green-50 text-green-600 font-semibold"
                )}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>

      {/* Employees Section */}
      <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          MITARBEITER
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {employees.map((employee) => {
            const isSelected = selectedEmployees.includes(employee.id)

            return (
              <button
                key={employee.id}
                onClick={() => onEmployeeToggle(employee.id)}
                className={cn(
                  "flex items-center cursor-pointer gap-2 px-2 py-2 rounded-full text-sm font-medium transition-all duration-200 w-full justify-start",
                  isSelected
                    ? "bg-[#62A07C] text-white hover:bg-[#62A07C]/80"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {/* Circular initial avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                    isSelected
                      ? "border-2 border-[#62A07C] text-white"
                      : "bg-gray-200/80 text-gray-700 border-2 border-gray-200"
                  )}
                >
                  {employee.initial}
                </div>
                <span className="truncate text-left">{employee.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
