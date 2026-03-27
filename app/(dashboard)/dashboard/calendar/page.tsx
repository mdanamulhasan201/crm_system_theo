"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, addDays } from 'date-fns'
import CalendarMainNav from '../_components/MainCalendar/CalendarMainNav'
import CalendarNav, { type CalendarViewMode } from '../_components/MainCalendar/CalendarNav'
import MainCalendarPage from '../_components/MainCalendar/MainCalendarPage'
import RightSidebarCalendar from '../_components/MainCalendar/RightSidebarCalendar'
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal'
import DeleteConfirmModal from '@/app/(dashboard)/dashboard/_components/MainCalendar/DeleteConfirmModal'
import { useAppoinment } from '@/hooks/appoinment/useAppoinment'
import { getAppointmentsByDate, type AppointmentByDateItem } from '@/apis/calendarManagementApis'
import {
  getAppointmentsByDate as getRoomAppointmentsByDate,
  getEmployeeFreeSlots,
  getEmployeeFreePercentage,
  getRoomOccupancyPercentage,
} from '@/apis/appoinmentApis'
import RoomHeader, { type StaffItem, type RoomItem } from '../_components/Room/RoomHeader'
import MainCard, {
  type DayAppointment,
  type EmployeeFreeSlotGroup,
  type FreeSlotsByDayMap,
} from '../_components/Room/MainCard'

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
  appomnentRoom?: string
}

const appointmentSchema = z.object({
  isClientEvent: z.boolean(),
  kunde: z.string().optional(),
  uhrzeit: z.string().min(1, 'Uhrzeit ist erforderlich'),
  selectedEventDate: z
    .any()
    .refine((val) => val instanceof Date, { message: 'Datum ist erforderlich' }),
  termin: z.string().min(1, 'Termingrund ist erforderlich'),
  mitarbeiter: z.string().optional(),
  bemerk: z.string().optional(),
  duration: z.number({ required_error: 'Dauer ist erforderlich' }).positive('Dauer ist erforderlich'),
  customerId: z.string().optional(),
  employeeId: z.string().optional(),
  employees: z
    .array(z.object({ employeeId: z.string(), assignedTo: z.string() }))
    .optional()
    .refine((arr) => arr && arr.length >= 1, {
      message: 'Mindestens ein Mitarbeiter ist erforderlich',
    }),
  reminder: z.number().nullable().optional(),
  appomnentRoom: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isClientEvent && (!data.kunde || data.kunde.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Kunde ist erforderlich',
      path: ['kunde'],
    })
  }
})

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

/** Use start of range "04:00-17:00" or single "09:00" for appointment form */
function presetTimeFromFreeSlot(slot: string): string {
  const s = slot.trim()
  const range = s.match(/^(\d{1,2}):(\d{2})\s*-\s*\d{1,2}:\d{2}$/)
  if (range) {
    const h = Math.min(23, Math.max(0, parseInt(range[1], 10)))
    const m = Math.min(59, Math.max(0, parseInt(range[2], 10)))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const single = s.match(/^(\d{1,2}):(\d{2})$/)
  if (single) {
    const h = Math.min(23, Math.max(0, parseInt(single[1], 10)))
    const m = Math.min(59, Math.max(0, parseInt(single[2], 10)))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return '09:00'
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
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('2days')

  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Array<{ employeeId: string; assignedTo: string }>>([])
  const selectedEmployees = useMemo(
    () => selectedEmployeeDetails.map((e) => e.employeeId),
    [selectedEmployeeDetails]
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState<string | null>(null)

  const [roomDate, setRoomDate] = useState<Date>(() => new Date())
  const [roomAppointmentsByDay, setRoomAppointmentsByDay] = useState<Record<string, DayAppointment[]>>({})
  const [roomFreeSlotsByDay, setRoomFreeSlotsByDay] = useState<FreeSlotsByDayMap>({})
  const [staffFreePercentages, setStaffFreePercentages] = useState<StaffItem[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [roomOccupancyPills, setRoomOccupancyPills] = useState<RoomItem[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const { createNewAppointment, updateAppointmentById, getAppointmentById, deleteAppointmentById } = useAppoinment()

  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema) as Resolver<AppointmentFormData>,
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
    resolver: zodResolver(appointmentSchema) as Resolver<AppointmentFormData>,
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
    const endDate =
      viewMode === 'day'
        ? startDate
        : format(addDays(currentDate, 1), 'yyyy-MM-dd')
    const ids = selectedEmployeeDetails.map((e) => e.employeeId)
    const employeeParam = ids.length > 0 ? ids.join(',') : undefined
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
  }, [currentDate, viewMode, selectedEmployeeDetails])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const fetchRoomAppointments = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      const res = await getRoomAppointmentsByDate(dateStr)
      if (Array.isArray(res?.days)) {
        const mapped: Record<string, DayAppointment[]> = {}
        res.days.forEach(
          (day: {
            date: string
            appointments: Array<{
              id: string
              time: string
              employeeName: string
              employeeId?: string
              employeId?: string
            }>
          }) => {
            mapped[day.date] = day.appointments.map((apt) => {
              const empId = apt.employeeId ?? apt.employeId
              const base: DayAppointment = {
                id: apt.id,
                time: apt.time,
                title: apt.employeeName,
                color: 'gray',
              }
              return empId ? { ...base, employeeId: empId } : base
            })
          }
        )
        setRoomAppointmentsByDay(mapped)
      } else {
        setRoomAppointmentsByDay({})
      }
    } catch {
      setRoomAppointmentsByDay({})
    }
  }, [])

  const fetchEmployeeFreePercentages = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      const res = await getEmployeeFreePercentage([dateStr])
      const staffList: StaffItem[] = (res?.data ?? []).map((item: any) => ({
        id: item.employeeId,
        name: item.employeeName,
        percentage: item.paidPercentage ?? 0
      }))
      setStaffFreePercentages(staffList)
    } catch {
      setStaffFreePercentages([])
    }
  }, [])

  const fetchRoomOccupancy = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      const res = await getRoomOccupancyPercentage([dateStr])
      const rows = res?.data ?? []
      const pills: RoomItem[] = rows
        .filter((row) => row.isActive !== false)
        .map((row) => {
          const n = Number(row.occupancy ?? 0)
          const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0
          return {
            id: row.roomId,
            name: row.roomName || '—',
            percentage: pct,
          }
        })
      setRoomOccupancyPills(pills)
    } catch {
      setRoomOccupancyPills([])
    }
  }, [])

  useEffect(() => {
    setRoomFreeSlotsByDay({})
    fetchRoomAppointments(roomDate)
    fetchEmployeeFreePercentages(roomDate)
    fetchRoomOccupancy(roomDate)
  }, [roomDate, fetchRoomAppointments, fetchEmployeeFreePercentages, fetchRoomOccupancy])

  useEffect(() => {
    setSelectedRoomId((prev) => {
      if (!prev) return null
      return roomOccupancyPills.some((r) => r.id === prev) ? prev : null
    })
  }, [roomOccupancyPills])

  const handleRoomCardClick = useCallback(async (date: string, employeeId: string) => {
    try {
      const res = await getEmployeeFreeSlots(date, employeeId)
      const raw = res?.data
      const groups: EmployeeFreeSlotGroup[] = Array.isArray(raw)
        ? raw.map((row: any) => ({
            employeeId: String(row.employeeId ?? ''),
            employeeName: String(row.employeeName ?? '—'),
            freeSlots: Array.isArray(row.freeSlots) ? row.freeSlots.map(String) : [],
          }))
        : []
      const apiDate = typeof res?.date === 'string' ? res.date : date
      const missingEmployeeIds = Array.isArray(res?.missingEmployeeIds)
        ? res.missingEmployeeIds.map(String)
        : []
      setRoomFreeSlotsByDay((prev) => ({
        ...prev,
        [date]: {
          groups,
          apiDate,
          missingEmployeeIds,
        },
      }))
    } catch {
      setRoomFreeSlotsByDay((prev) => ({
        ...prev,
        [date]: {
          groups: [],
          apiDate: date,
          missingEmployeeIds: [],
        },
      }))
    }
  }, [])

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
    setRoomDate(date)
  }

  const handleAddAppointment = (presetDate?: Date, presetTime?: string) => {
    appointmentForm.reset()
    appointmentForm.setValue('selectedEventDate', presetDate ?? currentDate)
    if (presetTime) appointmentForm.setValue('uhrzeit', presetTime)
    if (selectedEmployeeDetails.length > 0) {
      appointmentForm.setValue('employees', selectedEmployeeDetails)
    }
    setIsAddModalOpen(true)
  }

  const handleSlotClick = (date: Date, time: string) => {
    handleAddAppointment(date, time)
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

  const handleDeleteClick = (appointmentId: string) => {
    setAppointmentIdToDelete(appointmentId)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!appointmentIdToDelete) return
    const ok = await deleteAppointmentById(appointmentIdToDelete)
    if (ok) {
      setIsDeleteConfirmOpen(false)
      setAppointmentIdToDelete(null)
      fetchAppointments()
    }
  }

  const handleEmployeeToggle = (employeeId: string, employeeName?: string) => {
    setSelectedEmployeeDetails((prev) => {
      const exists = prev.some((e) => e.employeeId === employeeId)
      if (exists) {
        return prev.filter((e) => e.employeeId !== employeeId)
      }
      if (prev.length >= 2) return prev
      if (!employeeName) return prev
      return [...prev, { employeeId, assignedTo: employeeName }]
    })
  }

  return (
    <>
      <div className="flex flex-col h-fit bg-gray-50 -m-4 relative">
        {/* Main Calendar Navbar */}
        <CalendarMainNav
          onAddAppointment={handleAddAppointment}
        />

        {/* Calendar Date Navigation Bar */}
        <CalendarNav
          currentDate={currentDate}
          onDateChange={handleDateChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-x-hidden gap-2">
          {/* Main Calendar */}
          <MainCalendarPage
            currentDate={currentDate}
            appointments={appointments}
            loading={appointmentsLoading}
            error={appointmentsError}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={handleSlotClick}
            onDeleteAppointment={handleDeleteClick}
            daysToShow={viewMode === 'day' ? 1 : 2}
          />

          {/* Right Sidebar */}
          <RightSidebarCalendar
            currentDate={currentDate}
            onDateSelect={handleDateChange}
            selectedEmployees={selectedEmployees}
            onEmployeeToggle={handleEmployeeToggle}
            viewMode={viewMode}
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
            form={appointmentForm as any}
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
            form={updateAppointmentForm as any}
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







        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => {
            setIsDeleteConfirmOpen(false)
            setAppointmentIdToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Termin löschen"
          message="Möchten Sie diesen Termin wirklich löschen?"
          confirmText="Löschen"
          cancelText="Abbrechen"
        />
      </div>

      {/* new room section */}
      <RoomHeader
        staff={staffFreePercentages}
        rooms={roomOccupancyPills}
        selectedStaffId={selectedStaffId}
        selectedRoomId={selectedRoomId}
        onStaffSelect={setSelectedStaffId}
        onRoomSelect={setSelectedRoomId}
      />
      <MainCard
        weekStart={roomDate}
        appointmentsByDay={roomAppointmentsByDay}
        freeSlotsByDay={roomFreeSlotsByDay}
        onCardAppointmentClick={handleRoomCardClick}
        onSlotClick={(date, slot) => {
          handleAddAppointment(date, presetTimeFromFreeSlot(slot))
        }}
      />
    </>
  )
}
