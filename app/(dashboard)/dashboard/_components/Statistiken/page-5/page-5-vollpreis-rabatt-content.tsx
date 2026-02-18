import ChartCard from '../DashboardSection/Chart-card'
import DonutWithLegend from '../page-2/donut-with-legend'
import UmsatzVollpreisRabattChart from './umsatz-vollpreis-rabatt-chart'
import VollpreisquoteWocheChart from './vollpreisquote-woche-chart'
import { RABATTVERTEILUNG } from '../data/page-5-data'

export default function Page5VollpreisRabattContent () {
  return (
    <section
      className='mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6'
      aria-label='Vollpreis vs. Rabatt'
    >
      <ChartCard
        title='Umsatz: Vollpreis vs. Rabatt'
        subtitle='Monatliche Aufteilung - Stacked Bars'
      >
        <UmsatzVollpreisRabattChart />
      </ChartCard>
      <ChartCard title='Rabattverteilung' subtitle='Anteil nach Rabattbereich'>
        <DonutWithLegend data={RABATTVERTEILUNG} />
      </ChartCard>
      <div className='lg:col-span-2'>
        <ChartCard
          title='Vollpreisquote pro Woche'
          subtitle='Letzter Monat - Anteil Vollpreis vs. Rabatt (%)'
        >
          <VollpreisquoteWocheChart />
        </ChartCard>
      </div>
    </section>
  )
}
