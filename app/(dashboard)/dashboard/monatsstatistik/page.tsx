import React from 'react';
import Card from '../_components/Monatsstatistik/Allgemeines/Card';
import Chart from '../_components/Monatsstatistik/Allgemeines/Chart';
import DonutChart from '../_components/Monatsstatistik/Allgemeines/DonutChart';
import Wochenstatistik from '../_components/Monatsstatistik/Wochenstatistik/Wochenstatistik';
import KundenstatistikEinlagen from '../_components/Monatsstatistik/KundenstatistikEinlagen/KundenstatistikEinlagen';
import KundenstatistikMassschuhe from '../_components/Monatsstatistik/KundenstatistikMassschuhe/KundenstatistikMassschuhe';
import Reklamationen from '../_components/Monatsstatistik/Reklamationen/Reklamationen';

export default function Monatsstatistik() {
    return (
        <>

            <div className='p-4 sm:p-6 w-full overflow-x-hidden'>
                <div className='flex flex-col gap-2 mb-4 sm:mb-6'>
                    <h1 className='text-xl sm:text-2xl font-bold'>Allgemeines Dashboard</h1>
                    <p className='text-sm sm:text-base text-gray-600'>Halte den Überblick über deine Aufträge und Kunden über das letzte Monat</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr w-full'>
                    {/* Left Sidebar - Cards */}
                    <div className='lg:col-span-1 flex flex-col gap-4 sm:gap-6 h-full w-full'>
                        <Card
                            title="Gesamtumsatz (letzte 30 Tage)"
                            value="17010,53€"
                        />
                        <div className='flex-1 min-h-[300px] sm:min-h-[350px] w-full'>
                            <DonutChart />
                        </div>
                    </div>

                    {/* Right Main Area - Line Chart */}
                    <div className='lg:col-span-2 h-full min-h-[400px] sm:min-h-[500px] lg:min-h-0 w-full overflow-hidden'>
                        <Chart />
                    </div>
                </div>
            </div>
            <Wochenstatistik />
            <KundenstatistikEinlagen />
            <KundenstatistikMassschuhe />
            <Reklamationen />
        </>

    );
}
