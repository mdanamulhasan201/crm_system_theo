import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScanData } from '@/types/scan'
import toast from 'react-hot-toast'
import { useWerkstattzettelForm } from '../../../../../hooks/einlagen/useWerkstattzettelForm'
import CustomerInfoSection from './Werkstattzettel/FormSections/CustomerInfoSection'
import PriceSection from './Werkstattzettel/FormSections/PriceSection'
import { createWerkstattzettelPayload } from './utils/formDataUtils'
import { getSettingData } from '@/apis/einlagenApis'
import { getAllLocations } from '@/apis/setting/locationManagementApis'
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types'

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
  screenerId?: string | null
}

interface UserInfoUpdateModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  scanData: ScanData | null
  formData?: FormData | null
  onShowOrderConfirmation?: (formData?: FormData) => void
}

export default function WerkstattzettelModal({
  isOpen,
  onOpenChange,
  scanData,
  formData,
  onShowOrderConfirmation,
}: UserInfoUpdateModalProps) {

  // Use custom hook for form state management
  const form = useWerkstattzettelForm(scanData, isOpen, formData)

  // Local validation error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Settings data state
  const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)
  const [locations, setLocations] = useState<Array<{id: string; address: string; description: string; isPrimary: boolean}>>([])
  const [locationsLoading, setLocationsLoading] = useState(false)

  // Extract Einlagenversorgung price from selected versorgung
  const einlagenversorgungPrice = React.useMemo(() => {
    const selectedData = formData?.selectedVersorgungData
    if (!selectedData) {
      return []
    }
    
    // Check for price in supplyStatus
    const price = selectedData?.supplyStatus?.price
    if (price !== undefined && price !== null && !isNaN(Number(price))) {
      const priceNumber = Number(price)
      return [priceNumber]
    }
    
    return []
  }, [formData?.selectedVersorgungData])

  // Auto-set Einlagenversorgung price when versorgung is selected
  useEffect(() => {
    if (isOpen && formData?.selectedVersorgungData?.supplyStatus?.price) {
      const price = String(formData.selectedVersorgungData.supplyStatus.price)
      // Always update the price when versorgung changes, even if there's already a value
      if (form.insoleSupplyPrice !== price) {
        form.setInsoleSupplyPrice(price)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData?.selectedVersorgungData?.supplyStatus?.price])

  // Fetch settings data when modal opens
  useEffect(() => {
    const fetchSettings = async () => {
      if (isOpen) {
        setPricesLoading(true)
        try {
          const response = await getSettingData()
          if (response?.data?.laser_print_prices && Array.isArray(response.data.laser_print_prices)) {
            // Handle both old format (numbers) and new format (objects with name and price)
            const formattedPrices: PriceItem[] = response.data.laser_print_prices
              .map((item: any) => {
                // Handle old format (just numbers)
                if (typeof item === 'number') {
                  return { name: `Preis ${item}`, price: item };
                }
                // Handle new format (objects with name and price)
                if (item && typeof item === 'object' && item.name && item.price !== undefined) {
                  return { name: item.name, price: item.price };
                }
                return null;
              })
              .filter((item: PriceItem | null): item is PriceItem => item !== null);
            setLaserPrintPrices(formattedPrices);
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error)
          toast.error('Fehler beim Laden der Einstellungen')
        } finally {
          setPricesLoading(false)
        }
      }
    }
    fetchSettings()
  }, [isOpen])

  // Fetch locations from API when modal opens
  useEffect(() => {
    const fetchLocations = async () => {
      if (isOpen) {
        setLocationsLoading(true)
        try {
          const response = await getAllLocations(1, 100)
          if (response?.success && response?.data && Array.isArray(response.data)) {
            setLocations(response.data)
          } else if (Array.isArray(response?.data)) {
            setLocations(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch locations:', error)
          // Don't show error toast, just use empty array as fallback
          setLocations([])
        } finally {
          setLocationsLoading(false)
        }
      }
    }
    fetchLocations()
  }, [isOpen])

  // Get workshopNote settings
  const workshopNote = (scanData as any)?.workshopNote
  const sameAsBusiness = workshopNote?.sameAsBusiness ?? true
  
  // Get completionDays for date calculations
  const completionDays = workshopNote?.completionDays

  // Convert locations to string array for dropdown (use description or address)
  const locationOptions = locations.map(loc => loc.description || loc.address)

  // Set primary location as default when locations are loaded (always override)
  useEffect(() => {
    if (locations.length > 0 && isOpen) {
      const primaryLocation = locations.find(loc => loc.isPrimary)
      if (primaryLocation) {
        const locationValue = primaryLocation.description || primaryLocation.address
        form.setGeschaeftsstandort(locationValue)
      } else {
        // If no primary, use first location
        const locationValue = locations[0].description || locations[0].address
        form.setGeschaeftsstandort(locationValue)
      }
    }
  }, [locations, isOpen, form])

  // Basic validation for required fields
  const validateForm = () => {
    const errors: Record<string, string> = {}

    const fullNameValid = !!(form.vorname?.trim() || form.nachname?.trim())
    if (!fullNameValid) {
      errors.name = 'Name ist erforderlich'
    }
    if (!form.versorgung?.trim()) {
      errors.versorgung = 'Versorgung ist erforderlich'
    }
    if (!form.datumAuftrag) {
      errors.datumAuftrag = 'Datum des Auftrags ist erforderlich'
    }
    if (!form.geschaeftsstandort?.trim()) {
      errors.geschaeftsstandort = 'Geschäftstandort ist erforderlich'
    }
    if (!form.fertigstellungBis) {
      errors.fertigstellungBis = 'Fertigstellungsdatum ist erforderlich'
    }
    if (!form.footAnalysisPrice) {
      errors.footAnalysisPrice = 'Preis für Fußanalyse ist erforderlich'
    }
    if (!form.insoleSupplyPrice) {
      errors.insoleSupplyPrice = 'Preis für Einlagenversorgung ist erforderlich'
    }
    if (!form.bezahlt?.trim()) {
      errors.bezahlt = 'Kostenträger ist erforderlich'
    }

    // If custom prices are selected, the custom value must not be empty
    if (form.footAnalysisPrice === 'custom' && !form.customFootPrice?.trim()) {
      errors.customFootPrice = 'Benutzerdefinierter Preis für Fußanalyse ist erforderlich'
    }
    if (form.insoleSupplyPrice === 'custom' && !form.customInsolePrice?.trim()) {
      errors.customInsolePrice = 'Benutzerdefinierter Preis für Einlagenversorgung ist erforderlich'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder im Werkstattzettel aus.')
      return false
    }

    return true
  }

  // Clear errors reactively when values become valid
  useEffect(() => {
    setFieldErrors((prev) => {
      const next = { ...prev }

      const fullNameValid = !!(form.vorname?.trim() || form.nachname?.trim())
      if (fullNameValid && next.name) {
        delete next.name
      }
      if (form.versorgung?.trim() && next.versorgung) {
        delete next.versorgung
      }
      if (form.datumAuftrag && next.datumAuftrag) {
        delete next.datumAuftrag
      }
      if (form.geschaeftsstandort?.trim() && next.geschaeftsstandort) {
        delete next.geschaeftsstandort
      }
      if (form.fertigstellungBis && next.fertigstellungBis) {
        delete next.fertigstellungBis
      }
      if (form.footAnalysisPrice && next.footAnalysisPrice) {
        delete next.footAnalysisPrice
      }
      if (form.insoleSupplyPrice && next.insoleSupplyPrice) {
        delete next.insoleSupplyPrice
      }
      if (form.customFootPrice?.trim() && next.customFootPrice) {
        delete next.customFootPrice
      }
      if (form.customInsolePrice?.trim() && next.customInsolePrice) {
        delete next.customInsolePrice
      }
      if (form.bezahlt?.trim() && next.bezahlt) {
        delete next.bezahlt
      }

      return next
    })
  }, [
    form.vorname,
    form.nachname,
    form.versorgung,
    form.datumAuftrag,
    form.geschaeftsstandort,
    form.fertigstellungBis,
    form.footAnalysisPrice,
    form.insoleSupplyPrice,
    form.customFootPrice,
    form.customInsolePrice,
    form.bezahlt,
  ])

  const handleSave = async () => {
    if (!scanData?.id) {
      toast.error('Customer ID not found')
      return
    }

    // Validate before saving
    const isValid = validateForm()
    if (!isValid) {
      return
    }

    try {
      // Create payload using utility function
      const werkstattzettelPayload = createWerkstattzettelPayload(
        {
          vorname: form.vorname,
          nachname: form.nachname,
          email: form.email,
          telefonnummer: form.telefonnummer,
          wohnort: form.wohnort,
          mitarbeiter: form.mitarbeiter,
          versorgung: form.versorgung,
          datumAuftrag: form.datumAuftrag,
          geschaeftsstandort: form.geschaeftsstandort,
          fertigstellungBis: form.fertigstellungBis,
          fertigstellungBisTime: form.fertigstellungBisTime,
          bezahlt: form.bezahlt,
          employeeId: form.employeeId,
          footAnalysisPrice: form.footAnalysisPrice,
          insoleSupplyPrice: form.insoleSupplyPrice,
        },
        scanData.id
      )

      // Combine formData with werkstattzettel payload
      const combinedFormData = {
        ...formData,
        ...werkstattzettelPayload,
      }

      // Do NOT close the Werkstattzettel modal here.
      // We only show the order confirmation modal and
      // keep this modal open until the order flow succeeds.
      onShowOrderConfirmation?.(combinedFormData || undefined)
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || err?.message || 'Speichern fehlgeschlagen'
      toast.error(apiMessage)
    }
  }

  const handleNameChange = (vorname: string, nachname: string) => {
    form.setVorname(vorname)
    form.setNachname(nachname)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold">Werkstattzettel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Customer Information Section - styled as overview card */}
          <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-[#7583a0] uppercase">
              AUFTRAGSÜBERSICHT
            </h3>
            <CustomerInfoSection
              data={{
                vorname: form.vorname,
                nachname: form.nachname,
                wohnort: form.wohnort,
                email: form.email,
                mitarbeiter: form.mitarbeiter,
                versorgung: form.versorgung,
                datumAuftrag: form.datumAuftrag,
                telefonnummer: form.telefonnummer,
                geschaeftsstandort: form.geschaeftsstandort,
                fertigstellungBis: form.fertigstellungBis,
                fertigstellungBisTime: form.fertigstellungBisTime,
                bezahlt: form.bezahlt,
                onNameChange: handleNameChange,
                onWohnortChange: form.setWohnort,
                onEmailChange: form.setEmail,
                onMitarbeiterChange: form.setMitarbeiter,
                onVersorgungChange: form.setVersorgung,
                onDatumAuftragChange: form.setDatumAuftrag,
                onTelefonnummerChange: form.setTelefonnummer,
                onGeschaeftsstandortChange: form.setGeschaeftsstandort,
                onFertigstellungBisChange: form.handleDeliveryDateChange,
                onFertigstellungBisTimeChange: form.setFertigstellungBisTime,
                onBezahltChange: form.setBezahlt,
                employeeSearchText: form.employeeSearchText,
                employeeSuggestions: form.employeeSuggestions,
                employeeLoading: form.employeeLoading,
                isEmployeeDropdownOpen: form.isEmployeeDropdownOpen,
                onEmployeeDropdownChange: form.handleEmployeeDropdownChange,
                onEmployeeSearchChange: form.handleEmployeeSearchChange,
                locations: locationOptions,
                isLocationDropdownOpen: form.isLocationDropdownOpen,
                onLocationDropdownChange: form.handleLocationDropdownChange,
                completionDays,
                sameAsBusiness,
                nameError: fieldErrors.name,
                versorgungError: fieldErrors.versorgung,
                datumAuftragError: fieldErrors.datumAuftrag,
                geschaeftsstandortError: fieldErrors.geschaeftsstandort,
                fertigstellungBisError: fieldErrors.fertigstellungBis,
                paymentError: fieldErrors.bezahlt,
              }}
            />
          </div>

          {/* Price Section - styled card */}
          <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-[#7583a0] uppercase">
              PREISE
            </h3>
            <PriceSection
              footAnalysisPrice={form.footAnalysisPrice}
              onFootAnalysisPriceChange={form.setFootAnalysisPrice}
              insoleSupplyPrice={form.insoleSupplyPrice}
              onInsoleSupplyPriceChange={form.setInsoleSupplyPrice}
              customFootPrice={form.customFootPrice}
              onCustomFootPriceChange={form.setCustomFootPrice}
              customInsolePrice={form.customInsolePrice}
              onCustomInsolePriceChange={form.setCustomInsolePrice}
              laserPrintPrices={laserPrintPrices}
              einlagenversorgungPrices={einlagenversorgungPrice}
              pricesLoading={pricesLoading}
              footAnalysisPriceError={fieldErrors.footAnalysisPrice}
              insoleSupplyPriceError={fieldErrors.insoleSupplyPrice}
              customFootPriceError={fieldErrors.customFootPrice}
              customInsolePriceError={fieldErrors.customInsolePrice}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleSave}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
