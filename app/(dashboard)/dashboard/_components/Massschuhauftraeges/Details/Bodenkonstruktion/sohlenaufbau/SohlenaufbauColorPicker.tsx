"use client"

import { SOLE_COLORS } from "./constants"

export default function SohlenaufbauColorPicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (c: string) => void
  label?: string
}) {
  return (
    <div className="space-y-1.5">
      {label ? <p className="text-xs font-medium text-gray-500">{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {SOLE_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onChange(c.value)}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              value === c.value
                ? "scale-110 border-[#61A175] shadow-md"
                : "border-gray-200 hover:border-[#61A175]/40"
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  )
}
