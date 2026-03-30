"use client"

import React, { useState } from "react"
import { ChevronDown, Footprints } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import SideSelector from "./shared/SideSelector"
import OptionCard from "./shared/OptionCard"
import { RadioOption } from "./shared/RadioOption"
import InputWithUnit from "./shared/InputWithUnit"
import type {
  BrandsohleKorkDicke,
  BrandsohleKorkPosition,
  BrandsohleSideData,
  GleichUnterschiedlichMode,
} from "./FormFields"

type BrandsohleCardId = "standard" | "leder" | "diabetes"

const BRANDSOHLE_CARD_OPTIONS: {
  id: BrandsohleCardId
  label: string
  desc: string
  priceDisplay: string
}[] = [
  { id: "standard", label: "Standard (Texon)", desc: "Standardausführung", priceDisplay: "+0,00 €" },
  { id: "leder", label: "Leder", desc: "Echtleder", priceDisplay: "+3,99 € / Seite" },
  { id: "diabetes", label: "Diabetes / Versteift", desc: "Spezialanfertigung", priceDisplay: "+7,99 € / Seite" },
]

const KORK_POSITIONS: { value: NonNullable<BrandsohleKorkPosition>; label: string }[] = [
  { value: "vorfuss", label: "Vorfuß" },
  { value: "rueckfuss", label: "Rückfuß" },
  { value: "langsohlig", label: "Langsohlig" },
]

const SelectionRow = ({
  sideLabel,
  value,
  onChange,
  hidePrice,
}: {
  sideLabel?: string
  value: BrandsohleCardId | null
  onChange: (v: BrandsohleCardId | null) => void
  hidePrice?: boolean
}) => (
  <div className="space-y-2">
    {sideLabel ? (
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{sideLabel}</p>
    ) : null}
    <div className="flex flex-wrap gap-2">
      {BRANDSOHLE_CARD_OPTIONS.map((opt) => (
        <OptionCard
          key={opt.id}
          label={opt.label}
          desc={opt.desc}
          price={hidePrice ? undefined : opt.priceDisplay}
          selected={value === opt.id}
          onClick={() => onChange(value === opt.id ? null : opt.id)}
        />
      ))}
    </div>
  </div>
)

export default function BrandsohleUnifiedConfigCard({
  value,
  onChange,
  hidePrice = false,
}: {
  value: BrandsohleSideData | null
  onChange: (v: BrandsohleSideData | null) => void
  hidePrice?: boolean
}) {
  const mode = value?.mode ?? null
  const sameId = (value?.sameValues?.[0] as BrandsohleCardId | undefined) ?? null
  const leftId = (value?.leftValues?.[0] as BrandsohleCardId | undefined) ?? null
  const rightId = (value?.rightValues?.[0] as BrandsohleCardId | undefined) ?? null

  const kork = value?.korkEnabled === true
  const korkPosition = value?.korkPosition ?? null
  const korkDicke = value?.korkDicke ?? "3"
  const korkCustom = value?.korkCustomMm ?? ""

  const [showAdvanced, setShowAdvanced] = useState(false)

  React.useEffect(() => {
    if (!value?.mode) {
      onChange({
        mode: "gleich",
        sameValues: value?.sameValues ?? null,
        leftValues: undefined,
        rightValues: undefined,
        korkEnabled: value?.korkEnabled,
        korkPosition: value?.korkPosition,
        korkDicke: value?.korkDicke,
        korkCustomMm: value?.korkCustomMm,
      })
    }
  }, [value, onChange])

  const patch = (next: BrandsohleSideData) => {
    onChange(next)
  }

  const setMode = (m: NonNullable<Exclude<GleichUnterschiedlichMode, null>>) => {
    if (m === "gleich") {
      const carry = leftId ?? rightId ?? sameId
      patch({
        mode: "gleich",
        sameValues: carry ? [carry] : null,
        leftValues: undefined,
        rightValues: undefined,
        korkEnabled: value?.korkEnabled,
        korkPosition: value?.korkPosition,
        korkDicke: value?.korkDicke,
        korkCustomMm: value?.korkCustomMm,
      })
    } else {
      const seedL = sameId ?? leftId
      const seedR = sameId ?? rightId
      patch({
        mode: "unterschiedlich",
        sameValues: undefined,
        leftValues: seedL ? [seedL] : null,
        rightValues: seedR ? [seedR] : null,
        korkEnabled: value?.korkEnabled,
        korkPosition: value?.korkPosition,
        korkDicke: value?.korkDicke,
        korkCustomMm: value?.korkCustomMm,
      })
    }
  }

  const patchGleich = (id: BrandsohleCardId | null) => {
    patch({
      mode: "gleich",
      sameValues: id ? [id] : null,
      korkEnabled: value?.korkEnabled,
      korkPosition: value?.korkPosition,
      korkDicke: value?.korkDicke,
      korkCustomMm: value?.korkCustomMm,
    })
  }

  const patchLeft = (id: BrandsohleCardId | null) => {
    patch({
      mode: "unterschiedlich",
      leftValues: id ? [id] : null,
      rightValues: value?.rightValues,
      korkEnabled: value?.korkEnabled,
      korkPosition: value?.korkPosition,
      korkDicke: value?.korkDicke,
      korkCustomMm: value?.korkCustomMm,
    })
  }

  const patchRight = (id: BrandsohleCardId | null) => {
    patch({
      mode: "unterschiedlich",
      leftValues: value?.leftValues,
      rightValues: id ? [id] : null,
      korkEnabled: value?.korkEnabled,
      korkPosition: value?.korkPosition,
      korkDicke: value?.korkDicke,
      korkCustomMm: value?.korkCustomMm,
    })
  }

  const setKork = (enabled: boolean) => {
    if (!value?.mode) return
    if (enabled) {
      patch({
        mode: value.mode,
        sameValues: value.sameValues,
        leftValues: value.leftValues,
        rightValues: value.rightValues,
        korkEnabled: true,
        korkPosition: value.korkPosition ?? "vorfuss",
        korkDicke: value.korkDicke ?? "3",
        korkCustomMm: value.korkCustomMm ?? "",
      })
    } else {
      patch({
        mode: value.mode,
        sameValues: value.sameValues,
        leftValues: value.leftValues,
        rightValues: value.rightValues,
        korkEnabled: false,
        korkPosition: null,
        korkDicke: null,
        korkCustomMm: null,
      })
    }
  }

  const setKorkPosition = (p: NonNullable<BrandsohleKorkPosition>) => {
    if (!value?.mode) return
    patch({
      mode: value.mode,
      sameValues: value.sameValues,
      leftValues: value.leftValues,
      rightValues: value.rightValues,
      korkEnabled: true,
      korkPosition: p,
      korkDicke: value.korkDicke ?? "3",
      korkCustomMm: value.korkCustomMm,
    })
  }

  const setKorkDicke = (d: NonNullable<BrandsohleKorkDicke>) => {
    if (!value?.mode) return
    patch({
      mode: value.mode,
      sameValues: value.sameValues,
      leftValues: value.leftValues,
      rightValues: value.rightValues,
      korkEnabled: true,
      korkPosition: value.korkPosition ?? "vorfuss",
      korkDicke: d,
      korkCustomMm: d === "custom" ? (value.korkCustomMm ?? "") : null,
    })
  }

  const setKorkCustomMm = (mm: string) => {
    if (!value?.mode) return
    patch({
      mode: value.mode,
      sameValues: value.sameValues,
      leftValues: value.leftValues,
      rightValues: value.rightValues,
      korkEnabled: true,
      korkPosition: value.korkPosition ?? "vorfuss",
      korkDicke: "custom",
      korkCustomMm: mm,
    })
  }

  return (
    <ConfigCard
      title="Brandsohle"
      subtitle="Brandsohle kann links und rechts unterschiedlich konfiguriert werden"
      icon={<Footprints size={20} />}
    >
      <div className="space-y-2">
        <SideSelector value={mode} onChange={setMode} />
      </div>

      {mode ? (
        <div className="mt-5 border-t border-gray-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Brandsohle</p>
          <div className="mt-3">
            {mode === "gleich" ? (
              <SelectionRow value={sameId} onChange={patchGleich} hidePrice={hidePrice} />
            ) : (
              <div className="space-y-6">
                <SelectionRow sideLabel="LINKS" value={leftId} onChange={patchLeft} hidePrice={hidePrice} />
                <SelectionRow sideLabel="RECHTS" value={rightId} onChange={patchRight} hidePrice={hidePrice} />
              </div>
            )}
          </div>
        </div>
      ) : null}

      {mode ? (
        <div className="mt-5 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            />
            Erweiterte Optionen
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
              showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Korkeinlage hinzufügen?
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <RadioOption selected={!kork} onClick={() => setKork(false)} label="Nein" />
                    <RadioOption selected={kork} onClick={() => setKork(true)} label="Ja" />
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    kork ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Position</p>
                        <div className="flex flex-wrap gap-2">
                          {KORK_POSITIONS.map((pos) => (
                            <button
                              key={pos.value}
                              type="button"
                              onClick={() => setKorkPosition(pos.value)}
                              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                                korkPosition === pos.value
                                  ? "border-[#61A175] bg-[#61A175]/10 text-gray-900 ring-1 ring-[#61A175]/25"
                                  : "border-gray-200 bg-gray-50/80 text-gray-900 hover:border-[#61A175]/40"
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dicke</p>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                          <RadioOption
                            selected={korkDicke === "3"}
                            onClick={() => setKorkDicke("3")}
                            label="3 mm"
                          />
                          <RadioOption
                            selected={korkDicke === "5"}
                            onClick={() => setKorkDicke("5")}
                            label="5 mm"
                          />
                          <RadioOption
                            selected={korkDicke === "custom"}
                            onClick={() => setKorkDicke("custom")}
                            label="Eigene Angabe"
                          />
                          {korkDicke === "custom" ? (
                            <div className="w-28">
                              <InputWithUnit
                                value={korkCustom}
                                onChange={setKorkCustomMm}
                                unit="mm"
                                placeholder="z.B. 4"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ConfigCard>
  )
}
