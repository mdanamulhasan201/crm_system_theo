import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import EmployeeDropdown from '../Dropdowns/EmployeeDropdown'
import LocationDropdown from '../Dropdowns/LocationDropdown'
import PaymentStatusSection from './PaymentStatusSection'
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
  bezahlt: string

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
  onBezahltChange: (value: string) => void

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
  paymentError?: string
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
    bezahlt,
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
    onBezahltChange,
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
    paymentError,
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

        <div className="space-y-2" onClick={() => makeEditable('versorgung')}>
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
            <Input
              type="time"
              value={fertigstellungBisTime}
              onChange={(e) => onFertigstellungBisTimeChange(e.target.value)}
            />
          </div>
          {fertigstellungBisError && (
            <p className="text-xs text-red-500 mt-1">{fertigstellungBisError}</p>
          )}
        </div>

        <PaymentStatusSection
          value={bezahlt}
          onChange={onBezahltChange}
          error={paymentError}
        />
      </div>
    </div>
  )
}

