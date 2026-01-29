import { useMemo } from "react"
import { GROUPS2 } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/ShoeData"
import { parseEuroFromText } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/HelperFunctions"

export type SelectedState = {
    [groupId: string]: string | string[] | null
}

/**
 * Custom hook to calculate prices for Bodenkonstruktion configuration.
 * 
 * @param selected - Object containing selected options for each field group
 * @param orderTotalPrice - Optional base price from the order (defaults to 0)
 * @returns Object containing extraPriceTotal (sum of option prices) and grandTotal (base + extras)
 */
export function useBodenkonstruktionCalculations(
    selected: SelectedState, 
    orderTotalPrice?: number
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

        return totalExtraPrice
    }, [selected])

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

