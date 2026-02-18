'use client'

import { VERBRAUCH_KPIS } from '../data/page-4-data'

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

function InfoIcon () {
  return (
    <svg
      className='w-4 h-4 text-gray-400 shrink-0'
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

function DownloadIcon () {
  return (
    <svg
      className='w-4 h-4 shrink-0'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
      />
    </svg>
  )
}

function DocumentIcon () {
  return (
    <svg
      className='w-4 h-4 shrink-0'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
      />
    </svg>
  )
}

export default function Page4VerbrauchContent () {
  return (
    <div className='mt-6 space-y-6'>
      <div>
        <h2 className='text-xl font-bold text-gray-900'>
          Consumption Analytics
        </h2>
        <p className='text-gray-600 text-sm mt-1'>
          Analyze material consumption patterns across production types
        </p>
      </div>
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-xs space-y-3'>
        <div className='flex flex-wrap items-center gap-4'>
          <span className='flex items-center gap-2 text-sm font-medium text-gray-700'>
            <FunnelIcon />
            Filters:
          </span>
          <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
            <option>All Categories</option>
          </select>
          <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
            <option>All Production</option>
          </select>
          <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
            <option>All Locations</option>
          </select>
          <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
            <option>All Users</option>
          </select>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
          >
            <DownloadIcon />
            CSV
          </button>
          <button
            type='button'
            className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
          >
            <DocumentIcon />
            PDF
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {VERBRAUCH_KPIS.map((kpi, i) => (
          <div
            key={i}
            className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs relative'
          >
            <div className='absolute top-4 right-4'>
              <InfoIcon />
            </div>
            <h3 className='font-semibold text-gray-700 text-sm pr-6 mb-2'>
              {kpi.title}
            </h3>
            <div className='text-2xl font-bold text-gray-900'>{kpi.value}</div>
            {kpi.trend != null &&
              kpi.trendLabel != null &&
              kpi.isPositive != null && (
                <div
                  className={`text-xs font-medium mt-1 ${
                    kpi.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {kpi.trend} {kpi.trendLabel}
                </div>
              )}
            <a
              href='#'
              className='inline-block mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline'
              onClick={e => e.preventDefault()}
            >
              Click to drill down
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
