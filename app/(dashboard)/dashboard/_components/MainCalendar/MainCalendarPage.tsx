"use client"

import React, { useState, useEffect, useRef } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'
import { X } from 'lucide-react'

const SLOT_HEIGHT = 72
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
  onAppointmentClick?: (appointmentId: string) => void
  onSlotClick?: (date: Date, time: string) => void
  onDeleteAppointment?: (appointmentId: string) => void
  /** 1 = day view (one column), 2 = 2 days view (two columns) */
  daysToShow?: 1 | 2
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

// Map API reason value to display label (Grund)
const REASON_LABELS: Record<string, string> = {
  'fussanalyse-laufanalyse': 'Fußanalyse / Laufanalyse',
  'massnehmen': 'Maßnehmen',
  'anprobe-abholung': 'Anprobe / Abholung',
  'kontrolle-nachkontrolle': 'Kontrolle / Nachkontrolle',
  'beratung-rezept-einloesung': 'Beratung / Rezept-Einlösung',
  'hausbesuch': 'Hausbesuch',
  'sonstiges': 'Sonstiges',
  'teammeeting-fallbesprechung': 'Teammeeting / Fallbesprechung',
  'fortbildung-schulung': 'Fortbildung / Schulung',
  'verwaltung-dokumentation': 'Verwaltung / Dokumentation',
  'interne-sprechstunde-besprechung': 'Interne Sprechstunde / Besprechung',
  'externe-termine-kooperation': 'Externe Termine / Kooperation',
}

function getReasonLabel(reason: string | undefined): string {
  if (!reason || !reason.trim()) return ''
  const label = REASON_LABELS[reason.trim().toLowerCase()]
  if (label) return label
  // Fallback: capitalize words, replace hyphens with space
  return reason
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

// Two time ranges overlap or touch if they share time or are adjacent (so we show them side-by-side)
function doRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA)
  const eA = timeToMinutes(endA)
  const sB = timeToMinutes(startB)
  const eB = timeToMinutes(endB)
  return eA >= sB && eB >= sA
}

// Overlap groups: appointments that (transitively) overlap get the same group
function getOverlapGroups(appointments: Appointment[]): number[] {
  const n = appointments.length
  const groupId = new Array(n).fill(-1)
  let nextId = 0
  for (let i = 0; i < n; i++) {
    if (groupId[i] >= 0) continue
    const stack = [i]
    groupId[i] = nextId
    while (stack.length > 0) {
      const cur = stack.pop()!
      for (let j = 0; j < n; j++) {
        if (groupId[j] >= 0) continue
        if (
          doRangesOverlap(
            appointments[cur].startTime,
            appointments[cur].endTime,
            appointments[j].startTime,
            appointments[j].endTime
          )
        ) {
          groupId[j] = nextId
          stack.push(j)
        }
      }
    }
    nextId++
  }
  return groupId
}

// For each appointment: columnIndex (0-based) and totalColumns in its overlap group
function getOverlapLayout(appointments: Appointment[]): { columnIndex: number; totalColumns: number }[] {
  const groups = getOverlapGroups(appointments)
  const groupMembers = new Map<number, number[]>()
  groups.forEach((g, i) => {
    if (!groupMembers.has(g)) groupMembers.set(g, [])
    groupMembers.get(g)!.push(i)
  })

  const result: { columnIndex: number; totalColumns: number }[] = appointments.map(() => ({
    columnIndex: 0,
    totalColumns: 1,
  }))

  groupMembers.forEach((indices) => {
    const sorted = [...indices].sort(
      (a, b) => timeToMinutes(appointments[a].startTime) - timeToMinutes(appointments[b].startTime)
    )
    const colAssign: number[] = []
    for (let pos = 0; pos < sorted.length; pos++) {
      const i = sorted[pos]
      const used = new Set<number>()
      for (let k = 0; k < pos; k++) {
        const j = sorted[k]
        if (
          doRangesOverlap(
            appointments[i].startTime,
            appointments[i].endTime,
            appointments[j].startTime,
            appointments[j].endTime
          )
        ) {
          used.add(colAssign[k])
        }
      }
      let col = 0
      while (used.has(col)) col++
      colAssign[pos] = col
    }
    const totalColumns = Math.max(...colAssign) + 1
    sorted.forEach((origIdx, pos) => {
      result[origIdx] = { columnIndex: colAssign[pos], totalColumns }
    })
  })

  return result
}

const CARD_GAP_PX = 4
const CARD_PADDING_REM = 0.5

// Position and size: when totalColumns > 1, cards share width side-by-side; else full width
function getAppointmentStyle(
  startTime: string,
  endTime: string,
  columnIndex: number,
  totalColumns: number
): React.CSSProperties {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const duration = endMinutes - startMinutes
  const top = ((startMinutes - START_MINUTES) / 60) * SLOT_HEIGHT
  const height = (duration / 60) * SLOT_HEIGHT

  const base: React.CSSProperties = {
    top: `${top}px`,
    height: `${Math.max(height, MIN_CARD_HEIGHT_PX)}px`,
  }

  if (totalColumns <= 1) {
    return {
      ...base,
      left: `${CARD_PADDING_REM}rem`,
      right: `${CARD_PADDING_REM}rem`,
    }
  }

  const totalGap = (totalColumns - 1) * CARD_GAP_PX
  const widthExpr = `(100% - ${CARD_PADDING_REM * 2}rem - ${totalGap}px) / ${totalColumns}`
  return {
    ...base,
    left: `calc(${CARD_PADDING_REM}rem + ${columnIndex} * (${widthExpr} + ${CARD_GAP_PX}px))`,
    width: `calc(${widthExpr})`,
  }
}

export default function MainCalendarPage({
  currentDate,
  appointments,
  loading = false,
  error = null,
  onAppointmentClick,
  onSlotClick,
  onDeleteAppointment,
  daysToShow = 2
}: MainCalendarPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(() => new Date())

  const day1 = currentDate
  const day2 = addDays(currentDate, 1)
  const days = daysToShow === 1 ? [day1] : [day1, day2]
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
                className="h-[72px] border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
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
            const overlapLayout = getOverlapLayout(dayAppointments)

            return (
              <div
                key={dayIndex}
                className="flex-1 border-r border-gray-200 last:border-r-0 relative min-w-0"
              >
                <div className="relative h-full">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSlotClick?.(day, time)}
                      onKeyDown={(e) => e.key === 'Enter' && onSlotClick?.(day, time)}
                      className="h-[72px] border-b border-gray-100 cursor-pointer hover:bg-gray-50/80 transition-colors"
                    />
                  ))}

                  {/* Appointments: same time = side-by-side (narrow width), else full width */}
                  {dayAppointments.map((appointment, idx) => {
                    const { columnIndex, totalColumns } = overlapLayout[idx] ?? { columnIndex: 0, totalColumns: 1 }
                    const style = getAppointmentStyle(
                      appointment.startTime,
                      appointment.endTime,
                      columnIndex,
                      totalColumns
                    )

                    return (
                      <div
                        key={appointment.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onAppointmentClick?.(appointment.id)}
                        onKeyDown={(e) => e.key === 'Enter' && onAppointmentClick?.(appointment.id)}
                        className="group absolute overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm bg-[#62A07C]/20 border-l-4 border-l-[#62A07C]"
                        style={style}
                      >
                        <div className="flex flex-col h-full min-h-0 p-2.5 gap-1 relative">
                          {onDeleteAppointment && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteAppointment(appointment.id)
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity cursor-pointer"
                              aria-label="Delete"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="font-semibold text-green-800 text-xs leading-snug line-clamp-2 shrink-0">
                            {appointment.title}
                          </div>
                          <div className="flex items-center justify-between gap-2 shrink-0 min-h-0">
                            <span className="text-[11px] text-gray-600">
                              {appointment.startTime} – {appointment.endTime}
                            </span>
                            {appointment.type && (
                              <span className="text-[10px] text-gray-600 font-semibold truncate max-w-[50%]">
                                {getReasonLabel(appointment.type)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-auto shrink-0 min-h-0">
                            <span className="text-[11px] text-gray-700 truncate font-medium flex-1 min-w-0">
                              {appointment.person.trim() || '—'}
                            </span>
                            <span className="w-4 h-4 rounded-full bg-[#62A07C] text-white flex items-center justify-center text-[10px] font-semibold shrink-0 shadow-sm">
                              {(appointment.person.trim() || '?').charAt(0).toUpperCase()}
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
