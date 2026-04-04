"use client"

import { Layers } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"
import { stripPriceFromOptionLabel } from "./FormFields"

type KonstruktionsartOption = { id: string; label: string; disabled?: boolean }

export default function KonstruktionsartConfigCard({
  options,
  selected,
  onSelect,
  subtitle = "Art der Sohlenbefestigung",
  hidePrice = false,
}: {
  options: KonstruktionsartOption[]
  selected: string | null
  onSelect: (optionId: string | null) => void
  subtitle?: string
  hidePrice?: boolean
}) {
  return (
    <ConfigCard title="Konstruktionsart" subtitle={subtitle} icon={<Layers size={20} />}>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {options.map((opt) => {
          const isDisabled = opt.disabled === true
          const isSelected = !isDisabled && selected === opt.id
          const label = hidePrice ? stripPriceFromOptionLabel(opt.label) : opt.label
          return (
            <RadioOption
              key={opt.id}
              label={label}
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
