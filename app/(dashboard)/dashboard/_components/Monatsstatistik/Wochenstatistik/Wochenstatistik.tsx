'use client';

import React from 'react';
import ComparisonCard from './ComparisonCard';
import MetricCard from './MetricCard';
import { useWochenstatistikData } from './hooks/useWochenstatistikData';

export default function Wochenstatistik() {
    // Fetch all data using custom hook
    const {
        finishedData,
        finishedLoading,
        inProductionData,
        inProductionLoading,
        finishedShoesData,
        finishedShoesLoading,
        inProductionShoesData,
        inProductionShoesLoading,
    } = useWochenstatistikData();

    // Get current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const dayName = days[now.getDay()];
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${dayName} ${hours}.${minutes} Uhr`;
    };

    return (
        <div className="p-4 sm:p-6 w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Wochenstatistik
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                    Aktualisiert: {getCurrentDateTime()}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                {/* Left Column - Comparison Cards */}
                <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
                    {/* 1st Comparison Card - with API data (Insoles) */}
                    <ComparisonCard useApiData={true} apiType="insoles" />
                    {/* 2nd Comparison Card - with API data (Shoes) */}
                    <ComparisonCard useApiData={true} apiType="shoes" />
                </div>

                {/* Right Columns - Metric Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                    {/* 1st Metric Card - Fertiggestellte Einlagen */}
                    <MetricCard
                        title="Fertiggestellte Einlagen"
                        value={finishedData?.count ?? 0}
                        percentage={finishedData?.percentageChange ?? 0}
                        isPositive={finishedData?.trend === 'up'}
                        loading={finishedLoading}
                    />

                    {/* 2nd Metric Card - In Fertigung */}
                    <MetricCard
                        title="In Fertigung"
                        value={inProductionData?.count ?? 0}
                        percentage={inProductionData?.percentageChange ?? 0}
                        isPositive={inProductionData?.trend === 'up'}
                        loading={inProductionLoading}
                    />


                    {/* 3rd Metric Card - Fertiggestellte Masschuhe */}
                    <MetricCard
                        title="Fertiggestellte Masschuhe"
                        value={finishedShoesData?.revenue ?? 0}
                        percentage={finishedShoesData?.percentageChange ?? 0}
                        isPositive={finishedShoesData?.trend === 'up'}
                        loading={finishedShoesLoading}
                    />
                    {/* 4th Metric Card - In Fertigung (Shoes) */}
                    <MetricCard
                        title="In Fertigung"
                        value={inProductionShoesData?.count ?? 0}
                        percentage={inProductionShoesData?.percentageChange ?? 0}
                        isPositive={inProductionShoesData?.trend === 'up'}
                        loading={inProductionShoesLoading}
                    />
                </div>
            </div>
        </div>
    );
}
