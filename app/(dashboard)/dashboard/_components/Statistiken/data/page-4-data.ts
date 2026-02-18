/**
 * Mock data for page-4 (Warenwirtschaft & Material-Controlling)
 */

export const PAGE4_KPIS = [
  { title: 'Lagerwert gesamt', value: '84.6k €', trend: '+6.6%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Lagerwert Δ Vormonat', value: '6.6%', trend: '+106.2%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Einkaufswert Zeitraum', value: '18.4k €', trend: '+9.5%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Materialverbrauch (€)', value: '14.2k €', trend: '+4.4%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Ø Lagerwert', value: '81.2k €', trend: '+3.3%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Overstock-Wert', value: '12.5k €', trend: '+12.1%', trendLabel: 'vs. Vorperiode', isPositive: false },
  { title: 'Dead-Stock-Wert', value: '5.8k €', trend: '+19.2%', trendLabel: 'vs. Vorperiode', isPositive: false }
] as const

export const PAGE4_ALERTS = [
  'Dead Stock bindet 5.840 € Kapital - 7% des Gesamtlagerwerts.',
  'Overstock bei EVA Shore 40: 32 Platten über Soll (+1.984 €).',
  'Top Kosten-Treiber: EVA Shore 40 - 29% des Materialverbrauchs (Pareto).'
] as const

export const PAGE4_NAV_TABS = [
  'Übersicht',
  'Einkäufe',
  'Lieferanten',
  'Dead Stock',
  'Overstock',
  'Verbrauch'
] as const

export type Page4NavTab = (typeof PAGE4_NAV_TABS)[number]

/** Lagerwert-Entwicklung: line chart, Aktuell (blue) vs Vorperiode (orange dashed) */
export const LAGERWERT_ENTWICKLUNG = [
  { month: 'Jul', aktuell: 78, vorperiode: 72 },
  { month: 'Aug', aktuell: 80, vorperiode: 74 },
  { month: 'Sep', aktuell: 82, vorperiode: 76 },
  { month: 'Okt', aktuell: 81, vorperiode: 78 },
  { month: 'Nov', aktuell: 83, vorperiode: 77 },
  { month: 'Dez', aktuell: 85, vorperiode: 79 },
  { month: 'Jan', aktuell: 84, vorperiode: 80 },
  { month: 'Feb', aktuell: 86, vorperiode: 82 }
] as const

/** Lagerwert nach Kategorie – donut */
export const LAGERWERT_NACH_KATEGORIE = [
  { name: 'Leder', value: 28, color: '#2563eb' },
  { name: 'EVA/Schaum', value: 24, color: '#36A866' },
  { name: 'Kork', value: 18, color: '#f97316' },
  { name: 'Kleber', value: 14, color: '#8b5cf6' },
  { name: 'Zubehör', value: 10, color: '#ef4444' },
  { name: 'Sonstiges', value: 6, color: '#4b5563' }
] as const

/** Ausgaben nach Kategorie – horizontal bar (values in k) */
export const AUSGABEN_NACH_KATEGORIE = [
  { name: 'Leder', value: 5.2 },
  { name: 'EVA/Schaum', value: 4.1 },
  { name: 'Kork', value: 2.8 },
  { name: 'Kleber', value: 2.2 },
  { name: 'Zubehör', value: 1.5 },
  { name: 'Textil', value: 1.2 },
  { name: 'Sohlen', value: 0.9 }
] as const

/** Ausgaben nach Lieferant – horizontal bar (values in k) */
export const AUSGABEN_NACH_LIEFERANT = [
  { name: 'Orthopädie Müller', value: 5.5 },
  { name: 'Lederwelt GmbH', value: 4.2 },
  { name: 'SchaumTech', value: 2.8 },
  { name: 'Renia Kleber', value: 2.1 },
  { name: 'KorkNatur', value: 1.4 },
  { name: 'Sonstige', value: 2.0 }
] as const

/** Ausgaben-Zeitreihe – area chart (monthly, values in k) */
export const AUSGABEN_ZEITREIHE = [
  { month: 'Jul', value: 14 },
  { month: 'Aug', value: 16 },
  { month: 'Sep', value: 12 },
  { month: 'Okt', value: 18 },
  { month: 'Nov', value: 15 },
  { month: 'Dez', value: 19 },
  { month: 'Jan', value: 17 },
  { month: 'Feb', value: 16 }
] as const

/** Lagerwert nach Lieferant – donut */
export const LAGERWERT_NACH_LIEFERANT = [
  { name: 'Orthopädie Müller', value: 32, color: '#2563eb' },
  { name: 'Lederwelt GmbH', value: 28, color: '#36A866' },
  { name: 'SchaumTech', value: 18, color: '#f97316' },
  { name: 'Renia Kleber', value: 14, color: '#8b5cf6' },
  { name: 'Sonstige', value: 8, color: '#ef4444' }
] as const

/** Einkäufe tab – 3 KPIs */
export const EINKAUEFE_KPIS = [
  { title: 'Gesamt-Ausgaben', value: '18.4k €', sub: '9.5% vs. Vorperiode', trendUp: true, icon: 'cart' },
  { title: 'Ø Ausgaben/Monat', value: '15.7k €', sub: '', trendUp: false, icon: 'bar' },
  { title: 'Top-Ausgabenmonat', value: '18.8k €', sub: '', trendUp: false, icon: 'line' }
] as const

/** Einkäufe tab – Wareneingänge table */
export const WARENEINGAENGE = [
  { datum: '06.02.2026', lieferant: 'Orthopädie Müller', artikel: 'EVA Shore 40', menge: '20', einheit: 'Platten', wert: '1.240 €', kategorie: 'EVA/Schaum' },
  { datum: '04.02.2026', lieferant: 'Lederwelt GmbH', artikel: 'Oberleder Nappa sw.', menge: '12', einheit: 'm²', wert: '1.680 €', kategorie: 'Leder' },
  { datum: '02.02.2026', lieferant: 'Renia Kleber', artikel: 'Colle de Cologne', menge: '5', einheit: 'Liter', wert: '185 €', kategorie: 'Kleber' },
  { datum: '31.01.2026', lieferant: 'KorkNatur', artikel: 'Korkrohlinge 3mm', menge: '100', einheit: 'Stück', wert: '620 €', kategorie: 'Kork' },
  { datum: '29.01.2026', lieferant: 'SchaumTech', artikel: 'PU-Schaum Soft', menge: '15', einheit: 'Platten', wert: '870 €', kategorie: 'EVA/Schaum' },
  { datum: '27.01.2026', lieferant: 'Lederwelt GmbH', artikel: 'Bezugsstoff beige', menge: '30', einheit: 'Meter', wert: '420 €', kategorie: 'Textil' },
  { datum: '25.01.2026', lieferant: 'Orthopädie Müller', artikel: 'Futterleder braun', menge: '8', einheit: 'm²', wert: '920 €', kategorie: 'Leder' },
  { datum: '22.01.2026', lieferant: 'SchaumTech', artikel: 'Pelotten-Pads', menge: '200', einheit: 'Stück', wert: '340 €', kategorie: 'Zubehör' }
] as const

/** Lieferanten tab – table (Einkaufswert, Anteil, Lieferungen, Ø Preis/Einheit, Trend) */
export const LIEFERANTEN_UEBERSICHT = [
  { lieferant: 'Orthopädie Müller', einkaufswert: '28.400 €', anteil: '32%', lieferungen: 24, oPreisEinheit: '68 €', trend: 'stabil' as const },
  { lieferant: 'Lederwelt GmbH', einkaufswert: '21.200 €', anteil: '24%', lieferungen: 18, oPreisEinheit: '142 €', trend: 'steigend' as const },
  { lieferant: 'SchaumTech', einkaufswert: '15.800 €', anteil: '18%', lieferungen: 22, oPreisEinheit: '58 €', trend: 'stabil' as const },
  { lieferant: 'Renia Kleber', einkaufswert: '12.400 €', anteil: '14%', lieferungen: 12, oPreisEinheit: '37 €', trend: 'steigend' as const },
  { lieferant: 'KorkNatur', einkaufswert: '10.600 €', anteil: '12%', lieferungen: 8, oPreisEinheit: '6.20 €', trend: 'sinkend' as const }
] as const

/** Lieferanten tab – donut "Lieferanten-Abhängigkeit" (Anteil am Gesamteinkauf) */
export const LIEFERANTEN_ABHAENGIGKEIT = [
  { name: 'Orthopädie Müller', value: 32, color: '#2563eb' },
  { name: 'Lederwelt GmbH', value: 24, color: '#36A866' },
  { name: 'SchaumTech', value: 18, color: '#f97316' },
  { name: 'Renia Kleber', value: 14, color: '#8b5cf6' },
  { name: 'Sonstige', value: 12, color: '#ef4444' }
] as const

/** Lieferanten tab – line chart Preisentwicklung (Ø Preis pro Einheit über Zeit) */
export const PREISENTWICKLUNG = [
  { month: 'Sep', orthMuller: 64, lederwelt: 138, schaumTech: 56, renia: 35 },
  { month: 'Okt', orthMuller: 65, lederwelt: 140, schaumTech: 55, renia: 36 },
  { month: 'Nov', orthMuller: 66, lederwelt: 141, schaumTech: 57, renia: 35 },
  { month: 'Dez', orthMuller: 67, lederwelt: 142, schaumTech: 58, renia: 36 },
  { month: 'Jan', orthMuller: 68, lederwelt: 142, schaumTech: 58, renia: 37 },
  { month: 'Feb', orthMuller: 68, lederwelt: 142, schaumTech: 58, renia: 37 }
] as const

/** Dead Stock tab – 3 KPIs */
export const DEAD_STOCK_KPIS = [
  { title: 'Dead-Stock-Wert', value: '5.8k €', sub: '19.2% vs. Vorperiode', trendUp: true, icon: 'box' as const },
  { title: 'Anzahl Dead-Stock-Artikel', value: '7', sub: '', trendUp: false, icon: 'triangle' as const },
  { title: 'Anteil am Lagerwert', value: '6.9%', sub: '', trendUp: false, icon: 'percent' as const }
] as const

/** Dead Stock tab – trend (area chart, values in k) */
export const DEAD_STOCK_TREND = [
  { month: 'Sep', value: 3.3 },
  { month: 'Okt', value: 3.4 },
  { month: 'Nov', value: 3.5 },
  { month: 'Dez', value: 3.7 },
  { month: 'Jan', value: 3.8 },
  { month: 'Feb', value: 3.9 }
] as const

/** Dead Stock tab – alert text (values injected in component) */
export const DEAD_STOCK_ALERT = '7 Artikel ohne Bewegung seit über 84 Tagen. Gesamtwert: 5.840 €. Prüfen Sie Verwertung oder Abschreibung.'

/** Dead Stock tab – filter options (min days without movement) */
export const DEAD_STOCK_FILTER_DAYS = [30, 60, 90] as const

/** Dead Stock tab – table rows (tageOhne used for filtering) */
export const DEAD_STOCK_ARTIKEL = [
  { artikel: 'Leder Reptiloptik blau', kategorie: 'Leder', lagerwert: '1.840 €', lagerwertNum: 1840, letzteBewegung: '14.08.2025', tageOhne: 180 },
  { artikel: 'EVA Shore 70 extra', kategorie: 'EVA/Schaum', lagerwert: '960 €', lagerwertNum: 960, letzteBewegung: '22.09.2025', tageOhne: 141 },
  { artikel: 'Kork-Latex Kombi', kategorie: 'Kork', lagerwert: '720 €', lagerwertNum: 720, letzteBewegung: '05.10.2025', tageOhne: 128 },
  { artikel: 'Schnürsenkel gewachst', kategorie: 'Zubehör', lagerwert: '280 €', lagerwertNum: 280, letzteBewegung: '18.11.2025', tageOhne: 84 },
  { artikel: 'Futterleder anthrazit', kategorie: 'Leder', lagerwert: '920 €', lagerwertNum: 920, letzteBewegung: '25.11.2025', tageOhne: 72 },
  { artikel: 'PU-Schaum 5mm', kategorie: 'EVA/Schaum', lagerwert: '640 €', lagerwertNum: 640, letzteBewegung: '02.12.2025', tageOhne: 58 },
  { artikel: 'Kleber Flex', kategorie: 'Kleber', lagerwert: '480 €', lagerwertNum: 480, letzteBewegung: '15.12.2025', tageOhne: 45 }
] as const

/** Overstock tab – 3 KPIs */
export const OVERSTOCK_KPIS = [
  { title: 'Overstock-Wert', value: '12.5k €', sub: '-12.1% vs. Vorperiode', trendDown: true, icon: 'trash' as const },
  { title: 'Betroffene Artikel', value: '5', sub: '', trendDown: false, icon: 'triangle' as const },
  { title: 'Top-Kategorie', value: '4.3k €', sub: '', trendDown: false, icon: 'stack' as const }
] as const

/** Overstock tab – bar chart by category (values in k) */
export const OVERSTOCK_NACH_KATEGORIE = [
  { name: 'EVA/Schaum', value: 4.0 },
  { name: 'Kork', value: 3.1 },
  { name: 'Zubehör', value: 2.0 },
  { name: 'Textil', value: 1.0 },
  { name: 'Kleber', value: 0.5 }
] as const

/** Overstock tab – table rows */
export const OVERSTOCK_ARTIKEL = [
  { artikel: 'EVA Shore 40', kategorie: 'EVA/Schaum', bestand: '62', sollbestand: '30', ueberbestand: '+32', wert: '1.984 €' },
  { artikel: 'Korkrohlinge 3mm', kategorie: 'Kork', bestand: '380', sollbestand: '200', ueberbestand: '+180', wert: '1.116 €' },
  { artikel: 'Pelotten-Pads', kategorie: 'Zubehör', bestand: '520', sollbestand: '300', ueberbestand: '+220', wert: '374 €' },
  { artikel: 'Bezugsstoff beige', kategorie: 'Textil', bestand: '85', sollbestand: '40', ueberbestand: '+45', wert: '630 €' },
  { artikel: 'Colle de Cologne', kategorie: 'Kleber', bestand: '12', sollbestand: '5', ueberbestand: '+7', wert: '259 €' }
] as const

/** Verbrauch tab – Consumption Analytics KPIs (trend: optional, isPositive for color) */
export const VERBRAUCH_KPIS = [
  { title: 'Total Consumption', value: '1.481,57 €', trend: '-5.0%', trendLabel: 'vs previous period', isPositive: false },
  { title: 'Insoles Production', value: '183,97 €', trend: '-66.4%', trendLabel: 'vs previous period', isPositive: false },
  { title: 'Custom Shoes', value: '594,65 €', trend: '+1530.4%', trendLabel: 'vs previous period', isPositive: true },
  { title: 'Repairs', value: '241,12 €', trend: undefined, trendLabel: undefined, isPositive: undefined },
  { title: 'Avg per Job', value: '24,50 €', trend: undefined, trendLabel: undefined, isPositive: undefined },
  { title: 'Movement Count', value: '35', trend: undefined, trendLabel: undefined, isPositive: undefined }
] as const
