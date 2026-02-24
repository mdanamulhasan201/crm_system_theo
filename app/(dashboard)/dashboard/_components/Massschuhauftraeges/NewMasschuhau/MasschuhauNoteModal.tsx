'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { getMassschuheOrderNote, updateMassschuheOrderNote } from '@/apis/MassschuheAddedApis';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface MasschuhauNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderData?: {
        name: string;
        orderNumber: string;
        product: string;
    };
    notes?: string;
    onSaved?: () => void;
}

export default function MasschuhauNoteModal({
    isOpen,
    onClose,
    orderId,
    orderData,
    notes: initialNotes,
    onSaved
}: MasschuhauNoteModalProps) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen || !orderId) {
            setNote('');
            return;
        }
        setLoading(true);
        getMassschuheOrderNote(orderId)
            .then((res: any) => {
                const statusNote = res?.data?.status_note ?? res?.status_note ?? initialNotes ?? '';
                setNote(typeof statusNote === 'string' ? statusNote : '');
            })
            .catch(() => {
                setNote(initialNotes ?? '');
                toast.error('Notiz konnte nicht geladen werden');
            })
            .finally(() => setLoading(false));
    }, [isOpen, orderId, initialNotes]);

    const handleSave = async () => {
        if (!orderId) return;
        setSaving(true);
        try {
            const success = await updateMassschuheOrderNote(orderId, note);
            if (success) {
                toast.success('Notiz gespeichert');
                onSaved?.();
                onClose();
            } else {
                toast.error('Speichern fehlgeschlagen');
            }
        } catch {
            toast.error('Notiz konnte nicht gespeichert werden');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Notizen
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    {orderData && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Kunde:</span>
                                <span className="text-gray-900">{orderData.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Auftragsnummer:</span>
                                <span className="text-gray-900">{orderData.orderNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Produkt:</span>
                                <span className="text-gray-900">{orderData.product}</span>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Notizen
                        </label>
                        {loading ? (
                            <div className="min-h-[200px] flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            </div>
                        ) : (
                            <>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Notizen eingeben..."
                                    className="w-full min-h-[200px] max-h-[400px] p-4 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
                                    disabled={saving}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={saving}
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Speichern...
                                            </>
                                        ) : (
                                            'Speichern'
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
