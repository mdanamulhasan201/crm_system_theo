import { ABWESENHEITSTAGE } from '../data/page-3-data'

export default function AbwesenheitCard () {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-center'>
      <div className='text-2xl font-bold text-green-600'>
        {ABWESENHEITSTAGE.value}
      </div>
      <div className='text-sm text-gray-500 mt-1'>{ABWESENHEITSTAGE.label}</div>
    </div>
  )
}
