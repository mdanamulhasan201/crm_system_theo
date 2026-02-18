
import DonutWithLegend from '../page-2/donut-with-legend'
import LagerwertEntwicklungChart from './lagerwert-entwicklung-chart'
import AusgabenHorizontalBarChart from './ausgaben-horizontal-bar-chart'
import AusgabenZeitreiheChart from './ausgaben-zeitreihe-chart'
import {
  LAGERWERT_NACH_KATEGORIE,
  AUSGABEN_NACH_KATEGORIE,
  AUSGABEN_NACH_LIEFERANT,
  LAGERWERT_NACH_LIEFERANT
} from '../data/page-4-data'
import ChartCard from '../DashboardSection/Chart-card'

export default function Page4UebersichtContent () {
  return (
    <section
      className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6'
      aria-label='Übersicht Charts'
    >
      <ChartCard
        title='Lagerwert-Entwicklung'
        subtitle='Aktuell vs. Vorperiode'
      >
        <LagerwertEntwicklungChart />
      </ChartCard>
      <ChartCard title='Lagerwert nach Kategorie' subtitle='Verteilung'>
        <DonutWithLegend data={LAGERWERT_NACH_KATEGORIE} />
      </ChartCard>
      <ChartCard
        title='Ausgaben nach Kategorie'
        subtitle='Im gewählten Zeitraum'
      >
        <AusgabenHorizontalBarChart
          data={AUSGABEN_NACH_KATEGORIE}
          barColor='#2563eb'
          maxDomain={6}
        />
      </ChartCard>
      <ChartCard
        title='Ausgaben nach Lieferant'
        subtitle='Top-Lieferanten nach Einkaufswert'
      >
        <AusgabenHorizontalBarChart
          data={AUSGABEN_NACH_LIEFERANT}
          barColor='#36A866'
          maxDomain={6}
        />
      </ChartCard>
      <ChartCard title='Ausgaben-Zeitreihe' subtitle='Monatliche Entwicklung'>
        <AusgabenZeitreiheChart />
      </ChartCard>
      <ChartCard title='Lagerwert nach Lieferant' subtitle='Verteilung'>
        <DonutWithLegend data={LAGERWERT_NACH_LIEFERANT} />
      </ChartCard>
    </section>
  )
}
