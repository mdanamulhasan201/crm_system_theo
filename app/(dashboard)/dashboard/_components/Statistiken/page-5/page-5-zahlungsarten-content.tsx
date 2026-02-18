import ChartCard from '../DashboardSection/Chart-card'
import ZahlungsartenDonutChart from './zahlungsarten-donut-chart'
import { UMSATZ_NACH_ZAHLUNGSART } from '../data/page-5-data'

/** Donut data: name, value, color (umsatz used only in table) */
const DONUT_DATA = UMSATZ_NACH_ZAHLUNGSART.map(({ name, value, color }) => ({
  name,
  value,
  color
}))

export default function Page5ZahlungsartenContent () {
  return (
    <div className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <ChartCard
        title='Umsatz nach Zahlungsart'
        subtitle='Verteilung der Zahlungsmethoden'
      >
        <ZahlungsartenDonutChart data={DONUT_DATA} />
      </ChartCard>

      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <h3 className='font-bold text-gray-900 text-base'>
          Zahlungsart-Details
        </h3>
        <p className='text-gray-500 text-sm mt-0.5'>
          Anteil und geschätzter Umsatz
        </p>
        <div className='overflow-x-auto mt-4'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Zahlungsart
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Anteil
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Geschätzter Umsatz
                </th>
              </tr>
            </thead>
            <tbody>
              {UMSATZ_NACH_ZAHLUNGSART.map((row, i) => (
                <tr
                  key={i}
                  className='border-b border-gray-100 hover:bg-gray-50/50'
                >
                  <td className='py-3 px-3 text-gray-700 font-medium'>
                    {row.name}
                  </td>
                  <td className='py-3 px-3 text-gray-700'>{row.value}%</td>
                  <td className='py-3 px-3 text-gray-700'>{row.umsatz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
