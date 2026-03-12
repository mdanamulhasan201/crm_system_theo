'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import SonstigesCreateModal from './SonstigesCreateModal'
import SonstigesDeleteModal from './SonstigesDeleteModal'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IoSearch, IoCreate, IoTrash } from 'react-icons/io5'
import { createSonstiges, getAllSonstiges, updateSonstiges, deleteSonstiges } from '@/apis/storeManagement'
import type { SonstigesItem } from '@/apis/storeManagement'
import { SonstigesFormData } from './SonstigesCreateModal'
import toast from 'react-hot-toast'
import useDebounce from '@/hooks/useDebounce'

function CustomCheckbox({
    checked,
    onChange,
    id,
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    id?: string
}) {
    return (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div
                className={`
                    w-4 h-4 rounded border-2 cursor-pointer transition-all flex items-center justify-center
                    ${checked ? 'bg-[#61A178] border-[#61A178]' : 'bg-white border-gray-300 hover:border-gray-400'}
                `}
                onClick={() => onChange(!checked)}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        </div>
    )
}

export interface SonstigesDataProps {
    setProductCount?: (n: number) => void
    openAddModal?: boolean
    onCloseAddModal?: () => void
    searchQuery?: string
    onSearchChange?: (value: string) => void
}

const SonstigesData: React.FunctionComponent<SonstigesDataProps> = (props) => {
    const { setProductCount, openAddModal, onCloseAddModal, searchQuery: controlledSearch, onSearchChange } = props
    const [internalSearch, setInternalSearch] = useState('')
    const searchQuery = controlledSearch !== undefined ? controlledSearch : internalSearch
    const setSearchQuery = onSearchChange ?? setInternalSearch
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [editingItem, setEditingItem] = useState<SonstigesItem | null>(null)
    const [deleteIds, setDeleteIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [items, setItems] = useState<SonstigesItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const debouncedSearch = useDebounce(searchQuery, 500)

    const fetchItems = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await getAllSonstiges(50, '', debouncedSearch)
            if (response?.success && Array.isArray(response?.data)) {
                setItems(response.data)
            } else {
                setItems([])
            }
        } catch (err) {
            console.error('Failed to fetch Sonstiges:', err)
            setItems([])
        } finally {
            setIsLoading(false)
        }
    }, [debouncedSearch])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    useEffect(() => {
        if (setProductCount) setProductCount(items.length)
    }, [items.length, setProductCount])

    useEffect(() => {
        if (openAddModal) setCreateModalOpen(true)
    }, [openAddModal])

    const visibleProducts = useMemo(() => items, [items])

    const isAllSelected = visibleProducts.length > 0 && selectedIds.size === visibleProducts.length
    const isSomeSelected = selectedIds.size > 0

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(visibleProducts.map((p) => p.id)))
        }
    }

    const handleSelectRow = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleCreateSubmit = async (data: SonstigesFormData) => {
        try {
            const response = await createSonstiges({
                manufacturer: data.manufacturer,
                delivery_business: data.delivery_business,
                article: data.article,
                ein: data.ein,
                quantity: data.quantity,
                value: data.value,
            })
            if (response?.success && response?.message) {
                toast.success(response.message)
                if (response?.data) {
                    setItems((prev) => [...prev, response.data])
                }
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Fehler beim Erstellen'
            toast.error(msg)
            throw err
        }
    }

    const handleEditClick = (item: SonstigesItem) => {
        setEditingItem(item)
        setEditModalOpen(true)
    }

    const handleEditSubmit = async (data: SonstigesFormData) => {
        if (!editingItem) return
        try {
            const response = await updateSonstiges(editingItem.id, {
                manufacturer: data.manufacturer,
                delivery_business: data.delivery_business,
                article: data.article,
                ein: data.ein,
                quantity: data.quantity,
                value: data.value,
            })
            if (response?.success && response?.message) {
                toast.success(response.message)
                setItems((prev) =>
                    prev.map((p) =>
                        p.id === editingItem.id
                            ? { ...p, ...data }
                            : p
                    )
                )
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Fehler beim Aktualisieren'
            toast.error(msg)
            throw err
        }
    }

    const handleDeleteClick = (id: string) => {
        setDeleteIds([id])
        setDeleteModalOpen(true)
    }

    const handleBulkDeleteClick = () => {
        if (selectedIds.size > 0) {
            setDeleteIds(Array.from(selectedIds))
            setDeleteModalOpen(true)
        }
    }

    const handleDeleteConfirm = async () => {
        if (deleteIds.length === 0) return
        setIsDeleting(true)
        try {
            const response = await deleteSonstiges({ ids: deleteIds })
            if (response?.success && response?.message) {
                toast.success(response.message)
                setItems((prev) => prev.filter((p) => !deleteIds.includes(p.id)))
                setSelectedIds((prev) => {
                    const next = new Set(prev)
                    deleteIds.forEach((id) => next.delete(id))
                    return next
                })
                setDeleteModalOpen(false)
                setDeleteIds([])
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Fehler beim Löschen'
            toast.error(msg)
        } finally {
            setIsDeleting(false)
        }
    }

    const formatValue = (val: number) => {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(val) + ' €'
    }

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false)
        onCloseAddModal?.()
    }

    return (
        <div className="w-full mb-10">
            {controlledSearch === undefined && (
                <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-4">
                    <div className="relative w-64">
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <Input
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                        />
                    </div>
                </div>
            )}

            <div className='flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4'>
                {isSomeSelected && (
                    <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white cursor-pointer shrink-0"
                        onClick={handleBulkDeleteClick}
                    >
                        <IoTrash className="w-4 h-4 mr-1" />
                        Ausgewählte löschen ({selectedIds.size})
                    </Button>
                )}
                {controlledSearch === undefined && (
                    <Button
                        className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer shrink-0"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Erstellen
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                {isLoading ? (
                    <div className="overflow-x-auto">
                    <Table className="w-full bg-white rounded-lg min-w-[900px]">
                        <TableHeader>
                            <TableRow className="border-b bg-white">
                                <TableHead className="p-3 w-12 shrink-0" />
                                <TableHead className="p-3 text-left font-medium text-gray-900">Hersteller</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">Liefergeschäft</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">Artikel</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">EIN</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Bestand</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Wert</TableHead>
                                <TableHead className="p-3 text-center font-medium text-gray-900 w-24 shrink-0">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="border-b bg-white">
                                    <TableCell className="p-3"><div className="h-4 w-4 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3"><div className="h-4 w-24 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3"><div className="h-4 w-24 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3"><div className="h-4 w-28 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3"><div className="h-4 w-20 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3 text-right"><div className="h-4 w-12 animate-pulse bg-gray-200 rounded ml-auto" /></TableCell>
                                    <TableCell className="p-3 text-right"><div className="h-4 w-14 animate-pulse bg-gray-200 rounded ml-auto" /></TableCell>
                                    <TableCell className="p-3"><div className="h-4 w-20 animate-pulse bg-gray-200 rounded" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <Table className="w-full bg-white rounded-lg min-w-[900px]">
                        <TableHeader>
                            <TableRow className="border-b bg-white">
                                <TableHead className="p-3 w-12 shrink-0">
                                    <CustomCheckbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        id="select-all"
                                    />
                                </TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">Hersteller</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">Liefergeschäft</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">Artikel</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">EIN</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Bestand</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Wert</TableHead>
                                <TableHead className="p-3 text-center font-medium text-gray-900 w-24 shrink-0">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="p-8 text-center">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="text-gray-400 mb-2">
                                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Produkte gefunden</h3>
                                            <p className="text-gray-500 text-sm">Es wurden keine Produkte in der Datenbank gefunden.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleProducts.map((row) => (
                                    <TableRow key={row.id} className="border-b bg-white">
                                        <TableCell className="p-3" onClick={(e) => e.stopPropagation()}>
                                            <CustomCheckbox
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                                id={`checkbox-${row.id}`}
                                            />
                                        </TableCell>
                                        <TableCell className="p-3 text-gray-900 truncate max-w-[140px]" title={row.manufacturer}>{row.manufacturer}</TableCell>
                                        <TableCell className="p-3 text-gray-900 truncate max-w-[140px]" title={row.delivery_business}>{row.delivery_business}</TableCell>
                                        <TableCell className="p-3 text-gray-900 truncate max-w-[140px]" title={row.article}>{row.article}</TableCell>
                                        <TableCell className="p-3 text-gray-900 truncate max-w-[120px]" title={row.ein}>{row.ein}</TableCell>
                                        <TableCell className="p-3 text-right text-gray-900 tabular-nums">{row.quantity}</TableCell>
                                        <TableCell className="p-3 text-right text-gray-900 tabular-nums">{formatValue(row.value)}</TableCell>
                                        <TableCell className="p-3 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditClick(row)}
                                                    className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                    title="Bearbeiten"
                                                >
                                                    <IoCreate className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteClick(row.id)}
                                                    className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-red-600 hover:bg-red-50"
                                                    title="Löschen"
                                                >
                                                    <IoTrash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                )}
            </div>

            <SonstigesCreateModal
                isOpen={createModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateSubmit}
                mode="create"
            />

            <SonstigesCreateModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false)
                    setEditingItem(null)
                }}
                onSubmit={handleEditSubmit}
                initialData={
                    editingItem
                        ? {
                              manufacturer: editingItem.manufacturer,
                              delivery_business: editingItem.delivery_business,
                              article: editingItem.article,
                              ein: editingItem.ein,
                              quantity: editingItem.quantity,
                              value: editingItem.value,
                          }
                        : null
                }
                mode="edit"
            />

            <SonstigesDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setDeleteIds([])
                }}
                onConfirm={handleDeleteConfirm}
                count={deleteIds.length}
                isLoading={isDeleting}
            />
        </div>
    )
};

export default SonstigesData
