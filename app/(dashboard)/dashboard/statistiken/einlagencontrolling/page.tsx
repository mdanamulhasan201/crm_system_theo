import ChartCard from '../../_components/Statistiken/DashboardSection/Chart-card'
import { FERTIGUNG_ABHOLTERMIN, LIEGEZEIT_NACH_FERTIGSTELLUNG, REKLAMATION_FERTIGUNG, REKLAMATION_VERSORGUNG } from '../../_components/Statistiken/data/page-2-data'
import BestellstatusVerteilungChart from '../../_components/Statistiken/page-2/bestellstatus-verteilung-chart'
import BottleneckDonutChart from '../../_components/Statistiken/page-2/bottleneck-donut-chart'
import DonutWithLegend from '../../_components/Statistiken/page-2/donut-with-legend'
import EinlagenkategorieTop3Chart from '../../_components/Statistiken/page-2/einlagenkategorie-top3-chart'
import EmployeeStatsCards from '../../_components/Statistiken/page-2/employee-stats-cards'
import GesamtkostenProEinlageCard from '../../_components/Statistiken/page-2/gesamtkosten-pro-einlage-card'
import GesamtkostenUmsatzChart from '../../_components/Statistiken/page-2/gesamtkosten-umsatz-chart'
import GesamtkostenUmsatzMonatChart from '../../_components/Statistiken/page-2/gesamtkosten-umsatz-monat-chart'
import KostenGewinnAnalyse from '../../_components/Statistiken/page-2/kosten-gewinn-analyse'
import KostenTable from '../../_components/Statistiken/page-2/kosten-table'
import NacharbeitsquoteKpi from '../../_components/Statistiken/page-2/nacharbeitsquote-kpi'
import Page2Kpis from '../../_components/Statistiken/page-2/page-2-kpis'
import ProduktivitatNacharbeitChart from '../../_components/Statistiken/page-2/produktivitat-nacharbeit-chart'
import ProzessDauerChart from '../../_components/Statistiken/page-2/prozess-dauer-chart'
import ReklamationsquoteMitarbeiter from '../../_components/Statistiken/page-2/reklamationsquote-mitarbeiter'
import SportShareChart from '../../_components/Statistiken/page-2/sport-share-chart'
import ZeitQualitaetChart from '../../_components/Statistiken/page-2/zeit-qualitaet-chart'


export default function Einlagencontrolling() {
    return (
        <div className='container py-6'>
            {/* Top: KPI cards */}
            <section className='mb-6' aria-label='Kennzahlen'>
                <Page2Kpis />
            </section>

            {/* Middle: Cost & profit chart (35%) + data table (65%) */}
            <section
                className='grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-6 mb-6'
                aria-label='Kosten- und Gewinnanalyse'
            >
                <ChartCard title='Kosten- & Gewinnanalyse'>
                    <KostenGewinnAnalyse />
                </ChartCard>
                <ChartCard title='Detailtabelle'>
                    <KostenTable />
                </ChartCard>
            </section>

            {/* Bottom: extensible grid – add more components in the right column or new rows as needed */}
            <section
                className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6'
                aria-label='Mitarbeiter und weitere Auswertungen'
            >
                <ChartCard title='Zeit vs. Qualität je Mitarbeiter'>
                    <ZeitQualitaetChart />
                </ChartCard>
                <div className='grid grid-cols-1 gap-4 content-start'>
                    <EmployeeStatsCards />
                    {/* Add more components here – they stack vertically in this column */}
                </div>
            </section>

            {/* Nacharbeitsanalyse */}
            <section className='mt-6' aria-label='Nacharbeitsanalyse'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                    Nacharbeitsanalyse
                </h2>
                <div className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6'>
                    <div className='grid grid-cols-1 gap-6'>
                        <ChartCard title='Produktivität vs. Nacharbeit'>
                            <ProduktivitatNacharbeitChart />
                        </ChartCard>
                        <ChartCard title='Gesamtkosten vs. Umsatz'>
                            <GesamtkostenUmsatzChart />
                        </ChartCard>
                    </div>
                    <div className='grid grid-cols-1 gap-4 content-start'>
                        <NacharbeitsquoteKpi />
                        <ReklamationsquoteMitarbeiter
                            title='Reklamationsquote je Mitarbeiter Versorgung'
                            data={REKLAMATION_VERSORGUNG}
                        />
                        <ReklamationsquoteMitarbeiter
                            title='Reklamationsquote je Mitarbeiter Fertigung'
                            data={REKLAMATION_FERTIGUNG}
                        />
                    </div>
                </div>
            </section>
            {/* Gesamtkosten pro Monat */}
            <section className='mt-8' aria-label='Gesamtkosten pro Monat'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                    Gesamtkosten pro Monat
                </h2>
                <div className='grid grid-cols-1 gap-6'>
                    <ChartCard title='Gesamtkosten vs. Umsatz'>
                        <GesamtkostenUmsatzMonatChart />
                    </ChartCard>
                    <div className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6'>
                        <ChartCard title='Bestellstatus-Verteilung'>
                            <BestellstatusVerteilungChart />
                        </ChartCard>
                        <GesamtkostenProEinlageCard />
                    </div>
                </div>
            </section>
            {/* Durchschnittliche Dauer je Prozess */}
            <section className='mt-8' aria-label='Durchschnittliche Dauer je Prozess'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                    Durchschnittliche Dauer je Prozess
                </h2>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                    <ChartCard title='Example Heading'>
                        <ProzessDauerChart />
                    </ChartCard>
                    <ChartCard title='Bottleneck'>
                        <BottleneckDonutChart />
                    </ChartCard>
                    <ChartCard title='Gesamtkosten vs. Umsatz'>
                        <GesamtkostenUmsatzChart />
                    </ChartCard>
                </div>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <ChartCard title='Einlagenkategorie (Top 3) – Letzte 30 Tage'>
                        <EinlagenkategorieTop3Chart />
                    </ChartCard>
                    <ChartCard title='Sport Share of purchases'>
                        <SportShareChart />
                    </ChartCard>
                </div>
            </section>

            {/* Fertigung & Liegezeit donuts */}
            <section className='mt-8' aria-label='Fertigung und Liegezeit'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <ChartCard title='Fertigung bis Abholtermin'>
                        <DonutWithLegend data={FERTIGUNG_ABHOLTERMIN} />
                    </ChartCard>
                    <ChartCard title='Liegezeit nach Fertigstellung'>
                        <DonutWithLegend data={LIEGEZEIT_NACH_FERTIGSTELLUNG} />
                    </ChartCard>
                </div>
            </section>
        </div>
    )
}
