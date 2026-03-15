'use client'

import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, FileText, Upload, Pencil, LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ManuellSection from './ManuellSection'
import { getSingleInventory, type InventoryType, type InventoryItem } from '@/apis/warenwirtschaftApis'

type Quelle = 'rechnung' | 'lieferschein' | 'manuell'

const QUELLE_OPTIONS: { value: Quelle; label: string; icon: LucideIcon }[] = [
  { value: 'rechnung', label: 'Rechnung', icon: FileText },
  { value: 'lieferschein', label: 'Lieferschein', icon: Upload },
  { value: 'manuell', label: 'Manuell', icon: Pencil },
]

// Supplier list – replace with API data when ready
export const LIEFERANTEN = [
  { id: '1', name: 'Orthopädie Müller' },
  { id: '2', name: 'Lederwelt GmbH' },
  { id: '3', name: 'SchaumTech' },
  { id: '4', name: 'Renia Kleber' },
  { id: '5', name: 'KorkNatur' },
  { id: '6', name: 'SohlenDirekt' },
  { id: '7', name: 'Global Medical Supply' },
]
const NEU_ANLEGEN_VALUE = '__new__'

export type ManuellContext = {
  inventoryType: InventoryType
  supplierName?: string
}

interface NeuerWareneingangSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editInventoryId?: string | null
}

export default function NeuerWareneingangSidebar({
  open,
  onOpenChange,
  onSuccess,
  editInventoryId,
}: NeuerWareneingangSidebarProps) {
  const [quelle, setQuelle] = useState<Quelle | null>(null)
  const [lieferantId, setLieferantId] = useState<string>('')
  const [showManuellSection, setShowManuellSection] = useState(false)
  const [manuellContext, setManuellContext] = useState<ManuellContext | null>(null)
  const [lieferantError, setLieferantError] = useState<string>('')
  const [editData, setEditData] = useState<InventoryItem | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Edit: single inventory laden wenn editInventoryId gesetzt
  useEffect(() => {
    if (!open || !editInventoryId) {
      setEditData(null)
      setEditError(null)
      return
    }
    setEditLoading(true)
    setEditError(null)
    getSingleInventory(editInventoryId)
      .then((res) => {
        setEditData(res.data)
      })
      .catch(() => {
        setEditError('Fehler beim Laden.')
      })
      .finally(() => {
        setEditLoading(false)
      })
  }, [open, editInventoryId])

  // Beim Schließen der Sidebar State zurücksetzen – beim erneuten Öffnen wieder erste Seite (Quelle + Lieferant)
  useEffect(() => {
    if (!open) {
      setShowManuellSection(false)
      setManuellContext(null)
      setQuelle(null)
      setLieferantError('')
      setEditData(null)
      setEditError(null)
    }
  }, [open])

  const handleLieferantChange = (value: string) => {
    setLieferantError('')
    if (value === NEU_ANLEGEN_VALUE) {
      // TODO: open "Neuer Lieferant" modal/form
      setLieferantId('')
      return
    }
    setLieferantId(value)
  }

  const handleManuellClick = () => {
    if (quelle === 'rechnung') {
      const supplier = lieferantId ? LIEFERANTEN.find((l) => l.id === lieferantId) : undefined
      setManuellContext({
        inventoryType: 'Invoices',
        supplierName: supplier?.name,
      })
    } else {
      setManuellContext({
        inventoryType: 'Orders',
        supplierName: lieferantId ? LIEFERANTEN.find((l) => l.id === lieferantId)?.name : undefined,
      })
    }
    setShowManuellSection(true)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-gray-200 bg-white p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#62A17C]/10">
              <Package className="size-5 text-[#62A17C]" />
            </div>
            <div>
              <SheetTitle className="text-xl font-semibold text-gray-900">
                Neuer Wareneingang
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-sm text-gray-500">
                Wareneingang erfassen und buchen
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {editInventoryId ? (
            editLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-[#62A17C]" />
              </div>
            ) : editError || !editData ? (
              <div className="text-sm text-red-500 py-4">{editError || 'Nicht gefunden.'}</div>
            ) : (
              <ManuellSection
                inventoryType={editData.inventory_type}
                supplierName={editData.supplier}
                lieferanten={LIEFERANTEN}
                onBack={() => onOpenChange(false)}
                onSuccess={() => {
                  onOpenChange(false)
                  onSuccess?.()
                }}
                initialData={editData}
                editId={editData.id}
              />
            )
          ) : showManuellSection && manuellContext ? (
            <ManuellSection
              inventoryType={manuellContext.inventoryType}
              supplierName={manuellContext.supplierName}
              lieferanten={LIEFERANTEN}
              onBack={() => {
                setShowManuellSection(false)
                setManuellContext(null)
              }}
              onSuccess={() => {
                onOpenChange(false)
                onSuccess?.()
              }}
            />
          ) : (
            <>
              {/* Quelle wählen */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Quelle wählen</Label>
                <div className="grid grid-cols-3 gap-2">
                  {QUELLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const isSelected = quelle === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setLieferantError('')
                          if (quelle === opt.value) {
                            setQuelle(null)
                            return
                          }
                          if (opt.value === 'manuell') {
                            handleManuellClick()
                          }
                          setQuelle(opt.value)
                        }}
                        className={cn(
                          'flex flex-col cursor-pointer items-center gap-2 rounded-lg border px-3 py-4 text-sm font-medium transition-colors',
                          isSelected
                            ? 'border-[#62A17C] bg-white text-gray-900 shadow-sm'
                            : 'border-gray-200 bg-gray-50/80 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="size-5 shrink-0" strokeWidth={1.5} />
                        <span>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Lieferant – immer sichtbar (common) */}
              <div className="mt-6 space-y-2">
                <Label htmlFor="lieferant" className="text-sm font-medium text-gray-700">
                  Lieferant <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={lieferantId || undefined}
                  onValueChange={handleLieferantChange}
                  required
                >
                  <SelectTrigger
                    id="lieferant"
                    className={cn('w-full', lieferantError && 'border-red-500')}
                  >
                    <SelectValue placeholder="Lieferant auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LIEFERANTEN.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="focus:bg-[#62A17C]/10 focus:text-[#62A17C]">
                        {l.name}
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem
                      value={NEU_ANLEGEN_VALUE}
                      className="text-[#62A17C] font-medium focus:bg-[#62A17C]/10"
                    >
                      + Neu anlegen
                    </SelectItem>
                  </SelectContent>
                </Select>
                {lieferantError && (
                  <p className="text-sm text-red-500">{lieferantError}</p>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
