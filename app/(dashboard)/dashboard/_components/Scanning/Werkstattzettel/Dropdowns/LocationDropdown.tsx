import React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check } from 'lucide-react'

interface Location {
  id: string
  address: string
  description: string
  isPrimary?: boolean
}

interface LocationDropdownProps {
  value: Location | null
  locations: Location[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onChange: (location: Location) => void
  onSelect: (location: Location) => void
}

export default function LocationDropdown({
  value,
  locations,
  isOpen,
  onOpenChange,
  onChange,
  onSelect,
}: LocationDropdownProps) {
  // Helper function to check if a location matches the current value
  const isLocationSelected = (location: Location) => {
    if (!value) return false
    return value.id === location.id
  }

  // Helper function to get display value for a location
  const getLocationDisplayValue = (location: Location) => {
    if (location.description && location.address) {
      return `${location.description} - ${location.address}`
    }
    return location.description || location.address
  }

  const handleSelect = (location: Location) => {
    onSelect(location)
    onChange(location)
    onOpenChange(false)
  }

  // Get display value for the selected location
  const getSelectedDisplayValue = () => {
    if (!value) return 'Standort wählen'
    return getLocationDisplayValue(value)
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between font-normal h-10"
          onClick={() => onOpenChange(!isOpen)}
        >
          <span className="truncate">
            {getSelectedDisplayValue()}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="py-1">
          {locations && locations.length > 0 ? (
            locations.map((location: Location) => {
              const isSelected = isLocationSelected(location)
              const displayValue = getLocationDisplayValue(location)
              
              return (
                <div
                  key={location.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(location)}
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    {location.description && (
                      <span
                        className={`text-sm font-medium truncate ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {location.description}
                      </span>
                    )}
                    {location.address && (
                      <span
                        className={`text-xs truncate ${
                          isSelected ? 'text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        {location.address}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 ml-2 shrink-0" />
                  )}
                </div>
              )
            })
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              Keine verfügbaren Standorte gefunden
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

