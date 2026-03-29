export type PolsterungMmFields = {
  abschluss: string;
  knoechel: string;
  lasche: string;
  ferse: string;
};

export const EMPTY_POLSTERUNG_MM: PolsterungMmFields = {
  abschluss: '',
  knoechel: '',
  lasche: '',
  ferse: '',
};

/** Default Polsterdicken bei Modus „Standard“ (für Payload / PDF). */
export const STANDARD_POLSTERUNG_MM: PolsterungMmFields = {
  abschluss: '5',
  knoechel: '2',
  lasche: '6',
  ferse: '2',
};

function formatPolsterungMmLines(mm: PolsterungMmFields): string[] {
  const lines: string[] = [];
  if (mm.abschluss.trim()) lines.push(`Abschlusspolster: ${mm.abschluss.trim()} mm`);
  if (mm.knoechel.trim()) lines.push(`Knöchelpolster: ${mm.knoechel.trim()} mm`);
  if (mm.lasche.trim()) lines.push(`Lasche: ${mm.lasche.trim()} mm`);
  if (mm.ferse.trim()) lines.push(`Ferse: ${mm.ferse.trim()} mm`);
  return lines;
}

/** Combines mm lines with free-text note for API / PDF `polsterung_text`. */
export function buildPolsterungTextPayload(
  userNote: string,
  mm: PolsterungMmFields,
  isErweitert: boolean
): string {
  const sourceMm = isErweitert ? mm : STANDARD_POLSTERUNG_MM;
  const lines = formatPolsterungMmLines(sourceMm);
  const block = lines.join('\n');
  const note = userNote.trim();
  if (!isErweitert) {
    if (note) return block ? `${block}\n\n${note}` : note;
    return block;
  }
  if (block && note) return `${block}\n\n${note}`;
  return block || note;
}
