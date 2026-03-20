'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronDown, Search, Plus, Check, Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import NeuerLieferantSidebar, { type LieferantFormData } from './NeuerLieferantSidebar'
import { getOnlyNamedata, deleteInventorySupplier, getSingleInventorySupplier } from '@/apis/warenwirtschaftApis'
import toast from 'react-hot-toast'

export interface LieferantOption {
  id: string
  name: string
}

const PAGE_SIZE = 20

interface LieferantSelectProps {
  value: string
  onChange: (id: string, name?: string) => void
  onLieferantCreated?: (supplier: LieferantOption) => void
  error?: string
  placeholder?: string
}

export default function LieferantSelect({
  value,
  onChange,
  onLieferantCreated,
  error,
  placeholder = 'Lieferant auswählen...',
}: LieferantSelectProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Sidebar: null = closed, {} = create mode, { id, ... } = edit mode
  const [sidebarData, setSidebarData] = useState<LieferantFormData | null>(null)
  const sidebarOpen = sidebarData !== null

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<LieferantOption | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Paginated data
  const [lieferanten, setLieferanten] = useState<LieferantOption[]>([])
  const [cursor, setCursor] = useState<string>('')
  const [hasMore, setHasMore] = useState(true)
  const [fetchingInitial, setFetchingInitial] = useState(false)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [fetched, setFetched] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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

  const fetchPage = useCallback(async (nextCursor: string, append: boolean) => {
    if (append) setFetchingMore(true)
    else setFetchingInitial(true)
    try {
      const res = await getOnlyNamedata(PAGE_SIZE, nextCursor)
      const items: LieferantOption[] = Array.isArray(res?.data) ? res.data : []
      const more: boolean = res?.hasMore ?? false
      setLieferanten((prev) => append ? [...prev, ...items] : items)
      setCursor(items.length > 0 ? items[items.length - 1].id : nextCursor)
      setHasMore(more)
      setFetched(true)
    } catch {
      // noop
    } finally {
      setFetchingInitial(false)
      setFetchingMore(false)
    }
  }, [])

  useEffect(() => {
    if (dropdownOpen && !fetched) fetchPage('', false)
  }, [dropdownOpen, fetched, fetchPage])

  const handleListScroll = () => {
    const el = listRef.current
    if (!el || fetchingMore || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) fetchPage(cursor, true)
  }

  const selectedLieferant = lieferanten.find((l) => l.id === value)

  const filteredLieferanten = search.trim()
    ? lieferanten.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    : lieferanten

  const handleSelect = (l: LieferantOption) => {
    onChange(l.id, l.name)
    setDropdownOpen(false)
    setSearch('')
  }

  const handleCreated = (supplier: LieferantOption) => {
    setLieferanten((prev) => prev.some((l) => l.id === supplier.id) ? prev : [supplier, ...prev])
    onChange(supplier.id, supplier.name)
    onLieferantCreated?.(supplier)
  }

  const handleUpdated = (supplier: LieferantOption) => {
    setLieferanten((prev) => prev.map((l) => l.id === supplier.id ? { ...l, name: supplier.name } : l))
    if (value === supplier.id) onChange(supplier.id, supplier.name)
  }

  // Open delete confirm modal
  const handleDeleteClick = (e: React.MouseEvent, l: LieferantOption) => {
    e.stopPropagation()
    setDropdownOpen(false)
    setSearch('')
    setDeleteTarget(l)
  }

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteInventorySupplier(deleteTarget.id)
      setLieferanten((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      if (value === deleteTarget.id) onChange('', '')
      toast.success(`Lieferant "${deleteTarget.name}" wurde gelöscht.`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = async (e: React.MouseEvent, l: LieferantOption) => {
    e.stopPropagation()
    setDropdownOpen(false)
    setSearch('')
    try {
      const res = await getSingleInventorySupplier(l.id)
      const detail = res?.data ?? res
      setSidebarData({
        id: l.id,
        name: detail?.name ?? l.name,
        contactName: detail?.contactName ?? '',
        email: detail?.email ?? '',
        phone: detail?.phone ?? '',
        street: detail?.street ?? '',
        postalCode: detail?.postalCode ?? '',
        city: detail?.city ?? '',
        country: detail?.country ?? 'Deutschland',
        vatIdNumber: detail?.vatIdNumber ?? '',
        paymentTargetDays: detail?.paymentTargetDays ?? 14,
        notes: detail?.notes ?? '',
      })
    } catch {
      setSidebarData({ id: l.id, name: l.name })
    }
  }

  return (
    <>
      {/* Edit / Create sidebar */}
      <NeuerLieferantSidebar
        open={sidebarOpen}
        onOpenChange={(open) => { if (!open) setSidebarData(null) }}
        editData={sidebarData?.id ? sidebarData : null}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Lieferant löschen
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-500 pl-[52px]">
              Soll der Lieferant{' '}
              <span className="font-semibold text-gray-800">„{deleteTarget?.name}"</span>{' '}
              wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
              className="flex-1 cursor-pointer"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {isDeleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Löschen...</>
              ) : (
                'Ja, löschen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => { setDropdownOpen((v) => !v); setSearch('') }}
          className={cn(
            'flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none',
            error ? 'border-red-500' : 'border-gray-200',
            dropdownOpen && 'ring-2 ring-[#62A17C]/30 border-[#62A17C]'
          )}
        >
          <span className={selectedLieferant ? 'text-gray-900' : 'text-gray-400'}>
            {selectedLieferant ? selectedLieferant.name : placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', dropdownOpen && 'rotate-180')} />
        </button>

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
              onClick={() => { setDropdownOpen(false); setSearch(''); setSidebarData({}) }}
              className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-sm font-medium text-[#62A17C] hover:bg-[#62A17C]/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Neuen Lieferanten anlegen
            </button>

            {/* List */}
            <div ref={listRef} onScroll={handleListScroll} className="max-h-52 overflow-y-auto py-1">
              {fetchingInitial ? (
                <div className="flex items-center justify-center py-5">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : filteredLieferanten.length === 0 ? (
                <p className="px-3 py-3 text-sm text-gray-400 text-center">
                  {search ? 'Keine Ergebnisse' : 'Keine Lieferanten vorhanden'}
                </p>
              ) : (
                <>
                  {filteredLieferanten.map((l) => (
                    <div
                      key={l.id}
                      className={cn(
                        'group flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-gray-50',
                        value === l.id && 'bg-[#62A17C]/5'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(l)}
                        className={cn(
                          'flex-1 text-left cursor-pointer truncate',
                          value === l.id ? 'text-[#62A17C] font-medium' : 'text-gray-800'
                        )}
                      >
                        {l.name}
                      </button>

                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        {value === l.id && <Check className="h-4 w-4 text-[#62A17C]" />}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={(e) => handleEdit(e, l)}
                          title="Bearbeiten"
                          className="p-1 rounded cursor-pointer text-gray-400 hover:text-[#62A17C] hover:bg-[#62A17C]/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, l)}
                          title="Löschen"
                          className="p-1 rounded cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {fetchingMore && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}

                  {!hasMore && !search && lieferanten.length > PAGE_SIZE && (
                    <p className="px-3 py-2 text-center text-xs text-gray-300">
                      Alle {lieferanten.length} Lieferanten geladen
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
