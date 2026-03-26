"use client"

import { useState, useMemo, useCallback } from "react"
import { ChevronDown, Calculator, Check, X, Info, AlertTriangle, Pencil, Lock } from "lucide-react"
import InputWithUnit from "../shared/InputWithUnit"
import { RadioOption } from "../shared/RadioOption"

interface BiomechanicsProps {
  ferseHeight: number
  ballenHeight: number
  spitzeHeight: number
}

const NUMBERS = ["①", "②", "③", "④", "⑤", "⑥"] as const

type SourceState = "auto" | "abgeleitet" | "manuell"

interface MeasureDef {
  num: string
  label: string
}

const MEASURE_DEFS: MeasureDef[] = [
  { num: NUMBERS[0], label: "Spitzenhub (Brutto)" },
  { num: NUMBERS[1], label: "Strecke Scheitelpunkt → Leistenspitze" },
  { num: NUMBERS[2], label: "Strecke Scheitelpunkt → Fersenauftrittspunkt" },
  { num: NUMBERS[3], label: "Absatzsprengung" },
  { num: NUMBERS[4], label: "Zwischenlaufsohle (Ballenmaß konstant)" },
  { num: NUMBERS[5], label: "Strecke Scheitelpunkt → proximales Leistenende" },
]

function MeasureRow({
  def,
  value,
  source,
  editing,
  editValue,
  onEdit,
  onEditChange,
  onEditConfirm,
  onEditCancel,
  highlighted,
  onHover,
}: {
  def: MeasureDef
  value: number | null
  source: SourceState
  editing: boolean
  editValue: string
  onEdit: () => void
  onEditChange: (v: string) => void
  onEditConfirm: () => void
  onEditCancel: () => void
  highlighted: boolean
  onHover: (num: string | null) => void
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
        highlighted ? "bg-[#61A175]/10" : ""
      }`}
      onMouseEnter={() => onHover(def.num)}
      onMouseLeave={() => onHover(null)}
    >
      <span
        className={`w-6 shrink-0 text-center text-base font-bold ${
          value !== null ? "text-[#61A175]" : "text-gray-300"
        }`}
      >
        {def.num}
      </span>
      {value !== null ? <Check size={13} className="shrink-0 text-[#61A175]" /> : <X size={13} className="shrink-0 text-gray-300" />}
      <span
        className={`min-w-0 flex-1 truncate text-xs ${value !== null ? "text-gray-900" : "text-gray-400"}`}
      >
        {def.label}
      </span>

      {editing ? (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <input
            type="number"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditConfirm()
              if (e.key === "Escape") onEditCancel()
            }}
            className="h-6 w-16 rounded border border-[#61A175] bg-white px-1.5 text-xs text-gray-900 tabular-nums focus:outline-none"
            autoFocus
          />
          <span className="text-[10px] text-gray-500">mm</span>
          <button type="button" onClick={onEditConfirm} className="text-[#61A175] hover:text-[#61A175]/80">
            <Check size={12} />
          </button>
          <button type="button" onClick={onEditCancel} className="text-gray-500 hover:text-gray-900">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {value !== null ? (
            <span className="text-sm font-semibold tabular-nums text-gray-900">{value.toFixed(1)} mm</span>
          ) : null}
          <span
            className={`text-[10px] italic ${source === "manuell" ? "text-[#61A175]/70" : "text-gray-400"}`}
          >
            {source}
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-0.5 text-gray-400 transition-colors hover:bg-[#61A175]/10 hover:text-[#61A175]"
            title="Bearbeiten"
          >
            <Pencil size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

function CompletenessBadge({ status }: { status: "complete" | "partial" | "incomplete" }) {
  if (status === "complete")
    return (
      <div className="flex items-center gap-1.5 text-[#61A175]">
        <Check size={14} />
        <span className="text-xs font-medium">Vollständige Berechnung möglich</span>
      </div>
    )
  if (status === "partial")
    return (
      <div className="flex items-center gap-1.5 text-amber-500">
        <Info size={14} />
        <span className="text-xs font-medium">Werte basieren auf geometrischer Näherung</span>
      </div>
    )
  return (
    <div className="flex items-center gap-1.5 text-gray-500">
      <AlertTriangle size={14} />
      <span className="text-xs font-medium">Für exakte Berechnung fehlen noch Angaben</span>
    </div>
  )
}

export default function SohlenaufbauBiomechanicsPanel({
  ferseHeight,
  ballenHeight,
  spitzeHeight,
}: BiomechanicsProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"auto" | "manual">("auto")
  const [highlightedNum, setHighlightedNum] = useState<string | null>(null)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editBuf, setEditBuf] = useState("")
  const [spitzenhubNetto, setSpitzenhubNetto] = useState("")
  const [overrides, setOverrides] = useState<(number | null)[]>([null, null, null, null, null, null])
  const [manualBeta, setManualBeta] = useState("")
  const [manualAlpha, setManualAlpha] = useState("")

  const setOverride = useCallback((idx: number, val: number | null) => {
    setOverrides((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }, [])

  const measures = useMemo(() => {
    const ballenSpitzeDiff = ballenHeight - spitzeHeight
    const netto = spitzenhubNetto !== "" ? parseFloat(spitzenhubNetto) : null

    const autoValues: (number | null)[] = [
      netto !== null && ballenHeight > 0 && spitzeHeight >= 0
        ? netto + ballenSpitzeDiff
        : ballenHeight > 0 && spitzeHeight >= 0 && ballenSpitzeDiff > 0
          ? ballenSpitzeDiff
          : null,
      null,
      null,
      ferseHeight > 0 && ballenHeight > 0 ? ferseHeight - ballenHeight : null,
      ballenHeight > 0 ? ballenHeight : null,
      null,
    ]

    const autoSources: SourceState[] = [
      netto !== null ? "abgeleitet" : autoValues[0] !== null ? "abgeleitet" : "manuell",
      "manuell",
      "manuell",
      autoValues[3] !== null ? "auto" : "manuell",
      autoValues[4] !== null ? "auto" : "manuell",
      "manuell",
    ]

    const finalValues: (number | null)[] = []
    const finalSources: SourceState[] = []
    for (let i = 0; i < 6; i++) {
      if (overrides[i] !== null) {
        finalValues.push(overrides[i])
        finalSources.push("manuell")
      } else {
        finalValues.push(autoValues[i])
        finalSources.push(autoSources[i])
      }
    }

    return { values: finalValues, sources: finalSources, ballenSpitzeDiff, netto }
  }, [ferseHeight, ballenHeight, spitzeHeight, spitzenhubNetto, overrides])

  const angles = useMemo(() => {
    const [m1, m2, , m4, , m6] = measures.values
    const beta = m4 !== null && m6 !== null && m6 !== 0 ? (Math.atan(m4 / m6) * 180) / Math.PI : NaN
    const alpha = m1 !== null && m2 !== null && m2 !== 0 ? (Math.atan(m1 / m2) * 180) / Math.PI : NaN
    return { beta, alpha }
  }, [measures.values])

  const displayBeta = mode === "manual" && manualBeta ? parseFloat(manualBeta) : angles.beta
  const displayAlpha = mode === "manual" && manualAlpha ? parseFloat(manualAlpha) : angles.alpha

  const completeness = useMemo(() => {
    const filled = measures.values.filter((v) => v !== null).length
    if (filled === 6) return "complete" as const
    if (filled >= 3) return "partial" as const
    return "incomplete" as const
  }, [measures.values])

  const warnings: string[] = []
  if (isFinite(displayBeta) && displayBeta < 0) warnings.push("Einrollwinkel β ist negativ – Absatzsprengung prüfen.")
  if (isFinite(displayAlpha) && displayAlpha < 0) warnings.push("Ausrollwinkel α ist negativ – Spitzensprengung prüfen.")
  if (isFinite(displayBeta) && Math.abs(displayBeta) > 25) warnings.push("Einrollwinkel β außerhalb üblicher Bereiche (>25°).")
  if (isFinite(displayAlpha) && Math.abs(displayAlpha) > 20) warnings.push("Ausrollwinkel α außerhalb üblicher Bereiche (>20°).")

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditBuf(measures.values[idx]?.toFixed(1) ?? "")
  }
  const confirmEdit = () => {
    if (editingIdx === null) return
    const val = parseFloat(editBuf)
    if (!isNaN(val)) setOverride(editingIdx, val)
    setEditingIdx(null)
  }
  const cancelEdit = () => setEditingIdx(null)
  const clearOverride = (idx: number) => setOverride(idx, null)

  const hasNetto = spitzenhubNetto !== "" && parseFloat(spitzenhubNetto) >= 0
  const showNettoInput = overrides[0] === null

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <span className="flex items-center gap-2">
          <Calculator size={16} />
          Biomechanische Berechnung anzeigen
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="overflow-hidden pb-4">
          <div className="space-y-5">
            <div className="rounded-lg bg-gray-100/80 p-3">
              <p className="text-xs leading-relaxed text-gray-600">
                Die Schuhzurichtung imitiert eine Gelenkbewegung bzw. Rotation. Einrollwinkel (β) und Ausrollwinkel (α)
                werden aus den Konstruktionsmaßen ①–⑥ berechnet. Alle Werte können manuell überschrieben werden.
              </p>
            </div>

            {showNettoInput ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Spitzenhub – Ableitung für ①</p>
                <div className="space-y-3 rounded-lg bg-gray-50 p-3">
                  <InputWithUnit
                    label="Spitzenhub Leisten (Netto)"
                    value={spitzenhubNetto}
                    onChange={setSpitzenhubNetto}
                    unit="mm"
                    placeholder="0"
                  />
                  <p className="text-[10px] leading-relaxed text-gray-500">
                    Gemessen am Leisten vor dem Aufzwicken / vor Sohlenaufbau.
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">Differenz Ballen → Spitze:</span>
                    <span className="font-semibold tabular-nums text-gray-900">
                      {measures.ballenSpitzeDiff.toFixed(1)} mm
                    </span>
                    <span className="italic text-gray-400">(auto)</span>
                  </div>
                  <div className="flex items-center gap-3 border-t border-gray-200/80 pt-2 text-xs">
                    <span className="font-bold text-[#61A175]">①</span>
                    <span className="text-gray-500">Spitzenhub (Brutto):</span>
                    <span className="font-semibold tabular-nums text-gray-900">
                      {measures.values[0] !== null ? `${measures.values[0]!.toFixed(1)} mm` : "–"}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-gray-400">
                    ① = Netto + (Ballenhöhe − Spitzenhöhe)
                    {hasNetto &&
                      ` = ${parseFloat(spitzenhubNetto).toFixed(1)} + ${measures.ballenSpitzeDiff.toFixed(1)} = ${measures.values[0]?.toFixed(1)}`}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Messsystem (Referenz ①–⑥)</p>
                {overrides.some((o) => o !== null) ? (
                  <button
                    type="button"
                    onClick={() => setOverrides([null, null, null, null, null, null])}
                    className="text-[10px] text-gray-400 transition-colors hover:text-[#61A175]"
                  >
                    Alle Überschreibungen zurücksetzen
                  </button>
                ) : null}
              </div>
              <div className="space-y-0 rounded-lg bg-gray-50 p-1.5">
                {MEASURE_DEFS.map((def, i) => (
                  <MeasureRow
                    key={i}
                    def={def}
                    value={measures.values[i]}
                    source={measures.sources[i]}
                    editing={editingIdx === i}
                    editValue={editBuf}
                    onEdit={() => startEdit(i)}
                    onEditChange={setEditBuf}
                    onEditConfirm={confirmEdit}
                    onEditCancel={cancelEdit}
                    highlighted={highlightedNum === def.num}
                    onHover={setHighlightedNum}
                  />
                ))}
              </div>

              {overrides.some((o) => o !== null) ? (
                <div className="flex flex-wrap gap-1.5">
                  {overrides.map((o, i) =>
                    o !== null ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => clearOverride(i)}
                        className="flex items-center gap-1 rounded bg-[#61A175]/10 px-1.5 py-0.5 text-[10px] text-[#61A175] transition-colors hover:bg-[#61A175]/20"
                      >
                        <Lock size={9} /> {NUMBERS[i]} manuell
                        <X size={9} />
                      </button>
                    ) : null
                  )}
                </div>
              ) : null}

              <CompletenessBadge status={completeness} />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-[10px] leading-relaxed text-gray-500">
                <span className="font-medium text-gray-600">Hinweis zum Scheitelpunkt:</span> Alle Streckenmaße ②, ③ und
                ⑥ werden horizontal vom definierten Scheitelpunkt aus gemessen. Der Scheitelpunkt ist der funktionelle
                Drehpunkt der Abrollbewegung.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Berechnungsmodus</p>
              <div className="flex gap-x-6">
                <RadioOption selected={mode === "auto"} onClick={() => setMode("auto")} label="Automatisch (empfohlen)" />
                <RadioOption selected={mode === "manual"} onClick={() => setMode("manual")} label="Manuell (Expertenmodus)" />
              </div>
            </div>

            {mode === "manual" ? (
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                <InputWithUnit
                  label="Einrollwinkel β"
                  value={manualBeta}
                  onChange={setManualBeta}
                  unit="°"
                  placeholder={isFinite(angles.beta) ? angles.beta.toFixed(1) : "0"}
                />
                <InputWithUnit
                  label="Ausrollwinkel α"
                  value={manualAlpha}
                  onChange={setManualAlpha}
                  unit="°"
                  placeholder={isFinite(angles.alpha) ? angles.alpha.toFixed(1) : "0"}
                />
              </div>
            ) : null}

            <div className="space-y-3 rounded-lg bg-gray-100/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Berechnete Werte</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Einrollwinkel β</p>
                  <p className="text-xl font-bold tabular-nums text-gray-900">
                    {isFinite(displayBeta) ? `${displayBeta.toFixed(1)}°` : "–"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Ausrollwinkel α</p>
                  <p className="text-xl font-bold tabular-nums text-gray-900">
                    {isFinite(displayAlpha) ? `${displayAlpha.toFixed(1)}°` : "–"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-gray-200/80 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Formeln (Referenz)</p>
                <div className="space-y-1.5 rounded bg-gray-50 p-2.5 font-mono text-xs text-gray-600">
                  <p>
                    <span className="font-bold text-[#61A175]">①</span>
                    {" = Netto + (Ballenhöhe − Spitzenhöhe)"}
                    {measures.values[0] !== null && measures.netto !== null && (
                      <span className="ml-2 text-gray-400">
                        = {measures.netto.toFixed(1)} + {measures.ballenSpitzeDiff.toFixed(1)} ={" "}
                        {measures.values[0]!.toFixed(1)} mm
                      </span>
                    )}
                    {measures.values[0] !== null && measures.netto === null && measures.sources[0] === "manuell" && (
                      <span className="ml-2 italic text-[#61A175]/60">manuell: {measures.values[0]!.toFixed(1)} mm</span>
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">β</span>
                    {" = arctan( "}
                    <span className="font-bold text-[#61A175]">④</span>
                    {" / "}
                    <span className="font-bold text-[#61A175]">⑥</span>
                    {" )"}
                    {isFinite(displayBeta) && measures.values[3] !== null && measures.values[5] !== null && (
                      <span className="ml-2 text-gray-400">
                        = arctan({measures.values[3]!.toFixed(1)} / {measures.values[5]!.toFixed(0)}) ={" "}
                        {displayBeta.toFixed(1)}°
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">α</span>
                    {" = arctan( "}
                    <span className="font-bold text-[#61A175]">①</span>
                    {" / "}
                    <span className="font-bold text-[#61A175]">②</span>
                    {" )"}
                    {isFinite(displayAlpha) && measures.values[0] !== null && measures.values[1] !== null && (
                      <span className="ml-2 text-gray-400">
                        = arctan({measures.values[0]!.toFixed(1)} / {measures.values[1]!.toFixed(0)}) ={" "}
                        {displayAlpha.toFixed(1)}°
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Scheitelpunkt</span>
                  <span className="text-sm font-medium text-gray-900">automatisch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Standfläche</span>
                  <span className="text-sm font-medium text-gray-900">berechnet</span>
                </div>
              </div>
            </div>

            {warnings.length > 0 ? (
              <div className="space-y-1">
                {warnings.map((w, i) => (
                  <p key={i} className="flex items-center gap-1.5 text-xs text-amber-600">
                    <span>⚠</span> {w}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
