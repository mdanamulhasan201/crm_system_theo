"use client"

import React from "react"
import { Shield } from "lucide-react"
import ConfigCard from "./shared/ConfigCard"
import SideSelector from "./shared/SideSelector"
import OptionCard from "./shared/OptionCard"
import { RadioOption } from "./shared/RadioOption"
import type { GleichUnterschiedlichMode, VorderkappeMatSel, VorderkappeSideData } from "./FormFields"

const VORDERKAPPE_OPTIONS: {
  value: NonNullable<VorderkappeMatSel>
  label: string
  desc: string
  price: string
}[] = [
  { value: "leicht", label: "Leicht", desc: "0,5 – 0,6 mm", price: "+0,00 €" },
  { value: "normal", label: "Normal", desc: "1,0 – 1,1 mm", price: "+0,00 €" },
  { value: "doppelt", label: "Doppelt", desc: "2,0 – 2,2 mm", price: "+2,99 € / Seite" },
]

const SelectionRow = ({
  sideLabel,
  value,
  onChange,
}: {
  sideLabel?: string
  value: VorderkappeMatSel
  onChange: (v: VorderkappeMatSel) => void
}) => (
  <div className="space-y-2">
    {sideLabel ? (
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{sideLabel}</p>
    ) : null}
    <div className="flex flex-wrap gap-2">
      {VORDERKAPPE_OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          desc={opt.desc}
          price={opt.price}
          selected={value === opt.value}
          onClick={() => onChange(value === opt.value ? null : opt.value)}
        />
      ))}
    </div>
  </div>
)

export default function VorderkappeUnifiedConfigCard({
  value,
  onChange,
}: {
  value: VorderkappeSideData | null
  onChange: (v: VorderkappeSideData | null) => void
}) {
  const mode = value?.mode ?? null
  const sameMaterial = value?.sameMaterial ?? null
  const leftMaterial = value?.leftMaterial ?? null
  const rightMaterial = value?.rightMaterial ?? null
  const laenge = value?.laenge ?? "normal"

  const setMode = (m: NonNullable<Exclude<GleichUnterschiedlichMode, null>>) => {
    onChange({
      mode: m,
      sameMaterial: m === "gleich" ? sameMaterial : undefined,
      leftMaterial: m === "unterschiedlich" ? leftMaterial : undefined,
      rightMaterial: m === "unterschiedlich" ? rightMaterial : undefined,
      laenge: value?.laenge ?? "normal",
    })
  }

  const patchGleichMaterial = (mat: VorderkappeMatSel) => {
    onChange({
      mode: "gleich",
      sameMaterial: mat,
      laenge,
    })
  }

  const patchLeft = (mat: VorderkappeMatSel) => {
    onChange({
      mode: "unterschiedlich",
      leftMaterial: mat,
      rightMaterial,
      laenge,
    })
  }

  const patchRight = (mat: VorderkappeMatSel) => {
    onChange({
      mode: "unterschiedlich",
      leftMaterial,
      rightMaterial: mat,
      laenge,
    })
  }

  const setLaenge = (l: "normal" | "kurz") => {
    if (!value?.mode) return
    onChange({
      mode: value.mode,
      sameMaterial: value.sameMaterial,
      leftMaterial: value.leftMaterial,
      rightMaterial: value.rightMaterial,
      laenge: l,
    })
  }

  return (
    <ConfigCard
      title="Vorderkappe"
      subtitle="Material kann links und rechts unterschiedlich gewählt werden"
      icon={<Shield size={20} />}
    >
      <div className="space-y-2">
        <SideSelector value={mode} onChange={setMode} />
      </div>

      {mode ? (
        <div className="mt-5 border-t border-gray-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Material</p>
          {mode === "gleich" ? (
            <div className="mt-3">
              <SelectionRow value={sameMaterial} onChange={patchGleichMaterial} />
            </div>
          ) : (
            <div className="mt-3 space-y-6">
              <SelectionRow sideLabel="LINKS" value={leftMaterial} onChange={patchLeft} />
              <SelectionRow sideLabel="RECHTS" value={rightMaterial} onChange={patchRight} />
            </div>
          )}
        </div>
      ) : null}

      {mode ? (
        <div className="mt-5 border-t border-gray-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Länge</p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            <RadioOption
              selected={laenge === "normal"}
              onClick={() => setLaenge("normal")}
              label="Normal"
            />
            <RadioOption selected={laenge === "kurz"} onClick={() => setLaenge("kurz")} label="Kurz" />
          </div>
        </div>
      ) : null}
    </ConfigCard>
  )
}
