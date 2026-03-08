'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface EinlagenCardSectionProps {
    /** Einlagen in Produktion – count currently in production */
    count?: number | null;
    /** Warten auf Versorgungsstart */
    waitingCount?: number | null;
    /** Ausgeführte Einlagen (e.g. totalPrice or count for last 30 days) */
    executedValue?: string | number | null;
}

function EinlagenCard({
    title,
    value,
    description,
    progressPercent = 0,
}: {
    title: string;
    value: string | number;
    description: string;
    progressPercent?: number;
}) {
    const displayValue = value === '' || value == null ? '—' : String(value);
    const hasProgress = progressPercent > 0;

    return (
        <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-semibold text-[#62A07C] sm:text-base">{title}</h3>
            <p className="mt-2 text-2xl  text-gray-900 sm:text-3xl">
                {displayValue}
            </p>
            <p className="mt-1.5 text-xs font-semibold text-gray-500 ">{description}</p>
            <div className="mt-4 w-full">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                        className={cn(
                            'h-full rounded-full bg-[#62A07C] transition-all duration-300',
                            !hasProgress && 'w-0'
                        )}
                        style={hasProgress ? { width: `${Math.min(100, Math.max(0, progressPercent))}%` } : undefined}
                    />
                </div>
            </div>
        </div>
    );
}

export default function EinlagenCardSection({
    count,
    waitingCount,
    executedValue,
}: EinlagenCardSectionProps) {
    const countNum = count ?? 0;
    const waitingNum = waitingCount ?? 0;
    const hasExecuted = executedValue !== undefined && executedValue !== null && executedValue !== '';

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <EinlagenCard
                title="Einlagen in Produktion"
                value={count != null ? count : '—'}
                description="Aktuell in Bearbeitung befindliche Einlagen"
                progressPercent={countNum > 0 ? Math.min(80, 40 + countNum * 10) : 0}
            />
            <EinlagenCard
                title="Warten auf Versorgungsstart"
                value={waitingCount != null ? waitingCount : '—'}
                description="Aufträge warten auf Versorgungsstart"
                progressPercent={waitingNum > 0 ? Math.min(70, 20 + waitingNum * 10) : 0}
            />
            <EinlagenCard
                title="Ausgeführte Einlagen"
                value={hasExecuted ? executedValue : '—'}
                description={
                    hasExecuted
                        ? 'Abgeschlossene Einlagen in diesem Zeitraum'
                        : 'Keine abgeschlossenen Einlagen in diesem Zeitraum'
                }
                progressPercent={hasExecuted ? 100 : 0}
            />
        </div>
    );
}
