'use client';

import React from 'react';
import MaßschuheCard from './MaßschuheCard';
import EinlagenCard from './EinlagenCard';
import GruendeReklamationen from './GruendeReklamationen';

export default function Reklamationen() {
    // Get current month and year
    const getCurrentMonthYear = () => {
        const now = new Date();
        const months = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();
        return `${monthName} ${year}`;
    };

    return (
        <div className="p-4 sm:p-6 w-full overflow-x-hidden">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Reklamationen – Statistik {getCurrentMonthYear()}
                </h1>
            </div>

            {/* Main Content Grid - 2x2 Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                {/* Top Left - Maßschuhe */}
                <div className="sm:col-span-1">
                    <MaßschuheCard 
                     
                        percentage={6}
                        change={2}
                        isPositive={true}
                    />
                </div>

                {/* Top Right - Einlagen */}
                <div className="sm:col-span-1">
                    <EinlagenCard 
               
               
                        percentage={3}
                        change={-1}
                        isPositive={false}
                    />
                </div>

                {/* Bottom Left - Gründe der Reklamationen */}
                <div className="sm:col-span-1">
                    <GruendeReklamationen />
                </div>

                {/* Bottom Right - Gründe der Reklamationen (Duplicate) */}
                <div className="sm:col-span-1">
                    <GruendeReklamationen />
                </div>
            </div>
        </div>
    );
}
