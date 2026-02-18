import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  legend?: ReactNode
  compact?: boolean
}

export default function ChartCard ({
  title,
  subtitle,
  children,
  legend,
  compact = false
}: ChartCardProps) {
  return (
    <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
      <div className='mb-4'>
        <h3 className='font-bold text-gray-900 text-base'>{title}</h3>
        {subtitle && <p className='text-gray-500 text-sm mt-0.5'>{subtitle}</p>}
      </div>
      <div className={compact ? '' : 'min-h-[240px]'}>{children}</div>
      {legend && (
        <div className='mt-4 flex flex-wrap items-center gap-4'>{legend}</div>
      )}
    </div>
  )
}
