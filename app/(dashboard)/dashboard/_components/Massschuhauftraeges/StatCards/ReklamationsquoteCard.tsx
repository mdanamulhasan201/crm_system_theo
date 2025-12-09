'use client';

import React from 'react';

export default function ReklamationsquoteCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 text-base font-medium text-slate-600">
                Reklamationsquote
            </div>
            <div className="mb-3">
                <div className="text-3xl font-semibold text-slate-900">2%</div>
            </div>
            <div className="text-sm font-medium text-emerald-500">
                Nur 2% der Aufträge mussten nachgebessert werden
            </div>
        </div>
    );
}

