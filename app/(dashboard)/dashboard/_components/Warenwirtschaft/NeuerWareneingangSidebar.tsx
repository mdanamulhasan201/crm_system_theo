'use client'

import React, { useState, useEffect } from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Package, FileText, Upload, Pencil, LucideIcon, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ManuellSection from './ManuellSection'
import LieferantSelect, { type LieferantOption } from './LieferantSelect'
import {
  getSingleInventory,
  type InventoryType,
  type InventoryItem,
} from '@/apis/warenwirtschaftApis'

type Quelle = 'rechnung' | 'lieferschein' | 'manuell'

const QUELLE_OPTIONS: { value: Quelle; label: string; icon: LucideIcon }[] = [
  { value: 'rechnung', label: 'Rechnung', icon: FileText },
  { value: 'lieferschein', label: 'Lieferschein', icon: Upload },
  { value: 'manuell', label: 'Manuell', icon: Pencil },
]

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
  const [lieferantName, setLieferantName] = useState<string>('')
  const [showManuellSection, setShowManuellSection] = useState(false)
  const [manuellContext, setManuellContext] = useState<ManuellContext | null>(null)
  const [lieferantError, setLieferantError] = useState<string>('')
  const [editData, setEditData] = useState<InventoryItem | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Edit: load single inventory when editInventoryId is set
  useEffect(() => {
    if (!open || !editInventoryId) {
      setEditData(null)
      setEditError(null)
      return
    }
    setEditLoading(true)
    setEditError(null)
    getSingleInventory(editInventoryId)
      .then((res) => setEditData(res.data))
      .catch(() => setEditError('Fehler beim Laden.'))
      .finally(() => setEditLoading(false))
  }, [open, editInventoryId])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setShowManuellSection(false)
      setManuellContext(null)
      setQuelle(null)
      setLieferantError('')
      setLieferantId('')
      setLieferantName('')
      setEditData(null)
      setEditError(null)
    }
  }, [open])

  const handleManuellClick = () => {
    setManuellContext({
      inventoryType: quelle === 'rechnung' ? 'Invoices' : 'Orders',
      supplierName: lieferantName || undefined,
    })
    setShowManuellSection(true)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay className="bg-black/40" />
        <SheetPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-gray-200 bg-white p-0 shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-300 data-[state=open]:duration-500 sm:max-w-2xl"
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
                onBack={() => onOpenChange(false)}
                onSuccess={() => { onOpenChange(false); onSuccess?.() }}
                initialData={editData}
                editId={editData.id}
              />
            )
          ) : showManuellSection && manuellContext ? (
            <ManuellSection
              inventoryType={manuellContext.inventoryType}
              supplierName={manuellContext.supplierName}
              onBack={() => { setShowManuellSection(false); setManuellContext(null) }}
              onSuccess={() => { onOpenChange(false); onSuccess?.() }}
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
                          if (quelle === opt.value) { setQuelle(null); return }
                          if (opt.value === 'manuell') handleManuellClick()
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

              {/* Lieferant */}
              <div className="mt-6 space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Lieferant <span className="text-red-500">*</span>
                </Label>
                <LieferantSelect
                  value={lieferantId}
                  onChange={(id, name) => {
                    setLieferantId(id)
                    setLieferantName(name ?? '')
                    setLieferantError('')
                  }}
                  onLieferantCreated={(s) => {
                    setLieferantId(s.id)
                    setLieferantName(s.name)
                    setLieferantError('')
                  }}
                  error={lieferantError}
                />
                {lieferantError && (
                  <p className="text-sm text-red-500">{lieferantError}</p>
                )}
              </div>
            </>
          )}
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
