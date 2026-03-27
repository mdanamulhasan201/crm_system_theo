"use client"

import type { GleichUnterschiedlichMode } from "../FormFields"
import { RadioOption } from "./RadioOption"

export default function SideSelector({
  value,
  onChange,
  label = "Auswahlbereich",
}: {
  value: GleichUnterschiedlichMode
  onChange: (v: NonNullable<Exclude<GleichUnterschiedlichMode, null>>) => void
  label?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <RadioOption
          selected={value === "gleich"}
          onClick={() => onChange("gleich")}
          label="Beidseitig – gleich"
        />
        <RadioOption
          selected={value === "unterschiedlich"}
          onClick={() => onChange("unterschiedlich")}
          label="Beidseitig – unterschiedlich"
        />
      </div>
    </div>
  )
}
