'use client';

import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { getBottomCardData } from "@/apis/MassschuheManagemantApis";

interface BottomCardData {
    Ausreisser: {
        outlierDays: number;
        thresholds: {
            over30: {
                days: number;
                count: number;
            };
            over50: {
                days: number;
                count: number;
            };
        };
    };
    ueberfaelligeFaelle: {
        count: number;
        averageDays: number;
    };
    trigger: string;
}

export default function BottomCard() {
    const [data, setData] = useState<BottomCardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getBottomCardData();
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch bottom card data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate max count for progress bar scaling
    const maxCount = data ? Math.max(
        data.Ausreisser.thresholds.over30.count,
        data.Ausreisser.thresholds.over50.count,
        1
    ) : 1;

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                        <div className="h-5 bg-slate-200 rounded w-24 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-20 mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Bottom Row: 3 cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card 3: Ausreisser */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Ausreisser
                    </div>
                    <div className="mb-4">
                        <div className="text-2xl font-semibold text-slate-900">
                            {data?.Ausreisser.outlierDays ?? 0} Tage
                        </div>
                    </div>
                    <div className="mb-4 space-y-3">
                        <div className="flex items-center gap-5">
                            <div 
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ 
                                    width: (data?.Ausreisser.thresholds.over30.count ?? 0) === 0 
                                        ? '0.5rem' 
                                        : `${(data?.Ausreisser.thresholds.over30.count ?? 0) / maxCount * 6}rem`,
                                    maxWidth: '6rem',
                                    minWidth: '0.5rem',
                                    opacity: (data?.Ausreisser.thresholds.over30.count ?? 0) === 0 ? 0.3 : 1
                                }}
                            ></div>
                            <span className="text-sm text-slate-600 whitespace-nowrap">
                                &gt;{data?.Ausreisser.thresholds.over30.days ?? 30} Tage ({data?.Ausreisser.thresholds.over30.count ?? 0})
                            </span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div 
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ 
                                    width: (data?.Ausreisser.thresholds.over50.count ?? 0) === 0 
                                        ? '0.5rem' 
                                        : `${(data?.Ausreisser.thresholds.over50.count ?? 0) / maxCount * 4}rem`,
                                    maxWidth: '4rem',
                                    minWidth: '0.5rem',
                                    opacity: (data?.Ausreisser.thresholds.over50.count ?? 0) === 0 ? 0.3 : 1
                                }}
                            ></div>
                            <span className="text-sm text-slate-600 whitespace-nowrap">
                                &gt;{data?.Ausreisser.thresholds.over50.days ?? 50} Tage ({data?.Ausreisser.thresholds.over50.count ?? 0})
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                        <FaExclamationTriangle className="mt-0.5 h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>Trigger: {data?.trigger ?? 'Zeigt Aufträge, die seit längerem nicht abgeschlossen wurden.'}</span>
                    </div>
                </div>

                {/* Card 4: Überfällige Fälle */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 text-base font-medium text-slate-600">
                        Überfällige Fälle
                    </div>
                    <div className="mb-2">
                        <div className="text-2xl font-semibold text-slate-900">
                            {data?.ueberfaelligeFaelle.count ?? 0} Fälle
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        &gt;{data?.ueberfaelligeFaelle.averageDays ?? 0} Tage im Schnitt
                    </div>
                </div>

                {/* Card 5: Reklamationsquote */}
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
            </div>
        </div>
    );
}