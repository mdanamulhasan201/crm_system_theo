"use client"

import dynamic from "next/dynamic"
import { useCallback, useMemo, useState } from "react"
import { Download, Layers } from "lucide-react"
import toast from "react-hot-toast"
import ConfigCard from "../shared/ConfigCard"
import { RadioOption } from "../shared/RadioOption"
import type { SohlenaufbauData, SohlenaufbauFarbModus } from "../FormFields"
import SohlenaufbauColorPicker from "./SohlenaufbauColorPicker"
import SohlenaufbauLayerSplitControl from "./SohlenaufbauLayerSplitControl"
import SohlenaufbauHeightGrid from "./SohlenaufbauHeightGrid"
import SohlenaufbauShoreSection from "./SohlenaufbauShoreSection"
import SohlenaufbauBiomechanicsPanel from "./SohlenaufbauBiomechanicsPanel"
import { parseSohlenaufbauNum } from "./utils"
import type { SohlenaufbauPreviewData } from "./SolePreview3D"
import { downloadSohlenaufbauGlb } from "./sohlenaufbauExport"
import { getSohlenaufbauPreviewDataFromForm } from "./sohlenaufbauPreviewFromForm"
import {
  getSohlenaufbauShoreForColor,
  sanitizeSohlenaufbauColorsForShore,
  syncSohlenaufbauShoreLayerLengths,
} from "./shoreHelpers"

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
  const apply = useCallback(
    (partial: Partial<SohlenaufbauData>) => {
      let next: SohlenaufbauData = { ...value, ...partial }
      if (partial.verschalungHoehe === "") {
        next.verschalungAusfuehrung = ""
      }
      next = syncSohlenaufbauShoreLayerLengths(next)
      next = sanitizeSohlenaufbauColorsForShore(next)
      onChange(next)
    },
    [value, onChange]
  )

  const handleModeChange = useCallback(
    (mode: "gleich" | "unterschiedlich") => {
      if (mode === "unterschiedlich" && value.mode === "gleich") {
        onChange(
          sanitizeSohlenaufbauColorsForShore(
            syncSohlenaufbauShoreLayerLengths({ ...value, mode, rechts: { ...value.links } })
          )
        )
      } else {
        apply({ mode })
      }
    },
    [value, onChange, apply]
  )

  const primary = value.links

  const calcForSide = useCallback((side: SohlenaufbauData["links"]) => {
    const ferse = parseSohlenaufbauNum(side.ferse)
    const ballen = parseSohlenaufbauNum(side.ballen)
    const spitze = parseSohlenaufbauNum(side.spitze)
    const zwischensohle = ballen
    const absatz = Math.max(0, ferse - ballen)
    const valid = ferse >= ballen
    return { zwischensohle, absatz, valid, ferse, ballen, spitze }
  }, [])

  const calc = useMemo(() => {
    return calcForSide(primary)
  }, [calcForSide, primary])

  const calcLinks = useMemo(() => calcForSide(value.links), [calcForSide, value.links])
  const calcRechts = useMemo(() => calcForSide(value.rechts), [calcForSide, value.rechts])

  const hasValues =
    value.mode === "gleich"
      ? parseSohlenaufbauNum(primary.ferse) > 0 || parseSohlenaufbauNum(primary.ballen) > 0
      : parseSohlenaufbauNum(value.links.ferse) > 0 ||
        parseSohlenaufbauNum(value.links.ballen) > 0 ||
        parseSohlenaufbauNum(value.rechts.ferse) > 0 ||
        parseSohlenaufbauNum(value.rechts.ballen) > 0

  const warnings = useMemo(() => {
    const w: string[] = []
    if (!hasValues || !calc.valid) return w
    if (calc.ballen > 0 && calc.ferse > 0 && calc.ballen < calc.ferse * 0.2) {
      w.push("Ballenhöhe sehr niedrig im Verhältnis zur Absatzhöhe.")
    }
    if (calc.absatz > 0 && calc.absatz < 3) {
      w.push("Materialblock für saubere Fertigung möglicherweise zu gering.")
    }
    if (calc.spitze > calc.ballen) {
      w.push("Spitzenhöhe sollte nicht größer als Ballenhöhe sein.")
    }
    return w
  }, [hasValues, calc])

  const updateZwLayerFarbe = (idx: number, c: string) => {
    const next = [...value.zwLayerFarben]
    while (next.length <= idx) next.push("#1a1a1a")
    next[idx] = c
    apply({ zwLayerFarben: next })
  }

  const updateAbLayerFarbe = (idx: number, c: string) => {
    const next = [...value.abLayerFarben]
    while (next.length <= idx) next.push("#1a1a1a")
    next[idx] = c
    apply({ abLayerFarben: next })
  }

  const previewData: SohlenaufbauPreviewData = useMemo(
    () => getSohlenaufbauPreviewDataFromForm(value),
    [value]
  )

  const setFarbModus = (farbModus: SohlenaufbauFarbModus) => apply({ farbModus })

  const getShore = (area: "zw" | "ab", layerIdx?: number) =>
    getSohlenaufbauShoreForColor(value, area, layerIdx)

  const hasLayerSplit =
    value.farbModus === "individuell" &&
    (value.zwSplit.mode !== "einteilig" || value.abSplit.mode !== "einteilig")

  const zwLayerCount = value.zwSplit.mode === "einteilig" ? 1 : value.zwSplit.layers.length
  const abLayerCount = value.abSplit.mode === "einteilig" ? 1 : value.abSplit.layers.length

  const [exportingGlb, setExportingGlb] = useState(false)

  return (
    <ConfigCard
      title="Sohlenaufbau"
      subtitle="Höhen, Form, Farben, Shore/Material & Vorschau"
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
          <SohlenaufbauHeightGrid values={value.links} onChange={(links) => apply({ links })} />
        ) : (
          <div className="space-y-4">
            <SohlenaufbauHeightGrid values={value.links} onChange={(links) => apply({ links })} label="Links" />
            <SohlenaufbauHeightGrid values={value.rechts} onChange={(rechts) => apply({ rechts })} label="Rechts" />
          </div>
        )}

        {hasValues ? (
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Automatisch berechneter Sohlenaufbau
            </p>
            {value.mode === "gleich" ? (
              calc.valid ? (
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
                <p className="text-xs text-red-600">Ballenhöhe darf nicht größer als Absatzhöhe sein.</p>
              )
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Links</p>
                  {calcLinks.valid ? (
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-800">Zwischensohle</span>
                        <span className="text-sm font-semibold text-gray-900">{calcLinks.zwischensohle} mm</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-800">Absatz</span>
                        <span className="text-sm font-semibold text-gray-900">{calcLinks.absatz} mm</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-red-600">Ballenhöhe darf nicht größer als Absatzhöhe sein.</p>
                  )}
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Rechts</p>
                  {calcRechts.valid ? (
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-800">Zwischensohle</span>
                        <span className="text-sm font-semibold text-gray-900">{calcRechts.zwischensohle} mm</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-800">Absatz</span>
                        <span className="text-sm font-semibold text-gray-900">{calcRechts.absatz} mm</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-red-600">Ballenhöhe darf nicht größer als Absatzhöhe sein.</p>
                  )}
                </div>
              </div>
            )}
            {value.mode === "gleich" && calc.valid && warnings.length > 0 ? (
              <div className="space-y-1 pt-2">
                {warnings.map((w, i) => (
                  <p key={i} className="flex items-center gap-1.5 text-xs text-amber-600">
                    <span aria-hidden>💡</span> {w}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">Material / Shore-Härte</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <RadioOption
                selected={value.shoreModus === "einheitlich"}
                onClick={() => apply({ shoreModus: "einheitlich" })}
                label="Einheitlich für gesamten Aufbau"
              />
              <RadioOption
                selected={value.shoreModus === "individuell"}
                onClick={() => apply({ shoreModus: "individuell" })}
                label="Individuell pro Bereich"
              />
            </div>
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <SohlenaufbauShoreSection
            modus={value.shoreModus}
            onModusChange={(shoreModus) => apply({ shoreModus })}
            globalShore={value.globalShore}
            onGlobalShoreChange={(globalShore) => apply({ globalShore })}
            perArea={value.shorePerArea}
            onPerAreaChange={(shorePerArea) => apply({ shorePerArea })}
            perLayer={value.shorePerLayer}
            onPerLayerChange={(shorePerLayer) => apply({ shorePerLayer })}
            hasZwischensohle={calc.zwischensohle > 0}
            hasAbsatz={calc.absatz > 0}
            hasLayerSplit={hasLayerSplit}
            zwLayerCount={zwLayerCount}
            abLayerCount={abLayerCount}
            hideModeSelector
          />
        ) : null}

        {hasValues && calc.valid ? (
          <div className="space-y-5 border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Schichtaufbau (optional)</p>
            {calc.zwischensohle > 0 ? (
              value.zwSplit.mode === "gleichmaessig" ? (
                <SohlenaufbauLayerSplitControl
                  label="Zwischensohle"
                  total={calc.zwischensohle}
                  split={value.zwSplit}
                  onChange={(zwSplit) => apply({ zwSplit })}
                  sideContent={
                    <div className="lg:w-[220px]">
                      <SohlenaufbauColorPicker
                        value={value.zwFarbe}
                        onChange={(zwFarbe) => apply({ zwFarbe })}
                        label="Zwischensohle"
                        shore={getShore("zw")}
                      />
                    </div>
                  }
                />
              ) : (
                <SohlenaufbauLayerSplitControl
                  label="Zwischensohle"
                  total={calc.zwischensohle}
                  split={value.zwSplit}
                  onChange={(zwSplit) => apply({ zwSplit })}
                />
              )
            ) : null}
            {calc.absatz > 0 ? (
              <div className="space-y-4">
                <SohlenaufbauLayerSplitControl
                  label="Absatz"
                  total={calc.absatz}
                  split={value.abSplit}
                  onChange={(abSplit) => apply({ abSplit })}
                />
                <SohlenaufbauColorPicker
                  value={value.abFarbe}
                  onChange={(abFarbe) => apply({ abFarbe })}
                  label="Absatz"
                  shore={getShore("ab")}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">3D-Vorschau</p>
              <button
                type="button"
                disabled={exportingGlb}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#6B9B87] bg-[#6B9B87] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a8a72] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={async () => {
                  setExportingGlb(true)
                  try {
                    const ok = await downloadSohlenaufbauGlb(previewData)
                    if (!ok) {
                      toast.error("Keine Schichten zum Export – bitte Höhen prüfen.")
                    }
                  } catch {
                    toast.error("GLB-Export fehlgeschlagen.")
                  } finally {
                    setExportingGlb(false)
                  }
                }}
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                {exportingGlb ? "Wird erstellt…" : "3D herunterladen (GLB, mit Farben)"}
              </button>
            </div>
            <div className="relative h-[280px] w-full overflow-hidden rounded-lg bg-gray-100">
              <SolePreview3D data={previewData} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Schematische Darstellung – nicht maßstabsgetreu. Die GLB-Datei enthält die Farben aus dem Farbkonzept (z. B.
              für Blender).
            </p>
          </div>
        ) : null}

        {hasValues && calc.valid ? (
          <SohlenaufbauBiomechanicsPanel
            ferseHeight={calc.ferse}
            ballenHeight={calc.ballen}
            spitzeHeight={calc.spitze}
          />
        ) : null}
      </div>
    </ConfigCard>
  )
}
