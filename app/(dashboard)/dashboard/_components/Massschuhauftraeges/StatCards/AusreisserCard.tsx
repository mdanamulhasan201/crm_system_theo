'use client';

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function AusreisserCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 text-base font-medium text-slate-600">
                Ausreisser
            </div>
            <div className="mb-4">
                <div className="text-2xl font-semibold text-slate-900">14 Tage</div>
            </div>
            <div className="mb-4 space-y-3">
                <div className="flex items-center gap-5">
                    <div className="h-2 flex-1 max-w-24 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600 whitespace-nowrap">&gt;30 Tage</span>
                </div>
                <div className="flex items-center gap-5">
                    <div className="h-2 flex-1 max-w-16 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600 whitespace-nowrap">&gt;50 Tage</span>
                </div>
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                <FaExclamationTriangle className="mt-0.5 h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Trigger: Zeigt Aufträge, die seit längerem nicht abgeschlossen wurden.</span>
            </div>
        </div>
    );
}

