'use client'

import {
  UBERSTUNDEN_IST,
  UBERSTUNDEN_LABELS,
  UBERSTUNDEN_INSIGHTS
} from '../data/page-3-data'

const DARK_GREEN = '#54C066'
const LIGHT_GREEN = '#99DEAC'
const ROWS = 3
const COLS = 5
const SQUARE_SIZE = 44

export default function UberstundenStatistikCard () {
  const maxVal = Math.max(...UBERSTUNDEN_IST)
  const barHeight = 160

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-sm'>
      <h3 className='text-lg font-bold text-[#2C3E50] mb-5'>
        Überstunden-Statistik
      </h3>
      <div className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6'>
        {/* Left: Soll-Stunden grid + Ist-Stunden bars */}
        <div className='flex flex-col sm:flex-row gap-8 items-start min-w-0'>
          {/* Soll-Stunden: 3×5 grid, checkerboard */}
          <div className='shrink-0'>
            <p className='text-sm font-medium text-[#607D8B] mb-2'>
              Soll-Stunden
            </p>
            <div
              className='grid gap-1 mb-2'
              style={{
                gridTemplateColumns: `repeat(${COLS}, ${SQUARE_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${SQUARE_SIZE}px)`
              }}
            >
              {Array.from({ length: ROWS * COLS }, (_, i) => {
                const row = Math.floor(i / COLS)
                const col = i % COLS
                const isDark = (row + col) % 2 === 0
                return (
                  <div
                    key={i}
                    className='rounded-sm'
                    style={{
                      width: SQUARE_SIZE,
                      height: SQUARE_SIZE,
                      backgroundColor: isDark ? DARK_GREEN : LIGHT_GREEN
                    }}
                  />
                )
              })}
            </div>
            <div
              className='grid gap-1'
              style={{
                gridTemplateColumns: `repeat(${COLS}, ${SQUARE_SIZE}px)`
              }}
            >
              {UBERSTUNDEN_LABELS.map((label, i) => (
                <span
                  key={i}
                  className='text-center text-xs font-medium text-[#2C3E50]'
                  style={{ width: SQUARE_SIZE }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Ist-Stunden: two vertical bars, both stacked (dark bottom, light top) */}
          <div className='shrink-0'>
            <p className='text-sm font-medium text-[#607D8B] mb-2'>
              Ist-Stunden
            </p>
            <div className='flex items-end gap-6' style={{ height: barHeight }}>
              {/* First bar: taller, stacked - dark bottom, light top */}
              <div className='flex flex-col items-center justify-end'>
                <div
                  className='w-8 flex flex-col rounded-t overflow-hidden'
                  style={{
                    height: `${(UBERSTUNDEN_IST[0]! / maxVal) * barHeight}px`
                  }}
                >
                  <div
                    className='w-full rounded-t min-h-[4px]'
                    style={{
                      height: '30%',
                      backgroundColor: LIGHT_GREEN
                    }}
                  />
                  <div
                    className='w-full min-h-[4px] flex-1'
                    style={{ backgroundColor: DARK_GREEN }}
                  />
                </div>
              </div>
              {/* Second bar: shorter, stacked - dark bottom, light top */}
              <div className='flex flex-col items-center justify-end'>
                <div
                  className='w-8 flex flex-col rounded-t overflow-hidden'
                  style={{
                    height: `${(UBERSTUNDEN_IST[1]! / maxVal) * barHeight}px`
                  }}
                >
                  <div
                    className='w-full rounded-t min-h-[4px]'
                    style={{
                      height: '30%',
                      backgroundColor: LIGHT_GREEN
                    }}
                  />
                  <div
                    className='w-full min-h-[4px] flex-1'
                    style={{ backgroundColor: DARK_GREEN }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Insight cards */}
        <div className='flex flex-col gap-3 min-w-0'>
          {UBERSTUNDEN_INSIGHTS.map((text, i) => (
            <div
              key={i}
              className='bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 shadow-sm'
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
