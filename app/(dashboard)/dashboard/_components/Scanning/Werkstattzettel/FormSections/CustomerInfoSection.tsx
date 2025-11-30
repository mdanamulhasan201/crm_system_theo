import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import EmployeeDropdown from '../Dropdowns/EmployeeDropdown'
import LocationDropdown from '../Dropdowns/LocationDropdown'
import PaymentStatusSection from './PaymentStatusSection'
import { calculateDeliveryDate, getMinimumDeliveryDate } from '../../utils/dateUtils'

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
  } = data
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
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Name Kunde</Label>
          <Input
            placeholder="Einkaufspreis"
            value={`${vorname} ${nachname}`.trim()}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Wohnort</Label>
          <Input
            placeholder="Hamburg"
            value={wohnort}
            onChange={(e) => onWohnortChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">E-Mail</Label>
          <Input
            type="email"
            placeholder="Mustermann.Max@gmail.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Versorgung</Label>
          <Input
            placeholder="Rohling 339821769, mit Pelotte"
            value={versorgung}
            onChange={(e) => onVersorgungChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Datum des Auftrags</Label>
          <Input
            type="date"
            placeholder="01.02.2025"
            value={datumAuftrag}
            onChange={(e) => handleOrderDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Telefon</Label>
          <Input
            placeholder="+49 432 234 23"
            value={telefonnummer}
            onChange={(e) => onTelefonnummerChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Geschäftstandort</Label>
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
            <Input
              placeholder="Geschäftstandort eingeben"
              value={geschaeftsstandort}
              onChange={(e) => onGeschaeftsstandortChange(e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Fertigstellung bis</Label>
          <Input
            type="date"
            placeholder="10.02.2025"
            value={fertigstellungBis}
            onChange={(e) => onFertigstellungBisChange(e.target.value)}
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
        </div>

        <PaymentStatusSection value={bezahlt} onChange={onBezahltChange} />
      </div>
    </div>
  )
}

