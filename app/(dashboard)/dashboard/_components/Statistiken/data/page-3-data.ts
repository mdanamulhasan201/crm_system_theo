/**
 * Mock data for page-3 (Mitarbeiter - Produktionsübersicht)
 */

export const PAGE3_KPIS = [
  { title: 'Stunden diese Woche', value: '162 h', sub: '18% vs. letzte Woche', trendUp: true },
  { title: 'Stunden diesen Monat', value: '684 h', sub: '', trendUp: false },
  { title: 'Aktive Mitarbeiter', value: '3 / 5', sub: '', trendUp: false },
  { title: 'Offene Urlaubsanträge', value: '2', sub: '', trendUp: false }
] as const

/** Left middle card */
export const PAGE3_LEFT_STATS = [
  { value: '125 h', label: '0 Produktstunden' },
  { value: '340', label: 'Abvergungen' }
] as const

/** Aufgabenverteilung donut */
export const AUFGABENVERTEILUNG = [
  { name: 'Urlaub', value: 60, color: '#1a5f3a' },
  { name: 'Sonstiges', value: 30, color: '#0d9488' },
  { name: 'Unnötiges', value: 10, color: '#b8e6ce' }
] as const

export const AUFGABENVERTEILUNG_SUBTITLE =
  'Weniger Produktionsstunden aber mehr Versorgungen. Produktionssatz höher als vergangener Monat.'

/** Right middle card */
export const ABWESENHEITSTAGE = { value: '16', label: 'Abwesenheitstage gesamt' }

/** Skill stacked bar: per employee, % per category (Einlagen, Maßschuhe, Versorgung, Außendienst) */
export const SKILL_AUSWERTUNG = [
  { name: 'Peter', einlagen: 55, masschuhe: 20, versorgung: 15, aussendienst: 10 },
  { name: 'Max', einlagen: 30, masschuhe: 35, versorgung: 25, aussendienst: 10 },
  { name: 'Lisa', einlagen: 25, masschuhe: 15, versorgung: 50, aussendienst: 10 },
  { name: 'Anna', einlagen: 40, masschuhe: 25, versorgung: 20, aussendienst: 15 },
  { name: 'Michael', einlagen: 20, masschuhe: 45, versorgung: 25, aussendienst: 10 }
] as const

export const SKILL_LEGEND = [
  { name: 'Einlagen', color: '#1a5f3a' },
  { name: 'Maßschuhe', color: '#36A866' },
  { name: 'Versorgung', color: '#0d9488' },
  { name: 'Außendienst', color: '#b8e6ce' }
] as const

/** Skill highlights (Meiste X: Name (Y h)) */
export const SKILL_HIGHLIGHTS = [
  { label: 'Meiste Einlagenstunden', name: 'Peter', hours: 124 },
  { label: 'Meiste Maßschuhstunden', name: 'Michael', hours: 88 },
  { label: 'Meiste Versorgung', name: 'Lisa', hours: 152 }
] as const

/** Produktionsstunden und Fertigungen pro Monat (stacked bar), values in scale 0–150 */
export const PRODUKTIONSSTUNDEN_FERTIGUNGEN = [
  { month: 'Jan', produktionsstunden: 70, fertigungen: 40 },
  { month: 'Feb', produktionsstunden: 85, fertigungen: 50 },
  { month: 'Mrz', produktionsstunden: 60, fertigungen: 35 },
  { month: 'Apr', produktionsstunden: 95, fertigungen: 55 },
  { month: 'Mai', produktionsstunden: 80, fertigungen: 45 },
  { month: 'Jun', produktionsstunden: 75, fertigungen: 42 },
  { month: 'Sep', produktionsstunden: 50, fertigungen: 28 },
  { month: 'Okt', produktionsstunden: 90, fertigungen: 48 }
] as const

/** Produktion, Abwesenheit – line chart (Fertigungen grey dashed, Abwesenheit green) */
export const PRODUKTION_ABWESENHEIT = [
  { month: 'Jan', fertigungen: 42, abwesenheit: 4 },
  { month: 'Feb', fertigungen: 48, abwesenheit: 5 },
  { month: 'Mrz', fertigungen: 38, abwesenheit: 6 },
  { month: 'Apr', fertigungen: 52, abwesenheit: 7 },
  { month: 'Mai', fertigungen: 45, abwesenheit: 8 },
  { month: 'Jun', fertigungen: 44, abwesenheit: 9 },
  { month: 'Jul', fertigungen: 46, abwesenheit: 10 },
  { month: 'Aug', fertigungen: 43, abwesenheit: 11 },
  { month: 'Sep', fertigungen: 40, abwesenheit: 12 },
  { month: 'Dez', fertigungen: 50, abwesenheit: 14 }
] as const

/** Abwesenheitsquote KPI card */
export const ABWESENHEITSQUOTE_KPI = {
  main: '8.5%',
  mainSub: ['+2.3% ggü. letztem Monat', '-1.1% ggü. Jahresdurchschnitt'],
  secondary: '-2.3%',
  secondarySub: ['+2.3% ggü. letztem Monat', '-1.1%']
} as const

/** Calendar: green circle (solid highlight), pill range, dot underneath, selected range (light gray) */
export const ABWESENHEIT_CALENDAR_GREEN_CIRCLE = [6, 13] as const
export const ABWESENHEIT_CALENDAR_PILL_RANGE = [7, 8] as const
export const ABWESENHEIT_CALENDAR_DOT_DAYS = [11, 24, 26] as const
/** Selected range (days 6–16) shown with light gray background */
export const ABWESENHEIT_CALENDAR_SELECTED_RANGE = [6, 16] as const
export const ABWESENHEIT_CALENDAR_SELECTED = 24

/** Calendar insights */
export const ABWESENHEIT_INSIGHTS = [
  'KW 34: 3 Mitarbeiter bei hoher Abwesenheit +18% höher',
  'Überstunden steigen regelmäßig, wenn 2 Mitarbeiter gleichzeitig fehlen'
] as const

/** Bestellstatus-Verteilung (Urlaub, Krank, Fortbildung) by month */
export const BESTELLSTATUS_ABWESENHEIT = [
  { month: 'Aug', urlaub: 25, krank: 15, fortbildung: 8 },
  { month: 'Sep', urlaub: 30, krank: 12, fortbildung: 10 },
  { month: 'Okt', urlaub: 28, krank: 18, fortbildung: 6 },
  { month: 'Mrz', urlaub: 22, krank: 20, fortbildung: 12 },
  { month: 'Apr', urlaub: 20, krank: 45, fortbildung: 10 },
  { month: 'Mai', urlaub: 35, krank: 18, fortbildung: 8 },
  { month: 'Jul', urlaub: 50, krank: 22, fortbildung: 5 }
] as const

export const BESTELLSTATUS_ABWESENHEIT_INSIGHT =
  'Krankheitsquote überdurchschnittlich im Juli (+2%)'

/** Überstunden-Statistik: Soll vs Ist (e.g. 5 periods) */
export const UBERSTUNDEN_SOLL = [120, 115, 125, 118, 122] as const
export const UBERSTUNDEN_IST = [128, 110, 132, 122, 118] as const
export const UBERSTUNDEN_LABELS = ['F', 'F', 'M', 'A', 'M'] as const
export const UBERSTUNDEN_INSIGHTS = [
  'Ø Überstunden bei hoher Abwesenheit +18% höher',
  'Überstunden steigen regelmäßig, wenn 2 Mitarbeiter gleichzeitig fehlen'
] as const

/** Überdurchschnittlich im Juli – stacked bar Urlaub + Krank by month */
export const UEBERDURCHSCHNITTLICH_JULI = [
  { month: 'Aug', urlaub: 25, krank: 12 },
  { month: 'Feb', urlaub: 20, krank: 18 },
  { month: 'Mrz', urlaub: 28, krank: 15 },
  { month: 'Apr', urlaub: 22, krank: 20 },
  { month: 'Mai', urlaub: 30, krank: 14 },
  { month: 'Jun', urlaub: 26, krank: 16 },
  { month: 'Jul', urlaub: 35, krank: 28 },
  { month: 'Sep', urlaub: 24, krank: 12 }
] as const

/** Abwesenheit vs. Produktivität – line chart + text bubbles */
export const ABWESENHEIT_VS_PRODUKTIVITAET = [
  { month: 'Aug', abwesenheit: 8, produktivitaet: 10 },
  { month: 'Feb', abwesenheit: 9, produktivitaet: 11 },
  { month: 'Mrz', abwesenheit: 10, produktivitaet: 9 },
  { month: 'Apr', abwesenheit: 11, produktivitaet: 12 },
  { month: 'Jun', abwesenheit: 12, produktivitaet: 10 },
  { month: 'Jul', abwesenheit: 14, produktivitaet: 8 },
  { month: 'Sep', abwesenheit: 13, produktivitaet: 11 }
] as const

export const ABWESENHEIT_PRODUKTIVITAET_BUBBLES = [
  '-20% Urlaub im Juli = -15% Fertigungen',
  'Im März trotz Abwesenheit hohe Produktivität'
] as const

/** Dauer pro Arbeitsschritt (Soll vs. Ist) – Fertigung is bottleneck */
export const DAUER_ARBEITSSCHRITT = [
  { step: 'Vorbereitung', soll: 0.8, ist: 0.9 },
  { step: 'Fertigung', soll: 1.8, ist: 2.5 },
  { step: 'Veredelung', soll: 1.2, ist: 1.1 },
  { step: 'Verpackung', soll: 0.6, ist: 0.7 }
] as const

export const BOTTLENECK_STEP = 'Fertigung'
export const BOTTLENECK_LABEL = '2,5 h'
export const BOTTLENECK_SUB = '(=40% länger als geplant)'

/** On-time Wahrscheinlichkeit KPI */
export const ON_TIME_WAHRSCHEINLICHKEIT = { value: '87%', label: 'Standard-Lieferzeiten akzeptiert' }

/** Lieferungen vor Term KPI */
export const LIEFERUNGEN_VOR_TERM = {
  value: '97%',
  label: '97% aller Aufträge wurden rechtzeitig oder früher fertiggestellt'
} as const
