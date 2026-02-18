import { PAGE4_ALERTS } from '../data/page-4-data'

function BulbIcon () {
  return (
    <svg
      className='w-5 h-5 text-amber-500 shrink-0'
      fill='currentColor'
      viewBox='0 0 20 20'
    >
      <path d='M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0v-1h4v1a2 2 0 11-4 0z' />
    </svg>
  )
}

export default function Page4Alerts () {
  return (
    <div className='space-y-2 mt-4 grid grid-cols-1 lg:grid-cols-3 items-center gap-2'>
      {PAGE4_ALERTS.map((text, i) => (
        <div
          key={i}
          className='flex items-start gap-3 bg-amber-50/80 border border-amber-200 rounded-lg px-4 py-3 text-xs text-gray-700'
        >
          <BulbIcon />
          <span>{text}</span>
        </div>
      ))}
    </div>
  )
}
