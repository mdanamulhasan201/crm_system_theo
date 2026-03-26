"use client"

import type { SohlenaufbauLayerSplit, SohlenaufbauSplitMode } from "../FormFields"
import InputWithUnit from "../shared/InputWithUnit"
import { parseSohlenaufbauNum } from "./utils"

export default function SohlenaufbauLayerSplitControl({
  label,
  total,
  split,
  onChange,
}: {
  label: string
  total: number
  split: SohlenaufbauLayerSplit
  onChange: (s: SohlenaufbauLayerSplit) => void
}) {
  const setMode = (mode: SohlenaufbauSplitMode) => {
    if (mode === "einteilig") {
      onChange({ mode, layers: [String(total)] })
    } else if (mode === "gleichmaessig") {
      const half = Math.round(total / 2)
      onChange({ mode, layers: [String(half), String(total - half)] })
    } else {
      onChange({
        mode,
        layers: split.layers.length >= 2 ? split.layers : [String(total), ""],
      })
    }
  }

  const updateLayer = (idx: number, val: string) => {
    const next = [...split.layers]
    next[idx] = val
    onChange({ ...split, layers: next })
  }

  const addLayer = () => onChange({ ...split, layers: [...split.layers, ""] })
  const removeLayer = (idx: number) => {
    if (split.layers.length <= 2) return
    onChange({ ...split, layers: split.layers.filter((_, i) => i !== idx) })
  }

  const layerSum = split.layers.reduce((s, v) => s + parseSohlenaufbauNum(v), 0)
  const valid = total <= 0 || split.mode === "einteilig" || Math.abs(layerSum - total) < 0.1

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label} aufteilen</p>
      <div className="flex flex-wrap gap-2">
        {(["einteilig", "gleichmaessig", "individuell"] as SohlenaufbauSplitMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              split.mode === m
                ? "border-[#61A175] bg-[#61A175]/10 text-gray-900"
                : "border-gray-200 bg-white text-gray-800 hover:border-[#61A175]/40"
            }`}
          >
            {m === "einteilig" ? "Einteilig" : m === "gleichmaessig" ? "Gleichmäßig" : "Individuell"}
          </button>
        ))}
      </div>

      {split.mode !== "einteilig" ? (
        <div className="space-y-2 pt-2">
          {split.layers.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-14 text-xs font-medium text-gray-500">Lage {idx + 1}</span>
              <div className="w-24">
                <InputWithUnit
                  value={val}
                  onChange={(v) => updateLayer(idx, v)}
                  unit="mm"
                  placeholder="0"
                />
              </div>
              {split.mode === "individuell" && split.layers.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeLayer(idx)}
                  className="text-xs text-gray-500 transition-colors hover:text-red-600"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
          {split.mode === "individuell" && split.layers.length < 5 ? (
            <button
              type="button"
              onClick={addLayer}
              className="text-xs font-medium text-[#61A175] transition-colors hover:text-[#61A175]/80"
            >
              + weitere Lage
            </button>
          ) : null}
          {!valid && total > 0 ? (
            <p className="text-xs text-red-600">
              Summe ({layerSum} mm) ≠ Gesamt ({total} mm)
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
