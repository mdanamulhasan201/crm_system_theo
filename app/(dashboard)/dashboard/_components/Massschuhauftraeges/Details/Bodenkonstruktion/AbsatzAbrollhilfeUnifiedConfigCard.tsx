"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Footprints, SlidersHorizontal } from "lucide-react"
import type { GroupDef2 } from "../Types"
import type { HeelWidthAdjustmentData } from "./FormFields"
import ConfigCard from "./shared/ConfigCard"
import OptionCard from "./shared/OptionCard"
import { RadioOption } from "./shared/RadioOption"
import InputWithUnit from "./shared/InputWithUnit"

function parseMmCell(raw: string): { op: "widen" | "narrow" | null; mm: number } {
  const t = raw.trim().replace(",", ".")
  if (!t || t === "±0" || t === "+0" || t === "-0" || t === "0") return { op: null, mm: 0 }
  const isNeg = /^-/.test(t)
  const num = parseFloat(t.replace(/^[+±-]/, ""))
  if (!Number.isFinite(num) || num === 0) return { op: null, mm: 0 }
  const mm = Math.min(10, Math.max(1, Math.round(Math.abs(num))))
  return { op: isNeg ? "narrow" : "widen", mm }
}

function formatMmCell(p: { op: "widen" | "narrow" | null; mm: number } | undefined): string {
  if (!p || !p.mm) return ""
  return p.op === "narrow" ? `-${p.mm}` : `+${p.mm}`
}

function isAbsatzformDisabled(
  optId: string,
  selectedSole: { id: string } | null | undefined
): boolean {
  const id = selectedSole?.id
  if (id === "1" && (optId === "Keilabsatz" || optId === "Stegkeil")) return true
  if ((id === "2" || id === "3") && optId === "Absatzkeil") return true
  if (id === "8" && (optId === "Stegkeil" || optId === "Absatzkeil")) return true
  if ((id === "9" || id === "10" || id === "11" || id === "12") && (optId === "Keilabsatz" || optId === "Stegkeil")) {
    return true
  }
  return false
}

function isAbrollhilfeDisabled(
  optId: string,
  selectedSole: { id: string } | null | undefined
): boolean {
  const id = selectedSole?.id
  if ((id === "9" || id === "10" || id === "11" || id === "12") && optId === "abzezzolle") return true
  return false
}

export default function AbsatzAbrollhilfeUnifiedConfigCard({
  absatzformDef,
  abrollhilfeDef,
  selectedAbsatzform,
  selectedAbrollhilfe,
  onAbsatzformSelect,
  onAbrollhilfeReplace,
  onAbsatzFormClick,
  heelWidthAdjustment,
  onHeelWidthChange,
  selectedSole,
}: {
  absatzformDef: GroupDef2
  abrollhilfeDef: GroupDef2
  selectedAbsatzform: string | null
  selectedAbrollhilfe: string | string[] | null
  onAbsatzformSelect: (optId: string | null) => void
  /** Single-select UX: one roller or keine (replaces multi-array with one id). */
  onAbrollhilfeReplace: (ids: string[] | null) => void
  onAbsatzFormClick?: (groupId: string, optionId: string) => void
  heelWidthAdjustment: HeelWidthAdjustmentData | null
  onHeelWidthChange: (v: HeelWidthAdjustmentData | null) => void
  selectedSole?: { id: string } | null
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [absatzbreiteEnabled, setAbsatzbreiteEnabled] = useState(() => {
    const h = heelWidthAdjustment
    if (!h) return false
    return Boolean(
      h.leftMedial?.mm ||
        h.leftLateral?.mm ||
        h.rightMedial?.mm ||
        h.rightLateral?.mm ||
        h.left?.mm ||
        h.right?.mm
    )
  })

  useEffect(() => {
    const h = heelWidthAdjustment
    if (!h) return
    const has =
      h.leftMedial?.mm ||
      h.leftLateral?.mm ||
      h.rightMedial?.mm ||
      h.rightLateral?.mm ||
      h.left?.mm ||
      h.right?.mm
    if (has) setAbsatzbreiteEnabled(true)
  }, [heelWidthAdjustment])

  const abrollArray = useMemo(() => {
    const v = selectedAbrollhilfe
    if (!v) return [] as string[]
    return Array.isArray(v) ? v : [v]
  }, [selectedAbrollhilfe])

  const abrollSingle = abrollArray.length === 1 ? abrollArray[0] : abrollArray.length > 1 ? abrollArray[0] : null

  const lm = formatMmCell(heelWidthAdjustment?.leftMedial)
  const ll = formatMmCell(heelWidthAdjustment?.leftLateral)
  const rm = formatMmCell(heelWidthAdjustment?.rightMedial)
  const rl = formatMmCell(heelWidthAdjustment?.rightLateral)

  const patchHeel = (key: keyof HeelWidthAdjustmentData, raw: string) => {
    const parsed = parseMmCell(raw)
    const base: HeelWidthAdjustmentData = { ...(heelWidthAdjustment || {}) }
    if (!parsed.mm || !parsed.op) {
      delete (base as Record<string, unknown>)[key]
    } else {
      ;(base as Record<string, unknown>)[key] = parsed
    }
    const has =
      base.leftMedial?.mm ||
      base.leftLateral?.mm ||
      base.rightMedial?.mm ||
      base.rightLateral?.mm
    onHeelWidthChange(has ? base : null)
  }

  const handleAbsatzClick = (optId: string) => {
    if (isAbsatzformDisabled(optId, selectedSole)) return
    if (onAbsatzFormClick) {
      onAbsatzFormClick("absatzform", optId)
    } else {
      onAbsatzformSelect(selectedAbsatzform === optId ? null : optId)
    }
  }

  const handleAbrollClick = (optId: string) => {
    if (isAbrollhilfeDisabled(optId, selectedSole)) return
    if (abrollSingle === optId) {
      onAbrollhilfeReplace(null)
    } else {
      onAbrollhilfeReplace([optId])
    }
  }

  return (
    <ConfigCard
      title="Absatz & Abrollhilfe"
      subtitle="Absatzform und Abrollhilfe auswählen"
      icon={<Footprints size={20} />}
    >
      <div className="space-y-6">
        {/* Absatzform */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">Absatzform</p>
          <p className="text-xs text-gray-500">Achtung: Bitte auch Sohle beachten, ob möglich</p>
          <div className="flex flex-wrap gap-2">
            {absatzformDef.options.map((opt) => {
              const dis = Boolean(opt.disabled || isAbsatzformDisabled(opt.id, selectedSole))
              const selected = !dis && selectedAbsatzform === opt.id
              return (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={selected}
                  disabled={dis}
                  onClick={() => handleAbsatzClick(opt.id)}
                />
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Abrollhilfe */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">{abrollhilfeDef.question}</p>
          <div className="flex flex-wrap gap-2">
            {abrollhilfeDef.options.map((opt) => {
              const dis = Boolean(opt.disabled || isAbrollhilfeDisabled(opt.id, selectedSole))
              const selected = !dis && abrollSingle === opt.id
              return (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={selected}
                  disabled={dis}
                  onClick={() => handleAbrollClick(opt.id)}
                />
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Erweiterte Produktionsoptionen */}
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="flex w-full items-center justify-between py-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-gray-500" />
              Erweiterte Produktionsoptionen anzeigen
            </span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>

          {advancedOpen ? (
            <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
              <RadioOption
                selected={absatzbreiteEnabled}
                onClick={() => {
                  const next = !absatzbreiteEnabled
                  setAbsatzbreiteEnabled(next)
                  if (!next) onHeelWidthChange(null)
                }}
                label="Absatzbreite anpassen (mm) (Optional)"
              />

              {absatzbreiteEnabled ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_1fr_1fr] gap-x-3 gap-y-2 sm:items-end">
                    <div />
                    <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Links</p>
                    <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Rechts</p>

                    <p className="self-center text-xs font-medium text-gray-600">Innen (medial)</p>
                    <InputWithUnit
                      value={lm}
                      onChange={(v) => patchHeel("leftMedial", v)}
                      unit="mm"
                      placeholder="±0"
                      className="rounded-full border-gray-200 bg-gray-50/90"
                    />
                    <InputWithUnit
                      value={rm}
                      onChange={(v) => patchHeel("rightMedial", v)}
                      unit="mm"
                      placeholder="±0"
                      className="rounded-full border-gray-200 bg-gray-50/90"
                    />

                    <p className="self-center text-xs font-medium text-gray-600">Außen (lateral)</p>
                    <InputWithUnit
                      value={ll}
                      onChange={(v) => patchHeel("leftLateral", v)}
                      unit="mm"
                      placeholder="±0"
                      className="rounded-full border-gray-200 bg-gray-50/90"
                    />
                    <InputWithUnit
                      value={rl}
                      onChange={(v) => patchHeel("rightLateral", v)}
                      unit="mm"
                      placeholder="±0"
                      className="rounded-full border-gray-200 bg-gray-50/90"
                    />
                  </div>
                  <p className="text-xs text-gray-500">+ = aufbauen · − = einschleifen</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </ConfigCard>
  )
}
