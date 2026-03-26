export function parseSohlenaufbauNum(v: string): number {
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}
