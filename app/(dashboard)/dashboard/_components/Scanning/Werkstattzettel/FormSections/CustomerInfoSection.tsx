import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import EmployeeDropdown from '../Dropdowns/EmployeeDropdown'
import LocationDropdown from '../Dropdowns/LocationDropdown'
import { calculateDeliveryDate, getMinimumDeliveryDate } from '../../utils/dateUtils'
import { cn } from '@/lib/utils'

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
  geschaeftsstandort: string
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
  onGeschaeftsstandortChange: (value: string) => void
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
  locations: string[]
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

  // Generate hours (01-12) for 12-hour format and minutes (00, 10, 20, 30, 40, 50)
  const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutes = ['00', '10', '20', '30', '40', '50']
  // German labels for AM/PM
  const ampmOptions = [
    { value: 'AM', label: 'Vormittag' },
    { value: 'PM', label: 'Nachmittag' }
  ]

  // Convert 24-hour to 12-hour format
  const parseTimeTo12Hour = (time24: string) => {
    if (!time24 || time24.trim() === '') return { hour: '', minute: '', ampm: '' }
    
    const [hour24, minute] = time24.split(':')
    const hourNum = parseInt(hour24 || '0', 10)
    let hour12: number
    if (hourNum === 0) {
      hour12 = 12 // 00:xx becomes 12:xx AM
    } else if (hourNum === 12) {
      hour12 = 12 // 12:xx becomes 12:xx PM
    } else if (hourNum > 12) {
      hour12 = hourNum - 12 // 13-23 becomes 1-11 PM
    } else {
      hour12 = hourNum // 1-11 stays 1-11 AM
    }
    const ampm = hourNum < 12 ? 'AM' : 'PM'
    
    return {
      hour: String(hour12).padStart(2, '0'),
      minute: minute || '',
      ampm
    }
  }

  // Convert 12-hour to 24-hour format
  const convert12To24Hour = (hour12: string, minute: string, ampm: string) => {
    if (!hour12 || !minute || !ampm) return ''
    
    let hour24 = parseInt(hour12, 10)
    if (ampm === 'AM') {
      // AM: 12 becomes 0, 1-11 stay as is
      hour24 = hour24 === 12 ? 0 : hour24
    } else {
      // PM: 12 stays 12, 1-11 become 13-23
      hour24 = hour24 === 12 ? 12 : hour24 + 12
    }
    return `${String(hour24).padStart(2, '0')}:${minute}`
  }

  // Parse current time value to 12-hour format
  const { hour: currentHour, minute: currentMinute, ampm: currentAmPm } = parseTimeTo12Hour(fertigstellungBisTime || '')

  const handleHourChange = (hour: string) => {
    if (!hour || !currentMinute || !currentAmPm) {
      onFertigstellungBisTimeChange('')
      return
    }
    const newTime24 = convert12To24Hour(hour, currentMinute, currentAmPm)
    onFertigstellungBisTimeChange(newTime24)
  }

  const handleMinuteChange = (minute: string) => {
    if (!currentHour || !minute || !currentAmPm) {
      onFertigstellungBisTimeChange('')
      return
    }
    const newTime24 = convert12To24Hour(currentHour, minute, currentAmPm)
    onFertigstellungBisTimeChange(newTime24)
  }

  const handleAmPmChange = (ampm: string) => {
    if (!currentHour || !currentMinute || !ampm) {
      onFertigstellungBisTimeChange('')
      return
    }
    const newTime24 = convert12To24Hour(currentHour, currentMinute, ampm)
    onFertigstellungBisTimeChange(newTime24)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        <div className="space-y-2" onClick={() => makeEditable('name')}>
          <Label className="text-sm font-medium text-gray-700">Name Kunde</Label>
          <Input
            placeholder="Einkaufspreis"
            value={`${vorname} ${nachname}`.trim()}
            onChange={(e) => handleNameChange(e.target.value)}
            readOnly={!isEditable('name')}
            className={cn(
              !isEditable('name') && 'bg-gray-50 cursor-pointer',
              nameError && 'border-red-500 focus-visible:ring-red-500'
            )}
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1">{nameError}</p>
          )}
        </div>

        <div className="space-y-2" onClick={() => makeEditable('wohnort')}>
          <Label className="text-sm font-medium text-gray-700">Wohnort</Label>
          <Input
            placeholder="Hamburg"
            value={wohnort}
            onChange={(e) => onWohnortChange(e.target.value)}
            readOnly={!isEditable('wohnort')}
            className={cn(
              !isEditable('wohnort') && 'bg-gray-50 cursor-pointer'
            )}
          />
        </div>

        <div className="space-y-2" onClick={() => makeEditable('email')}>
          <Label className="text-sm font-medium text-gray-700">E-Mail</Label>
          <Input
            type="email"
            placeholder="Mustermann.Max@gmail.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            readOnly={!isEditable('email')}
            className={cn(
              !isEditable('email') && 'bg-gray-50 cursor-pointer'
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Mitarbeiter</Label>
          <EmployeeDropdown
            value={mitarbeiter}
            searchText={employeeSearchText}
            suggestions={employeeSuggestions}
            loading={employeeLoading}
            isOpen={isEmployeeDropdownOpen}
            onOpenChange={onEmployeeDropdownChange}
            onSearchChange={onEmployeeSearchChange}
            onSelect={onMitarbeiterChange}
          />
        </div>


      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div className="space-y-2" onClick={() => makeEditable('datumAuftrag')}>
          <Label className="text-sm font-medium text-gray-700">Datum des Auftrags</Label>
          <Input
            type="date"
            placeholder="01.02.2025"
            value={datumAuftrag}
            onChange={(e) => handleOrderDateChange(e.target.value)}
            readOnly={!isEditable('datumAuftrag')}
            className={cn(
              !isEditable('datumAuftrag') && 'bg-gray-50 cursor-pointer',
              datumAuftragError && 'border-red-500 focus-visible:ring-red-500'
            )}
          />
          {datumAuftragError && (
            <p className="text-xs text-red-500 mt-1">{datumAuftragError}</p>
          )}
        </div>

        <div className="space-y-2" onClick={() => makeEditable('telefonnummer')}>
          <Label className="text-sm font-medium text-gray-700">Telefon</Label>
          <Input
            placeholder="+49 432 234 23"
            value={telefonnummer}
            onChange={(e) => onTelefonnummerChange(e.target.value)}
            readOnly={!isEditable('telefonnummer')}
            className={cn(
              !isEditable('telefonnummer') && 'bg-gray-50 cursor-pointer'
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Filiale</Label>
          {sameAsBusiness ? (
            <LocationDropdown
              value={geschaeftsstandort}
              locations={locations}
              isOpen={isLocationDropdownOpen}
              onOpenChange={onLocationDropdownChange}
              onChange={onGeschaeftsstandortChange}
              onSelect={onGeschaeftsstandortChange}
            />
          ) : (
            <div className="space-y-2" onClick={() => makeEditable('geschaeftsstandort')}>
              <Input
                placeholder="Geschäftstandort eingeben"
                value={geschaeftsstandort}
                onChange={(e) => onGeschaeftsstandortChange(e.target.value)}
                readOnly={!isEditable('geschaeftsstandort')}
                className={cn(
                  !isEditable('geschaeftsstandort') && 'bg-gray-50 cursor-pointer',
                  geschaeftsstandortError && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
            </div>
          )}
          {geschaeftsstandortError && (
            <p className="text-xs text-red-500 mt-1">{geschaeftsstandortError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Fertigstellung bis</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="10.02.2025"
              value={fertigstellungBis}
              onChange={(e) => onFertigstellungBisChange(e.target.value)}
              className={cn(
                fertigstellungBisError && 'border-red-500 focus-visible:ring-red-500'
              )}
              min={
                datumAuftrag
                  ? (() => {
                      const calculated = calculateDeliveryDate(datumAuftrag, completionDays)
                      const minimum = getMinimumDeliveryDate(datumAuftrag)
                      return new Date(calculated) >= new Date(minimum)
                        ? calculated
                        : minimum
                    })()
                  : undefined
              }
            />
            {/* Custom Time Picker - 12-hour format with German labels (Vormittag/Nachmittag) */}
            <div className="flex items-center justify-center gap-1 flex-1 border border-input bg-background rounded-md px-3 h-10 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <Select value={currentHour || undefined} onValueChange={handleHourChange}>
                <SelectTrigger className="h-8 p-0 border-0 shadow-none focus:ring-0 w-auto min-w-[2.5rem] [&>span]:flex [&>span]:items-center [&>span]:justify-center">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {hours12.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-base font-medium">:</span>
              <Select value={currentMinute || undefined} onValueChange={handleMinuteChange}>
                <SelectTrigger className="h-8 p-0 border-0 shadow-none focus:ring-0 w-auto min-w-[2.5rem] [&>span]:flex [&>span]:items-center [&>span]:justify-center">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={currentAmPm || undefined} onValueChange={handleAmPmChange}>
                <SelectTrigger className="h-8 p-0 border-0 shadow-none focus:ring-0 w-auto min-w-[4rem] ml-1 [&>span]:flex [&>span]:items-center [&>span]:justify-center">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {ampmOptions.map((ampm) => (
                    <SelectItem key={ampm.value} value={ampm.value}>
                      {ampm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {fertigstellungBisError && (
            <p className="text-xs text-red-500 mt-1">{fertigstellungBisError}</p>
          )}
        </div>
      </div>

      {/* Versorgung and Menge - Full width side by side */}
      <div className="col-span-1 md:col-span-2">
        <div className="flex gap-4 w-full">
          <div className="space-y-2 flex-1" onClick={() => makeEditable('versorgung')}>
            <Label className="text-sm font-medium text-gray-700">Versorgung</Label>
            <Input
              placeholder="Rohling 339821769, mit Pelotte"
              value={versorgung}
              onChange={(e) => onVersorgungChange(e.target.value)}
              readOnly={!isEditable('versorgung')}
              className={cn(
                !isEditable('versorgung') && 'bg-gray-50 cursor-pointer',
                versorgungError && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {versorgungError && (
              <p className="text-xs text-red-500 mt-1">{versorgungError}</p>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <Label className="text-sm font-medium text-gray-700">Menge</Label>
            <Select value={quantity} onValueChange={onQuantityChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Menge wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 paar">1 Paar</SelectItem>
                <SelectItem value="2 paar">2 Paare</SelectItem>
                <SelectItem value="3 paar">3 Paare</SelectItem>
                <SelectItem value="4 paar">4 Paare</SelectItem>
                <SelectItem value="5 paar">5 Paare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

