import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScanData } from '@/types/scan'
import { useCreateOrder } from '@/hooks/orders/useCreateOrder'
import { useUpdateCustomerInfo } from '@/hooks/customer/useUpdateCustomerInfo'
import toast from 'react-hot-toast'
import { useWerkstattzettelForm } from '../../../../../hooks/einlagen/useWerkstattzettelForm'
import CustomerInfoSection from './Werkstattzettel/FormSections/CustomerInfoSection'
import PriceSection from './Werkstattzettel/FormSections/PriceSection'
import { createWerkstattzettelPayload } from './utils/formDataUtils'
import { getSettingData } from '@/apis/einlagenApis'

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

interface UserInfoUpdateModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  scanData: ScanData | null
  formData?: FormData | null
  onInfoUpdate?: () => void
  onContinue?: () => void
  onCustomerUpdate?: (updatedCustomer: any) => void
  onShowOrderConfirmation?: (formData?: FormData) => void
}

export default function WerkstattzettelModal({
  isOpen,
  onOpenChange,
  scanData,
  formData,
  onInfoUpdate,
  onContinue,
  onShowOrderConfirmation,
}: UserInfoUpdateModalProps) {
  const { customOrderCreates, isCreating } = useCreateOrder()
  const { updateCustomerInfo, isUpdating } = useUpdateCustomerInfo()

  // Use custom hook for form state management
  const form = useWerkstattzettelForm(scanData, isOpen, formData)

  // Settings data state
  const [laserPrintPrices, setLaserPrintPrices] = useState<number[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)

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
            setLaserPrintPrices(response.data.laser_print_prices)
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

  // Get workshopNote settings
  const workshopNote = (scanData as any)?.workshopNote
  const sameAsBusiness = workshopNote?.sameAsBusiness ?? true
  
  // Get locations based on sameAsBusiness
  // If sameAsBusiness is true, use pickupLocation array from workshopNote
  // Otherwise, use partner.hauptstandort as fallback
  const locations = sameAsBusiness && Array.isArray(workshopNote?.pickupLocation) && workshopNote.pickupLocation.length > 0
    ? workshopNote.pickupLocation
    : (scanData as any)?.partner?.hauptstandort && Array.isArray((scanData as any).partner.hauptstandort)
      ? (scanData as any).partner.hauptstandort
      : []

  // Get completionDays for date calculations
  const completionDays = workshopNote?.completionDays

  const handleSave = async () => {
    if (!scanData?.id) {
      toast.error('Customer ID not found')
      return
    }

    try {
      const parsedFoot = Number(form.footAnalysisPrice)
      const parsedInsole = Number(form.insoleSupplyPrice)

      // First update prices on the customer record
      const priceUpdateSuccess = await updateCustomerInfo(scanData.id, {
        fußanalyse: isNaN(parsedFoot) ? 0 : parsedFoot,
        einlagenversorgung: isNaN(parsedInsole) ? 0 : parsedInsole,
      })

      if (!priceUpdateSuccess) {
        toast.error('Preis-Update fehlgeschlagen')
        return
      }

      // Create payload using utility function
      const payload = createWerkstattzettelPayload(
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

      const res = await customOrderCreates(scanData.id, payload)
      const createdId = (res as any)?.data?.id ?? (res as any)?.id
      if (createdId) {
        try {
          localStorage.setItem('werkstattzettelId', createdId)
        } catch {
          // Ignore localStorage errors
        }
      }

      onOpenChange(false)
      onShowOrderConfirmation?.(formData || undefined)
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
          <DialogTitle className="text-xl font-bold">Werkstattzettel</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Customer Information Section */}
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
              locations,
              isLocationDropdownOpen: form.isLocationDropdownOpen,
              onLocationDropdownChange: form.handleLocationDropdownChange,
              completionDays,
              sameAsBusiness,
            }}
          />

          {/* Price Section */}
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
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating || isUpdating}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleSave}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'loading...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
