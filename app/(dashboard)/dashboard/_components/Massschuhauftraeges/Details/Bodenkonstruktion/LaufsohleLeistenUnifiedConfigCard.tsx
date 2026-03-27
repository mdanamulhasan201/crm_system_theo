"use client"

import { Package } from "lucide-react"
import type { GroupDef2 } from "../Types"
import { stripPriceFromOptionLabel } from "./FormFields"
import ConfigCard from "./shared/ConfigCard"
import OptionCard from "./shared/OptionCard"

export default function LaufsohleLeistenUnifiedConfigCard({
  laufsohleDef,
  leistenDef,
  showLeistenSection,
  selectedLaufsohle,
  selectedLeisten,
  onLaufsohleSelect,
  onLeistenSelect,
  hideLaufsohlePrices,
}: {
  laufsohleDef: GroupDef2
  leistenDef: GroupDef2 | undefined
  showLeistenSection: boolean
  selectedLaufsohle: string | null
  selectedLeisten: string | null
  onLaufsohleSelect: (optId: string | null) => void
  onLeistenSelect: (optId: string | null) => void
  hideLaufsohlePrices?: boolean
}) {
  const leistenTooltip = leistenDef?.tooltipText

  return (
    <ConfigCard
      title="Laufsohle & Leisten"
      subtitle="Laufsohle beilegen und Umgang mit dem Leisten"
      icon={<Package size={20} />}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">{laufsohleDef.question}</p>
          <div className="flex flex-wrap gap-2">
            {laufsohleDef.options.map((opt) => {
              const dis = Boolean(opt.disabled)
              const selected = !dis && selectedLaufsohle === opt.id
              const label = hideLaufsohlePrices ? stripPriceFromOptionLabel(opt.label) : opt.label
              return (
                <OptionCard
                  key={opt.id}
                  label={label}
                  selected={selected}
                  disabled={dis}
                  onClick={() => {
                    if (dis) return
                    onLaufsohleSelect(selectedLaufsohle === opt.id ? null : opt.id)
                  }}
                />
              )
            })}
          </div>
        </div>

        {showLeistenSection && leistenDef ? (
          <>
            <div className="border-t border-gray-200" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-800">{leistenDef.question}</p>
                {leistenTooltip ? (
                  <div className="relative group">
                    <div className="flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
                      <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-72 rounded bg-gray-800 p-3 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {leistenTooltip}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {leistenDef.options.map((opt) => {
                  const selected = selectedLeisten === opt.id
                  return (
                    <OptionCard
                      key={opt.id}
                      label={opt.label}
                      selected={selected}
                      onClick={() => onLeistenSelect(selectedLeisten === opt.id ? null : opt.id)}
                    />
                  )
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ConfigCard>
  )
}
