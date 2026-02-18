import { RABATT_DETAIL_ARTIKEL } from '../data/page-5-data'

function WarningIcon () {
  return (
    <svg
      className='w-4 h-4 text-amber-500 shrink-0'
      fill='currentColor'
      viewBox='0 0 20 20'
    >
      <path
        fillRule='evenodd'
        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
        clipRule='evenodd'
      />
    </svg>
  )
}

function rabattquoteClass (pct: number) {
  if (pct >= 28) return 'text-red-600 font-medium'
  if (pct >= 18) return 'text-orange-600 font-medium'
  return 'text-gray-700'
}

function margeClass (pct: number) {
  if (pct < 30) return 'text-red-600 font-medium'
  if (pct >= 48) return 'text-green-600 font-medium'
  return 'text-gray-700'
}

export default function Page5RabattDetailContent () {
  return (
    <div className='mt-6'>
      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <h3 className='font-bold text-gray-900 text-base'>
          Top-Artikel mit höchster Rabattquote
        </h3>
        <p className='text-gray-500 text-sm mt-0.5'>
          Sortiert nach Rabattanteil – kritische Kombinationen markiert
        </p>
        <div className='overflow-x-auto mt-4'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Artikel
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Kategorie
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Umsatz
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Rabattquote
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Ø Rabatt
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Marge
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  DB-Verlust
                </th>
              </tr>
            </thead>
            <tbody>
              {RABATT_DETAIL_ARTIKEL.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 ${
                    row.isCritical ? 'bg-red-50/70' : ''
                  }`}
                >
                  <td className='py-3 px-3'>
                    <span className='flex items-center gap-2'>
                      {row.isCritical && <WarningIcon />}
                      <span className='font-medium text-gray-700'>
                        {row.artikel}
                      </span>
                    </span>
                  </td>
                  <td className='py-3 px-3'>
                    <span className='inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {row.kategorie}
                    </span>
                  </td>
                  <td className='py-3 px-3 text-gray-700'>{row.umsatz}</td>
                  <td
                    className={`py-3 px-3 ${rabattquoteClass(row.rabattquote)}`}
                  >
                    {row.rabattquote}%
                  </td>
                  <td className='py-3 px-3 text-gray-700'>{row.oRabatt}</td>
                  <td className={`py-3 px-3 ${margeClass(row.marge)}`}>
                    {row.marge}%
                  </td>
                  <td className='py-3 px-3 text-red-600 font-medium'>
                    {row.dbVerlust}
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
