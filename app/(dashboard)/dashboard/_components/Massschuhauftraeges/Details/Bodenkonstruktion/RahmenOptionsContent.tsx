"use client"

import { RadioOption } from "./shared/RadioOption"
import OptionCard from "./shared/OptionCard"
import InfoTooltip from "./shared/InfoTooltip"
import VerschalungAusfuehrungCard from "./shared/VerschalungAusfuehrungCard"
import { RAHMEN_VERSCHALUNG_IMAGES } from "./rahmenVerschalungAssets"
import type { RahmenData, RahmenVerschalungAusfuehrung, RahmenVerschalungHoehe } from "./rahmenTypes"

function stripPriceFromOptionLabel(label: string): string {
  return label.replace(/\s*\([+\-–]?\d{1,3}[.,]\d{2}\s*€\)\s*$/i, "").trim()
}

const RAHMEN_TYP_OPTIONS: { id: NonNullable<RahmenData["type"]>; label: string }[] = [
  { id: "eva", label: "EVA-Rahmen" },
  { id: "gummi", label: "Gummi-Rahmen" },
  { id: "leder", label: "Lederrahmen" },
  { id: "verschalung", label: "Verschalung / Gürtel (+24,99 €)" },
]

const HOEHEN: { id: NonNullable<Exclude<RahmenVerschalungHoehe, null | undefined>>; label: string }[] = [
  { id: "15", label: "15 mm" },
  { id: "20", label: "20 mm" },
  { id: "25", label: "25 mm" },
  { id: "30", label: "30 mm" },
]

export function RahmenOptionsContent({
  value,
  onChange,
  hidePrice = false,
}: {
  value: RahmenData | null
  onChange: (value: RahmenData | null) => void
  hidePrice?: boolean
}) {
  const typ = value?.type ?? null
  const hoehe = value?.verschalungHoehe ?? null
  const ausfuehrung = value?.verschalungAusfuehrung ?? null

  const setTyp = (t: NonNullable<RahmenData["type"]>) => {
    const next: RahmenData = { type: t }
    if (t === "verschalung") {
      next.verschalungHoehe = value?.verschalungHoehe ?? null
      next.verschalungAusfuehrung = value?.verschalungAusfuehrung ?? null
    }
    onChange(next)
  }

  const setHoehe = (h: NonNullable<Exclude<RahmenVerschalungHoehe, null | undefined>>) => {
    if (typ !== "verschalung") return
    onChange({
      type: "verschalung",
      verschalungHoehe: h,
      verschalungAusfuehrung: value?.verschalungAusfuehrung ?? null,
    })
  }

  const setAusfuehrung = (a: NonNullable<RahmenVerschalungAusfuehrung>) => {
    if (typ !== "verschalung") return
    onChange({
      type: "verschalung",
      verschalungHoehe: value?.verschalungHoehe ?? null,
      verschalungAusfuehrung: a,
    })
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rahmentyp</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {RAHMEN_TYP_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.id}
              selected={typ === opt.id}
              onClick={() => setTyp(opt.id)}
              label={hidePrice ? stripPriceFromOptionLabel(opt.label) : opt.label}
            />
          ))}
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          typ === "verschalung" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-4 space-y-5 border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Höhe der Verschalung</p>
              <div className="flex flex-wrap gap-2">
                {HOEHEN.map((h) => (
                  <OptionCard
                    key={h.id}
                    label={h.label}
                    selected={hoehe === h.id}
                    onClick={() => setHoehe(h.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Verschalung Ausführung
                </p>
                <InfoTooltip content="Die Verschalung wird grundsätzlich am Oberleder geführt und kann je nach Ausführung den gesamten Aufbau umschließen." />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <VerschalungAusfuehrungCard
                  imageSrc={RAHMEN_VERSCHALUNG_IMAGES.oberleder}
                  imageAlt="Verschalung am Oberleder geführt"
                  title="Am Oberleder geführt"
                  description="Klassische Verschalung, folgt dem Oberleder"
                  selected={ausfuehrung === "oberleder"}
                  onClick={() => setAusfuehrung("oberleder")}
                />
                <VerschalungAusfuehrungCard
                  imageSrc={RAHMEN_VERSCHALUNG_IMAGES.gesamt}
                  imageAlt="Verschalung über gesamten Aufbau gezogen"
                  title="Über gesamten Aufbau"
                  description="Umschließt Zwischensohle + Absatz komplett"
                  selected={ausfuehrung === "gesamt"}
                  onClick={() => setAusfuehrung("gesamt")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
