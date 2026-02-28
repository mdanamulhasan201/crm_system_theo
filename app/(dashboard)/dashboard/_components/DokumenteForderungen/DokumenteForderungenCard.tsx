'use client'

import React from 'react'
import {
  Wallet,
  AlertTriangle,
  Clock,
  FileCheck,
  FileText,
  Truck,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CARDS: {
  label: string
  value: string
  icon: LucideIcon
  valueClassName?: string
  iconClassName?: string
}[] = [
  {
    label: 'OFFENE FORDERUNGEN',
    value: '15.620,00 €',
    icon: Wallet,
    iconClassName: 'text-gray-400',
  },
  {
    label: 'ÜBERFÄLLIG',
    value: '8.170,00 €',
    icon: AlertTriangle,
    valueClassName: 'text-red-600',
    iconClassName: 'text-orange-400',
  },
  {
    label: 'TEILWEISE BEZAHLT',
    value: '1',
    icon: Clock,
    iconClassName: 'text-gray-400',
  },
  {
    label: 'BEZAHLT (MONAT)',
    value: '6.200,00 €',
    icon: FileCheck,
    iconClassName: 'text-green-500',
  },
  {
    label: 'DOKUMENTE GESAMT',
    value: '15',
    icon: FileText,
    iconClassName: 'text-gray-400',
  },
  {
    label: 'OFFENE LIEFERSCHEINE',
    value: '2',
    icon: Truck,
    iconClassName: 'text-gray-400',
  },
]

function SingleCard({
  label,
  value,
  icon: Icon,
  valueClassName,
  iconClassName,
}: {
  label: string
  value: string
  icon: LucideIcon
  valueClassName?: string
  iconClassName?: string
}) {
  return (
    <div className="relative flex min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={cn('absolute right-4 top-4', iconClassName)}>
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <span className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span
        className={cn(
          'text-xl font-bold text-gray-900 sm:text-2xl',
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  )
}

export default function DokumenteForderungenCard() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
      {CARDS.map((card, index) => (
        <SingleCard
          key={index}
          label={card.label}
          value={card.value}
          icon={card.icon}
          valueClassName={card.valueClassName}
          iconClassName={card.iconClassName}
        />
      ))}
    </div>
  )
}
