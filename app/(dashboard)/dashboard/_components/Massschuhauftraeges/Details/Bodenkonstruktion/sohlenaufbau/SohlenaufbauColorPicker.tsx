"use client"

import type { SohlenaufbauShoreValue } from "../FormFields"
import { SOLE_COLORS } from "./constants"
import { isSohlenaufbauColorAllowedForShore } from "./shoreColorRules"
import { evaShoreLabel } from "./shoreDisplay"

export default function SohlenaufbauColorPicker({
  value,
  onChange,
  label,
  shore = "53",
}: {
  value: string
  onChange: (c: string) => void
  label?: string
  shore?: SohlenaufbauShoreValue
}) {
  const activeShore = shore || "53"
  return (
    <div className="space-y-1.5">
      {label ? <p className="text-xs font-medium text-gray-500">{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {SOLE_COLORS.map((c) => {
          const allowed = isSohlenaufbauColorAllowedForShore(c.value, activeShore)
          return (
            <button
              key={c.value}
              type="button"
              title={
                allowed ? c.label : `${c.label} – nicht verfügbar mit ${evaShoreLabel(activeShore)}`
              }
              disabled={!allowed}
              onClick={() => onChange(c.value)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                !allowed
                  ? "cursor-not-allowed border-gray-200 opacity-25"
                  : value === c.value
                    ? "scale-110 border-[#61A175] shadow-md"
                    : "border-gray-200 hover:border-[#61A175]/40"
              }`}
              style={{ backgroundColor: c.value }}
            />
          )
        })}
      </div>
      {activeShore === "30" ? (
        <p className="text-xs text-gray-500">EVA Shore 30 ist nur mit Schwarz und Dunkelbraun verfügbar.</p>
      ) : null}
    </div>
  )
}
