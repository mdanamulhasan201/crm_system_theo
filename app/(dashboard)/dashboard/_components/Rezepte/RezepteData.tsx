'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ScanLine, Pencil, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    getRecipe,
    deleteRecipe,
    type Prescription,
    type GetRecipeResponse,
} from '@/apis/rezepteApis'

/** ISO date string -> dd.mm.yyyy */
function formatPrescriptionDate(iso?: string): string {
    if (!iso) return '–'
    try {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return iso
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const year = d.getFullYear()
        return `${day}.${month}.${year}`
    } catch {
        return iso
    }
}

interface RezepteDataProps {
    customerId: string
    refetchTrigger?: number
    onEdit: (recipe: Prescription) => void
    /** When set, Bearbeiten button for this recipe shows loading (fetching single recipe for modal) */
    editingRecipeId?: string | null
    /** Currently selected recipe id (for export); card click toggles selection */
    selectedRecipeId?: string | null
    onSelectRecipe?: (recipeId: string | null) => void
}

const PAGE_SIZE = 10

/** Normalize backend response (array or { data, hasMore, nextCursor }) to list + hasMore + nextCursor */
function normalizeGetRecipeResponse(raw: GetRecipeResponse | Prescription[]): {
    data: Prescription[]
    hasMore: boolean
    nextCursor: string | null
} {
    const data = Array.isArray(raw)
        ? raw
        : raw?.data && Array.isArray(raw.data)
            ? raw.data
            : []
    const hasMore = !Array.isArray(raw) && typeof raw?.hasMore === 'boolean' ? raw.hasMore : false
    const nextCursor =
        !Array.isArray(raw) && raw?.nextCursor != null && raw.nextCursor !== ''
            ? raw.nextCursor
            : hasMore && data.length > 0
                ? data[data.length - 1].id
                : null
    return { data, hasMore, nextCursor }
}

export default function RezepteData({
    customerId,
    refetchTrigger = 0,
    onEdit,
    editingRecipeId = null,
    selectedRecipeId = null,
    onSelectRecipe,
}: RezepteDataProps) {
    const [list, setList] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteConfirmRecipe, setDeleteConfirmRecipe] = useState<Prescription | null>(null)
    const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined)
    const [hasMore, setHasMore] = useState(false)

    const prevCustomerIdRef = useRef(customerId)

    const fetchList = useCallback(
        async (cursor?: string | null, append = false, silent = false) => {
            if (!customerId) return
            if (!append && !silent) {
                setLoading(true)
                setError(null)
            } else if (append) {
                setLoadingMore(true)
            }
            try {
                const res = await getRecipe(
                    customerId,
                    cursor ?? undefined,
                    cursor != null ? PAGE_SIZE : undefined
                )
                const { data, hasMore: more, nextCursor: next } = normalizeGetRecipeResponse(res)
                setList((prev) => (append ? [...prev, ...data] : data))
                setHasMore(more)
                setNextCursor(next)
            } catch (err: unknown) {
                const msg =
                    err && typeof err === 'object' && 'message' in err
                        ? String((err as { message: unknown }).message)
                        : 'Fehler beim Laden.'
                if (!append && !silent) {
                    setError(msg)
                    setList([])
                }
            } finally {
                setLoading(false)
                setLoadingMore(false)
            }
        },
        [customerId]
    )

    useEffect(() => {
        const isCustomerChange = prevCustomerIdRef.current !== customerId
        prevCustomerIdRef.current = customerId

        if (isCustomerChange) {
            setList([])
            setNextCursor(undefined)
            fetchList(null, false, false)
        } else {
            fetchList(null, false, true)
        }
    }, [customerId, refetchTrigger, fetchList])

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore || nextCursor === undefined || nextCursor === null) return
        fetchList(nextCursor, true)
    }, [loadingMore, hasMore, nextCursor, fetchList])

    const openDeleteConfirm = (recipe: Prescription) => {
        setDeleteConfirmRecipe(recipe)
    }

    const closeDeleteConfirm = () => {
        if (!deletingId) setDeleteConfirmRecipe(null)
    }

    const handleConfirmDelete = async () => {
        if (!deleteConfirmRecipe?.id) return
        const idToDelete = deleteConfirmRecipe.id
        setDeletingId(idToDelete)
        try {
            await deleteRecipe(idToDelete)
            setList((prev) => prev.filter((r) => r.id !== idToDelete))
            setDeleteConfirmRecipe(null)
        } catch {
            // keep list as-is on error
        } finally {
            setDeletingId(null)
        }
    }

    if (loading && list.length === 0) {
        return (
            <div className='space-y-6'>
                <h2 className='font-sans text-xl font-semibold tracking-tight text-gray-900 mb-4'>
                    Rezepte
                </h2>
                <div className='flex items-center justify-center py-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                </div>
            </div>
        )
    }

    if (error && list.length === 0) {
        return (
            <div className='space-y-6'>
                <h2 className='font-sans text-xl font-semibold tracking-tight text-gray-900 mb-4'>
                    Rezepte
                </h2>
                <p className='text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md'>
                    {error}
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* <h2 className='font-sans text-xl font-semibold tracking-tight text-gray-900 mb-4'>
                Rezepte
            </h2> */}

            {list.length === 0 ? (
                <p className='text-sm text-gray-500 py-6 text-center'>
                    Noch keine Rezepte. Fügen Sie ein neues Rezept hinzu.
                </p>
            ) : (
                <>
                    <div className='space-y-4'>
                        {list.map((recipe) => (
                            <div
                                key={recipe.id}
                                role={onSelectRecipe ? 'button' : undefined}
                                tabIndex={onSelectRecipe ? 0 : undefined}
                                onClick={
                                    onSelectRecipe
                                        ? () => onSelectRecipe(selectedRecipeId === recipe.id ? null : recipe.id)
                                        : undefined
                                }
                                onKeyDown={
                                    onSelectRecipe
                                        ? (e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                  e.preventDefault()
                                                  onSelectRecipe(selectedRecipeId === recipe.id ? null : recipe.id)
                                              }
                                          }
                                        : undefined
                                }
                                className={`bg-white border rounded-xl p-5 shadow-sm transition-shadow ${
                                    selectedRecipeId === recipe.id
                                        ? 'border-[#61A07B] ring-2 ring-[#61A07B]/30 shadow-md'
                                        : 'border-gray-200 hover:shadow-md'
                                } ${onSelectRecipe ? 'cursor-pointer' : ''}`}
                            >
                                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                                    <div className='flex-1 min-w-0 space-y-2'>
                                        <div className='flex flex-wrap items-center justify-between gap-2'>
                                            <span className='font-sans px-2.5 py-1 bg-[#61A07B] text-white text-xs font-medium rounded-full inline-flex items-center gap-1 tracking-wide'>
                                                <ScanLine className='w-3 h-3' />
                                                Scan
                                            </span>
                                            <span className='font-sans text-xs text-gray-500 tabular-nums'>
                                                {formatPrescriptionDate(
                                                    recipe.prescription_date
                                                )}
                                            </span>
                                        </div>
                                        <h3 className='font-sans font-semibold text-lg tracking-tight text-gray-900'>
                                            {recipe.insurance_provider || '–'}
                                        </h3>
                                        {recipe.insurance_number && (
                                            <p className='font-sans text-sm text-gray-600'>
                                                Versicherungsnummer:{' '}
                                                {recipe.insurance_number}
                                            </p>
                                        )}
                                        <p className='font-sans text-sm text-gray-600 leading-snug'>
                                            {recipe.medical_diagnosis || '–'}
                                        </p>
                                        {recipe.validity_weeks != null &&
                                            recipe.validity_weeks > 0 && (
                                                <p className='font-sans text-xs text-gray-500'>
                                                    Gültigkeit:{' '}
                                                    {recipe.validity_weeks}{' '}
                                                    Wochen
                                                </p>
                                            )}
                                    </div>
                                    <div className='flex items-center gap-2 shrink-0' onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            className='gap-1.5 cursor-pointer'
                                            disabled={editingRecipeId === recipe.id}
                                            onClick={() => onEdit(recipe)}
                                        >
                                            {editingRecipeId === recipe.id ? (
                                                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                            ) : (
                                                <Pencil className='w-3.5 h-3.5' />
                                            )}
                                            Bearbeiten
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='destructive'
                                            size='sm'
                                            className='gap-1.5 cursor-pointer'
                                            disabled={deletingId === recipe.id}
                                            onClick={() => openDeleteConfirm(recipe)}
                                        >
                                            {deletingId === recipe.id ? (
                                                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                            ) : (
                                                <Trash2 className='w-3.5 h-3.5' />
                                            )}
                                            Löschen
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className='flex justify-center pt-2'>
                            <Button
                                type='button'
                                variant='outline'
                                disabled={loadingMore}
                                onClick={loadMore}
                                className='gap-2'
                            >
                                {loadingMore ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <ChevronDown className='h-4 w-4' />
                                )}
                                Mehr laden
                            </Button>
                        </div>
                    )}
                </>
            )}

            <Dialog open={!!deleteConfirmRecipe} onOpenChange={(open) => !open && closeDeleteConfirm()}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Rezept löschen?</DialogTitle>
                        <DialogDescription>
                            Möchten Sie dieses Rezept wirklich löschen? Diese Aktion kann nicht
                            rückgängig gemacht werden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className='gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            className='cursor-pointer'
                            onClick={closeDeleteConfirm}
                            disabled={!!deletingId}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleConfirmDelete}
                            disabled={!!deletingId}
                            className='gap-2 cursor-pointer'
                        >
                            {deletingId ? (
                                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                            ) : (
                                <Trash2 className='w-3.5 h-3.5' />
                            )}
                            Löschen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
