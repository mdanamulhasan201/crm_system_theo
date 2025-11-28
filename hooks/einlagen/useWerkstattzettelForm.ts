import { useState, useEffect } from 'react'
import { ScanData } from '@/types/scan'
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee'
import { initializeFormData } from '../../app/(dashboard)/dashboard/_components/Scanning/utils/formDataUtils'
import { initializeDeliveryDate } from '../../app/(dashboard)/dashboard/_components/Scanning/utils/dateUtils'
import toast from 'react-hot-toast'
import { getRequiredDeliveryDate } from '../../app/(dashboard)/dashboard/_components/Scanning/utils/dateUtils'

interface FormData {
  ausführliche_diagnose?: string
  versorgung_laut_arzt?: string
  einlagentyp?: string
  überzug?: string
  menge?: number
  versorgung?: string
  versorgung_note?: string
  schuhmodell_wählen?: string
  kostenvoranschlag?: boolean
  employeeName?: string
  employeeId?: string
  selectedVersorgungData?: any
}

export function useWerkstattzettelForm(
  scanData: ScanData | null,
  isOpen: boolean,
  formData?: FormData | null
) {
  // Customer Information State
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [email, setEmail] = useState('')
  const [telefonnummer, setTelefonnummer] = useState('')
  const [wohnort, setWohnort] = useState('')
  const [mitarbeiter, setMitarbeiter] = useState('')
  const [versorgung, setVersorgung] = useState('')
  const [datumAuftrag, setDatumAuftrag] = useState('')
  const [geschaeftsstandort, setGeschaeftsstandort] = useState('')
  const [fertigstellungBis, setFertigstellungBis] = useState('')
  const [bezahlt, setBezahlt] = useState('')

  // Business location dropdown state
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)

  // Price State
  const [footAnalysisPrice, setFootAnalysisPrice] = useState<string>('')
  const [insoleSupplyPrice, setInsoleSupplyPrice] = useState<string>('')
  const [customFootPrice, setCustomFootPrice] = useState<string>('')
  const [customInsolePrice, setCustomInsolePrice] = useState<string>('')

  // Employee search functionality
  const {
    searchText,
    suggestions: employeeSuggestions,
    loading: employeeLoading,
    setShowSuggestions,
    handleChange: handleEmployeeSearchChange,
  } = useSearchEmployee()

  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState<string>('')

  // Initialize form data from scanData
  useEffect(() => {
    if (scanData) {
      const initialized = initializeFormData(scanData, formData)
      setVorname(initialized.vorname)
      setNachname(initialized.nachname)
      setEmail(initialized.email)
      setTelefonnummer(initialized.telefonnummer)
      setWohnort(initialized.wohnort)
      setMitarbeiter(initialized.mitarbeiter)
      setVersorgung(initialized.versorgung)
      setDatumAuftrag(initialized.datumAuftrag)
      setGeschaeftsstandort(initialized.geschaeftsstandort)
      setBezahlt(initialized.bezahlt)
      setFootAnalysisPrice(initialized.footAnalysisPrice)
      setInsoleSupplyPrice(initialized.insoleSupplyPrice)

      // Initialize delivery date
      const deliveryDate = initializeDeliveryDate(scanData, formData)
      setFertigstellungBis(deliveryDate)

      // Set employeeId from formData if available
      if (formData?.employeeId) {
        setEmployeeId(formData.employeeId)
      }
    }

    // Update from formData when modal opens
    if (formData && isOpen) {
      if (formData.employeeName) {
        setMitarbeiter(formData.employeeName)
      }
      if (formData.employeeId) {
        setEmployeeId(formData.employeeId)
      }
      if (formData.versorgung) {
        setVersorgung(formData.versorgung)
      }
    }
  }, [scanData, isOpen, formData])

  // Handle employee selection
  const handleEmployeeSelect = (employeeName: string) => {
    setMitarbeiter(employeeName)
    setIsEmployeeDropdownOpen(false)
  }

  // Handle dropdown open/close
  const handleEmployeeDropdownChange = (open: boolean) => {
    setIsEmployeeDropdownOpen(open)
    setShowSuggestions(open)
  }

  // Handle business location selection
  const handleLocationSelect = (location: string) => {
    setGeschaeftsstandort(location)
    setIsLocationDropdownOpen(false)
  }

  // Handle business location dropdown open/close
  const handleLocationDropdownChange = (open: boolean) => {
    setIsLocationDropdownOpen(open)
  }

  // Handle delivery date change with validation
  const handleDeliveryDateChange = (newDeliveryDate: string) => {
    if (datumAuftrag && newDeliveryDate) {
      const completionDays = (scanData as any)?.workshopNote?.completionDays
      const requiredDate = getRequiredDeliveryDate(datumAuftrag, completionDays)

      // If selected delivery date is earlier than required, show warning and set required date
      if (new Date(newDeliveryDate) < new Date(requiredDate)) {
        const daysText = completionDays ? `${completionDays} Tage` : '5 Tage'
        toast.error(
          `Fertigstellung muss mindestens ${daysText} nach Auftragsdatum sein. Minimum: ${requiredDate}`
        )
        setFertigstellungBis(requiredDate)
        return
      }
    }
    setFertigstellungBis(newDeliveryDate)
  }

  return {
    // Form state
    vorname,
    setVorname,
    nachname,
    setNachname,
    email,
    setEmail,
    telefonnummer,
    setTelefonnummer,
    wohnort,
    setWohnort,
    mitarbeiter,
    setMitarbeiter,
    versorgung,
    setVersorgung,
    datumAuftrag,
    setDatumAuftrag,
    geschaeftsstandort,
    setGeschaeftsstandort,
    fertigstellungBis,
    setFertigstellungBis,
    bezahlt,
    setBezahlt,
    employeeId,
    setEmployeeId,

    // Price state
    footAnalysisPrice,
    setFootAnalysisPrice,
    insoleSupplyPrice,
    setInsoleSupplyPrice,
    customFootPrice,
    setCustomFootPrice,
    customInsolePrice,
    setCustomInsolePrice,

    // Employee dropdown state
    employeeSearchText: searchText,
    employeeSuggestions,
    employeeLoading,
    isEmployeeDropdownOpen,
    handleEmployeeDropdownChange,
    handleEmployeeSearchChange,
    handleEmployeeSelect,

    // Location dropdown state
    isLocationDropdownOpen,
    handleLocationDropdownChange,
    handleLocationSelect,

    // Handlers
    handleDeliveryDateChange,
  }
}

