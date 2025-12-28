import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PriceItem } from '@/app/(dashboard)/dashboard/settings-profile/_components/Preisverwaltung/types'
import PaymentStatusSection from './PaymentStatusSection'

interface PriceSectionProps {
  footAnalysisPrice: string
  onFootAnalysisPriceChange: (value: string) => void
  insoleSupplyPrice: string
  onInsoleSupplyPriceChange: (value: string) => void
  customFootPrice: string
  onCustomFootPriceChange: (value: string) => void
  customInsolePrice: string
  onCustomInsolePriceChange: (value: string) => void
  laserPrintPrices: PriceItem[]
  einlagenversorgungPrices: number[]
  pricesLoading: boolean
  footAnalysisPriceError?: string
  insoleSupplyPriceError?: string
  customFootPriceError?: string
  customInsolePriceError?: string
  // Rabatt fields
  discountType: string
  onDiscountTypeChange: (value: string) => void
  discountValue: string
  onDiscountValueChange: (value: string) => void
  // Kostenträger fields
  bezahlt: string
  onBezahltChange: (value: string) => void
  paymentError?: string
}

export default function PriceSection({
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
}: PriceSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold">Fußanalyse</Label>
          <Select value={footAnalysisPrice} onValueChange={onFootAnalysisPriceChange}>
            <SelectTrigger
              className={cn(
                'w-full',
                footAnalysisPriceError && 'border-red-500 focus-visible:ring-red-500'
              )}
            >
              <SelectValue
                placeholder={pricesLoading ? 'Lade Preise...' : laserPrintPrices.length > 0 ? 'Preis auswählen' : 'Kein Preis verfügbar'}
              />
            </SelectTrigger>
            <SelectContent>
              {laserPrintPrices.length > 0 ? (
                laserPrintPrices.map((item, index) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={`foot-${item.name}-${item.price}-${index}`}
                    value={String(item.price)}
                  >
                    {item.name} - {item.price.toFixed(2).replace(".", ",")}€
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-price" disabled>
                  Kein Preis verfügbar
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {footAnalysisPrice === 'custom' && (
            <Input
              type="number"
              placeholder="Preis eingeben"
              value={customFootPrice}
              onChange={(e) => onCustomFootPriceChange(e.target.value)}
              className={cn(
                'w-full mt-2',
                customFootPriceError && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
          )}
          {customFootPriceError && (
            <p className="text-xs text-red-500 mt-1">{customFootPriceError}</p>
          )}
          {footAnalysisPriceError && (
            <p className="text-xs text-red-500 mt-1">{footAnalysisPriceError}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Einlagenversorgung</Label>
          <Select value={insoleSupplyPrice} onValueChange={onInsoleSupplyPriceChange}>
            <SelectTrigger
              className={cn(
                'w-full',
                insoleSupplyPriceError && 'border-red-500 focus-visible:ring-red-500'
              )}
            >
              <SelectValue
                placeholder={pricesLoading ? 'Lade Preise...' : einlagenversorgungPrices.length > 0 ? 'Preis auswählen' : 'Kein Preis verfügbar'}
              />
            </SelectTrigger>
            <SelectContent>
              {einlagenversorgungPrices.length > 0 ? (
                einlagenversorgungPrices.map((price, index) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={`insole-${index}`}
                    value={String(price)}
                  >
                    {price}€
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-price" disabled>
                  Kein Preis verfügbar
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {insoleSupplyPrice === 'custom' && (
            <Input
              type="number"
              placeholder="Preis eingeben"
              value={customInsolePrice}
              onChange={(e) => onCustomInsolePriceChange(e.target.value)}
              className={cn(
                'w-full mt-2',
                customInsolePriceError && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
          )}
          {customInsolePriceError && (
            <p className="text-xs text-red-500 mt-1">{customInsolePriceError}</p>
          )}
          {insoleSupplyPriceError && (
            <p className="text-xs text-red-500 mt-1">{insoleSupplyPriceError}</p>
          )}
        </div>

        {/* Rabatt Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Rabatt</Label>
          <div className="flex gap-2">
            <Select value={discountType} onValueChange={onDiscountTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rabatttyp wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Prozent (%)</SelectItem>
              </SelectContent>
            </Select>
            {discountType && (
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="z.B. 10"
                value={discountValue}
                onChange={(e) => onDiscountValueChange(e.target.value)}
                className="w-full"
              />
            )}
          </div>
        </div>

        {/* Kostenträger Section */}
        <div className="space-y-3">
          <PaymentStatusSection
            value={bezahlt}
            onChange={onBezahltChange}
            error={paymentError}
          />
        </div>
      </div>
  )
}

