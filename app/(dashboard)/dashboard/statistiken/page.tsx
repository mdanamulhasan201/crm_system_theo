import React from 'react'
import OverviewCard from '../_components/Statistiken/OverviewCard'
import DashboardSection from '../_components/Statistiken/DashboardSection'

export default function Statistiken() {
    return (
        <div className='container'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-900 mb-1'>
                    Gesamtübersicht
                </h1>
                <p className='text-gray-600 text-sm'>
                    Alle KPIs und Trends auf einen Blick
                </p>
            </div>
            <OverviewCard />
            <DashboardSection />
        </div>
    )
}
