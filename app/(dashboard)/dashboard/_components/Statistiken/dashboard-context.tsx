'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'

export const PERIOD_OPTIONS = [
  { days: 7, label: 'Letzte 7 Tage' },
  { days: 30, label: 'Letzte 30 Tage' },
  { days: 90, label: 'Letzte 90 Tage' }
] as const

export type PeriodDays = typeof PERIOD_OPTIONS[number]['days']

function formatDateRange (days: number): string {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  const fmt = (d: Date) =>
    d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  return `${fmt(start)} – ${fmt(end)}`
}

type DashboardContextValue = {
  periodDays: PeriodDays
  setPeriodDays: (days: PeriodDays) => void
  dateRangeLabel: string
  periodLabel: string
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard () {
  const ctx = useContext(DashboardContext)
  if (!ctx)
    throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}

export function DashboardProvider ({ children }: { children: ReactNode }) {
  const [periodDays, setPeriodDaysState] = useState<PeriodDays>(30)

  const setPeriodDays = useCallback((days: PeriodDays) => {
    setPeriodDaysState(days)
  }, [])

  const value = useMemo(
    () => ({
      periodDays,
      setPeriodDays,
      dateRangeLabel: formatDateRange(periodDays),
      periodLabel:
        PERIOD_OPTIONS.find(o => o.days === periodDays)?.label ??
        'Letzte 30 Tage'
    }),
    [periodDays, setPeriodDays]
  )

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
