"use client"

import type { SohlenaufbauSideHeights } from "../FormFields"
import InputWithUnit from "../shared/InputWithUnit"

export default function SohlenaufbauHeightGrid({
  values,
  onChange,
  label,
}: {
  values: SohlenaufbauSideHeights
  onChange: (v: SohlenaufbauSideHeights) => void
  label?: string
}) {
  return (
    <div className="space-y-1">
      {label ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InputWithUnit
          label="Ferse / Absatz"
          value={values.ferse}
          onChange={(v) => onChange({ ...values, ferse: v })}
          unit="mm"
          placeholder="0"
        />
        <InputWithUnit
          label="Ballen"
          value={values.ballen}
          onChange={(v) => onChange({ ...values, ballen: v })}
          unit="mm"
          placeholder="0"
        />
        <InputWithUnit
          label="Spitze"
          value={values.spitze}
          onChange={(v) => onChange({ ...values, spitze: v })}
          unit="mm"
          placeholder="0"
        />
      </div>
    </div>
  )
}
