/**
 * Mock data for page-5 (Kasse & Verkauf)
 */

export const PAGE5_KPIS = [
  { title: 'Gesamtumsatz', value: '48.6k €', trend: '10.0%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Vollpreis-Umsatz', value: '34.0k €', trend: '10.0%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Rabatt-Umsatz', value: '14.6k €', trend: '10.0%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Vollpreisquote', value: '70%', trend: undefined, trendLabel: undefined, isPositive: undefined },
  { title: 'Ø Rabatt', value: '14.2%', trend: '10.9%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'DB nach Rabatt', value: '22.4k €', trend: '7.7%', trendLabel: 'vs. Vorperiode', isPositive: true },
  { title: 'Marge gesamt', value: '46.1%', trend: '2.1%', trendLabel: 'vs. Vorperiode', isPositive: true }
] as const

export const PAGE5_ALERTS = [
  'Rabatte reduzieren den DB um 11.600 € im Betrachtungszeitraum.',
  'Vollpreisquote im Februar bei 70% - stabil. Ziel: 75%.',
  'Modelle mit >20% Rabatt & Marge <30% markiert - Preispolitik prüfen.'
] as const

export const PAGE5_NAV_TABS = [
  'Vollpreis vs. Rabatt',
  'Rabatt-Detail',
  'Zahlungsarten'
] as const

export type Page5NavTab = (typeof PAGE5_NAV_TABS)[number]

/** Umsatz Vollpreis vs. Rabatt – stacked bar (monthly, values in k) */
export const UMSATZ_VOLLPREIS_RABATT = [
  { month: 'Sep', vollpreis: 22, rabatt: 10 },
  { month: 'Okt', vollpreis: 24, rabatt: 11 },
  { month: 'Nov', vollpreis: 26, rabatt: 12 },
  { month: 'Dez', vollpreis: 28, rabatt: 14 },
  { month: 'Jan', vollpreis: 30, rabatt: 13 },
  { month: 'Feb', vollpreis: 34, rabatt: 14.6 }
] as const

/** Rabattverteilung – donut (share by discount range) */
export const RABATTVERTEILUNG = [
  { name: 'Vollpreis (0%)', value: 70, color: '#1e3a8a' },
  { name: '1-10%', value: 15, color: '#36A866' },
  { name: '10-20%', value: 10, color: '#f97316' },
  { name: '>20%', value: 5, color: '#ef4444' }
] as const

/** Vollpreisquote pro Woche – stacked bar % (KW, vollpreisPct, rabattPct) */
export const VOLLPREISQUOTE_WOCHE = [
  { kw: 'KW 5', vollpreisPct: 70, rabattPct: 30 },
  { kw: 'KW 6', vollpreisPct: 72, rabattPct: 28 },
  { kw: 'KW 7', vollpreisPct: 68, rabattPct: 32 },
  { kw: 'KW 8', vollpreisPct: 70, rabattPct: 30 }
] as const

/** Zahlungsarten tab – donut + table (Anteil, Geschätzter Umsatz) */
export const UMSATZ_NACH_ZAHLUNGSART = [
  { name: 'Karte', value: 42, color: '#2563eb', umsatz: '20.412 €' },
  { name: 'Bar', value: 28, color: '#36A866', umsatz: '13.608 €' },
  { name: 'Rechnung', value: 18, color: '#f97316', umsatz: '8.748 €' },
  { name: 'Krankenkasse', value: 12, color: '#8b5cf6', umsatz: '5.832 €' }
] as const

/** Rabatt-Detail tab – Top-Artikel mit höchster Rabattquote (isCritical = light red row + warning icon) */
export const RABATT_DETAIL_ARTIKEL = [
  { artikel: 'Laufschuh Modell X', kategorie: 'Schuhverkauf', umsatz: '2.400 €', rabattquote: 32, oRabatt: '18.5%', marge: 28.4, dbVerlust: '-444 €', isCritical: true },
  { artikel: 'Wanderschuh Premium', kategorie: 'Schuhverkauf', umsatz: '1.800 €', rabattquote: 28, oRabatt: '22%', marge: 24.2, dbVerlust: '-396 €', isCritical: true },
  { artikel: 'Einlage Sport Plus', kategorie: 'Einlagen', umsatz: '3.200 €', rabattquote: 24, oRabatt: '12%', marge: 42.8, dbVerlust: '-384 €', isCritical: false },
  { artikel: 'Komfortschuh Classic', kategorie: 'Schuhverkauf', umsatz: '2.100 €', rabattquote: 22, oRabatt: '14%', marge: 32.6, dbVerlust: '-292 €', isCritical: false },
  { artikel: 'Einlage Alltag Standard', kategorie: 'Einlagen', umsatz: '2.800 €', rabattquote: 18, oRabatt: '10%', marge: 48.2, dbVerlust: '-252 €', isCritical: false },
  { artikel: 'Sicherheitsschuh Werk', kategorie: 'Schuhverkauf', umsatz: '1.650 €', rabattquote: 16, oRabatt: '11%', marge: 36.4, dbVerlust: '-198 €', isCritical: false },
  { artikel: 'Einlage Business Slim', kategorie: 'Einlagen', umsatz: '1.920 €', rabattquote: 14, oRabatt: '9%', marge: 52, dbVerlust: '-134 €', isCritical: false },
  { artikel: 'Reparatur Absätze', kategorie: 'Reparaturen', umsatz: '980 €', rabattquote: 8, oRabatt: '6%', marge: 56, dbVerlust: '-48 €', isCritical: false }
] as const
