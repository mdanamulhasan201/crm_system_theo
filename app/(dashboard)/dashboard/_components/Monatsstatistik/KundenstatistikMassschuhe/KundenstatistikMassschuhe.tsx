'use client';

import React from 'react';
import AuftragsstatusVerteilung from './AuftragsstatusVerteilung';
import MaßschuheStatusGenehmigungen from './MaßschuheStatusGenehmigungen';

export default function KundenstatistikMassschuhe() {
    return (
        <div className="p-4 sm:p-6 w-full overflow-x-hidden">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Kundenstatistik Massschuhe (dieser Monat)
                </h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
                {/* Left Panel - Auftragsstatus-Verteilung */}
                <div className="lg:col-span-1">
                    <AuftragsstatusVerteilung />
                </div>

                {/* Right Panel - Combined Maßschuhe & Status Genehmigungen */}
                <div className="lg:col-span-1">
                    <MaßschuheStatusGenehmigungen />
                </div>
            </div>
        </div>
    );
}
