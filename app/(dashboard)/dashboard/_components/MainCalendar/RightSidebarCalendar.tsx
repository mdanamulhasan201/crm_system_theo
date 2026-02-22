"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import EmloyeesLists from './EmloyeesLists'
import { getDotInMyCalendar } from '@/apis/calendarManagementApis'

interface RightSidebarCalendarProps {
  currentDate: Date
  onDateSelect: (date: Date) => void
  selectedEmployees: string[]
  onEmployeeToggle: (employeeId: string, employeeName?: string) => void
}

export default function RightSidebarCalendar({
  currentDate,
  onDateSelect,
  selectedEmployees,
  onEmployeeToggle
}: RightSidebarCalendarProps) {
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(() => startOfMonth(currentDate))
  const [datesWithDots, setDatesWithDots] = useState<string[]>([])
  const lastSyncedDateRef = useRef<Date>(currentDate)

  const fetchDatesWithAppointments = useCallback(async () => {
    const year = miniCalendarMonth.getFullYear()
    const month = miniCalendarMonth.getMonth() + 1
    const employeeParam = selectedEmployees.length > 0 ? selectedEmployees.join(',') : undefined
    try {
      const res = await getDotInMyCalendar(year, month, employeeParam)
      setDatesWithDots(res.dates ?? [])
    } catch {
      setDatesWithDots([])
    }
  }, [miniCalendarMonth, selectedEmployees])

  useEffect(() => {
    fetchDatesWithAppointments()
  }, [fetchDatesWithAppointments])

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
    <div className="w-80 flex flex-col gap-6 px-2">
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
            const dateStr = format(day, 'yyyy-MM-dd')
            const hasDot = datesWithDots.includes(dateStr)

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "aspect-square flex flex-col items-center cursor-pointer justify-center text-sm rounded transition-colors relative",
                  !isCurrentMonth && "text-gray-300",
                  isCurrentMonth && !isInMainView && !isToday && "text-gray-900 hover:bg-gray-100",
                  isInMainView && "bg-[#62A07C] text-white font-semibold",
                  isToday && !isInMainView && "bg-green-50 text-green-600 font-semibold"
                )}
              >
                <span>{format(day, "d")}</span>
                {hasDot && (
                  <span
                    className={cn(
                      "absolute top-1 right-1 w-1.5 h-1.5 rounded-full shrink-0",
                      isInMainView ? "bg-white shadow-sm" : "bg-emerald-400"
                    )}
                    aria-hidden
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <EmloyeesLists
        selectedEmployees={selectedEmployees}
        onEmployeeToggle={onEmployeeToggle}
      />
    </div>
  )
}
