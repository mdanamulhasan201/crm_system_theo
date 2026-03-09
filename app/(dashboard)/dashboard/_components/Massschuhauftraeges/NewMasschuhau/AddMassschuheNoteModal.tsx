'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createMassschuheOrderNote } from '@/apis/MassschuheAddedApis';
import toast from 'react-hot-toast';

interface AddMassschuheNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderName?: string;
    onSuccess?: () => void;
}

export default function AddMassschuheNoteModal({
    isOpen,
    onClose,
    orderId,
    orderName,
    onSuccess,
}: AddMassschuheNoteModalProps) {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        setNote('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !note.trim()) {
            toast.error('Bitte Notiz eingeben');
            return;
        }
        setSubmitting(true);
        try {
            const res = await createMassschuheOrderNote(orderId, note.trim());
            if (res?.success) {
                toast.success('Notiz erstellt');
                setNote('');
                onSuccess?.();
                handleClose();
            } else {
                toast.error('Fehler beim Erstellen');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Fehler beim Erstellen der Notiz');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Notiz hinzufügen</DialogTitle>
                    {orderName && (
                        <p className="text-sm text-gray-500 mt-1">{orderName}</p>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-2">
                        <label className="block text-sm font-medium text-gray-700">Notiz</label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Notiz eingeben..."
                            rows={4}
                            className="resize-none"
                            disabled={submitting}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={submitting} className="cursor-pointer">
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={submitting || !note.trim()} className="cursor-pointer bg-[#62A07C] hover:bg-[#62A07C]/90">
                            {submitting ? 'Wird gespeichert...' : 'Hinzufügen'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
