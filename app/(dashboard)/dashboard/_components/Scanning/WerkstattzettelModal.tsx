import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScanData } from '@/types/scan'
import toast from 'react-hot-toast'
import { MapPin, FileText, StickyNote } from 'lucide-react'
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
  quantity?: number
  versorgung?: string
  versorgung_note?: string
  schuhmodell_wählen?: string
  kostenvoranschlag?: boolean
  employeeName?: string
  employeeId?: string
  selectedVersorgungData?: any
  screenerId?: string | null
  billingType?: 'Krankenkassa' | 'Privat'
  isCustomVersorgung?: boolean // Flag to indicate if using custom versorgung (Einmalige Versorgung)
  versorgungsname?: string
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
  
  // Set default bezahlt value based on billingType from formData
  useEffect(() => {
    if (isOpen && formData?.billingType && !form.bezahlt) {
      // Map billingType to bezahlt format
      // "Krankenkassa" -> "Krankenkasse_Genehmigt" (note: "Krankenkassa" in billingType but "Krankenkasse" in bezahlt)
      // "Privat" -> "Privat_Bezahlt"
      const bezahltValue = formData.billingType === 'Krankenkassa' 
        ? 'Krankenkasse_Genehmigt' 
        : 'Privat_Bezahlt'
      form.setBezahlt(bezahltValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData?.billingType])

  // ✅ Local validation removed - backend handles all validation
 

  // Settings data state
  const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)
  const [locations, setLocations] = useState<Array<{id: string; address: string; description: string; isPrimary: boolean}>>([])
  const [locationsLoading, setLocationsLoading] = useState(false)

  // Extract Einlagenversorgung price and name from selected versorgung
  const einlagenversorgungPrice = React.useMemo(() => {
    const selectedData = formData?.selectedVersorgungData
    if (!selectedData) return []

    const price = selectedData?.supplyStatus?.price
    const name = selectedData?.supplyStatus?.name || selectedData?.name || ''

    if (price !== undefined && price !== null && !isNaN(Number(price))) {
      return [{ name, price: Number(price) }]
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
            
            // Ensure "Standard" is always first
            const standardItem = formattedPrices.find((item) => item.name.toLowerCase() === 'standard');
            const otherItems = formattedPrices.filter((item) => item.name.toLowerCase() !== 'standard');
            const sortedOthers = otherItems.sort((a, b) => a.price - b.price);
            const sortedPrices = standardItem ? [standardItem, ...sortedOthers] : sortedOthers;
            
            setLaserPrintPrices(sortedPrices);
            
            // Auto-select "Standard" if no price is currently selected
            if (standardItem && !form.footAnalysisPrice) {
              form.setFootAnalysisPrice(String(standardItem.price));
            }
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

  // Pass location objects directly to dropdown (no conversion needed)

  // Set primary location as default when locations are first loaded (only once per modal open)
  useEffect(() => {
    if (locations.length > 0 && isOpen && !locationsLoading) {
      // Only set default if geschaeftsstandort is not set
      const currentLocation = form.geschaeftsstandort
      if (!currentLocation) {
        const primaryLocation = locations.find(loc => loc.isPrimary)
        const locationToUse = primaryLocation || locations[0]
        if (locationToUse) {
          // Store the full location object
          form.setGeschaeftsstandort(locationToUse)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, isOpen, locationsLoading])

  // ✅ ALL VALIDATION REMOVED - Backend will handle everything

  const handleSave = async () => {
    if (!scanData?.id) {
      toast.error('Customer ID not found')
      return
    }

    // ✅ No validation - proceed directly
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
          quantity: (() => {
            // Parse quantity from string to number (e.g., "1 paar" -> 1)
            if (!form.quantity) return formData?.menge || formData?.quantity || undefined
            const match = form.quantity.match(/^(\d+)\s*paar/i)
            return match ? parseInt(match[1], 10) : undefined
          })(),
          discount: (() => {
            if (!form.discountValue || form.discountValue.trim() === '') return undefined
            const parsed = parseFloat(form.discountValue)
            return isNaN(parsed) ? undefined : parsed
          })(),
          discountType: form.discountType || undefined,
        },
        scanData.id
      )

      // Combine formData with werkstattzettel payload
      const combinedFormData = {
        ...formData,
        ...werkstattzettelPayload,
        quantity: (() => {
          if (!form.quantity) return formData?.menge || formData?.quantity || undefined
          const match = form.quantity.match(/^(\d+)\s*paar/i)
          return match ? parseInt(match[1], 10) : undefined
        })(),
        discount: (() => {
          if (!form.discountValue || form.discountValue.trim() === '') return undefined
          const parsed = parseFloat(form.discountValue)
          return isNaN(parsed) ? undefined : parsed
        })(),
        discountType: form.discountType || undefined,
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
          <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
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
                quantity: form.quantity,
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
                onQuantityChange: form.setQuantity,
                employeeSearchText: form.employeeSearchText,
                employeeSuggestions: form.employeeSuggestions,
                employeeLoading: form.employeeLoading,
                isEmployeeDropdownOpen: form.isEmployeeDropdownOpen,
                onEmployeeDropdownChange: form.handleEmployeeDropdownChange,
                onEmployeeSearchChange: form.handleEmployeeSearchChange,
                locations: locations,
                isLocationDropdownOpen: form.isLocationDropdownOpen,
                onLocationDropdownChange: form.handleLocationDropdownChange,
                completionDays,
                sameAsBusiness,
                nameError: undefined, // ✅ All validation removed
                versorgungError: undefined,
                datumAuftragError: undefined,
                geschaeftsstandortError: undefined,
                fertigstellungBisError: undefined,
              }}
            />
          </div>

          {/* Price Section - styled card */}
          <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
            <PriceSection
              versorgung={form.versorgung}
              versorgungsname={formData?.versorgungsname}
              onVersorgungChange={form.setVersorgung}
              quantity={form.quantity}
              onQuantityChange={form.setQuantity}
              fertigstellungBis={form.fertigstellungBis}
              onFertigstellungBisChange={form.handleDeliveryDateChange}
              fertigstellungBisTime={form.fertigstellungBisTime}
              onFertigstellungBisTimeChange={form.setFertigstellungBisTime}
              versorgungError={undefined} // ✅ All validation removed
              fertigstellungBisError={undefined}
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
              footAnalysisPriceError={undefined}
              insoleSupplyPriceError={undefined}
              customFootPriceError={undefined}
              customInsolePriceError={undefined}
              discountType={form.discountType}
              onDiscountTypeChange={form.setDiscountType}
              discountValue={form.discountValue}
              onDiscountValueChange={form.setDiscountValue}
              bezahlt={form.bezahlt}
              onBezahltChange={form.setBezahlt}
              paymentError={undefined}
              disabledPaymentType={formData?.billingType === 'Krankenkassa' ? 'Krankenkasse' : formData?.billingType === 'Privat' ? 'Privat' : undefined}
              datumAuftrag={form.datumAuftrag}
              completionDays={completionDays}
            />
          </div>

          {/* KONTROLLE & AKTIONEN Section */}
          <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
            <div className="flex items-center gap-3 mb-6">
              {/* <MapPin className="w-5 h-5 text-[#50C878]" /> */}
              <h3 className="text-sm font-bold text-[#50C878] uppercase tracking-wide">Kontrolle & Aktionen</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f6ff] text-[#50C878]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">Abholung</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {form.geschaeftsstandort 
                      ? `${form.geschaeftsstandort.description || ''}${form.geschaeftsstandort.description && form.geschaeftsstandort.address ? ' - ' : ''}${form.geschaeftsstandort.address || ''}`
                      : '-'
                    }
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
              
               
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5 py-2 text-sm font-medium border-[#dde3ee] bg-white flex items-center gap-2 shadow-none"
                >
                  <StickyNote className="w-4 h-4 text-gray-700" />
                  <span>Notiz hinzufügen</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-3 mt-6">
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
          Weiter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
