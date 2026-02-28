import React, { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types'
import PaymentStatusSection from './PaymentStatusSection'
import LocationDropdown from '../Dropdowns/LocationDropdown'
import { FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type EinlagenversorgungPriceItem = { name: string; price: number } | number

interface PriceSectionProps {
  // Auftrag angenommen bei (location dropdown before Versorgung - separate from Abholung)
  auftragAngenommenBei?: { id: string; address: string; description: string; isPrimary?: boolean } | null
  locations?: Array<{ id: string; address: string; description: string; isPrimary?: boolean }>
  isAuftragLocationDropdownOpen?: boolean
  onAuftragLocationDropdownChange?: (open: boolean) => void
  onAuftragAngenommenBeiChange?: (location: { id: string; address: string; description: string; isPrimary?: boolean } | null) => void
  onAuftragAngenommenBeiClear?: () => void

  // Versorgung, Menge, Fertigstellung bis
  versorgung: string
  versorgungsname?: string
  onVersorgungChange: (value: string) => void
  quantity: string
  onQuantityChange: (value: string) => void
  fertigstellungBis: string
  onFertigstellungBisChange: (value: string) => void
  fertigstellungBisTime: string
  onFertigstellungBisTimeChange: (value: string) => void
  versorgungError?: string
  fertigstellungBisError?: string

  // Price fields
  footAnalysisPrice: string
  onFootAnalysisPriceChange: (value: string) => void
  insoleSupplyPrice: string
  onInsoleSupplyPriceChange: (value: string) => void
  customFootPrice: string
  onCustomFootPriceChange: (value: string) => void
  customInsolePrice: string
  onCustomInsolePriceChange: (value: string) => void
  laserPrintPrices: PriceItem[]
  einlagenversorgungPrices: EinlagenversorgungPriceItem[]
  pricesLoading: boolean
  footAnalysisPriceError?: string
  insoleSupplyPriceError?: string
  customFootPriceError?: string
  customInsolePriceError?: string
  discountType: string
  onDiscountTypeChange: (value: string) => void
  discountValue: string
  onDiscountValueChange: (value: string) => void
  addonPrices?: string
  onAddonPricesChange?: (value: string) => void
  positionsnummerPrice?: number
  bezahlt: string
  onBezahltChange: (value: string) => void
  paymentError?: string
  disabledPaymentType?: 'Privat' | 'Krankenkasse'

  // Date utils
  datumAuftrag?: string
  completionDays?: string | number

  // Sonstiges: show tax next to Gesamt (selected Steuersatz + MwSt amount)
  steuersatz?: number
  mwstAmount?: number
  // Report calculated Gesamt (total) so parent can use it as total_price
  onTotalChange?: (total: number) => void
}

// Helper function to format price in German format
const formatPrice = (price: number): string => {
  return price.toFixed(2).replace('.', ',') + '€'
}

// Helper function to extract price and name from Einlagenversorgung price item
const getPriceInfo = (item: EinlagenversorgungPriceItem): { price: number; name: string } => {
  if (typeof item === 'number') {
    return { price: item, name: '' }
  }
  return { price: item.price, name: item.name }
}

// Helper function to format Einlagenversorgung display text
const formatEinlagenversorgungText = (item: EinlagenversorgungPriceItem): string => {
  const { price, name } = getPriceInfo(item)
  return name ? `${name} - ${formatPrice(price)}` : formatPrice(price)
}

export default function PriceSection({
  auftragAngenommenBei,
  locations = [],
  isAuftragLocationDropdownOpen = false,
  onAuftragLocationDropdownChange,
  onAuftragAngenommenBeiChange,
  onAuftragAngenommenBeiClear,
  versorgung,
  versorgungsname,
  onVersorgungChange,
  quantity,
  onQuantityChange,
  fertigstellungBis,
  onFertigstellungBisChange,
  fertigstellungBisTime,
  onFertigstellungBisTimeChange,
  versorgungError,
  fertigstellungBisError,
  footAnalysisPrice,
  onFootAnalysisPriceChange,
  insoleSupplyPrice,
  onInsoleSupplyPriceChange,
  customFootPrice,
  onCustomFootPriceChange,
  customInsolePrice,
  onCustomInsolePriceChange,
  laserPrintPrices,
  einlagenversorgungPrices,
  pricesLoading,
  footAnalysisPriceError,
  insoleSupplyPriceError,
  customFootPriceError,
  customInsolePriceError,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
  addonPrices = '',
  onAddonPricesChange,
  positionsnummerPrice = 0,
  bezahlt,
  onBezahltChange,
  paymentError,
  disabledPaymentType,
  datumAuftrag,
  completionDays,
  steuersatz,
  mwstAmount,
  onTotalChange,
}: PriceSectionProps) {
  // Build unique option keys so only ONE item can ever appear selected,
  // even if multiple items share the same numeric price.
  const footOptions = useMemo(() => {
    return laserPrintPrices.map((item, index) => ({
      key: `price:${item.price}:${index}`,
      price: item.price,
      label: `${item.name} - ${formatPrice(item.price)}`,
    }))
  }, [laserPrintPrices])

  // Keep a separate UI selection key so selecting a different option with the same price
  // still updates the highlighted item (external state stores only numeric price).
  const [footSelectedKey, setFootSelectedKey] = useState<string>('')

  useEffect(() => {
    if (footOptions.length === 0) return

    // If we already have a selected key that exists, keep it (even if price is duplicated)
    if (footSelectedKey && footOptions.some((o) => o.key === footSelectedKey)) {
      return
    }

    // Otherwise derive from current numeric value (fallback to first matching)
    const numericSelected = parseFloat(footAnalysisPrice)
    const derived = footOptions.find((o) => o.price === numericSelected)?.key || ''
    setFootSelectedKey(derived)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footAnalysisPrice, footOptions])

  // Calculate prices
  const versorgungPrice = parseFloat(insoleSupplyPrice) || 0
  const footPrice =
    footAnalysisPrice === 'custom'
      ? (parseFloat(customFootPrice) || 0)
      : (parseFloat(footAnalysisPrice) || 0)
  const quantityNum = parseInt(quantity?.match(/\d+/)?.[0] || '1', 10)

  // Parse addon prices - supports single number or comma-separated (e.g. "10" or "10, 20, 5")
  const addonPricesTotal = useMemo(() => {
    if (!addonPrices || typeof addonPrices !== 'string') return 0
    const parts = addonPrices.split(/[,\s]+/).filter(Boolean)
    return parts.reduce((sum, p) => sum + (parseFloat(p.replace(',', '.')) || 0), 0)
  }, [addonPrices])

  const subtotal = (versorgungPrice * quantityNum) + footPrice + addonPricesTotal + (positionsnummerPrice || 0)
  const discountAmount = discountType === 'percentage' && discountValue
    ? (subtotal * parseFloat(discountValue)) / 100
    : 0
  const total = subtotal - discountAmount

  // Report Gesamt (total) to parent so it can be used as total_price
  useEffect(() => {
    onTotalChange?.(total)
  }, [total, onTotalChange])

  // Positionsnummer VAT breakdown & insurance/customer split (using account vat_country)
  const { user } = useAuth()
  const vatCountry = user?.accountInfo?.vat_country
  const getVatRate = (): number => {
    if (vatCountry === 'Italien (IT)') return 4
    if (vatCountry === 'Österreich (AT)') return 20
    return 0
  }
  const positionsnummerGross = positionsnummerPrice || 0
  const positionsVatRate = getVatRate()
  const positionsnummerNet =
    positionsVatRate > 0 ? positionsnummerGross / (1 + positionsVatRate / 100) : positionsnummerGross
  const positionsnummerVatAmount = positionsnummerGross - positionsnummerNet

  // Simple split: insurance pays Positionsnummer (inkl. MwSt.), customer pays the rest + Eigenanteil (AT)
  const isInsuranceMode = disabledPaymentType === 'Krankenkasse'
  const insurancePays = isInsuranceMode ? positionsnummerGross : 0
  const eigenanteil = isInsuranceMode && vatCountry === 'Österreich (AT)' ? 43 : 0
  const customerPays = Math.max(total - insurancePays, 0) + eigenanteil

  // Generate hours (05-21) for 24-hour format and minutes (00, 10, 20, 30, 40, 50)
  const hours24 = Array.from({ length: 17 }, (_, i) => String(i + 5).padStart(2, '0'))
  const minutes = ['00', '10', '20', '30', '40', '50']

  // Parse 24-hour time format
  const parseTime24Hour = (time24: string) => {
    if (!time24 || time24.trim() === '') return { hour: '', minute: '' }
    const [hour, minute] = time24.split(':')
    return { hour: hour || '', minute: minute || '' }
  }

  // Convert hour and minute to 24-hour format string
  const convertTo24Hour = (hour: string, minute: string) => {
    if (!hour || !minute) return ''
    return `${hour.padStart(2, '0')}:${minute}`
  }

  const { hour: currentHour, minute: currentMinute } = parseTime24Hour(fertigstellungBisTime || '')

  const handleHourChange = (hour: string) => {
    if (!hour) {
      onFertigstellungBisTimeChange('')
      return
    }
    const minute = currentMinute || '00'
    onFertigstellungBisTimeChange(convertTo24Hour(hour, minute))
  }

  const handleMinuteChange = (minute: string) => {
    if (!minute) {
      onFertigstellungBisTimeChange('')
      return
    }
    const hour = currentHour || '09'
    onFertigstellungBisTimeChange(convertTo24Hour(hour, minute))
  }

  return (
    <div className="space-y-0">
      {/* Header with icon */}
      <div className="flex items-start gap-2 mb-8 ">
        <FileText className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider">Auftragsdetails & Preise</h3>
      </div>

      {/* Main Layout: Left 10/12 (form), Right 2/12 (summary) on lg; stacked on small */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 w-full max-w-full items-stretch overflow-hidden">
        {/* Left Side: Form Fields – 10/12 on lg */}
        <div className="space-y-4 w-full min-w-0 lg:col-span-6">

            {/* Versorgung & Versorgungsname */}
            <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Versorgung</p>
              <p className="text-[15px] font-semibold text-gray-700">
                {versorgung || '-'}
              </p>
              {versorgungsname ? (
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium text-gray-600">Versorgungsname:</span> {versorgungsname}
                </p>
              ) : null}
              {versorgungError && (
                <p className="text-xs text-red-500 mt-1">{versorgungError}</p>
              )}
            </div>
          </div>
          {/* Auftrag angenommen bei - location dropdown (separate from Abholung) */}
          {locations && locations.length > 0 && onAuftragAngenommenBeiChange && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Auftrag angenommen bei</Label>
              <LocationDropdown
                value={auftragAngenommenBei ?? null}
                locations={locations}
                isOpen={isAuftragLocationDropdownOpen}
                onOpenChange={onAuftragLocationDropdownChange ?? (() => {})}
                onChange={onAuftragAngenommenBeiChange}
                onSelect={onAuftragAngenommenBeiChange}
                onClear={onAuftragAngenommenBeiClear}
              />
            </div>
          )}

        

          {/* Menge | Fußanalyse | Fertigstellung bis - same line, flex, Fertigstellung bis last */}


          <div className="">

            {/* Fertigstellung bis - Date + Time, responsive */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Fertigstellung bis</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
                <Input
                  type="date"
                  value={fertigstellungBis ? fertigstellungBis.slice(0, 10) : ''}
                  onChange={(e) => onFertigstellungBisChange(e.target.value)}
                  className={cn(
                    'h-10 border-gray-300 flex-1 min-w-0 text-sm',
                    fertigstellungBisError && 'border-red-500'
                  )}
                />
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Select value={currentHour || '__placeholder__'} onValueChange={(v) => handleHourChange(v === '__placeholder__' ? '' : v)}>
                    <SelectTrigger className="h-10 border-gray-300 flex-1 min-w-0 text-sm">
                      <SelectValue placeholder="Std" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__placeholder__">Std</SelectItem>
                      {hours24.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-400 text-sm shrink-0">:</span>
                  <Select value={currentMinute || '__placeholder__'} onValueChange={(v) => handleMinuteChange(v === '__placeholder__' ? '' : v)}>
                    <SelectTrigger className="h-10 border-gray-300 flex-1 min-w-0 text-sm">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__placeholder__">Min</SelectItem>
                      {minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {fertigstellungBisError && <p className="text-xs text-red-500">{fertigstellungBisError}</p>}
            </div>
          </div>


          {/* Fußanalyse (left 50%) | Rabatt (right 50%, split half-half when % input visible) – flex */}
          <div className="flex flex-col sm:flex-row gap-4 w-full items-stretch">
            {/* Left half: Fußanalyse – always 50% */}
            <div className="space-y-1.5 min-w-0 flex-1 sm:flex-[0_0_60%]">
              <Label className="text-sm font-medium text-gray-700">Fußanalyse</Label>
              {(() => {
                const handleChange = (key: string) => {
                  setFootSelectedKey(key)
                  const found = footOptions.find((o) => o.key === key)
                  if (found) {
                    onFootAnalysisPriceChange(String(found.price))
                  }
                }
                return (
                  <Select value={footSelectedKey} onValueChange={handleChange}>
                    <SelectTrigger
                      className={cn(
                        'h-10 border-gray-300 w-full text-sm min-w-0',
                        footAnalysisPriceError && 'border-red-500 focus-visible:ring-red-500'
                      )}
                    >
                      <SelectValue placeholder={pricesLoading ? 'Lade...' : 'Preis auswählen'} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[min(24rem,100vw)]">
                      {laserPrintPrices.length > 0 ? (
                        footOptions.map((item) => (
                          <SelectItem className="cursor-pointer" key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-price" disabled>Kein Preis verfügbar</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )
              })()}
              {footAnalysisPrice === 'custom' && (
                <Input
                  type="number"
                  placeholder="Preis eingeben"
                  value={customFootPrice}
                  onChange={(e) => onCustomFootPriceChange(e.target.value)}
                  className={cn(' border-gray-300 text-sm mt-1 w-full min-w-0', customFootPriceError && 'border-red-500')}
                />
              )}
              {footAnalysisPriceError && <p className="text-xs text-red-500">{footAnalysisPriceError}</p>}
            </div>

            {/* Right half: Rabatt – when Prozent selected, dropdown and input each take exactly half */}
            <div className="space-y-1.5 min-w-0 flex-1 sm:flex-[0_0_40%]">
              <Label className="text-sm font-medium text-gray-700">Rabatt</Label>
              <div className="flex flex-row gap-2 w-full min-w-0">
                <div className={cn('min-w-0', discountType === 'percentage' ? 'flex-1 basis-0' : 'flex-1')}>
                  <Select
                    value={discountType || 'none'}
                    onValueChange={(value) => onDiscountTypeChange(value === 'none' ? '' : value)}
                  >
                    <SelectTrigger className=" border-gray-300 text-sm w-full min-w-0 max-w-full overflow-hidden">
                      <SelectValue placeholder="Kein Rabatt" />
                    </SelectTrigger>
                    <SelectContent className="min-w-32 w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="none">Kein Rabatt</SelectItem>
                      <SelectItem value="percentage">Prozent (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {discountType === 'percentage' && (
                  <div className="flex-1 basis-0 min-w-0">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="z.B. 10 %"
                      value={discountValue}
                      onChange={(e) => onDiscountValueChange(e.target.value)}
                      className=" py-2 border-gray-300 w-full min-w-0 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Addon Preise (left half) | Kostenträger (right half) – bottom row */}
          <div className="grid grid-cols-1 gap-4 w-full">
            <div className="space-y-1.5 min-w-0">
              <Label className="text-sm font-medium text-gray-700">Wirtschaftlicher Aufpreis</Label>
              <Input
                type="text"
                placeholder="Preis eingeben"
                value={addonPrices}
                onChange={(e) => onAddonPricesChange?.(e.target.value)}
                className="py-2 border-gray-300 w-full min-w-0 text-sm"
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <PaymentStatusSection
                value={bezahlt}
                onChange={onBezahltChange}
                error={paymentError}
                disabledPaymentType={disabledPaymentType}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Price Summary – 2/12 on lg, full width on small */}
        <div className="w-full min-w-0 lg:col-span-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5 space-y-4 h-full min-h-0">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Preisübersicht</h4>

            <div className="space-y-3 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-600 truncate">Versorgung</span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(versorgungPrice)}</span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-600 truncate">Menge</span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">× {quantityNum}</span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-600 truncate">Fußanalyse</span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(footPrice)}</span>
              </div>

              {addonPricesTotal > 0 && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-600 truncate">Wirtschaftlicher Aufpreis</span>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(addonPricesTotal)}</span>
                </div>
              )}

              {(positionsnummerPrice || 0) > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-gray-600 truncate">Positionsnummer netto</span>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(positionsnummerNet)}
                    </span>
                  </div>
                  {positionsVatRate > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm text-gray-600 truncate">
                        + {positionsVatRate}% MwSt. auf Positionsnummer
                      </span>
                      <span className="text-sm font-semibold text-gray-900 shrink-0">
                        {formatPrice(positionsnummerVatAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm text-gray-600 truncate">Positionsnummer (inkl. MwSt.)</span>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(positionsnummerPrice || 0)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center gap-2 pt-3 border-t border-gray-300">
                <span className="text-sm text-gray-600 truncate">Zwischensumme</span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-600 truncate">Rabatt ({discountValue}%)</span>
                  <span className="text-sm font-semibold text-red-600 shrink-0">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center gap-2 pt-3 border-t-2 border-gray-400">
                <span className="text-base font-bold text-gray-900">Gesamt</span>
                <span className="text-lg sm:text-xl font-bold text-green-600 shrink-0">{formatPrice(total)}</span>
              </div>
              {steuersatz != null && mwstAmount != null && (
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    MwSt ({steuersatz}%): {formatPrice(mwstAmount)}
                  </span>
                </div>
              )}

              {/* Insurance vs Customer split */}
              <div className="mt-3 pt-3 border-t border-gray-300 space-y-1">
                {isInsuranceMode && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-semibold text-sky-700 truncate">
                      Versicherung zahlt
                    </span>
                    <span className="text-sm font-semibold text-sky-700 shrink-0">
                      {formatPrice(insurancePays)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-semibold text-amber-700 truncate">
                    Kunde zahlt
                  </span>
                  <span className="text-sm font-semibold text-amber-700 shrink-0">
                    {formatPrice(customerPays)}
                  </span>
                </div>
                {eigenanteil > 0 && (
                  <p className="text-xs text-gray-600">
                    Enthält Eigenanteil (AT): {formatPrice(eigenanteil)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

