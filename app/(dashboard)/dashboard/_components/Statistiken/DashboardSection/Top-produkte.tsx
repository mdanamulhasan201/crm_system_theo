import { getTopProdukteData } from "../data/dashboard-data"


function formatEuro (n: number) {
  return `${n.toLocaleString('de-DE')} €`
}

export default function TopProdukte () {
  const data = getTopProdukteData()

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-gray-200'>
            <th className='text-left font-semibold text-gray-700 py-2 pr-4'>
              Produkt
            </th>
            <th className='text-right font-semibold text-gray-700 py-2 px-2'>
              Umsatz
            </th>
            <th className='text-right font-semibold text-gray-700 py-2 px-2'>
              DB
            </th>
            <th className='text-right font-semibold text-gray-700 py-2 px-2'>
              Menge
            </th>
            <th className='text-center font-semibold text-gray-700 py-2 pl-4'>
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className='border-b border-gray-100 last:border-0'>
              <td className='py-3 pr-4 text-gray-900'>{row.produkt}</td>
              <td className='py-3 px-2 text-right text-gray-700'>
                {formatEuro(row.umsatz)}
              </td>
              <td className='py-3 px-2 text-right text-gray-700'>
                {formatEuro(row.db)}
              </td>
              <td className='py-3 px-2 text-right text-gray-700'>
                {row.menge}
              </td>
              <td className='py-3 pl-4 text-center'>
                {/* arrow should be 45 deg angle */}
                {row.trend === 'up' ? (
                  <span className='text-green-600 inline-block rotate-45' aria-label='Aufwärtstrend'>
                    ↑
                  </span>
                ) : (
                  <span className='text-red-600 inline-block rotate-45' aria-label='Abwärtstrend'>
                    ↓
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
