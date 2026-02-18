import Page4Alerts from "../../_components/Statistiken/page-4/page-4-alerts";
import Page4Kpis from "../../_components/Statistiken/page-4/page-4-kpis";
import Page4NavContent from "../../_components/Statistiken/page-4/page-4-nav-content";


export default function LagerOrthopädie () {
  return (
    <div className='container py-6'>
      <header className='mb-4'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Warenwirtschaft &amp; Material-Controlling
        </h1>
        <p className='text-gray-600 text-sm mt-1'>
          Lagerwert, Materialverbrauch, Kapitalbindung und Risiken
        </p>
      </header>

      <section aria-label='Kennzahlen'>
        <Page4Kpis />
      </section>

      <Page4Alerts />
      <Page4NavContent />
    </div>
  )
}
