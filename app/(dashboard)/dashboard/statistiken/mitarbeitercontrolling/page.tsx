import AbwesenheitCard from "../../_components/Statistiken/page-3/abwesenheit-card";
import AbwesenheitVsProduktivitaetChart from "../../_components/Statistiken/page-3/abwesenheit-vs-produktivitaet-chart";
import AbwesenheitsquoteCalendarCard from "../../_components/Statistiken/page-3/abwesenheitsquote-calendar-card";
import AbwesenheitsquoteKpiCard from "../../_components/Statistiken/page-3/abwesenheitsquote-kpi-card";
import AufgabenverteilungCard from "../../_components/Statistiken/page-3/aufgabenverteilung-card";
import BestellstatusAbwesenheitChart from "../../_components/Statistiken/page-3/bestellstatus-abwesenheit-chart";
import DauerArbeitsschrittChart from "../../_components/Statistiken/page-3/dauer-arbeitsschritt-chart";
import LieferungenVorTermCard from "../../_components/Statistiken/page-3/lieferungen-vor-term-card";
import MiddleLeftCard from "../../_components/Statistiken/page-3/middle-left-card";
import OnTimeWahrscheinlichkeitCard from "../../_components/Statistiken/page-3/on-time-wahrscheinlichkeit-card";
import Page3Kpis from "../../_components/Statistiken/page-3/page-3-kpis";
import ProduktionAbwesenheitChart from "../../_components/Statistiken/page-3/produktion-abwesenheit-chart";
import ProduktionsstundenFertigungenChart from "../../_components/Statistiken/page-3/produktionsstunden-fertigungen-chart";
import SkillAuswertungChart from "../../_components/Statistiken/page-3/skill-auswertung-chart";
import SkillHighlights from "../../_components/Statistiken/page-3/skill-highlights";
import UberstundenStatistikCard from "../../_components/Statistiken/page-3/uberstunden-statistik-card";
import UeberdurchschnittlichJuliChart from "../../_components/Statistiken/page-3/ueberdurchschnittlich-juli-chart";


export default function Mitarbeitercontrolling () {
  return (
    <div className='container py-6'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Mitarbeiter – Produktionsübersicht
        </h1>
      </header>

      {/* Top: KPI cards */}
      <section className='mb-6' aria-label='Kennzahlen'>
        <Page3Kpis />
      </section>

      {/* Middle: 3 cards – left narrow, center wide (Aufgabenverteilung), right narrow */}
      <section
        className='grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6 mb-6'
        aria-label='Aufgabenverteilung'
      >
        <MiddleLeftCard />
        <AufgabenverteilungCard />
        <AbwesenheitCard />
      </section>

      {/* Skill-Auswertung */}
      <section className='mt-6' aria-label='Skill-Auswertung'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
          <h2 className='text-xl font-bold text-gray-900'>Skill-Auswertung</h2>
          <button
            type='button'
            className='px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700'
          >
            Monat
          </button>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6'>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <SkillAuswertungChart />
          </div>
          <SkillHighlights />
        </div>
      </section>

      {/* Produktion, Abwesenheit, Überstunden */}
      <section className='mt-8' aria-label='Produktion und Abwesenheit'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <h3 className='font-bold text-gray-900 text-base mb-4'>
              Produktionsstunden und Fertigungen pro Monat
            </h3>
            <ProduktionsstundenFertigungenChart />
          </div>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <h3 className='font-bold text-gray-900 text-base mb-4'>
              Produktion, Abwesenheit
            </h3>
            <ProduktionAbwesenheitChart />
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <AbwesenheitsquoteKpiCard />
          <AbwesenheitsquoteCalendarCard />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <h3 className='font-bold text-gray-900 text-base mb-4'>
              Bestellstatus-Verteilung
            </h3>
            <BestellstatusAbwesenheitChart />
          </div>
          <UberstundenStatistikCard />
        </div>
      </section>

      {/* Bottom: Überdurchschnittlich, Abwesenheit vs Produktivität, Dauer, On-time, Lieferungen */}
      <section className='mt-8' aria-label='Auswertung und KPIs'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <h3 className='font-bold text-gray-900 text-base mb-4'>
              Überdurchschnittlich im Juli (3%)
            </h3>
            <UeberdurchschnittlichJuliChart />
          </div>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <h3 className='font-bold text-gray-900 text-base mb-4'>
              Abwesenheit vs. Produktivität
            </h3>
            <AbwesenheitVsProduktivitaetChart />
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          <div className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'>
            <h3 className='font-bold text-gray-900 text-base mb-4'>
              Dauer pro Arbeitsschritt (Soll vs. Ist)
            </h3>
            <DauerArbeitsschrittChart />
          </div>
          <div className='flex flex-col gap-6'>
            <OnTimeWahrscheinlichkeitCard />
            <LieferungenVorTermCard />
          </div>
        </div>
      </section>
    </div>
  )
}
