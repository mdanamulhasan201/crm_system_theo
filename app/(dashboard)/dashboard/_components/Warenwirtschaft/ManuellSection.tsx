'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Check, Trash2, Package } from 'lucide-react'

const EINHEIT_OPTIONS = ['Stü', 'kg', 'm', 'L', 'Paar']
const KATEGORIE_OPTIONS = ['Lager-A', 'Lager-B', 'Lager-C']

export interface PositionRow {
  id: string
  artikel: string
  kategorie: string
  menge: number
  einheit: string
  ePreis: number
}

function createEmptyPosition(id: string): PositionRow {
  return {
    id,
    artikel: '',
    kategorie: KATEGORIE_OPTIONS[0] ?? 'Lager-A',
    menge: 1,
    einheit: 'Stü',
    ePreis: 0,
  }
}

interface ManuellSectionProps {
  onBack: () => void
}

export default function ManuellSection({ onBack }: ManuellSectionProps) {
  const [positions, setPositions] = useState<PositionRow[]>(() => [
    createEmptyPosition('1'),
    createEmptyPosition('2'),
  ])

  const addPosition = () => {
    setPositions((prev) => [
      ...prev,
      createEmptyPosition(String(Date.now())),
    ])
  }

  const removePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePosition = (id: string, field: keyof PositionRow, value: string | number) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const gesamtwert = positions.reduce(
    (sum, p) => sum + p.menge * p.ePreis,
    0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Positionen prüfen & buchen
        </h2>
        <Button
          type="button"
          variant="outline"
          size="default"
          className="border-gray-300 bg-white hover:bg-gray-50 text-[#62A17C] hover:text-[#62A17C]/80 cursor-pointer"
          onClick={addPosition}
        >
          <Plus className="size-4" />
          Position
        </Button>
      </div>

      {/* Table – single grey box with header + rows */}
      <div className="mt-4 rounded-xl bg-gray-100/80 border border-gray-200 overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="overflow-auto flex-1 min-h-0 p-3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-sm font-medium text-gray-700">
                <th className="pb-2 pr-2 w-8">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#62A17C] text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                </th>
                <th className="pb-2 pr-2">Artikel</th>
                <th className="pb-2 pr-2">Kategorie</th>
                <th className="pb-2 pr-2 w-20">Menge</th>
                <th className="pb-2 pr-2 w-20">Einheit</th>
                <th className="pb-2 pr-2 w-24">E-Preis</th>
                <th className="pb-2 pr-2 w-20">Gesamt</th>
                <th className="pb-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <PositionTableRow
                  key={pos.id}
                  position={pos}
                  onUpdate={(field, value) => updatePosition(pos.id, field, value)}
                  onRemove={() => removePosition(pos.id)}
                  einheitOptions={EINHEIT_OPTIONS}
                  kategorieOptions={KATEGORIE_OPTIONS}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 space-y-0.5">
        <p className="text-sm text-gray-700">
          Gesamtwert: <span className="font-semibold">{gesamtwert.toFixed(0)} €</span>
        </p>
        <p className="text-sm text-[#62A17C] font-medium">
          Davon ins Lager: {gesamtwert.toFixed(0)} €
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
          onClick={onBack}
        >
          Zurück
        </Button>
        <Button
          type="button"
          size="default"
          className="bg-[#62A17C] hover:bg-[#62A17C]/80 text-white cursor-pointer"
        >
          <Package className="size-4" />
          Ins Lager buchen
        </Button>
      </div>
    </div>
  )
}

interface PositionTableRowProps {
  position: PositionRow
  onUpdate: (field: keyof PositionRow, value: string | number) => void
  onRemove: () => void
  einheitOptions: string[]
  kategorieOptions: string[]
}

function PositionTableRow({
  position,
  onUpdate,
  onRemove,
  einheitOptions,
  kategorieOptions,
}: PositionTableRowProps) {
  const gesamt = position.menge * position.ePreis
  return (
    <tr className="border-t border-gray-200/80 first:border-t-0">
      <td className="py-2 pr-2 align-top pt-3">
        <div className="flex size-6 items-center justify-center rounded-full bg-[#62A17C] text-white shrink-0">
          <Check className="size-3.5" strokeWidth={3} />
        </div>
      </td>
      <td className="py-2 pr-2">
        <Input
          value={position.artikel}
          onChange={(e) => onUpdate('artikel', e.target.value)}
          placeholder="EV."
          className="h-8 text-sm border-gray-200 bg-white"
        />
      </td>
      <td className="py-2 pr-2">
        <Select value={position.kategorie} onValueChange={(v) => onUpdate('kategorie', v)}>
          <SelectTrigger className="h-8 text-sm border-gray-200 bg-white w-full min-w-[100px]">
            <SelectValue placeholder="Lager -..." />
          </SelectTrigger>
          <SelectContent>
            {kategorieOptions.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 pr-2">
        <Input
          type="number"
          min={1}
          value={position.menge}
          onChange={(e) => onUpdate('menge', Number(e.target.value) || 0)}
          className="h-8 text-sm border-gray-200 bg-white w-16"
        />
      </td>
      <td className="py-2 pr-2">
        <Select value={position.einheit} onValueChange={(v) => onUpdate('einheit', v)}>
          <SelectTrigger className="h-8 text-sm border-gray-200 bg-white w-full min-w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {einheitOptions.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 pr-2">
        <Input
          type="number"
          min={0}
          step={0.01}
          value={position.ePreis}
          onChange={(e) => onUpdate('ePreis', Number(e.target.value) || 0)}
          className="h-8 text-sm border-gray-200 bg-white w-20"
        />
      </td>
      <td className="py-2 pr-2 text-sm font-medium text-gray-900 align-top pt-3">
        {gesamt.toFixed(0)} €
      </td>
      <td className="py-2 align-top pt-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  )
}
