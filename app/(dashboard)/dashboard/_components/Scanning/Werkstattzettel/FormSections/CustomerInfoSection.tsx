import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import EmployeeDropdown from '../Dropdowns/EmployeeDropdown'
import LocationDropdown from '../Dropdowns/LocationDropdown'
import { calculateDeliveryDate, getMinimumDeliveryDate } from '../../utils/dateUtils'
import { cn } from '@/lib/utils'
import { User, MapPin, Mail, Calendar, Phone, Users } from 'lucide-react'

interface CustomerInfoSectionData {
  // Form values
  vorname: string
  nachname: string
  wohnort: string
  email: string
  mitarbeiter: string
  versorgung: string
  datumAuftrag: string
  telefonnummer: string
  geschaeftsstandort: {id: string; address: string; description: string; isPrimary?: boolean} | null
  fertigstellungBis: string
  fertigstellungBisTime: string
  quantity: string

  // Handlers
  onNameChange: (vorname: string, nachname: string) => void
  onWohnortChange: (value: string) => void
  onEmailChange: (value: string) => void
  onMitarbeiterChange: (value: string) => void
  onVersorgungChange: (value: string) => void
  onDatumAuftragChange: (value: string) => void
  onTelefonnummerChange: (value: string) => void
  onGeschaeftsstandortChange: (location: {id: string; address: string; description: string; isPrimary?: boolean} | null) => void
  onFertigstellungBisChange: (value: string) => void
  onFertigstellungBisTimeChange: (value: string) => void
  onQuantityChange: (value: string) => void

  // Employee dropdown
  employeeSearchText: string
  employeeSuggestions: Array<{ id: string; employeeName: string; email?: string }>
  employeeLoading: boolean
  isEmployeeDropdownOpen: boolean
  onEmployeeDropdownChange: (open: boolean) => void
  onEmployeeSearchChange: (value: string) => void

  // Location dropdown
  locations: Array<{id: string; address: string; description: string; isPrimary?: boolean}>
  isLocationDropdownOpen: boolean
  onLocationDropdownChange: (open: boolean) => void
  sameAsBusiness?: boolean

  // Date calculations
  completionDays?: string | number

  // Validation errors (optional)
  nameError?: string
  versorgungError?: string
  datumAuftragError?: string
  geschaeftsstandortError?: string
  fertigstellungBisError?: string
}

interface CustomerInfoSectionProps {
  data: CustomerInfoSectionData
}

export default function CustomerInfoSection({ data }: CustomerInfoSectionProps) {
  const {
    vorname,
    nachname,
    wohnort,
    email,
    mitarbeiter,
    versorgung,
    datumAuftrag,
    telefonnummer,
    geschaeftsstandort,
    fertigstellungBis,
    fertigstellungBisTime,
    quantity,
    onNameChange,
    onWohnortChange,
    onEmailChange,
    onMitarbeiterChange,
    onVersorgungChange,
    onDatumAuftragChange,
    onTelefonnummerChange,
    onGeschaeftsstandortChange,
    onFertigstellungBisChange,
    onFertigstellungBisTimeChange,
    onQuantityChange,
    employeeSearchText,
    employeeSuggestions,
    employeeLoading,
    isEmployeeDropdownOpen,
    onEmployeeDropdownChange,
    onEmployeeSearchChange,
    locations,
    isLocationDropdownOpen,
    onLocationDropdownChange,
    sameAsBusiness = true,
    completionDays,
    nameError,
    versorgungError,
    datumAuftragError,
    geschaeftsstandortError,
    fertigstellungBisError,
  } = data

  const [editableField, setEditableField] = useState<string | null>(null)

  const makeEditable = (field: string) => {
    setEditableField(field)
  }

  const isEditable = (field: string) => editableField === field
  const handleNameChange = (fullName: string) => {
    const nameParts = fullName.split(' ')
    onNameChange(nameParts[0] || '', nameParts.slice(1).join(' ') || '')
  }

  const handleOrderDateChange = (newOrderDate: string) => {
    onDatumAuftragChange(newOrderDate)

    if (newOrderDate) {
      const calculatedDeliveryDate = calculateDeliveryDate(newOrderDate, completionDays)
      const minimumDeliveryDate = getMinimumDeliveryDate(newOrderDate)

      // Use calculated date based on completionDays, or minimum if calculated is earlier
      const finalDeliveryDate =
        new Date(calculatedDeliveryDate) >= new Date(minimumDeliveryDate)
          ? calculatedDeliveryDate
          : minimumDeliveryDate

      onFertigstellungBisChange(finalDeliveryDate)
    }
  }

  // Generate hours (05-21) for 24-hour format and minutes (00, 10, 20, 30, 40, 50)
  const hours24 = Array.from({ length: 17 }, (_, i) => String(i + 5).padStart(2, '0')) // 05 to 21
  const minutes = ['00', '10', '20', '30', '40', '50']

  // Parse 24-hour time format
  const parseTime24Hour = (time24: string) => {
    if (!time24 || time24.trim() === '') return { hour: '', minute: '' }
    
    const [hour, minute] = time24.split(':')
    return {
      hour: hour || '',
      minute: minute || ''
    }
  }

  // Convert hour and minute to 24-hour format string
  const convertTo24Hour = (hour: string, minute: string) => {
    if (!hour || !minute) return ''
    return `${hour.padStart(2, '0')}:${minute}`
  }

  // Parse current time value to 24-hour format
  const { hour: currentHour, minute: currentMinute } = parseTime24Hour(fertigstellungBisTime || '')

  const handleHourChange = (hour: string) => {
    if (!hour || !currentMinute) {
      onFertigstellungBisTimeChange('')
      return
    }
    const newTime24 = convertTo24Hour(hour, currentMinute)
    onFertigstellungBisTimeChange(newTime24)
  }

  const handleMinuteChange = (minute: string) => {
    if (!currentHour || !minute) {
      onFertigstellungBisTimeChange('')
      return
    }
    const newTime24 = convertTo24Hour(currentHour, minute)
    onFertigstellungBisTimeChange(newTime24)
  }

  // Format date to DD.MM.YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  return (
    <div className="space-y-0">
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-8">
        <User className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider">Kunden- & Auftragsinfo</h3>
      </div>

      {/* Main Card Content - Display Only with flex row layout */}
      <div className="space-y-6 w-full">
        {/* Row 1: Name and Auftragsdatum */}
        <div className="flex flex-col md:flex-row justify-between gap-6 w-full">
          {/* Name */}
          <div className="flex items-start gap-3 md:w-1/2">
            <User className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Name</p>
              <p className="text-[15px] font-semibold text-gray-700">
                {`${vorname} ${nachname}`.trim() || '-'}
              </p>
              {nameError && (
                <p className="text-xs text-red-500 mt-1">{nameError}</p>
              )}
            </div>
          </div>

          {/* Auftragsdatum */}
          <div className="flex items-start gap-3 md:w-1/2">
            <Calendar className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Auftragsdatum</p>
              <p className="text-[15px] font-semibold text-gray-700">
                {formatDate(datumAuftrag) || '-'}
              </p>
              {datumAuftragError && (
                <p className="text-xs text-red-500 mt-1">{datumAuftragError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Adresse and Telefon */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Wohnort */}
          <div className="flex items-start gap-3 md:w-1/2">
            <MapPin className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Adresse / Wohnort</p>
              <p className="text-[15px] font-semibold text-gray-700">
                {wohnort || '-'}
              </p>
            </div>
          </div>

          {/* Telefon */}
          <div className="flex items-start gap-3 md:w-1/2">
            <Phone className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Telefon</p>
              <p className="text-[15px] font-semibold text-gray-700">
                {telefonnummer || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Row 3: Email and Auftrag Erstellt Von */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Email */}
          <div className="flex items-start gap-3 md:w-1/2">
            <Mail className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">E-Mail</p>
              <p className="text-[15px] font-semibold text-gray-700 break-all">
                {email || '-'}
              </p>
            </div>
          </div>

          {/* Auftrag Erstellt Von */}
          <div className="flex items-start gap-3 md:w-1/2">
            <Users className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Auftrag erstellt von</p>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-green-600">
                  {mitarbeiter || ''}
                </p>
                {/* Green indicator dot */}
                {(mitarbeiter || '') && (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

