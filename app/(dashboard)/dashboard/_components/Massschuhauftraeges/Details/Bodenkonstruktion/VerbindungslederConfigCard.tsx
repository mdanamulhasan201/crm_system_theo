"use client"

import { Link2 } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"

const DEFAULT_SUBTITLE =
  "Lederstück zur Verbindung von Vorder- und Hinterkappe für zusätzliche Stabilität im Schaftbereich."

export default function VerbindungslederConfigCard({
  selected,
  onSelect,
  subtitle = DEFAULT_SUBTITLE,
}: {
  selected: string | null
  onSelect: (optionId: string | null) => void
  subtitle?: string
}) {
  return (
    <ConfigCard
      title="Verbindungsleder"
      subtitle={subtitle}
      icon={<Link2 size={20} />}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Auswahl</p>
      <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
        <RadioOption
          selected={selected === "ja"}
          onClick={() => onSelect(selected === "ja" ? null : "ja")}
          label="Ja"
        />
        <RadioOption
          selected={selected === "nein"}
          onClick={() => onSelect(selected === "nein" ? null : "nein")}
          label="Nein"
        />
      </div>
    </ConfigCard>
  )
}
