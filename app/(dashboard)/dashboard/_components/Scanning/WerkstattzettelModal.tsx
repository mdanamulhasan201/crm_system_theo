import React, { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScanData } from '@/types/scan'
import toast from 'react-hot-toast'
import { MapPin, FileText, StickyNote } from 'lucide-react'
import AbholungFilialeModal from './AbholungFilialeModal'
import VersandAnKundenModal from './VersandAnKundenModal'
import { useWerkstattzettelForm } from '../../../../../hooks/einlagen/useWerkstattzettelForm'
import CustomerInfoSection from './Werkstattzettel/FormSections/CustomerInfoSection'
import PriceSection from './Werkstattzettel/FormSections/PriceSection'
import { createWerkstattzettelPayload, type WerkstattzettelFormData } from './utils/formDataUtils'
import { getSettingData } from '@/apis/einlagenApis'
import { getAllLocations, type StoreLocation, type StoreLocationEmployee } from '@/apis/setting/locationManagementApis'
import { getOrderSettings } from '@/apis/versorgungApis'
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types'
import { useAuth } from '@/contexts/AuthContext'

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
  /** When Privat + Einmalige Versorgung, price from selected Einlagetyp (ProduktBasisdatenCard) */
  einlagetypPriceForPrivat?: number
  versorgungsname?: string
  positionsnummerTotal?: number
  selectedPositionsnummer?: string[]
  positionsnummerOptions?: Array<{ positionsnummer?: string; description?: string | Record<string, unknown>; price?: number }>
  notiz_hinzufügen?: string
  totalPrice?: number | null
  privatePrice?: number | null
  insuranceTotalPrice?: number | null
  vat_rate?: number | null
  insoleStandards?: Array<{ name: string; left: number; right: number; isFavorite?: boolean }>
  diagnosisList?: string[]
  bezahlt?: string
  paymentStatus?: string
  printWerkstattzettel?: boolean
  halbprobe?: boolean
  /** Pickup/appointment employee for fixed-per-location mode (from store locations API). */
  AppomentEmployeeId?: string
}

type WerkstattzettelLocationRow = {
  id: string
  address: string
  description: string
  isPrimary: boolean
  employees?: StoreLocationEmployee | null
}

function normalizeLocationsForState(data: StoreLocation[]): WerkstattzettelLocationRow[] {
  return data.map((loc) => ({
    id: loc.id,
    address: loc.address,
    description: loc.description ?? '',
    isPrimary: loc.isPrimary ?? false,
    employees: loc.employees ?? null,
  }))
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
  const { user } = useAuth()
  const { bezahlt: bezahltState, setBezahlt } = form

  // Price summary: Gesamt + MwSt (same as SonstigesOrderModal / PriceSection)
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null)
  const steuersatz = React.useMemo(() => {
    const vatCountry = user?.accountInfo?.vat_country
    if (vatCountry === 'Österreich (AT)') return 20
    if (vatCountry === 'Italien (IT)') return 4
    return 0
  }, [user?.accountInfo?.vat_country])
  const mwstAmount = React.useMemo(() => {
    if (calculatedTotal == null || steuersatz <= 0) return undefined
    return Math.round((calculatedTotal * steuersatz) / (100 + steuersatz) * 100) / 100
  }, [calculatedTotal, steuersatz])
  const addonPricesTotal = React.useMemo(() => {
    const raw = form.addonPrices
    if (!raw || typeof raw !== 'string') return 0
    const parts = raw.split(/[,\s]+/).filter(Boolean)
    return parts.reduce((sum, part) => sum + (parseFloat(part.replace(',', '.')) || 0), 0)
  }, [form.addonPrices])
  const allowDualPaymentSelection =
    formData?.billingType === 'Krankenkassa' &&
    (addonPricesTotal > 0 || user?.accountInfo?.vat_country === 'Österreich (AT)')
  const disabledPaymentOptions = React.useMemo<Array<'Privat' | 'Krankenkasse'>>(() => {
    if (formData?.billingType === 'Privat') {
      return ['Krankenkasse']
    }

    return []
  }, [formData?.billingType])

  // Set default bezahlt ONCE per modal open — use a ref so deselection (empty string) is not overridden
  const hasInitializedBezahlt = useRef(false)
  useEffect(() => {
    if (!isOpen) {
      hasInitializedBezahlt.current = false
      return
    }
    if (hasInitializedBezahlt.current) return
    hasInitializedBezahlt.current = true

    const bezahltValue =
      formData?.bezahlt ||
      formData?.paymentStatus ||
      (formData?.billingType === 'Krankenkassa'
        ? 'Krankenkasse_Ungenehmigt'
        : 'Privat_offen')

    setBezahlt(bezahltValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ✅ Local validation removed - backend handles all validation
 

  // Notiz (note) state
  const [shouldPrintWerkstattzettel, setShouldPrintWerkstattzettel] = useState(true)
  const [showNotizTextarea, setShowNotizTextarea] = useState(false)
  const [notizText, setNotizText] = useState('')

  // Andere Filiale wählen / Versand an Kunden – separate modal components
  const [showFilialeModal, setShowFilialeModal] = useState(false)
  const [showVersandModal, setShowVersandModal] = useState(false)

  // Settings data state
  const [laserPrintPrices, setLaserPrintPrices] = useState<PriceItem[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)
  /** From GET /customer-settings/settings → `orderSettings[0].pickupAssignmentMode`. `true` = Auftragsersteller übernimmt Abholung (no extra UI). */
  const [pickupAssignmentMode, setPickupAssignmentMode] = useState<boolean | null>(null)
  /**
   * `orderSettings[0].order_creation_appomnent` (API spelling).
   * `true` = Termin automatisch: nur Datum, keine Uhrzeit, kein Abhol-Mitarbeiter-Block.
   * `false` = Datum wählbar, Uhrzeit-Anzeige deaktiviert, Mitarbeiter (Abholung) nur Anzeige.
   */
  const [orderCreationAutoAppointment, setOrderCreationAutoAppointment] = useState<boolean | null>(null)
  const [locations, setLocations] = useState<WerkstattzettelLocationRow[]>([])
  const [locationsLoading, setLocationsLoading] = useState(false)

  // Extract Einlagenversorgung price and name from selected versorgung (or Einlagetyp for Einmalige Versorgung)
  // NOTE: For Krankenkassa-Abrechnung this price should NOT be shown or used.
  const einlagenversorgungPrice = React.useMemo(() => {
    // Only show / use Versorgung price for Privat billing
    if (formData?.billingType !== 'Privat') return []

    const selectedData = formData?.selectedVersorgungData
    const priceFromVersorgung = selectedData?.supplyStatus?.price
    const nameFromVersorgung = selectedData?.supplyStatus?.name || selectedData?.name || ''

    // Standard: use price from selected versorgung
    if (priceFromVersorgung !== undefined && priceFromVersorgung !== null && !isNaN(Number(priceFromVersorgung))) {
      return [{ name: nameFromVersorgung || formData?.versorgungsname || '', price: Number(priceFromVersorgung) }]
    }

    // Einmalige Versorgung: use price from selected Einlagetyp (ProduktBasisdatenCard)
    if (formData?.isCustomVersorgung && formData?.einlagetypPriceForPrivat != null && !isNaN(Number(formData.einlagetypPriceForPrivat))) {
      const name = formData?.einlagentyp || formData?.versorgungsname || formData?.versorgung || 'Versorgung'
      return [{ name, price: Number(formData.einlagetypPriceForPrivat) }]
    }

    return []
  }, [formData?.selectedVersorgungData, formData?.billingType, formData?.isCustomVersorgung, formData?.einlagetypPriceForPrivat, formData?.einlagentyp, formData?.versorgungsname, formData?.versorgung])

  // Versorgung display for "Auftragsdetails & Preise": plain selected Versorgung name only
  const { einlageDisplayName, versorgungFullDisplay } = React.useMemo(() => {
    const einlage = formData?.einlagentyp || ''
    const supplyName =
      formData?.versorgungsname ||
      formData?.selectedVersorgungData?.versorgung ||
      formData?.selectedVersorgungData?.supplyStatus?.name ||
      formData?.selectedVersorgungData?.name ||
      formData?.versorgung ||
      ''
    return { einlageDisplayName: einlage, versorgungFullDisplay: supplyName }
  }, [formData?.einlagentyp, formData?.versorgung, formData?.versorgungsname, formData?.selectedVersorgungData])

  const zusaetzeDisplayLines = React.useMemo(() => {
    const standards = formData?.insoleStandards || []

    const formatValue = (value: number) => {
      return Number.isInteger(value) ? String(value) : String(value).replace('.', ',')
    }

    return standards
      .map((item) => {
        const left = Number(item?.left ?? 0)
        const right = Number(item?.right ?? 0)
        const hasLeft = left > 0
        const hasRight = right > 0

        if (!item?.name || (!hasLeft && !hasRight)) return null

        if (hasLeft && hasRight && left === right) {
          return `${formatValue(left)}mm ${item.name} BDS`
        }

        if (hasLeft && hasRight) {
          return `${item.name} ${formatValue(left)}mm Links und ${formatValue(right)}mm Rechts`
        }

        if (hasLeft) {
          return `${item.name} ${formatValue(left)}mm Links`
        }

        return `${item.name} ${formatValue(right)}mm Rechts`
      })
      .filter((item): item is string => Boolean(item))
  }, [formData?.insoleStandards])

  // Auto-set Einlagenversorgung price when versorgung is selected (or Einlagetyp for Einmalige Versorgung)
  // Only for Privat-Abrechnung – Krankenkassa must NOT prefill or calculate this price
  useEffect(() => {
    if (!isOpen || formData?.billingType !== 'Privat') return

    const priceFromVersorgung = formData?.selectedVersorgungData?.supplyStatus?.price
    const priceFromEinlagetyp = formData?.isCustomVersorgung && formData?.einlagetypPriceForPrivat != null
      ? formData.einlagetypPriceForPrivat
      : null

    const price = priceFromVersorgung ?? priceFromEinlagetyp
    if (price !== undefined && price !== null && !isNaN(Number(price))) {
      const priceStr = String(price)
      if (form.insoleSupplyPrice !== priceStr) {
        form.setInsoleSupplyPrice(priceStr)
      }
    }
  }, [isOpen, formData?.billingType, formData?.selectedVersorgungData?.supplyStatus?.price, formData?.isCustomVersorgung, formData?.einlagetypPriceForPrivat, form])

  // Fetch settings only once when modal opens. Do NOT depend on `form` (new ref every render = infinite calls).
  const hasFetchedSettingsRef = useRef(false)
  useEffect(() => {
    if (!isOpen) {
      hasFetchedSettingsRef.current = false
      return
    }
    if (hasFetchedSettingsRef.current) return
    hasFetchedSettingsRef.current = true

    let cancelled = false
    setPricesLoading(true)
    getSettingData()
      .then((response: any) => {
        if (cancelled) return
        const osRaw = response?.orderSettings ?? response?.data?.orderSettings
        const os = Array.isArray(osRaw) ? osRaw : []
        const firstOs = os[0] as Record<string, unknown> | undefined
        if (firstOs && typeof firstOs.pickupAssignmentMode === 'boolean') {
          setPickupAssignmentMode(Boolean(firstOs.pickupAssignmentMode))
        } else {
          setPickupAssignmentMode(true)
        }
        if (firstOs && typeof firstOs.order_creation_appomnent === 'boolean') {
          setOrderCreationAutoAppointment(Boolean(firstOs.order_creation_appomnent))
        } else if (firstOs) {
          setOrderCreationAutoAppointment(false)
        } else {
          setOrderCreationAutoAppointment(null)
        }
        if (response?.data?.laser_print_prices && Array.isArray(response.data.laser_print_prices)) {
          const formattedPrices: PriceItem[] = response.data.laser_print_prices
            .map((item: any) => {
              if (typeof item === 'number') return { name: `Preis ${item}`, price: item }
              if (item && typeof item === 'object' && item.name && item.price !== undefined) {
                return { name: item.name, price: item.price }
              }
              return null
            })
            .filter((item: PriceItem | null): item is PriceItem => item !== null)
          const standardItem = formattedPrices.find((item) => item.name.toLowerCase() === 'standard')
          const otherItems = formattedPrices.filter((item) => item.name.toLowerCase() !== 'standard')
          const sortedOthers = otherItems.sort((a, b) => a.price - b.price)
          const sortedPrices = standardItem ? [standardItem, ...sortedOthers] : sortedOthers
          setLaserPrintPrices(sortedPrices)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to fetch settings:', error)
          toast.error('Fehler beim Laden der Einstellungen')
        }
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false)
      })
    return () => { cancelled = true }
  }, [isOpen])

  const autoCalendarOnly = orderCreationAutoAppointment === true
  const manualAppointmentNoAuto = orderCreationAutoAppointment === false

  useEffect(() => {
    if (!isOpen || !autoCalendarOnly) return
    form.setFertigstellungBisTime('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoCalendarOnly])

  useEffect(() => {
    if (!isOpen || !manualAppointmentNoAuto) return
    if (!form.fertigstellungBisTime || form.fertigstellungBisTime.trim() === '') {
      form.setFertigstellungBisTime('09:00')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, manualAppointmentNoAuto])

  useEffect(() => {
    if (!isOpen) return
    setShouldPrintWerkstattzettel(formData?.printWerkstattzettel ?? true)
  }, [isOpen, formData?.printWerkstattzettel])

  // Fetch locations from API when modal opens
  useEffect(() => {
    const fetchLocations = async () => {
      if (isOpen) {
        setLocationsLoading(true)
        try {
          const response = await getAllLocations(1, 100)
          if (Array.isArray(response?.data)) {
            setLocations(normalizeLocationsForState(response.data))
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

  // Fetch insolePickupDateLine from order settings and set Fertigstellung default
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    getOrderSettings()
      .then((res: any) => {
        if (cancelled) return
        const pickupDays = res?.data?.insolePickupDateLine ?? null
        const today = new Date()
        const target = new Date(today)
        if (pickupDays != null && !isNaN(Number(pickupDays))) {
          target.setDate(today.getDate() + Number(pickupDays))
        }
        form.setFertigstellungBis(target.toISOString().slice(0, 10))
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback to today
          form.setFertigstellungBis(new Date().toISOString().slice(0, 10))
        }
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Get workshopNote settings
  const workshopNote = (scanData as any)?.workshopNote
  const sameAsBusiness = workshopNote?.sameAsBusiness ?? true
  
  // Get completionDays for date calculations
  const completionDays = workshopNote?.completionDays

  // Pass location objects directly to dropdown (no conversion needed)

  // Set primary location as default for Abholung and "Auftrag angenommen bei" when locations are first loaded (only once - not when user clears)
  const hasSetInitialLocation = useRef(false)
  useEffect(() => {
    if (locations.length > 0 && isOpen && !locationsLoading && !hasSetInitialLocation.current) {
      hasSetInitialLocation.current = true
      const primaryLocation = locations.find(loc => loc.isPrimary)
      const locationToUse = primaryLocation || locations[0]
      if (locationToUse) {
        form.setGeschaeftsstandort(locationToUse)
        form.setAuftragAngenommenBei(locationToUse)
      }
    }
    // Reset ref when modal closes so next open gets default again
    if (!isOpen) {
      hasSetInitialLocation.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, isOpen, locationsLoading])

  // ✅ ALL VALIDATION REMOVED - Backend will handle everything

  const abholungPickupEmployee = React.useMemo(() => {
    if (pickupAssignmentMode !== false) return null
    const gid = form.geschaeftsstandort?.id
    if (!gid || gid === 'versand') return null
    return locations.find((l) => l.id === gid)?.employees ?? null
  }, [pickupAssignmentMode, form.geschaeftsstandort?.id, locations])

  const handleSave = async () => {
    if (!scanData?.id) {
      toast.error('Customer ID not found')
      return
    }

    if (pickupAssignmentMode === false && manualAppointmentNoAuto) {
      const gid = form.geschaeftsstandort?.id
      if (gid && gid !== 'versand') {
        const emp = locations.find((l) => l.id === gid)?.employees
        if (!emp?.id) {
          toast.error(
            'Für diesen Abholstandort ist kein Mitarbeiter hinterlegt. Bitte in den Einstellungen zuweisen oder einen anderen Standort wählen.'
          )
          return
        }
      }
    }

    // ✅ No validation - proceed directly
    try {
      // Calculate total exactly like PriceSection (Gesamt), with Krankenkassa logic for Versorgung
      // When Verordnungsvorschlag (halbprobe) is YES → all prices are 0 (mirrors PriceSection isVerordnungsvorschlag logic)
      const isVerordnungsvorschlag = formData?.halbprobe === true

      const quantityNum = (() => {
        if (!form.quantity) return formData?.menge || formData?.quantity || 1
        const match = form.quantity.match(/^(\d+)\s*paar/i)
        return match ? parseInt(match[1], 10) : 1
      })()
      const versorgungPriceForTotal = isVerordnungsvorschlag
        ? 0
        : formData?.billingType === 'Privat' ? (parseFloat(form.insoleSupplyPrice) || 0) : 0
      const footPriceForTotal = isVerordnungsvorschlag
        ? 0
        : form.footAnalysisPrice === 'custom'
          ? (parseFloat(form.customFootPrice) || 0)
          : (parseFloat(form.footAnalysisPrice) || 0)
      const addonPricesTotalForTotal = (() => {
        const raw = form.addonPrices
        if (!raw || typeof raw !== 'string') return 0
        const parts = raw.split(/[,\s]+/).filter(Boolean)
        return parts.reduce((sum, p) => sum + (parseFloat(p.replace(',', '.')) || 0), 0)
      })()
      const positionsnummerTotalForTotal = isVerordnungsvorschlag ? 0 : (formData?.positionsnummerTotal || 0)
      const subtotalForTotal =
        versorgungPriceForTotal * quantityNum +
        footPriceForTotal +
        addonPricesTotalForTotal +
        positionsnummerTotalForTotal
      const discountPercent =
        form.discountType === 'percentage' && form.discountValue
          ? parseFloat(form.discountValue) || 0
          : 0
      const discountAmountForTotal =
        discountPercent > 0 ? (subtotalForTotal * discountPercent) / 100 : 0
      // Krankenkasse + AT: Gesamt includes Eigenanteil — only when NOT Verordnungsvorschlag (mirrors PriceSection)
      const vatCountry = user?.accountInfo?.vat_country
      const isKrankenkasseAt = !isVerordnungsvorschlag && formData?.billingType === 'Krankenkassa' && vatCountry === 'Österreich (AT)'
      const eigenanteilForTotal = isKrankenkasseAt ? 46.20 : 0
      const totalPriceOverride = subtotalForTotal - discountAmountForTotal + eigenanteilForTotal

      // privatePrice: KK+AT normal = Fußanalyse + Eigenanteil + Aufpreis; Privat = Gesamt;
      // Verordnungsvorschlag + Aufpreis: customer pays surcharge (Privat: full Gesamt; KK+AT: Aufpreis-only share)
      const isPrivatBilling = formData?.billingType === 'Privat'
      const isPrivat = !isVerordnungsvorschlag && isPrivatBilling
      const totalForPayload = subtotalForTotal - discountAmountForTotal + eigenanteilForTotal
      const kkAtVerordnungMitAufpreis =
        isVerordnungsvorschlag &&
        formData?.billingType === 'Krankenkassa' &&
        vatCountry === 'Österreich (AT)' &&
        addonPricesTotalForTotal > 0
      const privatePrice = isKrankenkasseAt
        ? footPriceForTotal + eigenanteilForTotal + addonPricesTotalForTotal
        : isPrivat
          ? totalForPayload
          : kkAtVerordnungMitAufpreis
            ? totalForPayload
            : isVerordnungsvorschlag && isPrivatBilling && addonPricesTotalForTotal > 0
              ? totalForPayload
              : undefined
      // insuranceTotalPrice (Krankenkassa AT): rest = Positionsnummer — 0 bei Verordnungsvorschlag
      const insuranceTotalPrice = isKrankenkasseAt ? positionsnummerTotalForTotal : undefined
      // MwSt. auf Wirtschaftlicher Aufpreis (KK + AT), auch bei Verordnungsvorschlag
      const vatRate =
        formData?.billingType === 'Krankenkassa' &&
        vatCountry === 'Österreich (AT)' &&
        addonPricesTotalForTotal > 0
          ? 20
          : undefined

      // Create payload using utility function
      const werkstattzettelFormInput: WerkstattzettelFormData = {
        vorname: form.vorname,
        nachname: form.nachname,
        email: form.email,
        telefonnummer: form.telefonnummer,
        wohnort: form.wohnort,
        mitarbeiter: form.mitarbeiter,
        versorgung: form.versorgung,
        datumAuftrag: form.datumAuftrag,
        geschaeftsstandort: form.geschaeftsstandort,
        auftragAngenommenBei: form.auftragAngenommenBei,
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
        addonPrices: form.addonPrices || undefined,
        positionsnummerTotal: formData?.positionsnummerTotal,
        selectedVersorgungData: formData?.selectedVersorgungData,
        // Pass billing type through so pricing logic can respect Krankenkassa vs Privat
        billingType: formData?.billingType,
        einlagetypPriceForPrivat: formData?.einlagetypPriceForPrivat,
        totalPriceOverride,
      }
      const werkstattzettelPayload = createWerkstattzettelPayload(
        werkstattzettelFormInput,
        scanData.id
      )

      const abholungStoreIdForPayload = form.geschaeftsstandort?.id
      const appomentEmployeePayloadId =
        pickupAssignmentMode === false &&
        manualAppointmentNoAuto &&
        abholungStoreIdForPayload &&
        abholungStoreIdForPayload !== 'versand'
          ? locations.find((l) => l.id === abholungStoreIdForPayload)?.employees?.id
          : undefined

        // Combine formData with werkstattzettel payload
      const combinedFormData = {
        ...formData,
        ...werkstattzettelPayload,
        diagnosisList: formData?.diagnosisList || [],
        // Controls whether invoice PDF download should be enabled later
        printWerkstattzettel: shouldPrintWerkstattzettel,
        // ── Individual price fields ──────────────────────────────────────
        // Verordnungsvorschlag: Versorgung/Fußanalyse etc. null; Wirtschaftlicher Aufpreis + Gesamt/Rabatt wenn gesetzt
        fussanalysePreis: isVerordnungsvorschlag ? null : Math.round(footPriceForTotal * 100) / 100,
        einlagenversorgungPreis: isVerordnungsvorschlag ? null : Math.round(versorgungPriceForTotal * 100) / 100,
        quantity: quantityNum,
        addonPrices:
          addonPricesTotalForTotal > 0
            ? Math.round(addonPricesTotalForTotal * 100) / 100
            : null,
        totalPrice:
          isVerordnungsvorschlag
            ? addonPricesTotalForTotal > 0 || totalPriceOverride > 0
              ? Math.round(totalPriceOverride * 100) / 100
              : null
            : Math.round(totalPriceOverride * 100) / 100,
        discount: (() => {
          if (!form.discountValue || form.discountValue.trim() === '') return undefined
          const parsed = parseFloat(form.discountValue)
          return isNaN(parsed) ? undefined : parsed
        })(),
        discountType: form.discountType || undefined,
        notiz_hinzufügen: notizText?.trim() || undefined,
        privatePrice:
          privatePrice !== undefined
            ? Math.round(privatePrice * 100) / 100
            : isVerordnungsvorschlag
              ? null
              : undefined,
        insuranceTotalPrice: isVerordnungsvorschlag ? null : (insuranceTotalPrice !== undefined ? Math.round(insuranceTotalPrice * 100) / 100 : undefined),
        vat_rate: vatRate !== undefined ? vatRate : isVerordnungsvorschlag ? null : undefined,
        austria_price: isVerordnungsvorschlag ? null : (eigenanteilForTotal > 0 ? eigenanteilForTotal : undefined),
        ...(appomentEmployeePayloadId ? { AppomentEmployeeId: appomentEmployeePayloadId } : {}),
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
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] min-h-[80vh] overflow-y-auto overflow-x-hidden">
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
                nameError: undefined,
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
              auftragAngenommenBei={form.auftragAngenommenBei}
              locations={locations}
              isAuftragLocationDropdownOpen={form.isAuftragLocationDropdownOpen}
              onAuftragLocationDropdownChange={form.handleAuftragLocationDropdownChange}
              onAuftragAngenommenBeiChange={form.handleAuftragLocationSelect}
              onAuftragAngenommenBeiClear={() => {
                form.setAuftragAngenommenBei(null)
                form.handleAuftragLocationDropdownChange(false)
              }}
              versorgung={form.versorgung}
              versorgungsname={formData?.versorgungsname}
              einlageDisplayName={einlageDisplayName}
              versorgungFullDisplay={versorgungFullDisplay}
              zusaetzeDisplayLines={zusaetzeDisplayLines}
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
              addonPrices={form.addonPrices}
              onAddonPricesChange={form.setAddonPrices}
              positionsnummerPrice={formData?.positionsnummerTotal ?? 0}
              bezahlt={form.bezahlt}
              onBezahltChange={form.setBezahlt}
              paymentError={undefined}
              billingType={formData?.billingType}
              disabledPaymentOptions={disabledPaymentOptions}
              allowDualPaymentSelection={allowDualPaymentSelection}
              datumAuftrag={form.datumAuftrag}
              completionDays={completionDays}
              steuersatz={steuersatz > 0 ? steuersatz : undefined}
              mwstAmount={mwstAmount}
              onTotalChange={setCalculatedTotal}
              isVerordnungsvorschlag={formData?.halbprobe === true}
              fertigstellungDateReadOnly={autoCalendarOnly}
              fertigstellungTimeHidden={autoCalendarOnly}
              fertigstellungTimeDisabled={manualAppointmentNoAuto}
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
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-500">Abholung</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {form.geschaeftsstandort
                      ? form.geschaeftsstandort.description === 'Versand an Kunden'
                        ? form.geschaeftsstandort.address || '-'
                        : `${form.geschaeftsstandort.description || ''}${form.geschaeftsstandort.description && form.geschaeftsstandort.address ? ' - ' : ''}${form.geschaeftsstandort.address || ''}`
                      : '-'
                    }
                  </span>
                  <div className="flex items-center gap-4 pt-0.5">
                    <button
                      type="button"
                      className="text-xs cursor-pointer font-medium text-[#50C878] hover:underline focus:outline-none"
                      onClick={() => setShowFilialeModal(true)}
                    >
                      Andere Filiale wählen
                    </button>
                    <button
                      type="button"
                      className="text-xs cursor-pointer font-medium text-[#50C878] hover:underline focus:outline-none"
                      onClick={() => setShowVersandModal(true)}
                    >
                      Versand an Kunden
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5 py-2 text-sm font-medium border-[#dde3ee] bg-white flex items-center gap-2 shadow-none"
                  onClick={() => setShowNotizTextarea(!showNotizTextarea)}
                >
                  <StickyNote className="w-4 h-4 text-gray-700" />
                  <span>Notiz hinzufügen</span>
                </Button>
              </div>
            </div>

            {/* Mitarbeiter (Abholung) – nur bei festem Standort-Mitarbeiter und manueller Terminlogik */}
            {pickupAssignmentMode === false && manualAppointmentNoAuto && (
              <div
                className="mt-5 pt-5 border-t border-gray-100 pointer-events-none select-none opacity-90"
                aria-disabled
              >
                <span className="text-xs font-medium text-gray-500 block">
                  Mitarbeiter (Abholung)
                </span>
                {form.geschaeftsstandort?.id !== 'versand' &&
                  form.geschaeftsstandort?.description !== 'Versand an Kunden' && (
                    <p className="text-[11px] leading-snug text-gray-500 mt-1 mb-2 max-w-md">
                      Nur Anzeige (nicht änderbar). Der Abholtermin wird mit diesem Mitarbeiter verbunden.
                    </p>
                  )}
                {form.geschaeftsstandort?.id === 'versand' ||
                form.geschaeftsstandort?.description === 'Versand an Kunden' ? (
                  <p className="text-sm text-gray-500">
                    Nicht zutreffend bei Versand an Kunden.
                  </p>
                ) : abholungPickupEmployee ? (
                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-100/80 p-3 max-w-md">
                    {abholungPickupEmployee.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={abholungPickupEmployee.image}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-[10px] font-medium text-gray-600">
                        {(abholungPickupEmployee.employeeName || '?')
                          .split(/\s+/)
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {(abholungPickupEmployee.employeeName || '')
                          .trim()
                          .split(/\s+/)[0] || '—'}
                      </p>
                      {abholungPickupEmployee.email ? (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {abholungPickupEmployee.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700">
                    Kein Mitarbeiter für diesen Abholstandort hinterlegt.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Werkstattzettel</label>
            <p className="text-sm text-gray-500 mb-4">Soll der Werkstattzettel mit ausgedruckt werden?</p>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <Button
                type="button"
                variant="outline"
                className={shouldPrintWerkstattzettel
                  ? 'border-[#61A178] bg-[#61A178] text-white hover:bg-[#4A8A5F] hover:text-white'
                  : 'border-[#dde3ee] bg-white text-gray-700 hover:bg-gray-50'}
                onClick={() => setShouldPrintWerkstattzettel(true)}
              >
                Ja
              </Button>
              <Button
                type="button"
                variant="outline"
                className={!shouldPrintWerkstattzettel
                  ? 'border-[#61A178] bg-[#61A178] text-white hover:bg-[#4A8A5F] hover:text-white'
                  : 'border-[#dde3ee] bg-white text-gray-700 hover:bg-gray-50'}
                onClick={() => setShouldPrintWerkstattzettel(false)}
              >
                Nein
              </Button>
            </div>
          </div>

          {/* Notiz textarea - shown when button is clicked */}
          {showNotizTextarea && (
            <div className="bg-white rounded-2xl border border-[#d9e0f0] p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notiz</label>
              <textarea
                value={notizText}
                onChange={(e) => setNotizText(e.target.value)}
                placeholder="Notiz eingeben..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:border-transparent resize-none"
              />
            </div>
          )}
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

    <AbholungFilialeModal
      open={showFilialeModal}
      onOpenChange={setShowFilialeModal}
      locations={locations}
      locationsLoading={locationsLoading}
      value={form.geschaeftsstandort}
      onConfirm={(loc) => {
        if (loc) form.setGeschaeftsstandort(loc)
      }}
    />

    <VersandAnKundenModal
      open={showVersandModal}
      onOpenChange={setShowVersandModal}
      value={
        form.geschaeftsstandort?.description === 'Versand an Kunden'
          ? form.geschaeftsstandort.address
          : null
      }
      onConfirm={(address) => {
        // getLocation API returns only address strings (no description); we always set description for Abholung display
        if (address)
          form.setGeschaeftsstandort({
            id: 'versand',
            address,
            description: 'Versand an Kunden',
          })
      }}
    />
  </>
  )
}
