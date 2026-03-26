"use client"

import dynamic from "next/dynamic"
import { useCallback, useMemo } from "react"
import { Layers } from "lucide-react"
import ConfigCard from "../shared/ConfigCard"
import { RadioOption } from "../shared/RadioOption"
import InfoTooltip from "../shared/InfoTooltip"
import type { SohlenaufbauData, SohlenaufbauFarbModus } from "../FormFields"
import SohlenaufbauColorPicker from "./SohlenaufbauColorPicker"
import SohlenaufbauLayerSplitControl from "./SohlenaufbauLayerSplitControl"
import SohlenaufbauHeightGrid from "./SohlenaufbauHeightGrid"
import { ABSATZ_OPTIONS } from "./constants"
import { parseSohlenaufbauNum } from "./utils"
import type { SohlenaufbauPreviewData } from "./SolePreview3D"

const SolePreview3D = dynamic(() => import("./SolePreview3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center bg-gray-100 text-sm text-gray-500">Lade Vorschau…</div>
  ),
})

export default function SohlenaufbauConfigCard({
  value,
  onChange,
}: {
  value: SohlenaufbauData
  onChange: (next: SohlenaufbauData) => void
}) {
  const patch = useCallback((partial: Partial<SohlenaufbauData>) => {
    onChange({ ...value, ...partial })
  }, [value, onChange])

  const handleModeChange = useCallback(
    (mode: "gleich" | "unterschiedlich") => {
      if (mode === "unterschiedlich" && value.mode === "gleich") {
        onChange({ ...value, mode, rechts: { ...value.links } })
      } else {
        patch({ mode })
      }
    },
    [value, onChange, patch]
  )

  const primary = value.links

  const calc = useMemo(() => {
    const ferse = parseSohlenaufbauNum(primary.ferse)
    const ballen = parseSohlenaufbauNum(primary.ballen)
    const zwischensohle = ballen
    const absatz = Math.max(0, ferse - ballen)
    const valid = ferse >= ballen
    return { zwischensohle, absatz, valid, ferse, ballen }
  }, [primary.ferse, primary.ballen])

  const hasValues = parseSohlenaufbauNum(primary.ferse) > 0 || parseSohlenaufbauNum(primary.ballen) > 0

  const updateZwLayerFarbe = (idx: number, c: string) => {
    const next = [...value.zwLayerFarben]
    while (next.length <= idx) next.push("#1a1a1a")
    next[idx] = c
    patch({ zwLayerFarben: next })
  }

  const updateAbLayerFarbe = (idx: number, c: string) => {
    const next = [...value.abLayerFarben]
    while (next.length <= idx) next.push("#1a1a1a")
    next[idx] = c
    patch({ abLayerFarben: next })
  }

  const previewData: SohlenaufbauPreviewData = useMemo(() => {
    const zwLayers =
      value.zwSplit.mode === "einteilig"
        ? [{ height: calc.zwischensohle, color: value.zwFarbe }]
        : value.zwSplit.layers.map((v, i) => ({
            height: parseSohlenaufbauNum(v),
            color:
              value.farbModus === "individuell"
                ? value.zwLayerFarben[i] || "#1a1a1a"
                : value.zwFarbe,
          }))

    const abLayers =
      value.abSplit.mode === "einteilig"
        ? [{ height: calc.absatz, color: value.abFarbe }]
        : value.abSplit.layers.map((v, i) => ({
            height: parseSohlenaufbauNum(v),
            color:
              value.farbModus === "individuell"
                ? value.abLayerFarben[i] || "#1a1a1a"
                : value.abFarbe,
          }))

    return {
      zwLayers,
      abLayers,
      ballenHeight: calc.zwischensohle,
      ferseHeight: calc.ferse,
      absatzform: value.absatzform || "keilabsatz",
    }
  }, [calc, value.zwSplit, value.abSplit, value.farbModus, value.zwFarbe, value.abFarbe, value.zwLayerFarben, value.abLayerFarben, value.absatzform])

  const setFarbModus = (farbModus: SohlenaufbauFarbModus) => patch({ farbModus })

  return (
    <ConfigCard
      title="Sohlenaufbau"
      subtitle="Höhen, Form, Schichtaufbau, Farben & Vorschau"
      icon={<Layers size={20} />}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Ausführung</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <RadioOption
              selected={value.mode === "gleich"}
              onClick={() => handleModeChange("gleich")}
              label="Beidseitig identisch"
            />
            <RadioOption
              selected={value.mode === "unterschiedlich"}
              onClick={() => handleModeChange("unterschiedlich")}
              label="Links und rechts unterschiedlich"
            />
          </div>
        </div>

        {value.mode === "gleich" ? (
          <SohlenaufbauHeightGrid values={value.links} onChange={(links) => patch({ links })} />
        ) : (
          <div className="space-y-4">
            <SohlenaufbauHeightGrid values={value.links} onChange={(links) => patch({ links })} label="Links" />
            <SohlenaufbauHeightGrid values={value.rechts} onChange={(rechts) => patch({ rechts })} label="Rechts" />
          </div>
        )}

        {hasValues ? (
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Automatisch berechneter Sohlenaufbau
            </p>
            {calc.valid ? (
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-6">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-800">Zwischensohle</span>
                  <span className="text-sm font-semibold text-gray-900">{calc.zwischensohle} mm</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-800">Absatz</span>
                  <span className="text-sm font-semibold text-gray-900">{calc.absatz} mm</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-600">Fersenhöhe muss ≥ Ballenhöhe sein</p>
            )}
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <div className="space-y-5 border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Schichtaufbau (optional)</p>
            {calc.zwischensohle > 0 ? (
              <SohlenaufbauLayerSplitControl
                label="Zwischensohle"
                total={calc.zwischensohle}
                split={value.zwSplit}
                onChange={(zwSplit) => patch({ zwSplit })}
              />
            ) : null}
            {calc.absatz > 0 ? (
              <SohlenaufbauLayerSplitControl
                label="Absatz"
                total={calc.absatz}
                split={value.abSplit}
                onChange={(abSplit) => patch({ abSplit })}
              />
            ) : null}
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">Absatzform</p>
              <InfoTooltip content="Die gewählte Absatzform beeinflusst die Fertigung und die schematische Form des Fersenbereichs in der 3D-Vorschau." />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {ABSATZ_OPTIONS.map((opt) => (
                <RadioOption
                  key={opt.value}
                  selected={value.absatzform === opt.value}
                  onClick={() => patch({ absatzform: opt.value })}
                  label={opt.label}
                />
              ))}
            </div>
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Farbkonzept</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <RadioOption
                  selected={value.farbModus === "einheitlich"}
                  onClick={() => setFarbModus("einheitlich")}
                  label="Eine Farbe pro Bereich"
                />
                <RadioOption
                  selected={value.farbModus === "individuell"}
                  onClick={() => setFarbModus("individuell")}
                  label="Farben individuell pro Lage"
                />
              </div>
            </div>

            {value.farbModus === "einheitlich" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {calc.zwischensohle > 0 ? (
                  <SohlenaufbauColorPicker value={value.zwFarbe} onChange={(zwFarbe) => patch({ zwFarbe })} label="Zwischensohle" />
                ) : null}
                {calc.absatz > 0 ? (
                  <SohlenaufbauColorPicker value={value.abFarbe} onChange={(abFarbe) => patch({ abFarbe })} label="Absatz" />
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {calc.zwischensohle > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Zwischensohle</p>
                    {(value.zwSplit.mode === "einteilig" ? [0] : value.zwSplit.layers.map((_, i) => i)).map((idx) => (
                      <SohlenaufbauColorPicker
                        key={idx}
                        value={value.zwLayerFarben[idx] || "#1a1a1a"}
                        onChange={(c) => updateZwLayerFarbe(idx, c)}
                        label={value.zwSplit.mode === "einteilig" ? undefined : `Lage ${idx + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
                {calc.absatz > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Absatz</p>
                    {(value.abSplit.mode === "einteilig" ? [0] : value.abSplit.layers.map((_, i) => i)).map((idx) => (
                      <SohlenaufbauColorPicker
                        key={idx}
                        value={value.abLayerFarben[idx] || "#1a1a1a"}
                        onChange={(c) => updateAbLayerFarbe(idx, c)}
                        label={value.abSplit.mode === "einteilig" ? undefined : `Lage ${idx + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">3D-Vorschau</p>
            <div className="overflow-hidden rounded-lg bg-gray-100" style={{ height: 280 }}>
              <SolePreview3D data={previewData} />
            </div>
            <p className="mt-2 text-xs text-gray-500">Schematische Darstellung – nicht maßstabsgetreu</p>
          </div>
        ) : null}
      </div>
    </ConfigCard>
  )
}
