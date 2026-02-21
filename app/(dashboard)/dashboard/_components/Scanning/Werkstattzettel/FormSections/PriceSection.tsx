import React, { useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types'
import PaymentStatusSection from './PaymentStatusSection'
import { FileText } from 'lucide-react'

type EinlagenversorgungPriceItem = { name: string; price: number } | number

interface PriceSectionProps {
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
  bezahlt: string
  onBezahltChange: (value: string) => void
  paymentError?: string
  disabledPaymentType?: 'Privat' | 'Krankenkasse'

  // Date utils
  datumAuftrag?: string
  completionDays?: string | number
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
  bezahlt,
  onBezahltChange,
  paymentError,
  disabledPaymentType,
  datumAuftrag,
  completionDays,
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

  const subtotal = (versorgungPrice * quantityNum) + footPrice
  const discountAmount = discountType === 'percentage' && discountValue
    ? (subtotal * parseFloat(discountValue)) / 100
    : 0
  const total = subtotal - discountAmount

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
      <div className="flex items-center gap-2 mb-8">
        <FileText className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wider">Auftragsdetails & Preise</h3>
      </div>

      {/* Main Layout: Form on left, Summary on right - equal width flex */}
      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        {/* Left Side: Form Fields */}
        <div className="flex-1 min-w-0 space-y-4 w-full lg:w-auto">
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

          {/* Menge | Fußanalyse | Fertigstellung bis - same line, flex, Fertigstellung bis last */}


          <div className="">

            {/* Fertigstellung bis - Date 50%, Time dropdowns 50% */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Fertigstellung bis</Label>
              <div className="flex items-center gap-2 w-full">
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


          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <Label className="text-sm font-medium text-gray-700">Menge</Label>
              <Select value={quantity} onValueChange={onQuantityChange}>
                <SelectTrigger className="h-10 border-gray-300 w-full text-sm">
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
            <div className="space-y-1.5 flex-1 min-w-[140px]">
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
                        'h-10 border-gray-300 w-full text-sm',
                        footAnalysisPriceError && 'border-red-500 focus-visible:ring-red-500'
                      )}
                    >
                      <SelectValue placeholder={pricesLoading ? 'Lade...' : 'Preis auswählen'} />
                    </SelectTrigger>
                    <SelectContent>
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
                  className={cn('h-10 border-gray-300 text-sm mt-1', customFootPriceError && 'border-red-500')}
                />
              )}
              {footAnalysisPriceError && <p className="text-xs text-red-500">{footAnalysisPriceError}</p>}
            </div>
          </div>

          {/* Rabatt and Kostenträger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 items-end">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Rabatt</Label>
              <Select
                value={discountType || 'none'}
                onValueChange={(value) => onDiscountTypeChange(value === 'none' ? '' : value)}
              >
                <SelectTrigger className="h-11 border-gray-300">
                  <SelectValue placeholder="Kein Rabatt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Rabatt</SelectItem>
                  <SelectItem value="percentage">Prozent (%)</SelectItem>
                </SelectContent>
              </Select>
              {discountType === 'percentage' && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="z.B. 10"
                  value={discountValue}
                  onChange={(e) => onDiscountValueChange(e.target.value)}
                  className="h-11 border-gray-300 mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              {/* <Label className="text-sm font-medium text-gray-700">Kostenträger</Label> */}
              <PaymentStatusSection
                value={bezahlt}
                onChange={onBezahltChange}
                error={paymentError}
                disabledPaymentType={disabledPaymentType}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Price Summary - same width as left */}
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4 h-full">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Preisübersicht</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Versorgung</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(versorgungPrice)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Menge</span>
                <span className="text-sm font-semibold text-gray-900">× {quantityNum}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fußanalyse</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(footPrice)}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                <span className="text-sm text-gray-600">Zwischensumme</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rabatt ({discountValue}%)</span>
                  <span className="text-sm font-semibold text-red-600">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                <span className="text-base font-bold text-gray-900">Gesamt</span>
                <span className="text-xl font-bold text-green-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

