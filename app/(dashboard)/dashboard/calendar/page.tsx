"use client"

import React, { useState } from 'react'
import CalendarMainNav from '../_components/MainCalendar/CalendarMainNav'
import { startOfWeek } from 'date-fns'
import CalendarNav from '../_components/MainCalendar/CalendarNav'
import MainCalendarPage from '../_components/MainCalendar/MainCalendarPage'
import RightSidebarCalendar from '../_components/MainCalendar/RightSidebarCalendar'

interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  person: string
  date: Date
  type?: string
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    // Start with today's date
    return new Date()
  })
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(['daniel'])

  // Sample appointments data - replace with your actual data source
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Nachsorge Klein',
      startTime: '09:30',
      endTime: '10:30',
      person: 'Daniel',
      date: new Date(2026, 1, 16), // Feb 16, 2026
    },
    {
      id: '2',
      title: 'Behandlung Schmidt',
      startTime: '10:00',
      endTime: '11:30',
      person: 'Daniel',
      date: new Date(2026, 1, 17), // Feb 17, 2026
      type: 'Nachkontrolle',
    },
  ])

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  const handleAddAppointment = () => {
    // TODO: Implement add appointment modal
    console.log('Add appointment clicked')
  }

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId)
      } else {
        return [...prev, employeeId]
      }
    })
  }

  // Filter appointments by selected employees
  const filteredAppointments = appointments.filter(apt => {
    const employeeMap: { [key: string]: string } = {
      'max': 'Max',
      'daniel': 'Daniel',
      'tina': 'Tina',
      'sarah': 'Sarah',
    }
    
    // If no employees selected, show all appointments
    if (selectedEmployees.length === 0) {
      return true
    }
    
    return selectedEmployees.some(empId => 
      employeeMap[empId] === apt.person
    )
  })

  return (
    <div className="flex flex-col h-full bg-gray-50 -m-4">
      {/* Main Calendar Navbar */}
      <CalendarMainNav
        onAddAppointment={handleAddAppointment}
      />

      {/* Calendar Date Navigation Bar */}
      <CalendarNav
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Calendar */}
        <MainCalendarPage
          currentDate={currentDate}
          appointments={filteredAppointments}
        />

        {/* Right Sidebar */}
        <RightSidebarCalendar
          currentDate={currentDate}
          onDateSelect={handleDateChange}
          selectedEmployees={selectedEmployees}
          onEmployeeToggle={handleEmployeeToggle}
        />
      </div>
    </div>
  )
}
