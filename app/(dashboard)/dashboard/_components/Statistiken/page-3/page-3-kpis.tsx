import { PAGE3_KPIS } from '../data/page-3-data'

const ICON_CLASS = 'w-5 h-5 text-gray-600'

function ClockIcon () {
  return (
    <svg
      className={ICON_CLASS}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  )
}

function CalendarIcon () {
  return (
    <svg
      className={ICON_CLASS}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      />
    </svg>
  )
}

function UsersIcon () {
  return (
    <svg
      className={ICON_CLASS}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      />
    </svg>
  )
}

function DocumentIcon () {
  return (
    <svg
      className={ICON_CLASS}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  )
}

const ICONS = [ClockIcon, CalendarIcon, UsersIcon, DocumentIcon]

export default function Page3Kpis () {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {PAGE3_KPIS.map((kpi, index) => {
        const Icon = ICONS[index]
        return (
          <div
            key={index}
            className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'
          >
            <div className='flex justify-between items-start mb-2'>
              <h3 className='font-semibold text-gray-700 text-sm'>
                {kpi.title}
              </h3>
              <div className='w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
                <Icon />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>{kpi.value}</div>
            {kpi.sub ? (
              <div
                className={`text-sm mt-1 ${
                  kpi.trendUp ? 'text-green-600 font-medium' : 'text-gray-500'
                }`}
              >
                {kpi.sub}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
