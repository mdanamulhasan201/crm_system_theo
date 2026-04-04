'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Clock, FileText, MessageSquare } from 'lucide-react';
import { getMassschuheOrderDetails, getMassschuheOrderNote } from '@/apis/MassschuheAddedApis';
import { SHOE_STEPS } from './MasschuProgressTable';

// Notes API response (get-notes)
interface OrderNoteData {
    id?: string;
    status_note?: string | null;
    order_note?: string | null;
    supply_note?: string | null;
}
interface NoteItem {
    id: string;
    note: string;
    status?: string;
    type?: string;
    isImportant?: boolean;
    createdAt?: string;
}
interface OrderNotesResponse {
    success?: boolean;
    orderNote?: OrderNoteData | null;
    notes?: NoteItem[];
}

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

// performedBy from API: who completed this step (partner or employee)
export interface PerformedByPartner {
    type: 'partner';
    id: string;
    name?: string | null;
    busnessName?: string | null;
    image?: string | null;
}
export interface PerformedByEmployee {
    type: 'employee';
    id: string;
    employeeName?: string | null;
    accountName?: string | null;
    image?: string | null;
}
export type PerformedBy = PerformedByPartner | PerformedByEmployee;

// API response types (get-order-details)
export interface TimeSpentByStatusItem {
    status: string;
    isCompleted?: boolean;
    startedAt: string;
    endedAt: string;
    durationMs: number;
    durationHours: number;
    performedBy?: PerformedBy | null;
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
    pick_up_location?: { title?: string };
    store_location?: { title?: string };
    payment_status?: string;
    total_price?: number | null;
    vat_rate?: number | null;
    foot_analysis_price?: number | null;
    deposit_provision?: number | null;
    insurances?: Array<{ price?: number; description?: { item?: string } }>;
    employee?: {
        id?: string;
        accountName?: string | null;
        employeeName?: string | null;
        image?: string | null;
    };
    customer?: {
        id?: string;
        customerNumber?: number;
        vorname?: string;
        nachname?: string;
        telefon?: string | null;
    };
    orderNumber?: number;
    quantity?: number;
    kva?: boolean;
    halbprobe?: boolean;
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
    /** When this step was completed (for display) */
    completedAt?: string;
    /** Who completed this step: compact text (both name + busnessName for partner) */
    performedByDisplay?: string;
    /** Avatar image URL for performer (partner or employee) */
    performedByImage?: string | null;
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

/** Who completed: partner = both busnessName + name (compact); employee = employeeName/accountName */
function getPerformedByDisplay(performedBy?: PerformedBy | null): string {
    if (!performedBy) return '–';
    if (performedBy.type === 'partner') {
        const bus = (performedBy.busnessName ?? '').trim();
        const name = (performedBy.name ?? '').trim();
        if (bus && name) return `${bus} · ${name}`;
        return bus || name || '–';
    }
    if (performedBy.type === 'employee') {
        const en = (performedBy.employeeName ?? '').trim();
        const ac = (performedBy.accountName ?? '').trim();
        if (en && ac) return `${en} · ${ac}`;
        return en || ac || '–';
    }
    return '–';
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
        const completedAt = item.endedAt || item.startedAt;
        const performedByDisplay = getPerformedByDisplay(item.performedBy);
        const performedByImage = item.performedBy && 'image' in item.performedBy
            ? item.performedBy.image
            : undefined;
        return {
            step: item.status,
            stepIndex: stepIndex >= 0 ? stepIndex : i,
            duration,
            completed: !isCurrent,
            isCurrent,
            completedAt,
            performedByDisplay,
            performedByImage: performedByImage ?? null,
        };
    });
}

export interface FertigungsweisungSidebarProps {
    orderId: string;
    /** When step changes (URL status), sidebar refetches to show fresh data for that step */
    statusParam?: string;
}

const baseShimmer = 'animate-pulse bg-gray-200 rounded';

function SidebarShimmer() {
    return (
        <div className="w-full space-y-6">
            <div className="bg-white rounded-lg border border-green-200 p-6">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className={`${baseShimmer} h-6 w-32`} />
                    <div className={`${baseShimmer} h-5 w-10`} />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className={`${baseShimmer} h-3 w-28`} />
                            <div className={`${baseShimmer} h-4 w-full`} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className={`${baseShimmer} h-4 w-24 mb-4`} />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className={`${baseShimmer} h-4 w-20`} />
                            <div className={`${baseShimmer} h-4 w-12`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FertigungsweisungSidebar({ orderId, statusParam }: FertigungsweisungSidebarProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<OrderDetailsApiData | null>(null);
    const [zeitverlauf, setZeitverlauf] = useState<ZeitverlaufItem[]>([]);
    const [orderNotes, setOrderNotes] = useState<OrderNotesResponse | null>(null);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            setOrderNotes(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        setOrderNotes(null);
        Promise.all([
            getMassschuheOrderDetails(orderId),
            getMassschuheOrderNote(orderId).catch(() => null),
        ])
            .then(([detailsRes, notesRes]) => {
                if (cancelled) return;
                const data = (detailsRes as { success?: boolean; data?: OrderDetailsApiData })?.data;
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
                if (notesRes && typeof notesRes === 'object') {
                    setOrderNotes(notesRes as OrderNotesResponse);
                }
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
    }, [orderId, statusParam]);

    if (loading) {
        return <SidebarShimmer />;
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
        <div className="w-full space-y-6">
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
                            {/* 1. Erstellt am (createdAt) */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Erstellt am</div>
                                <div className="text-gray-700">
                                    {formatCreatedAt(orderDetails.createdAt)}
                                </div>
                            </div>

                            {/* 2. Standort (branch_location) */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Standort</div>
                                {/* <div className="text-gray-700">
                                    {orderDetails.branch_location?.title || '–'}
                                </div> */}
                                <div className="text-gray-500 mt-0.5">
                                    {orderDetails.branch_location?.description || '–'}
                                </div>
                            </div>

                            {/* 3. Lieferhinweis (supply_note) */}
                            {/* <div>
                                <div className="font-semibold text-gray-600 mb-1">Lieferhinweis</div>
                                <div className="text-gray-700">
                                    {orderDetails.supply_note || '–'}
                                </div>
                            </div> */}

                            {/* 4. Ärztliche Diagnose (medical_diagnosis) */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Ärztliche Diagnose</div>
                                <div className="text-gray-700">
                                    {orderDetails.medical_diagnosis || '–'}
                                </div>
                            </div>

                            {/* 5. Detaillierte Diagnose (detailed_diagnosis) */}
                            <div>
                                <div className="font-semibold text-gray-600 mb-1">Detaillierte Diagnose</div>
                                <div className="text-gray-700">
                                    {orderDetails.detailed_diagnosis || '–'}
                                </div>
                            </div>

                            {/* Weitere Notizen (from order details) */}
                            {(orderDetails.order_note || orderDetails.status_note) ? (
                                <div>
                                    <div className="font-semibold text-gray-600 mb-1">Weitere Notizen</div>
                                    <div className="text-gray-700 space-y-1">
                                        {orderDetails.order_note ? <div>{orderDetails.order_note}</div> : null}
                                        {orderDetails.status_note ? <div>{orderDetails.status_note}</div> : null}
                                    </div>
                                </div>
                            ) : null}

                            {/* Notizen (from get-notes API) – orderNote + notes[]; only show when data exists */}
                            {orderNotes && (() => {
                                const on = orderNotes.orderNote;
                                const hasOrderNote = on && (on.supply_note || on.order_note || on.status_note);
                                const notesList = orderNotes.notes && orderNotes.notes.length > 0 ? orderNotes.notes : [];
                                const hasNotesList = notesList.length > 0;
                                if (!hasOrderNote && !hasNotesList) return null;
                                return (
                                    <div>
                                        <div className="font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Notizen
                                            {hasNotesList && (
                                                <span className="text-gray-400 font-normal text-[11px]">
                                                    ({notesList.length})
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-gray-700">
                                            {/* orderNote: supply_note, order_note, status_note – only show if present */}
                                            {hasOrderNote && on && (
                                                <div className="space-y-1">
                                                    {on.supply_note ? (
                                                        <div className="text-xs">
                                                            <span className="text-gray-500"></span>{' '}
                                                            {on.supply_note}
                                                        </div>
                                                    ) : null}
                                                    {on.order_note ? (
                                                        <div className="text-xs">
                                                            <span className="text-gray-500"></span>{' '}
                                                            {on.order_note}
                                                        </div>
                                                    ) : null}
                                                    {on.status_note ? (
                                                        <div className="text-xs">
                                                            <span className="text-gray-500"></span>{' '}
                                                            {on.status_note}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                            {/* notes[]: multiple notes – each shown in a compact row */}
                                            {hasNotesList && (
                                                <div className={`space-y-1.5 ${hasOrderNote ? 'pt-2 border-t border-gray-100' : ''}`}>
                                                    {notesList.map((n, idx) => (
                                                        <div
                                                            key={n.id}
                                                            className={`text-xs rounded-md px-2.5 py-2 border-l-2 bg-gray-50/80 ${n.isImportant ? 'border-amber-500' : 'border-gray-200'}`}
                                                        >
                                                            <p className="text-gray-800 leading-snug break-words">
                                                                {n.note}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-gray-500">
                                                                {n.status ? (
                                                                    <span className="font-medium text-gray-600">
                                                                        {n.status.replace(/_/g, ' ')}
                                                                    </span>
                                                                ) : null}
                                                                {n.type ? (
                                                                    <span className="text-gray-400">{n.type}</span>
                                                                ) : null}
                                                                {n.createdAt ? (
                                                                    <span>{formatCreatedAt(n.createdAt)}</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Kundendaten – clickable → scanning-data/[customer.id] */}
                            <div>
                                {orderDetails.customer?.id ? (
                                    <Link
                                        href={`/dashboard/scanning-data/${orderDetails.customer.id}`}
                                        className="block rounded-lg border border-gray-200 bg-gray-50/50 p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        <div className="font-semibold text-gray-600 mb-1">Kundendaten</div>
                                        <div className="text-gray-700">
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
                                        </div>
                                        <div className="text-xs text-emerald-600 font-medium mt-1.5">
                                            Scanansehen →
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
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
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-400 text-sm">Keine Daten</p>
                    )}
                </div>
            </div>

            {/* ZEITVERLAUF – step, duration, date/time, who completed */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">ZEITVERLAUF</h3>
                {items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className={`text-sm font-medium ${
                                                item.isCurrent
                                                    ? 'text-emerald-700 font-semibold'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {STEP_SHORT_NAMES[item.stepIndex] ?? item.step}
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
                                    {(item.completedAt || item.performedByDisplay) && (
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {item.performedByImage ? (
                                                <img
                                                    src={item.performedByImage}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-200"
                                                />
                                            ) : null}
                                            <p className="text-xs text-gray-500 min-w-0">
                                                {item.completedAt ? formatCreatedAt(item.completedAt) : ''}
                                                {item.completedAt && item.performedByDisplay ? ' · ' : ''}
                                                {item.performedByDisplay ? (
                                                    <span className="text-gray-600 font-medium">
                                                        {item.performedByDisplay}
                                                    </span>
                                                ) : null}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-900 shrink-0">
                                    {item.duration}
                                </span>
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
