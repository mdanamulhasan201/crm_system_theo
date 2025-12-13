'use client'
import React, { useState, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ChevronDownIcon, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const diagnosisOptions = [
    { value: 'PLANTARFASZIITIS', label: 'Plantarfasziitis' },
    { value: 'FERSENSPORN', label: 'Fersensporn' },
    { value: 'SPREIZFUSS', label: 'Spreizfuß' },
    { value: 'SENKFUSS', label: 'Senkfuß' },
    { value: 'PLATTFUSS', label: 'Plattfuß' },
    { value: 'HOHLFUSS', label: 'Hohlfuß' },
    { value: 'KNICKFUSS', label: 'Knickfuß' },
    { value: 'KNICK_SENKFUSS', label: 'Knick-Senkfuß' },
    { value: 'HALLUX_VALGUS', label: 'Hallux valgus' },
    { value: 'HALLUX_RIGIDUS', label: 'Hallux rigidus' },
    { value: 'HAMMERZEHEN_KRALLENZEHEN', label: 'Hammerzehen / Krallenzehen' },
    { value: 'MORTON_NEUROM', label: 'Morton-Neurom' },
    { value: 'FUSSARTHROSE', label: 'Fußarthrose' },
    { value: 'STRESSFRAKTUREN_IM_FUSS', label: 'Stressfrakturen im Fußbereich' },
    { value: 'DIABETISCHES_FUSSSYNDROM', label: 'Diabetisches Fußsyndrom' },
]

type DiagnosisSelectorProps = {
    value: string[]
    onChange: (value: string[]) => void
}

export default function DiagnosisSelector({ value, onChange }: DiagnosisSelectorProps) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return diagnosisOptions
        const query = searchQuery.toLowerCase()
        return diagnosisOptions.filter(option =>
            option.label.toLowerCase().includes(query)
        )
    }, [searchQuery])

    const handleToggle = (diagnosisValue: string) => {
        const newValue = value.includes(diagnosisValue)
            ? value.filter(v => v !== diagnosisValue)
            : [...value, diagnosisValue]
        onChange(newValue)
    }

    const handleRemove = (diagnosisValue: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(value.filter(v => v !== diagnosisValue))
    }

    const getSelectedLabels = () => {
        return value
            .map(v => diagnosisOptions.find(opt => opt.value === v)?.label)
            .filter(Boolean) as string[]
    }

    const selectedLabels = getSelectedLabels()

    return (
        <div className="w-full">
            <label className="font-bold mb-2 block text-sm text-gray-700">Diagnose (Optional)</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        className={cn(
                            "w-full justify-between border min-h-[42px] h-auto py-2 px-3 rounded-md  bg-white text-left font-normal hover:bg-gray-50 focus:outline-none focus:ring-0 shadow-none transition-all",
                            !value.length && "text-gray-500"
                        )}
                    >
                        <div className="flex flex-wrap gap-1.5 flex-1 min-h-[20px] items-center ">
                            {selectedLabels.length > 0 ? (
                                selectedLabels.map((label) => {
                                    const diagnosisValue = diagnosisOptions.find(opt => opt.label === label)?.value || ''
                                    return (
                                        <span
                                            key={diagnosisValue}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                                        >
                                            <span className="max-w-[200px] truncate">{label}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemove(diagnosisValue, e)}
                                                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors flex-shrink-0"
                                                aria-label={`Remove ${label}`}
                                            >
                                                <X className="h-3.5 w-3.5 text-blue-600" />
                                            </button>
                                        </span>
                                    )
                                })
                            ) : (
                                <span className="text-gray-500 text-sm">Diagnose auswählen</span>
                            )}
                        </div>
                        <ChevronDownIcon className={cn(
                            "ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                            open && "transform rotate-180"
                        )} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] min-w-[450px] p-0  border "
                    align="start"
                    sideOffset={4}
                    onInteractOutside={(e) => {
                        // Prevent closing when interacting with scrollbar or scrolling
                        const target = e.target as HTMLElement
                        if (
                            target.closest('[data-radix-scroll-area-viewport]') ||
                            target.closest('[data-radix-scroll-area-scrollbar]') ||
                            target.closest('[data-slot="scroll-area"]')
                        ) {
                            e.preventDefault()
                        }
                    }}
                >
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Diagnose suchen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-sm border-gray-300 focus:ring-0 focus:border-gray-300"
                            />
                        </div>
                    </div>
                    <div
                        className="h-[280px] overflow-y-auto overflow-x-hidden"
                        onWheel={(e) => {
                            e.stopPropagation()
                        }}
                    >
                        <div className="py-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                                            value.includes(option.value)
                                                ? "bg-blue-50 hover:bg-blue-100"
                                                : "hover:bg-gray-50"
                                        )}
                                    >
                                        <Checkbox
                                            checked={value.includes(option.value)}
                                            onChange={() => handleToggle(option.value)}
                                            className="flex-shrink-0"
                                        />
                                        <span className={cn(
                                            "text-sm flex-1 select-none",
                                            value.includes(option.value) && "font-medium text-blue-900"
                                        )}>
                                            {option.label}
                                        </span>
                                        {value.includes(option.value) && (
                                            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                                        )}
                                    </label>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    Keine Diagnose gefunden
                                </div>
                            )}
                        </div>
                    </div>
                    {value.length > 0 && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                                onClick={() => {
                                    onChange([])
                                    setSearchQuery('')
                                }}
                            >
                                Alle entfernen ({value.length})
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
            {value.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                    {value.length} {value.length === 1 ? 'Diagnose' : 'Diagnosen'} ausgewählt
                </div>
            )}
        </div>
    )
}

