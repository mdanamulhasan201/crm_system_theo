'use client'

import { cn } from '@/lib/utils'

function ShimmerLine({ className }: { className?: string }) {
    return <div className={cn('shimmer h-3 rounded-md', className)} aria-hidden />
}

/** List row: icon square + 2 lines + pill badge (matches DocumentCard list layout) */
function DokumenteListRowSkeleton() {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 sm:gap-4'
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="shimmer h-12 w-12 shrink-0 rounded-lg" aria-hidden />
                <div className="min-w-0 flex-1 space-y-2">
                    <ShimmerLine className="h-4 w-[72%] max-w-md" />
                    <ShimmerLine className="h-3 w-[40%] max-w-xs" />
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <div className="shimmer h-8 w-8 shrink-0 rounded-md" aria-hidden />
                <div className="shimmer h-8 w-8 shrink-0 rounded-md" aria-hidden />
                <div className="shimmer h-8 w-8 shrink-0 rounded-md" aria-hidden />
                <div className="shimmer ml-1 h-7 w-16 shrink-0 rounded-full" aria-hidden />
            </div>
        </div>
    )
}

/** Initial load: vertical list of document row skeletons + header line */
export function DokumenteListSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-4" role="status" aria-label="Dokumente werden geladen">
            <div className="shimmer h-4 w-28 rounded-md" aria-hidden />
            <div className="flex flex-col gap-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <DokumenteListRowSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

/** @deprecated Use DokumenteListSkeleton */
export const DokumenteGridSkeleton = DokumenteListSkeleton

/** Narrow inline shimmer for refetch / secondary loading */
export function ShimmerBar({ className }: { className?: string }) {
    return (
        <div className={cn('py-3', className)} role="status" aria-label="Aktualisiere">
            <div className="shimmer mx-auto h-1.5 w-full max-w-md rounded-full" />
        </div>
    )
}

/** Matches RezepteData recipe cards */
export function RezepteListSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div className="space-y-4" role="status" aria-label="Rezepte werden geladen">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="shimmer h-6 w-20 rounded-full" aria-hidden />
                                <div className="shimmer h-3 w-24 rounded-md" aria-hidden />
                            </div>
                            <div className="shimmer h-5 w-[55%] max-w-xs rounded-md" aria-hidden />
                            <div className="shimmer h-4 w-full max-w-md rounded-md" aria-hidden />
                            <div className="shimmer h-4 w-[80%] max-w-sm rounded-md" aria-hidden />
                            <div className="shimmer h-3 w-32 rounded-md" aria-hidden />
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <div className="shimmer h-9 w-28 rounded-md" aria-hidden />
                            <div className="shimmer h-9 w-24 rounded-md" aria-hidden />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
