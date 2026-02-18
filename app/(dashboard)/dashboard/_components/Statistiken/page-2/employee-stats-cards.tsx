import { EMPLOYEE_STATS } from '../data/page-2-data'

export default function EmployeeStatsCards () {
  return (
    <div className='grid grid-cols-1 gap-4'>
      {EMPLOYEE_STATS.map((stat, index) => (
        <div
          key={index}
          className='bg-white border border-gray-200 rounded-lg p-4 shadow-xs'
        >
          <h3 className='font-semibold text-gray-800 text-lg mb-9 w-1/2'>
            {stat.title}
          </h3>
          <div className='text-3xl font-bold text-gray-900'>{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
