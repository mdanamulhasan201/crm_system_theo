import type { SohlenaufbauShoreValue } from "../FormFields"

export const SHORE_30_ALLOWED_COLORS = ["#1a1a1a", "#3E2723"] as const

export function isSohlenaufbauColorAllowedForShore(color: string, shore: SohlenaufbauShoreValue): boolean {
  if (shore === "30") return (SHORE_30_ALLOWED_COLORS as readonly string[]).includes(color)
  return true
}
