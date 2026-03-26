"use client"

import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"

const SUBTITLE = "Optionale Versteifung der Sohle"

export default function SohlenversteifungConfigCard({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (optionId: string | null) => void
}) {
  const value = selected === "ja" ? "ja" : "nein"

  return (
    <ConfigCard title="Sohlenversteifung" subtitle={SUBTITLE}>
      <p className="text-sm font-medium text-gray-700">Sohlenversteifung gewünscht?</p>
      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        <RadioOption
          selected={value === "nein"}
          onClick={() => onSelect("nein")}
          label="Nein"
        />
        <RadioOption
          selected={value === "ja"}
          onClick={() => onSelect("ja")}
          label="Ja"
        />
      </div>
    </ConfigCard>
  )
}
