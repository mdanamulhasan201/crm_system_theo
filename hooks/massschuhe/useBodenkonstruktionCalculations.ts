import { useMemo } from "react"
import { GROUPS2 } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/ShoeData"
import { parseEuroFromText } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/HelperFunctions"

export type SelectedState = {
    [groupId: string]: string | string[] | null
}

// Import orthopedic field types
import type { RahmenData, HinterkappeMusterSideData, HinterkappeSideData, BrandsohleSideData, VorderkappeSideData } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Bodenkonstruktion/FormFields"

/**
 * Custom hook to calculate prices for Bodenkonstruktion configuration.
 * 
 * @param selected - Object containing selected options for each field group
 * @param orderTotalPrice - Optional base price from the order (defaults to 0)
 * @param rahmen - Rahmen selection data (EVA or Gummi with color)
 * @param hinterkappeMusterSide - Hinterkappe Muster (mode: gleich | unterschiedlich). Ja = +5€ or +2.50€ per side
 * @param hinterkappeSide - Hinterkappe (beide Seiten): Leder sub-options (e.g. Leder Dünn +4,99 €)
 * @param brandsohleSide - Brandsohle (mode: gleich = full price | unterschiedlich = half price per side)
 * @param vorderkappeSide - Vorderkappe „Doppelt“ = +2,99 € pro betroffener Seite (bei gleich: beide Schuhe)
 * @returns Object containing extraPriceTotal (sum of option prices) and grandTotal (base + extras)
 */
export function useBodenkonstruktionCalculations(
    selected: SelectedState, 
    orderTotalPrice?: number,
    rahmen?: RahmenData | null,
    hinterkappeMusterSide?: HinterkappeMusterSideData | null,
    hinterkappeSide?: HinterkappeSideData | null,
    brandsohleSide?: BrandsohleSideData | null,
    vorderkappeSide?: VorderkappeSideData | null,
) {
    // Calculate the sum of all selected option prices (can be positive or negative)
    const extraPriceTotal = useMemo(() => {
        let totalExtraPrice = 0

        for (const group of GROUPS2) {
            const selectedValue = selected[group.id]
            
            // Skip if no option is selected for this group
            if (!selectedValue) {
                continue
            }

            // Handle multi-select fields (arrays)
            if (group.multiSelect && Array.isArray(selectedValue)) {
                selectedValue.forEach((optionId) => {
                    const selectedOption = group.options.find(
                        (option) => option.id === optionId
                    )
                    if (selectedOption) {
                        const optionPrice = parseEuroFromText(selectedOption.label)
                        totalExtraPrice += optionPrice
                    }
                })
                continue
            }

            // Handle single-select fields
            const selectedOptionId = selectedValue as string
            const selectedOption = group.options.find(
                (option) => option.id === selectedOptionId
            )
            
            if (!selectedOption) {
                continue
            }

            // Parse price from option label (e.g., "+10€", "-10€", "Standard")
            const optionPrice = parseEuroFromText(selectedOption.label)
            totalExtraPrice += optionPrice

            // Handle special case: Hinterkappe with Leder sub-options
            if (
                group.id === "hinterkappe" && 
                selectedOptionId === "leder" && 
                group.subOptions?.leder
            ) {
                const selectedSubOptionId = selected.hinterkappe_sub
                const selectedSubOption = group.subOptions.leder.find(
                    (subOption) => subOption.id === selectedSubOptionId
                )
                
                if (selectedSubOption) {
                    totalExtraPrice += selectedSubOption.price
                }
            }
        }
        
        // Add orthopedic field prices
        // 1. Hinterkappe Muster (mode: gleich | unterschiedlich): Ja = +4,99€ or +2,49€ per side
        const musterNoAufpreis =
            hinterkappeMusterSide?.musterErstellung === "nein" ||
            hinterkappeMusterSide?.musterErstellung === "leisten"
        if (!musterNoAufpreis) {
            if (hinterkappeMusterSide?.mode === "gleich" && hinterkappeMusterSide.sameValue === "ja") {
                totalExtraPrice += 4.99
            } else if (hinterkappeMusterSide?.mode === "unterschiedlich") {
                if (hinterkappeMusterSide.leftValue === "ja") totalExtraPrice += 2.49
                if (hinterkappeMusterSide.rightValue === "ja") totalExtraPrice += 2.49
            }
        }
        
        // 2. Rahmen: "gummi" = +20.00€
        if (rahmen && rahmen.type === "gummi") {
            totalExtraPrice += 20.00
        }

        // 2b. Hinterkappe (beide Seiten): Leder sub-options (e.g. Leder Dünn +4,99 €)
        const hinterkappeGroup = GROUPS2.find(g => g.id === "hinterkappe")
        const lederSubOptions = hinterkappeGroup?.subOptions?.leder
        if (hinterkappeSide?.mode && lederSubOptions) {
            const getLederSubPrice = (subId: string | null | undefined) => {
                if (!subId) return 0
                const sub = lederSubOptions.find((s: { id: string; price: number }) => s.id === subId)
                return sub?.price ?? 0
            }
            if (hinterkappeSide.mode === "gleich" && hinterkappeSide.sameValue === "leder") {
                totalExtraPrice += getLederSubPrice(hinterkappeSide.sameSubValue)
            } else if (hinterkappeSide.mode === "unterschiedlich") {
                if (hinterkappeSide.leftValue === "leder") totalExtraPrice += getLederSubPrice(hinterkappeSide.leftSubValue)
                if (hinterkappeSide.rightValue === "leder") totalExtraPrice += getLederSubPrice(hinterkappeSide.rightSubValue)
            }
        }

        // 3. Brandsohle (mode: gleich = full price | unterschiedlich = half price per side)
        const brandsohleGroup = GROUPS2.find(g => g.id === "brandsohle")
        if (brandsohleSide?.mode && brandsohleGroup) {
            const getFullPrice = (optId: string) => {
                const opt = brandsohleGroup.options.find(o => o.id === optId)
                return opt ? parseEuroFromText(opt.label) : 0
            }
            if (brandsohleSide.mode === "gleich" && brandsohleSide.sameValues?.length) {
                brandsohleSide.sameValues.forEach(id => { totalExtraPrice += getFullPrice(id) })
            } else if (brandsohleSide.mode === "unterschiedlich") {
                const half = (p: number) => Math.floor(p * 50) / 100
                ;(brandsohleSide.leftValues || []).forEach(id => { totalExtraPrice += half(getFullPrice(id)) })
                ;(brandsohleSide.rightValues || []).forEach(id => { totalExtraPrice += half(getFullPrice(id)) })
            }
        }

        // 4. Vorderkappe: „Doppelt“ +2,99 € / Seite (bei beidseitig gleich: beide Schuhe = 2 × 2,99 €)
        const vkDoppelt = 2.99
        if (vorderkappeSide?.mode === "gleich" && vorderkappeSide.sameMaterial === "doppelt") {
            totalExtraPrice += vkDoppelt * 2
        } else if (vorderkappeSide?.mode === "unterschiedlich") {
            if (vorderkappeSide.leftMaterial === "doppelt") totalExtraPrice += vkDoppelt
            if (vorderkappeSide.rightMaterial === "doppelt") totalExtraPrice += vkDoppelt
        }

        // Note: sohlenhoehe_differenziert has no price impact

        return totalExtraPrice
    }, [selected, rahmen, hinterkappeMusterSide, hinterkappeSide, brandsohleSide, vorderkappeSide])

    // Calculate grand total: base price + extra prices from selected options
    const grandTotal = useMemo(() => {
        const basePrice = (orderTotalPrice && orderTotalPrice > 0) 
            ? orderTotalPrice 
            : 0
        
        return basePrice + extraPriceTotal
    }, [orderTotalPrice, extraPriceTotal])

    return { 
        extraPriceTotal, 
        grandTotal 
    }
}

