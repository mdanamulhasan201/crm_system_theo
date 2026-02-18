import ChartCard from '../DashboardSection/Chart-card'
import DonutWithLegend from '../page-2/donut-with-legend'
import PreisentwicklungChart from './preisentwicklung-chart'
import {
  LIEFERANTEN_UEBERSICHT,
  LIEFERANTEN_ABHAENGIGKEIT
} from '../data/page-4-data'

function TrendCell ({ trend }: { trend: 'stabil' | 'steigend' | 'sinkend' }) {
  if (trend === 'steigend') {
    return <span className='text-red-600 font-medium'>↑ steigend</span>
  }
  if (trend === 'sinkend') {
    return <span className='text-green-600 font-medium'>↓ sinkend</span>
  }
  return <span className='text-gray-600'>→ stabil</span>
}

export default function Page4LieferantenContent () {
  return (
    <div className='mt-6 space-y-6'>
      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <h3 className='font-bold text-gray-900 text-base'>
          Lieferanten-Übersicht
        </h3>
        <p className='text-gray-500 text-sm mt-0.5'>
          Einkaufswert, Anteil und Preisentwicklung
        </p>
        <div className='overflow-x-auto mt-4'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Lieferant
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Einkaufswert
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Anteil
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Lieferungen
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Ø Preis/Einheit
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {LIEFERANTEN_UEBERSICHT.map((row, i) => (
                <tr
                  key={i}
                  className='border-b border-gray-100 hover:bg-gray-50/50'
                >
                  <td className='py-3 px-3 text-gray-700 font-medium'>
                    {row.lieferant}
                  </td>
                  <td className='py-3 px-3 text-gray-700'>
                    {row.einkaufswert}
                  </td>
                  <td className='py-3 px-3 text-gray-700'>{row.anteil}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.lieferungen}</td>
                  <td className='py-3 px-3 text-gray-700'>
                    {row.oPreisEinheit}
                  </td>
                  <td className='py-3 px-3'>
                    <TrendCell trend={row.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ChartCard
          title='Lieferanten-Abhängigkeit'
          subtitle='Anteil am Gesamteinkauf'
        >
          <DonutWithLegend data={LIEFERANTEN_ABHAENGIGKEIT} />
        </ChartCard>
        <ChartCard
          title='Preisentwicklung'
          subtitle='Ø Preis pro Einheit über Zeit'
        >
          <PreisentwicklungChart />
        </ChartCard>
      </div>
    </div>
  )
}
