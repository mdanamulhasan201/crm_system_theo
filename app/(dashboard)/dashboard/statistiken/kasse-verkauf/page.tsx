import Page5Alerts from "../../_components/Statistiken/page-5/page-5-alerts";
import Page5Kpis from "../../_components/Statistiken/page-5/page-5-kpis";
import Page5NavContent from "../../_components/Statistiken/page-5/page-5-nav-content";


export default function kasseVerkauf () {
  return (
    <div className='container py-6'>
      <header className='mb-4'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Kasse &amp; Verkauf
        </h1>
        <p className='text-gray-600 text-sm mt-1'>
          Vollpreis vs. Rabatt, Margenanalyse und Umsatzverteilung
        </p>
      </header>

      <section aria-label='Kennzahlen'>
        <Page5Kpis />
      </section>

      <Page5Alerts />
      <Page5NavContent />
    </div>
  )
}
