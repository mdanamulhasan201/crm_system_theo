"use client"

import { Shield } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"
import SideSelector from "./shared/SideSelector"
import { Textarea } from "@/components/ui/textarea"
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

  const handleModeChange = (mode: SohlenversteifungData["mode"]) => {
    if (mode === "unterschiedlich") {
      const fallback = value.gleichMm || ""
      patch({
        mode: "unterschiedlich",
        linksMm: value.linksMm || fallback,
        rechtsMm: value.rechtsMm || fallback,
      })
      return
    }

    patch({
      mode: "gleich",
      gleichMm: value.gleichMm || value.linksMm || value.rechtsMm || "",
    })
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
            onChange={handleModeChange}
          />

          {value.mode === "gleich" ? (
            <div className="max-w-[520px]">
              <label className="mb-1 block text-sm font-medium text-gray-800">Notiz zur Versteifung</label>
              <Textarea
                value={value.gleichMm}
                onChange={(e) => patch({ gleichMm: e.target.value })}
                className="min-h-[88px] resize-y"
              />
            </div>
          ) : (
            <div className="grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Links</label>
                <Textarea
                  value={value.linksMm}
                  onChange={(e) => patch({ linksMm: e.target.value })}
                  className="min-h-[88px] resize-y"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Rechts</label>
                <Textarea
                  value={value.rechtsMm}
                  onChange={(e) => patch({ rechtsMm: e.target.value })}
                  className="min-h-[88px] resize-y"
                />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </ConfigCard>
  )
}
