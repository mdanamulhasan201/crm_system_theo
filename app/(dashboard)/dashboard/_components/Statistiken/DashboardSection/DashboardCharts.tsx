





import ChartCard from './Chart-card'
import TopProdukte from './Top-produkte'
import UeberfaelligeAuftraege from './ueberfaellige-auftraege'
import UmsatzVsKostenChart from '../Chart/umsatz-vs-kosten'
import KostenstrukturChart from '../Chart/kostenstruktur'
import UmsatzNachBereichChart from '../Chart/umsatz-nach-bereich'
import VollpreisVsRabattChart from '../Chart/vollpreis-vs-rabatt'

const CHART_GRID_CLASS = 'grid grid-cols-1 lg:grid-cols-2 gap-6'

export default function DashboardCharts () {
  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6 mb-6'>
        <ChartCard title='Umsatz vs. Kosten' subtitle='Monatlicher Verlauf'>
          <UmsatzVsKostenChart />
        </ChartCard>
        <ChartCard
          title='Kostenstruktur'
          subtitle='Verteilung der Gesamtkosten'
        >
          <KostenstrukturChart />
        </ChartCard>
      </div>
      <section className={CHART_GRID_CLASS}>
        <ChartCard
          title='Umsatz nach Bereich'
          subtitle='Umsatz und Deckungsbeitrag'
        >
          <UmsatzNachBereichChart />
        </ChartCard>
        <ChartCard
          title='Vollpreis vs. Rabatt'
          subtitle='Wöchentliche Verteilung'
        >
          <VollpreisVsRabattChart />
        </ChartCard>
      </section>

      {/* Top-Produkte & Überfällige Aufträge */}
      <section
        className={`${CHART_GRID_CLASS} mt-6`}
        aria-label='Top-Produkte und überfällige Aufträge'
      >
        <ChartCard
          title='Top-Produkte'
          subtitle='Nach Umsatz & Deckungsbeitrag'
          compact
        >
          <TopProdukte />
        </ChartCard>
        <ChartCard
          title='Überfällige Aufträge'
          subtitle='SLA/Deadline-Monitoring'
          compact
        >
          <UeberfaelligeAuftraege />
        </ChartCard>
      </section>
    </>
  )
}
