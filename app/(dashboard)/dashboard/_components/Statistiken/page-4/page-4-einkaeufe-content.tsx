import { EINKAUEFE_KPIS, WARENEINGAENGE } from '../data/page-4-data'

function CartIcon () {
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
        d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
      />
    </svg>
  )
}

function BarIcon () {
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
        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      />
    </svg>
  )
}

function LineIcon () {
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
        d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      />
    </svg>
  )
}

const ICONS = { cart: CartIcon, bar: BarIcon, line: LineIcon }

export default function Page4EinkaeufeContent () {
  return (
    <div className='mt-6 space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {EINKAUEFE_KPIS.map((kpi, i) => {
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

      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <h3 className='font-bold text-gray-900 text-base'>Wareneingänge</h3>
        <p className='text-gray-500 text-sm mt-0.5'>Letzte Lieferungen</p>
        <div className='overflow-x-auto mt-4'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Datum
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Lieferant
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Artikel
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Menge
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Einheit
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Wert
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Kategorie
                </th>
              </tr>
            </thead>
            <tbody>
              {WARENEINGAENGE.map((row, i) => (
                <tr
                  key={i}
                  className='border-b border-gray-100 hover:bg-gray-50/50'
                >
                  <td className='py-3 px-3 text-gray-700'>{row.datum}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.lieferant}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.artikel}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.menge}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.einheit}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.wert}</td>
                  <td className='py-3 px-3'>
                    <span className='inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {row.kategorie}
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
