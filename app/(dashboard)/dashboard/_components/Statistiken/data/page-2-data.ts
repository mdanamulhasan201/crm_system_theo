/**
 * Mock data for page-2 (Charts & Statistics)
 */

export const PAGE2_KPIS = [
    { title: 'Kosten pro Versorgung', value: '€1,280', sub: '43 min' },
    { title: 'Deckungsbeitrag', value: '€22', sub: '' },
    { title: 'Gesamter Umsatz', value: '€65000', sub: '' },
    { title: 'Reklamationsquote', value: '3,5%', sub: '' }
  ] as const
  
  export const KOSTEN_GEWINN_CATEGORIES = [
    { name: 'Sporteinlage', value: 85, color: '#36A866' },
    { name: 'Alltagseinlage', value: 78, color: '#36A866' },
    { name: 'Businesseinlage', value: 42, color: '#ef4444' },
    { name: 'Schuhe', value: 72, color: '#36A866' }
  ] as const
  
  export const KOSTEN_TABLE_ROWS = [
    {
      ordnung: 'Rteinlage',
      oZeit: '50 m',
      zeitkosten: '€37',
      material: '€15',
      fixkosten: '€15',
      gesamtkosten: '€56',
      verkaufspreis: '€140',
      db: '€76'
    },
    {
      ordnung: 'Gseinlage',
      oZeit: '45 m',
      zeitkosten: '€34',
      material: '€20',
      fixkosten: '€15',
      gesamtkosten: '€77',
      verkaufspreis: '€150',
      db: '€76'
    },
    {
      ordnung: 'Nesseinlage',
      oZeit: '55 m',
      zeitkosten: '€41',
      material: '€17',
      fixkosten: '€15',
      gesamtkosten: '€67',
      verkaufspreis: '€167',
      db: '€83'
    }
  ] as const
  
  export const EMPLOYEE_TIME_QUALITY = [
    { name: 'Peter', time: 30, quality: 89 },
    { name: 'Max', time: 35, quality: 94 },
    { name: 'Lisa', time: 38, quality: 86 },
    { name: 'Anna', time: 47, quality: 95 }
  ] as const
  
  export const EMPLOYEE_STATS = [
    { title: 'Ø Qualitätsquote', value: '96%' },
    { title: 'Gesamte Nacharbeitsstunden', value: '24 h' },
    {
      title: 'Mitarbeiter mit den meisten Reklamationen:',
      value: 'Max (8%)'
    }
  ] as const
  
  /** Produktivität vs. Nacharbeit (stacked horizontal bar): Gefertigte Einlagen (green) + Nachversorgung (red) */
  export const PRODUKTIVITAT_NACHARBEIT = [
    { name: 'Peter', produktivitaet: 32, nacharbeit: 4 },
    { name: 'Lisa', produktivitaet: 22, nacharbeit: 14 },
    { name: 'Anna', produktivitaet: 26, nacharbeit: 8 },
    { name: 'Michael', produktivitaet: 18, nacharbeit: 16 }
  ] as const
  
  /** Fehlerquote last 12 months for line chart (Gesamtkosten vs. Umsatz card) */
  export const FEHLERQUOTE_12_MONATE = [
    { month: 'Jan', fehlerquote: 2.5 },
    { month: 'Feb', fehlerquote: 2.8 },
    { month: 'Mrz', fehlerquote: 3.0 },
    { month: 'Apr', fehlerquote: 3.4 },
    { month: 'Mai', fehlerquote: 4.2 },
    { month: 'Jun', fehlerquote: 4.0 },
    { month: 'Jul', fehlerquote: 4.5 },
    { month: 'Aug', fehlerquote: 4.8 },
    { month: 'Sep', fehlerquote: 5.2 },
    { month: 'Okt', fehlerquote: 5.4 },
    { month: 'Nov', fehlerquote: 5.6 },
    { month: 'Dez', fehlerquote: 5.8 }
  ] as const
  
  export const NACHARBEITSQUOTE_KPI = '8%'
  
  /** Reklamationsquote je Mitarbeiter – Versorgung (e.g. 3 entries) */
  export const REKLAMATION_VERSORGUNG = [
    { name: 'James Danton', quote: 8 },
    { name: 'James Danton', quote: 8 },
    { name: 'James Danton', quote: 8 }
  ] as const
  
  /** Reklamationsquote je Mitarbeiter – Fertigung (e.g. 5 entries) */
  export const REKLAMATION_FERTIGUNG = [
    { name: 'James Danton', quote: 8 },
    { name: 'James Danton', quote: 8 },
    { name: 'James Danton', quote: 8 },
    { name: 'James Danton', quote: 8 },
    { name: 'James Danton', quote: 8 }
  ] as const
  
  /** Gesamtkosten pro Monat – line chart: Gesamtkosten (grey) + Umsatz (green), values in K */
  export const GESAMTKOSTEN_UMSATZ_MONAT = [
    { month: 'Jan', gesamtkosten: 72, umsatz: 45 },
    { month: 'Feb', gesamtkosten: 74, umsatz: 52 },
    { month: 'Mrz', gesamtkosten: 73, umsatz: 58 },
    { month: 'Apr', gesamtkosten: 78, umsatz: 55 },
    { month: 'Mai', gesamtkosten: 75, umsatz: 62 },
    { month: 'Jun', gesamtkosten: 76, umsatz: 58 },
    { month: 'Jul', gesamtkosten: 74, umsatz: 72 },
    { month: 'Aug', gesamtkosten: 77, umsatz: 75 },
    { month: 'Sep', gesamtkosten: 76, umsatz: 78 },
    { month: 'Okt', gesamtkosten: 75, umsatz: 82 },
    { month: 'Nov', gesamtkosten: 78, umsatz: 85 },
    { month: 'Dez', gesamtkosten: 80, umsatz: 88 }
  ] as const
  
  /** Bestellstatus-Verteilung: stacked bar by month, values in K */
  export const BESTELLSTATUS_MONAT = [
    { month: 'Jan', materialkosten: 28, zeitkosten: 22, fixkosten: 12, logistik: 10 },
    { month: 'Feb', materialkosten: 30, zeitkosten: 24, fixkosten: 12, logistik: 8 },
    { month: 'Mrz', materialkosten: 26, zeitkosten: 28, fixkosten: 12, logistik: 7 },
    { month: 'Apr', materialkosten: 38, zeitkosten: 32, fixkosten: 14, logistik: 10 },
    { month: 'Mai', materialkosten: 32, zeitkosten: 26, fixkosten: 12, logistik: 8 },
    { month: 'Jun', materialkosten: 30, zeitkosten: 28, fixkosten: 12, logistik: 6 },
    { month: 'Jul', materialkosten: 28, zeitkosten: 24, fixkosten: 12, logistik: 10 },
    { month: 'Aug', materialkosten: 32, zeitkosten: 26, fixkosten: 14, logistik: 8 },
    { month: 'Sep', materialkosten: 30, zeitkosten: 28, fixkosten: 12, logistik: 6 },
    { month: 'Okt', materialkosten: 28, zeitkosten: 30, fixkosten: 12, logistik: 8 },
    { month: 'Nov', materialkosten: 34, zeitkosten: 26, fixkosten: 14, logistik: 6 },
    { month: 'Dez', materialkosten: 36, zeitkosten: 28, fixkosten: 12, logistik: 8 }
  ] as const
  
  /** Gesamtkosten pro Einlage – donut breakdown (values in €), total 47 € */
  export const GESAMTKOSTEN_EINLAGE_BREAKDOWN = [
    { name: 'Materialkosten', value: 25800, percent: 34, color: '#1a5f3a' },
    { name: 'Zeitkosten', value: 14700, percent: 19, color: '#36A866' },
    { name: 'Fixkostenanteil', value: 14700, percent: 6, color: '#7dd3a8' },
    { name: 'Logistik', value: 4700, percent: 7, color: '#b8e6ce' }
  ] as const
  
  export const GESAMTKOSTEN_PRO_EINLAGE_TOTAL = '47 €'
  export const GESAMTKOSTEN_EINLAGE_CENTER = { value: '25.800 €', sub: '31,60', percent: '42%' }
  
  /** Durchschnittliche Dauer je Prozess (minutes) */
  export const PROZESS_DAUER = [
    { name: 'Vorbereitung', minuten: 3.5 },
    { name: 'Fertigung', minuten: 3.0 },
    { name: 'Veredelung', minuten: 2.3 },
    { name: 'Verpackung', minuten: 1.5 }
  ] as const
  
  /** Bottleneck donut: Fertigung 55%, rest 45% */
  export const BOTTLENECK_DATA = [
    { name: 'Fertigung', value: 55, color: '#b8e6ce' },
    { name: 'Sonstige', value: 45, color: '#1a5f3a' }
  ] as const
  export const BOTTLENECK_CENTER = { label: 'Fertigung 55% der Gesamtzeit', percent: '55% der Gesamtzeit' }
  
  /** Einlagenkategorie Top 3 – letzte 30 Tage */
  export const EINLAGENKATEGORIE_TOP3 = [
    { name: 'Alltagseinlage', value: 87 },
    { name: 'Sporteinlage', value: 75 },
    { name: 'Businesseinlage', value: 68 }
  ] as const
  
  /** Sport share of purchases (percent per category) */
  export const SPORT_SHARE = [
    { name: 'Running', value: 8 },
    { name: 'Football', value: 8 },
    { name: 'Basketball', value: 8 },
    { name: 'Skiing', value: 8 },
    { name: 'Cycling', value: 8 }
  ] as const
  
  /** Fertigung bis Abholtermin – donut */
  export const FERTIGUNG_ABHOLTERMIN = [
    { name: 'Zu schnelle Fertigung', value: 13, color: '#b8e6ce' },
    { name: 'Pünktliche Lieferung', value: 72, color: '#1a5f3a' },
    { name: 'Verspätete Lieferung', value: 15, color: '#36A866' }
  ] as const
  
  /** Liegezeit nach Fertigstellung – donut */
  export const LIEGEZEIT_NACH_FERTIGSTELLUNG = [
    { name: 'Vor Liefertermin', value: 40, color: '#1a5f3a' },
    { name: 'Liefertermin bis + 2 Tage', value: 15, color: '#2d8a5e' },
    { name: 'Liefertermin +2 - +5 Tage', value: 25, color: '#b8e6ce' },
    { name: 'Mehr als 7 Tage', value: 25, color: '#36A866' }
  ] as const
  