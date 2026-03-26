"use client"

import { Shield } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"
import SideSelector from "./shared/SideSelector"
import InputWithUnit from "./shared/InputWithUnit"
import type { SohlenversteifungData } from "./FormFields"

const SUBTITLE = "Optionale Versteifung der Sohle"

export default function SohlenversteifungConfigCard({
  value,
  onChange,
}: {
  value: SohlenversteifungData
  onChange: (next: SohlenversteifungData) => void
}) {
  const patch = (partial: Partial<SohlenversteifungData>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <ConfigCard
      title="Sohlenversteifung"
      subtitle={SUBTITLE}
      icon={<Shield size={20} />}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Sohlenversteifung gewünscht?</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <RadioOption
            selected={!value.enabled}
            onClick={() => patch({ enabled: false })}
            label="Nein"
          />
          <RadioOption
            selected={value.enabled}
            onClick={() => patch({ enabled: true })}
            label="Ja"
          />
        </div>
      </div>

      {value.enabled ? (
        <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Hinweis: Der Schuh wird durch die Versteifung deutlich steifer und weniger flexibel.
          </p>

          <SideSelector
            value={value.mode}
            onChange={(mode) => patch({ mode })}
          />

          {value.mode === "gleich" ? (
            <div className="max-w-[200px]">
              <InputWithUnit
                label="Versteifung"
                value={value.gleichMm}
                onChange={(gleichMm) => patch({ gleichMm })}
                unit="mm"
                placeholder="z.B. 180"
              />
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 items-end max-w-xl">
              <div />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">
                Links
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">
                Rechts
              </p>

              <p className="text-sm font-medium text-gray-800">Versteifung</p>
              <InputWithUnit
                value={value.linksMm}
                onChange={(linksMm) => patch({ linksMm })}
                unit="mm"
                placeholder="z.B. 180"
              />
              <InputWithUnit
                value={value.rechtsMm}
                onChange={(rechtsMm) => patch({ rechtsMm })}
                unit="mm"
                placeholder="z.B. 180"
              />
            </div>
          )}
        </div>
      ) : null}
    </ConfigCard>
  )
}
