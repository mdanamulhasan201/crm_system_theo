import React   from "react"
import type { GroupDef, OptionDef, OptionInputsState } from "./Types"
export function InlineLabelWithInputs({
  groupId,
  option,
  values,
  onChange,
}: {
  groupId: string
  option: OptionDef
  values: string[]
  onChange: (idx: number, val: string) => void
}) {
  const normalized = normalizeUnderscores(option.label)
  const parts = normalized.split("___")
 
  const restrictNumber = (value: string): string => {
    const cleaned = value.replace(/[^\d.,]/g, "")
    if (cleaned === "") return ""

    const sepMatch = cleaned.match(/[.,]/)
    const sepIndex = sepMatch ? sepMatch.index ?? -1 : -1
    const intPartRaw = sepIndex >= 0 ? cleaned.slice(0, sepIndex) : cleaned
    const intPart = intPartRaw.replace(/\D/g, "").slice(0, 2)
    
    if (sepIndex === -1) {
      return intPart
    }
    
    const decPartRaw = cleaned.slice(sepIndex + 1)
    const decPart = decPartRaw.replace(/\D/g, "").slice(0, 2)
    return `${intPart}.${decPart}`
  }
  const isNumericAt = (i: number): boolean => {
    if (groupId === "zehenelemente") return false
    const prev = parts[i] ?? ""
    const next = parts[i + 1] ?? "" 
    if (/\bmm\b/i.test(prev) || /\bmm\b/i.test(next)) return true
    return false
  }
  return (
    <span>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          <span>{part}</span>
          {idx < parts.length - 1 && (
            (() => {
              const numeric = isNumericAt(idx)
              const val = values[idx] ?? ""
              return (
                <input
                  type={numeric ? "number" : "text"}
                  className={`inline-input ${numeric ? "" : "inline-input-wide"}`}
                  aria-label={`Eingabefeld ${idx + 1} für ${option.label}`}
                  value={val}
                  onChange={(e) => onChange(idx, numeric ? restrictNumber(e.target.value) : e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  inputMode={numeric ? "decimal" : undefined}
                  step={numeric ? "0.01" : undefined}
                  min={numeric ? 0 : undefined}
                  placeholder={numeric ? "_ _ _" : "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _"}
                />
              )
            })()
          )}
        </React.Fragment>
      ))}
    </span>
  )
}

export function OptionGroup({
  def,
  selected,
  onSelect,
  optionInputs,
  setOptionInputs,
}: {
  def: GroupDef
  selected: string | null
  onSelect: (optionId: string | null) => void
  optionInputs: OptionInputsState
  setOptionInputs: React.Dispatch<React.SetStateAction<OptionInputsState>>
}) {
  const handleDoubleClick = () => {
    onSelect(null)
  }

  const getOptionInlineCount = (label: string) => {
    const norm = normalizeUnderscores(label)
    return Math.max(0, norm.split("___").length - 1)
  }
 
  React.useEffect(() => {
    def.options.forEach((opt) => {
      const placeholderCount = getOptionInlineCount(opt.label)
      if (placeholderCount > 0) {
        const current = optionInputs[def.id]?.[opt.id] ?? []
        if (current.length !== placeholderCount) {
          setOptionInputs((prev) => {
            const prevGroup = prev[def.id] ?? {}
            const nextValues = Array.from({ length: placeholderCount }, (_, i) => current[i] ?? "")
            return {
              ...prev,
              [def.id]: {
                ...prevGroup,
                [opt.id]: nextValues,
              },
            }
          })
        }
      }
    })
  }, [def, optionInputs, setOptionInputs])

  return (
    <div
      className="display-f-start margin-b-3"
      role="radiogroup"
      aria-label={def.question}
      onDoubleClick={handleDoubleClick}
    >
      <div className="general-text">{def.question}</div>
      <div className="display-f-start">
        {def.options.map((opt) => {
          const isChecked = selected === opt.id
          const placeholderCount = getOptionInlineCount(opt.label)
          const inputsForOpt = optionInputs[def.id]?.[opt.id] ?? Array.from({ length: placeholderCount }, () => "")

          const inputId = `opt-${def.id}-${opt.id}`
          return (
            <div
              key={opt.id}
              className="checkbox-label"
              onDoubleClick={(e) => {
                e.stopPropagation()
                onSelect(null)
              }}
            >
              <input
                id={inputId}
                type="checkbox"
                className="checkbox-input"
                checked={isChecked}
                onChange={() => onSelect(opt.id)}
                aria-label={opt.label}
              />
              {placeholderCount > 0 ? (
                <div
                  className="option-label-text"
                  onClick={() => onSelect(opt.id)}
                  role="button"
                  aria-label={opt.label}
                >
                  <InlineLabelWithInputs
                    groupId={def.id}
                    option={opt}
                    values={inputsForOpt}
                    onChange={(idx, val) =>
                      setOptionInputs((prev) => ({
                        ...prev,
                        [def.id]: {
                          ...(prev[def.id] ?? {}),
                          [opt.id]: inputsForOpt.map((v, i) => (i === idx ? val : v)),
                        },
                      }))
                    }
                  />
                </div>
              ) : (
                <label htmlFor={inputId} className="option-label-text">
                  {opt.label}
                </label>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Parses a price from text that may contain Euro amounts.
 * Supports both positive and negative prices in various formats:
 * - Positive: "10€", "+10€", "(+10€)", "(10€)"
 * - Negative: "-10€", "(-10€)"
 * 
 * @param txt - Text containing price information
 * @returns Parsed price as a number (negative if indicated, positive otherwise, 0 if not found)
 */
export function parseEuroFromText(txt: string): number {
  if (!txt || typeof txt !== 'string') {
    return 0
  }

  // Pattern to match negative prices: "-10€" or "(-10€)"
  const negativePricePattern = /(?:-|\(-)(\d{1,3}(?:[.,]\d{2})?)\s*€/
  const negativeMatch = txt.match(negativePricePattern)
  
  if (negativeMatch) {
    const priceString = negativeMatch[1]
    const normalizedPrice = priceString.replace(/\./g, "").replace(",", ".")
    const priceValue = Number(normalizedPrice)
    
    if (Number.isFinite(priceValue)) {
      return -priceValue // Return negative value
    }
    return 0
  }

  // Pattern to match positive prices: "10€", "+10€", "(+10€)", "(10€)"
  const positivePricePattern = /(\d{1,3}(?:[.,]\d{2})?)\s*€/
  const positiveMatch = txt.match(positivePricePattern)
  
  if (!positiveMatch) {
    return 0
  }

  const priceString = positiveMatch[1]
  const normalizedPrice = priceString.replace(/\./g, "").replace(",", ".")
  const priceValue = Number(normalizedPrice)
  
  return Number.isFinite(priceValue) ? priceValue : 0
}

export function normalizeUnderscores(txt: string): string {
  return txt.replace(/_{3,}/g, "___")
}

export function prepareOrderDataForPDF(order: any): any {
    if (!order) return {}
    
    // Format delivery date
    let formattedDeliveryDate = '-'
    if (order.delivery_date) {
        try {
            const date = new Date(order.delivery_date)
            formattedDeliveryDate = date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch {
            formattedDeliveryDate = order.delivery_date
        }
    }
    
    // Calculate total price from order
    const fußanalysePrice = order.fußanalyse ?? 0
    const einlagenversorgungPrice = order.einlagenversorgung ?? 0
    const totalPrice = fußanalysePrice + einlagenversorgungPrice
    
    // Get footer data from order.user or order.partner
    const partnerData = order.partner || order.user
    
    return {
        orderNumber: order.orderNumber ? `#${order.orderNumber}` : `#${order.id?.slice(0, 8) || '000000'}`,
        customerName: order.kunde || 'Kunde',
        productName: 'Bodenerstellung',
        deliveryDate: formattedDeliveryDate,
        status: order.status,
        filiale: order.filiale,
        totalPrice: totalPrice > 0 ? totalPrice : undefined,
        footerPhone: partnerData?.phone || undefined,
        footerEmail: partnerData?.email || undefined,
        footerBusinessName: partnerData?.busnessName || undefined,
        footerImage: partnerData?.image || null
    }
}