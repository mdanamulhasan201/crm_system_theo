'use client'

import React, { useState, useEffect } from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Package, Plus, Trash2, Loader2 } from 'lucide-react'
import {
  type InventoryPosition,
  addInventoryPosition,
  updateInventoryPosition,
  deleteInventoryPosition,
} from '@/apis/warenwirtschaftApis'
import toast from 'react-hot-toast'

// Internal row — `serverId` tracks the server-side id for existing positions
interface Position {
  id: string        // local UI key
  serverId?: string // server id (present for existing positions)
  checked: boolean
  artikel: string
  kategorie: string
  menge: number
  unit: number
  ePreis: number
  isDirty: boolean  // true when an existing position has been edited
}

const KATEGORIE_OPTIONS = [
  'Lager – Allgemein',
  'Lager – Einzel',
  'Lager – Extern',
  'Produktion',
  'Verbrauch',
]

function createPosition(): Position {
  return {
    id: Math.random().toString(36).slice(2),
    serverId: undefined,
    checked: true,
    artikel: '',
    kategorie: 'Lager – Allgemein',
    menge: 1,
    unit: 1,
    ePreis: 0,
    isDirty: false,
  }
}

function fromApiPosition(p: InventoryPosition): Position {
  return {
    id: Math.random().toString(36).slice(2),
    serverId: p.id,
    checked: true,
    artikel: p.article,
    kategorie: p.category,
    menge: p.quantity,
    unit: p.unit,
    ePreis: p.unit_price,
    isDirty: false,
  }
}

function toApiPosition(p: Position): InventoryPosition {
  return {
    article: p.artikel,
    category: p.kategorie,
    quantity: p.menge,
    unit: p.unit,
    unit_price: p.ePreis,
    total_price: p.menge * p.ePreis,
  }
}

interface PositionenSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass for create-mode confirm callback */
  onConfirm?: (positions: InventoryPosition[]) => void
  /** Pass existing positions when in edit mode */
  initialPositions?: InventoryPosition[]
  /** Parent inventory id — enables edit mode (direct API calls) */
  inventoryId?: string
}

export default function PositionenSidebar({
  open,
  onOpenChange,
  onConfirm,
  initialPositions,
  inventoryId,
}: PositionenSidebarProps) {
  const isEditMode = Boolean(inventoryId)

  const [positions, setPositions] = useState<Position[]>([createPosition()])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Populate from initialPositions when sidebar opens
  useEffect(() => {
    if (open) {
      if (initialPositions && initialPositions.length > 0) {
        setPositions(initialPositions.map(fromApiPosition))
      } else {
        setPositions([createPosition()])
      }
    }
  }, [open, initialPositions])

  const update = <K extends keyof Position>(id: string, field: K, value: Position[K]) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const updated = { ...p, [field]: value }
        // Mark dirty if an existing position is modified
        if (p.serverId && field !== 'checked' && field !== 'isDirty') updated.isDirty = true
        return updated
      })
    )
  }

  const addPosition = () => setPositions((prev) => [...prev, createPosition()])

  // Delete — immediately call API if existing, else just remove locally
  const handleDelete = async (p: Position) => {
    if (p.serverId) {
      setDeletingId(p.id)
      try {
        await deleteInventoryPosition(p.serverId)
        setPositions((prev) => prev.filter((x) => x.id !== p.id))
        toast.success('Position gelöscht.')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Fehler beim Löschen')
      } finally {
        setDeletingId(null)
      }
    } else {
      setPositions((prev) => prev.filter((x) => x.id !== p.id))
    }
  }

  const gesamtwert = positions.reduce((sum, p) => sum + p.menge * p.ePreis, 0)
  const davonInsLager = positions.filter((p) => p.checked).reduce((sum, p) => sum + p.menge * p.ePreis, 0)

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // ── CREATE MODE ──────────────────────────────────────────────
  const handleCreateConfirm = () => {
    const checked = positions.filter((p) => p.checked).map(toApiPosition)
    onConfirm?.(checked)
    onOpenChange(false)
  }

  // ── EDIT MODE ────────────────────────────────────────────────
  const handleEditSave = async () => {
    setSaving(true)
    try {
      const tasks: Promise<unknown>[] = []

      for (const p of positions.filter((x) => x.checked)) {
        if (p.serverId) {
          // Existing — update only if dirty
          if (p.isDirty) {
            tasks.push(updateInventoryPosition(p.serverId, toApiPosition(p)))
          }
        } else {
          // New — add with parent inventoryId
          tasks.push(
            addInventoryPosition({ ...toApiPosition(p), inventoryId })
          )
        }
      }

      await Promise.all(tasks)
      toast.success('Positionen gespeichert.')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay className="bg-black/40" />
        <SheetPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-gray-200 bg-white p-0 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-500 sm:max-w-3xl"
        >
          {/* Header */}
          <SheetHeader className="border-b border-gray-100 px-6 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#1a7fc1]/10">
                  <Package className="size-5 text-[#1a7fc1]" />
                </div>
                <SheetTitle className="text-base font-semibold text-gray-900">
                  Positionen prüfen &amp; buchen
                </SheetTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPosition}
                className="gap-1.5 cursor-pointer text-sm border-gray-200 hover:border-[#1a7fc1] hover:text-[#1a7fc1] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Position
              </Button>
            </div>
          </SheetHeader>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Column headers */}
            <div
              className="mb-2 grid items-center gap-2 px-2 text-xs font-medium uppercase tracking-wide text-gray-400"
              style={{ gridTemplateColumns: '32px 1fr 1.4fr 72px 90px 90px 72px 32px' }}
            >
              <span />
              <span>Artikel</span>
              <span>Kategorie</span>
              <span>Menge</span>
              <span>Einheit</span>
              <span>E-Preis</span>
              <span className="text-right">Gesamt</span>
              <span />
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {positions.map((p) => {
                const gesamt = p.menge * p.ePreis
                const isDeleting = deletingId === p.id
                return (
                  <div
                    key={p.id}
                    className="grid items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-2 py-2.5 transition-colors hover:border-gray-200"
                    style={{ gridTemplateColumns: '32px 1fr 1.4fr 72px 90px 90px 72px 32px' }}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      checked={p.checked}
                      onChange={(e) => update(p.id, 'checked', e.target.checked)}
                    />

                    {/* Artikel */}
                    <Input
                      value={p.artikel}
                      onChange={(e) => update(p.id, 'artikel', e.target.value)}
                      placeholder="Artikel"
                      className="h-8 text-sm"
                    />

                    {/* Kategorie */}
                    <Select value={p.kategorie} onValueChange={(v) => update(p.id, 'kategorie', v)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KATEGORIE_OPTIONS.map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Menge */}
                    <Input
                      type="number"
                      min={0}
                      value={p.menge}
                      onChange={(e) => update(p.id, 'menge', Number(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />

                    {/* Unit (numeric) */}
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={p.unit === 0 ? '' : p.unit}
                      onChange={(e) => update(p.id, 'unit', Number(e.target.value) || 0)}
                      placeholder="1"
                      className="h-8 text-sm"
                    />

                    {/* E-Preis */}
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={p.ePreis === 0 ? '' : p.ePreis}
                      onChange={(e) => update(p.id, 'ePreis', Number(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />

                    {/* Gesamt */}
                    <span className="text-right text-sm font-medium text-gray-700">
                      {fmt(gesamt)}&thinsp;€
                    </span>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={positions.length === 1 || isDeleting}
                      className="flex items-center justify-center rounded p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      {isDeleting
                        ? <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary + Footer */}
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
            <div className="mb-4 rounded-lg border border-gray-100 bg-white px-4 py-3 flex items-center gap-8 text-sm text-gray-600">
              <span>
                Gesamtwert:{' '}
                <span className="font-semibold text-gray-900">{fmt(gesamtwert)}&thinsp;€</span>
              </span>
              <span className="h-4 w-px bg-gray-200" />
              <span>
                Davon ins Lager:{' '}
                <span className="font-bold text-gray-900">{fmt(davonInsLager)}&thinsp;€</span>
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
                disabled={saving}
              >
                Zurück
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={isEditMode ? handleEditSave : handleCreateConfirm}
                className="cursor-pointer bg-[#1a7fc1] hover:bg-[#1a7fc1]/90 text-white gap-2"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Speichern...</>
                  : <><Package className="h-4 w-4" />Ins Lager buchen</>
                }
              </Button>
            </div>
          </div>

          {/* Close button */}
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  )
}
