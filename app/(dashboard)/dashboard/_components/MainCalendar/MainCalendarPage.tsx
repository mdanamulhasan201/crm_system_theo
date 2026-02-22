"use client"

import React, { useState, useEffect, useRef } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'

const SLOT_HEIGHT = 60
const START_MINUTES = 0 // 0:00 so early-morning appointments (e.g. 12:27 AM) are visible
const END_MINUTES = 22 * 60 // 22:00 end

interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  person: string
  date: Date
  type?: string
}

interface MainCalendarPageProps {
  currentDate: Date
  appointments: Appointment[]
  loading?: boolean
  error?: string | null
}

// Generate time slots from 0:00 to 22:00
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

const timeSlots = generateTimeSlots()

// Convert time string (HH:mm) to minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Min height so title (2 lines) + time + type + person are visible
const MIN_CARD_HEIGHT_PX = 72

// Calculate position and height for appointment block
const getAppointmentStyle = (startTime: string, endTime: string) => {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const duration = endMinutes - startMinutes
  const top = ((startMinutes - START_MINUTES) / 60) * SLOT_HEIGHT
  const height = (duration / 60) * SLOT_HEIGHT

  return {
    top: `${top}px`,
    height: `${Math.max(height, MIN_CARD_HEIGHT_PX)}px`,
  }
}

export default function MainCalendarPage({
  currentDate,
  appointments,
  loading = false,
  error = null
}: MainCalendarPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(() => new Date())

  const day1 = currentDate
  const day2 = addDays(currentDate, 1)
  const days = [day1, day2]
  const isViewingToday = isSameDay(currentDate, new Date())

  // Update current time every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  // Auto-scroll to current time when viewing today (on mount or day change)
  useEffect(() => {
    if (!isViewingToday) return
    const el = scrollRef.current
    if (!el) return

    const scrollToCurrentTime = () => {
      const target = scrollRef.current
      if (!target || target.clientHeight === 0) return
      const d = new Date()
      const mins = d.getHours() * 60 + d.getMinutes()
      const top = ((mins - START_MINUTES) / 60) * SLOT_HEIGHT
      target.scrollTop = Math.max(0, top - target.clientHeight / 2 + 16)
    }

    // Run immediately + after layout (ResizeObserver fires when element has size)
    scrollToCurrentTime()
    const ro = new ResizeObserver(() => scrollToCurrentTime())
    ro.observe(el)
    const timeoutId = setTimeout(scrollToCurrentTime, 200)

    return () => {
      ro.disconnect()
      clearTimeout(timeoutId)
    }
  }, [isViewingToday, currentDate])

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, day))
  }

  // Current time line position (pixels from top of scrollable grid)
  const mins = now.getHours() * 60 + now.getMinutes()
  const lineTop = ((mins - START_MINUTES) / 60) * SLOT_HEIGHT
  const showLine = isViewingToday && mins >= START_MINUTES && mins <= END_MINUTES

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border rounded-lg">
      {/* Sticky header: day names + dates */}
      <div className="flex shrink-0 sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="w-20 shrink-0 border-r border-gray-200 h-16" />
        {days.map((day, dayIndex) => {
          const dayName = format(day, "EEEE", { locale: de }).substring(0, 2).toUpperCase()
          const dayNumber = format(day, "d")
          const monthName = format(day, "MMM", { locale: de })
          return (
            <div
              key={dayIndex}
              className="flex-1 border-r border-gray-200 last:border-r-0 px-4 flex flex-col justify-center min-w-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500 uppercase">{dayName}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#62A07C] leading-none">{dayNumber}</span>
                  <span className="text-xs text-gray-500">{monthName}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-auto calendar-scrollbar min-h-0">
        <div className="flex">
          {/* Time Column */}
          <div className="w-20 shrink-0 border-r border-gray-200">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-[60px] border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
              >
                <span className="text-xs text-gray-400">{time}</span>
              </div>
            ))}
          </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex relative">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-30 p-4">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
              <div className="w-8 h-8 border-2 border-[#62A07C] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Current time line overlay - only when viewing today */}
          {showLine && (
            <div
              className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
              style={{ top: `${lineTop}px`, transform: 'translateY(-50%)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#62A07C] shrink-0 shadow-sm ring-2 ring-white" />
              <div className="flex-1 h-0.5 bg-[#62A07C]" />
            </div>
          )}
          {days.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day)

            return (
              <div
                key={dayIndex}
                className="flex-1 border-r border-gray-200 last:border-r-0 relative"
              >
                <div className="relative">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-[60px] border-b border-gray-100"
                    />
                  ))}

                  {/* Appointments */}
                  {dayAppointments.map((appointment) => {
                    const style = getAppointmentStyle(
                      appointment.startTime,
                      appointment.endTime
                    )

                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-2 right-2 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm bg-[#62A07C]/20"
                        style={style}
                      >
                        <div className="flex flex-col h-full min-h-0 p-2.5 gap-1.5">
                          <div className="font-semibold text-green-800 text-xs leading-snug line-clamp-2 shrink-0">
                            {appointment.title}
                          </div>
                          <div className="text-[11px] text-gray-600 shrink-0">
                            {appointment.startTime} – {appointment.endTime}
                          </div>
                          {/* {appointment.type && (
                            <div className="text-[11px] text-gray-500 line-clamp-1 shrink-0">
                              {appointment.type}
                            </div>
                          )} */}
                          <div className="flex items-center gap-2 mt-auto shrink-0 min-h-0">
                            <span className="w-6 h-6 rounded-full bg-[#62A07C] text-white flex items-center justify-center text-[10px] font-semibold shrink-0 shadow-sm">
                              {appointment.person.trim().charAt(0).toUpperCase()}
                            </span>
                            <span className="text-[11px] text-gray-700 truncate font-medium">
                              {appointment.person.trim()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}
