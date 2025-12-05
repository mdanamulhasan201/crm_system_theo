'use client'

import { DocumentType, TableFilter, documentTypeLabels, tableFilterLabels } from '../../../../../types/types'

interface FilterTabsProps {
    activeFilter: DocumentType
    onFilterChange: (filter: DocumentType) => void
    availableTypes: DocumentType[]
    getDocumentCount: (type: DocumentType) => number
    tableFilter: TableFilter
    onTableFilterChange: (filter: TableFilter) => void
}

export default function FilterTabs({
    activeFilter,
    onFilterChange,
    availableTypes,
    getDocumentCount,
    tableFilter,
    onTableFilterChange
}: FilterTabsProps) {
    return (
        <div className='flex flex-col md:flex-row items-center gap-2 justify-between'>
            {/* Document Type Filter Tabs */}
            <div className='flex items-center gap-2 overflow-x-auto '>
                {availableTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => onFilterChange(type)}
                        className={`px-4 cursor-pointer py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {documentTypeLabels[type]} ({getDocumentCount(type)})
                    </button>
                ))}
            </div>
            {/* Table Filter Tabs */}
            <div className='flex items-center gap-2 overflow-x-auto '>
                {(['all', 'customer_files', 'custom_shafts', 'screener_file'] as TableFilter[]).map((table) => (
                    <button
                        key={table}
                        onClick={() => onTableFilterChange(table)}
                        className={`px-4 cursor-pointer py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${tableFilter === table
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {tableFilterLabels[table]}
                    </button>
                ))}
            </div>
        </div>
    )
}
