"use client"

import OptionCard from "../shared/OptionCard"
import InfoTooltip from "../shared/InfoTooltip"
import type { SohlenaufbauVerschalungAusfuehrung, SohlenaufbauVerschalungHoehe } from "../FormFields"

const HOEHEN: SohlenaufbauVerschalungHoehe[] = ["15", "20", "25", "30"]

export default function SohlenaufbauVerschalungSubsection({
  hoehe,
  ausfuehrung,
  onHoeheChange,
  onAusfuehrungChange,
}: {
  hoehe: SohlenaufbauVerschalungHoehe
  ausfuehrung: SohlenaufbauVerschalungAusfuehrung
  onHoeheChange: (h: SohlenaufbauVerschalungHoehe) => void
  onAusfuehrungChange: (a: SohlenaufbauVerschalungAusfuehrung) => void
}) {
  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-700">Verschalung / Gürtel</p>
        <InfoTooltip content="Die Verschalung wird grundsätzlich am Oberleder geführt und kann je nach Ausführung den gesamten Aufbau umschließen." />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Höhe</p>
        <div className="flex flex-wrap gap-2">
          {HOEHEN.map((h) => (
            <OptionCard
              key={h}
              label={`${h} mm`}
              desc=""
              selected={hoehe === h}
              onClick={() => onHoeheChange(hoehe === h ? "" : h)}
            />
          ))}
        </div>
      </div>

      {hoehe ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Ausführung</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAusfuehrungChange("oberleder")}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                ausfuehrung === "oberleder"
                  ? "border-[#61A175] bg-[#61A175]/5 shadow-sm"
                  : "border-gray-200 bg-white hover:border-[#61A175]/40"
              }`}
            >
              <img
                src="/bodenkonstruktion/verschalung-oberleder.svg"
                alt="Am Oberleder geführt"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                loading="lazy"
              />
              <span className="text-sm font-medium text-gray-900">Am Oberleder geführt</span>
              <span className="text-center text-[11px] leading-tight text-gray-500">Klassische Verschalung</span>
            </button>

            <button
              type="button"
              onClick={() => onAusfuehrungChange("gesamt")}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                ausfuehrung === "gesamt"
                  ? "border-[#61A175] bg-[#61A175]/5 shadow-sm"
                  : "border-gray-200 bg-white hover:border-[#61A175]/40"
              }`}
            >
              <img
                src="/bodenkonstruktion/verschalung-gesamt.svg"
                alt="Über gesamten Aufbau"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                loading="lazy"
              />
              <span className="text-sm font-medium text-gray-900">Über gesamten Aufbau</span>
              <span className="text-center text-[11px] leading-tight text-gray-500">Umschließt komplett</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
