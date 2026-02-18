'use client'



// import DashboardCharts from './dashboard-charts'
import { DashboardProvider } from './dashboard-context'
import DashboardCharts from './DashboardSection/DashboardCharts'
import DashboardHeader from './DashboardSection/DashboardHeader'

export default function DashboardSection () {
  return (
    <DashboardProvider>
      <DashboardHeader />
      <DashboardCharts />
    </DashboardProvider>
  )
}
