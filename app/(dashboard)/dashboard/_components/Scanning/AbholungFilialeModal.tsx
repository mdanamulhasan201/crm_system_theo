'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ChevronDown, Check, X } from 'lucide-react'

export type FilialeLocation = {
  id: string
  address: string
  description: string
  isPrimary?: boolean
}

interface AbholungFilialeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locations: FilialeLocation[]
  locationsLoading: boolean
  value: FilialeLocation | null
  onConfirm: (location: FilialeLocation | null) => void
}

export default function AbholungFilialeModal({
  open,
  onOpenChange,
  locations,
  locationsLoading,
  value,
  onConfirm,
}: AbholungFilialeModalProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [pendingLocation, setPendingLocation] = useState<FilialeLocation | null>(null)

  useEffect(() => {
    if (open) {
      setPendingLocation(value)
    }
  }, [open, value])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setPopoverOpen(false)
      setSearchText('')
    }
  }

  const handleSchliessen = () => {
    if (pendingLocation) onConfirm(pendingLocation)
    onOpenChange(false)
  }

  const primaryLocation = locations.find((l) => l.isPrimary) || locations[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Abholung bei anderer Filiale
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 overflow-hidden">
          {locationsLoading ? (
            <p className="text-sm text-gray-500 py-4 text-center">Lade Standorte...</p>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Abholung bei anderer Filiale*
                </label>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full cursor-pointer justify-between font-normal h-10 bg-white border-gray-300"
                    >
                      <span
                        className={`truncate flex-1 text-left ${
                          pendingLocation ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {pendingLocation
                          ? [pendingLocation.description, pendingLocation.address]
                              .filter(Boolean)
                              .join(' - ') || pendingLocation.address || '-'
                          : 'Standort wählen'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {pendingLocation ? (
                          <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (primaryLocation) setPendingLocation(primaryLocation)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                if (primaryLocation) setPendingLocation(primaryLocation)
                              }
                            }}
                            className="rounded p-0.5 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-200"
                            aria-label="Zurück zur Standard-Abholung"
                          >
                            <X className="h-4 w-4" />
                          </span>
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="p-2">
                      <Input
                        placeholder="Standort suchen..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {(() => {
                        const q = searchText.trim().toLowerCase()
                        const filtered = q
                          ? locations.filter((loc) => {
                              const text = [loc.description, loc.address]
                                .filter(Boolean)
                                .join(' ')
                                .toLowerCase()
                              return text.includes(q)
                            })
                          : locations
                        return filtered.length > 0 ? (
                          <div className="py-1">
                            {filtered.map((loc) => {
                              const isSelected = pendingLocation?.id === loc.id
                              return (
                                <div
                                  key={loc.id}
                                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${
                                    isSelected
                                      ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                      : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => {
                                    setPendingLocation(loc)
                                    setPopoverOpen(false)
                                  }}
                                >
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span
                                      className={`text-sm font-medium truncate ${
                                        isSelected ? 'text-blue-900' : 'text-gray-900'
                                      }`}
                                    >
                                      {loc.description || loc.address}
                                    </span>
                                    {loc.description && loc.address && (
                                      <span
                                        className={`text-xs truncate ${
                                          isSelected ? 'text-blue-600' : 'text-gray-500'
                                        }`}
                                      >
                                        {loc.address}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <Check className="h-4 w-4 text-blue-600 ml-2 shrink-0" />}
                                </div>
                              )
                            })}
                            <button
                              type="button"
                              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 border-t border-gray-100"
                              onClick={() => {
                                if (primaryLocation) setPendingLocation(primaryLocation)
                                setPopoverOpen(false)
                              }}
                            >
                              Zurück zur Standard-Abholung
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            Keine Standorte gefunden
                          </div>
                        )
                      })()}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={handleSchliessen}>
                  Schließen
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
