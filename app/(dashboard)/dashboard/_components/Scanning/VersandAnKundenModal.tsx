'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getLocation } from '@/apis/locationsApis'

interface VersandAnKundenModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Current address if already set (e.g. "Versand an Kunden - Musterstraße 1, Berlin") - we only pass the address part for display */
  value: string | null
  onConfirm: (address: string | null) => void
}

export default function VersandAnKundenModal({
  open,
  onOpenChange,
  value,
  onConfirm,
}: VersandAnKundenModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingAddress, setPendingAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setPendingAddress(value)
      setSearchQuery('')
      setSuggestions([])
      setError(null)
    }
  }, [open, value])

  // getLocation API returns { success, message, data: string[] } – addresses only, no description
  // Debounced search (same as WohnortInput)
  useEffect(() => {
    const query = searchQuery.trim()
    if (!query || query.length < 2) {
      setSuggestions([])
      setError(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getLocation(query)
        if (response?.success && Array.isArray(response.data)) {
          setSuggestions(response.data)
        } else {
          setSuggestions([])
        }
      } catch (err) {
        console.warn('Versand-Adresssuche fehlgeschlagen', err)
        setSuggestions([])
        setError('Adressen konnten nicht geladen werden.')
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSchliessen = () => {
    onConfirm(pendingAddress)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Versand an Kunden
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="space-y-1.5" ref={containerRef}>
            <label className="text-sm font-medium text-gray-700">
              Adresse für Versand*
            </label>
            <div className="relative">
              <Input
                placeholder="Adresse suchen (min. 2 Zeichen)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setSuggestions(suggestions)}
                className="w-full pr-8"
                autoComplete="off"
              />
              {loading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500" />
              )}
            </div>

            {pendingAddress && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-800 truncate flex-1 min-w-0">
                  Ausgewählt: {pendingAddress}
                </span>
                <button
                  type="button"
                  onClick={() => setPendingAddress(null)}
                  className="shrink-0 p-0.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  aria-label="Auswahl löschen"
                >
                  <span className="text-xs font-medium">Löschen</span>
                </button>
              </div>
            )}

            {searchQuery.trim().length >= 2 && (
              <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                {loading ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    Adressen werden geladen...
                  </div>
                ) : error ? (
                  <div className="px-3 py-2 text-sm text-red-500">{error}</div>
                ) : suggestions.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    Keine Adressen gefunden.
                  </div>
                ) : (
                  <div className="py-1">
                    {suggestions.map((address, index) => (
                      <button
                        key={`${index}-${address}`}
                        type="button"
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => {
                          setPendingAddress(address)
                          setSearchQuery('')
                          setSuggestions([])
                        }}
                      >
                        <span className="font-medium text-gray-900">{address}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={handleSchliessen}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
