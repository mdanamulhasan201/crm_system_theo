'use client'

import React, { useEffect, useState } from 'react'
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
import { getCardDataCalculation } from '@/apis/warenwirtschaftApis'

type CardCalculationData = {
  outstandingClaim: number
  overdue: number
  partiallyPaid: number
  paidMonth: number
  totalDocuments: number
  openDeliveryNotes: number
}

const CARDS: {
  label: string
  icon: LucideIcon
  valueClassName?: string
  iconClassName?: string
  key: keyof CardCalculationData
  isCurrency?: boolean
}[] = [
  {
    label: 'OFFENE FORDERUNGEN',
    icon: Wallet,
    iconClassName: 'text-gray-400',
    key: 'outstandingClaim',
    isCurrency: true,
  },
  {
    label: 'ÜBERFÄLLIG',
    icon: AlertTriangle,
    valueClassName: 'text-red-600',
    iconClassName: 'text-orange-400',
    key: 'overdue',
    isCurrency: true,
  },
  {
    label: 'TEILWEISE BEZAHLT',
    icon: Clock,
    iconClassName: 'text-gray-400',
    key: 'partiallyPaid',
  },
  {
    label: 'BEZAHLT (MONAT)',
    icon: FileCheck,
    iconClassName: 'text-green-500',
    key: 'paidMonth',
    isCurrency: true,
  },
  {
    label: 'DOKUMENTE GESAMT',
    icon: FileText,
    iconClassName: 'text-gray-400',
    key: 'totalDocuments',
  },
  {
    label: 'OFFENE LIEFERSCHEINE',
    icon: Truck,
    iconClassName: 'text-gray-400',
    key: 'openDeliveryNotes',
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
  const [data, setData] = useState<CardCalculationData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await getCardDataCalculation()
        const payload = res?.data ?? res
        if (payload) {
          setData(payload as CardCalculationData)
        }
      } catch {
        // ignore and keep fallback values
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
      {CARDS.map((card, index) => {
        let value = '-'

        if (data) {
          const raw = data[card.key]
          if (typeof raw === 'number') {
            value = card.isCurrency ? formatCurrency(raw) : String(raw)
          }
        }

        return (
          <SingleCard
            key={index}
            label={card.label}
            value={value}
            icon={card.icon}
            valueClassName={card.valueClassName}
            iconClassName={card.iconClassName}
          />
        )
      })}
    </div>
  )
}
