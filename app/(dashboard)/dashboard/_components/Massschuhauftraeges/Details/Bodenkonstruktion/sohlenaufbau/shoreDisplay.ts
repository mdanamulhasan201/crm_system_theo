import type { SohlenaufbauShoreValue } from "../FormFields"

/** UI label (internal value "53" = EVA Shore 50). */
export const EVA_SHORE_LABEL: Record<SohlenaufbauShoreValue, string> = {
  "30": "EVA Shore 30",
  "53": "EVA Shore 50",
  "58": "EVA Shore 58",
}

export function evaShoreLabel(value: SohlenaufbauShoreValue): string {
  return EVA_SHORE_LABEL[value]
}
