'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CursorPaginationProps {
  /** Whether there is a next page (or more items to load) */
  hasNextPage: boolean
  /** Callback when "next" / "load more" is clicked. Receives the cursor for the next page. */
  onNext: (nextCursor: string | null) => void
  /** Cursor to send when requesting the next page (e.g. last item id or opaque token) */
  nextCursor?: string | null
  /** Whether there is a previous page */
  hasPrevPage?: boolean
  /** Callback when "previous" is clicked */
  onPrev?: (prevCursor: string | null) => void
  /** Cursor for the previous page */
  prevCursor?: string | null
  /** Loading state for next page (e.g. when fetching more) */
  isLoading?: boolean
  /** Number of items currently shown (for display) */
  totalShown?: number
  /** Page size / limit (for display, e.g. "10 pro Seite") */
  pageSize?: number
  /** Total count if known (optional, for "X von Y Einträge") */
  totalCount?: number | null
  /** Label for the "load next" button */
  nextLabel?: string
  /** Label for the "previous" button */
  prevLabel?: string
  /** Hide the component when no next/prev and no info to show */
  hideWhenEmpty?: boolean
  className?: string
}

export default function CursorPagination({
  hasNextPage,
  onNext,
  nextCursor = null,
  hasPrevPage = false,
  onPrev,
  prevCursor = null,
  isLoading = false,
  totalShown,
  pageSize,
  totalCount,
  nextLabel = 'Mehr laden',
  prevLabel = 'Zurück',
  hideWhenEmpty = false,
  className,
}: CursorPaginationProps) {
  const showPrev = hasPrevPage && onPrev
  const showNext = hasNextPage
  const showInfo = totalShown != null || totalCount != null || pageSize != null

  if (hideWhenEmpty && !showPrev && !showNext && !showInfo) {
    return null
  }

  const infoText = [
    totalShown != null && totalCount != null
      ? `${totalShown} von ${totalCount} Einträgen`
      : totalShown != null
        ? `${totalShown} Einträge`
        : totalCount != null
          ? `${totalCount} Einträge`
          : null,
    pageSize != null ? `(${pageSize} pro Seite)` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {showInfo && (
        <span className="text-sm text-gray-500">
          {infoText}
        </span>
      )}
      <div className="flex items-center gap-2 sm:ml-auto">
        {showPrev && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPrev(prevCursor ?? null)}
            disabled={isLoading}
            className="gap-1.5 border-gray-200"
          >
            <ChevronLeft className="size-4" />
            {prevLabel}
          </Button>
        )}
        {showNext && (
          <Button
            type="button"
            size="sm"
            onClick={() => onNext(nextCursor ?? null)}
            disabled={isLoading}
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ChevronRight className="size-4" />
            )}
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
