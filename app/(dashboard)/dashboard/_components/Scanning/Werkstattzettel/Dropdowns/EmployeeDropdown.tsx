import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check } from 'lucide-react'

interface Employee {
  id: string
  employeeName: string
  email?: string
}

interface EmployeeDropdownProps {
  value: string
  searchText: string
  suggestions: Employee[]
  loading: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSearchChange: (value: string) => void
  onSelect: (employeeName: string) => void
}

export default function EmployeeDropdown({
  value,
  searchText,
  suggestions,
  loading,
  isOpen,
  onOpenChange,
  onSearchChange,
  onSelect,
}: EmployeeDropdownProps) {
  const handleSelect = (employeeName: string) => {
    onSelect(employeeName)
    onOpenChange(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {value || 'Mitarbeiter auswählen...'}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="p-2">
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Lade Mitarbeiter...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((employee) => (
                <div
                  key={employee.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${
                    value === employee.employeeName
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(employee.employeeName)}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium truncate ${
                        value === employee.employeeName
                          ? 'text-blue-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {employee.employeeName}
                    </span>
                    {employee.email && (
                      <span
                        className={`text-xs truncate ${
                          value === employee.employeeName
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {employee.email}
                      </span>
                    )}
                  </div>
                  {value === employee.employeeName && (
                    <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Keine Mitarbeiter gefunden
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

