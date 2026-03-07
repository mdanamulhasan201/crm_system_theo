'use client'

import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { name?: string; value?: number } }> }) {
  if (!active || !payload?.length) return null
  const raw = payload[0]
  const name = raw?.payload?.name ?? raw?.name ?? ''
  const value = raw?.payload?.value ?? raw?.value ?? 0
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg z-100">
      <p className="text-sm font-semibold text-gray-900">{name}</p>
      <p className="text-xs text-gray-600 mt-0.5">{value}%</p>
    </div>
  )
}

interface VerfugbareProdukteProps {
  plannedProducts?: number
  productsInStock?: number
  donutEnoughPercent?: number
  donutNotEnoughPercent?: number
  centerLabel?: string
}

export default function VerfugbareProdukte({
  plannedProducts = 124,
  productsInStock = 65,
  donutEnoughPercent = 75,
  donutNotEnoughPercent = 25,
  centerLabel = 'Nicht genug',
}: VerfugbareProdukteProps) {
  const chartData = [
    { name: 'Genug', value: donutEnoughPercent, color: '#61A178' },
    { name: 'Nicht genug', value: donutNotEnoughPercent, color: '#E5E7EB' },
  ]

  return (
    <div className="rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden h-full flex flex-col min-h-0">
      <div className="p-4 flex-1 min-h-0">
        <h2 className="text-base font-bold text-gray-900 sm:text-lg">
          Verfügbare Produkte
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Überblick über geplante Produkte und aktuell verfügbare Lagerbestände.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<PieTooltip />} cursor={{ fill: 'transparent' }} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={0}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                {centerLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-1 min-w-0 flex-col gap-4 sm:flex-row sm:gap-5">
            <div className="text-center sm:text-left">
              <p className="text-xl font-bold text-[#61A178] sm:text-2xl tabular-nums">
                {plannedProducts}
              </p>
              <p className="mt-0.5 text-xs font-normal text-gray-900">
                Geplante Produkte im nächsten Monat
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl font-bold text-[#61A178] sm:text-2xl tabular-nums">
                {productsInStock}
              </p>
              <p className="mt-0.5 text-xs font-normal text-gray-900">
                Produkte im Lager
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
