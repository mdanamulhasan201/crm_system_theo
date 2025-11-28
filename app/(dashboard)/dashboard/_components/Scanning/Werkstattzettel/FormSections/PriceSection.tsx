import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Price {
  id: string
  fußanalyse: number
  einlagenversorgung: number
}

interface PriceSectionProps {
  footAnalysisPrice: string
  onFootAnalysisPriceChange: (value: string) => void
  insoleSupplyPrice: string
  onInsoleSupplyPriceChange: (value: string) => void
  customFootPrice: string
  onCustomFootPriceChange: (value: string) => void
  customInsolePrice: string
  onCustomInsolePriceChange: (value: string) => void
  prices: Price[]
  pricesLoading: boolean
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
  prices,
  pricesLoading,
}: PriceSectionProps) {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Preise</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold">Fußanalyse</Label>
          <Select value={footAnalysisPrice} onValueChange={onFootAnalysisPriceChange}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={pricesLoading ? 'Lade Preise...' : 'Preis auswählen'}
              />
            </SelectTrigger>
            <SelectContent>
              {prices.map((price) => (
                <SelectItem
                  className="cursor-pointer"
                  key={`foot-${price.id}`}
                  value={String(price.fußanalyse)}
                >
                  {price.fußanalyse}€
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {footAnalysisPrice === 'custom' && (
            <Input
              type="number"
              placeholder="Preis eingeben"
              value={customFootPrice}
              onChange={(e) => onCustomFootPriceChange(e.target.value)}
              className="w-full mt-2"
            />
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Einlagenversorgung</Label>
          <Select value={insoleSupplyPrice} onValueChange={onInsoleSupplyPriceChange}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={pricesLoading ? 'Lade Preise...' : 'Preis auswählen'}
              />
            </SelectTrigger>
            <SelectContent>
              {prices.map((price) => (
                <SelectItem
                  className="cursor-pointer"
                  key={`insole-${price.id}`}
                  value={String(price.einlagenversorgung)}
                >
                  {price.einlagenversorgung}€
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {insoleSupplyPrice === 'custom' && (
            <Input
              type="number"
              placeholder="Preis eingeben"
              value={customInsolePrice}
              onChange={(e) => onCustomInsolePriceChange(e.target.value)}
              className="w-full mt-2"
            />
          )}
        </div>
      </div>
    </div>
  )
}

