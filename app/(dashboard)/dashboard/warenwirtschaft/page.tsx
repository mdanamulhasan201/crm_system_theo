import React from 'react'
import WarenwirtschaftHeader from '../_components/Warenwirtschaft/WarenwirtschaftHeader'
import WarenwirtschaftCard from '../_components/Warenwirtschaft/WarenwirtschaftCard'
import BestellungenTable from '../_components/Warenwirtschaft/BestellungenTable'
import RechnungenTable from '../_components/Warenwirtschaft/RechnungenTable'

export default function Warenwirtschaft() {
  return (
    <div className="space-y-6">
      <WarenwirtschaftHeader />
      <WarenwirtschaftCard />
      <BestellungenTable />
      <RechnungenTable />
    </div>
  )
}
