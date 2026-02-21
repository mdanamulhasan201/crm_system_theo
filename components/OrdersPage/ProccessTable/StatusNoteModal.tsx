'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getStatusNote } from '@/apis/productsOrder';
import { FileText, User, Hash, Package, ClipboardList, AlertCircle } from 'lucide-react';

export interface StatusNoteData {
    statusNote: string;
    orderNumber: number;
    product: {
        name: string;
        versorgung: string;
    };
    customer: {
        vorname: string;
        nachname: string;
    };
}

interface StatusNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
    return (
        <div className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

export default function StatusNoteModal({
    isOpen,
    onClose,
    orderId,
}: StatusNoteModalProps) {
    const [data, setData] = useState<StatusNoteData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !orderId) {
            setData(null);
            setError(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        getStatusNote(orderId)
            .then((res: { success?: boolean; data?: StatusNoteData }) => {
                if (cancelled) return;
                if (res?.success && res?.data) {
                    setData(res.data);
                } else {
                    setError('Keine Daten erhalten');
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message || 'Fehler beim Laden der Statusnotiz');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isOpen, orderId]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
                                Statusnotiz
                            </DialogTitle>
                            <p className="text-xs text-gray-500 mt-0.5">Auftragsdetails und Notiz</p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-200 border-t-emerald-600" />
                            <p className="text-sm text-gray-500">Lade Statusnotiz…</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    {!loading && !error && data && (
                        <>
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Auftragsinfo</p>
                                </div>
                                <div className="px-4 divide-y divide-gray-100">
                                    <InfoRow
                                        icon={User}
                                        label="Kunde"
                                        value={`${data.customer.vorname} ${data.customer.nachname}`}
                                    />
                                    <InfoRow icon={Hash} label="Auftragsnummer" value={data.orderNumber} />
                                    {data.product?.name && (
                                        <InfoRow icon={Package} label="Produkt" value={data.product.name} />
                                    )}
                                    {data.product?.versorgung && (
                                        <InfoRow icon={ClipboardList} label="Versorgung" value={data.product.versorgung} />
                                    )}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 bg-amber-50/80 border-b border-amber-100/50 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-600" />
                                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Notiz</p>
                                </div>
                                <div className="p-4 min-h-[88px]">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {data.statusNote?.trim() || '—'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
