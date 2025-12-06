'use client';

import React from 'react';
import AuftragsstatusVerteilung from './AuftragsstatusVerteilung';
import AuftragskategorienKundenvergleich from './AuftragskategorienKundenvergleich';

export default function KundenstatistikEinlagen() {
    return (
        <div className="p-4 sm:p-6 w-full overflow-x-hidden">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Kundenstatistik Einlagen (dieser Monat)
                </h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
                {/* Left Panel - Auftragsstatus-Verteilung */}
                <div className="lg:col-span-1">
                    <AuftragsstatusVerteilung />
                </div>

                {/* Right Panel - Combined Auftragskategorien & Kundenvergleich */}
                <div className="lg:col-span-1">
                    <AuftragskategorienKundenvergleich />
                </div>
            </div>
        </div>
    );
}
