'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface DocumentDataTableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  headerClassName?: string
  cellClassName?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

interface DocumentDataTableProps<T = Record<string, unknown>> {
  columns: DocumentDataTableColumn<T>[]
  data: T[]
  keyField?: string
  className?: string
  tableClassName?: string
  emptyMessage?: string
}

export default function DocumentDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  className,
  tableClassName,
  emptyMessage = 'Keine Einträge',
}: DocumentDataTableProps<T>) {
  const getKey = (row: T, index: number) => {
    const key = row[keyField as keyof T]
    if (key !== undefined && key !== null) return String(key)
    return `row-${index}`
  }

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'h-12 px-4 font-semibold text-gray-700 whitespace-nowrap',
                  alignClass(col.align),
                  col.headerClassName
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={getKey(row, index)}
                className="border-b border-gray-100 bg-white last:border-b-0 hover:bg-gray-50/50"
              >
                {columns.map((col) => {
                  const value = row[col.key as keyof T]
                  const content = col.render
                    ? col.render(value, row)
                    : (value as React.ReactNode)
                  return (
                    <TableCell
                      key={col.key}
                      className={cn(
                        'px-4 py-4 text-sm text-gray-700 whitespace-nowrap',
                        alignClass(col.align),
                        col.cellClassName
                      )}
                    >
                      {content ?? '–'}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
