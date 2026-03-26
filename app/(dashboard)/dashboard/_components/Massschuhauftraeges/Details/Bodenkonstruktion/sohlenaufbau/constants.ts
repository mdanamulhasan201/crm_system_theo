import type { SohlenaufbauAbsatzform } from "../FormFields"

export const SOLE_COLORS = [
  { value: "#1a1a1a", label: "Schwarz" },
  { value: "#FFFFFF", label: "Weiß" },
  { value: "#3E2723", label: "Dunkelbraun" },
  { value: "#C4A882", label: "Dunkelbeige" },
  { value: "#6B6B6B", label: "Grau" },
] as const

export const ABSATZ_OPTIONS: { value: Exclude<SohlenaufbauAbsatzform, "">; label: string }[] = [
  { value: "keilabsatz", label: "Keilabsatz" },
  { value: "stegkeil", label: "Stegkeil" },
  { value: "absatzkeil", label: "Absatzkeil" },
]
