"use client"

import { useState } from "react"
import { ChevronDown, Settings2 } from "lucide-react"
import InputWithUnit from "../shared/InputWithUnit"
import { RadioOption } from "../shared/RadioOption"

export default function SohlenaufbauProductionOptionsPanel() {
  const [open, setOpen] = useState(false)
  const [absatzbreiteEnabled, setAbsatzbreiteEnabled] = useState(false)
  const [linksInnen, setLinksInnen] = useState("")
  const [linksAussen, setLinksAussen] = useState("")
  const [rechtsInnen, setRechtsInnen] = useState("")
  const [rechtsAussen, setRechtsAussen] = useState("")

  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <span className="flex items-center gap-2">
          <Settings2 size={16} />
          Erweiterte Produktionsoptionen anzeigen
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="overflow-hidden pb-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <RadioOption
                selected={absatzbreiteEnabled}
                onClick={() => setAbsatzbreiteEnabled(!absatzbreiteEnabled)}
                label="Absatzbreite anpassen"
              />

              {absatzbreiteEnabled ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-[80px_1fr_1fr] items-end gap-3">
                    <div />
                    <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Links</p>
                    <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Rechts</p>

                    <p className="self-center text-xs font-medium text-gray-500">Innen (medial)</p>
                    <InputWithUnit value={linksInnen} onChange={setLinksInnen} unit="mm" placeholder="±0" />
                    <InputWithUnit value={rechtsInnen} onChange={setRechtsInnen} unit="mm" placeholder="±0" />

                    <p className="self-center text-xs font-medium text-gray-500">Außen (lateral)</p>
                    <InputWithUnit value={linksAussen} onChange={setLinksAussen} unit="mm" placeholder="±0" />
                    <InputWithUnit value={rechtsAussen} onChange={setRechtsAussen} unit="mm" placeholder="±0" />
                  </div>
                  <p className="text-xs text-gray-500">+ = aufbauen · − = einschleifen</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
