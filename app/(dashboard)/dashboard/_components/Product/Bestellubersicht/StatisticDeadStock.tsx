'use client'

import React from 'react'

interface StatisticDeadStockProps {
  sixMonthsCount?: number
  twelveMonthsCount?: number
  sixMonthsMax?: number
  twelveMonthsMax?: number
}

export default function StatisticDeadStock({
  sixMonthsCount = 128,
  twelveMonthsCount = 128,
  sixMonthsMax = 128,
  twelveMonthsMax = 128,
}: StatisticDeadStockProps) {
  const sixPercent = sixMonthsMax ? Math.min(100, (sixMonthsCount / sixMonthsMax) * 100) : 100
  const twelvePercent = twelveMonthsMax ? Math.min(100, (twelveMonthsCount / twelveMonthsMax) * 100) : 100

  return (
    <div className="rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden h-full flex flex-col min-h-0">
      <div className="p-4 flex-1 min-h-0">
        <h2 className="text-base font-bold text-gray-900 sm:text-lg">
          Statistic Dead Stock
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Alles, was sich 12 Monate nicht bewegt hat, ist gebundenes Kapital.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-normal text-gray-900">
              6 Monate nicht bewegt
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#61A178] transition-all"
                  style={{ width: `${sixPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#61A178] tabular-nums shrink-0">
                {sixMonthsCount}
              </span>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-normal text-gray-900">
              12 Monate nicht bewegt
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#DC2626] transition-all"
                  style={{ width: `${twelvePercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#DC2626] tabular-nums shrink-0">
                {twelveMonthsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
