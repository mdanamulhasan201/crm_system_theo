'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Clock, FileText, Loader2 } from 'lucide-react';
import { getMassschuheOrderDetails } from '@/apis/MassschuheAddedApis';
import { SHOE_STEPS } from './MasschuProgressTable';

function formatCreatedAt(iso?: string): string {
    if (!iso) return '–';
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

const STEP_SHORT_NAMES = [
    'Scan',
    'Leisten',
    'Bettung',
    'Halbprobe',
    'Schaft',
    'Schaft Prod.',
    'Boden',
    'Finish',
    'Abholen',
    'Geliefert',
];

// API response types (get-order-details)
export interface TimeSpentByStatusItem {
    status: string;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    durationHours: number;
}

export interface OrderDetailsApiData {
    id?: string;
    medical_diagnosis?: string;
    detailed_diagnosis?: string;
    order_note?: string;
    supply_note?: string;
    status_note?: string;
    status?: string;
    createdAt?: string;
    timeSpentByStatus?: TimeSpentByStatusItem[];
    branch_location?: { title?: string; description?: string };
    customer?: {
        id?: string;
        customerNumber?: number;
        vorname?: string;
        nachname?: string;
        telefon?: string;
    };
    fertigungsweisung?: {
        leisten: string;
        bettung: string;
        schaft: string;
        boden: string;
        sonderanpassungen: string;
        halbprobe: string;
        checkliste: string;
        anmerkungen: string;
    };
}

export interface FertigungsweisungData {
    leisten: string;
    bettung: string;
    schaft: string;
    boden: string;
    sonderanpassungen: string;
    halbprobe: string;
    checkliste: string;
    anmerkungen: string;
}

export interface ZeitverlaufItem {
    step: string;
    stepIndex: number;
    duration: string;
    completed: boolean;
    isCurrent: boolean;
}

/** Format durationMs to "Xd Xh Xm Xs" (only non-zero parts). */
function formatDurationMs(ms: number): string {
    if (ms == null || ms < 0 || !Number.isFinite(ms)) return '0s';
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
}

function normalizeStepName(apiStatus: string): string {
    return (apiStatus || '').trim().replace(/_/g, ' ');
}

function getStepIndexFromStatus(apiStatus: string): number {
    const normalized = normalizeStepName(apiStatus);
    const idx = SHOE_STEPS.findIndex((s) => s === normalized);
    return idx >= 0 ? idx : -1;
}

function mapTimeSpentToZeitverlauf(
    timeSpentByStatus: TimeSpentByStatusItem[],
    currentOrderStatus?: string
): ZeitverlaufItem[] {
    const normalizedCurrent = currentOrderStatus
        ? normalizeStepName(currentOrderStatus)
        : '';
    return timeSpentByStatus.map((item, i) => {
        const stepIndex = getStepIndexFromStatus(item.status);
        const duration = formatDurationMs(item.durationMs ?? 0);
        const isLast = i === timeSpentByStatus.length - 1;
        const isCurrent = Boolean(
            isLast && normalizedCurrent && normalizeStepName(item.status) === normalizedCurrent
        );
        return {
            step: item.status,
            stepIndex: stepIndex >= 0 ? stepIndex : i,
            duration,
            completed: !isCurrent,
            isCurrent,
        };
    });
}

export interface FertigungsweisungSidebarProps {
    orderId: string;
}

export default function FertigungsweisungSidebar({ orderId }: FertigungsweisungSidebarProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<OrderDetailsApiData | null>(null);
    const [zeitverlauf, setZeitverlauf] = useState<ZeitverlaufItem[]>([]);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        getMassschuheOrderDetails(orderId)
            .then((res: { success?: boolean; data?: OrderDetailsApiData }) => {
                if (cancelled) return;
                const data = res?.data;
                if (!data) {
                    setOrderDetails(null);
                    setZeitverlauf([]);
                    setLoading(false);
                    return;
                }
                setOrderDetails(data);
                const raw = data.timeSpentByStatus ?? [];
                const list = Array.isArray(raw) ? raw : [];
                setZeitverlauf(
                    mapTimeSpentToZeitverlauf(list, data.status)
                );
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.message || 'Fehler beim Laden');
                    setOrderDetails(null);
                    setZeitverlauf([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (loading) {
        return (
            <div className="w-96 flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-96 rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
            </div>
        );
    }

    const items = zeitverlauf;

    return (
        <div className="w-96 space-y-6">
            {/* Fertigungsweisung */}
            <div className="bg-white rounded-lg border border-green-200 p-6">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-2 ">
                        <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">Fertigungsweisung</h3>
                    </div>
                    <button
                        type="button"
                        className="flex cursor-pointer gap-1 text-xs text-gray-600 hover:text-gray-900"
                    >
                        <FileText className="w-4 h-4" />
                        PDF
                    </button>
                </div>
                <div className="space-y-4 text-xs">
                    {orderDetails ? (
                        <>
                            {/* Diagnose / ärztliche Diagnose */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Diagnose</div>
                                <div className="font-medium text-gray-500 mb-0.5">ärztliche Diagnose</div>
                                <div className="text-gray-700">
                                    {orderDetails.medical_diagnosis || '–'}
                                </div>
                                {orderDetails.detailed_diagnosis ? (
                                    <div className="text-gray-700 mt-1">
                                        {orderDetails.detailed_diagnosis}
                                    </div>
                                ) : null}
                            </div>

                            {/* When created */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">When created</div>
                                <div className="text-gray-700">
                                    {formatCreatedAt(orderDetails.createdAt)}
                                </div>
                            </div>

                            {/* Location of Business */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Location of Business</div>
                                <div className="text-gray-700">
                                    {orderDetails.branch_location?.title || '–'}
                                </div>
                                {orderDetails.branch_location?.description ? (
                                    <div className="text-gray-500 mt-0.5">
                                        {orderDetails.branch_location.description}
                                    </div>
                                ) : null}
                            </div>

                            {/* Notes as on insole */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Notes as on insole</div>
                                <div className="text-gray-700 space-y-1">
                                    {orderDetails.order_note ? (
                                        <div>{orderDetails.order_note}</div>
                                    ) : null}
                                    {orderDetails.supply_note ? (
                                        <div>{orderDetails.supply_note}</div>
                                    ) : null}
                                    {orderDetails.status_note ? (
                                        <div>{orderDetails.status_note}</div>
                                    ) : null}
                                    {!orderDetails.order_note && !orderDetails.supply_note && !orderDetails.status_note ? (
                                        <span className="text-gray-400">–</span>
                                    ) : null}
                                </div>
                            </div>

                            {/* Kundendaten / Zu Kundenseite / Scanansehen */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Kundendaten</div>
                                <div className="text-gray-700">
                                    {orderDetails.customer ? (
                                        <>
                                            <span>
                                                {[orderDetails.customer.vorname, orderDetails.customer.nachname]
                                                    .filter(Boolean)
                                                    .join(' ') || '–'}
                                            </span>
                                            {orderDetails.customer.customerNumber != null && (
                                                <span className="text-gray-500 ml-1">
                                                    (Nr. {orderDetails.customer.customerNumber})
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        '–'
                                    )}
                                </div>
                               
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-400 text-sm">Keine Daten</p>
                    )}
                </div>
            </div>

            {/* ZEITVERLAUF */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">ZEITVERLAUF</h3>
                {items.length > 0 ? (
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between"
                            >
                                <span
                                    className={`text-sm font-medium ${
                                        item.isCurrent
                                            ? 'text-emerald-700 font-semibold'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {STEP_SHORT_NAMES[item.stepIndex] ?? item.step}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {item.duration}
                                    </span>
                                    {item.completed ? (
                                        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                            <Check
                                                className="w-3 h-3 text-white"
                                                strokeWidth={3}
                                            />
                                        </div>
                                    ) : item.isCurrent ? (
                                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                            <Clock className="w-3 h-3 text-gray-600" />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Nicht gefunden</p>
                )}
            </div>
        </div>
    );
}
