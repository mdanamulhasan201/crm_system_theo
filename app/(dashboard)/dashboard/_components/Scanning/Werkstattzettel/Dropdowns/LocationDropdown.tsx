import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check } from 'lucide-react'

interface LocationDropdownProps {
  value: string
  locations: string[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: string) => void
  onSelect: (location: string) => void
}

export default function LocationDropdown({
  value,
  locations,
  isOpen,
  onOpenChange,
  onChange,
  onSelect,
}: LocationDropdownProps) {
  const handleSelect = (location: string) => {
    onSelect(location)
    onOpenChange(false)
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
            {value || 'Standort wählen'}
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
            locations.map((location: string, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${
                  value === location
                    ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSelect(location)}
              >
                <span
                  className={`text-sm font-medium ${
                    value === location ? 'text-blue-900' : 'text-gray-900'
                  }`}
                >
                  {location}
                </span>
                {value === location && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))
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

