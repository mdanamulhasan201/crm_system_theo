'use client'

import { useState, useMemo } from 'react'

import DeadStockTrendChart from './dead-stock-trend-chart'
import {
  DEAD_STOCK_KPIS,
  DEAD_STOCK_ARTIKEL,
  DEAD_STOCK_FILTER_DAYS
} from '../data/page-4-data'
import ChartCard from '../DashboardSection/Chart-card'

function BoxIcon () {
  return (
    <svg
      className='w-5 h-5 text-gray-500'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
      />
    </svg>
  )
}

function TriangleIcon () {
  return (
    <svg
      className='w-5 h-5 text-gray-500'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      />
    </svg>
  )
}

function PercentIcon () {
  return (
    <svg
      className='w-5 h-5 text-gray-500'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <circle cx='7.5' cy='7.5' r='3' strokeWidth={2} />
      <circle cx='16.5' cy='16.5' r='3' strokeWidth={2} />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M5 19L19 5'
      />
    </svg>
  )
}

function InfoIcon () {
  return (
    <svg
      className='w-5 h-5 text-blue-600 shrink-0'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  )
}

function FunnelIcon () {
  return (
    <svg
      className='w-4 h-4 text-gray-500 shrink-0'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
      />
    </svg>
  )
}

const ICONS = { box: BoxIcon, triangle: TriangleIcon, percent: PercentIcon }

export default function Page4DeadStockContent () {
  const [minDays, setMinDays] = useState(30)

  const filtered = useMemo(() => {
    return DEAD_STOCK_ARTIKEL.filter(row => row.tageOhne >= minDays)
  }, [minDays])

  const totalWert = useMemo(() => {
    return filtered.reduce((s, r) => s + r.lagerwertNum, 0)
  }, [filtered])

  return (
    <div className='mt-6 space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {DEAD_STOCK_KPIS.map((kpi, i) => {
          const Icon = ICONS[kpi.icon]
          return (
            <div
              key={i}
              className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold text-gray-700 text-sm'>
                  {kpi.title}
                </h3>
                <Icon />
              </div>
              <div className='text-2xl font-bold text-gray-900'>
                {kpi.value}
              </div>
              {kpi.sub && (
                <div
                  className={`text-sm mt-1 ${
                    kpi.trendUp ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {kpi.trendUp && '↑ '}
                  {kpi.sub}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ChartCard
        title='Dead-Stock-Trend'
        subtitle='Entwicklung des Dead-Stock-Werts – nimmt er zu oder ab?'
      >
        <DeadStockTrendChart />
      </ChartCard>

      <div className='flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-gray-700'>
        <InfoIcon />
        <span>
          7 Artikel ohne Bewegung seit über 84 Tagen. Gesamtwert: 5.840 €.
          Prüfen Sie Verwertung oder Abschreibung.
        </span>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
          <div>
            <h3 className='font-bold text-gray-900 text-base'>
              Dead-Stock-Artikel
            </h3>
            <p className='text-gray-500 text-sm mt-0.5'>
              Filtern nach Mindesttagen ohne Bewegung
            </p>
          </div>
          <span className='text-sm font-medium text-gray-700'>
            {filtered.length} Artikel – {totalWert.toLocaleString('de-DE')} €
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-3 mb-4'>
          <div className='flex items-center gap-2'>
            <FunnelIcon />
            <span className='text-sm text-gray-600'>
              Ohne Bewegung seit mindestens:
            </span>
          </div>
          <select
            value={minDays}
            onChange={e => setMinDays(Number(e.target.value))}
            className='border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            {DEAD_STOCK_FILTER_DAYS.map(d => (
              <option key={d} value={d}>
                {d} Tage
              </option>
            ))}
          </select>
        </div>
        <div className='overflow-x-auto max-h-[320px] overflow-y-auto'>
          <table className='w-full text-sm'>
            <thead className='sticky top-0 bg-white border-b border-gray-200'>
              <tr>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Artikel
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Kategorie
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Lagerwert
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Letzte Bewegung
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Tage ohne
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className='border-b border-gray-100 hover:bg-gray-50/50'
                >
                  <td className='py-3 px-3 text-gray-700 font-medium'>
                    {row.artikel}
                  </td>
                  <td className='py-3 px-3'>
                    <span className='inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {row.kategorie}
                    </span>
                  </td>
                  <td className='py-3 px-3 text-gray-700'>{row.lagerwert}</td>
                  <td className='py-3 px-3 text-gray-700'>
                    {row.letzteBewegung}
                  </td>
                  <td className='py-3 px-3'>
                    <span
                      className={
                        row.tageOhne >= 90
                          ? 'text-red-600 font-medium'
                          : 'text-orange-600 font-medium'
                      }
                    >
                      {row.tageOhne}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
