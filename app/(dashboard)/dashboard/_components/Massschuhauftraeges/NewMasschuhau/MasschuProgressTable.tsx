'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, FileText, ArrowRight, AlertCircle, History, Search, Loader2 } from 'lucide-react';
import { BsDash } from 'react-icons/bs';
import toast from 'react-hot-toast';
import MasschuhauNoteModal from './MasschuhauNoteModal';
import PriorityModal from './PriorityModal';
import MasschuHistorySidebar from './MasschuHistorySidebar';
import { getAllMassschuheOrders } from '@/apis/MassschuheAddedApis';
import { Input } from '@/components/ui/input';

// API response types
export interface ShoeOrderStepApi {
    status: string;
    isCompleted: boolean;
    createdAt: string;
}

export interface ShoeOrderApi {
    id: string;
    orderNumber: number;
    customer: { vorname: string; nachname: string };
    status: string;
    branch_location: { title: string; description: string };
    createdAt: string;
    payment_status: string;
    priority: string;
    shoeOrderStep: ShoeOrderStepApi[];
}

// Normalize API step name to match SHOE_STEPS (e.g. "Halbprobe_durchführen" -> "Halbprobe durchführen")
function normalizeStepName(apiStatus: string): string {
    return apiStatus.replace(/_/g, ' ');
}

// Get current step index from shoeOrderStep (number of completed steps = index of current step)
function getCurrentStepIndex(shoeOrderStep: ShoeOrderStepApi[]): number {
    const completed = shoeOrderStep?.filter(s => s.isCompleted) ?? [];
    return Math.min(completed.length, SHOE_STEPS.length - 1);
}

// Get days since the current step started (last step's createdAt)
function getDaysInCurrentStep(shoeOrderStep: ShoeOrderStepApi[]): number {
    if (!shoeOrderStep?.length) return 0;
    const lastStep = shoeOrderStep[shoeOrderStep.length - 1];
    const created = new Date(lastStep.createdAt).getTime();
    const now = Date.now();
    return Math.floor((now - created) / (24 * 60 * 60 * 1000));
}

// Map API order to ProgressData
function mapOrderToProgressData(order: ShoeOrderApi): ProgressData {
    const steps = order.shoeOrderStep ?? [];
    const currentStepIndex = getCurrentStepIndex(steps);
    const days = getDaysInCurrentStep(steps);
    const nextAction = currentStepIndex < SHOE_STEPS.length - 1 ? SHOE_STEPS[currentStepIndex + 1] : 'Abgeschlossen';
    const currentStepDisplay = order.status ? normalizeStepName(order.status) : SHOE_STEPS[currentStepIndex] ?? '-';

    return {
        id: order.id,
        auftrag: {
            name: [order.customer?.vorname, order.customer?.nachname].filter(Boolean).join(' ') || '-',
            orderNumber: `#${order.orderNumber}`,
            product: 'Massschuhe',
            isUrgent: order.priority === 'Dringend' || order.priority === 'Urgent',
        },
        currentStep: currentStepDisplay,
        location: order.branch_location?.title || order.branch_location?.description || '-',
        createDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('de-DE') : '-',
        days,
        isOverdue: days > 14, // optional: treat >14 days as overdue
        currentStepIndex,
        nextAction,
        responsible: order.payment_status || undefined,
    };
}

export const SHOE_STEPS = [
    'Auftragserstellung',
    'Leistenerstellung',
    'Bettungserstellung',
    'Halbprobenerstellung',
    'Halbprobe durchführen',
    'Schaft fertigen',
    'Bodenerstellen',
    'Qualitätskontrolle',
    'Abholbereit',
    'Ausgeführt'
];

export interface ProgressData {
    id: string;
    auftrag: {
        name: string;
        orderNumber: string;
        product: string;
        isUrgent?: boolean;
        assignees?: string[];
    };
    currentStep: string;
    location?: string;
    createDate?: string;
    days: number;
    isOverdue: boolean;
    currentStepIndex: number;
    nextAction: string;
    responsible?: string;
    notes?: string;
}

// Custom Checkbox Component with light green border
function CustomCheckbox({
    checked,
    onChange,
    id,
    indeterminate
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    indeterminate?: boolean;
}) {
    return (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                ref={(el) => {
                    if (el) el.indeterminate = indeterminate || false;
                }}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div
                className={`
                    w-4 h-4 rounded border-2 cursor-pointer transition-all
                    flex items-center justify-center
                    ${checked
                        ? 'bg-emerald-500 border-emerald-500'
                        : indeterminate
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-white border-emerald-300 hover:border-emerald-400'
                    }
                `}
                onClick={() => onChange(!checked)}
            >
                {checked && !indeterminate && (
                    <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
                {indeterminate && (
                    <div className="w-2 h-0.5 bg-white rounded" />
                )}
            </div>
        </div>
    );
}

function AuftragCell({ auftrag, isUrgent }: { auftrag: ProgressData['auftrag']; isUrgent: boolean }) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
                {isUrgent && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[11px] font-semibold border border-red-200 shrink-0">
                        Dringend
                    </span>
                )}
                <span className="font-semibold text-gray-900 text-sm">{auftrag.name}</span>
                {auftrag.assignees && auftrag.assignees.length > 0 && (
                    <div className="flex -space-x-1 ml-1">
                        {auftrag.assignees.map((a, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                            >
                                {a}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <span className="text-gray-500 text-xs">{auftrag.orderNumber}</span>
            <span className="text-gray-400 text-xs">{auftrag.product}</span>
        </div>
    );
}

function ProgressIndicator({ currentStepIndex }: { currentStepIndex: number }) {
    return (
        <div className="flex items-center">
            {SHOE_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <span
                                className={`text-[13px] font-semibold mx-1 shrink-0 leading-none select-none ${index <= currentStepIndex ? 'text-emerald-400' : 'text-gray-300'
                                    }`}
                            >
                                <BsDash />
                            </span>
                        )}
                        <div
                            title={step}
                            className={`
                                flex items-center justify-center
                                rounded-full shrink-0
                                w-6 h-6 
                                text-xs font-bold
                                transition-all
                                ${isCompleted
                                    ? 'bg-emerald-100 text-emerald-500'
                                    : isCurrent
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-400'
                                }
                            `}
                        >
                            {isCompleted ? (
                                <Check className="w-4 h-4" strokeWidth={2.5} />
                            ) : (
                                <span className="leading-none">{index + 1}</span>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

const PAGE_LIMIT = 10;

interface MasschuProgressTableProps {
    selectedStepIndex?: number | null;
    onRowClick?: (stepIndex: number) => void;
}

export default function MasschuProgressTable({
    selectedStepIndex = null,
    onRowClick
}: MasschuProgressTableProps = {}) {
    const router = useRouter();
    const status = SHOE_STEPS[selectedStepIndex ?? 0];

    const [orders, setOrders] = useState<ProgressData[]>([]);
    const [cursor, setCursor] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchOrders = useCallback(async (cursorVal: string, isLoadMore: boolean) => {
        const setLoader = isLoadMore ? setLoadingMore : setLoading;
        try {
            setLoader(true);
            const statusParam = status.replace(/\s+/g, '_');
            const response = await getAllMassschuheOrders(PAGE_LIMIT, statusParam, cursorVal, search);
            const list = (response?.data ?? []).map((o: ShoeOrderApi) => mapOrderToProgressData(o));
            const pagination = response?.pagination ?? {};
            const hasMorePages = !!pagination.hasMore;

            if (isLoadMore) {
                setOrders(prev => [...prev, ...list]);
            } else {
                setOrders(list);
                setUrgentOrderIds(new Set(list.filter((r: ProgressData) => r.auftrag.isUrgent).map((r: ProgressData) => r.id)));
            }
            setHasMore(hasMorePages);
            // Cursor for next page: use API nextCursor if returned, else last item id
            const nextCursor = (pagination as { nextCursor?: string }).nextCursor ?? (list.length > 0 ? list[list.length - 1]?.id : '');
            setCursor(nextCursor);
        } catch (err) {
            toast.error('Fehler beim Laden der Aufträge');
            if (!isLoadMore) setOrders([]);
        } finally {
            setLoader(false);
        }
    }, [status, search]);

    useEffect(() => {
        setCursor('');
        setHasMore(true);
        fetchOrders('', false);
    }, [status, search, fetchOrders]);

    const loadMore = () => {
        if (!hasMore || loadingMore || loading) return;
        fetchOrders(cursor, true);
    };

    // Debounce search: update `search` after user stops typing (400ms)
    useEffect(() => {
        const trimmed = searchInput.trim();
        const timer = setTimeout(() => setSearch(trimmed), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const filteredData = orders;

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [openNoteModalId, setOpenNoteModalId] = useState<string | null>(null);
    const [priorityModalOrderId, setPriorityModalOrderId] = useState<string | null>(null);
    const [historySidebarOrderId, setHistorySidebarOrderId] = useState<string | null>(null);
    const [urgentOrderIds, setUrgentOrderIds] = useState<Set<string>>(new Set());

    const allSelected = filteredData.length > 0 && filteredData.every(row => selectedIds.has(row.id));
    const someSelected = filteredData.some(row => selectedIds.has(row.id));

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredData.map(row => row.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleToggleUrgent = (id: string) => {
        const newUrgent = new Set(urgentOrderIds);
        const isCurrentlyUrgent = newUrgent.has(id);
        
        if (isCurrentlyUrgent) {
            newUrgent.delete(id);
            toast.success('Priorität erfolgreich entfernt');
        } else {
            newUrgent.add(id);
            toast.success('Auftrag erfolgreich als dringend markiert');
        }
        setUrgentOrderIds(newUrgent);
    };

    const handleOpenPriorityModal = (id: string) => {
        setPriorityModalOrderId(id);
    };

    const handleConfirmPriority = () => {
        if (priorityModalOrderId) {
            handleToggleUrgent(priorityModalOrderId);
            setPriorityModalOrderId(null);
        }
    };

    const handleRowClick = (e: React.MouseEvent, stepIndex: number) => {
        // Don't trigger row click if clicking on checkbox, note button, or action buttons
        if ((e.target as HTMLElement).closest('[type="checkbox"]') ||
            (e.target as HTMLElement).closest('.checkbox-container') ||
            (e.target as HTMLElement).closest('button[title="Notizen anzeigen"]') ||
            (e.target as HTMLElement).closest('button[title="Details anzeigen"]') ||
            (e.target as HTMLElement).closest('button[title="Historie anzeigen"]') ||
            (e.target as HTMLElement).closest('button[title="Als Dringend markieren"]') ||
            (e.target as HTMLElement).closest('button[title="Priorität entfernen"]')) {
            return;
        }
        onRowClick?.(stepIndex);
    };

    return (
        <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Search - right aligned, debounced */}
            <div className="p-4 border-b border-gray-100 flex justify-end">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Suchen (Auftrag, Kunde, …)"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : (
            <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="font-semibold text-gray-700 text-sm py-4 px-4 w-12">
                                <CustomCheckbox
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    id="select-all"
                                    indeterminate={someSelected && !allSelected}
                                />
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 min-w-[200px]">
                                Auftrag
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                                Aktueller Schritt
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                                Location
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                                Create Data
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                                Tage
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                            Kostenträger
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6 min-w-[500px]">
                                Fortschritt
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                                Nächste Aktion
                            </TableHead>
                            <TableHead className="font-semibold text-gray-600 text-sm py-4 px-6">
                                Aktion
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="py-8 text-center text-gray-500">
                                    Keine Daten für diesen Schritt verfügbar
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${row.isOverdue ? 'bg-red-50/40' : ''
                                        }`}
                                    onClick={(e) => handleRowClick(e, row.currentStepIndex)}
                                >
                                    <TableCell className="py-4 px-4">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <div className="checkbox-container">
                                                <CustomCheckbox
                                                    checked={selectedIds.has(row.id)}
                                                    onChange={(checked) => handleSelectRow(row.id, checked)}
                                                    id={`checkbox-${row.id}`}
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenNoteModalId(row.id);
                                                }}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                                title="Notizen anzeigen"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <AuftragCell auftrag={row.auftrag} isUrgent={urgentOrderIds.has(row.id)} />
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                                            {row.currentStep}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="text-gray-700 text-sm whitespace-nowrap">
                                            {row.location || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="text-gray-700 text-sm whitespace-nowrap">
                                            {row.createDate || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className={`flex items-center gap-1.5 font-semibold text-sm ${row.isOverdue ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                            {row.isOverdue && (
                                                <span className="text-red-500 text-xs">▲</span>
                                            )}
                                            <span>{row.days}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        {row.responsible && (
                                            <div className="text-emerald-600 font-medium text-sm">
                                                {row.responsible}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="overflow-x-auto">
                                            <ProgressIndicator currentStepIndex={row.currentStepIndex} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="text-gray-700 text-sm whitespace-nowrap">
                                            {row.nextAction}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenPriorityModal(row.id);
                                                }}
                                                className={`w-8 h-8 cursor-pointer flex items-center justify-center rounded transition-colors ${
                                                    urgentOrderIds.has(row.id)
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                                title={urgentOrderIds.has(row.id) ? 'Priorität entfernen' : 'Als Dringend markieren'}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setHistorySidebarOrderId(row.id);
                                                }}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                                                title="Historie anzeigen"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/massschuhauftraege/${row.id}`);
                                                }}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                                                title="Details anzeigen"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Cursor pagination: limit 10, "Mehr laden" sends cursor for next page */}
            {(filteredData.length > 0 || hasMore) && (
                <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                        {filteredData.length} Einträge
                        <span className="text-gray-400 ml-1">(Cursor-Pagination, {PAGE_LIMIT} pro Seite)</span>
                    </span>
                    {hasMore && (
                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Mehr laden
                        </button>
                    )}
                </div>
            )}
            </>
            )}

            {/* Note Modal */}
            {openNoteModalId && (() => {
                const selectedRow = filteredData.find(row => row.id === openNoteModalId);
                return (
                    <MasschuhauNoteModal
                        isOpen={!!openNoteModalId}
                        onClose={() => setOpenNoteModalId(null)}
                        orderData={selectedRow ? {
                            name: selectedRow.auftrag.name,
                            orderNumber: selectedRow.auftrag.orderNumber,
                            product: selectedRow.auftrag.product
                        } : undefined}
                        notes={selectedRow?.notes}
                    />
                );
            })()}

            {/* Priority Modal */}
            {priorityModalOrderId && (() => {
                const selectedRow = filteredData.find(row => row.id === priorityModalOrderId);
                return (
                    <PriorityModal
                        isOpen={!!priorityModalOrderId}
                        onClose={() => setPriorityModalOrderId(null)}
                        onConfirm={handleConfirmPriority}
                        orderName={selectedRow?.auftrag.name}
                        orderNumber={selectedRow?.auftrag.orderNumber}
                        isUrgent={urgentOrderIds.has(priorityModalOrderId)}
                    />
                );
            })()}

            {/* History Sidebar */}
            {historySidebarOrderId && (() => {
                const selectedRow = filteredData.find(row => row.id === historySidebarOrderId);
                return (
                    <MasschuHistorySidebar
                        isOpen={!!historySidebarOrderId}
                        onClose={() => setHistorySidebarOrderId(null)}
                        orderData={selectedRow ? {
                            id: selectedRow.id,
                            name: selectedRow.auftrag.name,
                            orderNumber: selectedRow.auftrag.orderNumber,
                            product: selectedRow.auftrag.product
                        } : undefined}
                    />
                );
            })()}
        </div>
    );
}