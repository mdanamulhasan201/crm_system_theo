'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMassschuheOrderNote, updateMassschuheOrderNote } from '@/apis/MassschuheAddedApis';
import { FileText, User, Hash, Package, Pencil, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import AddMassschuheNoteModal from './AddMassschuheNoteModal';
import { AlertCircle } from 'lucide-react';

export interface MassschuheNoteItem {
    id: string;
    note: string;
    status: string;
    type: string;
    isImportant: boolean;
    createdAt: string;
}

export interface MassschuheOrderNoteResponse {
    success: boolean;
    orderNote?: {
        id: string;
        status_note: string | null;
        order_note: string | null;
        supply_note: string | null;
    };
    notes?: MassschuheNoteItem[];
}

interface MasschuhauNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderData?: {
        name: string;
        orderNumber: string;
        product: string;
    };
    onSaved?: () => void;
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

export default function MasschuhauNoteModal({
    isOpen,
    onClose,
    orderId,
    orderData,
    onSaved,
}: MasschuhauNoteModalProps) {
    const [orderNote, setOrderNote] = useState<MassschuheOrderNoteResponse['orderNote'] | null>(null);
    const [notesList, setNotesList] = useState<MassschuheNoteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editSupplyNote, setEditSupplyNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);

    const refetchNotes = useCallback(async () => {
        if (!orderId) return;
        try {
            const res: MassschuheOrderNoteResponse = await getMassschuheOrderNote(orderId);
            setOrderNote(res?.orderNote ?? null);
            setNotesList(res?.notes ?? []);
            setEditSupplyNote(res?.orderNote?.supply_note ?? '');
            onSaved?.();
        } catch {
            // keep current data on refetch error
        }
    }, [orderId, onSaved]);

    useEffect(() => {
        if (!isOpen || !orderId) {
            setOrderNote(null);
            setNotesList([]);
            setError(null);
            setEditSupplyNote('');
            setIsEditing(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        getMassschuheOrderNote(orderId)
            .then((res: MassschuheOrderNoteResponse) => {
                if (cancelled) return;
                setOrderNote(res?.orderNote ?? null);
                setNotesList(res?.notes ?? []);
                setEditSupplyNote(res?.orderNote?.supply_note ?? '');
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message || 'Fehler beim Laden der Notizen');
                toast.error('Notiz konnte nicht geladen werden');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isOpen, orderId]);

    useEffect(() => {
        if (orderNote?.supply_note != null) setEditSupplyNote(orderNote.supply_note);
        else setEditSupplyNote('');
    }, [orderNote?.supply_note]);

    const handleStartEdit = () => {
        setEditSupplyNote(orderNote?.supply_note ?? '');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditSupplyNote(orderNote?.supply_note ?? '');
    };

    const handleSaveSupplyNote = async () => {
        if (!orderId) return;
        setSaving(true);
        setError(null);
        try {
            const success = await updateMassschuheOrderNote(orderId, editSupplyNote);
            if (success) {
                setOrderNote(prev => prev ? { ...prev, supply_note: editSupplyNote } : { id: '', status_note: null, order_note: null, supply_note: editSupplyNote });
                setIsEditing(false);
                toast.success('Versorgung Notiz gespeichert');
                onSaved?.();
            } else {
                setError('Aktualisierung fehlgeschlagen');
            }
        } catch (err) {
            setError((err as Error)?.message || 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:!max-w-3xl p-0 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900 tracking-tight">
                                Notizen
                            </DialogTitle>
                            <p className="text-xs text-gray-500 mt-0.5">Auftragsdetails und Notiz</p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-200 border-t-emerald-600" />
                            <p className="text-sm text-gray-500">Lade Notizen…</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    {!loading && !error && (
                        <>
                            {orderData && (
                                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Auftragsinfo</p>
                                    </div>
                                    <div className="px-4 divide-y divide-gray-100 mb-5">
                                        <InfoRow icon={User} label="Kunde" value={orderData.name} />
                                        <InfoRow icon={Hash} label="Auftragsnummer" value={orderData.orderNumber} />
                                        <InfoRow icon={Package} label="Produkt" value={orderData.product} />
                                    </div>
                                </div>
                            )}

                            {/* Notes table + Add note button */}
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Notizen</p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setAddNoteModalOpen(true)}
                                        className="gap-1.5 cursor-pointer bg-[#62A07C] hover:bg-[#62A07C]/90 text-white"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Notiz hinzufügen
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50">
                                                <TableHead className="font-medium text-gray-700">Notiz</TableHead>
                                                <TableHead className="font-medium text-gray-700">Status</TableHead>
                                                <TableHead className="font-medium text-gray-700">Typ</TableHead>
                                                <TableHead className="font-medium text-gray-700">Wichtig</TableHead>
                                                <TableHead className="font-medium text-gray-700">Erstellt</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {notesList.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-500 py-6 text-sm">
                                                        Keine Notizen. Klicken Sie auf &quot;Notiz hinzufügen&quot;.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                notesList.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="align-top py-3">
                                                            <span className="text-sm text-gray-900 whitespace-pre-wrap">{item.note}</span>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-500 align-top py-3">{item.status || '—'}</TableCell>
                                                        <TableCell className="text-sm text-gray-500 align-top py-3">{item.type || '—'}</TableCell>
                                                        <TableCell className="align-top py-3">
                                                            <span className="text-sm">{item.isImportant ? 'Ja' : 'Nein'}</span>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-500 align-top py-3">
                                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Supply Note (Versorgung Notiz) */}
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 bg-amber-50/80 border-b border-amber-100/50 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Versorgung Notiz (supply_note)</p>
                                    </div>
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={handleStartEdit}
                                            className="flex items-center cursor-pointer gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-100/80 transition-colors"
                                            title="Versorgung Notiz bearbeiten"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Bearbeiten
                                        </button>
                                    ) : null}
                                </div>
                                <div className="p-4 min-h-[88px]">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={editSupplyNote}
                                                onChange={(e) => setEditSupplyNote(e.target.value)}
                                                className="w-full min-h-[120px] px-3 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-y"
                                                placeholder="Versorgung Notiz eingeben…"
                                                autoFocus
                                            />
                                            <div className="flex items-center justify-between gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                    className="gap-1.5 cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Abbrechen
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveSupplyNote}
                                                    disabled={saving}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
                                                >
                                                    {saving ? (
                                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    Speichern
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {orderNote?.supply_note?.trim() || '—'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>

            <AddMassschuheNoteModal
                isOpen={addNoteModalOpen}
                onClose={() => setAddNoteModalOpen(false)}
                orderId={orderId}
                orderName={orderData?.name}
                onSuccess={refetchNotes}
            />
        </Dialog>
    );
}
