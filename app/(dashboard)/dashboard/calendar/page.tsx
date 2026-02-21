"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import CalendarMainNav from '../_components/MainCalendar/CalendarMainNav'
import CalendarNav from '../_components/MainCalendar/CalendarNav'
import MainCalendarPage from '../_components/MainCalendar/MainCalendarPage'
import RightSidebarCalendar from '../_components/MainCalendar/RightSidebarCalendar'
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal'
import { useAppoinment } from '@/hooks/appoinment/useAppoinment'

interface Employee {
  employeeId: string
  assignedTo: string
}

interface AppointmentFormData {
  isClientEvent: boolean
  kunde: string
  uhrzeit: string
  selectedEventDate: Date | undefined
  termin: string
  mitarbeiter: string
  bemerk?: string
  duration: number
  customerId?: string
  employeeId?: string
  employees?: Employee[]
  reminder?: number | null
}

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
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { createNewAppointment } = useAppoinment()

  const appointmentForm = useForm<AppointmentFormData>({
    defaultValues: {
      isClientEvent: true,
      kunde: '',
      uhrzeit: '',
      selectedEventDate: undefined,
      termin: '',
      mitarbeiter: '',
      bemerk: '',
      duration: 1,
      customerId: undefined,
      employeeId: undefined,
      employees: [],
      reminder: null
    }
  })

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
    appointmentForm.reset()
    appointmentForm.setValue('selectedEventDate', currentDate)
    setIsAddModalOpen(true)
  }

  const handleAppointmentSubmit = async (data: AppointmentFormData) => {
    const success = await createNewAppointment(data)
    if (success) {
      appointmentForm.reset()
      setIsAddModalOpen(false)
    }
  }

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId)
      }
      // Max 2 employees can be selected
      if (prev.length >= 2) return prev
      return [...prev, employeeId]
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
      <div className="flex flex-1 overflow-hidden gap-2">
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

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <AppointmentModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            appointmentForm.reset()
          }}
          form={appointmentForm}
          onSubmit={handleAppointmentSubmit}
          title="Neuer Termin"
          buttonText="Termin bestätigen"
        />
      )}
    </div>
  )
}
