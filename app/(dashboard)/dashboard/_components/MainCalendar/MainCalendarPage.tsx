"use client"

import React from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'

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
}

// Generate time slots from 5:00 to 21:00
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 5; hour <= 21; hour++) {
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

// Calculate position and height for appointment block
const getAppointmentStyle = (startTime: string, endTime: string) => {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const duration = endMinutes - startMinutes
  
  // Each hour is 60px, starting from 5:00 (300 minutes from midnight)
  // Position relative to the 5:00 mark
  const top = ((startMinutes - 300) / 60) * 60
  const height = (duration / 60) * 60
  
  return {
    top: `${top}px`,
    height: `${Math.max(height, 40)}px`, // Minimum height of 40px
  }
}

export default function MainCalendarPage({
  currentDate,
  appointments
}: MainCalendarPageProps) {
  // Show the selected date and the next day
  const day1 = currentDate
  const day2 = addDays(currentDate, 1)

  const days = [day1, day2]

  // Filter appointments for the visible days
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, day))
  }

  return (
    <div className="flex-1 overflow-auto bg-white calendar-scrollbar">
      <div className="flex">
        {/* Time Column */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200">
          <div className="h-16 border-b border-gray-200"></div>
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
        <div className="flex-1 flex">
          {days.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day)
            const dayName = format(day, "EEEE", { locale: de }).substring(0, 2).toUpperCase()
            const dayNumber = format(day, "d")
            const monthName = format(day, "MMM", { locale: de })

            return (
              <div
                key={dayIndex}
                className="flex-1 border-r border-gray-200 last:border-r-0 relative"
              >
                {/* Day Header */}
                <div className="h-16 border-b border-gray-200 px-4 flex flex-col justify-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500 uppercase">{dayName}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-600 leading-none">{dayNumber}</span>
                      <span className="text-xs text-gray-500">{monthName}</span>
                    </div>
                  </div>
                </div>

                {/* Time Grid */}
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
                        className="absolute left-2 right-2 bg-green-50 rounded-t-md border border-green-200/50 p-2 cursor-pointer hover:bg-green-100 transition-colors"
                        style={style}
                      >
                        <div className="flex flex-col h-full">
                          <div className="font-semibold text-green-900 text-sm leading-tight">
                            {appointment.title}
                          </div>
                          <div className="text-xs text-green-700 mt-1">
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                          {appointment.type && (
                            <div className="text-xs text-green-700 mt-0.5">
                              {appointment.type}
                            </div>
                          )}
                          <div className="text-xs text-green-800 mt-auto font-medium">
                            P {appointment.person}
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
  )
}
