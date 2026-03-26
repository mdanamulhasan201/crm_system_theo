'use client'

import KvaSheet, { type KvaData } from './KvaSheet'

export type { KvaData }

type KostenvoranschlagPdfProps = {
    data: KvaData
    logoProxyUrl?: string | null
}

/**
 * Kostenvoranschlag (Codex) from customer history: same layout as {@link KvaSheet}.
 * Pass API payload from `getKvaDataByCustomerId` merged with `insurancesInfo` from the Codex selection.
 */
export default function KostenvoranschlagPdf({ data, logoProxyUrl }: KostenvoranschlagPdfProps) {
    return <KvaSheet data={data} logoProxyUrl={logoProxyUrl} />
}
