"use client"

import { Layers } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"

type KonstruktionsartOption = { id: string; label: string; disabled?: boolean }

export default function KonstruktionsartConfigCard({
  options,
  selected,
  onSelect,
  subtitle = "Art der Sohlenbefestigung",
}: {
  options: KonstruktionsartOption[]
  selected: string | null
  onSelect: (optionId: string | null) => void
  subtitle?: string
}) {
  return (
    <ConfigCard title="Konstruktionsart" subtitle={subtitle} icon={<Layers size={20} />}>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {options.map((opt) => {
          const isDisabled = opt.disabled === true
          const isSelected = !isDisabled && selected === opt.id
          return (
            <RadioOption
              key={opt.id}
              label={opt.label}
              disabled={isDisabled}
              selected={isSelected}
              onClick={() => {
                if (isDisabled) return
                onSelect(isSelected ? null : opt.id)
              }}
            />
          )
        })}
      </div>
    </ConfigCard>
  )
}
