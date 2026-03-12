'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusNote, updateStatusNote, deleteNote } from '@/apis/productsOrder';
import { FileText, User, Hash, Package, ClipboardList, AlertCircle, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import AddNotesModal from './AddNotesModal';
import EditNoteModal from './EditNoteModal';

export interface OrderNoteItem {
    id: string;
    note: string;
    status?: string;
    createdAt: string;
}

export interface StatusNoteData {
    versorgung_note?: string;
    orderNumber: number;
    product: {
        name: string;
        versorgung: string;
    } | null;
    customer: {
        vorname: string;
        nachname: string;
    } | null;
}

interface NotesResponse {
    data: OrderNoteItem[];
    hasMore: boolean;
    nextCursor?: string;
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
    const [isEditing, setIsEditing] = useState(false);
    const [editVersorgungNote, setEditVersorgungNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [notesList, setNotesList] = useState<OrderNoteItem[]>([]);
    const [notesHasMore, setNotesHasMore] = useState(false);
    const [notesCursor, setNotesCursor] = useState<string | undefined>(undefined);
    const [loadingMoreNotes, setLoadingMoreNotes] = useState(false);
    const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
    const [editModalNote, setEditModalNote] = useState<{ id: string; note: string } | null>(null);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
    const customerFullName = [data?.customer?.vorname, data?.customer?.nachname]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Unbekannter Kunde';

    const fetchNotes = useCallback((orderId: string, cursor?: string) => {
        return getStatusNote(orderId, cursor).then((res: any) => {
            const notes: NotesResponse = res?.notes ?? { data: [], hasMore: false };
            return { data: res?.data, notes };
        });
    }, []);

    useEffect(() => {
        if (!isOpen || !orderId) {
            setData(null);
            setError(null);
            setNotesList([]);
            setNotesHasMore(false);
            setNotesCursor(undefined);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchNotes(orderId)
            .then(({ data: resData, notes }) => {
                if (cancelled) return;
                if (resData) {
                    setData(resData);
                } else {
                    setError('Keine Daten erhalten');
                }
                setNotesList(notes.data ?? []);
                setNotesHasMore(notes.hasMore ?? false);
                setNotesCursor(notes.nextCursor);
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
    }, [isOpen, orderId, fetchNotes]);

    const loadMoreNotes = () => {
        if (!orderId || !notesCursor || loadingMoreNotes) return;
        setLoadingMoreNotes(true);
        fetchNotes(orderId, notesCursor)
            .then(({ notes }) => {
                setNotesList((prev) => [...prev, ...(notes.data ?? [])]);
                setNotesHasMore(notes.hasMore ?? false);
                setNotesCursor(notes.nextCursor);
            })
            .finally(() => setLoadingMoreNotes(false));
    };

    const refetchNotes = useCallback(() => {
        if (!orderId) return;
        fetchNotes(orderId).then(({ notes }) => {
            setNotesList(notes.data ?? []);
            setNotesHasMore(notes.hasMore ?? false);
            setNotesCursor(notes.nextCursor);
        });
    }, [orderId, fetchNotes]);

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Notiz wirklich löschen?')) return;
        setDeletingNoteId(noteId);
        try {
            await deleteNote(noteId);
            toast.success('Notiz gelöscht');
            refetchNotes();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Fehler beim Löschen');
        } finally {
            setDeletingNoteId(null);
        }
    };

    useEffect(() => {
        if (data?.versorgung_note != null) setEditVersorgungNote(data.versorgung_note);
        else setEditVersorgungNote('');
    }, [data?.versorgung_note]);

    const handleStartEdit = () => {
        setEditVersorgungNote(data?.versorgung_note ?? '');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditVersorgungNote(data?.versorgung_note ?? '');
    };

    const handleSaveNote = async () => {
        if (!orderId) return;
        setSaving(true);
        setError(null);
        try {
            const res: { success?: boolean } = await updateStatusNote(orderId, {
                versorgung_note: editVersorgungNote,
            });
            if (res?.success !== false) {
                setData(prev => prev ? { ...prev, versorgung_note: editVersorgungNote } : null);
                setIsEditing(false);
                toast.success('Versorgung Notiz gespeichert');
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
            <DialogContent className="sm:max-w-3xl! p-0 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                <DialogHeader className="px-6 pt-6 pb-4 bg-linear-to-b from-gray-50 to-white border-b border-gray-100">
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
                                <div className="px-4 divide-y divide-gray-100 mb-5">
                                    <InfoRow
                                        icon={User}
                                        label="Kunde"
                                        value={customerFullName}
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
                                                <TableHead className="font-medium text-gray-700">Erstellt</TableHead>
                                                <TableHead className="font-medium text-gray-700 text-right w-[120px]">Aktionen</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {notesList.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-gray-500 py-6 text-sm">
                                                        Keine Notizen. Klicken Sie auf &quot;Notiz hinzufügen&quot;.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                notesList.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="align-top py-3">
                                                            <span className="text-sm text-gray-900 whitespace-pre-wrap">{item.note}</span>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-gray-500 align-top py-3">
                                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </TableCell>
                                                        <TableCell className="align-top py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditModalNote({ id: item.id, note: item.note })}
                                                                    className="p-1.5 rounded text-gray-600 hover:bg-gray-100 cursor-pointer"
                                                                    title="Bearbeiten"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteNote(item.id)}
                                                                    disabled={deletingNoteId === item.id}
                                                                    className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                                                                    title="Löschen"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                {notesHasMore && (
                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <Button type="button" variant="ghost" size="sm" onClick={loadMoreNotes} disabled={loadingMoreNotes} className="cursor-pointer text-emerald-600 hover:text-emerald-700">
                                            {loadingMoreNotes ? 'Laden...' : 'Weitere laden'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Versorgung Notiz */}
                            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 bg-amber-50/80 border-b border-amber-100/50 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Versorgung Notiz</p>
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
                                                value={editVersorgungNote}
                                                onChange={(e) => setEditVersorgungNote(e.target.value)}
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
                                                    onClick={handleSaveNote}
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
                                            {data.versorgung_note?.trim() || '—'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>

            <AddNotesModal
                isOpen={addNoteModalOpen}
                onClose={() => setAddNoteModalOpen(false)}
                orderId={orderId}
                orderName={data ? customerFullName : undefined}
                onSuccess={refetchNotes}
            />
            <EditNoteModal
                isOpen={!!editModalNote}
                onClose={() => setEditModalNote(null)}
                noteId={editModalNote?.id ?? null}
                initialNote={editModalNote?.note ?? ''}
                onSuccess={refetchNotes}
            />
        </Dialog>
    );
}
