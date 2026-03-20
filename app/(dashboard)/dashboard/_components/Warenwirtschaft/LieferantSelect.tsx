'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { ChevronDown, Search, Plus, Check, Loader2, Pencil, Trash2 } from 'lucide-react'
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
  /** id and name are both passed so callers don't need a lookup */
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

  // Sidebar state — null = closed, object with id = edit, object without id = create
  const [sidebarData, setSidebarData] = useState<LieferantFormData | null>(null)
  const sidebarOpen = sidebarData !== null

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  // Fetch first page on first open
  useEffect(() => {
    if (dropdownOpen && !fetched) {
      fetchPage('', false)
    }
  }, [dropdownOpen, fetched, fetchPage])

  // Infinite scroll
  const handleListScroll = () => {
    const el = listRef.current
    if (!el || fetchingMore || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      fetchPage(cursor, true)
    }
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

  // Create
  const handleCreated = (supplier: LieferantOption) => {
    setLieferanten((prev) => prev.some((l) => l.id === supplier.id) ? prev : [supplier, ...prev])
    onChange(supplier.id, supplier.name)
    onLieferantCreated?.(supplier)
  }

  // Update
  const handleUpdated = (supplier: LieferantOption) => {
    setLieferanten((prev) => prev.map((l) => l.id === supplier.id ? { ...l, name: supplier.name } : l))
    // If the updated supplier was selected, update the displayed name
    if (value === supplier.id) onChange(supplier.id, supplier.name)
  }

  // Delete
  const handleDelete = async (e: React.MouseEvent, l: LieferantOption) => {
    e.stopPropagation()
    if (!confirm(`Lieferant "${l.name}" wirklich löschen?`)) return
    setDeletingId(l.id)
    try {
      await deleteInventorySupplier(l.id)
      setLieferanten((prev) => prev.filter((item) => item.id !== l.id))
      // If deleted item was selected, clear selection
      if (value === l.id) onChange('', '')
      toast.success(`Lieferant "${l.name}" wurde gelöscht.`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Fehler beim Löschen')
    } finally {
      setDeletingId(null)
    }
  }

  // Edit — fetch full supplier details then open sidebar pre-filled
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
      // Fallback: open with just name
      setSidebarData({ id: l.id, name: l.name })
    }
  }

  return (
    <>
      <NeuerLieferantSidebar
        open={sidebarOpen}
        onOpenChange={(open) => { if (!open) setSidebarData(null) }}
        editData={sidebarData?.id ? sidebarData : null}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      <div ref={dropdownRef} className="relative">
        {/* Trigger */}
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
                setSidebarData({})
              }}
              className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-sm font-medium text-[#62A17C] hover:bg-[#62A17C]/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Neuen Lieferanten anlegen
            </button>

            {/* List with infinite scroll */}
            <div
              ref={listRef}
              onScroll={handleListScroll}
              className="max-h-52 overflow-y-auto py-1"
            >
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
                      {/* Name — clicking selects */}
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

                      {/* Right side: check + action buttons */}
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        {value === l.id && (
                          <Check className="h-4 w-4 text-[#62A17C]" />
                        )}

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={(e) => handleEdit(e, l)}
                          title="Bearbeiten"
                          className="p-1 rounded cursor-pointer text-gray-400 hover:text-[#62A17C] hover:bg-[#62A17C]/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, l)}
                          title="Löschen"
                          disabled={deletingId === l.id}
                          className="p-1 rounded cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                        >
                          {deletingId === l.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Load more spinner */}
                  {fetchingMore && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}

                  {/* End of list */}
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
