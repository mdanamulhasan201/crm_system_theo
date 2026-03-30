"use client"

import React from "react"
import { ShieldCheck } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import ConfigCard from "./shared/ConfigCard"
import { RadioOption } from "./shared/RadioOption"
import SideSelector from "./shared/SideSelector"
import OptionCard from "./shared/OptionCard"
import InfoTooltip from "./shared/InfoTooltip"
import type { GroupDef2 } from "../Types"
import {
  type GleichUnterschiedlichMode,
  type HinterkappeMusterErstellung,
  type HinterkappeMusterSideData,
  type HinterkappeSideData,
} from "./FormFields"

const MUSTERART_OPTIONS: {
  value: string
  label: string
  desc: string
  tooltip: string
}[] = [
  { value: "normal", label: "Normal", desc: "Standard", tooltip: "Wenig Stabilität" },
  { value: "knoechelkappe", label: "Knöchelkappe", desc: "Mehr Halt", tooltip: "Mehr Halt im Knöchelbereich" },
  {
    value: "achillessehne",
    label: "Knöchelkappe Achillessehnenfrei",
    desc: "Mehr Halt & Druckentlastung",
    tooltip: "Kombination aus Knöchelhalt und Druckentlastung der Achillessehne",
  },
  { value: "peronaeus", label: "Peronaeus / T-Form", desc: "Gezielte Führung", tooltip: "Gezielte seitliche Führung" },
  { value: "arthrodese", label: "Arthrodese", desc: "Max. Fixierung", tooltip: "Maximale Fixierung, sehr hohe und feste Konstruktion (höher als Knöchelkappe)" },
]

function formatEuroPerSeite(price: number) {
  return `+${price.toFixed(2).replace(".", ",")} € / Seite`
}

function resolveErstellung(value: HinterkappeMusterSideData | null): HinterkappeMusterErstellung | null {
  if (value?.musterErstellung) return value.musterErstellung
  if (value?.mode === "gleich" && value?.sameValue === "ja") return "ja"
  if (value?.mode === "gleich" && value?.sameValue === "nein") return "nein"
  return null
}

const MaterialButton = ({
  label,
  selected,
  disabled,
  disabledLabel,
  onClick,
}: {
  label: string
  selected: boolean
  disabled?: boolean
  disabledLabel?: string
  onClick: () => void
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
      disabled
        ? "cursor-not-allowed border-gray-200 bg-gray-100/80 text-gray-400"
        : selected
          ? "cursor-pointer border-[#61A175] bg-[#61A175] text-white shadow-sm hover:bg-[#528a64]"
          : "cursor-pointer border-gray-200 bg-gray-50/90 text-gray-900 hover:border-[#61A175]/55 hover:bg-[#61A175]/7"
    }`}
  >
    {label}
    {disabled && disabledLabel ? (
      <span className="mt-0.5 block text-xs font-normal text-gray-400">{disabledLabel}</span>
    ) : null}
  </button>
)

const MaterialRow = ({
  sideLabel,
  material,
  subValue,
  def,
  onMaterial,
  onSub,
}: {
  sideLabel?: string
  material: string | null | undefined
  subValue: string | null | undefined
  def: GroupDef2
  onMaterial: (id: string | null) => void
  onSub: (id: string | null) => void
}) => {
  const lederOpts = def.subOptions?.leder || []

  return (
    <div className="space-y-3">
      {sideLabel ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{sideLabel}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <MaterialButton
          label="Kunststoff"
          selected={material === "kunststoff"}
          disabled
          disabledLabel="derzeit nicht verfügbar"
          onClick={() => {}}
        />
        <MaterialButton
          label="Leder"
          selected={material === "leder"}
          onClick={() => onMaterial(material === "leder" ? null : "leder")}
        />
      </div>
      {material === "leder" && lederOpts.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Lederstärke:</p>
          <div className="flex flex-wrap gap-2">
            {lederOpts.map((opt) => {
              const title =
                opt.thicknessTitle ??
                opt.label.replace(/\s*\([+]?.+\)\s*$/i, "").replace(/^Leder\s+/i, "").trim()
              const desc = opt.desc
              return (
                <OptionCard
                  key={opt.id}
                  label={title}
                  desc={desc}
                  price={formatEuroPerSeite(opt.price)}
                  selected={subValue === opt.id}
                  onClick={() => onSub(subValue === opt.id ? null : opt.id)}
                />
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function HinterkappeUnifiedConfigCard({
  musterDef,
  materialDef,
  musterValue,
  materialValue,
  onMusterChange,
  onMaterialChange,
}: {
  musterDef: GroupDef2
  materialDef: GroupDef2
  musterValue: HinterkappeMusterSideData | null
  materialValue: HinterkappeSideData | null
  onMusterChange: (v: HinterkappeMusterSideData | null) => void
  onMaterialChange: (v: HinterkappeSideData | null) => void
}) {
  const erstellung = resolveErstellung(musterValue)
  const musterart = musterValue?.musterart ?? null

  /** Nur musterErstellung / musterart setzen – Auswahlbereich (gleich/unterschiedlich, Ja/Nein) bleibt erhalten. */
  const setErstellung = (choice: HinterkappeMusterErstellung) => {
    const prev = musterValue
    const base = {
      mode: (prev?.mode ?? "gleich") as GleichUnterschiedlichMode,
      sameValue: prev?.sameValue,
      leftValue: prev?.leftValue,
      rightValue: prev?.rightValue,
    }
    if (choice === "ja") {
      onMusterChange({
        ...base,
        musterErstellung: "ja",
        musterart: musterart ?? prev?.musterart ?? null,
      })
    } else if (choice === "nein") {
      onMusterChange({
        ...base,
        musterErstellung: "nein",
        musterart: null,
      })
    } else {
      onMusterChange({
        ...base,
        musterErstellung: "leisten",
        musterart: null,
      })
    }
  }

  React.useEffect(() => {
    if (!musterValue?.musterErstellung) {
      onMusterChange({
        mode: (musterValue?.mode ?? "gleich") as GleichUnterschiedlichMode,
        sameValue: musterValue?.sameValue,
        leftValue: musterValue?.leftValue,
        rightValue: musterValue?.rightValue,
        musterErstellung: "nein",
        musterart: null,
      })
    }
  }, [musterValue, onMusterChange])

  const setMusterart = (art: string) => {
    if (musterValue?.musterErstellung !== "ja" && erstellung !== "ja") return
    const prev = musterValue
    onMusterChange({
      mode: (prev?.mode ?? "gleich") as GleichUnterschiedlichMode,
      sameValue: prev?.sameValue,
      leftValue: prev?.leftValue,
      rightValue: prev?.rightValue,
      musterErstellung: "ja",
      musterart: art,
    })
  }

  const mode = materialValue?.mode ?? null
  const sameValue = materialValue?.sameValue || null
  const sameSubValue = materialValue?.sameSubValue || null
  const leftValue = materialValue?.leftValue || null
  const leftSubValue = materialValue?.leftSubValue || null
  const rightValue = materialValue?.rightValue || null
  const rightSubValue = materialValue?.rightSubValue || null

  React.useEffect(() => {
    if (!materialValue?.mode) {
      onMaterialChange({
        mode: "gleich",
        sameValue: materialValue?.sameValue ?? null,
        sameSubValue: materialValue?.sameSubValue ?? null,
      })
    }
  }, [materialValue, onMaterialChange])

  const setMode = (m: NonNullable<Exclude<GleichUnterschiedlichMode, null>>) => {
    onMaterialChange({
      mode: m,
      sameValue: m === "gleich" ? sameValue : undefined,
      sameSubValue: m === "gleich" ? sameSubValue : undefined,
      leftValue: m === "unterschiedlich" ? leftValue : undefined,
      leftSubValue: m === "unterschiedlich" ? leftSubValue : undefined,
      rightValue: m === "unterschiedlich" ? rightValue : undefined,
      rightSubValue: m === "unterschiedlich" ? rightSubValue : undefined,
    })
  }

  const patchGleich = (next: Partial<Pick<HinterkappeSideData, "sameValue" | "sameSubValue">>) => {
    onMaterialChange({
      mode: "gleich",
      sameValue: next.sameValue !== undefined ? next.sameValue : sameValue,
      sameSubValue: next.sameSubValue !== undefined ? next.sameSubValue : sameSubValue,
    })
  }

  const patchLinks = (next: Partial<Pick<HinterkappeSideData, "leftValue" | "leftSubValue">>) => {
    onMaterialChange({
      mode: "unterschiedlich",
      leftValue: next.leftValue !== undefined ? next.leftValue : leftValue,
      leftSubValue: next.leftSubValue !== undefined ? next.leftSubValue : leftSubValue,
      rightValue,
      rightSubValue,
    })
  }

  const patchRechts = (next: Partial<Pick<HinterkappeSideData, "rightValue" | "rightSubValue">>) => {
    onMaterialChange({
      mode: "unterschiedlich",
      leftValue,
      leftSubValue,
      rightValue: next.rightValue !== undefined ? next.rightValue : rightValue,
      rightSubValue: next.rightSubValue !== undefined ? next.rightSubValue : rightSubValue,
    })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <ConfigCard
          title={musterDef.question}
          subtitle="Auswahl gilt separat für linken und rechten Schuh"
          icon={<ShieldCheck size={20} />}
        >
          <div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Soll ein Muster erstellt werden?
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <RadioOption
                  selected={erstellung === "nein"}
                  onClick={() => setErstellung("nein")}
                  label="Nein, Muster liefern wir selbst"
                />
                <RadioOption
                  selected={erstellung === "ja"}
                  onClick={() => setErstellung("ja")}
                  label="Ja, ein Muster erstellen"
                />
                <RadioOption
                  selected={erstellung === "leisten"}
                  onClick={() => setErstellung("leisten")}
                  label="Wird auf dem Leisten gekennzeichnet"
                />
              </div>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <SideSelector value={mode} onChange={setMode} />

              {mode ? (
                <div className="mt-5 border-t border-gray-200 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Material</p>
                  {mode === "gleich" ? (
                    <div className="mt-3">
                      <MaterialRow
                        material={sameValue}
                        subValue={sameSubValue}
                        def={materialDef}
                        onMaterial={(id) => {
                          if (id === null) patchGleich({ sameValue: null, sameSubValue: null })
                          else if (id !== "leder") patchGleich({ sameValue: id, sameSubValue: null })
                          else patchGleich({ sameValue: "leder", sameSubValue: sameSubValue })
                        }}
                        onSub={(id) => patchGleich({ sameSubValue: id })}
                      />
                    </div>
                  ) : (
                    <div className="mt-3 space-y-6">
                      <MaterialRow
                        sideLabel="LINKS"
                        material={leftValue}
                        subValue={leftSubValue}
                        def={materialDef}
                        onMaterial={(id) => {
                          if (id === null) patchLinks({ leftValue: null, leftSubValue: null })
                          else if (id !== "leder") patchLinks({ leftValue: id, leftSubValue: null })
                          else patchLinks({ leftValue: "leder", leftSubValue: leftSubValue })
                        }}
                        onSub={(id) => patchLinks({ leftSubValue: id })}
                      />
                      <MaterialRow
                        sideLabel="RECHTS"
                        material={rightValue}
                        subValue={rightSubValue}
                        def={materialDef}
                        onMaterial={(id) => {
                          if (id === null) patchRechts({ rightValue: null, rightSubValue: null })
                          else if (id !== "leder") patchRechts({ rightValue: id, rightSubValue: null })
                          else patchRechts({ rightValue: "leder", rightSubValue: rightSubValue })
                        }}
                        onSub={(id) => patchRechts({ rightSubValue: id })}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {erstellung === "ja" ? (
              <div className="mt-5 border-t border-gray-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Musterart</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {MUSTERART_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`flex items-start gap-1 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                        musterart === opt.value
                          ? "border-[#61A175] bg-[#61A175]/14 text-gray-900 shadow-sm ring-1 ring-[#61A175]/20"
                          : "border-gray-200 bg-white text-gray-900 hover:border-[#61A175]/50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setMusterart(opt.value)}
                        className="min-w-0 flex-1 cursor-pointer rounded-md px-1 py-0 text-left text-sm font-medium text-gray-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#61A175]/55"
                      >
                        <span className="block font-semibold">{opt.label}</span>
                        <span className="mt-0.5 block text-xs font-normal text-gray-500">{opt.desc}</span>
                      </button>
                      <InfoTooltip content={opt.tooltip} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

          </div>
        </ConfigCard>

      </div>
    </TooltipProvider>
  )
}
