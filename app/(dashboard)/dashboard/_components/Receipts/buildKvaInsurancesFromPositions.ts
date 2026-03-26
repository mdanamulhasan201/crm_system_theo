import type { KvaItem } from '@/components/OrdersPage/ProccessTable/KvaPdf/KvaSheet'

export type PositionsnummerSource = {
    id: string
    positionsnummer?: string
    description: string | {
        positionsnummer?: string
        title?: string
        subtitle?: string
    }
    price: number
}

function getPositionsnummer(option: PositionsnummerSource): string {
    if (option.positionsnummer) return option.positionsnummer
    if (typeof option.description === 'object' && option.description?.positionsnummer) {
        return option.description.positionsnummer
    }
    return ''
}

/** Maps account VAT country to a value KvaSheet `guessVatRate` understands */
function resolveVatCountryCode(accountVatCountry?: string | null): string {
    if (accountVatCountry === 'Italien (IT)') return 'IT'
    if (accountVatCountry === 'Österreich (AT)' || accountVatCountry === 'Austria (AT)') return 'AT'
    if (accountVatCountry === 'Deutschland (DE)' || accountVatCountry === 'Germany (DE)') return 'DE'
    return accountVatCountry || 'DE'
}

export function buildKvaInsurancesFromCodexSelection(
    selectedPositionsnummer: string[],
    itemSides: Record<string, 'L' | 'R' | 'BDS'>,
    positionsnummerAustriaData: PositionsnummerSource[],
    positionsnummerItalyData: PositionsnummerSource[],
    accountVatCountry?: string | null
): KvaItem[] {
    const allData = [...positionsnummerAustriaData, ...positionsnummerItalyData]
    const vat_country = resolveVatCountryCode(accountVatCountry)

    return selectedPositionsnummer
        .map((posNum) => {
            const option = allData.find((opt) => getPositionsnummer(opt) === posNum)
            if (!option) return null

            const side = itemSides[posNum] || 'R'
            const finalPrice = side === 'BDS' ? option.price * 2 : option.price

            const description: {
                positionsnummer: string
                Seite: string
                title?: string
                subtitle?: string
            } = {
                positionsnummer: posNum,
                Seite: side,
            }

            if (typeof option.description === 'object' && option.description) {
                if (option.description.title) description.title = option.description.title
                if (option.description.subtitle) description.subtitle = option.description.subtitle
            } else if (typeof option.description === 'string') {
                description.title = option.description
            }

            const item: KvaItem = {
                price: finalPrice,
                description,
                vat_country,
            }
            return item
        })
        .filter((x): x is KvaItem => x != null)
}
