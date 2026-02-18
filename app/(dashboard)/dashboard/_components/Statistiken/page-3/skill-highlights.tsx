import { SKILL_HIGHLIGHTS } from '../data/page-3-data'

export default function SkillHighlights () {
  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <ul className='space-y-3'>
          {SKILL_HIGHLIGHTS.map((item, i) => (
            <li key={i} className='text-sm'>
              <span className='text-gray-600'>{item.label}: </span>
              <span className='font-medium text-gray-900'>
                {item.name} ({item.hours} h)
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
        <ul className='space-y-3'>
          <li className='text-sm'>
            <span className='font-medium text-gray-900'>Meiste </span>
            <span className='text-gray-600'>
              Mabschuhstunden: Michael (88 h)
            </span>
          </li>
          <li className='text-sm'>
            <span className='font-medium text-gray-900'>Meiste </span>
            <span className='text-gray-600'>
              Mabschuhstunden: Michael (88 h)
            </span>
          </li>
          <li className='text-sm'>
            <span className='font-medium text-gray-900'>Meiste </span>
            <span className='text-gray-600'>
              Mabschuhstunden: Michael (88 h)
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
