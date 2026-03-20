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
import { Button } from '@/components/ui/button'
import { Package, FileText, Upload, Pencil, LucideIcon, Loader2, X, ArrowRight, CheckCircle2 } from 'lucide-react'
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
  supplierId?: string
  supplierName?: string
  deliveryNoteFile?: File
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
  const [deliveryNoteFile, setDeliveryNoteFile] = useState<File | null>(null)
  const [showManuellSection, setShowManuellSection] = useState(false)
  const [manuellContext, setManuellContext] = useState<ManuellContext | null>(null)
  const [lieferantError, setLieferantError] = useState<string>('')
  const [editData, setEditData] = useState<InventoryItem | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

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
      setDeliveryNoteFile(null)
      setEditData(null)
      setEditError(null)
    }
  }, [open])

  const handleProceed = () => {
    setManuellContext({
      inventoryType: quelle === 'rechnung' ? 'Invoices' : 'Orders',
      supplierId: lieferantId || undefined,
      supplierName: lieferantName || undefined,
      deliveryNoteFile: deliveryNoteFile ?? undefined,
    })
    setShowManuellSection(true)
  }

  const handleQuelleClick = (value: Quelle) => {
    setLieferantError('')
    if (value === 'manuell') {
      // Manuell = proceed with current state
      handleProceed()
      return
    }
    // Toggle selection for Rechnung / Lieferschein
    setQuelle((prev) => (prev === value ? null : value))
    // For Lieferschein: also open file picker
    if (value === 'lieferschein') {
      fileInputRef.current?.click()
    }
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
              supplierId={manuellContext.supplierId}
              supplierName={manuellContext.supplierName}
              deliveryNoteFile={manuellContext.deliveryNoteFile}
              onBack={() => { setShowManuellSection(false); setManuellContext(null) }}
              onSuccess={() => { onOpenChange(false); onSuccess?.() }}
            />
          ) : (
            <>
              {/* Hidden file input for Lieferschein */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  setDeliveryNoteFile(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />

              {/* Quelle wählen */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Quelle wählen</Label>
                <div className="grid grid-cols-3 gap-2">
                  {QUELLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const isSelected = quelle === opt.value
                    const hasFile = opt.value === 'lieferschein' && deliveryNoteFile
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleQuelleClick(opt.value)}
                        className={cn(
                          'relative flex flex-col cursor-pointer items-center gap-2 rounded-lg border px-3 py-4 text-sm font-medium transition-colors',
                          isSelected
                            ? 'border-[#62A17C] bg-white text-gray-900 shadow-sm'
                            : 'border-gray-200 bg-gray-50/80 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="size-5 shrink-0" strokeWidth={1.5} />
                        <span>{opt.label}</span>
                        {hasFile && (
                          <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-[#62A17C]" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Selected file row — Lieferschein only */}
                {quelle === 'lieferschein' && deliveryNoteFile && (
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[#1a7fc1]" />
                    <span className="truncate flex-1">{deliveryNoteFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setDeliveryNoteFile(null)}
                      className="shrink-0 text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Lieferant — always visible */}
              <div className="mt-6 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Lieferant</Label>
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
