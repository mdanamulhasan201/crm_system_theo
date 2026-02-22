"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { format, addDays } from 'date-fns'
import CalendarMainNav from '../_components/MainCalendar/CalendarMainNav'
import CalendarNav from '../_components/MainCalendar/CalendarNav'
import MainCalendarPage from '../_components/MainCalendar/MainCalendarPage'
import RightSidebarCalendar from '../_components/MainCalendar/RightSidebarCalendar'
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal'
import { useAppoinment } from '@/hooks/appoinment/useAppoinment'
import { getAppointmentsByDate, type AppointmentByDateItem } from '@/apis/calendarManagementApis'

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

export interface CalendarAppointment {
  id: string
  title: string
  startTime: string
  endTime: string
  person: string
  date: Date
  type?: string
}

const LIMIT = 30

/** Parse API time to 24h "HH:mm" for form */
function parseApiTimeTo24(timeStr: string): string {
  const s = (timeStr || '').trim()
  if (!s) return '09:00'
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) {
    let h = parseInt(m12[1], 10)
    const min = parseInt(m12[2], 10)
    if (m12[3].toUpperCase() === 'PM' && h !== 12) h += 12
    if (m12[3].toUpperCase() === 'AM' && h === 12) h = 0
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (m24) {
    const h = parseInt(m24[1], 10) % 24
    const min = parseInt(m24[2], 10) % 60
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
  }
  return '09:00'
}

function parseApiTime(timeStr: string): { hours: number; minutes: number } {
  const t = parseApiTimeTo24(timeStr)
  const [h, m] = t.split(':').map(Number)
  return { hours: h, minutes: m }
}

function formatTime24(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/** Take only date part from API date string "2026-02-19T00:00:00.000Z" -> local Date for 2026-02-19 */
function parseApiDate(dateStr: string): Date {
  const part = (dateStr || '').split('T')[0]
  const [y, m, d] = part.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

function mapApiAppointmentToCalendar(api: AppointmentByDateItem): CalendarAppointment {
  const { hours, minutes } = parseApiTime(api.time || '')
  const endMinutes = hours * 60 + minutes + Math.round(api.duration * 60)
  const endHours = Math.floor(endMinutes / 60) % 24
  const endMins = endMinutes % 60
  const person = api.assignedTo?.[0]?.assignedTo ?? '—'
  return {
    id: api.id,
    title: api.customer_name || '—',
    startTime: formatTime24(hours, minutes),
    endTime: formatTime24(endHours, endMins),
    person,
    date: parseApiDate(api.date || ''),
    type: api.reason
  }
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    // Start with today's date
    return new Date()
  })
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null)

  const { createNewAppointment, updateAppointmentById, getAppointmentById, deleteAppointmentById } = useAppoinment()

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

  const updateAppointmentForm = useForm<AppointmentFormData>({
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

  const fetchAppointments = useCallback(async () => {
    const startDate = format(currentDate, 'yyyy-MM-dd')
    const endDate = format(addDays(currentDate, 1), 'yyyy-MM-dd')
    const employeeParam = selectedEmployees.length > 0 ? selectedEmployees.join(',') : undefined
    setAppointmentsLoading(true)
    setAppointmentsError(null)
    try {
      const res = await getAppointmentsByDate(LIMIT, startDate, endDate, '', employeeParam)
      const list = (res.data ?? []).map(mapApiAppointmentToCalendar)
      setAppointments(list)
    } catch (err) {
      setAppointmentsError(err instanceof Error ? err.message : 'Failed to load appointments')
      setAppointments([])
    } finally {
      setAppointmentsLoading(false)
    }
  }, [currentDate, selectedEmployees])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

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
      fetchAppointments()
    }
  }

  const handleAppointmentClick = async (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId)
    const apt = await getAppointmentById(appointmentId)
    if (!apt) return
    const a = apt as {
      customer_name?: string
      time?: string
      date?: string
      reason?: string
      assignedTo?: Array<{ employeId: string; assignedTo: string }>
      details?: string
      isClient?: boolean
      duration?: number
      customerId?: string
      reminder?: number | null
    }
    const assignedList = (a.assignedTo || []) as Array<{ employeId?: string; assignedTo: string }>
    const employees = assignedList.map((e) => ({
      employeeId: e.employeId ?? '',
      assignedTo: e.assignedTo
    }))
    const datePart = (a.date || '').toString().split('T')[0]
    const [y, m, d] = datePart.split('-').map(Number)
    updateAppointmentForm.reset({
      isClientEvent: Boolean(a.isClient),
      kunde: a.customer_name || '',
      uhrzeit: parseApiTimeTo24(a.time || ''),
      selectedEventDate: y && m && d ? new Date(y, m - 1, d) : undefined,
      termin: a.reason || '',
      mitarbeiter: employees[0]?.assignedTo || '',
      bemerk: a.details || '',
      duration: a.duration ?? 1,
      customerId: a.customerId,
      employeeId: employees[0]?.employeeId,
      employees,
      reminder: a.reminder ?? null
    })
    setIsUpdateModalOpen(true)
  }

  const handleUpdateSubmit = async (data: AppointmentFormData) => {
    if (!selectedAppointmentId) return
    const success = await updateAppointmentById(selectedAppointmentId, data)
    if (success) {
      setIsUpdateModalOpen(false)
      setSelectedAppointmentId(null)
      updateAppointmentForm.reset()
      fetchAppointments()
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
          appointments={appointments}
          loading={appointmentsLoading}
          error={appointmentsError}
          onAppointmentClick={handleAppointmentClick}
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

      {/* Update Appointment Modal */}
      {isUpdateModalOpen && selectedAppointmentId && (
        <AppointmentModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false)
            setSelectedAppointmentId(null)
            updateAppointmentForm.reset()
          }}
          form={updateAppointmentForm}
          onSubmit={handleUpdateSubmit}
          title="Termin bearbeiten"
          buttonText="Aktualisieren"
          showDeleteButton
          onDelete={async () => {
            const ok = await deleteAppointmentById(selectedAppointmentId)
            if (ok) {
              setIsUpdateModalOpen(false)
              setSelectedAppointmentId(null)
              updateAppointmentForm.reset()
              fetchAppointments()
            }
          }}
        />
      )}
    </div>
  )
}
