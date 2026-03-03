import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
    activeFilter: string
    onFilterChange: (value: string) => void
    filters: readonly string[]
    /** When false, search input is hidden and only type filter is shown */
    showSearch?: boolean
    search?: string
    onSearchChange?: (value: string) => void
    placeholder?: string
}

export default function SearchFilter({
    activeFilter,
    onFilterChange,
    filters,
    showSearch = true,
    search = '',
    onSearchChange,
    placeholder,
}: SearchFilterProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {showSearch ? (
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder={placeholder ?? 'Suche...'}
                        className="pl-9 border-gray-300"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
            ) : (
                <div className="flex-1" />
            )}
            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <Button
                        key={filter}
                        variant={activeFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            'cursor-pointer',
                            activeFilter === filter && ' bg-[#61A175] hover:bg-[#61A175]/90'
                        )}
                        onClick={() => onFilterChange(filter)}
                    >
                        {filter}
                    </Button>
                ))}
            </div>
        </div>
    )
}
