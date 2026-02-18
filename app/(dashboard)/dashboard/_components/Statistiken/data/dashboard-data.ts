/**
 * Dynamic mock data for dashboard charts based on selected period (7, 30, 90 days).
 */

export type PeriodDays = 7 | 30 | 90

function getDateRange(periodDays: number): Date[] {
  const dates: Date[] = []
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    dates.push(d)
  }
  return dates
}

function seed(date: Date): number {
  const s = date.getTime()
  return ((s * 9301 + 49297) % 233280) / 233280
}

export function getUmsatzVsKostenData(periodDays: PeriodDays): {
  dates: Date[]
  umsatz: number[]
  kosten: number[]
} {
  const step = periodDays === 90 ? 5 : 1
  const dates: Date[] = []
  const umsatz: number[] = []
  const kosten: number[] = []
  const range = getDateRange(periodDays)
  for (let i = 0; i < range.length; i += step) {
    const d = range[i]
    dates.push(d)
    const r = seed(d)
    umsatz.push(Math.round(15 + r * 25))
    kosten.push(Math.round(8 + r * 12))
  }
  return { dates, umsatz, kosten }
}

export function getKostenstrukturData(periodDays: PeriodDays): {
  name: string
  y: number
  color: string
}[] {
  const base = [
    { name: 'Material', y: 42, color: '#0b80b7' },
    { name: 'Arbeitszeit', y: 32, color: '#1abc9c' },
    { name: 'Fixkosten', y: 16, color: '#f59f0a' },
    { name: 'Logistik', y: 10, color: '#673ab6' }
  ]
  const shift = periodDays === 7 ? -2 : periodDays === 90 ? 2 : 0
  return base.map((b, i) => ({
    ...b,
    y: Math.max(5, b.y + (i === 0 ? shift : i === 1 ? -shift : 0))
  }))
}

export function getUmsatzNachBereichData(periodDays: PeriodDays): {
  bereich: string
  umsatz: number
  db: number
}[] {
  const scale = periodDays === 7 ? 0.25 : periodDays === 30 ? 1 : 1.3
  const base = [
    { bereich: 'Einlagen', umsatz: 85, db: 52 },
    { bereich: 'Maßschuhe', umsatz: 72, db: 45 },
    { bereich: 'Schuhverkauf', umsatz: 58, db: 28 },
    { bereich: 'Reparaturen', umsatz: 32, db: 18 }
  ]
  return base.map((b) => ({
    ...b,
    umsatz: Math.round(b.umsatz * scale),
    db: Math.round(b.db * scale)
  }))
}

export function getVollpreisVsRabattData(periodDays: PeriodDays): {
  label: string
  vollpreis: number
  rabatt: number
}[] {
  const result: { label: string; vollpreis: number; rabatt: number }[] = []
  if (periodDays === 7) {
    const range = getDateRange(7)
    range.forEach((d, i) => {
      const r = seed(d)
      result.push({
        label: d.toLocaleDateString('de-DE', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit'
        }),
        vollpreis: Math.round(5 + r * 4),
        rabatt: Math.round(1 + r * 2)
      })
    })
  } else if (periodDays === 30) {
    const buckets = 6
    const daysPerBucket = 30 / buckets
    for (let b = 0; b < buckets; b++) {
      const d = new Date()
      d.setDate(d.getDate() - (30 - (b + 1) * daysPerBucket))
      const r = seed(d)
      result.push({
        label: `KW ${b + 1}`,
        vollpreis: Math.round(20 + r * 15),
        rabatt: Math.round(5 + r * 8)
      })
    }
  } else {
    for (let w = 1; w <= 13; w++) {
      const d = new Date()
      d.setDate(d.getDate() - (90 - w * 7))
      const r = seed(d)
      result.push({
        label: `KW ${w}`,
        vollpreis: Math.round(40 + r * 30),
        rabatt: Math.round(10 + r * 15)
      })
    }
  }
  return result
}

export function getTopProdukteData(): {
  produkt: string
  umsatz: number
  db: number
  menge: number
  trend: 'up' | 'down'
}[] {
  return [
    { produkt: 'Sport-Einlage Premium', umsatz: 18200, db: 9800, menge: 142, trend: 'up' },
    { produkt: 'Alltags-Einlage Comfort', umsatz: 15600, db: 8200, menge: 168, trend: 'up' },
    { produkt: 'Maßschuh Business', umsatz: 14800, db: 7400, menge: 12, trend: 'down' },
    { produkt: 'Business-Einlage Slim', umsatz: 12400, db: 6100, menge: 98, trend: 'up' },
    { produkt: 'Diabetiker-Versorgung', umsatz: 11200, db: 5800, menge: 45, trend: 'up' }
  ]
}

export type AuftragStatus = 'Kritisch' | 'Warnung'

export function getUeberfaelligeAuftraegeData(): {
  auftrag: string
  typ: string
  sollDatum: string
  tageUeber: number
  status: AuftragStatus
}[] {
  return [
    { auftrag: 'A-2024-1847', typ: 'Maßschuh', sollDatum: '28.01.2026', tageUeber: 5, status: 'Kritisch' },
    { auftrag: 'A-2024-1852', typ: 'Einlage Sport', sollDatum: '01.02.2026', tageUeber: 3, status: 'Warnung' },
    { auftrag: 'A-2024-1860', typ: 'Maßschuh', sollDatum: '03.02.2026', tageUeber: 1, status: 'Warnung' }
  ]
}
