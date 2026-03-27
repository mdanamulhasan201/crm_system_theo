/** Kurztext für Tabelle / Combobox; voller Text per `title` */
export function standortKurz(text: string, maxLen = 22): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}
