
import OverstockNachKategorieChart from './overstock-nach-kategorie-chart'
import { OVERSTOCK_KPIS, OVERSTOCK_ARTIKEL } from '../data/page-4-data'
import Image from 'next/image'
import ChartCard from '../DashboardSection/Chart-card'

function TrashIcon () {
  return <Image src='/icons/archive.png' alt='Trash' width={16} height={16} />
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

function StackIcon () {
  return <Image src='/icons/layers.png' alt='Stack' width={16} height={16} />
}

const ICONS = { trash: TrashIcon, triangle: TriangleIcon, stack: StackIcon }

export default function Page4OverstockContent () {
  return (
    <div className='mt-6 space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {OVERSTOCK_KPIS.map((kpi, i) => {
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
                    kpi.trendDown ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {kpi.sub}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ChartCard
        title='Overstock nach Kategorie'
        subtitle='Wert des Überbestands je Kategorie'
      >
        <OverstockNachKategorieChart />
      </ChartCard>

      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <h3 className='font-bold text-gray-900 text-base'>Overstock-Artikel</h3>
        <p className='text-gray-500 text-sm mt-0.5'>Bestand über Sollbestand</p>
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
                  Bestand
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Sollbestand
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Überbestand
                </th>
                <th className='text-left py-3 px-3 font-semibold text-gray-700'>
                  Wert
                </th>
              </tr>
            </thead>
            <tbody>
              {OVERSTOCK_ARTIKEL.map((row, i) => (
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
                  <td className='py-3 px-3 text-gray-700'>{row.bestand}</td>
                  <td className='py-3 px-3 text-gray-700'>{row.sollbestand}</td>
                  <td className='py-3 px-3 text-orange-600 font-medium'>
                    {row.ueberbestand}
                  </td>
                  <td className='py-3 px-3 text-gray-700'>{row.wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
