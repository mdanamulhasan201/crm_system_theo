import { useEffect, useState } from "react";

const tabs = [
  "Versorgungs Start",
  "Leisten Erstellung",
  "Bettungs Erstellung",
  "Halbproben Erstellung",
  "Schaft Erstellung",
  "Boden Erstellung",
  "Geliefert / Abgeschlossen",
];

const ProductionView = ({ tabClicked }: { tabClicked: number }) => {
  const [activeTab, setActiveTab] = useState(tabClicked);

  const tableData = [
    { id: 1, bestellnummer: "#12345", kundenname: "Brugger Theo", status: "In Arbeit", preis: "250", zahlung: "Bezahlt", beschreibung: "Maßschuhe", abholort: "Zürich", fertigstellung: "Offen" },
    { id: 2, bestellnummer: "#12346", kundenname: "Müller Karl", status: "Neu", preis: "180", zahlung: "Offen", beschreibung: "Lederschuhe", abholort: "Basel", fertigstellung: "Offen" },
    { id: 3, bestellnummer: "#12347", kundenname: "Schmidt Emma", status: "Fertig", preis: "300", zahlung: "Bezahlt", beschreibung: "Sportschuhe", abholort: "Bern", fertigstellung: "Erledigt" },
    { id: 4, bestellnummer: "#12348", kundenname: "Keller Max", status: "Produktion", preis: "220", zahlung: "Teilzahlung", beschreibung: "Stiefel", abholort: "Luzern", fertigstellung: "Offen" },
    { id: 5, bestellnummer: "#12349", kundenname: "Bauer Nina", status: "In Verpackung", preis: "260", zahlung: "Bezahlt", beschreibung: "Halbschuhe", abholort: "Genf", fertigstellung: "Erledigt" },
  ];

  useEffect(() => {
    setActiveTab(tabClicked);
  }, [tabClicked]);

  return (
    <div className="w-full mt-6">
      {/* Tabs */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 sm:gap-7 md:gap-8 border-b border-slate-200 mb-5">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`bg-transparent border-none py-2.5 px-1 font-medium text-sm sm:text-base cursor-pointer transition-all duration-300 whitespace-nowrap relative mb-[-1px] ${activeTab === index
                ? "text-emerald-500 font-semibold border-b-2 border-emerald-500"
                : "text-slate-500 border-b-2 border-transparent hover:text-emerald-500"
              }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg w-full">
        <table className="w-full border-collapse text-sm min-w-full">
          <thead>
            <tr className="bg-slate-50 uppercase text-xs font-medium text-slate-500 leading-[18px]">
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Bestellnummer</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Kundenname</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Status</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Preis (€)</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Zahlung</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Beschreibung</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Abholort/Versand</th>
              <th className="text-left py-3 px-2.5 sm:px-3 font-medium whitespace-nowrap">Fertigstellung</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.bestellnummer}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.kundenname}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.status}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.preis}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.zahlung}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.beschreibung}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.abholort}</td>
                <td className="text-left py-4 px-2.5 sm:px-3 text-sm text-slate-600 whitespace-nowrap">{row.fertigstellung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className="bg-white border border-emerald-500 text-emerald-500 rounded-lg px-6 py-3 font-medium text-sm sm:text-base cursor-pointer transition-colors hover:bg-emerald-50"
        >
          Mehr anzeigen
        </button>
      </div>
    </div>
  );
};

export default ProductionView;
