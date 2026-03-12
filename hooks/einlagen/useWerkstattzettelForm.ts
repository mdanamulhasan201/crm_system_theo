import { useState, useEffect, useRef } from 'react'
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
  menge?: number | string
  quantity?: number | string
  versorgung?: string
  versorgung_note?: string
  schuhmodell_wählen?: string
  kostenvoranschlag?: boolean
  employeeName?: string
  employeeId?: string
  selectedVersorgungData?: any
  billingType?: 'Krankenkassa' | 'Privat'
  bezahlt?: string
  paymentStatus?: string
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
  const [geschaeftsstandort, setGeschaeftsstandort] = useState<{id: string; address: string; description: string; isPrimary?: boolean} | null>(null)
  const [auftragAngenommenBei, setAuftragAngenommenBei] = useState<{id: string; address: string; description: string; isPrimary?: boolean} | null>(null)
  const [fertigstellungBis, setFertigstellungBis] = useState('')
  const [fertigstellungBisTime, setFertigstellungBisTime] = useState('')
  const [bezahlt, setBezahlt] = useState('')
  const [quantity, setQuantity] = useState<string>('1 paar')
  const [discountType, setDiscountType] = useState<string>('')
  const [discountValue, setDiscountValue] = useState<string>('')
  const [addonPrices, setAddonPrices] = useState<string>('')

  // Business location dropdown state (for Abholung)
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  // Auftrag angenommen bei dropdown state
  const [isAuftragLocationDropdownOpen, setIsAuftragLocationDropdownOpen] = useState(false)

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

  // Only initialize when modal opens (isOpen becomes true). Do NOT re-run when formData
  // changes (e.g. after "Weiter" click) so user's selections in the modal are not cleared.
  const didInitForOpenRef = useRef(false)
  useEffect(() => {
    if (!isOpen) {
      didInitForOpenRef.current = false
      return
    }
    // Run initialization only once per modal open
    if (!scanData) return
    if (didInitForOpenRef.current) return
    didInitForOpenRef.current = true

    const initialized = initializeFormData(scanData, formData)
    setVorname(initialized.vorname)
    setNachname(initialized.nachname)
    setEmail(initialized.email)
    setTelefonnummer(initialized.telefonnummer)
    setWohnort(initialized.wohnort)
    setMitarbeiter(initialized.mitarbeiter)
    setVersorgung(initialized.versorgung)
    setDatumAuftrag(initialized.datumAuftrag)
    setGeschaeftsstandort(null)
    const preferredBezahlt =
      formData?.bezahlt ||
      formData?.paymentStatus ||
      initialized.bezahlt ||
      (formData?.billingType === 'Krankenkassa'
        ? 'Krankenkasse_Genehmigt'
        : formData?.billingType === 'Privat'
          ? 'Privat_Bezahlt'
          : '')
    setBezahlt(preferredBezahlt)
    setFootAnalysisPrice(initialized.footAnalysisPrice)
    setInsoleSupplyPrice(initialized.insoleSupplyPrice)

    const deliveryDate = initializeDeliveryDate(scanData, formData)
    setFertigstellungBis(deliveryDate)

    if (formData?.employeeId) {
      setEmployeeId(formData.employeeId)
    }
    if (formData?.employeeName) {
      setMitarbeiter(formData.employeeName)
    }
    if (formData?.versorgung) {
      setVersorgung(formData.versorgung)
    }
    const quantitySource = formData?.quantity ?? formData?.menge
    if (quantitySource != null) {
      const quantityValue = typeof quantitySource === 'number'
        ? `${quantitySource} paar`
        : String(quantitySource)
      setQuantity(quantityValue)
    } else {
      setQuantity('1 paar')
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

  // Handle business location selection (Abholung)
  const handleLocationSelect = (location: {id: string; address: string; description: string; isPrimary?: boolean} | null) => {
    setGeschaeftsstandort(location)
    setIsLocationDropdownOpen(false)
  }

  // Handle Auftrag angenommen bei location selection
  const handleAuftragLocationSelect = (location: {id: string; address: string; description: string; isPrimary?: boolean} | null) => {
    setAuftragAngenommenBei(location)
    setIsAuftragLocationDropdownOpen(false)
  }

  // Handle business location dropdown open/close
  const handleLocationDropdownChange = (open: boolean) => {
    setIsLocationDropdownOpen(open)
  }

  const handleAuftragLocationDropdownChange = (open: boolean) => {
    setIsAuftragLocationDropdownOpen(open)
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
    auftragAngenommenBei,
    setAuftragAngenommenBei,
    fertigstellungBis,
    setFertigstellungBis,
    fertigstellungBisTime,
    setFertigstellungBisTime,
    bezahlt,
    setBezahlt,
    employeeId,
    setEmployeeId,
    quantity,
    setQuantity,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    addonPrices,
    setAddonPrices,

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
    isAuftragLocationDropdownOpen,
    handleAuftragLocationDropdownChange,
    handleAuftragLocationSelect,

    // Handlers
    handleDeliveryDateChange,
  }
}

