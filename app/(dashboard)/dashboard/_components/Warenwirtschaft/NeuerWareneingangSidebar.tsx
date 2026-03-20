'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Package, FileText, Upload, Pencil, LucideIcon, Loader2, ChevronDown, Search, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import ManuellSection from './ManuellSection'
import NeuerLieferantSidebar from './NeuerLieferantSidebar'
import {
  getSingleInventory,
  getOnlyNamedata,
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

interface Lieferant {
  id: string
  name: string
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

  // Lieferant dropdown state
  const [lieferanten, setLieferanten] = useState<Lieferant[]>([])
  const [lieferantenLoading, setLieferantenLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // New supplier sidebar state
  const [neuerLieferantOpen, setNeuerLieferantOpen] = useState(false)

  // Fetch suppliers from API
  const fetchLieferanten = async () => {
    setLieferantenLoading(true)
    try {
      const res = await getOnlyNamedata(100, '')
      const list: Lieferant[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setLieferanten(list)
    } catch {
      // noop — fallback to empty list
    } finally {
      setLieferantenLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchLieferanten()
  }, [open])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
      setDropdownOpen(false)
      setSearch('')
      setEditData(null)
      setEditError(null)
    }
  }, [open])

  const selectedLieferant = lieferanten.find((l) => l.id === lieferantId)

  const filteredLieferanten = lieferanten.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectLieferant = (id: string) => {
    setLieferantId(id)
    setLieferantError('')
    setDropdownOpen(false)
    setSearch('')
  }

  const handleManuellClick = () => {
    const supplier = lieferantId ? lieferanten.find((l) => l.id === lieferantId) : undefined
    if (quelle === 'rechnung') {
      setManuellContext({ inventoryType: 'Invoices', supplierName: supplier?.name })
    } else {
      setManuellContext({ inventoryType: 'Orders', supplierName: supplier?.name })
    }
    setShowManuellSection(true)
  }

  // After new supplier created: add to list & auto-select
  const handleLieferantCreated = (supplier: { id: string; name: string }) => {
    setLieferanten((prev) => {
      const exists = prev.some((l) => l.id === supplier.id)
      return exists ? prev : [...prev, supplier]
    })
    setLieferantId(supplier.id)
    setLieferantError('')
  }

  return (
    <>
      {/* New Lieferant sidebar — rendered outside the main sheet so z-index stacks properly */}
      <NeuerLieferantSidebar
        open={neuerLieferantOpen}
        onOpenChange={setNeuerLieferantOpen}
        onCreated={handleLieferantCreated}
      />

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
                  lieferanten={lieferanten}
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
                lieferanten={lieferanten}
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

                {/* Lieferant – custom dropdown with search + "Neu anlegen" */}
                <div className="mt-6 space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Lieferant <span className="text-red-500">*</span>
                  </Label>

                  <div ref={dropdownRef} className="relative">
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen((v) => !v); setSearch('') }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none',
                        lieferantError ? 'border-red-500' : 'border-gray-200',
                        dropdownOpen && 'ring-2 ring-[#62A17C]/30 border-[#62A17C]'
                      )}
                    >
                      <span className={selectedLieferant ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedLieferant ? selectedLieferant.name : 'Lieferant auswählen...'}
                      </span>
                      <ChevronDown
                        className={cn('h-4 w-4 text-gray-500 transition-transform', dropdownOpen && 'rotate-180')}
                      />
                    </button>

                    {/* Dropdown panel */}
                    {dropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                        {/* Search */}
                        <div className="border-b border-gray-100 px-3 py-2 flex items-center gap-2">
                          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <Input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Suchen..."
                            className="h-7 border-0 p-0 text-sm shadow-none focus-visible:ring-0 bg-transparent"
                          />
                        </div>

                        {/* Neu anlegen */}
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false)
                            setSearch('')
                            setNeuerLieferantOpen(true)
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-sm font-medium text-[#62A17C] hover:bg-[#62A17C]/5 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Neuen Lieferanten anlegen
                        </button>

                        {/* List */}
                        <div className="max-h-52 overflow-y-auto py-1">
                          {lieferantenLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                          ) : filteredLieferanten.length === 0 ? (
                            <p className="px-3 py-3 text-sm text-gray-400 text-center">
                              {search ? 'Keine Ergebnisse' : 'Keine Lieferanten vorhanden'}
                            </p>
                          ) : (
                            filteredLieferanten.map((l) => (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => handleSelectLieferant(l.id)}
                                className={cn(
                                  'flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50',
                                  lieferantId === l.id && 'bg-[#62A17C]/5 text-[#62A17C] font-medium'
                                )}
                              >
                                <span>{l.name}</span>
                                {lieferantId === l.id && <Check className="h-4 w-4 text-[#62A17C]" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {lieferantError && (
                    <p className="text-sm text-red-500">{lieferantError}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
