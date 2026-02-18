'use client'

import { useState } from 'react'
import {
  ABWESENHEIT_CALENDAR_GREEN_CIRCLE,
  ABWESENHEIT_CALENDAR_PILL_RANGE,
  ABWESENHEIT_CALENDAR_DOT_DAYS,
  ABWESENHEIT_CALENDAR_SELECTED_RANGE,
  ABWESENHEIT_CALENDAR_SELECTED,
  ABWESENHEIT_INSIGHTS
} from '../data/page-3-data'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su']

function getCalendarGrid (year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const daysInMonth = last.getDate()
  const startPad = (first.getDay() + 6) % 7 // Monday = 0
  const prevMonth = new Date(year, month, 0)
  const prevDays = prevMonth.getDate()
  const totalCells = startPad + daysInMonth
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const nextDays = remaining > 0 ? Math.min(remaining, 7) : 0

  type Cell = { type: 'prev' | 'current' | 'next'; day: number }
  const cells: Cell[] = []

  for (let i = 0; i < startPad; i++) {
    cells.push({ type: 'prev', day: prevDays - startPad + 1 + i })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ type: 'current', day: d })
  }
  for (let d = 1; d <= nextDays; d++) {
    cells.push({ type: 'next', day: d })
  }

  return { cells, daysInMonth }
}

export default function AbwesenheitsquoteCalendarCard () {
  const [date, setDate] = useState({ year: 2022, month: 0 })
  const [activeFilter, setActiveFilter] = useState<'Jul' | 'O' | 'F'>('Jul')
  const { cells } = getCalendarGrid(date.year, date.month)

  const monthLabel = new Date(date.year, date.month).toLocaleDateString(
    'de-DE',
    {
      month: 'long',
      year: 'numeric'
    }
  )

  const go = (delta: number) => {
    let { year, month } = date
    month += delta
    if (month > 11) {
      month = 0
      year += 1
    } else if (month < 0) {
      month = 11
      year -= 1
    }
    setDate({ year, month })
  }

  const greenCircle = [...ABWESENHEIT_CALENDAR_GREEN_CIRCLE]
  const pillRange = [...ABWESENHEIT_CALENDAR_PILL_RANGE]
  const dotDays = [...ABWESENHEIT_CALENDAR_DOT_DAYS]
  const [selectedRangeStart, selectedRangeEnd] =
    ABWESENHEIT_CALENDAR_SELECTED_RANGE
  const selected = ABWESENHEIT_CALENDAR_SELECTED

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
      <h3 className='font-bold text-gray-900 text-base mb-4'>
        Abwesenheitsquote
      </h3>
      <div className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6'>
        {/* Calendar */}
        <div className='min-w-0'>
          <div className='flex items-center justify-between mb-3'>
            <button
              type='button'
              onClick={() => go(-1)}
              className='p-1.5 rounded-md hover:bg-gray-100 text-gray-500'
              aria-label='Vorheriger Monat'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
            <span className='font-medium text-gray-800 text-sm capitalize'>
              {monthLabel}
            </span>
            <button
              type='button'
              onClick={() => go(1)}
              className='p-1.5 rounded-md hover:bg-gray-100 text-gray-500'
              aria-label='Nächster Monat'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          </div>
          <div className='grid grid-cols-7 gap-x-1 gap-y-0.5 text-center'>
            {WEEKDAYS.map(d => (
              <div
                key={d}
                className='text-[10px] font-medium text-gray-500 py-1'
              >
                {d}
              </div>
            ))}
            {cells.map((cell, idx) => {
              const isPrevNext = cell.type !== 'current'
              const isGreenCircle =
                cell.type === 'current' &&
                (greenCircle as readonly number[]).includes(cell.day)
              const isPillStart =
                cell.type === 'current' && cell.day === pillRange[0]
              const isPillEnd =
                cell.type === 'current' && cell.day === pillRange[1]
              const isPillMid =
                cell.type === 'current' &&
                cell.day > pillRange[0] &&
                cell.day < pillRange[1]
              const isPill = isPillStart || isPillEnd || isPillMid
              const hasDot =
                cell.type === 'current' &&
                (dotDays as readonly number[]).includes(cell.day)
              const isSelected =
                cell.type === 'current' && cell.day === selected
              const isInSelectedRange =
                cell.type === 'current' &&
                cell.day >= selectedRangeStart &&
                cell.day <= selectedRangeEnd

              return (
                <div
                  key={idx}
                  className={`
                    h-8 flex flex-col items-center justify-center text-xs
                    ${isPrevNext ? 'text-gray-300' : 'text-gray-700'}
                    ${isInSelectedRange && !isGreenCircle ? 'bg-gray-100' : ''}
                    ${
                      isGreenCircle
                        ? 'bg-green-600 text-white rounded-full w-7 h-7 mx-auto'
                        : ''
                    }
                    ${
                      isPill && !isGreenCircle
                        ? 'bg-gray-200 text-gray-700'
                        : ''
                    }
                    ${
                      isPillStart && !isGreenCircle
                        ? 'rounded-l-full rounded-r-none'
                        : ''
                    }
                    ${
                      isPillEnd && !isGreenCircle
                        ? 'rounded-r-full rounded-l-none'
                        : ''
                    }
                    ${isPillMid ? 'rounded-none' : ''}
                    ${!isPill && !isGreenCircle ? 'rounded-md' : ''}
                    ${
                      isSelected && !isGreenCircle && !isPill
                        ? 'ring-2 ring-gray-300 ring-offset-1'
                        : ''
                    }
                  `}
                >
                  {cell.day}
                  {hasDot && (
                    <span
                      className='w-1.5 h-1.5 rounded-full bg-green-500 mt-0.5 shrink-0'
                      aria-hidden
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters & Insights */}
        <div className='min-w-0 flex flex-col'>
          <div className='flex gap-2 mb-4'>
            <button
              type='button'
              onClick={() => setActiveFilter('Jul')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'Jul'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Jul
            </button>
            <button
              type='button'
              onClick={() => setActiveFilter('O')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'O'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              O
            </button>
            <button
              type='button'
              onClick={() => setActiveFilter('F')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'F'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              F
            </button>
          </div>
          <div className='space-y-3'>
            {ABWESENHEIT_INSIGHTS.map((text, i) => (
              <div
                key={i}
                className='bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 shadow-xs'
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
