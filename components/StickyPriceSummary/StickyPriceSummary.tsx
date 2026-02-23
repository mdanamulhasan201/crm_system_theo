"use client"

import React from "react"

export interface StickyPriceSummaryProps {
  /** Total price (Gesamtpreis) - excl. shipping */
  price: number
  /** Optional: Subtotal (Zwischensumme) for breakdown */
  subtotal?: number
  /** Optional: Additions (Zusätze) for breakdown */
  additions?: number
}

/**
 * Sticky Preisübersicht - price summary card only, NO button.
 * Button stays in its original place (form/ChecklistSection).
 * Price is ALWAYS excl. delivery/shipping (Zustellungsversand).
 */
export default function StickyPriceSummary({
  price,
  subtotal,
  additions,
}: StickyPriceSummaryProps) {
  const formatPrice = (val: number) => val.toFixed(2).replace(".", ",")
  const showBreakdown = subtotal !== undefined || additions !== undefined

  return (
    <div
      className="fixed bottom-20 right-6 z-40"
      aria-live="polite"
    >
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 shadow-md min-w-[200px]">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Preisübersicht
        </div>
        {showBreakdown && (
          <>
            {subtotal !== undefined && (
              <div className="flex justify-between text-gray-500 text-sm mb-1">
                <span>Zwischensumme</span>
                <span>€{formatPrice(subtotal)}</span>
              </div>
            )}
            {additions !== undefined && (
              <div className="flex justify-between text-gray-500 text-sm mb-1">
                <span>Zusätze</span>
                <span>€{formatPrice(additions)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 my-2" />
          </>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Gesamtpreis</span>
          <span className="text-lg font-bold text-green-600">€{formatPrice(price)}</span>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          exkl. Zustellungsversand
        </div>
      </div>
    </div>
  )
}
