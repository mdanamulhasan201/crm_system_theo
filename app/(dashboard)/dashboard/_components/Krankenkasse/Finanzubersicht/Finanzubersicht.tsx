import React from 'react'
import FinanzubersichtCard from './FinanzubersichtCard'

export default function Finanzubersicht() {
    return (
        <section className="space-y-6">
            <header>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Finanzübersicht
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Liquiditätssteuerung und Forderungsmanagement
                </p>
            </header>
            <FinanzubersichtCard />
        </section>
    )
}
