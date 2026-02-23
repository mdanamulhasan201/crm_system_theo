"use client"

import React from "react"

export interface StickyPriceSummaryProps {
  /** Total price (Gesamtpreis) - excl. shipping */
  price: number
  /** Optional: Subtotal (Zwischensumme) for breakdown */
  subtotal?: number
  /** Optional: Additions (Zusätze) for breakdown */
  additions?: number
  /** Optional: show Abbrechen + Weiter buttons in sticky (e.g. bodenkonstruktion page) */
  onWeiterClick?: () => void
  onCancel?: () => void
  isSubmitting?: boolean
}

/**
 * Sticky Preisübersicht - price summary card. Optionally shows Abbrechen + Weiter €{price} buttons.
 * Price is ALWAYS excl. delivery/shipping (Zustellungsversand).
 */
export default function StickyPriceSummary({
  price,
  subtotal,
  additions,
  onWeiterClick,
  onCancel,
  isSubmitting = false,
}: StickyPriceSummaryProps) {
  const formatPrice = (val: number) => val.toFixed(2).replace(".", ",")
  const showBreakdown = subtotal !== undefined || additions !== undefined
  const showButtons = typeof onWeiterClick === "function" && typeof onCancel === "function"

  return (
    <div
      className="fixed bottom-6 right-6 z-40"
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
        {showButtons && (
          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-200">
            {/* <button
              type="button"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
              onClick={onCancel}
            >
              Abbrechen
            </button> */}
            <button
              type="button"
              className={`w-full px-4 py-2 bg-[#61A178] cursor-pointer text-white rounded-md hover:bg-[#61A178]/80 font-semibold text-sm flex items-center justify-center gap-2 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={onWeiterClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Wird gesendet..."
              ) : (
                <>Weiter €{formatPrice(price)}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
