'use client';

import React from 'react';
import CardStatistik from '../_components/Massschuhauftraeges/CardS';
import MassschuhaufträgeChart from '../_components/Massschuhauftraeges/MassschuhaufträgeChart';
import ProgressTab from '../_components/Massschuhauftraeges/NewMasschuhau/ProgressTab';

export default function Massschuhauftraege() {
    return (
        <div>
            <CardStatistik />
            <MassschuhaufträgeChart />
            <ProgressTab />
        </div>
    )
}