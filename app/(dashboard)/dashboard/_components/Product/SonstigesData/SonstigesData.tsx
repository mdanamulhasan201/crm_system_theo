'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import SonstigesCreateModal from './SonstigesCreateModal'
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
import { IoSearch } from 'react-icons/io5'
import { createSonstiges, getAllSonstiges } from '@/apis/storeManagement'
import { SonstigesFormData } from './SonstigesCreateModal'
import toast from 'react-hot-toast'
import useDebounce from '@/hooks/useDebounce'

export default function SonstigesData() {
    const [searchQuery, setSearchQuery] = useState('')
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [items, setItems] = useState<Array<{
        id: string
        article: string
        ein: string
        quantity: number
        value: number
    }>>([])
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

    const visibleProducts = useMemo(() => items, [items])

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
                // Optimistic update: add new item to list without full reload
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

    const formatValue = (val: number) => {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(val) + ' €'
    }

    return (
        <div className="w-full px-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between mb-5">
                <h1 className='text-2xl font-semibold'>Sonstiges Verwaltung</h1>

                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                        <Input
                            placeholder="Suchen"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-white text-gray-700 placeholder:text-gray-500 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
                        />
                    </div>
                </div>
            </div>

            <div className='flex justify-end'>
                <Button
                    className="bg-[#61A178] hover:bg-[#61A178]/80 text-white cursor-pointer order-1 sm:order-2 shrink-0"
                    onClick={() => setCreateModalOpen(true)}
                >
                    Erstellen
                </Button>
            </div>

            {/* Table */}
            <div className="bg-gray-50 rounded-lg p-4 mt-5 shadow">
                {isLoading ? (
                    <Table className="w-full bg-white rounded-lg overflow-hidden">
                        <TableHeader>
                            <TableRow className="border-b bg-white">
                                <TableHead className="p-3 text-left font-medium text-gray-900">Artikel</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">SKU</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Bestand</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Wert</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i} className="border-b bg-white">
                                    <TableCell className="p-3"><div className="h-4 w-32 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3"><div className="h-4 w-24 animate-pulse bg-gray-200 rounded" /></TableCell>
                                    <TableCell className="p-3 text-right"><div className="h-4 w-12 animate-pulse bg-gray-200 rounded ml-auto" /></TableCell>
                                    <TableCell className="p-3 text-right"><div className="h-4 w-16 animate-pulse bg-gray-200 rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Table className="w-full bg-white rounded-lg overflow-hidden">
                        <TableHeader>
                            <TableRow className="border-b bg-white">
                                <TableHead className="p-3 text-left font-medium text-gray-900">Artikel</TableHead>
                                <TableHead className="p-3 text-left font-medium text-gray-900">SKU</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Bestand</TableHead>
                                <TableHead className="p-3 text-right font-medium text-gray-900">Wert</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-8 text-center">
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
                                        <TableCell className="p-3 text-gray-900">{row.article}</TableCell>
                                        <TableCell className="p-3 text-gray-900">{row.ein}</TableCell>
                                        <TableCell className="p-3 text-right text-gray-900 tabular-nums">{row.quantity}</TableCell>
                                        <TableCell className="p-3 text-right text-gray-900 tabular-nums">{formatValue(row.value)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <SonstigesCreateModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
            />
        </div>
    )
}
