import React from 'react'
import HeadingSection from '../_components/Krankenkasse/HeadingSection'
import Finanzubersicht from '../_components/Krankenkasse/Finanzubersicht/Finanzubersicht'
import BassenperformanceData from '../_components/Krankenkasse/Finanzubersicht/BassenperformanceData'
import UmasatzstrukturPieChart from '../_components/Krankenkasse/Finanzubersicht/UmasatzstrukturPieChart'
import FalligkeitsstrukturBarChart from '../_components/Krankenkasse/Finanzubersicht/FalligkeitsstrukturBarChart'

export default function Krankenkasse() {
    return (
        <div className="space-y-8">
            <HeadingSection />
            <Finanzubersicht />
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FalligkeitsstrukturBarChart />
                <UmasatzstrukturPieChart />
                <BassenperformanceData />
            </section>
        </div>
    )
}
