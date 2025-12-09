'use client';

import React from 'react';

export default function UeberfalligeFaelleCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 text-base font-medium text-slate-600">
                Überfällige Fälle
            </div>
            <div className="mb-2">
                <div className="text-2xl font-semibold text-slate-900">6 Fälle</div>
            </div>
            <div className="text-sm text-slate-500">
                &gt;10 Tage im Schnitt
            </div>
        </div>
    );
}

