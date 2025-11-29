import React from 'react'
import CardStatistik from '../_components/Massschuhauftraeges/CardS'
import MassschuhaufträgeChart from '../_components/Massschuhauftraeges/MassschuhaufträgeChart'
import CustomerSearch from '../_components/Massschuhauftraeges/CustomerSearch'

export default function MassschuhauftraegePage() {
    return (
        <div className=''>
            <CardStatistik />
            <MassschuhaufträgeChart />
            <CustomerSearch />
        </div>
    )
}
