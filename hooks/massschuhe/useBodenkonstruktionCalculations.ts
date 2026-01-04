import { useMemo } from "react"
import { GROUPS2, shoe2 } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/ShoeData"
import { parseEuroFromText } from "@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/HelperFunctions"

export type SelectedState = {
    [groupId: string]: string | null
}

export function useBodenkonstruktionCalculations(
    selected: SelectedState, 
    orderTotalPrice?: number
) {
    const extraPriceTotal = useMemo(() => {
        let sum = 0
        for (const group of GROUPS2) {
            const selectedOptId = selected[group.id]
            if (!selectedOptId) continue
            const opt = group.options.find((o) => o.id === selectedOptId)
            if (!opt) continue
            sum += parseEuroFromText(opt.label)
            if (group.id === "hinterkappe" && selectedOptId === "leder" && group.subOptions?.leder) {
                const subId = selected.hinterkappe_sub
                const subOpt = group.subOptions.leder.find((o) => o.id === subId)
                if (subOpt) sum += subOpt.price
            }
        }
        return sum
    }, [selected])

    const grandTotal = useMemo(() => {
        if (orderTotalPrice && orderTotalPrice > 0) {
            return orderTotalPrice
        }
        return shoe2.price + extraPriceTotal
    }, [orderTotalPrice, extraPriceTotal])

    return { extraPriceTotal, grandTotal }
}

