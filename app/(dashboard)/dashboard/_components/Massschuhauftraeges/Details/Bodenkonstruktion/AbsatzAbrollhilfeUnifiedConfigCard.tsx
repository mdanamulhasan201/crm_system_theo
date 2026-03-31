"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Footprints, SlidersHorizontal } from "lucide-react"
import { FiMinus, FiPlus, FiX } from "react-icons/fi"
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
  selectedSole: { id: string } | null | undefined,
  selectedAbrollhilfe: string | null
): boolean {
  if (
    selectedAbrollhilfe === "beilemdie" &&
    optId !== "beilemdie" &&
    optId !== "abzezzolle"
  ) {
    return true
  }
  if (
    selectedAbrollhilfe === "abzezzolle" &&
    optId !== "abzezzolle" &&
    optId !== "beilemdie"
  ) {
    return true
  }
  if (
    selectedAbrollhilfe === "mittelfussrolle" &&
    optId !== "mittelfussrolle" &&
    optId !== "abzezzolle"
  ) {
    return true
  }
  if (
    selectedAbrollhilfe === "keine" &&
    (optId === "mittelfussrolle" || optId === "abzezzolle" || optId === "beilemdie")
  ) {
    return true
  }
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
  const abrollhilfeDisplayOrder: Record<string, number> = {
    keine: 0,
    abzezzolle: 1,
    mittelfussrolle: 2,
    beilemdie: 3,
  }
  const orderedAbrollhilfeOptions = [...abrollhilfeDef.options].sort((a, b) => {
    const aOrder = abrollhilfeDisplayOrder[a.id] ?? Number.MAX_SAFE_INTEGER
    const bOrder = abrollhilfeDisplayOrder[b.id] ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })

  const lm = formatMmCell(heelWidthAdjustment?.leftMedial)
  const ll = formatMmCell(heelWidthAdjustment?.leftLateral)
  const rm = formatMmCell(heelWidthAdjustment?.rightMedial)
  const rl = formatMmCell(heelWidthAdjustment?.rightLateral)
  const [heelDrafts, setHeelDrafts] = useState<Record<"leftMedial" | "rightMedial" | "leftLateral" | "rightLateral", string>>({
    leftMedial: lm,
    rightMedial: rm,
    leftLateral: ll,
    rightLateral: rl,
  })

  useEffect(() => {
    setHeelDrafts({
      leftMedial: lm,
      rightMedial: rm,
      leftLateral: ll,
      rightLateral: rl,
    })
  }, [lm, rm, ll, rl])

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

  const sanitizeSignedMmInput = (raw: string, previous: string): string => {
    const trimmed = raw.trim()
    if (!trimmed) return ""
    const sign = trimmed[0]
    if (sign !== "+" && sign !== "-") {
      return previous
    }
    const digits = trimmed.slice(1).replace(/\D/g, "").slice(0, 2)
    return `${sign}${digits}`
  }

  const handleHeelInputChange = (
    key: "leftMedial" | "rightMedial" | "leftLateral" | "rightLateral",
    value: string
  ) => {
    setHeelDrafts((prev) => {
      const next = sanitizeSignedMmInput(value, prev[key])
      if (!next) {
        patchHeel(key, "")
      } else if (/^[+-]\d+$/.test(next)) {
        patchHeel(key, next)
      }
      return { ...prev, [key]: next }
    })
  }

  const setHeelSign = (
    key: "leftMedial" | "rightMedial" | "leftLateral" | "rightLateral",
    sign: "+" | "-"
  ) => {
    setHeelDrafts((prev) => {
      const current = prev[key] || ""
      const digits = current.replace(/^[+-]/, "").replace(/\D/g, "").slice(0, 2)
      const next = `${sign}${digits}`
      if (digits) {
        patchHeel(key, next)
      }
      return { ...prev, [key]: next }
    })
  }

  const clearHeelField = (key: "leftMedial" | "rightMedial" | "leftLateral" | "rightLateral") => {
    setHeelDrafts((prev) => ({ ...prev, [key]: "" }))
    patchHeel(key, "")
  }

  const getActiveSign = (key: "leftMedial" | "rightMedial" | "leftLateral" | "rightLateral"): "+" | "-" | null => {
    const value = heelDrafts[key]?.trim()
    if (!value) return null
    if (value.startsWith("+")) return "+"
    if (value.startsWith("-")) return "-"
    return null
  }

  const signButtonClass = (isActive: boolean) =>
    `inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-bold leading-none shadow-sm transition-all ${
      isActive
        ? "border-[#6B9B87] bg-[#6B9B87] text-white shadow-[0_0_0_3px_rgba(107,155,135,0.18)]"
        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
    }`
  const clearButtonClass =
    "inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold leading-none text-rose-500 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-600"
  const heelInputClass =
    "h-9 w-full min-w-0 rounded-full border-gray-200 bg-white shadow-sm"
  const heelControlRowClass = "grid w-full grid-cols-[36px_36px_minmax(0,1fr)_36px] items-center gap-2"

  const handleAbsatzClick = (optId: string) => {
    if (isAbsatzformDisabled(optId, selectedSole)) return
    if (onAbsatzFormClick) {
      onAbsatzFormClick("absatzform", optId)
    } else {
      onAbsatzformSelect(selectedAbsatzform === optId ? null : optId)
    }
  }

  const handleAbrollClick = (optId: string) => {
    if (isAbrollhilfeDisabled(optId, selectedSole, abrollSingle)) return
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
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-sm font-semibold text-gray-900">Absatzform</p>
          <p className="text-xs text-gray-500">Achtung: Bitte auch Sohle beachten, ob moeglich</p>
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

        <div className="border-t border-gray-100" />

        {/* Abrollhilfe */}
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-sm font-semibold text-gray-900">{abrollhilfeDef.question}</p>
          <p className="text-xs text-gray-500">Optionen werden je nach Auswahl intelligent eingeschraenkt.</p>
          <div className="flex flex-wrap gap-2">
            {orderedAbrollhilfeOptions.map((opt) => {
              const dis = Boolean(opt.disabled || isAbrollhilfeDisabled(opt.id, selectedSole, abrollSingle))
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

        <div className="border-t border-gray-100" />

        {/* Erweiterte Produktionsoptionen */}
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-gray-500" />
              Erweiterte Produktionsoptionen anzeigen
            </span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>

          {advancedOpen ? (
            <div className="mt-4 space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
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
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-[minmax(0,1fr)_1fr_1fr] md:items-end">
                    <div className="hidden md:block" />
                    <p className="hidden text-center text-xs font-semibold uppercase tracking-wide text-gray-500 md:block">Links</p>
                    <p className="hidden text-center text-xs font-semibold uppercase tracking-wide text-gray-500 md:block">Rechts</p>

                    <p className="self-center text-xs font-medium text-gray-600 md:col-auto">Innen (medial)</p>
                    <div className={heelControlRowClass}>
                      <p className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">Links</p>
                      {(() => {
                        const activeSign = getActiveSign("leftMedial")
                        return (
                          <>
                      <button
                        type="button"
                        onClick={() => setHeelSign("leftMedial", "+")}
                        className={signButtonClass(activeSign === "+")}
                        aria-label="Plus"
                      >
                        <FiPlus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeelSign("leftMedial", "-")}
                        className={signButtonClass(activeSign === "-")}
                        aria-label="Minus"
                      >
                        <FiMinus size={14} />
                      </button>
                          </>
                        )
                      })()}
                      <InputWithUnit
                        value={heelDrafts.leftMedial}
                        onChange={(v) => handleHeelInputChange("leftMedial", v)}
                        unit="mm"
                        className={heelInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => clearHeelField("leftMedial")}
                        className={clearButtonClass}
                        aria-label="Feld leeren"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                    <div className={heelControlRowClass}>
                      <p className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">Rechts</p>
                      {(() => {
                        const activeSign = getActiveSign("rightMedial")
                        return (
                          <>
                      <button
                        type="button"
                        onClick={() => setHeelSign("rightMedial", "+")}
                        className={signButtonClass(activeSign === "+")}
                        aria-label="Plus"
                      >
                        <FiPlus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeelSign("rightMedial", "-")}
                        className={signButtonClass(activeSign === "-")}
                        aria-label="Minus"
                      >
                        <FiMinus size={14} />
                      </button>
                          </>
                        )
                      })()}
                      <InputWithUnit
                        value={heelDrafts.rightMedial}
                        onChange={(v) => handleHeelInputChange("rightMedial", v)}
                        unit="mm"
                        className={heelInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => clearHeelField("rightMedial")}
                        className={clearButtonClass}
                        aria-label="Feld leeren"
                      >
                        <FiX size={14} />
                      </button>
                    </div>

                    <p className="self-center text-xs font-medium text-gray-600 md:col-auto">Außen (lateral)</p>
                    <div className={heelControlRowClass}>
                      <p className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">Links</p>
                      {(() => {
                        const activeSign = getActiveSign("leftLateral")
                        return (
                          <>
                      <button
                        type="button"
                        onClick={() => setHeelSign("leftLateral", "+")}
                        className={signButtonClass(activeSign === "+")}
                        aria-label="Plus"
                      >
                        <FiPlus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeelSign("leftLateral", "-")}
                        className={signButtonClass(activeSign === "-")}
                        aria-label="Minus"
                      >
                        <FiMinus size={14} />
                      </button>
                          </>
                        )
                      })()}
                      <InputWithUnit
                        value={heelDrafts.leftLateral}
                        onChange={(v) => handleHeelInputChange("leftLateral", v)}
                        unit="mm"
                        className={heelInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => clearHeelField("leftLateral")}
                        className={clearButtonClass}
                        aria-label="Feld leeren"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                    <div className={heelControlRowClass}>
                      <p className="col-span-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">Rechts</p>
                      {(() => {
                        const activeSign = getActiveSign("rightLateral")
                        return (
                          <>
                      <button
                        type="button"
                        onClick={() => setHeelSign("rightLateral", "+")}
                        className={signButtonClass(activeSign === "+")}
                        aria-label="Plus"
                      >
                        <FiPlus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeelSign("rightLateral", "-")}
                        className={signButtonClass(activeSign === "-")}
                        aria-label="Minus"
                      >
                        <FiMinus size={14} />
                      </button>
                          </>
                        )
                      })()}
                      <InputWithUnit
                        value={heelDrafts.rightLateral}
                        onChange={(v) => handleHeelInputChange("rightLateral", v)}
                        unit="mm"
                        className={heelInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => clearHeelField("rightLateral")}
                        className={clearButtonClass}
                        aria-label="Feld leeren"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Regel: zuerst + / - eingeben, danach Zahl.</p>
                  <p className="text-xs text-gray-500">+ = aufbauen · - = einschleifen</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </ConfigCard>
  )
}
