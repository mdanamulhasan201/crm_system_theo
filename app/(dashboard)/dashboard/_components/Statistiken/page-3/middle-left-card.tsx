import { PAGE3_LEFT_STATS } from '../data/page-3-data'

export default function MiddleLeftCard () {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-center'>
      <div className='space-y-4'>
        {PAGE3_LEFT_STATS.map((stat, i) => (
          <div key={i}>
            <div className='text-2xl font-bold text-gray-900'>{stat.value}</div>
            <div className='text-sm text-gray-500'>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
