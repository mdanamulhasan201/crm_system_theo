"use client"

import { RadioOption } from "../shared/RadioOption"
import InfoTooltip from "../shared/InfoTooltip"
import type {
  SohlenaufbauShoreModus,
  SohlenaufbauShorePerArea,
  SohlenaufbauShorePerLayer,
  SohlenaufbauShoreValue,
} from "../FormFields"
import { EVA_SHORE_LABEL } from "./shoreDisplay"

const SHORE_OPTIONS: { value: SohlenaufbauShoreValue; label: string; sub: string; disabled?: boolean }[] = [
  { value: "30", label: EVA_SHORE_LABEL["30"], sub: "weich · nur Schwarz / Braun" },
  { value: "53", label: EVA_SHORE_LABEL["53"], sub: "Standard" },
  { value: "58", label: EVA_SHORE_LABEL["58"], sub: "", disabled: true },
]

function ShoreChip({
  opt,
  selected,
  onClick,
}: {
  opt: (typeof SHORE_OPTIONS)[number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={opt.disabled}
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-left transition-all ${
        opt.disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50/80 opacity-40"
          : selected
            ? "border-[#61A175] bg-[#61A175]/10 text-gray-900"
            : "border-gray-200 bg-white text-gray-900 hover:border-[#61A175]/40"
      }`}
    >
      <span className="block text-sm font-medium">{opt.label}</span>
      {opt.sub ? <span className="text-xs text-gray-500">{opt.sub}</span> : null}
    </button>
  )
}

export default function SohlenaufbauShoreSection({
  modus,
  onModusChange,
  globalShore,
  onGlobalShoreChange,
  perArea,
  onPerAreaChange,
  perLayer,
  onPerLayerChange,
  hasZwischensohle,
  hasAbsatz,
  hasLayerSplit,
  zwLayerCount,
  abLayerCount,
}: {
  modus: SohlenaufbauShoreModus
  onModusChange: (m: SohlenaufbauShoreModus) => void
  globalShore: SohlenaufbauShoreValue
  onGlobalShoreChange: (v: SohlenaufbauShoreValue) => void
  perArea: SohlenaufbauShorePerArea
  onPerAreaChange: (a: SohlenaufbauShorePerArea) => void
  perLayer: SohlenaufbauShorePerLayer
  onPerLayerChange: (l: SohlenaufbauShorePerLayer) => void
  hasZwischensohle: boolean
  hasAbsatz: boolean
  hasLayerSplit: boolean
  zwLayerCount: number
  abLayerCount: number
}) {
  const updatePerLayerShore = (area: "zwLayers" | "abLayers", idx: number, val: SohlenaufbauShoreValue) => {
    const next = { ...perLayer }
    const arr = [...next[area]]
    while (arr.length <= idx) arr.push("53")
    arr[idx] = val
    next[area] = arr
    onPerLayerChange(next)
  }

  const activeLayerOptions = SHORE_OPTIONS.filter((o) => !o.disabled)

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-700">Material / Shore-Härte</p>
          <InfoTooltip content="EVA Shore 30 ist nur mit Schwarz und Dunkelbraun verfügbar. EVA Shore 58 wird aktuell nicht angeboten." />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <RadioOption
            selected={modus === "einheitlich"}
            onClick={() => onModusChange("einheitlich")}
            label="Einheitlich für gesamten Aufbau"
          />
          <RadioOption
            selected={modus === "individuell"}
            onClick={() => onModusChange("individuell")}
            label="Individuell pro Bereich"
          />
        </div>
      </div>

      {modus === "einheitlich" ? (
        <div className="flex flex-wrap gap-2">
          {SHORE_OPTIONS.map((opt) => (
            <ShoreChip
              key={opt.value}
              opt={opt}
              selected={globalShore === opt.value}
              onClick={() => !opt.disabled && onGlobalShoreChange(opt.value)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {hasZwischensohle ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Zwischensohle</p>
              <div className="flex flex-wrap gap-2">
                {SHORE_OPTIONS.map((opt) => (
                  <ShoreChip
                    key={opt.value}
                    opt={opt}
                    selected={perArea.zwischensohle === opt.value}
                    onClick={() => !opt.disabled && onPerAreaChange({ ...perArea, zwischensohle: opt.value })}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {hasAbsatz ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Absatz</p>
              <div className="flex flex-wrap gap-2">
                {SHORE_OPTIONS.map((opt) => (
                  <ShoreChip
                    key={opt.value}
                    opt={opt}
                    selected={perArea.absatz === opt.value}
                    onClick={() => !opt.disabled && onPerAreaChange({ ...perArea, absatz: opt.value })}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {hasLayerSplit && modus === "individuell" ? (
        <div className="mt-2 space-y-3 rounded-lg bg-gray-100/80 p-3">
          <p className="text-xs font-medium text-gray-600">Shore pro Lage definieren</p>
          {hasZwischensohle && zwLayerCount > 1 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Zwischensohle</p>
              {Array.from({ length: zwLayerCount }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-14 text-xs text-gray-500">Lage {idx + 1}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLayerOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updatePerLayerShore("zwLayers", idx, opt.value)}
                        className={`rounded border px-2.5 py-1 text-xs font-medium transition-all ${
                          (perLayer.zwLayers[idx] || "53") === opt.value
                            ? "border-[#61A175] bg-[#61A175]/10"
                            : "border-gray-200 hover:border-[#61A175]/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {hasAbsatz && abLayerCount > 1 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Absatz</p>
              {Array.from({ length: abLayerCount }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-14 text-xs text-gray-500">Lage {idx + 1}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLayerOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updatePerLayerShore("abLayers", idx, opt.value)}
                        className={`rounded border px-2.5 py-1 text-xs font-medium transition-all ${
                          (perLayer.abLayers[idx] || "53") === opt.value
                            ? "border-[#61A175] bg-[#61A175]/10"
                            : "border-gray-200 hover:border-[#61A175]/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
