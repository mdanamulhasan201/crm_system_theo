'use client'
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ChevronDownIcon, X, Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAllDiagnoses, createDiagnosis } from '@/apis/versorgungApis'
import toast from 'react-hot-toast'

type DiagnosisOption = {
    id: string
    name: string
}

type DiagnosisSelectorProps = {
    value: string[]
    onChange: (value: string[]) => void
}

export default function DiagnosisSelector({ value, onChange }: DiagnosisSelectorProps) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
    const [diagnosisOptions, setDiagnosisOptions] = useState<DiagnosisOption[]>([])
    const [isLoadingDiagnoses, setIsLoadingDiagnoses] = useState(false)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [newDiagnosisName, setNewDiagnosisName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch diagnoses from API
    const fetchDiagnoses = useCallback(async (search: string = '') => {
        try {
            setIsLoadingDiagnoses(true)
            const response = await getAllDiagnoses(search)
            // Handle different response structures
            const diagnoses = response?.data || response || []
            setDiagnosisOptions(diagnoses)
        } catch (error: any) {
            console.error('Failed to fetch diagnoses:', error)
            toast.error('Failed to load diagnoses')
        } finally {
            setIsLoadingDiagnoses(false)
        }
    }, [])

    // Debounce search query - update debouncedSearchQuery after 500ms of no typing
    useEffect(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 500) // 500ms debounce delay

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [searchQuery])

    // Fetch diagnoses when popover opens or debounced search changes
    useEffect(() => {
        if (open) {
            fetchDiagnoses(debouncedSearchQuery)
        }
    }, [open, debouncedSearchQuery, fetchDiagnoses])

    // Reset search when popover closes
    useEffect(() => {
        if (!open) {
            setSearchQuery('')
            setDebouncedSearchQuery('')
        }
    }, [open])

    // Use API results directly since API handles search filtering
    const filteredOptions = useMemo(() => {
        return diagnosisOptions
    }, [diagnosisOptions])

    // Handle creating new diagnosis
    const handleCreateDiagnosis = async () => {
        if (!newDiagnosisName.trim()) {
            toast.error('Please enter a diagnosis name')
            return
        }

        try {
            setIsCreating(true)
            await createDiagnosis({ name: newDiagnosisName.trim() })
            toast.success('Diagnosis created successfully')
            setCreateModalOpen(false)
            setNewDiagnosisName('')
            // Refresh the diagnoses list
            await fetchDiagnoses(debouncedSearchQuery)
        } catch (error: any) {
            console.error('Failed to create diagnosis:', error)
            toast.error(error.response?.data?.message || 'Failed to create diagnosis')
        } finally {
            setIsCreating(false)
        }
    }

    const handleToggle = (diagnosisId: string) => {
        const newValue = value.includes(diagnosisId)
            ? value.filter(v => v !== diagnosisId)
            : [...value, diagnosisId]
        onChange(newValue)
    }

    const handleRemove = (diagnosisId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(value.filter(v => v !== diagnosisId))
    }

    const getSelectedLabels = () => {
        return value
            .map(v => diagnosisOptions.find(opt => opt.id === v)?.name)
            .filter(Boolean) as string[]
    }

    const selectedLabels = getSelectedLabels()

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-sm text-gray-700">Diagnose (Optional)</label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="h-8 px-3 text-xs hover:bg-gray-100"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>
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
                                    const diagnosisId = diagnosisOptions.find(opt => opt.name === label)?.id || ''
                                    return (
                                        <span
                                            key={diagnosisId}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                                        >
                                            <span className="max-w-[200px] truncate">{label}</span>
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={(e) => handleRemove(diagnosisId, e)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        handleRemove(diagnosisId, e as any)
                                                    }
                                                }}
                                                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                                                aria-label={`Remove ${label}`}
                                            >
                                                <X className="h-3.5 w-3.5 text-blue-600" />
                                            </span>
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
                            {isLoadingDiagnoses ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    Loading...
                                </div>
                            ) : filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <label
                                        key={option.id}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                                            value.includes(option.id)
                                                ? "bg-blue-50 hover:bg-blue-100"
                                                : "hover:bg-gray-50"
                                        )}
                                    >
                                        <Checkbox
                                            checked={value.includes(option.id)}
                                            onChange={() => handleToggle(option.id)}
                                            className="flex-shrink-0"
                                        />
                                        <span className={cn(
                                            "text-sm flex-1 select-none",
                                            value.includes(option.id) && "font-medium text-blue-900"
                                        )}>
                                            {option.name}
                                        </span>
                                        {value.includes(option.id) && (
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

            {/* Create Diagnosis Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Diagnosis</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Diagnosis Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter diagnosis name"
                                value={newDiagnosisName}
                                onChange={(e) => setNewDiagnosisName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleCreateDiagnosis()
                                    }
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setCreateModalOpen(false)
                                setNewDiagnosisName('')
                            }}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCreateDiagnosis}
                            disabled={isCreating || !newDiagnosisName.trim()}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            {isCreating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

